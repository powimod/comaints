'use strict'
const userObjectDef = {
	"id" : {
		"type": "id",
		"mandatory": "true",
	},
	"email" : {
		"type": "email",
		"minimum": "3",
		"maximum": "128",
		"mandatory": "true",
	},
	"password" : {
		"type": "string",
		"minimum": "8",
		"maximum": "70",
		"mandatory": "true",
		"secret": "true",
	},
	"firstname" : {
		"type": "string",
		"maximum": "30",
		"mandatory": "true",
	},
	"lastname" : {
		"type": "string",
		"maximum": "30",
		"mandatory": "true",
	},
	"accountLocked" : {
		"type": "boolean",
		"field": "account_locked",
		"default": "false",
		"mandatory": "true",
	},
	"validationCode" : {
		"type": "integer",
		"field": "validation_code",
		"minimum": "0",
		"maximum": "99999",
		"default": "0",
		"mandatory": "false",
	},
	"active" : {
		"type": "boolean",
		"default": "true",
		"mandatory": "true",
	},
	"lastUse" : {
		"type": "datetime",
		"field": "last_use",
		"mandatory": "false",
	},
	"administrator" : {
		"type": "boolean",
		"default": "false",
		"mandatory": "true",
	}, 
	"companyId" : {
		"type": "link",
		"target" : "Company",
		"field" : "id_company",
		"table" : "companies"
	},
}

export default userObjectDef
