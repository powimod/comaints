import stockIconSvg from '../assets/stock-icon.svg';

import '../scss/stock-icon.scss';

const StockIcon = ({ icon, size, ...props }) => {
    if (size === undefined)
        size = 'medium';
    const className = `stock-icon-size-${size}`;
    return (
        <svg className={className} {...props}>
            <use href={`${stockIconSvg}#${icon}`}/>
        </svg>
    );
};

export default StockIcon;
