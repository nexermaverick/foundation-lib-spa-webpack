
import _PreLoadLoader from './webpack-loaders/PreLoadLoader';
import _EmptyLoader from './webpack-loaders/EmptyLoader';
import _Config from './util/Config';
import _EpiEnvOptions from './util/EpiEnvOptions';

export const PreLoadLoader = _PreLoadLoader;
export const EmptyLoader = _EmptyLoader;
export const Config = _Config;
export type EpiEnvOptions = _EpiEnvOptions;

export default {
    PreLoadLoader,
    EmptyLoader,
    Config,
    EpiEnvOptions: _EpiEnvOptions
}