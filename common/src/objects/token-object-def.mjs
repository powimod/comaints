'use strict'
const tokenObjectDef = {
    "id" : {
        "type": "id",
        "mandatory": "true",
        "scope": "public"
    },
    "expiresAt" : {
        "type": "datetime",
        "field": "expires_at",
        "mandatory": "true",
        "scope": "public"
    }, 
    "userId" : {
        "type": "link",
        "target" : "User",
        "field" : "id_user",
        "table" : "users",
        "mandatory": "true"
    },
}

export default tokenObjectDef
