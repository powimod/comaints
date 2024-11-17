import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

import useUnitActions from '../actions/unitActions'
import { useComaintContext } from '../ComaintContext'

const UnitPage = () => {

    const navigate = useNavigate()
    const { comaintContext } = useComaintContext()
    const { listUnit } = useUnitActions()
    const [ unitList, setUnitList ] = useState(null)
    const [ error, setError ] = useState(null)

    useEffect(() => {
        if (comaintContext !== null && comaintContext.connected === false)
            navigate('/')
    }, [comaintContext])

    useEffect(() => {
        const getUnitList = async () => {
            try {
                setUnitList(await listUnit())
            }
            catch (error) {
                setError(error.message)
                setUnitList(null)
            }
        }
        getUnitList()
    }, [])

    return (<>
            <h1>Unit Page</h1>
            { error !== null && <div className='error-message'>{error}</div>}
            { unitList === null || unitList.length === 0 ? 
                    <div>Unit list is empty</div>
                    :
                    <>
                        <div>unit list (x{unitList.length}): </div>
                        <ul>
                        { unitList.map (unit => 
                                <li key={unit.id}>
                                    <Link to='/'>
                                        {unit.name}
                                    </Link>
                                </li>
                            )
                        }
                        </ul>
                    </>
            }
        </>)
}

export default UnitPage
