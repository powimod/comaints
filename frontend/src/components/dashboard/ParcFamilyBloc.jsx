
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import DashboardBloc from './DashboardBloc'

const ParcFamilyBloc = () => {
	const { t } = useTranslation();
    /*
	const parcState = useSelector(selectParc)
	const [ blocData, setBlocData ] = useState(null)
	useEffect( () => {
		const data = parcState.family
		setBlocData(data)
	}, [ parcState ])
    */

	const onBlocClick = () => {
		console.log("Parc family bloc clicked")
	}


	return <DashboardBloc 
		className="bloc-equipment-family" 
		label="dashboard.bloc.family"
		icon="category" 
		onClick={onBlocClick} /> 
}

export default ParcFamilyBloc
