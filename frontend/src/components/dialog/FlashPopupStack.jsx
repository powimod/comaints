import { useState, useRef, useEffect, useContext } from 'react'

import { DialogContext } from './DialogContext'

import '../../scss/dialog.scss'

const FlashPopupStack = () => {

    const [ dialogState, dialogDispatch ] = useContext(DialogContext)
    const [ messageStack, setMessageStack ] = useState([])

    const _flashPopupStackRemove = (popupId) => {
        setMessageStack( (stack) => stack.filter( popup => popup.id !== popupId ) )
    }

    const _flashPopupStackAppend = (popupId, message, duration = null, dismissible = false) => {
        if (duration !== null)
            setTimeout( () => {
                _flashPopupStackRemove(popupId)
            }, duration)
        setMessageStack( (stack) => [ ...stack, { id: popupId, message, duration, dismissible } ])
        return popupId
    }

    const _flashPopupStackClear = () => {
        setMessageStack( (stack) =>  [])
    }

    useEffect( () => {
        for (const request of dialogState) {
            const requestType = request.type
            switch (requestType) {
                case 'flash-add':
                    _flashPopupStackAppend(request.id, request.message, request.duration, request.dismissible)
                    dialogDispatch({type:'acquit', id: request.id})
                    break
                case 'flash-remove':
                    _flashPopupStackRemove(request.id)
                    dialogDispatch({type:'acquit', id: request.id})
                    break
                case 'flash-clear':
                    _flashPopupStackClear()
                    dialogDispatch({type:'acquit', id: request.id})
                    break
                default:
                    console.error(`Invalid request «${requestType}»`)
                    break
            }
        }
    }, [dialogState])

    const onCloseButtonClicked = (popupId) => {
        _flashPopupStackRemove(popupId)
    }

    return (<div className='popup-stack'> {
            messageStack.map( (popup) =>  (
                <div key={popup.id}> {
                    (popup.dismissible === false) ? popup.message : <>
                        <div>{popup.message}</div>
                        <div><button onClick={ev => onCloseButtonClicked(popup.id)}>OK</button></div>
                    </>
                }</div>
            ))
        } </div>)
}

const useFlashPopupStack = () => {
    const [ dialogState, dialogDispatch ] = useContext(DialogContext)
    const _keyRef = useRef(1)

    const add = ({message, duration = null, dismissible = false}) => {
        const id = _keyRef.current++
        dialogDispatch({type:'flash-add', id, message, duration, dismissible})
        return id
    }

    const remove = (id) => {
        dialogDispatch({type:'flash-remove', id})
    }

    const clear = (id) => {
        dialogDispatch({type:'flash-clear'})
    }

    return { add, remove, clear }
}

export { useFlashPopupStack }
export default FlashPopupStack
