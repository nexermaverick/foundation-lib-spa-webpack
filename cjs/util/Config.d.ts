import { DotenvParseOutput } from 'dotenv';
/**
 * Episerver SPA Configuration helper, to easily create Webpack config files,
 * which are using a .env file to store environment specific configuration
 * values.
 */
export declare class GlobalConfig {
    /**
     * Stored root directory of the SPA
     *
     * @private
     * @var string
     */
    private _rootDir;
    /**
     * Local overrides for the environment
     *
     * @private
     * @var object
     */
    private _localOverrides;
    /**
     * Local copy of the environment
     *
     * @private
     * @var DotenvParseOutput
     */
    private _myEnv;
    /**
     * Create a new configuration helper for the current context
     *
     * @param {string} rootDir The root path of the application
     * @param {DotenvParseOutput} localOverrides The environment variables set by the Webpack CLI
     */
    constructor(rootDir: string, localOverrides?: DotenvParseOutput);
    /**
     * Get the list of .env files that will be processed by the configuration
     */
    getEnvFiles(): string[];
    /**
    * Retrieve the path were the code for the Episerver SPA Server Side
    * Rendering can be found, relative to the current path
    *
    * Environment variable: SERVER_PATH
    *
    * @public
    * @param {DotenvParseOutput} localEnvironment     The local overrides, if not already specified or different from the constructor
    * @param {string} defaultValue         The default value if not set - by default 'server'
    * @returns {string}
    */
    getServerPath(localEnvironment?: DotenvParseOutput, defaultValue?: string): string;
    /**
     * The path within the main Episerver site where the SPA needs to be
     * placed. This value shall used both in building the file target path
     * as well as the web path for the resources.
     *
     * Environment variable: SPA_PATH
     *
     * @public
     * @param {DotenvParseOutput} localEnvironment     The local overrides, if not already specified or different from the constructor
     * @param {string} defaultValue         The default value if not set - by default 'spa'
     * @returns {string}
     */
    getSpaPath(localEnvironment?: DotenvParseOutput, defaultValue?: string): string;
    /**
     * The path - relative to the current path - where the main Episerver
     * project is located.
     *
     * Environment variable: EPI_PATH
     *
     * @public
     * @param {DotenvParseOutput} localEnvironment     The local overrides, if not already specified or different from the constructor
     * @param {string} defaultValue         The default value if not set - by default '../Foundation'
     * @returns {string}
     */
    getEpiPath(localEnvironment?: DotenvParseOutput, defaultValue?: string): string;
    /**
     * The path at which the application will be running, relative to the
     * domain
     *
     * Environment variable: WEB_PATH
     *
     * @public
     * @param {DotenvParseOutput} localEnvironment     The local overrides, if not already specified or different from the constructor
     * @param {string} defaultValue         The default value if not set - by default '/'
     * @returns {string}
     */
    getWebPath(localEnvironment?: DotenvParseOutput, defaultValue?: string): string;
    getPublicUrl(localEnvironment?: DotenvParseOutput, defaultValue?: string): string;
    getLibPath(localEnvironment?: DotenvParseOutput, defaultValue?: string): string;
    getSourcePath(localEnvironment?: DotenvParseOutput, defaultValue?: string): string;
    getExpressPath(localEnvironment?: DotenvParseOutput, defaultValue?: string): string;
    getEpiserverFormsDir(localEnvironment?: DotenvParseOutput, defaultValue?: string): string;
    getNodeEnv(localEnvironment?: DotenvParseOutput, defaultValue?: string): string;
    isEpiserverFormsEnabled(localEnvironment?: DotenvParseOutput, defaultValue?: string): boolean;
    /**
     * Retrieve the URL at which Episerver is running, always ending with a
     * slash. This shall be used to connect to Episerver by the application,
     * this URL could be different from the URL where the application runs.
     *
     * @public
     * @param {DotenvParseOutput} localEnvironment Additional environment overrides to those provided in the constructor
     * @param {string} defaultValue     The default value if none set by the environment
     * @returns {string}
     */
    getEpiserverURL(localEnvironment?: DotenvParseOutput, defaultValue?: string): string;
    /**
     * Generate the resolve configuration for Webpack
     *
     * @public
     * @param   {DotenvParseOutput}    envOverrides    The Environment overrides through the Webpack CLI
     * @returns {object}    The Resolve configuration for Webpack
     */
    getResolveConfig(envOverrides?: DotenvParseOutput): object;
    /**
     * Create a list of NodeJS variables that will be replaced by their value
     * during the build process. This "fixates" the value in run-time.
     *
     * @param {DotenvParseOutput} envOverrides A list of overrides for the environment variables
     * @returns {object} The configuration for the Webpack Define Plugin
     */
    getDefineConfig(envOverrides?: DotenvParseOutput): object;
    /**
     * Read a value from the NodeJS Environment
     *
     * @public
     * @param {string} key              The name of the environment variable
     * @param {T} defaultValue     The default value
     * @param {DotenvParseOutput} overrides        Overrides for the environment
     * @returns {string|T}                The value of the environment variable, or the defaultValue if it evaluates to false
     */
    getEnvVariable<T>(key: string, defaultValue: T, overrides?: DotenvParseOutput): string | T;
}
export default GlobalConfig;
