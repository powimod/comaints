import MarkDownLoader from '../components/MarkDownLoader';
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const TermsOfUse = (props) => {
	const { t } = useTranslation()
	return (
		<main>
		 	<MarkDownLoader source="terms-of-use.md"/> 
			<div><Link to="/">{t('button.home')}</Link></div>
		</main>
	)
}

export default TermsOfUse
