import { useState, useEffect, useRef } from 'react';

import '../scss/popup-menu.scss';

const PopupMenu = ({isVisible, setVisible, children}) => {

    const popupMenuBoxRef = useRef(null);

	useEffect( () => {
		if (! isVisible)
			return;
		setTimeout(()=> {
			popupMenuBoxRef.current.classList.add('menu-box-shown');
		}, 0);
	}, [isVisible]);

	const hidePopupMenu = () => {
		popupMenuBoxRef.current.addEventListener('transitionend', () => {
			setVisible(false);
		}, { once: true});
		popupMenuBoxRef.current.classList.remove('menu-box-shown');
	};

	return <>
		{isVisible && (
            <div className='popup-menu' onClick={hidePopupMenu}> {/* background */}
                <div ref={popupMenuBoxRef}> {/* menu box */}
                    <div onClick={hidePopupMenu}>×</div>
                    {children}
                </div>
		    </div>
        )}
	</>;
};
export default PopupMenu;
