import { useDispatch } from 'react-redux'
import { listUnitThunk, createUnitThunk, getUnitByIdThunk } from '../slices/unitSlice'

const useUnitActions = () => {
    const dispatch = useDispatch()

    const createUnit = async ({unitName}) => {
        return await dispatch(createUnitThunk({unitName})).unwrap()
    }

    const listUnit = async () => {
        return await dispatch(listUnitThunk()).unwrap()
    }

    const getUnitById = async (unitId) => {
        console.log("dOm action getUnitById", unitId)
        return await dispatch(getUnitByIdThunk({unitId})).unwrap()
    }

    return {
        createUnit,
        listUnit,
        getUnitById
    }
}

export default useUnitActions

