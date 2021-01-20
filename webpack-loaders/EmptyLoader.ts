import loaderUtils from 'loader-utils';
import { validate as validateOptions } from 'schema-utils';
import { Schema } from 'schema-utils/declarations/validate';

/**
 * Webpack Empty loader configuration definition
 */
const schema : Schema = {
    type: 'object',
    properties: {
    }
};

/**
 * Webpack loader to emit empty resources, used to ignore SCSS file on Server
 * Side Rendering builds of the Episerver SPA
 * 
 * @param   {string}  source    The source of the resource that must be loaded
 * @returns {string}            An empty string
 */
export const EmptyLoader = (source: string) : string => {
    const options = loaderUtils.getOptions(this);
    if (options) {
        validateOptions(schema, options, { name: 'Empty loader'});
    }
    return '';
}
export default EmptyLoader;