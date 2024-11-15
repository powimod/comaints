'use strict'

/**
 * Contrôle les propriétés de l'objet passé en second argument en accord avec la définition d'objet passée
 * en premier argument.
 * Renvoie un tableau de deux éléments.
 * Le premier élément est soit un booléen contenant la valeur «false» si toutes les propriétés de l'objet 
 * sont valides, soit un identifiant de message d'erreur indiquant le problème rencontré.
 * Le deuxième élément du tableau est un objet contenant les clés/valeurs des différents paramètres du
 * message d'erreur.
 * La fonction accepte troisième argument des options qui indiquent si toutes les propriétes doivent 
 * être présentes ou pas et si l'identifiant de l'objet doit être contrôlé ou pas.
 *
 * @function
 * @param {Object} objDef - objet contenant la définition des propriétés de l'objet
 * @param {Object} object - objet à contrôler
 * @param {Object} options
 * @param {boolean} [options.fullCheck=true] - indicates if all properties must be present or not.
 * @param {boolean} [options.checkId=true] - indicates if object ID property should be controlled or not
 *                  (useful with a newly created object for which the ID is not yet valued).
 * @returns {[boolean|string, null] } - returns false if all properties are correct (never returns true)
 * @returns {[string, object]} : returns a translation message ID and an object with it's parameters
 *
 * @example
 *	const myUser = {
 *		email = 'a@b.c',
 *		firstname = 'John',
 *		// ...
 *	}
 *  const [ errorMsg, errorParams ] = controlObject(tokenObjectDef, token, {fullCheck:true, checkId:false})
 *  if (errorMsg)
 *      throw new ComaintTranslatedError(errorMsg, errorParams)
 *
 */
const controlObject = (objDef, object, options) => {
    const fullCheck =  options.fullCheck === undefined ? true : options.fullCheck
    const checkId =  options.checkId === undefined ? true : options.checkId
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
	if (typeof(checkId) != 'boolean')
		throw new Error('checkId argument is not an boolean')

	for (const [propName, propDef] of Object.entries(objDef)) {
		if (propDef.type === 'id' && checkId === false)
			continue
		const propValue = object[propName]
		if (propValue === undefined || propValue === null) {
			if (fullCheck && propDef.mandatory)
                return [ 'common:error.prop.is_not_defined', { property: propName } ]
		}
		else {
			const controlResult = controlObjectProperty (objDef, propName, object[propName])
            if (controlResult[0] === true)
                return controlResult

		}
	}
	return [ false ] // no error
}

/**
 * Contrôle une propriété d'un objet dont le nom est passé en deuxième argument et dont la valeur est passée
 * en troisième argument avec la définition d'objet passée en premier argument.
 * Renvoie un tableau de deux éléments.
 * Le premier élément est soit un booléen contenant la valeur «false» si la propriété contrôlée est valide
 * soit un identifiant de message d'erreur indiquant le problème rencontré.
 * Le deuxième élément du tableau est un objet contenant les clés/valeurs des différents paramètres du
 * message d'erreur.
 
 * @function
 * @param {Object} objDef - object definition containing the property to control.
 * @param {string} propName - name of the property to control (will be searched in object definition).
 * @param {variant} propValue - the value of the property.
 *
 * @returns {[boolean|string, null] } - returns false if all properties are correct (never returns true)
 * @returns {[string, object]} : returns a translation message ID and an object with it's parameters
 *
 * @example
 *  const [ errorMsg, errorParams ] = controlProperty(userDef, 'password', myPassword)
 *  if (errorMsg)
 *      throw new ComaintTranslatedError(errorMsg, errorParams)
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
		return ['common:error.prop.has_no_value', {property: propName}]

	if (propValue === null) {
		if (propDef.mandatory)
			return ['common:error.prop.is_null', {property: propName}]
		else
			return null // FIXME 
	}


	if (propName === 'password')  {
        if (propDef.minimum && propValue.length < propDef.minimum )
            return ['common:error.prop.password_to_small', {property: propName, size: propDef.minimum}]
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
            return ['common:error.prop.password_no_lowercase_letter', {property: propName}]
        if (nUpper == 0)
            return ['common:error.prop.password_no_uppercase_letter', {property: propName}]
        if (nDigit == 0)
            return ['common:error.prop.password_no_digit_character', {property: propName}]
        if (nSpec == 0)
            return ['common:error.prop.password_no_special_character', {property: propName}]
        return [ false ] // no error
    }

	switch (propDef.type) {

		case 'id':
		case 'link':
			if (typeof(propValue) !== 'number' )
				return ['common:error.prop.is_not_an_integer', {property: propName}]
            return [ false ] // no error

		case 'integer':
			if (typeof(propValue) !== 'number' )
				return ['common:error.prop.is_not_an_integer', {property: propName}]
			if (propDef.minimum && propValue < propDef.minimum )
				return ['common:error.prop.is_too_small', {property: propName, size: propDef.minimum}]
			if (propDef.maximum && propValue > propDef.maximum )
				return ['common:error.prop.is_too_large', {property: propName, size: propDef.maximum}]
            return [ false ] // no error

		case 'string':
		case 'text':
		case 'image':
			if (typeof(propValue) !== 'string' )
				return ['common:error.prop.is_not_a_string', {property: propName}]
			if (propDef.minimum && propValue.length < propDef.minimum )
				return ['common:error.prop.is_too_short', {property: propName, size: propDef.minimum}]
			if (propDef.maximum && propValue.length > propDef.maximum )
				return ['common:error.prop.is_too_long',  {property: propName, size: propDef.maximum}]
			if (propDef.type !== 'text' && propValue.includes('\n'))
				return ['common:error.prop.contains_line_feeds',  {property: propName, size: propDef.maximum}]
            return [ false ] // no error

		case 'email':
			if (typeof(propValue) !== 'string' )
				return ['common:error.prop.is_not_a_string', {property: propName}]
			if (propDef.minimum && propValue.length < propDef.minimum )
				return ['common:error.prop.is_too_short', {property: propName, size: propDef.minimum}]
			if (propDef.maximum && propValue.length > propDef.maximum )
				return ['common:error.prop.is_too_long',  {property: propName, size: propDef.maximum}]
			if (propValue.match(/\S+@\S+\.\S+/) === null)
				return ['common:error.prop.is_malformed_email', {property: 'email'}]
            return [ false ] // no error

		case 'date':
		case 'datetime':
			if (typeof(propValue) !== 'object' || propValue.constructor.name !== 'date')
				return ['common:error.prop.is_not_a_date', {property: propName}]
            return [ false ] // no error

		case 'boolean':
			if (typeof(propValue) !== 'boolean')
				return ['common:error.prop.is_not_a_boolean', {property: propName}]
            return [ false ] // no error

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
 * Returns an object corresponding with the dbRecord argument according with the object definition passed as parameter.
 * Only properties included in object definition will be transfered from DB record to result object.
 * Boolean properties will be converted from integer (as returned by MySQL) in to Javascript boolean.
 * @function
 * @param {Object} objDef - object containing definition of each properties of the object.
 * @param {Object} dbRecord - object containing values issued from MySQL.
 */
const convertObjectFromDb = (objDef, dbRecord) => {
	if (objDef === undefined)
		throw new Error('objDef argument is missing')
	if (typeof(objDef) != 'object')
		throw new Error('objDef argument is not an object')

	if (dbRecord === undefined)
		throw new Error('dbRecord argument is missing')
	if (typeof(dbRecord) != 'object')
		throw new Error('dbRecord argument is not an object')

	const object = {}
	for (const [propName, propDef] of Object.entries(objDef)) {
	    if (propDef.secret)
            continue
		const fieldName = (propDef.field === undefined) ? propName : propDef.field
		let fieldValue = dbRecord[fieldName]
		if (fieldValue === undefined)  // should never happen
			throw new Error(`Property [${fieldName}] is not defined in DB record`)
		if (fieldValue !== null) {
			if (propDef.type === 'boolean') 
				fieldValue = (fieldValue === 1) ? true : false
			// FIXME remove this if no error is thrown
			if (propDef.type === 'date' || propDef.type === 'datetime') {
				if (typeof(fieldValue) !== 'object')
					throw new Error(`Property [${propName}] it not an object`)
				if (fieldValue.constructor.name !== 'Date')
					throw new Error(`Property [${propName}] it not a date`)
			}
		}
		object[propName] = fieldValue
	}
	return object
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
 * 	static async getUserList(filters) {
 *     const [ sqlValues, sqlFilters ] = buildFieldArrays(userObjectDef, filters)
 *     const whereClause = sqlFilters.length === 0 ? '' :
 *         'WHERE ' + sqlFilters.map(f => `${f} = ?`).join(' AND ')
 *     let sql = `SELECT * FROM users ${whereClause}`
 *     const result = await db.query(sql, sqlValues)
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

const buildPublicObjectVersion = (objDef, object) => {
	if (objDef === undefined)
		throw new Error('objDef argument is missing')
	if (typeof(objDef) != 'object')
		throw new Error('objDef argument is not an object')
	if (object === undefined)
		throw new Error('object argument is missing')
	if (typeof(object) != 'object')
		throw new Error('object argument is not an object')
    const publicObject = Object.fromEntries(
        Object.entries(object).filter( ([propName, propValue]) => {
            const propDef = objDef[propName]
            if (propDef === undefined) return false
            if (propDef.scope !== 'public') return false
            return true
        })
    )
	return publicObject
}

export {
    controlObject,
    controlObjectProperty,
	convertObjectToDb,
    convertObjectFromDb,
    buildFieldArrays,
    buildPublicObjectVersion 
}
