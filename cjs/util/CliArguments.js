"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateConfig = exports.Setup = void 0;
const url_1 = require("url");
const EpiEnvOptions_1 = __importDefault(require("./EpiEnvOptions"));
const Config_1 = __importDefault(require("./Config"));
const Setup = (yargs, defaultEnv = EpiEnvOptions_1.default.Development) => {
    const envChoices = ['development', 'integration', 'preproduction', 'production'];
    const cfg = yargs
        .alias('e', ['env', 'environment'])
        .describe('e', 'The environment to run the authentication for (when using .env files)')
        .default('e', defaultEnv)
        .coerce('e', v => EpiEnvOptions_1.default.Parse(v, defaultEnv))
        .choices('e', envChoices)
        .alias('d', 'domain')
        .describe('d', 'The domain to authenticate against, overrides the value from .env files')
        .coerce('d', (value) => { if (!value)
        return undefined; try {
        return new url_1.URL(value);
    }
    catch (e) {
        throw new Error(`The value "${value}" is not a valid URL`);
    } })
        .string('d')
        .alias('i', 'insecure')
        .describe('i', 'Remove all security implied by SSL/TLS by disabling certificate checking in Node.JS - only use when there\'s no alternative.')
        .boolean('i');
    return cfg;
};
exports.Setup = Setup;
const CreateConfig = (args, overrides = {}) => {
    // Query env for settings
    const config = new Config_1.default(process.cwd(), overrides, args.environment);
    if (args.domain)
        config.override('EPI_URL', args.domain.href);
    // Disable SSL/TLS security if configured to do so
    if (args.insecure === true) {
        console.warn('\n\x1b[31mDisabled certificate checking, this breaks identity verification of the server!\x1b[0m\n');
        config.override('NODE_TLS_REJECT_UNAUTHORIZED', '0');
    }
    // Return
    return config;
};
exports.CreateConfig = CreateConfig;
exports.default = exports.Setup;
