import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import useUnitActions from '../actions/unitActions'
import { controlObjectProperty } from '../../../common/src/objects/object-util.mjs'
import unitObjectDef from '../../../common/src/objects/unit-object-def.mjs'

const UnitEditor = () => {
	const { t } = useTranslation()
    const { getSelectedUnit } = useUnitActions()
    const selectedUnit = getSelectedUnit()
    const [ unit, setUnit ] = useState(null)
	const [ error, setError ] = useState(null)

    useEffect( () => {
        setUnit({...selectedUnit})
		setError(null)
    }, [selectedUnit])
 
    const onNameFieldChange = (ev) => {
        const elInput = ev.target
        const propName = elInput.name
        const propValue = elInput.value
        const [ errorMsg, errorParams ] = controlObjectProperty(unitObjectDef, propName, propValue)
        if (errorMsg) 
			setError(t(errorMsg, errorParams))
        else
			setError(null)
        const updatedUnit = {...unit}
        updatedUnit[elInput.name] = elInput.value
        setUnit(updatedUnit)
    }

    const onValidateButtonClick = () => {
        console.log("validate")
    }

    return (<>
            <h1>{t('unit-editor')}</h1>
            { unit !== null && <>
                <p>Unit name: {selectedUnit ? selectedUnit.name : '?'}</p>
				{error !== null && <div className='error-message'>{error}</div>}
                <div className='input-container'>
                    <label htmlFor='name'>{t('field.name')}</label>
                    <input type='text' name='name' value={unit.name} onChange={onNameFieldChange}/>
                </div>
                <div className='input-container'>
                    <label htmlFor='address'>{t('field.address')}</label>
                    <input type='text' name='address' value={unit.address} onChange={onNameFieldChange}/>
                </div>
                <div className='button-bar-right'>
                    <button onClick={onValidateButtonClick}>{t('button.validate')}</button>
                </div>
            </>}
        </>)
}
export default UnitEditor
