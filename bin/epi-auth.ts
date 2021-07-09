#!/usr/bin/env node

// Import native Node.JS libraries
import * as readline from 'readline';
import { URL } from 'url';
import { API_V2, IAuthService, DefaultAuthService } from '@episerver/spa-core/cjs/Library/ContentDelivery';

// Import local classes
import GlobalConfig from '../util/Config';
import ClientAuthStorage from '../ContentDelivery/ClientAuthStorage';

type EpiAuthCliConfig = {
    BaseURL  :   string
    input    ?:  NodeJS.ReadableStream
    output   ?:  NodeJS.WritableStream
    username ?:  string
    password ?:  string
    force    ?:  boolean
}

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
     * @type { IAuthService } auth
     */
    private _auth : IAuthService;

    private config : EpiAuthCliConfig;

    /**
     * 
     * @param { EpiAuthCliConfig } config
     */
    constructor(config : EpiAuthCliConfig) 
    {
        this.config = config;

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
            const cd_api = new API_V2({
                BaseURL: config.BaseURL,
                Debug: false,
                EnableExtensions: true
            });
            this._auth = new DefaultAuthService(cd_api, ClientAuthStorage.CreateFromUrl(u));
        } catch (e) {
            this._rli.write(`\n\n\x1b[31mInvalid Episerver URL provided: ${ config.BaseURL }\x1b[0m\n\n`);
            this._rli.close();
            process.exit(1);
        }
    }

    async start() {
        const auth = this.config.force ? false : await this._auth.isAuthenticated().catch((e : Error) => {
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
        const user = this.config.username || await this.ask('Username: ');
        const pass = this.config.password || await this.ask('Password: ', true);
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
            this._rli.write(' ' + (success ? '\x1b[32msuccess\x1b[0m' : '\x1b[31minvalid credentials or locked account\x1b[0m') + '.\n\n');
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
import * as CliApplication from '../util/CliArguments';

type LoginArgs = {
    u?: string,
    username?: string,
    p?: string,
    password?: string,
    f?: boolean,
    force?: boolean
};

// Read the Command Line arguments
const defaultEnv : EpiEnvOption = EpiEnvOptions.Parse(process.env.NODE_ENV || '', EpiEnvOptions.Development);
const args = CliApplication
    .Setup<LoginArgs>(yargs(process.argv.slice(2)), defaultEnv, "Optimizely CMS Login Script", cfg => cfg
        .alias('u', 'username')
        .describe('u', 'Insecurely pass username, only use from scripts that don\'t append to shell history')
        .string('u')
        .alias('p', 'password')
        .describe('p', 'Insecurely pass password, only use from scripts that don\'t append to shell history')
        .string('p')
        .alias('f', 'force')
        .describe('f', 'Force reauthentication, even if authentication is present')
        .boolean('f')
        .default('f', false)
        .group(['u','p','f'],'Login parameters')
    )
    .argv as yargs.Arguments<CliApplication.CliArgs & LoginArgs>;

// Query env for settings
const config : GlobalConfig =  CliApplication.CreateConfig(args);

// Run the actual script
var auth = new EpiAuthCli({
    BaseURL: config.getEpiserverURL(),
    input: process.stdin, 
    output: process.stdout,
    username: args.username,
    password: args.password,
    force: args.force
});
auth.start();