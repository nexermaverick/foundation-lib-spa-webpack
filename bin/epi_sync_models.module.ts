import * as fs from 'fs';
import * as path from 'path';
import { URL } from 'url';

// Import from Spa Core
import * as ContentDelivery from '@episerver/spa-core/cjs/Library/ContentDelivery';
import { String as StringUtils } from '@episerver/spa-core/cjs/Library/Services';

// Import from webpack
import GlobalConfig from '../util/Config';
import ClientAuthStorage from '../ContentDelivery/ClientAuthStorage';
import { type } from 'os';
import { string } from 'yargs';

// Definitions
export type TypeOverviewResponse = TypeDefinition[];
export type TypeDefinition = {
    Name: string,
    DisplayName: string,
    Description: string,
    GUID: string
}
export type TypeDefinitionData = TypeDefinition & {
    Properties: { 
        Name: string,
        DisplayName: string,
        Description: string,
        Type: string
    }[]
}

type internalAuthService = ContentDelivery.IAuthService & ContentDelivery.IAuthTokenProvider;
function isNetworkErrorResponse(toTest: unknown) : toTest is ContentDelivery.NetworkErrorData
{
    if (!toTest) return false;
    if (typeof(toTest) !== 'object') 
        return false;
    return (toTest as ContentDelivery.NetworkErrorData).error && (toTest as ContentDelivery.NetworkErrorData).contentType ? true : false;
}

/**
 * Episerver Model Synchronization Job
 */
export class EpiModelSync {
    protected _modelDir : Readonly<string> = 'src/Models/Episerver'
    protected _servicePath : Readonly<string> = 'api/episerver/v3/model'
    protected _rootDir : string
    protected _config : GlobalConfig
    protected _iContentProps : string[] = ["contentLink"]
    protected _api : ContentDelivery.IContentDeliveryAPI_V2;
    protected _auth : internalAuthService;

    /**
     * Create a new instance of the job
     * 
     * @param {string} spaDir      The directory where the SPA is located 
     * @param {string} envDir      The environment directory to use as configuration source, if different from the spaDir
     */
    public constructor(config: GlobalConfig) {
        this._config = config;
        this._rootDir = config.getRootDir();

        // Configure Episerver Connection
        const u = new URL(this._config.getEpiserverURL());
        this._api = new ContentDelivery.API_V2({
            BaseURL: u.href,
            Debug: false,
            EnableExtensions: true
        });
        this._auth = (new ContentDelivery.DefaultAuthService(this._api, ClientAuthStorage.CreateFromUrl(u))) as internalAuthService;
        this._api.TokenProvider = this._auth;
    }

    /**
     * Run the configuration job
     */
    public run(): void {
        console.log('***** Start: Episerver IContent Model Synchronization *****')
        console.log(' - Using Episerver installed at: ' + this._api.BaseURL);
        this._auth.currentUser().then(u => {
            if (u)
                console.log(` - Authenticated as ${ u }`)
            else 
                console.log(' - Using an unauthenticated connections')
        })
        console.log(' - Ensuring models directory exists ('+ this.getModelPath() +')');
        console.log(' - Retrieving content types')
        const me = this;
        this._doRequest<TypeOverviewResponse>(this.getServiceUrl()).then(r => {
            if (!r) return;
            const modelNames = r.map(x => x.Name);
            me.clearModels(modelNames.map(x => me.getModelInterfaceName(x)));
            console.log(' - Start creating/updating model definitions');
            r.forEach(model => me.createModelFile(model, modelNames));
            me.createAsyncTypeMapper(modelNames);
            me.createContentSchema(r);
        }).catch(reason => console.log(reason));
    }

    protected readonly iContentStdProps : { Name: string, DisplayName: string, Description: string, Type: string}[] = [
        {
            Name: "Name",
            DisplayName: "Name",
            Description: "",
            Type: "LongString"
        },{
            Name: "ContentLink",
            DisplayName: "Content Link",
            Description: "",
            Type: "ContentReference"
        },{
            Name: "ParentLink",
            DisplayName: "Parent reference",
            Description: "",
            Type: "ContentReference"
        }
    ]

    protected transformPropertyData(dataIn: { Name: string, DisplayName: string, Description: string, Type: string}): { name: string, sourceName: string, displayName: string, description: string, type: string }  
    {
        return {
            name: this.processFieldName(dataIn.Name),
            sourceName: dataIn.Name,
            displayName: dataIn.DisplayName || dataIn.Name,
            description: dataIn.Description,
            type: "Property"+dataIn.Type
        };
    }

    protected createContentSchema(modelList: TypeDefinition[]): void
    {
        console.log(' - Initializing Schema file generation');
        const schemaFile = path.join(this.getModelPath(), 'schema.json');
        const schema : {[name:string]:{id:string,name:string,displayName:string,description:string,properties:{[propertyName:string]:{name:string,sourceName:string,displayName:string,description:string,type:string}}}} = {};
        Promise.all(modelList.map(async model => {
            const modelSchema : {id:string,name:string,displayName:string,description:string,properties:{[propertyName:string]:{name:string,sourceName:string,displayName:string,description:string,type:string}}} = {
                id:          model.GUID,
                name:        model.Name,
                displayName: model.DisplayName || model.Name,
                description: model.Description,
                properties: {}
            }
            
            this.iContentStdProps.forEach(x => modelSchema.properties[this.processFieldName(x.Name)] = this.transformPropertyData(x));
            const modelInfo = await this._doRequest<TypeDefinitionData>(this.getServiceUrl(model.GUID));
            if (modelInfo) 
                modelInfo.Properties.forEach(propertyInfo => modelSchema.properties[this.processFieldName(propertyInfo.Name)] = this.transformPropertyData(propertyInfo));

            console.log(` - ${model.DisplayName || model.Name} added to schema`);
            return modelSchema
        })).then(modelSchemaList => {
            modelSchemaList.forEach(modelSchema => {
                if (!modelSchema) return;
                schema[modelSchema.name] = modelSchema;
            });
            fs.writeFile(schemaFile, JSON.stringify(schema, undefined, 4), () => {
                console.log(' - Schema written to ' + schemaFile);
            });
        });
    }

    /**
     * Generate a TypeMapper component which enables loading of the types from Episerver
     * 
     * @protected
     * @param {string[]} allItemNames The model names fetched from Episerver
     * @returns {void}
     */
    protected createAsyncTypeMapper(allItemNames: string[]): void {
        const mapperFile = path.join(this.getModelPath(), 'TypeMapper.ts');
        let mapper = "import { Taxonomy, Core, Loaders } from '@episerver/spa-core';\n";
        // allItemNames.forEach(x => mapper += "import {"+this.getModelInstanceName(x)+"} from './"+ this.getModelInterfaceName(x)+"';\n")
        mapper += "\nexport default class TypeMapper extends Loaders.BaseTypeMapper {\n";
        mapper += "  protected map : { [type: string]: Loaders.TypeInfo } = {\n";
        allItemNames.forEach(x => mapper += "    '" + x + "': {dataModel: '"+this.getModelInterfaceName(x)+"',instanceModel: '" + this.getModelInstanceName(x) + "'},\n");
        mapper += "  }\n";

        mapper += "  protected async doLoadType(typeInfo: Loaders.TypeInfo) : Promise<Taxonomy.IContentType> {\n";
        mapper += "    return import(\n";
        mapper += "    /* webpackInclude: /\\.ts$/ */\n";
        mapper += "    /* webpackExclude: /\\.noimport\\.ts$/ */\n";
        mapper += "    /* webpackChunkName: \"types\" */\n";
        mapper += "    /* webpackMode: \"lazy-once\" */\n";
        mapper += "    /* webpackPrefetch: true */\n";
        mapper += "    /* webpackPreload: false */\n";
        mapper += "    \"./\" + typeInfo.dataModel).then(exports => {\n";
        mapper += "      return exports[typeInfo.instanceModel];\n";
        mapper += "    }).catch(reason => {\n";
        mapper += "      if (Core.DefaultContext.isDebugActive()) {\n";
        mapper += "        console.error(`Error while importing ${typeInfo.instanceModel} from ${typeInfo.dataModel} due to:`, reason);\n";
        mapper += "      }\n";
        mapper += "      return null;\n";
        mapper += "    });\n";
        mapper += "  }\n";

        mapper += "}\n";

        fs.writeFile(mapperFile, mapper, () => {
            console.log(' - TypeMapper written to ' + mapperFile);
        });
    }

    /**
     * Create a model file for the specified type
     * 
     * @protected
     * @param {string}      typeName 
     * @param {string[]}    allItemNames
     * @param {void}
     */
    protected createModelFile(typeName: TypeDefinition, allItemNames: string[]) : void {
        // console.log('   - Fetching model definition for '+typeName);
        const me = this;
        this._doRequest<TypeDefinitionData>(this.getServiceUrl(typeName.GUID)).then(info => {
            if (!info) return;
            const interfaceName = me.getModelInterfaceName(info.Name);
            const propsInterfaceName = me.getComponentPropertiesInterfaceName(info.Name);
            const instanceName = me.getModelInstanceName(info.Name);
            const fileName = interfaceName + ".ts";

            // Imports
            let iface = "import { ContentDelivery, Taxonomy, ComponentTypes } from '@episerver/spa-core'\n";

            // Heading
            iface += "/**\n * "+(info.DisplayName ? info.DisplayName : info.Name)+"\n *\n * "+(info.Description ? info.Description : "No Description available.")+"\n *\n * @GUID "+info.GUID+"\n */\n";

            // Actual interface
            iface += "export default interface "+interfaceName+" extends Taxonomy.IContent {\n";
            info.Properties.forEach(prop => {
                const propName = me.processFieldName(prop.Name);
                if (!me._iContentProps.includes(propName)) {
                    iface += "    /**\n     * "+(prop.DisplayName ? prop.DisplayName : prop.Name)+"\n     *\n     * "+(prop.Description ? prop.Description : "No description available")+"\n     */\n";
                    iface += "    " + propName + ": " + me.ConvertTypeToSpaProperty(prop.Type, allItemNames) + "\n\n";

                    if (allItemNames.includes(prop.Type)) {
                        iface = "import " + prop.Type + "Data from './" + prop.Type + "Data'\n" +iface;
                    }
                }
            });
            iface += "}\n\n";

            // Convenience interface
            iface += "/**\n * Convenience interface for componentDidUpdate & componentDidMount methods.\n */\n";
            iface += "export interface " + propsInterfaceName + " extends ComponentTypes.AbstractComponentProps<"+interfaceName+"> {}\n\n";

            // Instance type
            iface += "export class " + instanceName + " extends Taxonomy.AbstractIContent<" + interfaceName + "> implements " + interfaceName + " {\n";
            iface += "    protected _typeName : string = \""+info.Name+"\";\n"
            iface += "    /**\n     * Map of all property types within this content type.\n     */\n"
            iface += "    protected _propertyMap : { [propName: string]: string } = {\n";
            info.Properties.forEach(prop => {
                const propName = me.processFieldName(prop.Name);
                iface += "        '"+propName+"': '"+prop.Type+"',\n"
            });
            iface += "    }\n\n"
            info.Properties.forEach(prop => {
                const propName = me.processFieldName(prop.Name);
                if (!me._iContentProps.includes(propName)) {
                    iface += "    /**\n     * "+(prop.DisplayName ? prop.DisplayName : prop.Name)+"\n     *\n     * "+(prop.Description ? prop.Description : "No description available")+"\n     */\n";
                    iface += `    public get ${propName}() : ${interfaceName}["${propName}"] { return this.getProperty("${propName}"); }\n\n`;
                }
            });
            iface += "}\n";

            // Write interface
            const fullTarget = path.join(me.getModelPath(), fileName);
            fs.writeFile(fullTarget, iface, () => {
                console.log(` - ${ typeName.DisplayName || typeName.Name } model definition written to ${ fullTarget }`);
            });
        });
    }

    /**
     * Convert the reported model type to a TypeScript type
     * 
     * @protected
     * @param {string}      typeName        The name of the type
     * @param {string[]}    allItemNames    The list of types in Episerver (for property blocks)
     * @returns {string}
     */
    protected ConvertTypeToSpaProperty(typeName: string, allItemNames: string[]) : string
    {
        switch (typeName) {
            case "Boolean":
                return "ContentDelivery.BooleanProperty";
            case "Decimal":
            case "Number":
            case "FloatNumber":
                return "ContentDelivery.NumberProperty";
            case "String":
            case "string":
            case "LongString":
            case "XhtmlString":
            case "Url":
                return "ContentDelivery.StringProperty";
            case "ContentReference":
            case "PageReference":
                return "ContentDelivery.ContentReferenceProperty";
            case "ContentReferenceList":
                return "ContentDelivery.ContentReferenceListProperty";
            case "ContentArea":
                return "ContentDelivery.ContentAreaProperty";
            case "LinkCollection":
                return "ContentDelivery.LinkListProperty";
            default:
                if (allItemNames.includes(typeName))
                    return typeName+"Data";
                return "ContentDelivery.Property<any> // Original type: "+typeName;
        }
    }

    /**
     * Remove all models from the models folder, except thos explicitly kept
     * 
     * @protected
     * @param {string[]} keep The model names to keep in the output folder
     */
    protected clearModels(keep: string[]) : void {
        console.log(' - Cleaning model directory');
        const modelPath = this.getModelPath();
        const files = fs.readdirSync(modelPath);
        files.forEach(file => {
            const name = path.parse(file).name;
            if (name !== "TypeMapper" && keep && !keep.includes(name)) {
                console.log('  - Removing old model: ', name)
                fs.unlinkSync(path.join(modelPath, file));
            }
        });
    }

    /**
     * Build the service path within Episerver to fetch the model
     * 
     * @protected
     * @param {string} modelName The name of the model
     * @returns {string}
     */
    protected getServiceUrl(modelName?: string): string {
        return this._servicePath + (modelName ? '/'+modelName : '');
    }

    /**
     * Get (and create if needed) the path where the models must be stored
     * 
     * @protected
     * @returns {string}
     */
    protected getModelPath(): string {
        const modelDir = this._config.getEnvVariable('EPI_MODEL_PATH', this._modelDir);
        if (!modelDir) {
            throw new Error('Episerver models directory not set');
        }
        const modelPath = path.join(this._rootDir, modelDir);
        if (!fs.existsSync(modelPath)) {
            fs.mkdirSync(modelPath, {"recursive": true});
        }
        return modelPath;
    }

    /**
     * Generate the TypeScript interface name
     * 
     * @protected
     * @param {string} modelName    The name of the model in Episerver
     * @returns {string}
     */
    protected getModelInterfaceName(modelName: string): string {
        return StringUtils.SafeModelName(modelName) + 'Data';
    }

    /**
     * Generate the TypeScript instance name
     * 
     * @protected
     * @param {string} modelName    The name of the model in Episerver
     * @returns {string}
     */
    protected getModelInstanceName(modelName: string): string {
        return StringUtils.SafeModelName(modelName) + 'Type';
    }

    /**
     * Generate the TypeScript interface name
     * 
     * @protected
     * @param {string} modelName    The name of the model in Episerver
     * @return {string}
     */
    protected getComponentPropertiesInterfaceName(modelName: string): string {
        return StringUtils.SafeModelName(modelName) + 'Props';
    }

    protected processFieldName(originalName : string) : string
    {
        let processedName = originalName;
        processedName = processedName.charAt(0).toLowerCase() + processedName.slice(1);
        return processedName;
    }

    protected _doRequest<T = any>(url: string) : Promise<T | null>
    {
        return this._api.raw<T>(url, { method: 'get' }, false)
            .then(r => isNetworkErrorResponse(r[0]) ? null : r[0])
            .catch(e => {
                console.error(`\n\n\x1b[31m  !!! Error while fetching ${ url }: ${ e?.message || e } !!!\x1b[0m`);
                return null;
            });
    }
}

export default EpiModelSync;