import { useState, useRef, useEffect, useContext } from 'react'

import { DialogContext } from './DialogContext'

import '../../scss/dialog.scss'

const FlashPopupStack = () => {

    const [ dialogState, dialogDispatch ] = useContext(DialogContext)
    const [ messageStack, setMessageStack ] = useState([])
    const _keyRef = useRef(0)

    const _flashPopupStackRemove = (popupId) => {
        setMessageStack( (stack) => stack.filter( popup => popup.id !== popupId ) )
    }

    const _flashPopupStackAppend = (newMessage, duration = null) => {
        _keyRef.current++
        const popupId = _keyRef.current
        if (duration !== null)
            setTimeout( () => {
                _flashPopupStackRemove(popupId)
            }, duration)
        setMessageStack( (stack) => [ ...stack,
            {
                id: popupId,
                message:newMessage,
                duration: duration
            }
        ])
    }

    const _flashPopupStackClear = () => {
        flashPopupStack.setMessageStack( (stack) =>  [])
    }

    useEffect( () => {
        for (const dialogRequest of dialogState) {
            if (dialogRequest.type === 'flash') {
                _flashPopupStackAppend(dialogRequest.message, dialogRequest.duration)
                dialogDispatch({type:'acquit', id: dialogRequest.id})
            }
        }
    }, [dialogState])

    const onCloseButtonClicked = (popupId) => {
        _flashPopupStackRemove(popupId)
    }

    return (<div className="popup-stack"> {
            messageStack.map( (popup) =>  (
                <div key={popup.id}> {
                    (popup.duration !== null) ? popup.message : <>
                        <div>{popup.message}</div>
                        <div><button onClick={ev => onCloseButtonClicked(popup.id)}>OK</button></div>
                    </>
                }</div>
            ))
        } </div>)
}

const useFlashPopupStack = () => {
    const [ dialogState, dialogDispatch ] = useContext(DialogContext)

    const add = (message, duration = 3000) => {
        dialogDispatch({type:'flash', message, duration})
    }
    return { add }
}

export { useFlashPopupStack }
export default FlashPopupStack
