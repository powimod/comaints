import { useTranslation } from 'react-i18next';

import StockIcon from '../StockIcon'

import '../../scss/dashboard.scss'

const DashboardBloc = ({label, data = null, icon = '', onClick = null, className}) => {
	const { t } = useTranslation();

	const onBlocClick = () => {
		if (onClick) onClick()
	}

	if (label === undefined) label = "dashboard.bloc.unknown"
	className=`dashboard-bloc ${className}`

	let value = '?'
	let valueClass = '' 
	if (data) {
		switch (data.type) {
			case 'counter':
				value = data.count
				valueClass = 'dashboard-bloc-counter' 
				break;
			case 'selector':
			case 'element':
				value = data.label
				break;
			default:
				console.error(`Invalid data type [${data.type}]`);
		}
	}

	return (<span className={className} onClick={onBlocClick}>
			<StockIcon icon={icon} size="large"/>
			<span>{t(label)}</span>
			<div className={valueClass}>{value}</div>
            { onClick !== null && <button>☰</button> }
		</span>)
}

export default DashboardBloc
