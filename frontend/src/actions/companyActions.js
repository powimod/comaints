import { useDispatch, useSelector } from 'react-redux'
import { initializeCompanyThunk } from '../slices/companySlice'

const useCompanyActions = () => {
    const dispatch = useDispatch()
    const authState = useSelector((state) => state.auth)

    const initializeCompany = async (companyName) => {
        const result = await dispatch(initializeCompanyThunk({companyName}))
        if (initializeCompanyThunk.rejected.match(result)) 
            throw new Error(result.payload)
    }

    return {
        initializeCompany
    }
}

export default useCompanyActions

