import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import DashboardBloc from './DashboardBloc'

const ParcSectionBloc = () => {
	const { t } = useTranslation();
    /*
	const parcState = useSelector(selectParc)
	const [ blocData, setBlocData ] = useState(null)
	useEffect( () => {
		const data = parcState.section
		setBlocData(data)
	}, [ parcState ])
    */


	const onBlocClick = () => {
		console.log("Parc section bloc clicked")
	}

	return <DashboardBloc 
		className="bloc-equipment-section" 
		label="dashboard.bloc.section"
		icon="section"  
		onClick={onBlocClick} />
}

export default ParcSectionBloc
