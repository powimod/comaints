import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'

import authActions from '../actions/authActions.js'
import CustomDialog from './dialog/CustomDialog'

import '../scss/login-dialog.scss'

const LoginDialog = ({isOpen, onClose, onCreateAccount}) => {
	const { t } = useTranslation()

	const [ error, setError ] = useState(null)
	const [ email, setEmail] = useState('')
	const [ password, setPassword] = useState('')
	const emailRef = useRef()
	const passwordRef = useRef()
	const navigate = useNavigate()

	const EMAIL_STORAGE_KEY = 'login-email'

	useEffect( () => {
		setError(null)
		const email = localStorage.getItem(EMAIL_STORAGE_KEY)
		if (email !== null)
			setEmail(email)
	}, [])

	useEffect( () => {
		if (email.length === 0)
			localStorage.removeItem(EMAIL_STORAGE_KEY)
		else
			localStorage.setItem(EMAIL_STORAGE_KEY, email)
	}, [email])

	useEffect( () => {
		setError(null)
		if (! isOpen)
			return
		let focusedField = (emailRef.current.value.length > 0) ?  passwordRef : emailRef
		setTimeout( () => {
			focusedField.current.focus()
		}, 100) // FIXME why does not work with zero ?
	}, [isOpen])

	const onLoginButtonClick = async () => {
        // TODO use global control functoins
		if (email.length === 0) {
			setError(t('invalid-email-error'))
			return
		}
		if (password.length === 0) {
			setError(t('invalid-password-error'))
			return
		}
		try {
			const result = await authApi.login(email, password)
			if (! result.ok) {
				setError(result.error)
				return
			}
			onClose() // close dialog
		}
		catch (error) {
			setError(error)
		}
	}

	const onForgetPasswordButtonClick = (ev) => {
		ev.preventDefault()
		navigate('/forgotten-password')
		onClose() // close dialog
	}

	const onEmailChanged = (ev) => {
		setEmail(ev.target.value.trim())
	}

	const onPasswordChanged = (ev) => {
		setPassword(ev.target.value.trim())
	}

	const onDialogClosed = () => {
		onClose()
	}

	return (<>
		<CustomDialog isOpen={isOpen} onClose={onDialogClosed} className='login-dialog'>
			
			<div>{t('login-message')}</div>
			<section>
				<div>{t('already-customer-question')}</div>
				{error !== null && <div className='error-message'>{error}</div>}
				<div className='input-container'>
					<label htmlFor='email'>{t('email-field')}</label>
					<input id='email' name='email' type='text' ref={emailRef} value={email} onChange={onEmailChanged}/>
				</div>
				<div className='input-container'>
					<label htmlFor='password'>{t('password-field')}</label>
					<input id='password' name='password' type='password'  ref={passwordRef} value={password} onChange={onPasswordChanged}/>
				</div>
				<div>
					<a href='' onClick={onForgetPasswordButtonClick}>{t('forget-password-button')}</a>
				</div>
				<div className='button-bar-right'>
					<button onClick={onLoginButtonClick}>{t('login-button')}</button>
				</div>
			</section>
			<section>
				<div>{t('new-customer-question')}</div>
				<div className='button-bar-right'>
					<button onClick={onCreateAccount}>{t('create-account-button')}</button>
				</div>
			</section>
			<div className='button-bar'>
				<button onClick={onClose}>{t('close')}</button>
			</div>

		</CustomDialog>
	</>)
}

export default LoginDialog