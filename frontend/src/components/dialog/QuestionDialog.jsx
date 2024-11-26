import { useTranslation } from 'react-i18next';
import { useRef, useEffect } from 'react';
import CustomDialog from './CustomDialog';

/**
 * Display a confirmation dialog box with Yes/No buttons
 * @param {Array} props - the props array
 * @param {boolean} props.isOpen - a boolean which indicates if the dialog box is shown or hidden.
 * @param {function} props.onResponse - function called when buttons is pressed. 
 * 	The response is null passed with a response argument which can be a boolean or null :
 * 	it' true if Yes button was pressed and is false if No button pressed.
 * 	It can be null if dialog was presse by pressing the Escape key !
 * @param {string} props.className : CSS style to apply.
 * @param {Array.<JSX.Element} props.children - children to insert as content in the dialog box.
 * @returns {JSX.Element} - A React element representing the dialog box.
 *
 * @example
 * import QuestionDialog from './dialog/QuestionDialog'
 * 
 * const MyComponent = (props) => {
 * 	const [isMyDialogOpen, setMyDialogOpen] = useState(false)
 * 
 * 	const openMyDialog = () => {
 * 		setMyDialogOpen(true)
 * 	}
 * 
 * 	const onMyDialogResponse = (response) => {
 * 		if (response !== null)  {
 * 			if (response === true)
 * 				console.log("Your response is Yes")
 * 			else
 * 				console.log("Your response is No")
 * 		}
 * 		else {
 * 			console.log("Escapke key was pressed to close dialog")
 * 		}
 * 		setMyDialogOpen(false)
 * 	}
 * 
 * 	return (<>
 * 		<button onClick={openMyDialog}>Display dialog</button>
 * 		<QuestionDialog isOpen={isMyDialogOpen} onResponse={onMyDialogResponse}>My question here</QuestionDialog> 
 * 	</>)
 * }
 *
 */
const QuestionDialog = ({isOpen, onResponse, className = '', children}) => {
	if (isOpen === undefined)
		throw new Error('Argument [isOpen] is missing');
	if (typeof(isOpen) !== 'boolean')
		throw new Error('Argument [isOpen] is not a boolean');
	if (onResponse === undefined)
		throw new Error('Argument [onResponse] is missing');
	if (typeof(onResponse) !== 'function')
		throw new Error('Argument [onResponse] is not a function');
	if (children === undefined)
		throw new Error('Argument [children] is missing');

	const { t } = useTranslation();

	const dialogResponseRef = useRef(null); // null is returned when escape key is pressed

	useEffect( () => {
		if (isOpen)
			dialogResponseRef.current = null;
	}, [isOpen]);

	const onYesResponse = () => {
		dialogResponseRef.current = true;
		onDialogClosed();
	};

	const onNoResponse = () => {
		dialogResponseRef.current = false; 
		onDialogClosed();
	};

	const onDialogClosed = () => {
		// called by Dialog when Escape key is pressed or when dialog.close is called
		onResponse(dialogResponseRef.current);
		dialogResponseRef.current = null;
	};

	className = [ 'standard-dialog', className ].join(' ').trim();

	return (<CustomDialog isOpen={isOpen} onClose={onDialogClosed} className={className}>
			<div>{children}</div>
			<div>
				<button onClick={onYesResponse}>{t('button.yes')}</button>
				<button onClick={onNoResponse}>{t('button.no')}</button>
			</div>
		</CustomDialog>);
};

export default QuestionDialog;
