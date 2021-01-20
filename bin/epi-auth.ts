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
    }

    async start() {
        const auth = await this._auth.isAuthenticated().catch((e : Error) => {
            this._rli.write('ERROR!');
            this._rli.close();
            console.log();
            process.exit(100);
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
        this._auth.login(user, pass).catch(() => false).then((success : boolean) => {
            this._rli.write(success ? '\x1b[32m success\x1b[0m\n\n' : '\x1b[31m failed\x1b[0m\n\n');
            this._rli.close();
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

// Query env for settings
const config : GlobalConfig = new GlobalConfig(process.cwd());
const argv_url = process.argv.slice(2,3)[0];
const env_url = config.getEpiserverURL();
const epi_url = argv_url || env_url;

// Validate that whe have the required setup
if (!epi_url) {
    console.log('\x1b[31m\nUnable to determine the Episerver instance, provide the URL either as first\nargument or through the EPI_URL environment variable. If you have a .env file,\nyou can also put it in there.\n\x1b[0m');
    process.exit();
}

// Run the actual script
var auth = new EpiAuthCli({
    BaseURL: epi_url,
    input: process.stdin, 
    output: process.stdout
});
auth.start();