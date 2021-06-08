"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeployToEpiserverPlugin = void 0;
const path_1 = __importDefault(require("path"));
const form_data_1 = __importDefault(require("form-data"));
const fs_1 = __importDefault(require("fs"));
const ContentDelivery = __importStar(require("@episerver/spa-core/cjs/Library/ContentDelivery"));
const ClientAuthStorage_1 = __importDefault(require("../ContentDelivery/ClientAuthStorage"));
const webpack_1 = require("webpack");
const url_1 = require("url");
const PLUGIN_NAME = 'DeployToEpiserverPlugin';
class DeployToEpiserverPlugin extends webpack_1.DelegatedPlugin {
    constructor(options) {
        super();
        this._isAuthorized = false;
        // Configure AUTH Api
        const u = new url_1.URL(options.base);
        this._api = new ContentDelivery.API_V2({
            BaseURL: u.href,
            Debug: false,
            EnableExtensions: true
        });
        this._auth = new ContentDelivery.DefaultAuthService(this._api, ClientAuthStorage_1.default.CreateFromUrl(u));
        // Check status
        this._auth.isAuthenticated().catch(() => false).then((authorized) => this._isAuthorized = authorized);
        // Set options
        this.options = options;
    }
    apply(compiler) {
        const that = this;
        const logger = compiler.getInfrastructureLogger(PLUGIN_NAME);
        compiler.hooks.afterEmit.tapAsync('DeployToEpiserverPlugin', (compilation, callback) => __awaiter(this, void 0, void 0, function* () {
            if (that.options.insecure) {
                logger.warn('\x1b[31mDisabled certificate checking, this breaks identity verification of the server!\x1b[0m');
                process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
            }
            if (!that._isAuthorized) {
                logger.error('Not authenticated, ensure you\'ve authenticated yourself prior to deploying to Episerver.');
            }
            else {
                logger.info('Starting SPA deployment to the configured Episerver instance');
                logger.status('Resolving file path');
                var filepath = path_1.default.resolve(that.options.filepath, that.options.filename);
                logger.status(`Building request data for ${filepath}`);
                const formData = new form_data_1.default();
                formData.append(that.options.filename, fs_1.default.createReadStream(filepath));
                const requestConfig = {
                    method: 'POST',
                    data: formData,
                    headers: formData.getHeaders()
                };
                logger.status('Sending to Episerver');
                const [data, context] = yield this._api.raw(that.options.path, requestConfig, false);
                if (context.status === 200) {
                    logger.info(`Deployed package ${filepath} to Episerver`);
                }
                else {
                    logger.warn(`Deployment failed, server returned: ${context.status}: ${context.statusText}`);
                }
                logger.status('Done');
            }
            callback();
        }));
    }
}
exports.DeployToEpiserverPlugin = DeployToEpiserverPlugin;
exports.default = DeployToEpiserverPlugin;
