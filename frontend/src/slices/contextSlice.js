import { createSlice } from '@reduxjs/toolkit'

const contextSlice = createSlice({
    name: 'context',
    initialState: {
        email: null,
        connected: false
    },
    reducers: {
        setContextInfo: (state, action) => {
            state.email = action.payload.email
            state.connected = action.payload.connected
        }
    }
})

export const { setContextInfo } = contextSlice.actions
export default contextSlice.reducer
