
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import DashboardBloc from './DashboardBloc'

const ParcEquipmentBloc = () => {
	const { t } = useTranslation();
    /*
	const parcState = useSelector(selectParc)
	const [ blocData, setBlocData ] = useState(null)
	useEffect( () => {
		const data = parcState.equipment
		setBlocData(data)
	}, [ parcState ])
    */


	const onBlocClick = () => {
		console.log("Parc equipment bloc clicked")
	}

	return <DashboardBloc 
		className="bloc-equipment" 
		label="dashboard.bloc.equipment"
		icon="equipment" 
		onClick={onBlocClick} /> 
}

export default ParcEquipmentBloc
