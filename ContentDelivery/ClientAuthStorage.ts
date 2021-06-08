import os from 'os';
import path from 'path';
import fs from 'fs';
import * as ContentDelivery from '@episerver/spa-core/cjs/Library/ContentDelivery';
import { URL } from 'url';
import crypto from 'crypto';

/**
 * Implementation of a basic file storage for the authentication data 
 * for interacting with Episerver
 * 
 * @implements { epi.ContentDelivery.IAuthStorage }
 */
export class ClientAuthStorage {
    /**
     * The filename where the authorization token will be stored
     * 
     * @private
     * @constant
     * @readonly
     * @type { string }
     */
    private AUTH_FILE: Readonly<string> = '.epi_auth'

    /**
     * The path to the homedir of the current user
     * 
     * @private
     * @type { string }
     */
    private _homeDir: string = '';

    private _filePostFix = '';

    public static CreateFromUrl(u : URL) : ClientAuthStorage
    {
        const hash = crypto.createHash('sha256');
        hash.update(u.host);
        return new ClientAuthStorage(hash.digest('hex'));
    }

    /**
     * 
     * @param {string} [scope] The scope for the file name
     */
    public constructor(scope: string) 
    {
        this._homeDir = os.homedir();
        this._filePostFix = scope || '';
    }

    /**
     * @returns { boolean }
     */
    clearToken(): boolean 
    {
        if (!this.isStorageFilePathUsable) return false;
        try {
            fs.unlinkSync(this.getStorageFilePath())
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * 
     * @param { ContentDelivery.IOAuthSuccessResponse } token The token to store
     * @returns { boolean }
     */
    storeToken(token: ContentDelivery.IOAuthSuccessResponse): boolean
    {
        if (!this.isStorageFilePathUsable) return false;
        try {
            const data = Buffer.from(JSON.stringify(token));
            fs.writeFileSync(this.getStorageFilePath(), data.toString('base64'));
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    /**
     * @returns { boolean }
     */
    hasToken(): boolean
    {
        return this.getToken() !== null;
    }

    /**
     * @returns { ContentDelivery.IOAuthSuccessResponse | null }
     */
    getToken(): ContentDelivery.IOAuthSuccessResponse | null
    {
        if (!this.isStorageFilePathUsable) return null;
        try {
            const reader = Buffer.from(fs.readFileSync(this.getStorageFilePath(), { encoding: 'ascii'}), 'base64');
            return JSON.parse(reader.toString('ascii'));
        } catch (e) {
            return null;
        }
    }

    /**
     * 
     * @protected
     * @returns { string }
     */
    getStorageFilePath(): string
    {
        if (this._filePostFix && typeof(this._filePostFix) === 'string' && this._filePostFix.length > 0)
            return path.join(this._homeDir, '.' + this._filePostFix + this.AUTH_FILE);
        else
            return path.join(this._homeDir, this.AUTH_FILE);
    }

    /**
     * 
     * @protected
     * @returns {boolean}
     */
    isStorageFilePathUsable(): boolean
    {
        const storagePath = this.getStorageFilePath()
        const exists = (storagePath : string) : boolean => {
            try {
                const stats = fs.statSync(storagePath);
                if (stats.isFile()) {
                    return true;
                }
            } catch (e) {
                return false;
            }
            throw new Error('Auth file exists but is not of type file');
        }
        const isWriteable = (path : string) : boolean => {
            try {
                fs.accessSync(path, fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK);
                return true;
            } catch (e) {
                return false;
            }
        }
        return exists(storagePath) ? isWriteable(storagePath) : isWriteable(path.dirname(storagePath));
    }
}

export default ClientAuthStorage;