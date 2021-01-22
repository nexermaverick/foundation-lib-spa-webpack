const _PreLoadLoader = require('./webpack-loaders/PreLoadLoader');
const _EmptyLoader = require ('./webpack-loaders/EmptyLoader');
import _Config from './util/Config';
import _EpiEnvOptions, { EpiEnvOption as _EpiEnvOption } from './util/EpiEnvOptions';
import _DeployToEpiserverPlugin, { DeployToEpiserverPluginOptions as _DeployToEpiserverPluginOptions } from './webpack-plugins/DeployToEpiserverPlugin'

export const PreLoadLoaderImpl = _PreLoadLoader;
export const EmptyLoaderImpl = _EmptyLoader;
export const Config = _Config;
export const EpiEnvOptions = _EpiEnvOptions;
export const DeployToEpiserverPlugin = _DeployToEpiserverPlugin;

export type DeployToEpiserverPluginOptions = _DeployToEpiserverPluginOptions;
export type EpiEnvOption = _EpiEnvOption;

export const PreLoadLoader = require.resolve('./webpack-loaders/PreLoadLoader');
export const EmptyLoader = require.resolve('./webpack-loaders/EmptyLoader');

export const SpaWebpackAddOn = {
    PreLoadLoader,
    PreLoadLoaderImpl,
    EmptyLoader,
    EmptyLoaderImpl,
    Config,
    EpiEnvOptions,
    DeployToEpiserverPlugin
}
export default SpaWebpackAddOn;