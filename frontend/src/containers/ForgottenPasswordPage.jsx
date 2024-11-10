import { useState, useEffect, useContext, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { useComaintContext } from '../ComaintContext'
import { DialogContext} from '../components/dialog/DialogContext'
import useAuthActions from '../actions/authActions'

import '../scss/forgotten-password-dialog.scss'

const ForgottenPasswordPage = (props) => {
	const { t } = useTranslation()
    const { resetPassword, validateCodeWithEmail } = useAuthActions()
    const { comaintContext } = useComaintContext()

	const navigate = useNavigate()
	const [ dialogRequestList, pushDialogRequest ] = useContext(DialogContext)
    const [ step, setStep ] = useState(1)
	const [ email, setEmail] = useState('')
	const codeInputRef = useRef()
	const newPasswordInputRef = useRef()
	const confirmPasswordInputRef = useRef()

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


	const onEmailChanged = (ev) => {
		setEmail(ev.target.value.trim())
	}

    const onFirstStepButtonClick = async () => {
		setError(null)

		if (email.length === 0) {
			setError(t('invalid-email-error')) // TODO wrong id
			return
		}

		const newPassword = newPasswordInputRef.current.value.trim()
		if (newPassword.length === 0) {
			setError(t('invalid-password-error')) // TODO wrong id
			return
		}

		const confirmPassword = confirmPasswordInputRef.current.value.trim()
		if (confirmPassword.length === 0) {
			setError(t('invalid-password-error')) // TODO wrong id
			return
		}
		if (newPassword != confirmPassword) {
			setError(t('different-password-error')) // TODO wrong id
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
        const code = codeInputRef.current.value.trim()
		if (code.length === 0) {
			setError(t('invalid-code-error')) // TODO wrong id
			return
		}
		try {
            await validateCodeWithEmail(email, parseInt(code))
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
                    <div><input placeholder={t('forgotten_password.email_field')} value={email} onChange={onEmailChanged}/></div>
                    <div><input ref={newPasswordInputRef} type="password" placeholder={t('forgotten_password.new_password_field')}/></div>
                    <div><input ref={confirmPasswordInputRef} type="password" placeholder={t('forgotten_password.confirm_password_field')}></input></div>
                    <div><button onClick={onFirstStepButtonClick}>{t('button.validate')}</button></div>
                </>
        }
        { ( step === 2) && 
                <> 
                    <h2>{t('forgotten_password.step_2')}</h2>
                    <div>{t('forgotten_password.send_code_message')}</div>
			        <div><input ref={codeInputRef} placeholder={t('forgotten_password.code')} pattern="[0-9]{5}"/></div>
                    <div><button onClick={onSecondStepButtonClick}>{t('button.validate')}</button></div>
                </>
        }
		</main>
	)
}

export default ForgottenPasswordPage
