"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpaWebpackAddOn = exports.EmptyLoader = exports.PreLoadLoader = exports.DeployToEpiserverPlugin = exports.EpiEnvOptions = exports.Config = exports.EmptyLoaderImpl = exports.PreLoadLoaderImpl = void 0;
const _PreLoadLoader = require('./webpack-loaders/PreLoadLoader');
const _EmptyLoader = require('./webpack-loaders/EmptyLoader');
const Config_1 = __importDefault(require("./util/Config"));
const EpiEnvOptions_1 = __importDefault(require("./util/EpiEnvOptions"));
const DeployToEpiserverPlugin_1 = __importDefault(require("./webpack-plugins/DeployToEpiserverPlugin"));
exports.PreLoadLoaderImpl = _PreLoadLoader;
exports.EmptyLoaderImpl = _EmptyLoader;
exports.Config = Config_1.default;
exports.EpiEnvOptions = EpiEnvOptions_1.default;
exports.DeployToEpiserverPlugin = DeployToEpiserverPlugin_1.default;
exports.PreLoadLoader = require.resolve('./webpack-loaders/PreLoadLoader');
exports.EmptyLoader = require.resolve('./webpack-loaders/EmptyLoader');
exports.SpaWebpackAddOn = {
    PreLoadLoader: exports.PreLoadLoader,
    PreLoadLoaderImpl: exports.PreLoadLoaderImpl,
    EmptyLoader: exports.EmptyLoader,
    EmptyLoaderImpl: exports.EmptyLoaderImpl,
    Config: exports.Config,
    EpiEnvOptions: exports.EpiEnvOptions,
    DeployToEpiserverPlugin: exports.DeployToEpiserverPlugin
};
exports.default = exports.SpaWebpackAddOn;
