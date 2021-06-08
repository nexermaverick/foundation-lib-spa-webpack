import { OptionObject } from 'loader-utils';
export declare type PreLoadConfig = OptionObject & {
    pattern: string;
    extension: string;
    exclude?: string;
};
/**
 * Find and replace the @PreLoad annotation within a
 * TypeScript file to automatically create a pre-load
 * of normally dynamically loaded modules.
 *
 * @param   {string}    source  The source prepared by Webpack
 * @returns {string}    The source with the injected preloading code
 */
export declare function PreLoadLoader(source: string): string;
export default PreLoadLoader;
