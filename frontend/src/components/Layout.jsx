import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }) {
	return(
		<div className="min-h-screen flex flex-col bg-stone-50">
			<Navbar />
			<main className="flex-grow">
				{children }
			</main>
			<Footer />
		</div>
	);
}
