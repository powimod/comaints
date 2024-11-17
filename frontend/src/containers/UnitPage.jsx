import { useState, useEffect } from 'react'
import { useNavigate, Link, useParams } from 'react-router-dom'

import UnitEditor from '../components/UnitEditor'
import useUnitActions from '../actions/unitActions'
import { useComaintContext } from '../ComaintContext'

const UnitPage = () => {

    const navigate = useNavigate()
    const { comaintContext } = useComaintContext()
    const { listUnit, getUnitById } = useUnitActions()
    const { id } = useParams()
    const [ unitList, setUnitList ] = useState(null)
    const [ selectedUnit, setSelectedUnit ] = useState(null)
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

    useEffect(() => {
        const getUnit = async () => {
            try {
                setSelectedUnit(await getUnitById(id))
            }
            catch (error) {
                setError(error.message)
                setSelectedUnit(null)
            }
        }
        getUnit()
    }, [id])

    return (<>
            <h1>Unit Page</h1>
            { error !== null && <div className='error-message'>{error}</div>}
            { unitList === null || unitList.length === 0 ? 
                    <div>Unit list is empty</div>
                    :
                    <>
                        <div>Unit list (x{unitList.length}): </div>
                        <ul>
                        { unitList.map (unit => 
                                <li key={unit.id}>
                                    <Link to={`/unit/${unit.id}`}>
                                        {unit.name}
                                    </Link>
                                </li>
                            )
                        }
                        </ul>
                    </>
            }
            { selectedUnit !== null && 
                <UnitEditor unitId={selectedUnit.id}/>
            }
        </>)
}

export default UnitPage
