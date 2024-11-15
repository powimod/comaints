'use strict'
const unitObjectDef = {
    "id" : {
        "type": "id",
        "mandatory": "true",
        "scope": "public"
    },
    "name" : {
        "type": "string",
        "minimum": "2",
        "maximum": "32",
        "mandatory": "true",
        "scope": "public"
    },
    "description" : {
        "type": "string",
        "mandatory": "false",
        "scope": "public"
    },
    "address" : {
        "type": "text",
        "maximum": "128",
        "default": "",
        "mandatory": "true",
        "scope": "public"
    },
    "city" : {
        "type": "text",
        "maximum": "64",
        "default": "",
        "mandatory": "true",
        "scope": "public"
    },
    "zipCode" : {
        "type": "text",
        "field": "zip_code",
        "maximum": "16",
        "default": "",
        "mandatory": "true",
        "scope": "public"
    },
    "country" : {
        "type": "text",
        "maximum": "32",
        "default": "",
        "mandatory": "true",
        "scope": "public"
    }, 
    "companyId" : {
        "type": "link",
        "target" : "Company",
        "field" : "id_company",
        "table" : "companies",
        "mandatory": "true",
        "scope": "public"
    },
}

export default unitObjectDef
