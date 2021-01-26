import path from 'path';
import fs from 'fs';
import dotenv, { DotenvParseOutput } from 'dotenv';
import dotEnvExpand from 'dotenv-expand';
import EpiEnvOptions, { EpiEnvOption } from './EpiEnvOptions';

type ResolveAliasConfig = {
    [ alias: string ] : string
}

type ResolveConfig = {
    alias: ResolveAliasConfig,
    extensions: string[]
}

/**
 * Episerver SPA Configuration helper, to easily create Webpack config files,
 * which are using a .env file to store environment specific configuration 
 * values.
 */
export class GlobalConfig {
    /**
     * Stored root directory of the SPA
     * 
     * @private
     * @var string
     */
    private _rootDir : string;

    /**
     * Local overrides for the environment
     * 
     * @private
     * @var object
     */
    private _localOverrides : DotenvParseOutput;

    /**
     * Local copy of the environment
     * 
     * @private
     * @var DotenvParseOutput
     */
    private _myEnv : DotenvParseOutput;

    /**
     * The name of the current environment to read the configuration for.
     * 
     * @private
     * @var EpiEnvOption
     */
    private _envName : EpiEnvOption;

    /**
     * Create a new configuration helper for the current context
     * 
     * @param {string} rootDir The root path of the application
     * @param {DotenvParseOutput} localOverrides The environment variables set by the Webpack CLI
     */
    public constructor(rootDir: string, localOverrides: DotenvParseOutput = {}, envName?: EpiEnvOption) {
        this._rootDir = rootDir || process.cwd();
        if (!fs.existsSync(this._rootDir)) {
            throw new Error('Invalid application root directory');
        }
        this._localOverrides = localOverrides;
        this._envName = EpiEnvOptions.Parse(envName || localOverrides.EPI_ENV || process.env.EPI_ENV || process.env.NODE_ENV || '', 'development');

        // Apply .env files and afterwards expand them
        this.getEnvFiles()
            .map(dotEnvFile => dotenv.config({ path: dotEnvFile }))
            .forEach(x => dotEnvExpand(x));

        // Create local env
        this._myEnv = {};
        Object.assign(this._myEnv, process.env, this._localOverrides);

        // Update NODE_ENV if not set
        if (!this._myEnv['NODE_ENV']) {
            this.override('NODE_ENV', this._envName == EpiEnvOptions.Development ? 'development' : 'production');
        }
    }

    /**
     * Retrieve the main application folder, as understood by this configuration
     * helper.
     * 
     * @returns { string }
     */
    public getRootDir() : string
    {
        return this._rootDir;
    }

    /**
     * Retrieve the absolute path to the folder containing the main application 
     * sources
     * 
     * @returns { string }
     */
    public getSourceDir() : string
    {
        return path.join(this.getRootDir(), this.getSourcePath());
    }

    public getServerDir() : string
    {
        return path.join(this.getRootDir(), this.getServerPath());
    }

    /**
     * Override a specific environment variable within this configuration context.
     * 
     * @param   {string}    key The environment key to override
     * @param   {string}    value The new value of the environment key
     * @returns {this}      The current configuration for command chaining
     */
    public override(key: string, value: string) : this
    {
        this._myEnv[key] = value;
        process.env[key] = '0';
        return this;
    }

    /**
     * Get the list of .env files that will be processed by the configuration
     */
    public getEnvFiles() : string[]
    {
        let files : string[] = [".env", ".env.local", `.env.${ this._envName }.local`];
        return files
                    .map(x => path.join(this._rootDir, x))
                    .filter(x => fs.existsSync(x) && fs.statSync(x).isFile())
                    .reverse();
    }

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
    public getServerPath(localEnvironment: DotenvParseOutput = {}, defaultValue: string = 'server'): string
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
     * @param {DotenvParseOutput} localEnvironment     The local overrides, if not already specified or different from the constructor
     * @param {string} defaultValue         The default value if not set - by default 'spa'
     * @returns {string}
     */
    public getSpaPath(localEnvironment: DotenvParseOutput = {}, defaultValue: string = 'Spa'): string
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
     * @param {DotenvParseOutput} localEnvironment     The local overrides, if not already specified or different from the constructor
     * @param {string} defaultValue         The default value if not set - by default '../Foundation'
     * @returns {string}
     */
    public getEpiPath(localEnvironment: DotenvParseOutput = {}, defaultValue: string = '../Foundation'): string
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
     * @param {DotenvParseOutput} localEnvironment     The local overrides, if not already specified or different from the constructor
     * @param {string} defaultValue         The default value if not set - by default '/'
     * @returns {string}
     */
    public getWebPath(localEnvironment: DotenvParseOutput = {}, defaultValue: string = '/'): string
    {
        return this.getEnvVariable('WEB_PATH', defaultValue, localEnvironment);
    }

    public getPublicUrl(localEnvironment: DotenvParseOutput = {}, defaultValue: string = ''): string
    {
        return this.getEnvVariable('PUBLIC_URL', defaultValue, localEnvironment) || this.getEpiserverURL();
    }

    public getLibPath(localEnvironment: DotenvParseOutput = {}, defaultValue = 'lib')
    {
        return this.getEnvVariable('LIB_PATH', defaultValue, localEnvironment);
    }

    public getSourcePath(localEnvironment: DotenvParseOutput = {}, defaultValue = 'src')
    {
        return this.getEnvVariable('SRC_PATH', defaultValue, localEnvironment);
    }

    public getEpiserverFormsDir(localEnvironment: DotenvParseOutput = {}, defaultValue = 'Scripts/EPiServer.ContentApi.Forms')
    {
        return this.getEnvVariable('EPI_FORMS_PATH', defaultValue, localEnvironment)
    }

    public getNodeEnv(localEnvironment: DotenvParseOutput = {}, defaultValue = 'development')
    {
        return this.getEnvVariable("NODE_ENV", defaultValue, localEnvironment);
    }

    public getEpiEnvironment()
    {
        return this._envName;
    }

    public isEpiserverFormsEnabled(localEnvironment: DotenvParseOutput = {}, defaultValue = 'false') {
        return this.getEnvVariable('EPI_FORMS_INCLUDE', defaultValue, localEnvironment).toLowerCase() == 'true';
    }

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
    public getEpiserverURL(localEnvironment: DotenvParseOutput = {}, defaultValue: string = '/'): string {
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
     * @param   {DotenvParseOutput}    envOverrides    The Environment overrides through the Webpack CLI
     * @returns {object}    The Resolve configuration for Webpack
     */
    public getResolveConfig(envOverrides?: DotenvParseOutput): object {

        const tsConfigFile = path.resolve(this._rootDir, this.getEnvVariable('TS_CONFIG_FILE', 'tsconfig.json', envOverrides));
        const alias : ResolveAliasConfig = {};
        if (fs.existsSync(tsConfigFile)) {
            console.log('Building resolve configuration from TypeScript config file: ', tsConfigFile);
            const tsConfig = JSON.parse(fs.readFileSync(tsConfigFile).toString());
            var paths = (tsConfig.compilerOptions || {}).paths || {};
            var baseUrl = (tsConfig.compilerOptions || {}).baseUrl || '';
            for (var prefix in paths) {
                var webpackPrefix = prefix.replace(/[\/\\]\*$/,'');
                let prefixPath = Array.isArray(paths[prefix]) ? paths[prefix][0] : (typeof(paths[prefix]) === "string" ? paths[prefix] : "");
                alias[webpackPrefix] = path.resolve(this._rootDir, baseUrl, prefixPath.replace(/[\/\\]\*$/,''));
            }
        } else {
            alias["app"] = path.resolve(this._rootDir, this.getSourcePath(envOverrides));
            alias["app.server"] = path.resolve(this._rootDir, this.getServerPath(envOverrides));
        }

        const resolveConfig : ResolveConfig = {
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
     * @param {DotenvParseOutput} envOverrides A list of overrides for the environment variables
     * @returns {object} The configuration for the Webpack Define Plugin
     */
    public getDefineConfig(envOverrides: DotenvParseOutput = {}): object
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
     * @param {T} defaultValue     The default value
     * @param {DotenvParseOutput} overrides        Overrides for the environment
     * @returns {string|T}                The value of the environment variable, or the defaultValue if it evaluates to false
     */
    public getEnvVariable<T>(key: string, defaultValue: T, overrides?: DotenvParseOutput): string | T
    {    
        const env = overrides ? Object.assign({}, this._myEnv, overrides) : this._myEnv;
        const val = env[key];
        return val || defaultValue
    } 
}

export default GlobalConfig;