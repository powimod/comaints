import { useDispatch } from 'react-redux'
import { listUnitThunk, createUnitThunk } from '../slices/unitSlice'

const useUnitActions = () => {
    const dispatch = useDispatch()

    const createUnit = async ({unitName}) => {
        return await dispatch(createUnitThunk({unitName})).unwrap()
    }

    const listUnit = async () => {
        const unitList = await dispatch(listUnitThunk()).unwrap()
        console.log(unitList)
        return unitList
    }

    return {
        createUnit,
        listUnit
    }
}

export default useUnitActions

