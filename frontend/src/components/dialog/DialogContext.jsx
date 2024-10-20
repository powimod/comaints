import { createContext, useReducer } from 'react'

const DialogContext = createContext([]);

const dialogReducer = (requestList, newRequest) => {

    let request, diagId 
    const requestType = newRequest.type

    switch (requestType) {
        case 'flash-add':
            diagId = (newRequest.id) ? newRequest.id : Date.now()
            const message = (newRequest.message) ? newRequest.message : '???'
            const duration = (newRequest.duration) ? newRequest.duration : null
            const dismissible = (newRequest.dismissible) ? newRequest.dismissible : false
            request = {
                type: requestType,
                id: diagId,
                message,
                duration,
                dismissible
            }
            return [ ...requestList, request]

        case 'flash-remove':
            diagId = newRequest.id
            request = {
                type: requestType,
                id: diagId
            }
            return [ ...requestList, request ]

        case 'flash-clear':
            request = {
                type: requestType
            }
            return [ ...requestList, request ]

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
