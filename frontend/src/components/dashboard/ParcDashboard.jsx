import ParcUnitBloc from './ParcUnitBloc'
import ParcSectionBloc from './ParcSectionBloc'
import ParcEquipmentBloc from './ParcEquipmentBloc'
import ParcFamilyBloc from './ParcFamilyBloc'
import ParcTypeBloc from './ParcTypeBloc'

import DashboardArrow from './DashboardArrow'

const MainDashboard = () => {

	return (<>
		<div className="dashboard parc-dashboard">
			<ParcUnitBloc/>
			<ParcSectionBloc/>
			<ParcEquipmentBloc/>
			<ParcFamilyBloc/>
			<ParcTypeBloc/>


			<DashboardArrow className="arrow-equipment-family-type"            id="arrow-family-type"            type="ns"/>
			<DashboardArrow className="arrow-equipment-unit-section"           id="arrow-unit-section"           type="ns"/>
			<DashboardArrow className="arrow-equipment-type-equipment"         id="arrow-type-equipment"         type="nose"/>
			<DashboardArrow className="arrow-equipment-section-equipment"      id="arrow-section-equipment"      type="neso"/>

		</div>
	</>)
}

export default MainDashboard
