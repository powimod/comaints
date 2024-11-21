import { useState, useEffect, useContext, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { useComaintContext } from '../ComaintContext'
import { DialogContext} from '../components/dialog/DialogContext'
import useAuthActions from '../actions/authActions'
import { controlObjectProperty } from '@common/objects/object-util.mjs'
import userObjectDef from '@common/objects/user-object-def.mjs'
import { useFlashPopupStack }  from '../components/dialog/FlashPopupStack'

import '../scss/forgotten-password-dialog.scss'

const ForgottenPasswordPage = (props) => {
    const { t } = useTranslation()
    const { resetPassword, validateCodeWithEmail, resendCodeWithEmail } = useAuthActions()
    const { comaintContext } = useComaintContext()
    const flashPopupStack = useFlashPopupStack()

    const navigate = useNavigate()
    const [ dialogRequestList, pushDialogRequest ] = useContext(DialogContext)
    const [ step, setStep ] = useState(1)
    const [ email, setEmail] = useState('')
    const emailInputRef = useRef()
    const newPasswordInputRef = useRef()
    const confirmPasswordInputRef = useRef()
    const codeInputRef = useRef()

    const [ error, setError ] = useState(null)

    const EMAIL_STORAGE_KEY = 'login-email'

    useEffect( () => {
        const email = localStorage.getItem(EMAIL_STORAGE_KEY)
        if (email !== null)
            setEmail(email)
    }, [])


    useEffect( () => {
        if (comaintContext == null)
            return
        if (comaintContext.connected)
            navigate('/')
    }, [comaintContext])


    useEffect( () => {
        if (email.length === 0) 
            localStorage.removeItem(EMAIL_STORAGE_KEY)
        else 
            localStorage.setItem(EMAIL_STORAGE_KEY, email)
    }, [email])

    const setFocus = (fieldRef) => {
        setTimeout( () => {
            fieldRef.current.focus()
        }, 100) // FIXME why does not work with zero ?
    }


    const onEmailChanged = (ev) => {
        setEmail(ev.target.value.trim())
    }

    const onFirstStepButtonClick = async () => {
        setError(null)

        const [ errorMsg1, errorParams1 ] = controlObjectProperty(userObjectDef, 'email', email)
        if (errorMsg1) {
            setError(t(errorMsg1, errorParams1))
            setFocus(emailInputRef)
            return
        }

        const newPassword = newPasswordInputRef.current.value.trim()
        const [ errorMsg2, errorParams2 ] = controlObjectProperty(userObjectDef, 'password', newPassword)
        if (errorMsg2) {
            setError(t(errorMsg2, errorParams2))
            setFocus(newPasswordInputRef)
            return
        }

        const confirmPassword = confirmPasswordInputRef.current.value.trim()
        const [ errorMsg3, errorParams3 ] = controlObjectProperty(userObjectDef, 'password', confirmPassword)
        if (errorMsg3) {
            setError(t(errorMsg3, errorParams3))
            setFocus(confirmPasswordInputRef)
            return
        }
        if (newPassword != confirmPassword) {
            setError(t('different-password-error'))
            setFocus(newPasswordInputRef)
            return
        }

        try {
            await resetPassword(email, newPassword)
            setStep(2)
        }
        catch (error) {
            setError(error.message)
        }
    }


    const onSecondStepButtonClick = async () => {
        setError(null)
        let code = codeInputRef.current.value.trim()
        if (! isNaN(code)) code = parseInt(code)
        const [ errorMsg, errorParams ] = controlObjectProperty(userObjectDef, 'authCode', code)
        if (errorMsg) {
            setError(t(errorMsg, errorParams))
            return
        }
        try {
            await validateCodeWithEmail(email, parseInt(code))
            flashPopupStack.add({message: t('forgotten_password.password_changed_message'), duration:3000})
        }
        catch (error) {
            setError(error.message)
        }
    }

    const onResendCodeButtonClick = async () => {
        try {
            await resendCodeWithEmail(email)
            flashPopupStack.add({message: t('code-has-been-send'), duration:3000})
        }
        catch (error) {
            setError(error.message)
        }

    }

    return (
        <main>
            <h1>{t('forgotten_password.title')}</h1>
            {error !== null && <div className='error-message'>{error}</div>}
        { ( step === 1) && 
            <> 
                <h2>{t('forgotten_password.step_1')}</h2>
                <div>
                    <input ref={emailInputRef} 
                        placeholder={t('forgotten_password.email_field')} 
                        value={email} 
                        onChange={onEmailChanged}/>
                </div>
                <div>
                    <input ref={newPasswordInputRef}
                        type="password" 
                        placeholder={t('forgotten_password.new_password_field')}/>
                </div>
                <div>
                    <input ref={confirmPasswordInputRef} 
                        type="password" 
                        placeholder={t('forgotten_password.confirm_password_field')}/>
                </div>
                <div>
                    <button onClick={onFirstStepButtonClick}>{t('button.validate')}</button>
                </div>
            </>
        }
        { ( step === 2) && 
            <> 
                <h2>{t('forgotten_password.step_2')}</h2>
                <div>{t('forgotten_password.send_code_message')}</div>
                <div>
                    <input ref={codeInputRef} 
                        placeholder={t('forgotten_password.code')} 
                        pattern="[0-9]{5}"/>
                    <button onClick={onResendCodeButtonClick}>{t('resend-validation-code')}</button>
                </div>
                <div>
                    <button onClick={onSecondStepButtonClick}>{t('button.validate')}</button>
                </div>
            </>
        }
        </main>
    )
}

export default ForgottenPasswordPage
