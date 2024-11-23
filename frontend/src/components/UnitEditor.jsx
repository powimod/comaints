import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useBubbleMessage }  from './dialog/BubbleMessage';
import { useStandardDialog }  from './dialog/StandardDialog';
import useUnitActions from '../actions/unitActions';
import EditorToolbar, {EditorToolbarModes, EditorToolbarActions} from './EditorToolbar';

import { controlObjectProperty, createObjectInstance,  diffObjectInstances } from '@common/objects/object-util.mjs';
import unitObjectDef from '@common/objects/unit-object-def.mjs';
import { ComaintTranslatedError } from '@common/error.mjs';

import '../scss/editor.scss';

const UnitEditor = ({ id=null,  className='', onClose = null }) => {
    const { t } = useTranslation();
    const bubbleMessage = useBubbleMessage();
    const standardDialog = useStandardDialog();

    const [ error, setError ] = useState(null);
    const [ editorMode, setEditorMode ] = useState(EditorToolbarModes.none);
    const [ editorAction, setEditorAction ] = useState(EditorToolbarActions.none);
    const { getSelectedUnit, editUnit, createUnit, deleteUnit } = useUnitActions();
    const [ editedUnit, setEditedUnit ] = useState(null);

    const selectedUnit = getSelectedUnit();

    useEffect( () => {
        setEditedUnit(selectedUnit);
    }, [selectedUnit]);


    useEffect( () => {
        const { action } = editorAction;
        if (action === EditorToolbarActions.none)
            return;
        if (editedUnit === null) {
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
                setEditedUnit(createObjectInstance(unitObjectDef));
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
            if (editedUnit.id)
                await editUnit(editedUnit);
            else
                await createUnit(editedUnit);
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
            await deleteUnit(editedUnit);
            setEditedUnit(null);
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
        const [ errorMsg, errorParams ] = controlObjectProperty(unitObjectDef, propName, propValue);
        if (errorMsg)
            setError(t(errorMsg, errorParams));
        else
            setError(null);
        const updatedUnit = {...editedUnit};
        updatedUnit[elInput.name] = elInput.value;
        setEditedUnit(updatedUnit);
    };

    className = `editor ${className}`;

    return (<div id={id} className='editor'>
            <EditorToolbar
                title={t('editor.title')}
                mode={editorMode}
                setMode={setEditorMode}
                setAction={setEditorAction}
                canDelete={true}
                canClose={(onClose !== null)}
            />
            { (editedUnit === null) ?  <>
                    <div className='input-container'>{t('editor.no-element-selected')}</div>
                </> : <>
                    {error !== null && <div className='error-message'>{error}</div>}
                    <div className='input-container'>
                        <label htmlFor='name'>{t('field.name')}</label>
                        <input type='text' name='name' 
                            value={editedUnit?.name||''}
                            onChange={onFieldValueChange}
                        />
                    </div>
                    <div className='input-container'>
                        <label htmlFor='description'>{t('field.description')}</label>
                        <input type='text' name='description' 
                            value={editedUnit?.description||''} 
                            onChange={onFieldValueChange}
                        />
                    </div>
                    <div className='input-container'>
                        <label htmlFor='address'>{t('field.address')}</label>
                        <input type='text' name='address' 
                            value={editedUnit?.address||''} 
                            onChange={onFieldValueChange}
                        />
                    </div>
                    <div className='input-container'>
                        <label htmlFor='city'>{t('field.city')}</label>
                        <textarea name='city' 
                            rows="3"
                            value={editedUnit?.city||''}
                            onChange={onFieldValueChange}
                        />
                    </div>
                    <div className='input-container'>
                        <label htmlFor='zipCode'>{t('field.zipCode')}</label>
                        <input type='text' name='zipCode' 
                            value={editedUnit?.zipCode||''} 
                            onChange={onFieldValueChange}
                        />
                    </div>
                     <div className='input-container'>
                        <label htmlFor='country'>{t('field.country')}</label>
                        <input type='text' name='country'
                            value={editedUnit?.country||''} 
                            onChange={onFieldValueChange}
                        />
                    </div>
 
                </>
            }
        </div>);
};
export default UnitEditor;
