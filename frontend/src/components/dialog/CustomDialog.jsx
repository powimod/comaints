/**
 * @module CustomDialog
 */

import PropTypes from 'prop-types';

import { useState, useRef, useEffect } from 'react';

import '../../scss/custom-dialog.scss';

/**
 * Display a custom dialog box (with no buttons). Content must be passed as React children.
 * @param {Array} props - the props array
 * @param {boolean} props.isOpen - a boolean which indicates if the dialog box is shown or hidden.
 * @param {function} props.onClose- function called when Escape key is pressed.
 * @param {string} props.className : CSS style to apply.
 * @param {Array.<JSX.Element} props.children - children to insert as content in the dialog box.
 * @returns {JSX.Element} - A React element representing the dialog box.
 *
 * * @example
 * import CustomDialog from './dialog/CustomDialog'
 *
 * const MyComponent = (props) => {
 * 	const [isMyDialogOpen, setMyDialogOpen] = useState(false)
 *
 * 	const openMyDialog = () => {
 * 		setMyDialogOpen(true)
 * 	}
 *
 * 	const onMyDialogClose = () => {
 * 		// called when Escape key is pressed (since there is not button in dialog box)
 * 		setMyDialogOpen(false)
 * 	}
 *
 * 	return (<>
 * 		<button onClick={openMyDialog}>Display dialog</button>
 * 		<CustomDialog isOpen={isMyDialogOpen} onClose={onMyDialogClose}>
 * 			<div>The custom content of dialog box here</div>
 * 		</CustomDialog>
 * 	</>)
 * }
 *
 */



const CustomDialog = ({isOpen, onClose, className = '',  children}) => {

	const [ dialogId, setDialogId ] = useState(parseInt(Math.random() * 1000));
	const [ isDialogOpen, setDialogOpen ] = useState(false);
	const dialogRef = useRef(null);

    className = `custom-dialog ${className}`.trim();

	useEffect(() => {
		const modalDialog = dialogRef.current;
		if (modalDialog === null)
			return;
		modalDialog.addEventListener('close', onDialogClose);
		return () => {
			modalDialog.removeEventListener('close', onDialogClose);
		};
	}, []);


	useEffect(() => {
		setDialogOpen(isOpen);
	}, [isOpen]);


	useEffect(() => {
		const modalDialog = dialogRef.current;
		if (modalDialog === null)
			return;
		if (isDialogOpen)
			modalDialog.showModal();
		else
			modalDialog.close();
	}, [isDialogOpen]);


	// onDialogClose is closed when Escape key is pressed or when dialog.close is called
	const onDialogClose = (ev) => {
		onClose();
	};

	return (<>
        { isOpen &&
            <dialog ref={dialogRef} className={className}>
                {children}
            </dialog>
        }
		</>);
};

CustomDialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    className: PropTypes.string,
    children: PropTypes.node,
};

export default CustomDialog;
