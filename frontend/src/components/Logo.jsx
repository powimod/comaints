import { useNavigate } from 'react-router-dom';

import logoSvg from '../assets/logo.svg';
import '../scss/logo.scss';

const Logo = (props) => {
    const navigate = useNavigate();

    const onLogoClick = () => {
        navigate('/');
    };

    return (
        <svg aria-label="Logo" role="img" className='logo' {...props} onClick={onLogoClick} >
            <use href={`${logoSvg}#logo-symbol`}/>
        </svg>
    );
};

export default Logo;
