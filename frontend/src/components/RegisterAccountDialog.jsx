import { useState, useEffect, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import CustomDialog from './dialog/CustomDialog'
import { useComaintContext } from '../ComaintContext'
import useAuthActions from '../actions/authActions'

import '../scss/register-account-dialog.scss'

const RegisterAccountDialog = ({isOpen, onClose, onRegisterAccount}) => {
	const { t } = useTranslation()
    const { register, validateCode} = useAuthActions()
    const { comaintContext } = useComaintContext();

	const [ error, setError ] = useState(null)
	const [ step, setStep ] = useState(1)
	const [ email, setEmail] = useState('')
	const [ password, setPassword] = useState('')
	const [ firstname, setFirstname] = useState('')
	const [ lastname, setLastname] = useState('')
	const [ validationCode, setValidationCode ] = useState('')

	useEffect( () => {
        if (comaintContext == null)
            return
        if (comaintContext.connected)
            onClose()
	}, [comaintContext])


	useEffect(() => {
		setStep(1)
		setValidationCode('')
		setError(null)
	}, [isOpen])


	const onFirstStepValidateButtonClick = async () => {
		setError(null)
		if (email.length === 0) {
			setError(t('error.invalid-email'))
			return
		}
		if (password.length === 0) {
			setError(t('error.invalid-password'))
			return
		}
		if (firstname.length === 0) {
			setError(t('error.empty-firstname'))
			return
		}
		if (lastname.length === 0) {
			setError(t('error.empty-lastname'))
			return
		}
		try {
			await register(email, password, firstname, lastname)
			setStep(2)
		}
		catch (error) {
			setError(error)
		}
	}

	const onSecondStepValidateButtonClick = async () => {
		setError(null)
		if (validationCode.length === 0 || isNaN(validationCode)) {
			setError(t('error.invalid-validation-code'))
			return
		}
		try {
			await validateCode(parseInt(validationCode))
		} catch (error) {
			setError(error)
		}
	}


	const onPreviousButtonClick = () => {
		setStep(1)
	}

	const onForgetPasswordButtonClick = (ev) => {
		ev.preventDefault()
		console.log('Forget password') // TODO
	}

	const onResendCodedButtonClick = (ev) => {
		ev.preventDefault()
		console.log('Resend code') // TODO
	}

	const onEmailChanged = (ev) => {
		setEmail(ev.target.value.trim())
	}

	const onPasswordChanged = (ev) => {
		setPassword(ev.target.value.trim())
	}

	const onFirstnameChanged = (ev) => {
		setFirstname(ev.target.value.trim())
	}

	const onLastnameChanged = (ev) => {
		setLastname(ev.target.value.trim())
	}

	const onValidationCodeChanged = (ev) => {
		setValidationCode(ev.target.value.trim())
	}

	return (<>
		<CustomDialog isOpen={isOpen} onClose={onClose} className='register-account-dialog'>
			
			{(step === 1) && <>
				<div>{t('create-account-message')}</div>
				<section>
					<div>{t('create-account-instruction')}</div>
					{error !== null && <div className='error-message'>{error}</div>}
					<div className='input-container'>
						<label htmlFor='email'>{t('email-field')}</label>
						<input name='email' type='text' value={email} onChange={onEmailChanged}/>
					</div>
					<div className='input-container'>
						<label htmlFor='password'>{t('password-field')}</label>
						<input name='password' type='password' value={password} onChange={onPasswordChanged}/>
					</div>
					<div>{t('password-rules')}</div>

					<div className='input-container'>
						<label htmlFor='firstname'>{t('firstname-field')}</label>
						<input name='firstname' type='text' value={firstname} onChange={onFirstnameChanged}/>
					</div>
					<div className='input-container'>
						<label htmlFor='lastname'>{t('lastname-field')}</label>
						<input name='lastname' type='text' value={lastname} onChange={onLastnameChanged}/>
					</div>

					<div className='button-bar-right'>
						<button onClick={onClose}>{t('button.cancel')}</button>
						<button onClick={onFirstStepValidateButtonClick}>{t('button.validate')}</button>
					</div>
				</section>
			</>}
			{(step === 2) && <>
				<div>{t('create-account-message')}</div>
				{error !== null && <div className='error-message'>{error}</div>}
				<section>
					<div>{t('ask-code-message')}</div>
					<div>
						<a href='' onClick={onResendCodedButtonClick}>{t('resend-validation-code')}</a>
					</div>
					<div className='input-container'>
						<label htmlFor='validation-code'>{t('validation-code')}</label>
						<input name='validation-code' type='text' value={validationCode} onChange={onValidationCodeChanged}/>
					</div>
					<div className='button-bar'>
						<button onClick={onPreviousButtonClick}>{t('previous')}</button>
						<button onClick={onClose}>{t('button.cancel')}</button>
						<button onClick={onSecondStepValidateButtonClick}>{t('button.validate')}</button>
					</div>
				</section>
			</>}

		</CustomDialog>
	</>)
}

export default RegisterAccountDialog
