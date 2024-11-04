import { useState, useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import useAuthActions from '../actions/authActions'
import QuestionDialog from './dialog/QuestionDialog'

const LogoutDialog = ({isOpen, onResponse}) => {
	const { t } = useTranslation()
    const { logout } = useAuthActions()

	const [ error, setError ] = useState(null)

	const onDialogResponse = async (confirmation) => {
		if (confirmation)  {
			try {
                await logout()
			}
			catch (error) {
                console.log("dOm ================ error")
				console.error(error)
				setError(error.message !== undefined ? error.message : error)
				return
			}
		}
		onResponse(confirmation)
	}

	return (<>
		<QuestionDialog isOpen={isOpen} onResponse={onDialogResponse}>
			{error !== null && <div className='error-message'>{error}</div>}
			<div>{t('logout-question')}</div>
		</QuestionDialog>
	</>)
}

export default LogoutDialog
