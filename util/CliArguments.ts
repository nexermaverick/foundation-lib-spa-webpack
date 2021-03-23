import yargs from 'yargs';
import { URL } from 'url';
import EpiEnvOptions, { EpiEnvOption } from './EpiEnvOptions';
import GlobalConfig from './Config';
import { DotenvParseOutput } from 'dotenv/types';

export type CliArgs = {
    e : EpiEnvOption
    d: URL | undefined
    i : boolean | undefined
    env : CliArgs['e']
    environment : CliArgs['e']
    domain : CliArgs['d']
    insecure : CliArgs['i']
}

type ConfigureCallback<T extends object = {}> = (yargs : yargs.Argv<T>) => void;
type SetupFunction = <T extends object = {}>(yargs: yargs.Argv<{}>, defaultEnv ?: EpiEnvOption, name ?: string, config?: ConfigureCallback<T & CliArgs> ) => yargs.Argv<T & CliArgs>

export const Setup : SetupFunction = 
<T extends object = {}>(yargs: yargs.Argv<{}>, defaultEnv : EpiEnvOption = EpiEnvOptions.Development, name ?: string, config?: ConfigureCallback<T & CliArgs>) : yargs.Argv<T & CliArgs> =>
{
    const envChoices : EpiEnvOption[] = ['development','integration','preproduction','production']
    const cfg = yargs
        .alias('e', ['env', 'environment'])
        .describe('e', 'The environment to run the authentication for (when using .env files)')
        .default('e', defaultEnv)
        .coerce('e', v => EpiEnvOptions.Parse(v, defaultEnv))
        .choices('e', envChoices)
        .alias('d', 'domain')
        .describe('d', 'The domain to authenticate against, overrides the value from .env files')
        .coerce('d', (value) => { if (!value) return undefined; try { return new URL(value); } catch (e) { throw new Error(`The value "${value}" is not a valid URL`); }})
        .string('d')
        .alias('i', 'insecure')
        .describe('i', 'Remove all security implied by SSL/TLS by disabling certificate checking in Node.JS - only use when there\'s no alternative.')
        .boolean('i')
        .help('help')
        .group(['d','i','e'], 'Optimizely DXP settings')
        .epilogue(name || "") as yargs.Argv<T & CliArgs>

    if (config) config(cfg);
    return cfg;
}

export const CreateConfig : (cliArgs : yargs.Arguments<CliArgs>, overrides ?: DotenvParseOutput) => GlobalConfig = (args, overrides = {}) =>
{
    // Query env for settings
    const config : GlobalConfig = new GlobalConfig(process.cwd(), overrides, args.environment);
    if (args.domain)
        config.override('EPI_URL', args.domain.href);

    // Disable SSL/TLS security if configured to do so
    if (args.insecure === true) {
        console.warn('\n\x1b[31mDisabled certificate checking, this breaks identity verification of the server!\x1b[0m\n')
        config.override('NODE_TLS_REJECT_UNAUTHORIZED', '0');
    }

    // Return
    return config;
}

export default Setup;