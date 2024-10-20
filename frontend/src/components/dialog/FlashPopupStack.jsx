import { useState, useRef, useEffect, useContext } from 'react'

import { DialogContext } from './DialogContext'

import '../../scss/dialog.scss'

const FlashPopupStack = ({flashPopupStack}) => {

	const [ dialogState, dialogDispatch ] = useContext(DialogContext)

	const onCloseButtonClicked = (popupId) => {
		flashPopupStackRemove(flashPopupStack, popupId)
	}

	useEffect( () => {
		for (const dialogRequest of dialogState) {
			if (dialogRequest.type === 'flash') {
				flashPopupStackAppend(flashPopupStack, dialogRequest.message, dialogRequest.duration)
				dialogDispatch({type:'acquit', id: dialogRequest.id})
			}
		}
	}, [dialogState])

	return (<div className="popup-stack"> {
			flashPopupStack.messageStack.map( (popup) =>  (
				<div key={popup.id}> {
					(popup.duration !== null) ? popup.message : <>
						<div>{popup.message}</div>
						<div><button onClick={ev => onCloseButtonClicked(popup.id)}>OK</button></div>
					</>
				}</div>
			))
		} </div>)
}

const newFlashPopupStack = () => {
	const [ _messageStack, _setMessageStack] = useState([])
	const _keyRef = useRef(null)
	return {
		messageStack: _messageStack,
		setMessageStack: _setMessageStack,
		keyRef: _keyRef
	}
}

const flashPopupStackAppend = (flashPopupStack, newMessage, duration = null) => {
	flashPopupStack.keyRef.current++
	const popupId = flashPopupStack.keyRef.current
	if (duration !== null) 
		setTimeout( () => {
			flashPopupStackRemove(flashPopupStack, popupId)
		}, duration)
	flashPopupStack.setMessageStack( (messageStack) => [{ 
		id: popupId, 
		message:newMessage, 
		duration: duration
	}, ...messageStack ])
}

const flashPopupStackRemove = (flashPopupStack, popupId) => {
	flashPopupStack.setMessageStack( (messageStack) => messageStack.filter( popup => { return (popup.id !== popupId)} ))
}

const flashPopupStackClear = (flashPopupStack) => {
	flashPopupStack.setMessageStack( (messageStack) =>  []);	 
}

const FlashPopup = {
    append: flashPopupStackAppend,
    remove: flashPopupStackRemove,
    clear: flashPopupStackClear,
}

export { FlashPopupStack, newFlashPopupStack, flashPopupStackAppend, flashPopupStackClear, flashPopupStackRemove }
export default FlashPopup
