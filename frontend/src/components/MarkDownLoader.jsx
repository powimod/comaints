import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import i18n from 'i18next';

import '../scss/markdown-loader.scss';

const MODE_NONE = 0;
const MODE_TITLE_1 = 1;
const MODE_TITLE_2 = 2;
const MODE_TITLE_3 = 3;
const MODE_PARAGRAPH = 5;
const MODE_UNORDERED_LIST = 6;
const MODE_ORDERED_LIST = 7;

const MarkDownLoader = ({source}) => {
	const { t } = useTranslation();
	const orderedListRegExp =  new RegExp('^\\d+ +(.*)');

	const [ lang, setLang ] = useState(null);
    const [ error, setError] = useState(null);
    const [ textContent, setTextContent ] = useState(null);
    const [ contentComponents, setContentComponents ] = useState(null);

    useEffect(() => {
        setLang(i18n.language);
        const onLanguageChanged = (lang) => {
            console.log("dOm language changed", lang);
            setLang(lang);
        };
        i18n.on('languageChanged', onLanguageChanged);
        return () => {
            i18n.off('languageChanged', onLanguageChanged);
        };
    }, []);

    useEffect(() => {
        const url = lang === null ? null : `content/${lang}/${source}`;
        console.log("dOm url changed", url);
        const loadContent = async () => {
            try {
                let response = await fetch(url);
                if (! response.ok)
                    throw new Error(response.statusText);
                let text = await response.text();
                setTextContent(text);
            } catch (error) {
                setError(`Failed to load «${url}» : ${error.message}`);
                console.error(error);
            }
        };
        if (lang !== null)
            loadContent();
    }, [lang, source]);


    useEffect( () => {
        if (textContent === null)
            return;

        const componentArray = [];
        let contextBuffer = [];
        let n = 0;
        let lastMode = MODE_NONE;

        const lines = textContent.split('\n');
        lines.push(''); // add an empty line at then end to force last data to be rendered

        for (let line of lines) {
            line = line.trim();

            
            const extractOrderedItem =  orderedListRegExp.exec(line);

            let newMode = MODE_NONE;
            if (line.startsWith('###'))
                newMode = MODE_TITLE_3; 
            else if (line.startsWith('##'))
                newMode = MODE_TITLE_2; 
            else if (line.startsWith('#'))
                newMode = MODE_TITLE_1; 
            else if (line.startsWith('-'))
                newMode = MODE_ORDERED_LIST;
            else if (extractOrderedItem !== null)
                newMode = MODE_UNORDERED_LIST;
            else if (line.length > 0)
                newMode = MODE_PARAGRAPH;

            // render and empty buffers when mode changes
            switch (lastMode) {
                case MODE_PARAGRAPH:
                    if (newMode !== MODE_PARAGRAPH) {
                        componentArray.push(<p key={n++}>{contextBuffer.join('\n')}</p>);
                        contextBuffer = [];
                    }
                    break;
                case MODE_ORDERED_LIST:
                    if (newMode !== MODE_ORDERED_LIST) {
                        componentArray.push(<ul key={n++}> { contextBuffer.map( (line,i) => <li key={i}>{line}</li> ) } </ul>);
                        contextBuffer = [];
                    }
                    break;
                case MODE_UNORDERED_LIST:
                    if (lastMode === MODE_UNORDERED_LIST && newMode !== MODE_UNORDERED_LIST) {
                        componentArray.push(<ol key={n++}> { contextBuffer.map( (line,i) => <li key={i}>{line}</li> ) } </ol>);
                        contextBuffer = [];
                    }
                    break;
            }

            switch (newMode) {
                case MODE_PARAGRAPH:
                    contextBuffer.push(line);
                    break;
                case MODE_ORDERED_LIST:
                    contextBuffer.push(line.substr(1).trim());
                    break;
                case MODE_UNORDERED_LIST:
                    contextBuffer.push(extractOrderedItem[1]);
                    break;
                case MODE_TITLE_3 :
                    componentArray.push(<h3 key={n++}>{line.substr(3).trim()}</h3>);
                    break;
                case MODE_TITLE_2 :
                    componentArray.push(<h2 key={n++}>{line.substr(2).trim()}</h2>);
                    break;
                case MODE_TITLE_1 :
                    componentArray.push(<h1 key={n++}>{line.substr(1).trim()}</h1>);
                    break;
            }

            lastMode = newMode;
        }

        setContentComponents(componentArray);
	}, [ textContent ]);

    if (error !== null) 
        return <>Error {error}</>;

    if (contentComponents === null) 
        return <>{t('loading')}</>;

	return (<div className='markdown'>
            { contentComponents }
        </div>);
};

export default MarkDownLoader;
