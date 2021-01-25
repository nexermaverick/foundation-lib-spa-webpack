/// <reference types="node" />
import yargs from 'yargs';
import { URL } from 'url';
import { EpiEnvOption } from './EpiEnvOptions';
import GlobalConfig from './Config';
import { DotenvParseOutput } from 'dotenv/types';
export declare type CliArgs = {
    e: EpiEnvOption;
    d: URL | undefined;
    i: boolean | undefined;
    env: CliArgs['e'];
    environment: CliArgs['e'];
    domain: CliArgs['d'];
    insecure: CliArgs['i'];
};
export declare const Setup: <T extends object = {}>(yargs: yargs.Argv<T>, defaultEnv?: EpiEnvOption) => yargs.Argv<T & CliArgs>;
export declare const CreateConfig: (cliArgs: yargs.Arguments<CliArgs>, overrides?: DotenvParseOutput) => GlobalConfig;
export default Setup;
