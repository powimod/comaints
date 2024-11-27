import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import DashboardBloc from './DashboardBloc';
import useUnitActions from '../../actions/unitActions';

const ParcUnitBloc = () => {
    const navigate = useNavigate();
    const { selectedUnit, unitList } = useUnitActions();
    const [ blocData, setBlocData] = useState('?');

    useEffect( () => {
        if (selectedUnit !== null) {
            setBlocData({
                type: 'element',
                label: selectedUnit.name
            })
        }
        else if (unitList !== null) {
            setBlocData({
                type: 'counter',
                count: unitList.count
            })
        }
        else {
            setBlocData({
                type: 'counter',
                count: '?' 
            })
        }
    }, [selectedUnit, unitList]);

	const onBlocClick = () => {
        navigate('/units');
	}


	return <DashboardBloc 
		className='bloc-equipment-unit'
		label='dashboard.bloc.unit'
		icon='unit'
        data={blocData}
		onClick={onBlocClick} /> 
}

export default ParcUnitBloc
