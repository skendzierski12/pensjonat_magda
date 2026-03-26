import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="text-stone-300 px-8 py-12 mt-auto"
	    style={{ background: 'linear-gradient(135deg, #4a5240 0%, #2d3328 100%)' }}  >          
	    <div className="max-w-6xl mx-auto grid grid-cols-2 gap-8 justify-items-center">

                <div>
                    <h3 className="text-amber-400 font-bold text-lg mb-4">Nawigacja</h3>
                    <ul className="flex flex-col gap-2 text-sm">
                        <li><Link to="/" className="hover:text-amber-400 transition-colors">Home</Link></li>
                        <li><Link to="/o-nas" className="hover:text-amber-400 transition-colors">O Nas</Link></li>
                        <li><Link to="/oferta" className="hover:text-amber-400 transition-colors">Oferta</Link></li>
                        <li><Link to="/restauracja" className="hover:text-amber-400 transition-colors">Restauracja</Link></li>
                        <li><Link to="/galeria" className="hover:text-amber-400 transition-colors">Galeria</Link></li>
                        <li><Link to="/kontakt" className="hover:text-amber-400 transition-colors">Kontakt</Link></li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-amber-400 font-bold text-lg mb-4">Kontakt</h3>
                    <ul className="flex flex-col gap-2 text-sm">
                        <li>📍 Lasocin 9, 58-250 Pieszyce </li>
                        <li>📞 +48 74 83 69 928, +48 74 83 69 930, +48 74 83 69 931 </li>
                        <li>✉️ pensjonat@magda.com.pl</li>
                    </ul>
                </div>

            </div>

            <div className="max-w-6xl mx-auto border-t border-stone-600 mt-8 pt-6 text-center text-sm text-stone-400">
                © {new Date().getFullYear()} Pensjonat Magda. Wszelkie prawa zastrzeżone.
            </div>
        </footer>
    );
}
