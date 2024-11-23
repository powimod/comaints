import { useState } from 'react'

import { useFlashPopupStack }  from '../components/dialog/FlashPopupStack'
import { useBubbleMessage }  from '../components/dialog/BubbleMessage'
import { useStandardDialog }  from '../components/dialog/StandardDialog'

const DialogDemo = (props) => {

    const [ flashDialogId, setFlashDialogId ]  = useState(null)

    const flashPopupStack = useFlashPopupStack()
    const bubbleMessage = useBubbleMessage()
    const standardDialog = useStandardDialog()

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

    const showMessageDialog = async () => {
        await standardDialog.messageDialog('This is a first message dialog')
        await standardDialog.messageDialog('This is a second message dialog')
    }

    const showQuestionDialog = async () => {
        const valid = await standardDialog.questionDialog('Are you happy ?')
        if (valid)
            await standardDialog.messageDialog("Fine! it's a good news!")
        else
            await standardDialog.messageDialog("Oh bad news! it makes me sad...")
    }

    const showConfirmationDialog = async () => {
        const valid = await standardDialog.confirmationDialog('A popup message will be displayed...')
        if (valid)
            await standardDialog.messageDialog("Here is the popup message")
    }


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

            <h2>Standard message</h2>
            <div>
                <button onClick={showMessageDialog}>Show message dialog</button>
                <button onClick={showQuestionDialog}>Show question dialog</button>
                <button onClick={showConfirmationDialog}>Show confirmation dialog</button>
            </div>
 
        </main>
    )
}

export default DialogDemo
