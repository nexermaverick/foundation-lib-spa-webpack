#!/usr/bin/env node

// Import native Node.JS libraries
import readline from 'readline';
import crypto from 'crypto';
import { URL } from 'url';

// Import episerver libraries through ESM, as they are delivered as ESNext modules
const esm = require('esm')(module, {});
const epi = esm('@episerver/spa-core');

// Import local classes
import GlobalConfig from '../util/Config';
import ClientAuthStorage from '../ContentDelivery/ClientAuthStorage';

class EpiAuthCli {
    /**
     * @type { readline.Interface }
     */
    private _rli : readline.Interface & {
        stdoutMuted?: boolean,
        _writeToOutput?: (message: string) => void,
        output?: NodeJS.WritableStream,
        input?: NodeJS.ReadableStream
    };

    /**
     * 
     * @type { epi.ContentDelivery.IAuthService } auth
     */
    private _auth : any;

    /**
     * 
     * @param { Object } config
     * @param { string } config.BaseURL The Base URL where your episerver instance is running
     * @param { NodeJS.ReadableStream } [config.input] The input stream to use to handle authentication
     * @param { NodeJS.WritableStream } [config.output] The output stream to use to handle authentication
     */
    constructor(config : any) 
    {
        // Configure CLI Interface
        this._rli = readline.createInterface(config.input || process.stdin, config.output || process.stdout);
        this._rli.write(`\n == Episerver CLI Authentication tool (${ config.BaseURL }) == \n\n`);
        this._rli.stdoutMuted = false;
        this._rli._writeToOutput = function (stringToWrite) {
            if (!this.output) return;
            if (this.stdoutMuted)
                this.output.write("*".repeat(stringToWrite.length));
            else
                this.output.write(stringToWrite);
        }

        // Configure AUTH Api
        try {
            const u = new URL(config.BaseURL);
            const cd_api = new epi.ContentDelivery.API_V2({
                BaseURL: config.BaseURL,
                Debug: false,
                EnableExtensions: true
            });
            const hash = crypto.createHash('sha256');
            hash.update(u.hostname);
            const cd_auth_storage = new ClientAuthStorage(hash.digest('hex'));
            this._auth = new epi.ContentDelivery.DefaultAuthService(cd_api, cd_auth_storage);
        } catch (e) {
            this._rli.write(`\n\n\x1b[31mInvalid Episerver URL provided: ${ config.BaseURL }\x1b[0m\n\n`);
            this._rli.close();
            process.exit(1);
        }
    }

    async start() {
        const auth = await this._auth.isAuthenticated().catch((e : Error) => {
            this._rli.write(`\n\n\x1b[31mError while validating authentication status: ${ e.message }\x1b[0m\n\n`);
            this._rli.close();
            process.exit(1);
        })
        if (auth) {
            const user = await this._auth.currentUser()
            const answer = await this.ask(`You are currently authenticated${ user ? ' as\x1b[36m ' + user + '\x1b[0m': '' }, do you want to reauthenticate? (Y/N) `);
            if (answer.toUpperCase() === 'Y') {
                this._rli.write('\n');
                return this.askCredentials();
            }
            this._rli.write('\n');
            this._rli.close();
        } else {
            this.askCredentials();
        }
    }

    protected async askCredentials() : Promise<void>
    {
        const user = await this.ask('Username: ');
        const pass = await this.ask('Password: ', true);
        return this.doLogin(user, pass);
    }

    protected doLogin(user : string, pass : string) : void
    {
        this._rli.write(`\n\nAttempting to login\x1b[36m ${ user }\x1b[0m, using provided password:`);
        this._auth.login(user, pass).catch((e: Error) => {
            this._rli.write(`\x1b[31m\n\n !!! Login failed: ${ e.message } !!!\x1b[0m\n\n`);
            this._rli.close();
            process.exit(1);
        }).then((success : boolean) => {
            this._rli.write(' ' + (success ? '\x1b[32msuccess\x1b[0m' : '\x1b[31minvalid credentials or locked account\x1b[0m') + '\n\n.');
            this._rli.close();
            process.exit(success ? 0 : 1);
        });
    }

    /**
     * Wrapper around the readline interface to provide a promises based method to ask
     * a question to the user.
     * 
     * @protected
     * @param { string } question The question to be asked
     * @param { boolean } muted Whether or not the input must be muted
     * @returns { Promise<string> } The answer given by the user
     */
    protected ask(question : string, muted : boolean = false) : Promise<string> {
        return new Promise((resolve, reject) => {
            this._rli.question(question, answer => {
                this._rli.stdoutMuted = false;
                resolve(answer);
            });
            this._rli.stdoutMuted = muted ? true : false;
        });
    }
}

import yargs from 'yargs';
import EpiEnvOptions, { EpiEnvOption } from '../util/EpiEnvOptions';

type EpiAuthCliArgs = yargs.Arguments<{
    environment : EpiEnvOption,
    domain ?: URL
    insecure ?: boolean
    noWarnings ?: boolean
}>

// Read the Command Line arguments
const epiEnvChoices : string[] = [EpiEnvOptions.Development, EpiEnvOptions.Integration, EpiEnvOptions.Preproduction, EpiEnvOptions.Production];
const defaultEnv : string = epiEnvChoices.indexOf(process.env.NODE_ENV || "", 0) >= 0 ? process.env.NODE_ENV || "" : 'development';
const args : EpiAuthCliArgs = yargs(process.argv.slice(2))
        .alias('e', ['environment', 'env'])
        .describe('e', 'The environment to run the authentication for (when using .env files)')
        .choices('e', ["development", "integration", "preproduction", "production"])
        .default('e', defaultEnv)
        .coerce('e', value => EpiEnvOptions.Parse(value))
        .alias('d', ['domain'])
        .describe('d', 'The domain to authenticate against, overrides the value from .env files')
        .coerce('d', (value) => { if (!value) return undefined; try { return new URL(value); } catch (e) { throw new Error(`The value "${value}" is not a valid URL`); }})
        .string('d')
        .alias('i', ['insecure','no-cert'])
        .describe('i', 'Remove all security implied by SSL/TLS by disabling certificate checking in Node.JS - only use when there\'s no alternative.')
        .boolean('i')
        .help("help")
        .argv as unknown as EpiAuthCliArgs;

// Query env for settings
const config : GlobalConfig = new GlobalConfig(process.cwd(), {}, args.environment);
const epi_url = args.domain?.href || config.getEpiserverURL();

// Disable SSL/TLS security if configured to do so
if (args.insecure === true) {
    console.warn('\x1b[31mDisabled certificate checking, this breaks identity verification of the server!\x1b[0m')
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// Run the actual script
var auth = new EpiAuthCli({
    BaseURL: epi_url,
    input: process.stdin, 
    output: process.stdout
});
auth.start();