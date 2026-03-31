import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Podaj login i hasło.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API}/core/auth/login/`, { username, password });
      localStorage.setItem("token", res.data.token);
      navigate("/panel");
    } catch {
      setError("Nieprawidłowy login lub hasło.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

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
        }

        body { margin: 0; font-family: 'DM Sans', sans-serif; }

        /* ── BG ── */
        .login-page {
          min-height: 100vh;
          position: relative;
          display: flex; flex-direction: column;
        }
        .login-bg {
          position: fixed; inset: 0; z-index: 0;
          background:
            linear-gradient(160deg, rgba(20,24,16,.75) 0%, rgba(46,51,40,.65) 100%),
            url('/home_background.png') center / cover no-repeat;
        }

        /* ── NAVBAR ── */
        .login-nav {
          position: relative; z-index: 10;
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.5rem 2.5rem;
        }
        .login-nav__logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.25rem; font-weight: 300;
          color: var(--white); text-decoration: none;
          letter-spacing: .02em;
        }
        .login-nav__logo em { font-style: italic; color: var(--amber-light); }
        .login-nav__links {
          display: flex; gap: 2rem;
        }
        .login-nav__link {
          font-family: 'DM Sans', sans-serif;
          font-size: .72rem; font-weight: 300;
          letter-spacing: .15em; text-transform: uppercase;
          color: rgba(255,255,255,.55); text-decoration: none;
          transition: color .2s;
        }
        .login-nav__link:hover { color: var(--white); }

        /* ── KARTA ── */
        .login-center {
          position: relative; z-index: 10;
          flex: 1; display: flex;
          align-items: center; justify-content: center;
          padding: 2rem;
        }
        .login-card {
          width: 100%; max-width: 420px;
          background: rgba(255,255,255,.97);
          border-radius: 2px;
          box-shadow: 0 24px 64px rgba(0,0,0,.3);
          overflow: hidden;
          animation: cardDrop .5s cubic-bezier(.4,0,.2,1) both;
        }
        @keyframes cardDrop {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .login-card__top {
          background: var(--olive-dark);
          padding: 2rem 2.25rem 1.75rem;
        }
        .login-card__label {
          font-family: 'DM Sans', sans-serif;
          font-size: .62rem; font-weight: 300;
          letter-spacing: .3em; text-transform: uppercase;
          color: var(--amber); margin-bottom: .5rem;
        }
        .login-card__title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem; font-weight: 300; line-height: 1.05;
          color: var(--white);
        }
        .login-card__title em { font-style: italic; color: var(--amber-light); }

        .login-card__body { padding: 2rem 2.25rem 2.25rem; }

        /* ── POLA ── */
        .login-field { position: relative; margin-bottom: 1.75rem; }
        .login-field__icon {
          position: absolute; left: 0; bottom: .75rem;
          font-size: .95rem; color: var(--olive-light);
          pointer-events: none;
        }
        .login-input {
          width: 100%; padding: .6rem 0 .6rem 1.75rem;
          font-family: 'DM Sans', sans-serif;
          font-size: .9rem; font-weight: 300;
          color: var(--olive-dark);
          background: transparent;
          border: none; border-bottom: 1px solid rgba(74,82,64,.2);
          outline: none;
          transition: border-color .2s;
        }
        .login-input:focus { border-bottom-color: var(--amber); }
        .login-input::placeholder {
          color: rgba(74,82,64,.3); font-weight: 300;
        }
        .login-field__label {
          position: absolute; top: -1rem; left: 1.75rem;
          font-family: 'DM Sans', sans-serif;
          font-size: .6rem; font-weight: 400;
          letter-spacing: .2em; text-transform: uppercase;
          color: var(--olive-light);
        }

        /* ── BŁĄD ── */
        .login-error {
          font-family: 'DM Sans', sans-serif;
          font-size: .78rem; font-weight: 300;
          color: #c05050; margin-bottom: 1.5rem;
          padding: .6rem .9rem;
          background: rgba(180,80,80,.07);
          border-left: 2px solid rgba(180,80,80,.4);
        }

        /* ── PRZYCISK ── */
        .login-btn {
          width: 100%;
          font-family: 'DM Sans', sans-serif;
          font-size: .75rem; font-weight: 400;
          letter-spacing: .2em; text-transform: uppercase;
          color: var(--white);
          background: var(--amber);
          border: none; border-radius: 1px;
          padding: .95rem; cursor: pointer;
          transition: background .2s, transform .15s;
        }
        .login-btn:hover:not(:disabled) {
          background: var(--amber-light);
          transform: translateY(-1px);
        }
        .login-btn:disabled { opacity: .55; cursor: not-allowed; }

        @media (max-width: 480px) {
          .login-nav { padding: 1.25rem 1.5rem; }
          .login-nav__links { display: none; }
          .login-card__top { padding: 1.5rem 1.5rem 1.25rem; }
          .login-card__body { padding: 1.5rem; }
        }
      `}</style>

      <div className="login-page">
        <div className="login-bg" />

        {/* NAVBAR */}
        <nav className="login-nav">
          <Link to="/" className="login-nav__logo">
          </Link>
          <div className="login-nav__links">
            <Link to="/" className="login-nav__link">Strona główna</Link>
            <Link to="/oferta" className="login-nav__link">Oferta</Link>
            <Link to="/kontakt" className="login-nav__link">Kontakt</Link>
          </div>
        </nav>

        {/* KARTA */}
        <div className="login-center">
          <div className="login-card">
            <div className="login-card__top">
              <div className="login-card__label">Panel zarządzania</div>
              <div className="login-card__title">
                Zaloguj<br /><em>się</em>
              </div>
            </div>

            <div className="login-card__body">
              <div className="login-field">
                <span className="login-field__icon">👤</span>
                <span className="login-field__label">Login</span>
                <input
                  className="login-input"
                  type="text"
                  placeholder="nazwa użytkownika"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
              </div>

              <div className="login-field">
                <span className="login-field__icon">🔒</span>
                <span className="login-field__label">Hasło</span>
                <input
                  className="login-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>

              {error && <div className="login-error">{error}</div>}

              <button
                className="login-btn"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? "Logowanie..." : "Zaloguj się"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
