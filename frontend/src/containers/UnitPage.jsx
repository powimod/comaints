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
    const { updateUnitList, selectedUnit, unitList, getUnitById } = useUnitActions()
    const [ error, setError ] = useState(null)
    const [ activeElement, setActiveElement ] = useState('list')
    const componentInitializedRef = useRef(false)


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


    useEffect( () => {
        // enlever l'ID de l'URL après une suppression
        if (selectedUnit === null && id !== null)
            navigate('/units')

    }, [selectedUnit ])

    useEffect( () => {
        const elElementList = document.getElementById('element-list')
        const elElementEditor = document.getElementById('element-editor')
        if ( elElementList === null || elElementEditor  === null)
            return
        switch (activeElement) {
            case 'editor':
                elElementList.classList.add('inactive-element')
                elElementEditor.classList.remove('inactive-element')
                break;
            case 'list':
                elElementList.classList.remove('inactive-element')
                elElementEditor.classList.add('inactive-element')
                break;
            default:
                console.error('Invalid active element', activeElement)
        }
    }, [activeElement])


    const onPageNavigate = (action) => {
        refreshUnitList(action.page)
    }

    const onUnitLinkClick = () => {
        setActiveElement('editor')
    }

    const onEditorClose = () => {
        setActiveElement(() => 'list')
    }

    if ( unitList === null || unitList === undefined || unitList.list === null)
        return <></>

    return (<main className='list-page'>
                <div id='element-list' className='list-container'>
                    <h1>{t('page-title.unit')} (x{unitList.count})</h1>
                    <div>
                        { error !== null && <div className='error-message'>{error}</div>}
                        {  unitList.list === undefined || unitList.list.length === 0 ?
                            <div>{t('list-is-empty')}</div>
                            :
                            <>
                                <ul>
                                { unitList.list.map (unit =>
                                        <li key={unit.id}>
                                            <Link to={`/units/${unit.id}`} onClick={onUnitLinkClick }>
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
                <div id='element-editor'>
                    <UnitEditor onClose={onEditorClose}/>
                </div>
            </main>)
}


export default UnitPage
