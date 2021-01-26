![Episerver](https://ux.episerver.com/images/logo.png)
# Foundation SPA React: Webpack add-ons  <!-- omit in toc -->
This library contains the Webpack add-ons to build, bundle and distribute an Episerver Foundation React based SPA. For a full example project based upon this library head over to [Foundation Spa React](https://github.com/episerver/Foundation-spa-react).

You can request a demo of the project by one of our Episerver experts on [Get a demo](https://www.episerver.com/get-a-demo/).

[![License](https://img.shields.io/:license-apache-blue.svg?style=flat-square)](http://www.apache.org/licenses/LICENSE-2.0.html)
***

## Table of Contents  <!-- omit in toc -->
- [1. Introduction](#1-introduction)
- [2. Installation](#2-installation)
- [3. Utitilty commands](#3-utitilty-commands)
- [4. Environment configuration](#4-environment-configuration)
  - [Supported environment variables](#supported-environment-variables)
- [5. Example usage](#5-example-usage)

***

## 1. Introduction 
To create an optimized build of the Episerver React based SPA, a number of steps need to be automated by Webpack. Not all these steps are easily possible with existing add-ons. The missing ones are added through this librariy

## 2. Installation
```
npm install --save-dev git+https://github.com/episerver/foundation-lib-spa-webpack.git
```

## 3. Utitilty commands
When installed into a project, this library makes the following commands available:

| Command | Purpose | Assumptions |
| --- | --- | --- |
| `npx epi-auth` | Login against the selected Episerver Instance and store the authentication on disk | The Episerver Content Delivery API, OAuth Service has been configured and is working. |
| `npx epi-sync-models` | Create local - typescript (*.ts) - definitions of the IContent types registered in the Episerver Instance. | The ContentDelivery project from Foundation-Spa-React has been installed in your project. |

All commands share the same CLI Parameters:
| Parameter | short | Purpose |
| --- | :---: | --- |
| `--environment` | -e | Define the environment name, as used by the configuration loader. |
| `--domain` | -d | Override the Episerver Domain from the configuration with the one specified here. |
| `--insecure` | -i | Disable certificate checking, usefull when working on localhost without a valid certificate chain |
| `--version` | | Check the currently installed version of this library |
| `--help` | | Display this help information on the CLI |

## 4. Environment configuration
This library provides a configuration helper, which enables you to use a .env
file to ensure no environment specific values (paths, credentials, etc..) are
committed to your source control system of choice. Do include a .env.dist file
with sane defaults for your project. 

When working with multiple environments, the library supports the following setup using various .env files.

| File  | Purpose |
| :--- | :--- |
| `.env.dist` | Distributed template to create specific .env files
| `.env` | Main environment file loaded for all build types |
| `.env.local` | Local overrides of the .env file |
| `.env.${env-name}.local` | Local overrides for a specific environment |

### Supported environment variables
The following environment variables are supported by the main configuration helper.

| Variable | Purpose | Example | Function(s) |
| :--- | :--- | :--- | :--- |
| `EPI_ENV` | The currently targeted build environment | development | getEpiEnvironment() |
| `EPI_URL` | The location where Episerver is running | https://www.example.com | getEpiserverURL() |
| `PUBLIC_URL` | The location where the SPA will be running | https://www.example.com | getPublicUrl() |
| `SERVER_PATH` | The path within the project where the server-side rendering code resides | server | getServerPath() <br/> getServerDir()
| `SRC_PATH` | The path within the project where the main browser side code resides | src | getSourcePath() <br/> getSourceDir()
| `EPI_DEPLOY_PATH` | The service endpoint to send the deployment to | /api/episerver/v3/deploy | ... |
| `EPI_PATH` | The (relative) path from the main project folder to the main Episerver web project | ../Foundation | getEpiPath() |
| `EPI_FORMS_PATH` | The (relative) path from EPI_PATH to the location where the Episerver Forms scripts are located | Scripts/EPiServer.ContentApi.Forms/ | getEpiserverFormsDir() |
| `EPI_FORMS_INCLUDE` | Flag to indicate if the Episerver Forms module must be made available in the SPA | 0 | isEpiserverFormsEnabled() |

## 5. Example usage

Use inside the Webpack config file to build an .env based build (for example: `webpack.config.js`):
```javascript
const EpiWebpack = require('@episerver/webpack');

module.exports = (env) => {
    //Prepare configuration
    const epiEnv = env.EPI_ENV || process.env.EPI_ENV;
    const config = new EpiWebpack.Config(__dirname, env, epiEnv);
    
    //Only excerpt shown to illustrate working principle
    return {
        devServer: {
            port: config.getEnvVariable("DEV_PORT", "9000")
        },
        output: {
			publicPath: config.getWebPath()
        }
    }
}
```