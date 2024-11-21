import { useDispatch, useSelector } from 'react-redux'
import { listUnitThunk, createUnitThunk, getUnitByIdThunk, editUnitThunk } from '../slices/unitSlice'

const useUnitActions = () => {
    const dispatch = useDispatch()
    const selectedUnitState = useSelector((state) => state.unit.selectedUnit)
    const unitListState = useSelector((state) => state.unit.unitList)

    const getSelectedUnit = () => {
        return selectedUnitState
    }

    const getUnitList = () => {
        return unitListState
    }

    const createUnit = async (unit) => {
        try {
            return await dispatch(createUnitThunk({unit})).unwrap()
        }
        catch (errorMessage) {
            throw new Error(errorMessage)
        }
    }

    const editUnit = async (unit) => {
        try {
            return await dispatch(editUnitThunk({unit})).unwrap()
        }
        catch (errorMessage) {
            throw new Error(errorMessage)
        }
    }

    const updateUnitList = async () => {
        try {
            return await dispatch(listUnitThunk()).unwrap()
        }
        catch (errorMessage) {
            throw new Error(errorMessage)
        }
    }

    const getUnitById = async (unitId) => {
        try {
            return await dispatch(getUnitByIdThunk({unitId})).unwrap()
        }
        catch (errorMessage) {
            throw new Error(errorMessage)
        }
    }

    return {
        getSelectedUnit,
        createUnit,
        editUnit,
        updateUnitList,
        getUnitById,
        getUnitList 
    }
}

export default useUnitActions

