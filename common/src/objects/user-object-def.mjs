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
    "authAction" : {
        "type": "string",
        "field": "auth_action",
        "maximum": "16",
        "mandatory": "false",
        "scope": "protected"
    },
    "authData" : {
        "type": "string",
        "field": "auth_data",
        "mandatory": "false",
        "scope": "protected"
    },
    "authCode" : {
        "type": "integer",
        "field": "auth_code",
        "minimum": "0",
        "maximum": "99999",
        "default": "0",
        "mandatory": "false",
        "scope": "private"
    },
    "authExpiration" : {
        "type": "datetime",
        "field": "auth_expiration",
        "mandatory": "false",
        "scope": "protected"
    },
    "authAttempts" : {
        "type": "integer",
        "field": "auth_attempts",
        "default": "0",
        "mandatory": "false",
        "scope": "protected"
    }, 
    "companyId" : {
        "type": "link",
        "target" : "Company",
        "field" : "id_company",
        "table" : "companies",
        "mandatory": "false",
        "scope": "public"
    },
}

export default userObjectDef
