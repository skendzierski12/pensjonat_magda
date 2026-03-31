import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

// ─── KAFELKI PER ROLA ───
const KAFELKI_ADMIN = [
  { ikona: "📢", tytul: "Ogłoszenia",       opis: "Dodaj i zarządzaj ogłoszeniami na stronie głównej", link: "/panel/ogloszenia" },
  { ikona: "🛏️", tytul: "Pokoje",           opis: "Typy pokoi, opisy, zdjęcia i udogodnienia",         link: "/panel/pokoje" },
  { ikona: "💰", tytul: "Cennik",           opis: "Sezony cenowe i ceny za pokój",                      link: "/panel/cennik" },
  { ikona: "🍽️", tytul: "Menu",             opis: "Kategorie i dania w menu restauracji",               link: "/panel/menu" },
  { ikona: "🥩", tytul: "Wyroby własne",    opis: "Produkty własne dostępne na miejscu",                link: "/panel/wyroby" },
  { ikona: "🖼️", tytul: "Galeria",          opis: "Zdjęcia w sekcjach tematycznych",                   link: "/panel/galeria" },
  { ikona: "🏔️", tytul: "Atrakcje",         opis: "Atrakcje turystyczne w okolicy",                    link: "/panel/atrakcje" },
  { ikona: "ℹ️", tytul: "O nas",            opis: "Sekcje strony O nas",                               link: "/panel/onas" },
  { ikona: "⚙️", tytul: "Ustawienia",       opis: "Dane kontaktowe i ustawienia pensjonatu",            link: "/panel/ustawienia" },
];

const KAFELKI_RECEPCJA = [
  { ikona: "📢", tytul: "Ogłoszenia",          opis: "Dodaj i zarządzaj ogłoszeniami na stronie głównej", link: "/panel/ogloszenia" },
  { ikona: "✉️", tytul: "Wiadomości",          opis: "Wiadomości z formularza kontaktowego",              link: "/panel/wiadomosci" },
  { ikona: "🛏️", tytul: "Pokoje",              opis: "Podgląd pokoi i dostępności",                      link: "/panel/pokoje" },
];

const KAFELKI_KUCHNIA = [
  { ikona: "🍽️", tytul: "Menu",          opis: "Kategorie i dania w menu restauracji", link: "/panel/menu" },
  { ikona: "🥩", tytul: "Wyroby własne", opis: "Produkty własne dostępne na miejscu",  link: "/panel/wyroby" },
];

function getKafelki(groups, isStaff) {
  if (isStaff || groups.includes('Administrator')) return KAFELKI_ADMIN;
  if (groups.includes('Recepcja')) return KAFELKI_RECEPCJA;
  if (groups.includes('Kuchnia')) return KAFELKI_KUCHNIA;
  return [];
}

// ─── PANEL ───
export default function Panel() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [kafelki, setKafelki] = useState([]);
  const [nieprzeczytane, setNieprzeczytane] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const headers = { Authorization: `Token ${token}` };

    // Pobierz dane usera
    axios.get(`${API}/core/auth/me/`, { headers })
      .then(res => {
        setUser(res.data);
        setKafelki(getKafelki(res.data.groups, res.data.is_staff));

        // Pobierz nieprzeczytane wiadomości jeśli ma dostęp
        const grupy = res.data.groups;
        if (res.data.is_staff || grupy.includes('Administrator') || grupy.includes('Recepcja')) {
          return axios.get(`${API}/core/kontakt/`, { headers });
        }
        return null;
      })
      .then(res => {
        if (res) {
          const nieprzeczytane = res.data.filter(k => !k.przeczytana).length;
          setNieprzeczytane(nieprzeczytane);
        }
      })
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    const token = localStorage.getItem('token');
    axios.post(`${API}/core/auth/logout/`, {}, {
      headers: { Authorization: `Token ${token}` }
    }).finally(() => {
      localStorage.removeItem('token');
      navigate('/login');
    });
  };

  if (loading) {
    return (
      <div className="panel-loading">
        <div className="panel-spinner" />
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --olive:       #4a5240;
          --olive-dark:  #2e3328;
          --olive-deep:  #1a1d15;
          --olive-light: #6b7560;
          --amber:       #c8973a;
          --amber-light: #e8b85a;
          --cream:       #f5f0e8;
          --cream-dark:  #ede7d8;
          --white:       #ffffff;
          --border:      rgba(74,82,64,.12);
        }

        body { font-family: 'DM Sans', sans-serif; background: var(--cream); min-height: 100vh; }

        /* ── LOADING ── */
        .panel-loading {
          min-height: 100vh; display: flex;
          align-items: center; justify-content: center;
          background: var(--cream);
        }
        .panel-spinner {
          width: 36px; height: 36px; border-radius: 50%;
          border: 2px solid var(--border);
          border-top-color: var(--amber);
          animation: spin .8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── TOPBAR ── */
        .panel-topbar {
          background: var(--olive-dark);
          padding: 0 2.5rem;
          height: 60px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 100;
        }
        .panel-topbar__title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.1rem; font-weight: 400;
          color: var(--white); letter-spacing: .02em;
        }
        .panel-topbar__title em {
          font-style: italic; color: var(--amber-light);
        }
        .panel-topbar__right {
          display: flex; align-items: center; gap: 1.5rem;
        }
        .panel-topbar__user {
          font-family: 'DM Sans', sans-serif;
          font-size: .78rem; font-weight: 300;
          color: rgba(255,255,255,.5);
        }
        .panel-topbar__user span {
          color: rgba(255,255,255,.85); font-weight: 400;
        }
        .panel-topbar__rola {
          font-family: 'DM Sans', sans-serif;
          font-size: .65rem; font-weight: 400;
          letter-spacing: .12em; text-transform: uppercase;
          color: var(--amber);
          background: rgba(200,151,58,.12);
          border: 1px solid rgba(200,151,58,.2);
          padding: .2rem .65rem; border-radius: 1px;
        }
        .btn-logout {
          font-family: 'DM Sans', sans-serif;
          font-size: .72rem; font-weight: 400;
          letter-spacing: .1em; text-transform: uppercase;
          color: rgba(255,255,255,.4);
          background: none; border: 1px solid rgba(255,255,255,.12);
          padding: .35rem .9rem; border-radius: 1px;
          cursor: pointer; transition: all .2s;
        }
        .btn-logout:hover {
          color: var(--white); border-color: rgba(255,255,255,.3);
        }

        /* ── MAIN ── */
        .panel-main {
          max-width: 1100px; margin: 0 auto;
          padding: 3rem 2.5rem 4rem;
        }

        .panel-heading {
          margin-bottom: 2.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border);
        }
        .panel-heading__label {
          font-family: 'DM Sans', sans-serif;
          font-size: .65rem; font-weight: 300;
          letter-spacing: .3em; text-transform: uppercase;
          color: var(--amber); margin-bottom: .5rem;
        }
        .panel-heading__title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.8rem, 3vw, 2.6rem);
          font-weight: 300; line-height: 1.1;
          color: var(--olive-dark);
        }
        .panel-heading__title em {
          font-style: italic; color: var(--olive);
        }

        /* ── KAFELKI ── */
        .kafelki-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        .kafelek {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 2px; padding: 1.5rem;
          cursor: pointer;
          transition: border-color .2s, transform .2s, box-shadow .2s;
          text-decoration: none;
          display: flex; flex-direction: column; gap: .75rem;
        }
        .kafelek:hover {
          border-color: rgba(74,82,64,.3);
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,.06);
        }
        .kafelek__ikona {
          font-size: 1.8rem; line-height: 1;
        }
        .kafelek__tytul {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.15rem; font-weight: 400;
          color: var(--olive-dark);
        }
        .kafelek__opis {
          font-family: 'DM Sans', sans-serif;
          font-size: .75rem; font-weight: 300; line-height: 1.55;
          color: var(--olive-light);
        }

        /* ── WIADOMOŚCI ── */
        .panel-footer {
          margin-top: 2.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border);
          display: flex; align-items: center; gap: 1rem;
        }
        .wiadomosci-badge {
          display: flex; align-items: center; gap: .75rem;
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 2px; padding: .85rem 1.25rem;
          cursor: pointer; text-decoration: none;
          transition: border-color .2s;
        }
        .wiadomosci-badge:hover { border-color: rgba(74,82,64,.3); }
        .wiadomosci-badge__ikona { font-size: 1.1rem; }
        .wiadomosci-badge__text {
          font-family: 'DM Sans', sans-serif;
          font-size: .8rem; font-weight: 300;
          color: var(--olive-light);
        }
        .wiadomosci-badge__liczba {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.2rem; font-weight: 400;
          color: var(--olive-dark);
        }
        .wiadomosci-badge__liczba--alert { color: var(--amber); }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .kafelki-grid { grid-template-columns: repeat(2, 1fr); }
          .panel-topbar { padding: 0 1.5rem; }
        }
        @media (max-width: 600px) {
          .kafelki-grid { grid-template-columns: 1fr; }
          .panel-main { padding: 2rem 1.5rem 3rem; }
          .panel-topbar__user { display: none; }
        }
      `}</style>

      {/* TOPBAR */}
      <header className="panel-topbar">
        <div className="panel-topbar__title">
          Pensjonat <em>Magda</em>
        </div>
        <div className="panel-topbar__right">
          <span className="panel-topbar__user">
            Zalogowany: <span>{user?.username}</span>
          </span>
          {user?.groups?.[0] && (
            <span className="panel-topbar__rola">{user.groups[0]}</span>
          )}
          {user?.is_staff && (
            <span className="panel-topbar__rola">Superuser</span>
          )}
          <button className="btn-logout" onClick={handleLogout}>
            Wyloguj
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="panel-main">
        <div className="panel-heading">
          <div className="panel-heading__label">Zarządzanie</div>
          <h1 className="panel-heading__title">
            Panel zarządzania<br /><em>Pensjonatem</em>
          </h1>
        </div>

        {kafelki.length === 0 ? (
          <p style={{ color: 'var(--olive-light)', fontFamily: 'DM Sans, sans-serif', fontSize: '.9rem' }}>
            Twoje konto nie ma przypisanych uprawnień. Skontaktuj się z administratorem.
          </p>
        ) : (
          <div className="kafelki-grid">
            {kafelki.map((k, i) => (
              <a key={i} className="kafelek" href={k.link}>
                <span className="kafelek__ikona">{k.ikona}</span>
                <span className="kafelek__tytul">{k.tytul}</span>
                <span className="kafelek__opis">{k.opis}</span>
              </a>
            ))}
          </div>
        )}

        {/* NIEPRZECZYTANE WIADOMOŚCI */}
        {nieprzeczytane !== null && (user?.is_staff || user?.groups?.includes('Administrator') || user?.groups?.includes('Recepcja')) && (
          <div className="panel-footer">
            <a className="wiadomosci-badge" href="/panel/wiadomosci">
              <span className="wiadomosci-badge__ikona">✉️</span>
              <span className="wiadomosci-badge__text">Nieprzeczytane wiadomości:</span>
              <span className={`wiadomosci-badge__liczba ${nieprzeczytane > 0 ? 'wiadomosci-badge__liczba--alert' : ''}`}>
                {nieprzeczytane}
              </span>
            </a>
          </div>
        )}
      </main>
    </>
  );
}
