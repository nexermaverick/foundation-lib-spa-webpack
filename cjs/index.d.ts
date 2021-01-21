import _Config from './util/Config';
import _EpiEnvOptions from './util/EpiEnvOptions';
export declare const PreLoadLoader: (source: string) => string;
export declare const EmptyLoader: (source: string) => string;
export declare const Config: typeof _Config;
export declare type EpiEnvOptions = _EpiEnvOptions;
declare const _default: {
    PreLoadLoader: (source: string) => string;
    EmptyLoader: (source: string) => string;
    Config: typeof _Config;
    EpiEnvOptions: typeof _EpiEnvOptions;
};
export default _default;
