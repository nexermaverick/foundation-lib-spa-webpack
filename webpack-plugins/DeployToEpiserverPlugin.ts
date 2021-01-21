import path from 'path';
import FormData from 'form-data';
import fs from 'fs';
import crypto from 'crypto';
import { ContentDelivery } from '@episerver/spa-core';
import ClientAuthStorage from '../ContentDelivery/ClientAuthStorage';
import { Plugin, Compiler } from 'webpack/index';
import { AxiosRequestConfig } from 'axios';
import { URL } from 'url';

const PLUGIN_NAME = 'DeployToEpiserverPlugin';

export type DeployToEpiserverPluginOptions = {
    base: string,
    filepath: string,
    filename: string,
    path: string
}

export class DeployToEpiserverPlugin extends Plugin {
    private _auth: ContentDelivery.IAuthService;
    private _api : ContentDelivery.IContentDeliveryAPI_V2;
    private _isAuthorized : boolean = false;
    private options: DeployToEpiserverPluginOptions;

    constructor(options : DeployToEpiserverPluginOptions){
        super();

        // Configure AUTH Api
        const u = new URL(options.base);
        this._api = new ContentDelivery.API_V2({
            BaseURL: u.href,
            Debug: false,
            EnableExtensions: true
        });
        const hash = crypto.createHash('sha256');
        hash.update(u.hostname);
        const cd_auth_storage = new ClientAuthStorage(hash.digest('hex'));
        this._auth = new ContentDelivery.DefaultAuthService(this._api, cd_auth_storage);

        // Check status
        this._auth.isAuthenticated().catch(() => false).then(authorized => this._isAuthorized = authorized);

        // Set options
        this.options = options;
    }
    
    public apply(compiler: Compiler): void {
        const that = this;
        const logger = compiler.getInfrastructureLogger(PLUGIN_NAME);
        compiler.hooks.afterEmit.tapAsync('DeployToEpiserverPlugin', async (compilation, callback) => {
            if (!that._isAuthorized) {
                logger.error('Not authenticated, ensure you\'ve authenticated yourself prior to deploying to Episerver.');
            } else {
                logger.info('Starting SPA deployment to the configured Episerver instance');
                logger.status('Resolving file path');
                var filepath = path.resolve(that.options.filepath, that.options.filename);
                logger.status(`Building request data for ${ filepath }`);
                const formData = new FormData();
                formData.append(that.options.filename, fs.createReadStream(filepath));
                const requestConfig : Partial<AxiosRequestConfig> = {
                    method: 'POST',
                    data: formData,
                    headers: formData.getHeaders()
                }
                logger.status('Sending to Episerver');
                const [data, context] = await this._api.raw(that.options.path, requestConfig, false);

                if (context.status === 200) {
                    logger.info(`Deployed package ${ filepath } to Episerver`)
                } else {
                    logger.warn(`Deployment failed, server returned: ${ context.status }: ${ context.statusText }`)
                }
                logger.status('Done');
            }
            callback();
        });
    }
}

export default DeployToEpiserverPlugin;