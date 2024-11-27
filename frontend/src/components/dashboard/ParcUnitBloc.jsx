
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next';

import DashboardBloc from './DashboardBloc'

const ParcUnitBloc = () => {
	const { t } = useTranslation();

    /*
	const parcState = useSelector(selectParc)
	const [ blocData, setBlocData ] = useState(null)
	useEffect( () => {
		const data = parcState.unit
		setBlocData(data)
	}, [ parcState ])

    */

	const onBlocClick = () => {
		console.log("Parc unit bloc clicked")
	}


	return <DashboardBloc 
		className="bloc-equipment-unit" 
		label="dashboard.bloc.unit"
		icon="unit" 
		onClick={onBlocClick} /> 
}

export default ParcUnitBloc
