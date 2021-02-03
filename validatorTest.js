"use strict";
const util = require("util");
const ZSchema = require("z-schema");
const { openapi } = require("openapi-schemas");
const yaml = require("js-yaml");
const fs = require('fs');
const path = require("path");
const validator1 = require("./zschemaValidator.js")
const SwaggerParser = require("swagger-parser");

const apiFile = "./definitions/swagger.yaml"
const isConfig = false;

async function validate (apiFile, isConfig) {
    console.log("inside Function");
    if (!(fs.existsSync(apiFile, 'utf8'))) {
        throw Error(`api spec doc file does not exist: ${apiFile}`)
    }
    let apiJSON;
    let schema = undefined;
    if(isConfig){
        apiJSON = SwaggerParser.YAML.parse(fs.readFileSync(apiFile, 'utf8'));

        const schemaObject = fs.readFileSync(path.resolve(__dirname, '../schemas/OAS_Config.yaml'), 'utf8');
        schema = SwaggerParser.YAML.parse(schemaObject);
    } else {
        try {
            //apiJSON = await parser(apiFile);
            apiJSON = await SwaggerParser.parse(apiFile);
            console.log("API name: %s, Version: %s, Type: %s", apiJSON.info.title, apiJSON.info.version, (apiJSON.openapi ? `openapi ${apiJSON.openapi}` : 'swagger 2.0' ));
        } catch (e) {
            console.log(e);
        }
    }
const a =  validator1(apiJSON, null);
console.log("updated"+ a);
if(a){
   const result =  JSON.stringify({"validated": `${a}`,
    "DODItem": "OpenAPISchemaValidation",
    "API name": apiJSON.info.title,
    "squad": "undefined",
    "commitID": "commitID"

    } )
    console.log(result);
}
}

 console. log(validate(apiFile, false));
