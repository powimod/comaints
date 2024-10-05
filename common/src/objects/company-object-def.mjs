'use strict'
const companyObjectDef = {
    "id" : {
        "type": "id",
        "mandatory": "true",
    },
    "name" : {
        "type": "string",
        "minimum": "2",
        "maximum": "128",
        "mandatory": "true",
    }, 
    "managerId" : {
        "type": "link",
        "target" : "User",
        "field" : "id_manager",
        "table" : "users",
        "mandatory": "false"
    },
}

export default companyObjectDef
