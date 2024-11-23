import { useState, useRef, useEffect, useContext } from 'react'
import { useTranslation } from 'react-i18next'

import { DialogContext } from './DialogContext'

import '../../scss/dialog.scss'

const StandardDialog = () => {
	const { t } = useTranslation()

    const [ dialogState, dialogDispatch ] = useContext(DialogContext)

    const [ dialogData, setDialogData] = useState(null)
    const dialogDataRef = useRef(dialogData) // used by close dialog callback function

    const dialogRef = useRef(null)
    const validationRef = useRef(false)

    const _showDialog = (dialogType, message, resolve)  => {
        validationRef.current = false
        setDialogData({ type:dialogType, message, resolve })
    }

    useEffect(() => {
        const modalDialog = dialogRef.current
        if (modalDialog  === null) 
            return
        dialogDataRef.current = dialogData
        dialogRef.current.showModal()
        modalDialog.addEventListener('close', evDialogClose)
        return () => {
            modalDialog.removeEventListener('close', evDialogClose)
        }
    }, [dialogData])


	useEffect( () => {
		for (const request of dialogState) {
            const requestType = request.type
            if (requestType === 'standard-dialog') {
                _showDialog(request.dialog, request.message, request.resolve) 
                dialogDispatch({type:'acquit', id: request.id})
			}
		}
	}, [dialogState])


    const evDialogClose = () => {
        if (dialogDataRef.current !== null) {
            dialogDataRef.current.resolve(validationRef.current)
            setDialogData(null)
        }
    }

    const evValidateButtonClick = () => {
        validationRef.current = true
        dialogRef.current.close()
    }

    const evInvalidateButtonClick = () => {
        dialogRef.current.close()
    }

	return ( <>
        { dialogData !== null && (
            <dialog ref={dialogRef} className='standard-dialog'>
                <div>{dialogData.message}</div>
                <div>
                    { dialogData.type === 'message' && 
                        <button onClick={evValidateButtonClick}>{t('button.ok')}</button>
                    }
                    { dialogData.type === 'question' && 
                            <>
                                <button onClick={evValidateButtonClick}>{t('button.yes')}</button>
                                <button onClick={evInvalidateButtonClick}>{t('button.no')}</button>
                            </>
                    }
                    { dialogData.type === 'confirmation' && 
                            <>
                                <button onClick={evValidateButtonClick}>{t('button.ok')}</button>
                                <button onClick={evInvalidateButtonClick}>{t('button.cancel')}</button>
                            </>
                    }
                </div>
            </dialog>
        ) }
    </>)
}

const useStandardDialog = () => {
    const [ _, dialogDispatch ] = useContext(DialogContext)

    const postDialogRequest = (dialog, message) => {
        return new Promise( (resolve) => {
            dialogDispatch({ type:'standard-dialog', dialog, message, resolve })
        })
    }

    const messageDialog      = (message) => postDialogRequest('message', message) 
    const questionDialog     = (message) => postDialogRequest('question', message) 
    const confirmationDialog = (message) => postDialogRequest('confirmation', message) 

    return { messageDialog, questionDialog, confirmationDialog }
}

export { useStandardDialog }
export default StandardDialog
