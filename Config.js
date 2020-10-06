const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

/**
 * Episerver SPA Configuration helper, to easily create Webpack config files,
 * which are using a .env file to store environment specific configuration 
 * values.
 */
class GlobalConfig {
    /**
     * Stored root directory of the SPA
     * 
     * @private
     * @var string
     */
    _rootDir = null;

    /**
     * Local overrides for the environment
     * 
     * @private
     * @var object
     */
    _localOverrides = {};

    /**
     * Local copy of the environment
     * 
     * @private
     * @var object
     */
    _myEnv = {};

    /**
     * Create a new configuration helper for the current context
     * 
     * @param {string} rootDir The root path of the application
     * @param {object} localOverrides The environment variables set by the Webpack CLI
     */
    constructor(rootDir, localOverrides = {}) {
        this._rootDir = rootDir;
        this._localOverrides = localOverrides;
        dotenv.config({path: path.join(this._rootDir, '.env')});
        Object.assign(this._myEnv, process.env, this._localOverrides);
    }

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
    getServerPath(localEnvironment = {}, defaultValue = 'server')
    {
        return this.getEnvVariable('SERVER_PATH', defaultValue, localEnvironment);
    }

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
    getSpaPath(localEnvironment = {}, defaultValue = 'Spa')
    {
        return this.getEnvVariable('SPA_PATH', defaultValue, localEnvironment);
    }

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
    getEpiPath(localEnvironment = {}, defaultValue = '../Foundation')
    {
        return this.getEnvVariable('EPI_PATH', defaultValue, localEnvironment);
    }

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
    getWebPath(localEnvironment = {}, defaultValue = '/')
    {
        return this.getEnvVariable('WEB_PATH', defaultValue, localEnvironment);
    }

    getLibPath(localEnvironment = {}, defaultValue = 'lib')
    {
        return this.getEnvVariable('LIB_PATH', defaultValue, localEnvironment);
    }

    getSourcePath(localEnvironment = {}, defaultValue = 'src')
    {
        return this.getEnvVariable('SRC_PATH', defaultValue, localEnvironment);
    }

    getExpressPath(localEnvironment = {}, defaultValue = 'express')
    {
        return this.getEnvVariable('EXPRESS_PATH', defaultValue, localEnvironment);
    }

    getEpiserverFormsDir(localEnvironment = {}, defaultValue = 'Scripts/EPiServer.ContentApi.Forms')
    {
        return this.getEnvVariable('EPI_FORMS_PATH', defaultValue, localEnvironment)
    }

    getNodeEnv(localEnvironment = {}, defaultValue = 'development')
    {
        return this.getEnvVariable("NODE_ENV", defaultValue, localEnvironment);
    }

    isEpiserverFormsEnabled(localEnvironment = {}, defaultValue = 'false') {
        return this.getEnvVariable('EPI_FORMS_INCLUDE', defaultValue, localEnvironment).toLowerCase() == 'true';
    }

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
    getEpiserverURL(localEnvironment = {}, defaultValue = '/') {
        let base_url = this.getEnvVariable('EPI_URL', defaultValue, localEnvironment);
        if (base_url.substr(-1) !== '/') {
            base_url = base_url + '/';
        }
        return base_url;
    }

    /**
     * Generate the resolve configuration for Webpack
     * 
     * @public
     * @param   {object}    envOverrides    The Environment overrides through the Webpack CLI
     * @returns {object}    The Resolve configuration for Webpack
     */
    getResolveConfig(envOverrides = undefined) {

        const tsConfigFile = path.resolve(this._rootDir, this.getEnvVariable('TS_CONFIG_FILE', 'tsconfig.json', envOverrides));
        const alias = {};
        if (fs.existsSync(tsConfigFile)) {
            console.log('Building resolve configuration from TypeScript config file: ', tsConfigFile);
            const tsConfig = JSON.parse(fs.readFileSync(tsConfigFile));
            var paths = (tsConfig.compilerOptions || {}).paths || {};
            for (var prefix in paths) {
                var webpackPrefix = prefix.replace(/[\/\\]\*$/,'');
                let prefixPath = Array.isArray(paths[prefix]) ? paths[prefix][0] : (typeof(paths[prefix]) === "string" ? paths[prefix] : "");
                alias[webpackPrefix] = path.resolve(this._rootDir, prefixPath.replace(/[\/\\]\*$/,''));
            }
        } else {
            alias["app"] = path.resolve(this._rootDir, this.getSourcePath(envOverrides));
            alias["app.server"] = path.resolve(this._rootDir, this.getServerPath(envOverrides));
            alias["app.express"] = path.resolve(this._rootDir, this.getExpressPath(envOverrides));
        }

        const resolveConfig = {
            alias: alias,
            extensions: ['.js', '.jsx', '.json', '.tsx', '.ts']
        };

        if (this.isEpiserverFormsEnabled()) {
            const formsDir = path.resolve(this._rootDir,  this.getEpiserverFormsDir(envOverrides));
            resolveConfig.alias["EPiServer.ContentApi.Forms"] = formsDir;
        }

        return resolveConfig;
    }

    /**
     * Create a list of NodeJS variables that will be replaced by their value
     * during the build process. This "fixates" the value in run-time. 
     * 
     * @param {object} envOverrides A list of overrides for the environment variables
     * @returns {object} The configuration for the Webpack Define Plugin
     */
    getDefineConfig(envOverrides = {})
    {
        return {
            'process.env.NODE_ENV': JSON.stringify(this.getNodeEnv(envOverrides)),
            'process.env.EPI_URL': JSON.stringify(this.getEnvVariable("EPI_URL","/",envOverrides)),
            'process.env.WEB_PATH': JSON.stringify(this.getWebPath())
        }
    }

    /**
     * Read a value from the NodeJS Environment
     * 
     * @public
     * @param {string} key              The name of the environment variable
     * @param {string} defaultValue     The default value
     * @param {object} overrides        Overrides for the environment
     * @returns {string}                The value of the environment variable, or the defaultValue if it evaluates to false
     */
    getEnvVariable(key, defaultValue = null, overrides = undefined) {
        
        let env = overrides ? Object.assign({}, this._myEnv, overrides) : this._myEnv;
        return env[key] || defaultValue
    } 
}

module.exports = GlobalConfig;