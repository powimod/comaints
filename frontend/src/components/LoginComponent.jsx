import React, { useState, useEffect } from 'react'
import STATUS from '../slices/status.js'
import useAuthActions from '../actions/authActions'
import { useComaintApi } from '../ComaintApi'

const LoginComponent = () => {
    const { login, getAuth } = useAuthActions()
    const [ email, setEmail ] = useState('')
    const [ password, setPassword ] = useState('')
    const { authStatus, authError } = getAuth()

    const { comaintContext } = useComaintApi()

    const handleLogin = () => {
        login(email, password)
    }

    useEffect( ()=> {
       console.log("email", email) 
       console.log("password", password) 
    },[email, password])

    useEffect( ()=> {
        console.log("Login component context change", comaintContext)

    }, [comaintContext])

    return (
        <div>
            <h2>Login</h2>
            <input
                id='email'
                type='email'
                placeholder="Email"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
            />
            <input
                id='password'
                type='password'
                placeholder="Password"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
            />
            <button onClick={handleLogin} disabled={authStatus === STATUS.LOADING}>
                {authStatus === STATUS.LOADING ? 'Logging in...' : 'Login'}
            </button>
            {authStatus === STATUS.FAILED && <p style={{ color: 'red' }}>Error: {authError}</p>}
        </div>
    )
}

export default LoginComponent

