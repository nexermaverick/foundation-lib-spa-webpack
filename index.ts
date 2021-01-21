
import _PreLoadLoader from './webpack-loaders/PreLoadLoader';
import _EmptyLoader from './webpack-loaders/EmptyLoader';
import _Config from './util/Config';
import _EpiEnvOptions, { EpiEnvOption as _EpiEnvOption } from './util/EpiEnvOptions';
import _DeployToEpiserverPlugin, { DeployToEpiserverPluginOptions as _DeployToEpiserverPluginOptions } from './webpack-plugins/DeployToEpiserverPlugin'

export const PreLoadLoader = _PreLoadLoader;
export const EmptyLoader = _EmptyLoader;
export const Config = _Config;
export const EpiEnvOptions = _EpiEnvOptions;
export const DeployToEpiserverPlugin = _DeployToEpiserverPlugin;

export type DeployToEpiserverPluginOptions = _DeployToEpiserverPluginOptions;
export type EpiEnvOption = _EpiEnvOption;

export default {
    PreLoadLoader,
    EmptyLoader,
    Config,
    EpiEnvOptions,
    DeployToEpiserverPlugin
}
