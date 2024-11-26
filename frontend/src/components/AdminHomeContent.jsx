import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AdminHomeContent = () => {
    const { t } = useTranslation();

    return <>
            <h1>{t('title.admin-home-page')}</h1>
            <ul>
                <li><Link to='/admin/users'>{t('title.user-admin-page')}</Link></li>
            </ul>
        </>;
};
export default AdminHomeContent; 
