"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreLoadLoader = void 0;
var loader_utils_1 = __importDefault(require("loader-utils"));
var schema_utils_1 = require("schema-utils");
var glob_1 = __importDefault(require("glob"));
var path_1 = __importDefault(require("path"));
var schema = {
    type: 'object',
    properties: {
        pattern: {
            type: 'string'
        },
        extension: {
            type: 'string'
        }
    }
};
/**
 * Find and replace the @PreLoad annotation within a
 * TypeScript file to automatically create a pre-load
 * of normally dynamically loaded modules.
 *
 * @param   {string}    source  The source prepared by Webpack
 * @returns {string}    The source with the injected preloading code
 */
var PreLoadLoader = function (source) {
    var loaderContext = _this;
    var options = loader_utils_1.default.getOptions(loaderContext);
    schema_utils_1.validate(schema, options, { name: 'PreLoad loader' });
    var test = /\@PreLoad\("(.*)"\,"(.*)"\,"(.*)"\)/;
    var matches = source.match(test);
    if (matches) {
        console.log("Found @PreLoad annotation in: " + (loaderContext === null || loaderContext === void 0 ? void 0 : loaderContext.resourcePath));
        //Context
        var toReplace = matches[0];
        var component_path = matches[1];
        var variable_1 = matches[2];
        var component_prefix_1 = matches[3];
        var component_dir_1 = path_1.default.resolve(loaderContext.context, component_path);
        var files = glob_1.default.sync(component_dir_1 + "/" + options.pattern);
        //Debug
        console.log("  - Search pattern: " + component_dir_1 + "/" + options.pattern);
        console.log("  - Variable: " + variable_1);
        console.log("  - Component prefix: " + component_prefix_1);
        //Start building script
        var script_1 = [];
        var script_end_1 = [];
        if (!variable_1.includes('.')) { // Declare the global variable if there's no scope provided
            console.log("  - Injecting TypeScript variable declaration");
            script_1.push("declare var " + variable_1 + ": any;");
        }
        script_1.push("try { " + variable_1 + " = " + variable_1 + " || {}; } catch (e) { " + variable_1 + " = {}; }\n");
        //Handle components
        files.forEach((function (file) {
            // 1. Get the name of the module from the file
            var module_name = path_1.default.basename(file, options.extension);
            // 2. Get the path of the module, relative to the starting point (making sure we use a forward slash as delimiter)
            var module_path = path_1.default.relative(component_dir_1, path_1.default.dirname(file)).replace(/[\\]/gi, "/");
            // 3. Build the full import path used to import the module
            var module_import = component_prefix_1 + (module_path ? module_path + "/" : "") + module_name;
            // 4. Create the variable name
            var module_varname = module_path.replace(/[\/]/gi, "") + module_name;
            // 5. Push the needed lines of code
            script_1.push("import " + module_varname + " from '" + module_import + "';");
            script_end_1.push(variable_1 + "[\"" + module_import + "\"] = " + module_varname + ";");
        }).bind(_this));
        var inject = [
            "// Start: Injected PreLoad script",
            script_1.join("\n"),
            script_end_1.join("\n"),
            "// End: Injected PreLoad script"
        ].join("\n") + "\n";
        var newSource = source.replace(toReplace, inject);
        console.log("  - Injected " + files.length + " modules into " + variable_1 + "\n");
        return newSource;
    }
    return source;
};
exports.PreLoadLoader = PreLoadLoader;
exports.default = exports.PreLoadLoader;
