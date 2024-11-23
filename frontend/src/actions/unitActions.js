import { useDispatch, useSelector } from 'react-redux';
import { listUnitThunk, createUnitThunk, getUnitByIdThunk, editUnitThunk, deleteUnitThunk } from '../slices/unitSlice';
import { controlObject } from '@common/objects/object-util.mjs';
import unitObjectDef from '@common/objects/unit-object-def.mjs';
import { ComaintTranslatedError } from '@common/error.mjs';

const useUnitActions = () => {
    const dispatch = useDispatch();
    const selectedUnitState = useSelector((state) => state.unit.selectedUnit);
    const unitListState = useSelector((state) => state.unit.unitList);

    const getSelectedUnit = () => {
        return selectedUnitState;
    };

    const getUnitList = () => {
        return unitListState;
    };

    const createUnit = async (unit) => {
        const [ errorMsg, errorParams ] = (controlObject(unitObjectDef, unit, {fullCheck:false}));
        if (errorMsg)
            throw new ComaintTranslatedError(errorMsg, errorParams);
        try {
            return await dispatch(createUnitThunk({unit})).unwrap();
        }
        catch (errorMessage) {
            throw new Error(errorMessage);
        }
    };

    const editUnit = async (unit) => {
        const [ errorMsg, errorParams ] = (controlObject(unitObjectDef, unit, {fullCheck:true}));
        if (errorMsg)
            throw new ComaintTranslatedError(errorMsg, errorParams);
        try {
            return await dispatch(editUnitThunk({unit})).unwrap();
        }
        catch (errorMessage) {
            throw new Error(errorMessage);
        }
    };

    const deleteUnit = async (unit) => {
        const [ errorMsg, errorParams ] = (controlObject(unitObjectDef, unit, {fullCheck:true}));
        if (errorMsg)
            throw new ComaintTranslatedError(errorMsg, errorParams);
        try {
            return await dispatch(deleteUnitThunk({unit})).unwrap();
        }
        catch (errorMessage) {
            throw new Error(errorMessage);
        }
    };


    const updateUnitList = async (page = 1) => {
        try {
            return await dispatch(listUnitThunk({page})).unwrap();
        }
        catch (errorMessage) {
            throw new Error(errorMessage);
        }
    };

    const getUnitById = async (unitId) => {
        try {
            return await dispatch(getUnitByIdThunk({unitId})).unwrap();
        }
        catch (errorMessage) {
            throw new Error(errorMessage);
        }
    };

    return {
        getSelectedUnit,
        createUnit,
        editUnit,
        deleteUnit,
        updateUnitList,
        getUnitById,
        getUnitList
    };
};

export default useUnitActions;

