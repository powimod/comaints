'use strict'

/**
 * Cette fonction contrôle les propriétés de l'objet passé en second argument en accord avec la 
 * définition d'objet passée en premier argument.
 *
 * Elle renvoie un tableau de deux éléments :
 * - Le premier élément est soit un booléen contenant la valeur «false» si toutes les propriétés de l'objet 
 * sont valides, soit un identifiant de message d'erreur indiquant le problème rencontré.
 * - Le deuxième élément du tableau est un objet contenant les clés/valeurs des différents paramètres du
 * message d'erreur.
 *
 * La fonction accepte en troisième argument des options qui indiquent si toutes les propriétes doivent 
 * être présentes ou pas et si l'identifiant de l'objet doit être contrôlé ou pas.
 *
 * @function
 * @param {Object} objDef - objet contenant la définition des propriétés de l'objet
 * @param {Object} object - objet à contrôler
 * @param {Object} options
 * @param {boolean} [options.fullCheck=true] - indique si toutes les propriétés doivent être présentes.
 * @param {boolean} [options.checkId=true] - indique si la propriété ID doit être testée.
 *                  (utile avec les objets nouvellement créés et pas encore stockés en base car 
 *                  l'ID est alors inconnu).
 * @returns {[boolean|string, null] } - renvoie «false» si toutes les propriétés sont correctes
 *                  (la fonction ne renvoie jamais la valeur «true».
 * @returns {[string, object]} : retourne un identifiant de message de traduction et un tableau contenant
 *                  les paramètres associés à ce message.
 *
 * @example
 *    const myUser = {
 *        email = 'a@b.c',
 *        firstname = 'John',
 *        // ...
 *    }
 *  const [ errorMsg, errorParams ] = controlObject(tokenObjectDef, token, {fullCheck:true, checkId:false})
 *  if (errorMsg)
 *      throw new ComaintTranslatedError(errorMsg, errorParams)
 *
 */
const controlObject = (objDef, object, options = {}) => {
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
            if (fullCheck) {
                if (typeof(propDef.mandatory) !== 'boolean')
                    throw new Error('Invalid mandatory property')
                if (propDef.mandatory === true)
                    return [ 'common:error.prop.is_not_defined', { property: propName } ]
            }
        }
        else {
            const controlResult = controlObjectProperty(objDef, propName, object[propName])
            if (controlResult[0] !== false)
                return controlResult
        }
    }
    return [ false ] // no error
}

/**
 * Cette fonction contrôle une propriété d'un objet dont le nom est passé en deuxième argument et dont la 
 * valeur est passée en troisième argument. La définition d'objet passée en premier argument.
 *
 * Elle renvoie un tableau de deux éléments :
 * - Le premier élément est soit un booléen contenant la valeur «false» si la propriété contrôlée est valide
 * soit un identifiant de message d'erreur indiquant le problème rencontré.
 * - Le deuxième élément du tableau est un objet contenant les clés/valeurs des différents paramètres du
 * message d'erreur.
 
 * @function
 * @param {Object} objDef - définition d'objet.
 * @param {string} propName - nom de la propriété à contrôler.
 * @param {variant} propValue - valeur de la propriété à contrôler.
 *
 * @returns {[boolean|string, null] } - retourne «false» si la propriété est correcte.
 * @returns {[string, object]} : retourne un identifiant de message de traduction et ses paramètres
 *                  permettant de la valoriser.
 *
 * @example
 *  const [ errorMsg, errorParams ] = controlObjectProperty(userDef, 'password', myPassword)
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
 * Cette fonction permet de préparer le stockage d'un objet en base de données.
 * Seules les propriétés connues de la définition d'objet sont retournées par la fonction.
 * Les noms de propriétés sont convertis en nom de champ (déduits de la définition d'objet).
 * @function
 * @param {Object} objDef - définition de l'objet
 * @param {Object} object - objet à convertir
 *
 * @returns {object} : retourne un objet contenant les noms de champs et leurs valeurs.
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
 * Cette fonction permet de préparer un objet à partir d'un enregistrement extrait de la base de données.
 * Seules les propriétés communes à la définition d'objet et à l'enregistrement sont retournées par la fonction.
 * Les noms de champs sont convertis en nom de propriétés (déduits de la définition d'objet).
 * @function
 * @param {Object} objDef - définition de l'objet
 * @param {Object} object - enregistrement extrait de la table associée à l'objet
 *
 * @returns {object} : retourne un objet contenant les noms de champs et leurs valeurs.
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
        if (fieldValue === undefined)
            continue // record should not have all properties
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
 * Create an object containing object properties according to the object definition passed as argument.
 *
 * @function
 * @param {Object} objDef - object containing definition of each properties of the object.
 * @returns {Object} - the created object
 *
 */
const createObjectInstance = (objDef) => {
    if (objDef === undefined)
        throw new Error('objDef argument is missing')
    if (typeof(objDef) != 'object')
        throw new Error('objDef argument is not an object')
    const object = {}
    for (const [propName, propDef] of Object.entries(objDef)) {
        switch (propDef.type) {
            case 'id':
                object[propName] = null
                break;
            case 'integer':
            case 'price':
                if (object.defaultValue)
                    object[propName] = parseInt(object.defaultValue)
                else if (propDef.mandatory)
                    object[propName] = 0
                else
                    object[propName] = null
                break;
            case 'string':
            case 'text':
            case 'email':
                if (object.defaultValue)
                    object[propName] = object.defaultValue
                else if (propDef.mandatory)
                    object[propName] = ""
                else
                    object[propName] = null
                break;
            case 'date':
            case 'datetime':
                if (propDef.mandatory)
                    object[propName] = new Date()
                else
                    object[propName] = null
                break;
            case 'boolean':
                if (object.defaultValue)
                    object[propName] = object.defaultValue
                else if (propDef.mandatory)
                    object[propName] = false
                else
                    object[propName] = null
                break;
            case 'link':
                object[propName] = null
                break;
            default:
                throw new Error(`Property type [${propDef.type}] not supported`)
        }
    }
    return object
}


/**
 * Compare two object instances passed as parameters according to an object definition and
 * returns an array containing all properties for which value has changed.
 * Used to detect if an object has been changed in a dialog editor and to send the minimum field set
 * to the backend to be save in database.
 * 
 * @function
 * @param {Object} objDef - object containing definition of each properties of the object.
 * @param {Object} objectA - first instance of the object to compare (before edition)
 * @param {Object} objectB - second instance of the object (after edition)
 * @param {boolean} ignoreID - indicates if object ID should be controlled or not.
 *    If true, an error is thrown if objectA and objectB do not match.
 * @returns {Object} - the diff object with changed properties (name and value after edition)
 * 
 */
const diffObjectInstances = (objDef, objectA, objectB, ignoreID = false) => {
    if (objDef === undefined)
        throw new Error('objDef argument is missing')
    if (typeof(objDef) != 'object')
        throw new Error('objDef argument is not an object')

    if (objectA === undefined)
        throw new Error('objectA argument is missing')
    if (typeof(objectA) != 'object')
        throw new Error('objectA argument is not an object')

    if (objectB === undefined)
        throw new Error('objectB argument is missing')
    if (typeof(objectA) != 'object')
        throw new Error('objectB argument is not an object')

    const delta = {}
    for (const [propName, propDef] of Object.entries(objDef)) {
        if (propDef.type === 'id') {
            if (ignoreID)
                continue
            if (objectA.id === undefined)
                throw new Error('Object A has no ID')
            if (objectB.id === undefined)
                throw new Error('Object B has no ID')
            if (objectA.id !== objectB.id)
                throw new Error('Objects ID are different')
            delta[propName] = objectB[propName]
            continue
        }
        if (objectA[propName] == objectB[propName])
            continue
        delta[propName] = objectB[propName]
    }
    return delta
}


/**
 * Cette fonction attend en argument une définition d'objet et une liste (sous forme d'objet) associant des
 * noms des propriétés de filtrage et des valeurs de filtre associées.
 *
 * Elle est utilisée pour faciliter la construction de requête SQL :
 * - soit dans les requêtes «SELECT» pour la partie «WHERE».
 * - soit dans les requêtes «INSERT».
 *
 * @function
 * @param {<Object>} objDef - définition d'un objet 
 * @param {Array.<Object>} object - liste des noms de propriétés et de valeurs de propriétés pour le filtrage.
 * @returns {Array.<string>, Array.<string>} : deux tableaux, contenant d'un côté les noms de champs en base 
 *      de données et de l'autre les valeurs associées à ces champs.
 *
 * @example
 *      const filters = [
 *          'firstname', firstname,
 *          'lastname', lastname
 *      ]
 *      const [ sqlValues, sqlFilters ] = buildFieldArrays(userObjectDef, filters)
 *      const whereClause = sqlFilters.length === 0 ? '' :
 *          'WHERE ' + sqlFilters.map(f => `${f} = ?`).join(' AND ')
 *      let sql = `SELECT * FROM users ${whereClause}`
 *
 * @example
 *      const [ fieldNames, fieldValues ] = buildFieldArrays(userObjectDef, user)
 *      const markArray = Array(fieldValues.length).fill('?').join(',')
 *      const sqlRequest = `
 *          INSERT INTO users(${fieldNames.join(', ')}) VALUES (${markArray})
 *
 */
const buildFieldArrays = (objDef, object = {}) => {
    if (objDef === undefined)
        throw new Error('objDef argument is missing')
    if (typeof(objDef) != 'object')
        throw new Error('objDef argument is not an object')
    if (object === undefined)
        throw new Error('Argument «object» is missing')
    if (object === null)
        object = {}
    if (typeof(object) !== 'object')
        throw new Error('Argument«object» is not an object')
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

/**
 * Cette fonction attend en argument une définition d'objet et un tableau contenant des noms des propriétés.
 * Elle renvoie un tableau contenant les noms des champs associés en base de données.
 *
 * Cette fonction est utilisée pour faciliter la construction de requête SQL 
 *  «SELECT» pour dresser la liste des champs à renvoyer.
 *
 * @function
 * @param {<Object>} objDef - définition d'un objet 
 * @param {Array.<string>} object - tableau des noms de propriétés.
 * @returns {Array.<string>} : tableau contenant les noms de champs en base 
 * 
 */
const buildFieldNameArray = (objDef, propNameArray ) => {
    if (objDef === undefined)
        throw new Error('objDef argument is missing')
    if (typeof(objDef) != 'object')
        throw new Error('objDef argument is not an object')
    if (propNameArray === undefined)
        throw new Error('Argument «propNameArray» is missing')
    if (propNameArray === null)
        return '*'
    if (! (propNameArray instanceof Array))
        throw new Error('Argument «propNameArray» is not an array')
    const fieldNames = []
    for (const [propName, propDef] of Object.entries(objDef)) {
        if (propNameArray.indexOf(propName) === -1)
            continue
        const fieldName = propDef.field ? propDef.field : propName
        fieldNames.push(fieldName)
    }
    return fieldNames
}


/**
 * Cette fonction permet de filtrer de préparer un résultat renvoyé par l'API
 * en ne gardant que les propriétés de portée publique («public») : 
 * les propriétés privées («private») et protégées («protected») sont filtrées.
 *
 * @function
 * @param {<Object>} objDef - définition d'un objet 
 * @param {<Object>} objet - objet à filtrer
 * @returns {<Object>} : objet avec les propriétés filtrées
 
 */
const buildPublicObjectVersion = (objDef, object) => {
    if (objDef === undefined)
        throw new Error('Argument «objDef» is missing')
    if (typeof(objDef) != 'object')
        throw new Error('Argument «objDef»  is not an object')
    if (object === undefined)
        throw new Error('Argument «object» argument is missing')
    if (typeof(object) != 'object')
        throw new Error('Argument «argument» is not an object')
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
    createObjectInstance,
    diffObjectInstances,
    buildFieldArrays,
    buildFieldNameArray,
    buildPublicObjectVersion
}
