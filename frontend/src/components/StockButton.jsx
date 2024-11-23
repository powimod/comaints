import StockIcon from './StockIcon.jsx'
import '../scss/stock-button.scss'

const StockButton = ({ icon, size, onClick}) => {

    return (<button className='stock-button' onClick={onClick}>
            <StockIcon icon={icon} size={size}/>
        </button>)
}
export default StockButton
