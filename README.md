![Episerver](https://ux.episerver.com/images/logo.png)
# Foundation SPA React: Webpack add-ons  <!-- omit in toc -->
This library contains the Webpack add-ons to build, bundle and distribute an Episerver Foundation React based SPA. For a full example project based upon this library head over to [Foundation Spa React](https://github.com/episerver/Foundation-spa-react).

You can request a demo of the project by one of our Episerver experts on [Get a demo](https://www.episerver.com/get-a-demo/).

[![License](https://img.shields.io/:license-apache-blue.svg?style=flat-square)](http://www.apache.org/licenses/LICENSE-2.0.html)
***

## Table of Contents  <!-- omit in toc -->
- [1. Introduction](#1-introduction)
- [2. Installation](#2-installation)
- [3. Environment configuration](#3-environment-configuration)
  - [Example usage](#example-usage)

***

## 1. Introduction 
To create an optimized build of the Episerver React based SPA, a number of steps need to be automated by Webpack. Not all these steps are easily possible with existing add-ons. The missing ones are added through this librariy

## 2. Installation
```
npm install --save-dev git+https://github.com/episerver/foundation-lib-spa-webpack.git
```

## 3. Environment configuration
This library provides a configuration helper, which enables you to use a .env
file to ensure no environment specific values (paths, credentials, etc..) are
committed to your source control system of choice. Do include a .env.dist file
with sane defaults for your project.

Both the .js and .d.ts file contain the inline documentation needed to use the
class.

### Example usage

Use inside the Webpack config file to build an .env based build (for example: `webpack.config.js`):
```javascript
const GlobalConfig = require('@episerver/webpack/Config');

module.exports = (env) => {
    //Prepare configuration
    /** @type {GlobalConfig} */
    const config = new GlobalConfig(__dirname, env);
    
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