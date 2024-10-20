import { createContext, useReducer } from 'react'

const DialogContext = createContext([]);

const dialogReducer = (requestList, newRequest) => {

	switch (newRequest.type) {
		case 'flash':
			const flashMessage = (newRequest.message) ? newRequest.message : '???'
			const flashDuration = (newRequest.duration) ? newRequest.duration : null
			const flashRequest = {
				id: Date.now(),
				type: 'flash',
				message: flashMessage,
				duration: flashDuration
			}
			return [ ...requestList, flashRequest ]

		case 'bubble.show':
			const bubbleMessage = (newRequest.message) ? newRequest.message : '???'
			const bubbleDuration = (newRequest.duration) ? newRequest.duration : 2000
			const showBubbleRequest = {
				id: Date.now(),
				type: 'bubble.show',
				message: bubbleMessage,
				duration: bubbleDuration
			}
			return [ ...requestList, showBubbleRequest ]

		case 'bubble.hide':
			const hideBubbleRequest = {
				id: Date.now(),
				type: 'bubble.hide'
			}
			return [ ...requestList, hideBubbleRequest ]

		case 'acquit':
			const id = newRequest.id
			return requestList.filter( request => request.id !== id)

		default:
			return requestList
	}
}

const DialogProvider = ({children}) => {
	const [dialogRequestList, newDialogRequest] = useReducer(dialogReducer, [])
        return(
		<DialogContext.Provider value={ [ dialogRequestList, newDialogRequest ] }>
			{children}
                </DialogContext.Provider>
        )
}

export { DialogContext }
export default DialogProvider
