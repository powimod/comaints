'use strict'
const userObjectDef = {
    "id" : {
        "type": "id",
        "mandatory": "true",
        "scope": "public"
    },
    "email" : {
        "type": "email",
        "minimum": "3",
        "maximum": "128",
        "mandatory": "true",
        "scope": "public"
    },
    "password" : {
        "type": "string",
        "minimum": "8",
        "maximum": "70",
        "mandatory": "true",
        "secret": "true",
        "scope": "public"
    },
    "firstname" : {
        "type": "string",
        "maximum": "30",
        "mandatory": "false",
        "scope": "public"
    },
    "lastname" : {
        "type": "string",
        "maximum": "30",
        "mandatory": "false",
        "scope": "public"
    },
    "accountLocked" : {
        "type": "boolean",
        "field": "account_locked",
        "default": "false",
        "mandatory": "true",
        "scope": "public"
    },
    "validationCode" : {
        "type": "integer",
        "field": "validation_code",
        "minimum": "0",
        "maximum": "99999",
        "default": "0",
        "mandatory": "false",
        "secret": "true",
        "scope": "public"
    },
    "active" : {
        "type": "boolean",
        "default": "true",
        "mandatory": "true",
        "scope": "public"
    },
    "lastUse" : {
        "type": "datetime",
        "field": "last_use",
        "mandatory": "false",
        "scope": "public"
    },
    "administrator" : {
        "type": "boolean",
        "default": "false",
        "mandatory": "true",
        "scope": "public"
    }, 
    "companyId" : {
        "type": "link",
        "target" : "Company",
        "field" : "id_company",
        "table" : "companies",
        "mandatory": "false"
    },
}

export default userObjectDef
