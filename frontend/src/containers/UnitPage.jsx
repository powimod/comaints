import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import UnitEditor from '../components/UnitEditor'
import useUnitActions from '../actions/unitActions'
import { useComaintContext } from '../ComaintContext'

const UnitPage = () => {
    let { id } = useParams()
    if (id === undefined) // no unit ID specified in URL path
        id = null
	const { t } = useTranslation()
    const navigate = useNavigate()
    const { comaintContext } = useComaintContext()
    const { updateUnitList, getSelectedUnit, getUnitList, getUnitById } = useUnitActions()
    const unitList = getUnitList()
    const [ error, setError ] = useState(null)
    const componentInitializedRef = useRef(false)

    const selectedUnit = getSelectedUnit()

    useEffect(() => {
        if (comaintContext === null || comaintContext.connected === false)
            navigate('/')
    }, [comaintContext])

    useEffect(() => {
        // detect react strict mode 
        if ( componentInitializedRef.current  === true)
            return
        componentInitializedRef.current = true

        const getUnitList = async () => {
            try {
                await updateUnitList()
            }
            catch (error) {
                setError(error.message)
            }
        }
        getUnitList()
    }, [])

    useEffect(() => {
        const getUnit = async () => {
            try {
                await getUnitById(id)
            }
            catch (error) {
                setError(error.message)
            }
        }
        if (id === null) // no unit ID specified in URL
            return
        if (selectedUnit === null || selectedUnit.id != id)
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
            <UnitEditor/>
        </>)
}

export default UnitPage
