import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import useCompanyActions from '../actions/companyActions'
import { useComaintContext } from '../ComaintContext'
import { controlObjectProperty } from '../../../common/src/objects/object-util.mjs'
import companyObjectDef from '../../../common/src/objects/company-object-def.mjs'

const CompanyInitialisation = () => {
    const { t } = useTranslation()
    const [ error, setError ] = useState(null)
    const [ name, setName] = useState('')
    const nameFieldRef = useRef()
    const { initializeCompany} = useCompanyActions()
    const { comaintContext } = useComaintContext()

    const setFocus = (fieldRef) => {
        setTimeout( () => {
            fieldRef.current.focus()
        }, 100)
    }
 
    const onNameChanged = (ev) => {
        setError(null)
        setName(ev.target.value.trim())
    }

    const onValidateButtonClick = async () => {
        console.log("dvalida")
        const [ errorMsg, errorParams ] = controlObjectProperty(companyObjectDef, 'name', name)
        console.log("dvalidb", errorMsg)
        if (errorMsg) {
            setError(t(errorMsg, errorParams))
            setFocus(nameFieldRef)
            return
        }

        try {
            await initializeCompany(name)
        }
        catch (error) {
            setError(error.message)
            setFocus(nameFieldRef)
        }
    }

    if (comaintContext === null || comaintContext.company)
        return <></>

    return (<>
            <h1>{t('company-initialisation.title')}</h1>
            <p>{t('company-initialisation.message')}</p>
            {error !== null && <div className='error-message'>{error}</div>}
            <div className='input-container'>
                <label htmlFor='name'>{t('field.name')}</label>
                <input type='text' ref={nameFieldRef} value={name} onChange={onNameChanged}/>
            </div>
            <div className='button-bar-right'>
                <button onClick={onValidateButtonClick}>{t('button.validate')}</button>
            </div>
    
        </>)
}
export default CompanyInitialisation 
