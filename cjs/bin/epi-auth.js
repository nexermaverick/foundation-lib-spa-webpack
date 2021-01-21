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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
// Import native Node.JS libraries
var readline_1 = __importDefault(require("readline"));
var crypto_1 = __importDefault(require("crypto"));
var url_1 = require("url");
// Import episerver libraries through ESM, as they are delivered as ESNext modules
var esm = require('esm')(module, {});
var epi = esm('@episerver/spa-core');
// Import local classes
var Config_1 = __importDefault(require("../util/Config"));
var ClientAuthStorage_1 = __importDefault(require("../ContentDelivery/ClientAuthStorage"));
var EpiAuthCli = /** @class */ (function () {
    /**
     *
     * @param { Object } config
     * @param { string } config.BaseURL The Base URL where your episerver instance is running
     * @param { NodeJS.ReadableStream } [config.input] The input stream to use to handle authentication
     * @param { NodeJS.WritableStream } [config.output] The output stream to use to handle authentication
     */
    function EpiAuthCli(config) {
        // Configure CLI Interface
        this._rli = readline_1.default.createInterface(config.input || process.stdin, config.output || process.stdout);
        this._rli.write("\n == Episerver CLI Authentication tool (" + config.BaseURL + ") == \n\n");
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
            var u = new url_1.URL(config.BaseURL);
            var cd_api = new epi.ContentDelivery.API_V2({
                BaseURL: config.BaseURL,
                Debug: false,
                EnableExtensions: true
            });
            var hash = crypto_1.default.createHash('sha256');
            hash.update(u.hostname);
            var cd_auth_storage = new ClientAuthStorage_1.default(hash.digest('hex'));
            this._auth = new epi.ContentDelivery.DefaultAuthService(cd_api, cd_auth_storage);
        }
        catch (e) {
            this._rli.write("\n\n\u001B[31mInvalid Episerver URL provided: " + config.BaseURL + "\u001B[0m\n\n");
            this._rli.close();
            process.exit(1);
        }
    }
    EpiAuthCli.prototype.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var auth, user, answer;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._auth.isAuthenticated().catch(function (e) {
                            _this._rli.write("\n\n\u001B[31mError while validating authentication status: " + e.message + "\u001B[0m\n\n");
                            _this._rli.close();
                            process.exit(1);
                        })];
                    case 1:
                        auth = _a.sent();
                        if (!auth) return [3 /*break*/, 4];
                        return [4 /*yield*/, this._auth.currentUser()];
                    case 2:
                        user = _a.sent();
                        return [4 /*yield*/, this.ask("You are currently authenticated" + (user ? ' as\x1b[36m ' + user + '\x1b[0m' : '') + ", do you want to reauthenticate? (Y/N) ")];
                    case 3:
                        answer = _a.sent();
                        if (answer.toUpperCase() === 'Y') {
                            this._rli.write('\n');
                            return [2 /*return*/, this.askCredentials()];
                        }
                        this._rli.write('\n');
                        this._rli.close();
                        return [3 /*break*/, 5];
                    case 4:
                        this.askCredentials();
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    EpiAuthCli.prototype.askCredentials = function () {
        return __awaiter(this, void 0, void 0, function () {
            var user, pass;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ask('Username: ')];
                    case 1:
                        user = _a.sent();
                        return [4 /*yield*/, this.ask('Password: ', true)];
                    case 2:
                        pass = _a.sent();
                        return [2 /*return*/, this.doLogin(user, pass)];
                }
            });
        });
    };
    EpiAuthCli.prototype.doLogin = function (user, pass) {
        var _this = this;
        this._rli.write("\n\nAttempting to login\u001B[36m " + user + "\u001B[0m, using provided password:");
        this._auth.login(user, pass).catch(function (e) {
            _this._rli.write("\u001B[31m\n\n !!! Login failed: " + e.message + " !!!\u001B[0m\n\n");
            _this._rli.close();
            process.exit(1);
        }).then(function (success) {
            _this._rli.write(' ' + (success ? '\x1b[32msuccess\x1b[0m' : '\x1b[31minvalid credentials or locked account\x1b[0m') + '\n\n.');
            _this._rli.close();
            process.exit(success ? 0 : 1);
        });
    };
    /**
     * Wrapper around the readline interface to provide a promises based method to ask
     * a question to the user.
     *
     * @protected
     * @param { string } question The question to be asked
     * @param { boolean } muted Whether or not the input must be muted
     * @returns { Promise<string> } The answer given by the user
     */
    EpiAuthCli.prototype.ask = function (question, muted) {
        var _this = this;
        if (muted === void 0) { muted = false; }
        return new Promise(function (resolve, reject) {
            _this._rli.question(question, function (answer) {
                _this._rli.stdoutMuted = false;
                resolve(answer);
            });
            _this._rli.stdoutMuted = muted ? true : false;
        });
    };
    return EpiAuthCli;
}());
var yargs_1 = __importDefault(require("yargs"));
var EpiEnvOptions_1 = __importDefault(require("../util/EpiEnvOptions"));
// Read the Command Line arguments
var epiEnvChoices = [EpiEnvOptions_1.default.Development, EpiEnvOptions_1.default.Integration, EpiEnvOptions_1.default.Preproduction, EpiEnvOptions_1.default.Production];
var defaultEnv = epiEnvChoices.indexOf(process.env.NODE_ENV || "", 0) >= 0 ? process.env.NODE_ENV || "" : 'development';
var args = yargs_1.default(process.argv.slice(2))
    .alias('e', ['environment', 'env'])
    .describe('e', 'The environment to run the authentication for (when using .env files)')
    .choices('e', ["development", "integration", "preproduction", "production"])
    .default('e', defaultEnv)
    .coerce('e', function (value) { return EpiEnvOptions_1.default.Parse(value); })
    .alias('d', ['domain'])
    .describe('d', 'The domain to authenticate against, overrides the value from .env files')
    .coerce('d', function (value) { if (!value)
    return undefined; try {
    return new url_1.URL(value);
}
catch (e) {
    throw new Error("The value \"" + value + "\" is not a valid URL");
} })
    .string('d')
    .alias('i', ['insecure', 'no-cert'])
    .describe('i', 'Remove all security implied by SSL/TLS by disabling certificate checking in Node.JS - only use when there\'s no alternative.')
    .boolean('i')
    .help("help")
    .argv;
// Query env for settings
var config = new Config_1.default(process.cwd(), {}, args.environment);
var epi_url = ((_a = args.domain) === null || _a === void 0 ? void 0 : _a.href) || config.getEpiserverURL();
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
