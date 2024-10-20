import { useState, useRef, useEffect, useContext } from 'react'

import { DialogContext } from './DialogContext'

import '../../scss/dialog.scss'

const StandardDialog = () => {

    const [ dialogState, dialogDispatch ] = useContext(DialogContext)
    const [ dialogData, setDialogData] = useState(null)
    const dialogRef = useRef(null)

    const _showDialog = (dialogType, message, resolve)  => {
        setDialogData({ type:dialogType, message, resolve })
    }

    /*
    useEffect( () => {
        const modalDialog = dialogRef.current
        if (modalDialog === null)
            return
        modalDialog.addEventListener('close', evDialogClose)
        return () => {
            modalDialog.removeEventListener('close', evDialogClose)
        }
    }, [dialogRef.current])
    */

	useEffect( () => {
		for (const request of dialogState) {
            const requestType = request.type
            if (requestType === 'standard-dialog') {
                _showDialog(request.dialog, request.message, request.resolve) 
                dialogDispatch({type:'acquit', id: request.id})
			}
		}
	}, [dialogState])

    useEffect( () => {
        if (dialogRef.current === null)
            return
        if (dialogData !== null)
            dialogRef.current.showModal()
        else
            dialogRef.current.hide()
    }, [dialogData])

    const evDialogClose = () => {
        console.log("dOm dialog close")
        dialogData.resolve(false)
        setDialogData(null)
    }

    const evValidateButtonClick = () => {
        dialogData.resolve(true)
        setDialogData(null)
    }

    const evInvalidateButtonClick = () => {
        dialogData.resolve(false)
        setDialogData(null)
    }

	return ( <>
        { dialogData !== null && (
            <dialog ref={dialogRef} className='standard-dialog'>
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
            </dialog>
        ) }
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
