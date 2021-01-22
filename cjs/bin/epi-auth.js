#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
// Import native Node.JS libraries
const readline_1 = __importDefault(require("readline"));
const crypto_1 = __importDefault(require("crypto"));
const url_1 = require("url");
// Import episerver libraries through ESM, as they are delivered as ESNext modules
const esm = require('esm')(module, {});
const epi = esm('@episerver/spa-core');
// Import local classes
const Config_1 = __importDefault(require("../util/Config"));
const ClientAuthStorage_1 = __importDefault(require("../ContentDelivery/ClientAuthStorage"));
class EpiAuthCli {
    /**
     *
     * @param { Object } config
     * @param { string } config.BaseURL The Base URL where your episerver instance is running
     * @param { NodeJS.ReadableStream } [config.input] The input stream to use to handle authentication
     * @param { NodeJS.WritableStream } [config.output] The output stream to use to handle authentication
     */
    constructor(config) {
        // Configure CLI Interface
        this._rli = readline_1.default.createInterface(config.input || process.stdin, config.output || process.stdout);
        this._rli.write(`\n == Episerver CLI Authentication tool (${config.BaseURL}) == \n\n`);
        this._rli.stdoutMuted = false;
        this._rli._writeToOutput = function (stringToWrite) {
            if (!this.output)
                return;
            if (this.stdoutMuted)
                this.output.write("*".repeat(stringToWrite.length));
            else
                this.output.write(stringToWrite);
        };
        // Configure AUTH Api
        try {
            const u = new url_1.URL(config.BaseURL);
            const cd_api = new epi.ContentDelivery.API_V2({
                BaseURL: config.BaseURL,
                Debug: false,
                EnableExtensions: true
            });
            const hash = crypto_1.default.createHash('sha256');
            hash.update(u.hostname);
            const cd_auth_storage = new ClientAuthStorage_1.default(hash.digest('hex'));
            this._auth = new epi.ContentDelivery.DefaultAuthService(cd_api, cd_auth_storage);
        }
        catch (e) {
            this._rli.write(`\n\n\x1b[31mInvalid Episerver URL provided: ${config.BaseURL}\x1b[0m\n\n`);
            this._rli.close();
            process.exit(1);
        }
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            const auth = yield this._auth.isAuthenticated().catch((e) => {
                this._rli.write(`\n\n\x1b[31mError while validating authentication status: ${e.message}\x1b[0m\n\n`);
                this._rli.close();
                process.exit(1);
            });
            if (auth) {
                const user = yield this._auth.currentUser();
                const answer = yield this.ask(`You are currently authenticated${user ? ' as\x1b[36m ' + user + '\x1b[0m' : ''}, do you want to reauthenticate? (Y/N) `);
                if (answer.toUpperCase() === 'Y') {
                    this._rli.write('\n');
                    return this.askCredentials();
                }
                this._rli.write('\n');
                this._rli.close();
            }
            else {
                this.askCredentials();
            }
        });
    }
    askCredentials() {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.ask('Username: ');
            const pass = yield this.ask('Password: ', true);
            return this.doLogin(user, pass);
        });
    }
    doLogin(user, pass) {
        this._rli.write(`\n\nAttempting to login\x1b[36m ${user}\x1b[0m, using provided password:`);
        this._auth.login(user, pass).catch((e) => {
            this._rli.write(`\x1b[31m\n\n !!! Login failed: ${e.message} !!!\x1b[0m\n\n`);
            this._rli.close();
            process.exit(1);
        }).then((success) => {
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
    ask(question, muted = false) {
        return new Promise((resolve, reject) => {
            this._rli.question(question, answer => {
                this._rli.stdoutMuted = false;
                resolve(answer);
            });
            this._rli.stdoutMuted = muted ? true : false;
        });
    }
}
const yargs_1 = __importDefault(require("yargs"));
const EpiEnvOptions_1 = __importDefault(require("../util/EpiEnvOptions"));
// Read the Command Line arguments
const epiEnvChoices = [EpiEnvOptions_1.default.Development, EpiEnvOptions_1.default.Integration, EpiEnvOptions_1.default.Preproduction, EpiEnvOptions_1.default.Production];
const defaultEnv = epiEnvChoices.indexOf(process.env.NODE_ENV || "", 0) >= 0 ? process.env.NODE_ENV || "" : 'development';
const args = yargs_1.default(process.argv.slice(2))
    .alias('e', ['environment', 'env'])
    .describe('e', 'The environment to run the authentication for (when using .env files)')
    .choices('e', ["development", "integration", "preproduction", "production"])
    .default('e', defaultEnv)
    .coerce('e', value => EpiEnvOptions_1.default.Parse(value))
    .alias('d', ['domain'])
    .describe('d', 'The domain to authenticate against, overrides the value from .env files')
    .coerce('d', (value) => { if (!value)
    return undefined; try {
    return new url_1.URL(value);
}
catch (e) {
    throw new Error(`The value "${value}" is not a valid URL`);
} })
    .string('d')
    .alias('i', ['insecure', 'no-cert'])
    .describe('i', 'Remove all security implied by SSL/TLS by disabling certificate checking in Node.JS - only use when there\'s no alternative.')
    .boolean('i')
    .help("help")
    .argv;
// Query env for settings
const config = new Config_1.default(process.cwd(), {}, args.environment);
const epi_url = ((_a = args.domain) === null || _a === void 0 ? void 0 : _a.href) || config.getEpiserverURL();
// Disable SSL/TLS security if configured to do so
if (args.insecure === true) {
    console.warn('\x1b[31mDisabled certificate checking, this breaks identity verification of the server!\x1b[0m');
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}
// Run the actual script
var auth = new EpiAuthCli({
    BaseURL: epi_url,
    input: process.stdin,
    output: process.stdout
});
auth.start();
