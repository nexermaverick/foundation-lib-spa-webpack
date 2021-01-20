"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientAuthStorage = void 0;
var os_1 = __importDefault(require("os"));
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
/**
 * Implementation of a basic file storage for the authentication data
 * for interacting with Episerver
 *
 * @implements { epi.ContentDelivery.IAuthStorage }
 */
var ClientAuthStorage = /** @class */ (function () {
    /**
     *
     * @param {string} [scope] The scope for the file name
     */
    function ClientAuthStorage(scope) {
        /**
         * The filename where the authorization token will be stored
         *
         * @private
         * @constant
         * @readonly
         * @type { string }
         */
        this.AUTH_FILE = '.epi_auth';
        /**
         * The path to the homedir of the current user
         *
         * @private
         * @type { string }
         */
        this._homeDir = '';
        this._filePostFix = '';
        this._homeDir = os_1.default.homedir();
        this._filePostFix = scope || '';
    }
    /**
     * @returns { boolean }
     */
    ClientAuthStorage.prototype.clearToken = function () {
        if (!this.isStorageFilePathUsable)
            return false;
        try {
            fs_1.default.unlinkSync(this.getStorageFilePath());
            return true;
        }
        catch (e) {
            return false;
        }
    };
    /**
     *
     * @param { epi.ContentDelivery.IOAuthSuccessResponse } token The token to store
     * @returns { boolean }
     */
    ClientAuthStorage.prototype.storeToken = function (token) {
        if (!this.isStorageFilePathUsable)
            return false;
        try {
            var data = Buffer.from(JSON.stringify(token));
            fs_1.default.writeFileSync(this.getStorageFilePath(), data.toString('base64'));
            return true;
        }
        catch (e) {
            console.log(e);
            return false;
        }
    };
    /**
     * @returns { boolean }
     */
    ClientAuthStorage.prototype.hasToken = function () {
        return this.getToken() !== null;
    };
    /**
     * @returns { epi.ContentDelivery.IOAuthSuccessResponse | null }
     */
    ClientAuthStorage.prototype.getToken = function () {
        if (!this.isStorageFilePathUsable)
            return null;
        try {
            var reader = Buffer.from(fs_1.default.readFileSync(this.getStorageFilePath(), { encoding: 'ascii' }), 'base64');
            return JSON.parse(reader.toString('ascii'));
        }
        catch (e) {
            return null;
        }
    };
    /**
     *
     * @protected
     * @returns { string }
     */
    ClientAuthStorage.prototype.getStorageFilePath = function () {
        if (this._filePostFix && typeof (this._filePostFix) === 'string' && this._filePostFix.length > 0)
            return path_1.default.join(this._homeDir, '.' + this._filePostFix + this.AUTH_FILE);
        else
            return path_1.default.join(this._homeDir, this.AUTH_FILE);
    };
    /**
     *
     * @protected
     * @returns {boolean}
     */
    ClientAuthStorage.prototype.isStorageFilePathUsable = function () {
        var storagePath = this.getStorageFilePath();
        var exists = function (storagePath) {
            try {
                var stats = fs_1.default.statSync(storagePath);
                if (stats.isFile()) {
                    return true;
                }
            }
            catch (e) {
                return false;
            }
            throw new Error('Auth file exists but is not of type file');
        };
        var isWriteable = function (path) {
            try {
                fs_1.default.accessSync(path, fs_1.default.constants.F_OK | fs_1.default.constants.R_OK | fs_1.default.constants.W_OK);
                return true;
            }
            catch (e) {
                return false;
            }
        };
        return exists(storagePath) ? isWriteable(storagePath) : isWriteable(path_1.default.dirname(storagePath));
    };
    return ClientAuthStorage;
}());
exports.ClientAuthStorage = ClientAuthStorage;
exports.default = ClientAuthStorage;
