import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useBubbleMessage }  from './dialog/BubbleMessage';
import { useStandardDialog }  from './dialog/StandardDialog';
import useUserActions from '../actions/userActions';
import EditorToolbar, {EditorToolbarModes, EditorToolbarActions} from './EditorToolbar';

import { controlObjectProperty, createObjectInstance,  diffObjectInstances } from '@common/objects/object-util.mjs';
import userObjectDef from '@common/objects/user-object-def.mjs';
import { ComaintTranslatedError } from '@common/error.mjs';

import '../scss/editor.scss';

const AdminUserEditor = ({ id=null,  className='', onClose = null }) => {
    const { t } = useTranslation();
    const bubbleMessage = useBubbleMessage();
    const standardDialog = useStandardDialog();

    const [ error, setError ] = useState(null)
    const [ editorMode, setEditorMode ] = useState(EditorToolbarModes.none)
    const [ editorAction, setEditorAction ] = useState(EditorToolbarActions.none)
    const { selectedUser, editUser, createUser, deleteUser } = useUserActions()
    const [ editedUser, setEditedUser ] = useState(null)

    useEffect( () => {
        console.log("dOm selected", selectedUser);
        setEditedUser(selectedUser);
    }, [selectedUser]);


    useEffect( () => {
        const { action } = editorAction;
        if (action === EditorToolbarActions.none)
            return;
        if (editedUser === null) {
            bubbleMessage.show({message: t('editor.no-element-selected'), duration:1500});
            return;
        }
        switch (action){
            case EditorToolbarActions.validate:
                validateChange();
                break;
            case EditorToolbarActions.delete:
                validateSuppression();
                break;
            case EditorToolbarActions.cancel:
                //no specific action to do for «cancel» and «close» action
                break;
            case EditorToolbarActions.close:
                if (onClose !== null && typeof(onClose) === 'function')
                    onClose();
                //no specific action to do for «cancel» and «close» action
                break;
        }
    }, [ editorAction ]);

    useEffect( () => {
        switch (editorMode){
            case EditorToolbarModes.create:
                setEditedUser(createObjectInstance(userObjectDef));
                break;
            case EditorToolbarModes.display:
                // there is nothing to do here
                break;
            case EditorToolbarModes.edit:
                // there is nothing to do here
                break;
        }
    }, [ editorMode ]);

    const validateChange = async () => {
       try {
            if (editedUser.id)
                await editUser(editedUser);
            else
                await createUser(editedUser);
        }
        catch (error) {
            let errorMessage = error.message;
            if (error instanceof ComaintTranslatedError)
                errorMessage = error.translate(t);
            bubbleMessage.show({message: errorMessage, duration:1500});
        }
    };


    const validateSuppression = async () => {
        const confirmation = await standardDialog.questionDialog(t('editor.confirm-delete-question'));
        if (! confirmation)
            return;
        try {
            await deleteUser(editedUser);
            setEditedUser(null);
            bubbleMessage.show({message: t('editor.delete-done'), duration:1500});
        }
        catch (error) {
            let errorMessage = error.message;
            if (error instanceof ComaintTranslatedError)
                errorMessage = error.translate(t);
            bubbleMessage.show({message: errorMessage, duration:1500});
        }
    };


    const onFieldValueChange = (ev) => {
        if (editorMode === EditorToolbarModes.display) {
            bubbleMessage.show({message: t('editor.display-mode'), duration:1500});
            return;
        }
        const elInput = ev.target;
        const propName = elInput.name;
        const propValue = elInput.value;
        const [ errorMsg, errorParams ] = controlObjectProperty(userObjectDef, propName, propValue);
        if (errorMsg)
            setError(t(errorMsg, errorParams));
        else
            setError(null);
        const updatedUser = {...editedUser};
        updatedUser[elInput.name] = elInput.value;
        setEditedUser(updatedUser);
    };

    className = `editor ${className}`;

    console.log("dOm selec", editedUser);

    return (<div id={id} className='editor'>
            <EditorToolbar
                title={t('editor.title')}
                mode={editorMode}
                setMode={setEditorMode}
                setAction={setEditorAction}
                canDelete={true}
                canClose={(onClose !== null)}
            />
            { (editedUser === null) ?  <>
                    <div className='input-container'>{t('editor.no-element-selected')}</div>
                </> : <>
                    {error !== null && <div className='error-message'>{error}</div>}
                    <div className='input-container'>
                        <label htmlFor='email'>{t('field.email')}</label>
                        <input type='text' name='email' 
                            value={editedUser?.email||''}
                            onChange={onFieldValueChange}
                        />
                    </div>
                </>
            }
        </div>);
};
export default AdminUserEditor;
