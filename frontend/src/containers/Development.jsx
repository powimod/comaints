//import RegisterComponent from '../components/RegisterComponent'
import { useTranslation } from 'react-i18next';

const Development = () => {
	const { t } = useTranslation();

    return (<div>
        <h1>Development</h1>
        <p>{t('common:common_message')}</p>
        </div>);

};

export default Development;
