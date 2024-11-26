import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useComaintContext } from '../ComaintContext';
import CompanyInitialisation from './CompanyInitialisation';

const PrivateHomeContent = () => {
    const { t } = useTranslation();
    const { comaintContext } = useComaintContext();

    if (!comaintContext.company)
        return <CompanyInitialisation/>;

    return (<>
            <h1>{t('title.private-home-page')}</h1>
            <ul>
                <li><Link to='/units'>{t('title.unit-page')}</Link></li>
            </ul>
        </>);
};
export default PrivateHomeContent; 
