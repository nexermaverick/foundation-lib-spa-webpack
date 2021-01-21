"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EpiEnvOptions = void 0;
var EpiEnvOptions = /** @class */ (function () {
    function EpiEnvOptions() {
    }
    /**
     * Convert a string to one of the constants of this class.
     *
     * @param   { string }  strValue
     * @returns { EpiEnvOptions | undefined }
     */
    EpiEnvOptions.Parse = function (strValue) {
        var output;
        switch (strValue.toLowerCase()) {
            case 'development':
            case 'dev':
                output = EpiEnvOptions.Development;
                break;
            case 'integration':
            case 'int':
                output = EpiEnvOptions.Integration;
                break;
            case 'preproduction':
            case 'prep':
                output = EpiEnvOptions.Preproduction;
                break;
            case 'production':
            case 'prod':
                output = EpiEnvOptions.Production;
                break;
        }
        return output;
    };
    EpiEnvOptions.Development = "development";
    EpiEnvOptions.Integration = "integration";
    EpiEnvOptions.Preproduction = "preproduction";
    EpiEnvOptions.Production = "production";
    return EpiEnvOptions;
}());
exports.EpiEnvOptions = EpiEnvOptions;
exports.default = EpiEnvOptions;
