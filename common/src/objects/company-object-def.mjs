'use strict'
const companyObjectDef = {
    "id" : {
        "type": "id",
        "mandatory": "true",
        "scope": "public"
    },
    "name" : {
        "type": "string",
        "minimum": "2",
        "maximum": "128",
        "mandatory": "true",
        "scope": "public"
    }, 
    "managerId" : {
        "type": "link",
        "target" : "User",
        "field" : "id_manager",
        "table" : "users",
        "mandatory": "false",
        "scope": "public"
    },
}

export default companyObjectDef
