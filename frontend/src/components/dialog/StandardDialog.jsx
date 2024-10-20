import { useState, useRef, useEffect, useContext } from 'react'

import { DialogContext } from './DialogContext'

import '../../scss/dialog.scss'

const StandardDialog = () => {

    const [ dialogState, dialogDispatch ] = useContext(DialogContext)

    const [ dialogData, setDialogData] = useState(null)
    const dialogDataRef = useRef(dialogData) // used by close dialog callback function

    const dialogRef = useRef(null)
    const validationRef = useRef(false)

    const _showDialog = (dialogType, message, resolve)  => {
        validationRef.current = false
        setDialogData({ type:dialogType, message, resolve })
        dialogRef.current.showModal()
    }

    useEffect(() => {
        dialogDataRef.current = dialogData;
    }, [dialogData])

    useEffect( () => {
        const modalDialog = dialogRef.current
        modalDialog.addEventListener('close', evDialogClose)
        return () => {
            modalDialog.removeEventListener('close', evDialogClose)
        }
    }, [])

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
        <dialog ref={dialogRef} className='standard-dialog'>
        { dialogData !== null && (
            <>
                <div>{dialogData.message}</div>
                <div>
                    { dialogData.type === 'message' && 
                        <button onClick={evValidateButtonClick}>OK</button>
                    }
                    { dialogData.type === 'question' && 
                            <>
                                <button onClick={evValidateButtonClick}>Yes</button>
                                <button onClick={evInvalidateButtonClick}>No</button>
                            </>
                    }
                    { dialogData.type === 'confirmation' && 
                            <>
                                <button onClick={evValidateButtonClick}>OK</button>
                                <button onClick={evInvalidateButtonClick}>Cancel</button>
                            </>
                    }
                </div>
            </>
        ) }
        </dialog>
    </>)
}

const useStandardDialog = () => {
    const [ dialogState, dialogDispatch ] = useContext(DialogContext)

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
