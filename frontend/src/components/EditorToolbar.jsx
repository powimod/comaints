/**
 * @module EditorToolbar
 */

import { useState, useEffect, useRef } from 'react'

import StockButton from './StockButton'

const MODE_NONE = 0
const MODE_DISPLAY = 1
const MODE_EDIT = 2
const MODE_CREATE = 3

/**
 * Enumeration of display modes
 * @typedef {integer} EditorToolbarModes 
 * @property {integer} display : display mode
 * @property {integer} edit : edit mode
 * @property {integer} create : createmode
 */
const EditorToolbarModes = {
	none:     MODE_NONE, /* when dialog which contains the toolbar is hidden */
	display : MODE_DISPLAY,
	edit    : MODE_EDIT,
	create  : MODE_CREATE
}

const ACTION_NONE = 0
const ACTION_CLOSE = 1
const ACTION_DELETE = 2
const ACTION_VALIDATE = 3
const ACTION_CANCEL = 4

/**
 * Enumeration of editor actions
 * @typedef {integer} EditorToolbarActions 
 * @property {integer} close : close button was pressed 
 * @property {integer} delete : delete button was pressed
 * @property {integer} validate : OK button was pressed
 * @property {integer} cancel : Cancel button was pressed
 */
const EditorToolbarActions = {
	none     : ACTION_NONE,
	close    : ACTION_CLOSE,
	delete   : ACTION_DELETE,
	validate : ACTION_VALIDATE,
	cancel   : ACTION_CANCEL
}


/**
 * @summary Represent a toolbar with buttons depending on the current mode (edit/create/display)
 *
 * In Display mode, the toolbar displays :
 * <ul>
 * <li>An Edit button</li>
 * <li>Eventually a Delete button if the 'canDelete' property is true.</li>
 * <li>Eventually a Close button if the property 'canClose' is true.</li>
 * </ul>
 *
 * <p>When the Edit button is pressed, editor switches in Edit mode and these buttons are replaced by OK/Cancel buttons.</p>
 * <p>When the Delete button is pressed, setAction is called with [EditorToolbarActions.delete] as argument.
 * <p>When the Close button is pressed, setAction is called with [EditorToolbarActions.close] as argument.
 *
 *
 * In Edit mode, the toolbar displays :
 * <ul>
 * 	<li>A Validate button</li>
 * 	<li>A Cancel button</li>
 * </ul>
 *
 * <p>When the Validate button is pressed, setAction is called with [EditorToolbarActions.validate] as argument and 
 * the editor switches in Display mode showing the Edit/Delete/Close buttons.</p>
 *
 * <p>When the Cancel button is pressed, setAction is called with [EditorToolbarActions.cancel] and the editor switches in Display mode.</p>
 *
 * In Create mode, the toolbar displays :
 * <ul>
 * 	<li>A Validate button</li>
 * 	<li>A Cancel button</li>
 * </ul>
 *
 * <p>When the Validate button is pressed, setAction is called with [EditorToolbarActions.validate] as argument and 
 * the editor switches in Display mode showing the Edit/Delete/Close buttons.</p>
 *
 * <p>When the Cancel button is pressed, setAction is closed with the (EditorToolbarActions.cancel) :
 * The called function should close the dialog editor. </p>
 *
 *
 * @component
 * @param {Object} props - the props object.
 * @param {string=} props.title - a title to display on the left (optionnel)
 * @param {EditorToolbarModes} props.mode - indique le mode de base de l'éditeur entre édition et création
 * @param {function} props.setMode : function called when the mode changes from 'display' / 'edit'
 * @param {function} props.setAction : function called when an action is selected (EditorToolbarActions)
 * @param {boolean=} props.canDelete - indique si un bouton de suppression doit être affiché
 * @param {boolean=} props.canClose - indique si un bouton de fermeture (de boîte de dialogue) doit être affiché
 *
 * @returns {JSX.Element} - A React icon representing the toolbar.
 */

const EditorToolbar = ({title=null, mode, setMode, setAction, canCreate=true, canDelete=false, canClose=true}) => {
	if (mode === undefined)
		throw new Error('Mode argument is not defined')
	if (setMode === undefined)
		throw new Error('setMode argument is not defined')
	if (typeof(setMode) !== 'function')
		throw new Error('setMode argument is not a function')
	if (setAction === undefined)
		throw new Error('setAction argument is not defined')
	if (typeof(setAction) !== 'function')
		throw new Error('setAction argument is not a function')

	const [ internalAction, setInternalAction ] = useState(ACTION_NONE)
    const actionNumberRef = useRef(0)

	useEffect( () => {
		setMode(mode)
	}, [mode])

	useEffect( () => {
        if (internalAction === ACTION_NONE)
            return
        setAction(() => {
            // passer un compteur qui change pour empêcher React de vouloir le supprimer pour optimiser
            actionNumberRef.current++ 
            return {
                action: internalAction,
                actionNumber: actionNumberRef.current
            }
        })
        // FIXME peut-on renvoyer directement la valeur ?
        setInternalAction(() => ACTION_NONE)
	}, [internalAction])

	useEffect( () => {
		setMode(() => MODE_DISPLAY)
		setInternalAction(() => ACTION_NONE)
	}, [])

	const onCreateButtonClick = () => {
		setMode(MODE_CREATE)
	}

	const onEditButtonClick = () => {
		setMode(MODE_EDIT)
	}

	const onDeleteButtonClick = () => {
		setInternalAction(ACTION_DELETE)
	}

	const onValidateButtonClick = () => {
		setInternalAction(ACTION_VALIDATE)
		setMode(MODE_DISPLAY)
	}

	const onCancelButtonClick = () => {
		setInternalAction(ACTION_CANCEL)
		setMode(MODE_DISPLAY)
	}

	const onCloseButtonClick = () => {
		setMode(MODE_DISPLAY)
		setInternalAction(ACTION_CLOSE)
	}

	return ( <div className='editor-toolbar'>
			{ title && <span>{title}</span> }
			{ mode === MODE_DISPLAY && <> 
                { canCreate && <StockButton icon='create' button='true' onClick={onCreateButtonClick}/>}
				<StockButton icon='edit' button='true' onClick={onEditButtonClick}/>
				{ canDelete && <StockButton icon='delete' button='true' onClick={onDeleteButtonClick}/> }
				{ canClose && <StockButton icon='cancel' button='true' onClick={onCloseButtonClick} /> }
			</>}
			{ mode === MODE_EDIT && <> 
				<StockButton icon='validate' button='true' onClick={onValidateButtonClick}/>
				<StockButton icon='cancel' button='true' onClick={onCancelButtonClick}/>
			</>}
			{ mode === MODE_CREATE && <>
				<StockButton icon='validate' button='true' onClick={onValidateButtonClick}/>
				<StockButton icon='cancel' button='true' onClick={onCancelButtonClick}/>
			</>}
		</div>)
}

export { EditorToolbarModes, EditorToolbarActions}
export default EditorToolbar
