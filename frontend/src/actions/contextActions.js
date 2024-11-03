import { useDispatch, useSelector } from 'react-redux'
import { setContextInfo } from '../slices/contextSlice'

const useContextActions = () => {
    const dispatch = useDispatch()
    const contextState = useSelector((state) => state.context)

    const setContext = (context) => {
            console.log("setContext called with:", context);
        if (context.email !== null && typeof(context.email) !== 'string')
            throw new Error('Invalid «email» property in context')
        if (context.connected !== null && typeof(context.connected) !== 'boolean')
            throw new Error('Invalid «connected» property in context')
        return dispatch(setContextInfo(context))
    }

    return {
        contextState,
        setContext,
    }
}

export default useContextActions
