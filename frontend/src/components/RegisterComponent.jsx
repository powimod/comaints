import React, { useState } from 'react'
import STATUS from '../slices/status.js'
import useAuthActions from '../actions/authActions'

const RegistrationComponent = () => {

    const STEPS = {
        INPUT: 0,
        VALIDATION: 1
    }

    const { register, validateCode, getAuth } = useAuthActions()

    const [ step, setStep ] = useState(STEPS.INPUT)
    const [ email, setEmail ] = useState('')
    const [ password, setPassword ] = useState('')
    const [ code, setCode] = useState('')
    const { authStatus, authError } = getAuth()

    const evRegistrationButtonClick = async () => {
        const result = await register(email, password)
        console.log("dom register result", result)
        setStep(STEPS.VALIDATION)
    }

    const evValidationButtonClick = async () => {
        // TODO check code is a number
        const result = await validateCode(parseInt(code))
        console.log("dom code validation result", result)
    }

    // TODO translation
    return (
        <div>
            <h2>Registration</h2> 
            { step === STEPS.INPUT && <> 
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(ev) => setEmail(ev.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(ev) => setPassword(ev.target.value)}
                />
                <button onClick={evRegistrationButtonClick} disabled={authStatus === STATUS.LOADING}>
                    Validate
                </button>
            </>}
            { step === STEPS.VALIDATION && <> 
                <input
                    type="code"
                    placeholder="Validation Code"
                    value={code}
                    onChange={(ev) => setCode(ev.target.value)}
                />
                <button onClick={evValidationButtonClick} disabled={authStatus === STATUS.LOADING}>
                    Validate
                </button>

            </>}

        </div>
    )
}

export default RegistrationComponent

