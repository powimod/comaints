'use strict'
const tokenObjectDef = {
	"id" : {
		"type": "id",
		"mandatory": "true",
	},
	"expiresAt" : {
		"type": "datetime",
		"field": "expires_at",
		"mandatory": "true",
	}, 
	"userId" : {
		"type": "link",
		"target" : "User",
		"field" : "id_user",
		"table" : "users"
	},
}

export default tokenObjectDef
