/// <reference types="webpack" />
import { Plugin, Compiler } from 'webpack/index';
export declare type DeployToEpiserverPluginOptions = {
    base: string;
    filepath: string;
    filename: string;
    path: string;
};
export declare class DeployToEpiserverPlugin extends Plugin {
    private _auth;
    private _api;
    private _isAuthorized;
    private options;
    constructor(options: DeployToEpiserverPluginOptions);
    apply(compiler: Compiler): void;
}
export default DeployToEpiserverPlugin;
