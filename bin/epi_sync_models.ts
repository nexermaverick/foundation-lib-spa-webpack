#!/usr/bin/env node

/**
 * Main entry point for the epi-sync-models command, loads the context
 * and starts the script as ESNext Modules.
 */

// Import dependencies
import yargs from "yargs";
import GlobalConfig from "../util/Config";
import EpiEnvOptions, { EpiEnvOption } from "../util/EpiEnvOptions";
import * as CliApplication from "../util/CliArguments";
import * as syncModule from './epi_sync_models.module';

// Create context
const defaultEnv : EpiEnvOption = EpiEnvOptions.Parse(process.env.NODE_ENV || '', EpiEnvOptions.Development);
const args : yargs.Arguments<CliApplication.CliArgs> = CliApplication.Setup(yargs(process.argv.slice(2)), defaultEnv, "Episerver Command Line Model Synchronization")
        .argv;
const config : GlobalConfig =  CliApplication.CreateConfig(args);

// Execute
const sync = new syncModule.EpiModelSync(config)
sync.run();