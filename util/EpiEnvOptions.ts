export class EpiEnvOptions {
    public static Development   : Readonly<EpiEnvOption> = "development";
    public static Integration   : Readonly<EpiEnvOption> = "integration";
    public static Preproduction : Readonly<EpiEnvOption> = "preproduction";
    public static Production    : Readonly<EpiEnvOption> = "production";

    /**
     * Convert a string to one of the constants of this class.
     * 
     * @param   { string }  strValue 
     * @returns { EpiEnvOptions | undefined }
     */
    public static Parse (strValue: string) : Readonly<EpiEnvOption | undefined>
    {
        let output : EpiEnvOption | undefined;
        switch(strValue.toLowerCase())
        {
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
    }
}
export type EpiEnvOption = "development" | "integration" | "preproduction" | "production"
export default EpiEnvOptions;