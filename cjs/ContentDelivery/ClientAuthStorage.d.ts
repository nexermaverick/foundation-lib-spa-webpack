/// <reference types="node" />
import * as ContentDelivery from '@episerver/spa-core/cjs/Library/ContentDelivery';
import { URL } from 'url';
/**
 * Implementation of a basic file storage for the authentication data
 * for interacting with Episerver
 *
 * @implements { epi.ContentDelivery.IAuthStorage }
 */
export declare class ClientAuthStorage {
    /**
     * The filename where the authorization token will be stored
     *
     * @private
     * @constant
     * @readonly
     * @type { string }
     */
    private AUTH_FILE;
    /**
     * The path to the homedir of the current user
     *
     * @private
     * @type { string }
     */
    private _homeDir;
    private _filePostFix;
    static CreateFromUrl(u: URL): ClientAuthStorage;
    /**
     *
     * @param {string} [scope] The scope for the file name
     */
    constructor(scope: string);
    /**
     * @returns { boolean }
     */
    clearToken(): boolean;
    /**
     *
     * @param { ContentDelivery.IOAuthSuccessResponse } token The token to store
     * @returns { boolean }
     */
    storeToken(token: ContentDelivery.IOAuthSuccessResponse): boolean;
    /**
     * @returns { boolean }
     */
    hasToken(): boolean;
    /**
     * @returns { ContentDelivery.IOAuthSuccessResponse | null }
     */
    getToken(): ContentDelivery.IOAuthSuccessResponse | null;
    /**
     *
     * @protected
     * @returns { string }
     */
    getStorageFilePath(): string;
    /**
     *
     * @protected
     * @returns {boolean}
     */
    isStorageFilePathUsable(): boolean;
}
export default ClientAuthStorage;
