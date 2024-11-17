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

    const createUnit = async ({unitName}) => {
        return await dispatch(createUnitThunk({unitName})).unwrap()
    }

    const editUnit = async (unit) => {
        return await dispatch(editUnitThunk({unit})).unwrap()
    }

    const updateUnitList = async () => {
        return await dispatch(listUnitThunk()).unwrap()
    }

    const getUnitById = async (unitId) => {
        return await dispatch(getUnitByIdThunk({unitId})).unwrap()
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

