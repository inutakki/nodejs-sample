"use strict";
const util = require("util");
const ZSchema = require("z-schema");
const { openapi } = require("openapi-schemas");
const yaml = require("js-yaml");
const fs = require('fs');
const path = require("path");


module.exports = validateSchema;
let zSchema = initializeZSchema();

/**
 * extends the standard spec doc schema with KP's own special x- vendor tags
 * @param standardSchema
 * @returns {extendedSchema}
 */
function extendStandardSchema(standardSchema){
    let KPOASExtension = yaml.safeLoad(fs.readFileSync(path.resolve(__dirname, '../../schemas/KPOASExtension.yaml'), 'utf8'));

    //Append custom KP policy definitions
    Object.assign(standardSchema.definitions, KPOASExtension.definitions);
    //Apend x-custom-sharedflows schema to top-level schema properties
    Object.assign(standardSchema.properties, KPOASExtension.properties);
    //Overwrite top-level "x-" pattern to ignore exact string: x-custom-sharedflows. This allows schema validation of this custom variable.
    standardSchema.patternProperties = KPOASExtension.patternProperties;

    return standardSchema
}

/**
 * Validates the given Swagger API against the OpenApi 3.0.0 schema.
 *
 * @param {SwaggerObject} api
 */
function validateSchema (api, customSchema) {
    // Choose the appropriate schema (Swagger or OpenAPI or Custom)
    console.log("inside ZschemaValidator with ValidateSchema");
    let schema;
    if(api) {
        schema = api.swagger ? openapi.v2 : openapi.v3;
    } else {
        throw('invalid or missing api object input to schema validator')
    }
    //schema = customSchema ? customSchema : extendStandardSchema(schema); // use own schema or take in a different schema

    let tempAPI = JSON.parse(JSON.stringify(api));
    console.log("tempAPi" + tempAPI);
    // Validate against the schema
    let isValid = zSchema.validate(tempAPI, schema);
    if (!isValid) {
        let err = zSchema.getLastError();
        throw (`${err}\n` + formatZSchemaError(err.details));
    } else {
        return true
    }
}
/**
 * Performs one-time initialization logic to prepare for Swagger Schema validation.
 */
function initializeZSchema () {
// HACK: Delete the OpenAPI schema IDs because ZSchema can't resolve them
    delete openapi.v2.id;
    delete openapi.v3.id;
    // The OpenAPI 3.0 schema uses "uri-reference" formats.
    // Assume that any non-whitespace string is valid.
    //TODO: fix this so uri-reference is of uri format like http(s)://
    ZSchema.registerFormat("uri-reference", (value) => {
        return value.trim().length >= 0
    });

    // Configure ZSchema
    return new ZSchema({
        breakOnFirstError: true,
        noExtraKeywords: true,
        ignoreUnknownFormats: false,
        reportPathAsArray: true
    });
}
/**
 * Z-Schema validation errors are a nested tree structure.
 * This function crawls that tree and builds an error message string.
 *
 * @param {object[]} errors - The Z-Schema error details
 * @param {string} [indent] - The whitespace used to indent the error message
 * @returns {string}
 */
function formatZSchemaError (errors, indent) {
    indent = indent || " ";
    let message = "";
    for (let error of errors) {
        message += util.format(`${indent}${error.message} at #/${error.path.join("/")}\n`);
        if (error.inner) {
            message += formatZSchemaError(error.inner, indent + " ");
        }
    }
    return message;
}
