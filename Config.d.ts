// Type definitions for: SPA Configuration helper
// Project: Episerver Foundation SPA Webpack Add-ons
// Definitions by: Episerver SA Team <https://episerver.com>

// Main export
export = GlobalConfig;

/**
 * Episerver SPA Configuration helper, to easily create Webpack config files,
 * which are using a .env file to store environment specific configuration 
 * values.
 */
declare class GlobalConfig {

    /**
     * Create a new configuration helper for the current context
     * 
     * @param {string} rootDir          The root path of the application
     * @param {object} localOverrides   The environment variables set by the Webpack CLI
     */
    constructor(rootDir: string, localOverrides: object = {});

    /**
     * Retrieve the path were the code for the Episerver SPA Server Side
     * Rendering can be found, relative to the current path
     * 
     * Environment variable: SERVER_PATH 
     * 
     * @public
     * @param {object} localEnvironment     The local overrides, if not already specified or different from the constructor
     * @param {string} defaultValue         The default value if not set - by default 'server'
     * @returns {string}
     */
    getServerPath(localEnvironment: object = {}, defaultValue: string = 'server') : string

    /**
     * The path within the main Episerver site where the SPA needs to be 
     * placed. This value shall used both in building the file target path
     * as well as the web path for the resources.
     * 
     * Environment variable: SPA_PATH 
     * 
     * @public
     * @param {object} localEnvironment     The local overrides, if not already specified or different from the constructor
     * @param {string} defaultValue         The default value if not set - by default 'spa'
     * @returns {string}
     */
    getSpaPath(localEnvironment: object = {}, defaultValue: string = 'Spa') : string

    /**
     * The path - relative to the current path - where the main Episerver 
     * project is located.
     * 
     * Environment variable: EPI_PATH 
     * 
     * @public
     * @param {object} localEnvironment     The local overrides, if not already specified or different from the constructor
     * @param {string} defaultValue         The default value if not set - by default '../Foundation'
     * @returns {string}
     */
    getEpiPath(localEnvironment: object = {}, defaultValue: string = '../Foundation') : string

    /**
     * The path at which the application will be running, relative to the 
     * domain
     * 
     * Environment variable: WEB_PATH 
     * 
     * @public
     * @param {object} localEnvironment     The local overrides, if not already specified or different from the constructor
     * @param {string} defaultValue         The default value if not set - by default '/'
     * @returns {string}
     */
    getWebPath(localEnvironment: object = {}, defaultValue: string = '/') : string
    getLibPath(localEnvironment: object = {}, defaultValue: string = 'lib') : string
    getSourcePath(localEnvironment: object = {}, defaultValue: string = 'src') : string
    getExpressPath(localEnvironment: object = {}, defaultValue: string = 'express') : string
    getEpiserverFormsDir(localEnvironment: object = {}, defaultValue: string = 'Scripts/EPiServer.ContentApi.Forms') : string
    getNodeEnv(localEnvironment: object = {}, defaultValue: string = 'development') : string
    isEpiserverFormsEnabled(localEnvironment: object = {}, defaultValue: string = 'false') : string

    /**
     * Retrieve the URL at which Episerver is running, always ending with a 
     * slash. This shall be used to connect to Episerver by the application,
     * this URL could be different from the URL where the application runs.
     * 
     * @public
     * @param {object} localEnvironment Additional environment overrides to those provided in the constructor
     * @param {string} defaultValue     The default value if none set by the environment
     * @returns {string}
     */
    getEpiserverURL(localEnvironment: object = {}, defaultValue: string = '/') : string

    /**
     * Generate the resolve configuration for Webpack
     * 
     * @public
     * @param   {object}    envOverrides    The Environment overrides through the Webpack CLI
     * @returns {object}    The Resolve configuration for Webpack
     */
    getResolveConfig(envOverrides: object = undefined) : object
    getDefineConfig(envOverrides: object = {}) : object

    /**
     * Read a value from the NodeJS Environment
     * 
     * @public
     * @param {string} key              The name of the environment variable
     * @param {string} defaultValue     The default value
     * @param {object} overrides        Overrides for the environment
     * @returns {string}                The value of the environment variable, or the defaultValue if it evaluates to false
     */
    getEnvVariable(key : string, defaultValue : string = null, overrides : object = undefined) : string
}