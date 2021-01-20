"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmptyLoader = void 0;
var loader_utils_1 = __importDefault(require("loader-utils"));
var schema_utils_1 = require("schema-utils");
/**
 * Webpack Empty loader configuration definition
 */
var schema = {
    type: 'object',
    properties: {}
};
/**
 * Webpack loader to emit empty resources, used to ignore SCSS file on Server
 * Side Rendering builds of the Episerver SPA
 *
 * @param   {string}  source    The source of the resource that must be loaded
 * @returns {string}            An empty string
 */
var EmptyLoader = function (source) {
    var options = loader_utils_1.default.getOptions(_this);
    if (options) {
        schema_utils_1.validate(schema, options, { name: 'Empty loader' });
    }
    return '';
};
exports.EmptyLoader = EmptyLoader;
exports.default = exports.EmptyLoader;