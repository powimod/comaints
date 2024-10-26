
import logoSvg from '../assets/logo.svg'

import '../scss/logo.scss'

const Logo = (props) => {
    return (
        <svg className="logo" {...props} >
            <use href={`${logoSvg}#logo-symbol`}/>
        </svg>
    )
}

export default Logo
