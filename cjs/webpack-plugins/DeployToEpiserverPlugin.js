"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeployToEpiserverPlugin = void 0;
var path_1 = __importDefault(require("path"));
var form_data_1 = __importDefault(require("form-data"));
var fs_1 = __importDefault(require("fs"));
var crypto_1 = __importDefault(require("crypto"));
var esm = require('esm')(module, {});
var epi = esm('@episerver/spa-core');
var ClientAuthStorage_1 = __importDefault(require("../ContentDelivery/ClientAuthStorage"));
var webpack_1 = require("webpack");
var url_1 = require("url");
var PLUGIN_NAME = 'DeployToEpiserverPlugin';
var DeployToEpiserverPlugin = /** @class */ (function (_super) {
    __extends(DeployToEpiserverPlugin, _super);
    function DeployToEpiserverPlugin(options) {
        var _this = _super.call(this) || this;
        _this._isAuthorized = false;
        // Configure AUTH Api
        var u = new url_1.URL(options.base);
        _this._api = new epi.ContentDelivery.API_V2({
            BaseURL: u.href,
            Debug: false,
            EnableExtensions: true
        });
        var hash = crypto_1.default.createHash('sha256');
        hash.update(u.hostname);
        var cd_auth_storage = new ClientAuthStorage_1.default(hash.digest('hex'));
        _this._auth = new epi.ContentDelivery.DefaultAuthService(_this._api, cd_auth_storage);
        // Check status
        _this._auth.isAuthenticated().catch(function () { return false; }).then(function (authorized) { return _this._isAuthorized = authorized; });
        // Set options
        _this.options = options;
        return _this;
    }
    DeployToEpiserverPlugin.prototype.apply = function (compiler) {
        var _this = this;
        var that = this;
        var logger = compiler.getInfrastructureLogger(PLUGIN_NAME);
        compiler.hooks.afterEmit.tapAsync('DeployToEpiserverPlugin', function (compilation, callback) { return __awaiter(_this, void 0, void 0, function () {
            var filepath, formData, requestConfig, _a, data, context;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!that._isAuthorized) return [3 /*break*/, 1];
                        logger.error('Not authenticated, ensure you\'ve authenticated yourself prior to deploying to Episerver.');
                        return [3 /*break*/, 3];
                    case 1:
                        logger.info('Starting SPA deployment to the configured Episerver instance');
                        logger.status('Resolving file path');
                        filepath = path_1.default.resolve(that.options.filepath, that.options.filename);
                        logger.status("Building request data for " + filepath);
                        formData = new form_data_1.default();
                        formData.append(that.options.filename, fs_1.default.createReadStream(filepath));
                        requestConfig = {
                            method: 'POST',
                            data: formData,
                            headers: formData.getHeaders()
                        };
                        logger.status('Sending to Episerver');
                        return [4 /*yield*/, this._api.raw(that.options.path, requestConfig, false)];
                    case 2:
                        _a = _b.sent(), data = _a[0], context = _a[1];
                        if (context.status === 200) {
                            logger.info("Deployed package " + filepath + " to Episerver");
                        }
                        else {
                            logger.warn("Deployment failed, server returned: " + context.status + ": " + context.statusText);
                        }
                        logger.status('Done');
                        _b.label = 3;
                    case 3:
                        callback();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    return DeployToEpiserverPlugin;
}(webpack_1.DelegatedPlugin));
exports.DeployToEpiserverPlugin = DeployToEpiserverPlugin;
exports.default = DeployToEpiserverPlugin;
