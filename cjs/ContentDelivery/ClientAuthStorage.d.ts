/// <reference types="node" />
import { IAuthStorage, IOAuthSuccessResponse } from '@episerver/spa-core/cjs/Library/ContentDelivery';
import { URL } from 'url';
/**
 * Implementation of a basic file storage for the authentication data
 * for interacting with Episerver
 *
 * @implements { IAuthStorage }
 */
export declare class ClientAuthStorage implements IAuthStorage {
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
     * @param { IOAuthSuccessResponse } token The token to store
     * @returns { boolean }
     */
    storeToken(token: IOAuthSuccessResponse): boolean;
    /**
     * @returns { boolean }
     */
    hasToken(): boolean;
    /**
     * @returns { IOAuthSuccessResponse | null }
     */
    getToken(): IOAuthSuccessResponse | null;
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
