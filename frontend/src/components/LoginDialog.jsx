import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'

import { useComaintContext } from '../ComaintContext'
import useAuthActions from '../actions/authActions'
import CustomDialog from './dialog/CustomDialog'
import { controlObjectProperty } from '../../../common/src/objects/object-util.mjs'
import userObjectDef from '../../../common/src/objects/user-object-def.mjs'

import '../scss/login-dialog.scss'

const LoginDialog = ({isOpen, onClose, onRegisterAccount}) => {
	const { t } = useTranslation()
    const { login } = useAuthActions()
    const { comaintContext } = useComaintContext();

	const [ error, setError ] = useState(null)
	const [ email, setEmail] = useState('')
	const [ password, setPassword] = useState('')
	const emailRef = useRef()
	const passwordRef = useRef()
	const navigate = useNavigate()


	const EMAIL_STORAGE_KEY = 'login-email'

	useEffect( () => {
        if (! isOpen)
            return
		setError(null)
		const email = localStorage.getItem(EMAIL_STORAGE_KEY)
		if (email !== null)
			setEmail(email)
        setPassword('')
	}, [isOpen])
   

	useEffect( () => {
        if (comaintContext == null)
            return
        if (comaintContext.connected)
            onClose()
	}, [comaintContext])


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
		setFocus( (emailRef.current.value.length > 0) ?  passwordRef : emailRef )
	}, [isOpen])


    const setFocus = (fieldRef) => {
		setTimeout( () => {
			fieldRef.current.focus()
		}, 100) // FIXME why does not work with zero ?
    }

	const onLoginButtonClick = async () => {
        setError(null)
        let errorMsg, errorParams

        [ errorMsg, errorParams ] = controlObjectProperty(userObjectDef, 'email', email)
        if (errorMsg) {
			setError(t(errorMsg, errorParams))
            setFocus(emailRef)
			return
		}
        [ errorMsg, errorParams ] = controlObjectProperty(userObjectDef, 'password', password)
		if (password.length === 0) {
			setError(t('invalid-password-error'))
            setFocus(passwordRef)
			return
		}
		try {
            await login(email, password)
		}
		catch (error) {
			setError(error.message)
            setFocus(passwordRef)
		}
	}

	const onForgetPasswordButtonClick = (ev) => {
		ev.preventDefault()
		navigate('/forgotten-password')
		onClose() // close dialog
	}

	const onEmailChanged = (ev) => {
        setError(null)
		setEmail(ev.target.value.trim())
	}

	const onPasswordChanged = (ev) => {
        setError(null)
		setPassword(ev.target.value.trim())
	}

	const onDialogClosed = () => {
        setError(null)
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
					<button onClick={onRegisterAccount}>{t('create-account-button')}</button>
				</div>
			</section>
			<div className='button-bar-right'>
				<button onClick={onClose}>{t('close')}</button>
			</div>

		</CustomDialog>
	</>)
}

export default LoginDialog
