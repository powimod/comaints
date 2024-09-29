'use strict'


/**
 * Control each properties of the object passed as argument according to the object definition passed as the objDef parameter.
 * Returns false if no error was detected, otherwise a message explaining the encountred error for the first property which
 * do not respect its contraints in object definition.
 *
 * @function
 * @param {Object} objDef - object containing definition of each properties of the object.
 * @param {Object} object - object to control.
 * @param {Object} options
 * @param {boolean} [options.fullCheck=true] - indicates if all properties must be present or not.
 * @param {boolean} [options.controlId=true] - indicates if object ID property should be controlled or not
 *                  (useful with a newly created object for which the ID is not yet valued).
 * @param {function} - I18next function called to translate the error message ID into a translated string
 *                  (if this function is null the error string ID will be return).
 * @returns {boolean} - returns false if all properties are correct (never return true)
 * @returns {string} - returns a error message for the first property does not respect its definition in objectDef.
 *
 * @example
 *	const myUser = {
 *		email = 'a@b.c',
 *		firstname = 'John',
 *		// ...
 *	}
 *	const errorMessage = objectUtil.controlObject(userDef, myUser, true, true, t)
 *	if (errorMessage)
 *		throw new Error(errorMessage)
 *
 */
const controlObject = (objDef, object, options) => {
    const fullCheck = options.fullCheck ?? true
    const controlId =  options.controlId ?? true
	if (objDef === undefined)
		throw new Error('objDef argument is missing')
	if (typeof(objDef) != 'object')
		throw new Error('objDef argument is not an object')
	if (object === undefined)
		throw new Error('object argument is missing')
	if (typeof(object) != 'object')
		throw new Error('object argument is not an object')

	if (typeof(fullCheck) != 'boolean')
		throw new Error('fullCheck argument is not an boolean')
	if (typeof(controlId) != 'boolean')
		throw new Error('controlId argument is not an boolean')

	for (const [propName, propDef] of Object.entries(objDef)) {
		if (propDef.type === 'id' && controlId === false)
			continue
		const propValue = object[propName]
		if (propValue === undefined || propValue === null) {
			if (fullCheck && objDef.mandatory)
				return `Property ${propName} is not defined` // TODO i18n
		}
		else {
			const error = controlObjectProperty (objDef, propName, object[propName])
			if (error)
				return error

		}
	}
	return false // no error
}

/**
 * Control an object property according to the object definition passed as the objDef parameter.
 * The property name and its value are passed as argument.
 * Returns false if the property value is OK, otherwise returns a message explaining what constraint was violated.
 *
 * @function
 * @param {Object} objDef - object definition containing the property to control.
 * @param {string} propName - name of the property to control (will be searched in object definition).
 * @param {variant} propValue - the value of the property.
 * @param {function} - I18next function called to translate the error message ID into a translated string
 *                  (if this function is null the error string ID will be return).
 * @returns {boolean} - returns false if all properties are correct (never return true)
 * @returns {string} - returns a error message with the violated constraint.
 *
 * @example
 *	const errorMessage = objectUtil.controlProperty(userDef, 'password', myPassword, t)
 *	if (errorMessage)
 *		throw new Error(errorMessage)
 *
 */
const controlObjectProperty = (objDef, propName, propValue) => {
	if (objDef === undefined)
		throw new Error('objDef argument is missing')
	if (typeof(objDef) != 'object')
		throw new Error('objDef argument is not an object')
	if (propName === undefined)
		throw new Error('propName argument is missing')
	if (typeof(propName) != 'string')
		throw new Error('propName argument is not a string')
	const propDef = objDef[propName]
	if (propDef === undefined)
		throw new Error(`Invalid property name [${propName}]`)

	if (propValue === undefined)
		return `Property «${propName}» is not defined`

	if (propValue === null) {
		if (propDef.mandatory)
		    return `Property «${propName}» can not be null`
		else
			return null
	}

	if (propDef.secret)
        throw new Error(`Replace «secret» property with «secret» type`)
	
	switch (propDef.type) {

		case 'id':
		case 'link':
			if (typeof(propValue) !== 'number' )
		        return `Property «${propName}» is not a integer`
			return false // no error

		case 'integer':
			if (typeof(propValue) !== 'number' )
		        return `Property «${propName}» is not a integer`
			if (propDef.minimum && propValue < propDef.minimum )
		        return `Property «${propName}» is too small (minimum ${propDef.minimum})`
			if (propDef.maximum && propValue > propDef.maximum )
		        return `Property «${propName}» is too large (minimum ${propDef.maximum})`
			return false // no error

		case 'string':
		case 'text':
		case 'image':
			if (typeof(propValue) !== 'string' )
		        return `Property «${propName}» is not a string`
			if (propDef.minimum && propValue.length < propDef.minimum )
		        return `Property «${propName}» is too short (minimum ${propDef.minimum})`
			if (propDef.maximum && propValue.length > propDef.maximum )
		        return `Property «${propName}» is too long (minimum ${propDef.maximum})`
			if (propDef.type !== 'text' && propValue.includes('\n'))
		        return `Property «${propName}» can not contain line feed characters`
			return false // no error

		case 'email':
			if (typeof(propValue) !== 'string' )
		        return `Property «${propName}» is not a string`
			if (propDef.minimum && propValue.length < propDef.minimum )
		        return `Property «${propName}» is too short (minimum ${propDef.minimum})`
			if (propDef.maximum && propValue.length > propDef.maximum )
		        return `Property «${propName}» is too long (minimum ${propDef.maximum})`
			if (propValue.match(/\S+@\S+\.\S+/) === null)
		        return `Property «${propName}» is not a valid email address`
			return false // no error

		case 'date':
		case 'datetime':
			if (typeof(propValue) !== 'object' || propValue.constructor.name !== 'date')
		        return `Property «${propName}» is not a date`
			return false // no error

		case 'boolean':
			if (typeof(propValue) !== 'boolean')
		        return `Property «${propName}» is not a boolean`
			return false // no error

        case 'secret':
            // FIXME secret property is only supported for string properties
            // (replace "secret" property by a "password" property type
            if (typeof(propValue) !== 'string' )
                return `Property «${propName}» is not a string`
            if (propDef.minimum && propValue.length < propDef.minimum )
                return `Property «${propName}» is too small`
            let nLower = 0
            let nUpper = 0
            let nDigit = 0
            let nSpec = 0
            for (const c of propValue) {
                if (c >= 'a' && c <= 'z') nLower++
                else if (c >= 'A' && c <= 'Z') nUpper++
                else if (c >= '0' && c <= '9') nDigit++
                else nSpec++
            }
            if (nLower == 0)
                return `Property «${propName}» does not contain a lower case character`
            if (nUpper == 0)
                return `Property «${propName}» does not contain an upper case character`
            if (nDigit == 0)
                return `Property «${propName}» does not contain a digit character`
            if (nSpec == 0)
                return `Property «${propName}» does not contain a special character`
            return false // no error


		default:
			throw new Error(`Property type [${propDef.type}] not supported`)
	}
}



/**
 * Returns an DB record object corresponding to the object argument according with the object definition passed as parameter.
 * Only properties included in object definition will be transfered from object to DB record.
 * It converts Object properties to DB field names.
 * @function
 * @param {Object} objDef - object containing definition of each properties of the object.
 * @param {Object} object - object to convert into a DB record
 */
const convertObjectToDb = (objDef, object) => {
	if (objDef === undefined)
		throw new Error('objDef argument is missing')
	if (typeof(objDef) != 'object')
		throw new Error('objDef argument is not an object')

	if (object === undefined)
		throw new Error('object argument is missing')
	if (typeof(object) != 'object')
		throw new Error('object argument is not an object')

	const dbRecord = {}
	for (const [propName, propDef] of Object.entries(objDef)) {
		let propValue = object[propName]
		if (propValue === undefined)
			continue
		const fieldName = propDef.field ? propDef.field : propName
		dbRecord[fieldName] = propValue
	}
	return dbRecord
}

/**
 * Returns two arrays containing field names and field values for the properties which are present in
 * the object passed as parameter.
 * For each properties of the given object, there will be an entry in each array.
 * This function is used to build WHERE clause from filters array argument in models (see example bellow).
 *
 * @function
 * @param {<Object>} objDef - object properties definition
 * @param {Array.<Object>} object - object containing filters
 * @returns {Array.<string>, Array.<string>} : two arrays, one with field names and one with field values.
 *
 * @example
 *
 *	const objectUtils = require('../objects/object-util.cjs')
 *
 * 	static async getUserList(filters) {
 *                const [ sqlValues, sqlFilters ] = objectUtils.buildFieldArrays(userObjectDef, filters)
 *                const whereClause = sqlFilters.length === 0 ? '' :
 *                        'WHERE ' + sqlFilters.map(f => `${f} = ?`).join(' AND ')
 *                let sql = `SELECT * FROM users ${whereClause}`
 *                const result = await db.query(sql, sqlValues)
 *
 */
const buildFieldArrays = (objDef, object) => {
	if (objDef === undefined)
		throw new Error('objDef argument is missing')
	if (typeof(objDef) != 'object')
		throw new Error('objDef argument is not an object')
	if (object === undefined)
		throw new Error('object argument is missing')
	if (typeof(object) != 'object')
		throw new Error('object argument is not an object')
	const fieldNames = []
	const fieldValues = []
	for (const [propName, propDef] of Object.entries(objDef)) {
		let fieldValue = object[propName]
		if (fieldValue === undefined)
			continue
		const fieldName = propDef.field ? propDef.field : propName
		fieldNames.push(fieldName)
		fieldValues.push(fieldValue)
	}
	return [fieldNames, fieldValues]
}


export {
    controlObject,
    controlObjectProperty,
	convertObjectToDb,
    buildFieldArrays,
}
