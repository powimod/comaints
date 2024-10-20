import { useState, useContext, useEffect, useRef } from 'react'

import { useFlashPopupStack }  from '../components/dialog/FlashPopupStack'
import { useBubbleMessage }  from '../components/dialog/BubbleMessage'
/*
import { DialogContext} from '../components/dialog/DialogContext'
import MessageDialog from '../components/dialog/MessageDialog'
import QuestionDialog from '../components/dialog/QuestionDialog'
import ConfirmationDialog from '../components/dialog/ConfirmationDialog'
*/

const DialogDemo = (props) => {

    const [ flashDialogId, setFlashDialogId ]  = useState(null)

    const flashPopupStack = useFlashPopupStack()
    const bubbleMessage = useBubbleMessage()

    //const [ dialogRequestList, pushDialogRequest ] = useContext(DialogContext)
    /*
     const [isHealthQuestionDialogOpen, setHealthQuestionDialogOpen] = useState(false)
     const [isHealthResponseDialogOpen, setHealthResponseDialogOpen] = useState(false)
     const [isConfirmationDialogOpen, setConfirmationDialogOpen] = useState(false)
    const [message, setMessage] = useState("")
    */

    const showFlashMessage = () => {
        const duration = parseInt(500 + Math.random() * 3000)
        flashPopupStack.add({message: `message ${Date.now()} (${duration}ms)`, duration})
    }

    const showPersistantFlashMessage = () => {
        if (flashDialogId === null) {
            setFlashDialogId(flashPopupStack.add({message: `Persistant flash message`}))
        }
        else {
            flashPopupStack.remove(flashDialogId)
            setFlashDialogId(null)
        }
    }

    const showDismissibleFlashMessage = () => {
        flashPopupStack.add({message: `Dissmissble message ${Date.now()}`, dismissible: true})
    }

    const clearFlashStack = () => {
        flashPopupStack.clear()
    }

    const showBubbleMessage = () => {
        const duration = parseInt(500 + Math.random() * 3000)
        bubbleMessage.show({message: `Bubble message ${Date.now()} (${duration}ms)`, duration})
    }

    const hideBubbleMessage = () => {
        bubbleMessage.hide()
    }


/*
    const showBlockingPopup = () => {
        pushDialogRequest({type:'flash', message: `message ${Date.now()}`})
    }


    const showHealthQuestionDialog = () => {
         setHealthQuestionDialogOpen(true)
    }

     const onHealthQuestionDialogResponse = (response) => {
         setHealthQuestionDialogOpen(false)
        if (response === null) {
            pushDialogRequest({type:'bubble.show', message: `No response (escape key was pressed)`, duration: 3000})
            return
        }
        if (response === true)
            setMessage("Fine! it's a good news!")
        else
            setMessage("Oh bad news! it makes me sad...")
         setHealthResponseDialogOpen(true)
     }

    const showConfirmationQuestionDialog = () => {
         setConfirmationDialogOpen(true)
    }

     const onConfirmationDialogResponse = (response) => {
         setConfirmationDialogOpen(false)
        let message
        if (response === true)
            message = "Action was confirmed"
        else
            message = "Action was canceled"
        pushDialogRequest({type:'bubble.show', message: message, duration: 3000})
     }


    const showHealthResponseDialog = () => {
         setHealthResponseDialogOpen(true)
    }

     const onHealthResponseDialogClose = () => {
         setHealthResponseDialogOpen(false)
     }
    */


    return (
        <main>
            <h1>Dialog demo</h1>

            <h2>Flash popup stack</h2>
            <div>
                <button onClick={showFlashMessage}>Flash message</button>
                <button onClick={showDismissibleFlashMessage}>Dismissible message</button>
                <button onClick={showPersistantFlashMessage}>
                    { flashDialogId === null ? 'Show': 'Hide' } persistant message
                </button>
                <button onClick={clearFlashStack}>Clear flash stack</button>
            </div>

            <h2>Bubble message</h2>
            <div>
                <button onClick={showBubbleMessage}>Show bubble message</button>
                <button onClick={hideBubbleMessage}>Hide bubble message</button>
            </div>
 
        {/*
            <div><button onClick={showBlockingPopup}>Blocking popup</button></div>
            <div><button onClick={showHealthQuestionDialog}>Show Question dialog</button></div>
            <div><button onClick={showConfirmationQuestionDialog}>Show Confirmation dialog</button></div>
            <QuestionDialog isOpen={isHealthQuestionDialogOpen} onResponse={onHealthQuestionDialogResponse}>
                Are you happy ?
            </QuestionDialog> 
            <MessageDialog isOpen={isHealthResponseDialogOpen} onClose={onHealthResponseDialogClose}>
                {message}
            </MessageDialog>
            <ConfirmationDialog isOpen={isConfirmationDialogOpen} onResponse={onConfirmationDialogResponse}>
                A popup message will be displayed...
            </ConfirmationDialog> 
            */}
        </main>
    )
}

export default DialogDemo
