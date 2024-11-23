import { useState, useRef, useEffect, useContext } from 'react';

import { DialogContext } from './DialogContext';

import '../../scss/dialog.scss';

const BubbleMessage = () => {

    const [ dialogState, dialogDispatch ] = useContext(DialogContext);
    const [ message, setMessage ] = useState(null);
	const timeoutIdRef = useRef(null);

    const _showBubblePopup = (message, tempo = null) => {
        let timeoutId = timeoutIdRef.current;
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
            timeoutIdRef.current = null;
        }
        setMessage(message);	 
        if (tempo != null){
            timeoutId = setTimeout( () => {
                setMessage(null); 
                timeoutIdRef.current = null;
            }, tempo);
            timeoutIdRef.current = timeoutId;
        }
    };

    const _hideBubblePopup = () => {
        _showBubblePopup(null);
    };

	useEffect( () => {
		for (const request of dialogState) {
            const requestType = request.type;
            switch (requestType) {
                case 'bubble-show':
                    _showBubblePopup(request.message, request.duration); 
                    dialogDispatch({type:'acquit', id: request.id});
                    break;
                case 'bubble-hide':
				    _hideBubblePopup();
				    dialogDispatch({type:'acquit', id: request.id});
                    break;
                default:
                    // simply ignore other requests (flash message)
                    break;
			}
		}
	}, [dialogState]);

	return ( <>
		    { message !== null && ( <div className='bubble-message'>{message}</div> ) }
	    </>);
};

const useBubbleMessage = () => {
    const [ dialogState, dialogDispatch ] = useContext(DialogContext);

    const show = ({message, duration = null}) => {
        dialogDispatch({type:'bubble-show', message, duration});
    };

    const hide= () => {
        dialogDispatch({type:'bubble-hide'});
    };

    return { show, hide };
};

export { useBubbleMessage };
export default BubbleMessage;
