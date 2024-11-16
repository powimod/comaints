import { useDispatch } from 'react-redux'
import { createUnitThunk } from '../slices/unitSlice'

const useUnitActions = () => {
    const dispatch = useDispatch()

    const createUnit = async (unitName) => {
        const result = await dispatch(createUnitThunk({ unitName }))
        if (createUnitThunk.rejected.match(result)) 
            throw new Error(result.payload)
    }

    return {
        createUnit
    }
}

export default useUnitActions

