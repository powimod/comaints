import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import UnitEditor from '../components/UnitEditor'
import PageNavigator from '../components/PageNavigator'
import useUnitActions from '../actions/unitActions'
import { useComaintContext } from '../ComaintContext'

import '../scss/list-page.scss'

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
        refreshUnitList()
    }, [])

    const refreshUnitList = async (page = 1) => {
        try {
            await updateUnitList(page)
        }
        catch (error) {
            setError(error.message)
        }
    }

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

    const onPageNavigate = (action) => {
        refreshUnitList(action.page)
    }

    if (! unitList || unitList.list === null)
        return <>Unit list not initialized</>

    return (<div className='list-page'>

            <div className='list-container'>
                <h1>{t('page-title.unit')} (x{unitList.count})</h1>
                <div>
                    { error !== null && <div className='error-message'>{error}</div>}
                    {  unitList.list.length === 0 ?
                        <div>{t('list-is-empty')}</div>
                        :
                        <>
                            <ul>
                            { unitList.list.map (unit =>
                                    <li key={unit.id}>
                                        <Link to={`/unit/${unit.id}`}>
                                            {unit.name}
                                        </Link>
                                    </li>
                                )
                            }
                            </ul>
                            <PageNavigator list={unitList} onPageNavigate={onPageNavigate}/>
                        </>
                    }
                </div>
            </div>
            <UnitEditor/>
        </div>)
}



export default UnitPage
