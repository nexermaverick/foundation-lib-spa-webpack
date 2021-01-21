export declare class EpiEnvOptions {
    static Development: Readonly<EpiEnvOption>;
    static Integration: Readonly<EpiEnvOption>;
    static Preproduction: Readonly<EpiEnvOption>;
    static Production: Readonly<EpiEnvOption>;
    /**
     * Convert a string to one of the constants of this class.
     *
     * @param   { string }  strValue
     * @returns { EpiEnvOptions | undefined }
     */
    static Parse(strValue: string): Readonly<EpiEnvOption | undefined>;
}
export declare type EpiEnvOption = "development" | "integration" | "preproduction" | "production";
export default EpiEnvOptions;
