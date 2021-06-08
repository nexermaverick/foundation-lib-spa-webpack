/**
 * Webpack loader to emit empty resources, used to ignore SCSS file on Server
 * Side Rendering builds of the Episerver SPA
 *
 * @param   {string}  source    The source of the resource that must be loaded
 * @returns {string}            An empty string
 */
export declare const EmptyLoader: (source: string) => string;
export default EmptyLoader;
