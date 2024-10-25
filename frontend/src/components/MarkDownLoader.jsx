import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import i18n from 'i18next'

const MODE_NONE = 0; // FIXME really used ?
const MODE_TITLE_1 = 1
const MODE_TITLE_2 = 2
const MODE_TITLE_3 = 3
const MODE_PARAGRAPH = 5
const MODE_UNORDERED_LIST = 6
const MODE_ORDERED_LIST = 7

const MarkDownLoader = ({source}) => {
	const { t } = useTranslation()
	const orderedListRegExp =  new RegExp('^\\d+ +(.*)')

	const [ lang, setLang ] = useState(null)
    const [ content, setContent ] = useState(null)
    const [ error, setError] = useState(null)
    const [ url, setUrl ] = useState(null)
    const urlRef = useRef(null)

    useEffect( () => {
        setUrl( lang === null ? null : `content/${lang}/${source}`)
    }, [ lang ])

    useEffect( () => {
        urlRef.current = url
    }, [ url ])

	const onLanguageChanged = (lang) => {
		setLang(lang)
	}

	useEffect( () => {
		setLang(i18n.language)
		i18n.on('languageChanged', onLanguageChanged)
		return () => {
			i18n.off('languageChanged', onLanguageChanged)
		}
	}, [])

    useEffect( () => {
        const loadContent = async () => {
            let response = await fetch(urlRef.current)
            // .htaccess and vite.config has been customized to return an error if a MarkDown file does not exist. 
            // Otherwise all requests are redirected to index.html and fetch always obtains a 200 OK.
            console.log(response)
            if (! response.ok) {
                setError(`File «${urlRef.current}» not found`)
            }
            else {
                let data  = await response.text()
                interpretContent(data)
            }
        }
        loadContent()
    }, [ url ])


	const interpretContent = (data) => {
			const componentStack = []
			let currentComponent = null 
			let bulletList = []
			let orderedList = []
			let paragraph = []
			let n = 0
			let lastMode = MODE_NONE

			const lines = data.split('\n')
			lines.push(''); // add an empty line at then end to force last data to be rendered

			for (let line of lines) {
				line = line.trim()

				if (currentComponent === null) {
					currentComponent = []
					componentStack.push(currentComponent)
				}
				
				const extractOrderedItem =  orderedListRegExp.exec(line)

				let newMode = MODE_NONE
				if (line.startsWith('###'))
					newMode = MODE_TITLE_3 
				else if (line.startsWith('##'))
					newMode = MODE_TITLE_2 
				else if (line.startsWith('#'))
					newMode = MODE_TITLE_1 
				else if (line.startsWith('-'))
					newMode = MODE_ORDERED_LIST
				else if (extractOrderedItem !== null)
					newMode = MODE_UNORDERED_LIST
				else if (line.length > 0)
					newMode = MODE_PARAGRAPH

				// render and empty buffers when mode changes
				switch (lastMode) {
					case MODE_PARAGRAPH:
						if (newMode !== MODE_PARAGRAPH) {
							currentComponent.push(<p key={n++}>{paragraph.join('\n')}</p>)
							paragraph = []
						}
						break
					case MODE_ORDERED_LIST:
						if (newMode !== MODE_ORDERED_LIST) {
							currentComponent.push( <ul key={n++}> { bulletList.map( (line,i) => <li key={i}>{line}</li> ) } </ul>)
							bulletList = []
						}
						break
					case MODE_UNORDERED_LIST:
						if (lastMode === MODE_UNORDERED_LIST && newMode !== MODE_UNORDERED_LIST) {
							currentComponent.push( <ol key={n++}> { orderedList.map( (line,i) => <li key={i}>{line}</li> ) } </ol>)
							orderedList = []
						}
						break
				}

				switch (newMode) {
					case MODE_PARAGRAPH:
						paragraph.push(line)
						break
					case MODE_ORDERED_LIST:
						bulletList.push(line.substr(1).trim())
						break
					case MODE_UNORDERED_LIST:
						orderedList.push(extractOrderedItem[1])
						break
					case MODE_TITLE_3 :
						currentComponent.push(<h3 key={n++}>{line.substr(3).trim()}</h3>)
						break
					case MODE_TITLE_2 :
						currentComponent.push(<h2 key={n++}>{line.substr(2).trim()}</h2>)
						break
					case MODE_TITLE_1 :
						currentComponent.push(<h1 key={n++}>{line.substr(1).trim()}</h1>)
						break
				}

				lastMode = newMode
			}

			if (componentStack.length > 1)
				console.error('Component stack root is not unique')
			setContent(componentStack[0])
	}

    if (error !== null) 
        return <>Error {error}</>

    if (content === null) 
        return <>Loading...</>


	return (<>
        { content === null ?
            'Loading' :
            <>
                { content }
            </>
        }
        </>)
}

export default MarkDownLoader
