
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import DashboardBloc from './DashboardBloc'

const ParcTypeBloc = () => {
	const { t } = useTranslation();
    /*
	const parcState = useSelector(selectParc)
	const [ blocData, setBlocData ] = useState(null)
	useEffect( () => {
		const data = parcState.type
		setBlocData(data)
	}, [ parcState ])
    */

	const onBlocClick = () => {
		console.log("Parc type bloc clicked")
	}

	return <DashboardBloc 
		className="bloc-equipment-type" 
		label="dashboard.bloc.type"
		icon="subcategory" 
		onClick={onBlocClick} /> 
}

export default ParcTypeBloc
