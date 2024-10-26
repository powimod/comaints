import StockIcon from  '../components/StockIcon'
import '../scss/home.scss'

const Home = (props) => {

	return (
		<main className='page_home'>
            <h2>Comaint main page</h2>
            <div>
                <StockIcon icon='user' size="huge"/>
                <StockIcon icon='order' size="large"/>
                <StockIcon icon='unit' size="medium" style={{ color: 'red' }} />
                <StockIcon icon='equipment' size="small"/>
                <StockIcon icon='supplier' size="tiny"/>
            </div>
		</main>
	)
}

export default Home
