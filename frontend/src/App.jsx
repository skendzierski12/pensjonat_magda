import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Panel from './pages/Panel';
import PanelOgloszenia from './pages/PanelOgloszenia';
import PanelPokoje from './pages/PanelPokoje';
import PanelCennik from './pages/PanelCennik';
import PanelMenu from './pages/PanelMenu';
import PanelWyroby from './pages/PanelWyroby';
import PanelGaleria  from './pages/PanelGaleria';
import PanelAtrakcje from './pages/PanelAtrakcje';
import PanelONas from './pages/PanelONas';
import PanelWiadomosci from './pages/PanelWiadomosci';
import PanelUstawienia from './pages/PanelUstawienia';

import Home from './pages/Home.jsx';
import ONas from './pages/ONas.jsx';
import Oferta from './pages/Oferta.jsx';
import Restauracja from './pages/Restauracja.jsx';
import Atrakcje from './pages/Atrakcje.jsx';
import Cennik from './pages/Cennik.jsx';
import Galeria from './pages/Galeria.jsx';
import Kontakt from './pages/Kontakt.jsx';
import Login from './pages/Login.jsx';


function App() {
  return (
    <BrowserRouter>
	  <Routes>
	  <Route path="/" element={<Layout><Home /></Layout>}/>
                <Route path="/o-nas" element={<Layout><ONas /></Layout>} />
                <Route path="/oferta" element={<Layout><Oferta /></Layout>} />
                <Route path="/restauracja" element={<Layout><Restauracja /></Layout>} />
                <Route path="/atrakcje" element={<Layout><Atrakcje /></Layout>} />
                <Route path="/cennik" element={<Layout><Cennik /></Layout>} />
                <Route path="/galeria" element={<Layout><Galeria /></Layout>} />
                <Route path="/kontakt" element={<Layout><Kontakt /></Layout>} />
                <Route path="/login" element={<Login />} />
	  	<Route path="/panel" element={<Panel />} />
		<Route path="/panel/ogloszenia" element={<PanelOgloszenia />} />
		<Route path="/panel/pokoje" element={<PanelPokoje />} />
		<Route path="/panel/cennik" element={<PanelCennik />} />
	  	<Route path="/panel/menu" element={<PanelMenu />} />
		<Route path="/panel/wyroby" element={<PanelWyroby />} />
	  	<Route path="/panel/galeria"  element={<PanelGaleria />} />
	  	<Route path="/panel/atrakcje" element={<PanelAtrakcje />} />
	  	<Route path="/panel/onas" element={<PanelONas />} />
	  	<Route path="/panel/wiadomosci" element={<PanelWiadomosci />} />
	  	<Route path="/panel/ustawienia" element={<PanelUstawienia />} />
	  </Routes>
        </BrowserRouter>
    );
}
export default App;
