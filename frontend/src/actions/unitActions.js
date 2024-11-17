import { useDispatch, useSelector } from 'react-redux'
import { listUnitThunk, createUnitThunk, getUnitByIdThunk } from '../slices/unitSlice'

const useUnitActions = () => {
    const dispatch = useDispatch()
    const selectedUnitState = useSelector((state) => state.unit.selectedUnit)

    const getSelectedUnit = () => {
        return selectedUnitState
    }

    const createUnit = async ({unitName}) => {
        return await dispatch(createUnitThunk({unitName})).unwrap()
    }

    const listUnit = async () => {
        return await dispatch(listUnitThunk()).unwrap()
    }

    const getUnitById = async (unitId) => {
        return await dispatch(getUnitByIdThunk({unitId})).unwrap()
    }

    return {
        getSelectedUnit,
        createUnit,
        listUnit,
        getUnitById
    }
}

export default useUnitActions

