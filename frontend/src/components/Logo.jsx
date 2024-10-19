
import logoSvg from '../assets/logo.svg'

import '../scss/logo.scss'

const Logo = () => {
    return (
        <svg className="logo" >
            <use href={`${logoSvg}#logo-symbol`} fill="currentColor" />
        </svg>
    )
}

export default Logo
