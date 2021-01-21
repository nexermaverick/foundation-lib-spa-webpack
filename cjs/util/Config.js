"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalConfig = void 0;
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var dotenv_1 = __importDefault(require("dotenv"));
var dotenv_expand_1 = __importDefault(require("dotenv-expand"));
var EpiEnvOptions_1 = __importDefault(require("./EpiEnvOptions"));
/**
 * Episerver SPA Configuration helper, to easily create Webpack config files,
 * which are using a .env file to store environment specific configuration
 * values.
 */
var GlobalConfig = /** @class */ (function () {
    /**
     * Create a new configuration helper for the current context
     *
     * @param {string} rootDir The root path of the application
     * @param {DotenvParseOutput} localOverrides The environment variables set by the Webpack CLI
     */
    function GlobalConfig(rootDir, localOverrides, envName) {
        if (localOverrides === void 0) { localOverrides = {}; }
        this._rootDir = rootDir || process.cwd();
        this._localOverrides = localOverrides;
        this._envName = EpiEnvOptions_1.default.Parse(envName || process.env.NODE_ENV || '') || 'development';
        // Apply .env files and afterwards expand them
        this.getEnvFiles()
            .map(function (dotEnvFile) { return dotenv_1.default.config({ path: dotEnvFile }); })
            .forEach(function (x) { return dotenv_expand_1.default(x); });
        // Create local env
        this._myEnv = {};
        Object.assign(this._myEnv, process.env, this._localOverrides);
        // Update NODE_ENV if not set
        if (!this._myEnv['NODE_ENV']) {
            process.env.NODE_ENV = this._envName == EpiEnvOptions_1.default.Development ? 'development' : 'production';
            this._myEnv['NODE_ENV'] = this._envName == EpiEnvOptions_1.default.Development ? 'development' : 'production';
        }
    }
    /**
     * Get the list of .env files that will be processed by the configuration
     */
    GlobalConfig.prototype.getEnvFiles = function () {
        var _this = this;
        var files = [".env", ".env.local", ".env." + this._envName + ".local"];
        return files
            .map(function (x) { return path_1.default.join(_this._rootDir, x); })
            .filter(function (x) { return fs_1.default.existsSync(x) && fs_1.default.statSync(x).isFile(); })
            .reverse();
    };
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
    GlobalConfig.prototype.getServerPath = function (localEnvironment, defaultValue) {
        if (localEnvironment === void 0) { localEnvironment = {}; }
        if (defaultValue === void 0) { defaultValue = 'server'; }
        return this.getEnvVariable('SERVER_PATH', defaultValue, localEnvironment);
    };
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
    GlobalConfig.prototype.getSpaPath = function (localEnvironment, defaultValue) {
        if (localEnvironment === void 0) { localEnvironment = {}; }
        if (defaultValue === void 0) { defaultValue = 'Spa'; }
        return this.getEnvVariable('SPA_PATH', defaultValue, localEnvironment);
    };
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
    GlobalConfig.prototype.getEpiPath = function (localEnvironment, defaultValue) {
        if (localEnvironment === void 0) { localEnvironment = {}; }
        if (defaultValue === void 0) { defaultValue = '../Foundation'; }
        return this.getEnvVariable('EPI_PATH', defaultValue, localEnvironment);
    };
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
    GlobalConfig.prototype.getWebPath = function (localEnvironment, defaultValue) {
        if (localEnvironment === void 0) { localEnvironment = {}; }
        if (defaultValue === void 0) { defaultValue = '/'; }
        return this.getEnvVariable('WEB_PATH', defaultValue, localEnvironment);
    };
    GlobalConfig.prototype.getPublicUrl = function (localEnvironment, defaultValue) {
        if (localEnvironment === void 0) { localEnvironment = {}; }
        if (defaultValue === void 0) { defaultValue = ''; }
        return this.getEnvVariable('PUBLIC_URL', defaultValue, localEnvironment) || this.getEpiserverURL();
    };
    GlobalConfig.prototype.getLibPath = function (localEnvironment, defaultValue) {
        if (localEnvironment === void 0) { localEnvironment = {}; }
        if (defaultValue === void 0) { defaultValue = 'lib'; }
        return this.getEnvVariable('LIB_PATH', defaultValue, localEnvironment);
    };
    GlobalConfig.prototype.getSourcePath = function (localEnvironment, defaultValue) {
        if (localEnvironment === void 0) { localEnvironment = {}; }
        if (defaultValue === void 0) { defaultValue = 'src'; }
        return this.getEnvVariable('SRC_PATH', defaultValue, localEnvironment);
    };
    GlobalConfig.prototype.getExpressPath = function (localEnvironment, defaultValue) {
        if (localEnvironment === void 0) { localEnvironment = {}; }
        if (defaultValue === void 0) { defaultValue = 'express'; }
        return this.getEnvVariable('EXPRESS_PATH', defaultValue, localEnvironment);
    };
    GlobalConfig.prototype.getEpiserverFormsDir = function (localEnvironment, defaultValue) {
        if (localEnvironment === void 0) { localEnvironment = {}; }
        if (defaultValue === void 0) { defaultValue = 'Scripts/EPiServer.ContentApi.Forms'; }
        return this.getEnvVariable('EPI_FORMS_PATH', defaultValue, localEnvironment);
    };
    GlobalConfig.prototype.getNodeEnv = function (localEnvironment, defaultValue) {
        if (localEnvironment === void 0) { localEnvironment = {}; }
        if (defaultValue === void 0) { defaultValue = 'development'; }
        return this.getEnvVariable("NODE_ENV", defaultValue, localEnvironment);
    };
    GlobalConfig.prototype.getEpiEnvironment = function () {
        return this._envName;
    };
    GlobalConfig.prototype.isEpiserverFormsEnabled = function (localEnvironment, defaultValue) {
        if (localEnvironment === void 0) { localEnvironment = {}; }
        if (defaultValue === void 0) { defaultValue = 'false'; }
        return this.getEnvVariable('EPI_FORMS_INCLUDE', defaultValue, localEnvironment).toLowerCase() == 'true';
    };
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
    GlobalConfig.prototype.getEpiserverURL = function (localEnvironment, defaultValue) {
        if (localEnvironment === void 0) { localEnvironment = {}; }
        if (defaultValue === void 0) { defaultValue = '/'; }
        var base_url = this.getEnvVariable('EPI_URL', defaultValue, localEnvironment);
        if (base_url.substr(-1) !== '/') {
            base_url = base_url + '/';
        }
        return base_url;
    };
    /**
     * Generate the resolve configuration for Webpack
     *
     * @public
     * @param   {DotenvParseOutput}    envOverrides    The Environment overrides through the Webpack CLI
     * @returns {object}    The Resolve configuration for Webpack
     */
    GlobalConfig.prototype.getResolveConfig = function (envOverrides) {
        var tsConfigFile = path_1.default.resolve(this._rootDir, this.getEnvVariable('TS_CONFIG_FILE', 'tsconfig.json', envOverrides));
        var alias = {};
        if (fs_1.default.existsSync(tsConfigFile)) {
            console.log('Building resolve configuration from TypeScript config file: ', tsConfigFile);
            var tsConfig = JSON.parse(fs_1.default.readFileSync(tsConfigFile).toString());
            var paths = (tsConfig.compilerOptions || {}).paths || {};
            var baseUrl = (tsConfig.compilerOptions || {}).baseUrl || '';
            for (var prefix in paths) {
                var webpackPrefix = prefix.replace(/[\/\\]\*$/, '');
                var prefixPath = Array.isArray(paths[prefix]) ? paths[prefix][0] : (typeof (paths[prefix]) === "string" ? paths[prefix] : "");
                alias[webpackPrefix] = path_1.default.resolve(this._rootDir, baseUrl, prefixPath.replace(/[\/\\]\*$/, ''));
            }
        }
        else {
            alias["app"] = path_1.default.resolve(this._rootDir, this.getSourcePath(envOverrides));
            alias["app.server"] = path_1.default.resolve(this._rootDir, this.getServerPath(envOverrides));
            alias["app.express"] = path_1.default.resolve(this._rootDir, this.getExpressPath(envOverrides));
        }
        var resolveConfig = {
            alias: alias,
            extensions: ['.js', '.jsx', '.json', '.tsx', '.ts']
        };
        if (this.isEpiserverFormsEnabled()) {
            var formsDir = path_1.default.resolve(this._rootDir, this.getEpiserverFormsDir(envOverrides));
            resolveConfig.alias["EPiServer.ContentApi.Forms"] = formsDir;
        }
        return resolveConfig;
    };
    /**
     * Create a list of NodeJS variables that will be replaced by their value
     * during the build process. This "fixates" the value in run-time.
     *
     * @param {DotenvParseOutput} envOverrides A list of overrides for the environment variables
     * @returns {object} The configuration for the Webpack Define Plugin
     */
    GlobalConfig.prototype.getDefineConfig = function (envOverrides) {
        if (envOverrides === void 0) { envOverrides = {}; }
        return {
            'process.env.NODE_ENV': JSON.stringify(this.getNodeEnv(envOverrides)),
            'process.env.EPI_URL': JSON.stringify(this.getEnvVariable("EPI_URL", "/", envOverrides)),
            'process.env.WEB_PATH': JSON.stringify(this.getWebPath())
        };
    };
    /**
     * Read a value from the NodeJS Environment
     *
     * @public
     * @param {string} key              The name of the environment variable
     * @param {T} defaultValue     The default value
     * @param {DotenvParseOutput} overrides        Overrides for the environment
     * @returns {string|T}                The value of the environment variable, or the defaultValue if it evaluates to false
     */
    GlobalConfig.prototype.getEnvVariable = function (key, defaultValue, overrides) {
        var env = overrides ? Object.assign({}, this._myEnv, overrides) : this._myEnv;
        var val = env[key];
        return val || defaultValue;
    };
    return GlobalConfig;
}());
exports.GlobalConfig = GlobalConfig;
exports.default = GlobalConfig;
