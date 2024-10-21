import { useState, useEffect } from 'react'

import '../scss/popup-menu.scss'

const PopupMenu = ({isVisible, setVisible, children}) => {

	useEffect( () => {
		if (! isVisible)
			return
		const popupMenuBox = document.getElementById('popup-menu')
		setTimeout(()=> {
			popupMenuBox.classList.add('menu-box-shown')
		}, 0)
	}, [isVisible])

	const hidePopupMenu = () => {
		const popupMenuBox = document.getElementById('popup-menu')
		popupMenuBox.addEventListener('transitionend', () => {
			setVisible(false)
		})
		popupMenuBox.classList.remove('menu-box-shown')
	}
	return <>
		{isVisible && (
            <div className='popup-menu' onClick={hidePopupMenu}>
                <div id="popup-menu">
                    <div onClick={hidePopupMenu}>X</div>
                    {children}
                </div>
		    </div>
        )}
	</>
}
export default PopupMenu
