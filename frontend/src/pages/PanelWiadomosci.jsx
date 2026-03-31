import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const getHeaders = () => ({
  Authorization: `Token ${localStorage.getItem("token")}`,
});

function formatData(str) {
  if (!str) return "";
  const d = new Date(str);
  return d.toLocaleDateString("pl-PL", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── MODAL WIADOMOŚCI ───
function ModalWiadomosci({ wiadomosc, onClose, onPrzeczytana }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--wide" onClick={e => e.stopPropagation()}>
        <div className="modal__header">
          <div>
            <div className="modal__temat">{wiadomosc.temat}</div>
            <div className="modal__meta">
              <span className="modal__nadawca">{wiadomosc.imie}</span>
              <span className="modal__sep">·</span>
              <a href={`mailto:${wiadomosc.email}`} className="modal__email">{wiadomosc.email}</a>
              <span className="modal__sep">·</span>
              <span className="modal__data">{formatData(wiadomosc.data_wyslania)}</span>
            </div>
          </div>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>
        <div className="modal__tresc">{wiadomosc.wiadomosc}</div>
        <div className="modal__footer">
          <a href={`mailto:${wiadomosc.email}?subject=Re: ${encodeURIComponent(wiadomosc.temat)}`} className="btn-primary">
            Odpowiedz e-mailem
          </a>
          {!wiadomosc.przeczytana && (
            <button className="btn-secondary" onClick={() => onPrzeczytana(wiadomosc.id)}>
              Oznacz jako przeczytaną
            </button>
          )}
          <button className="btn-secondary" onClick={onClose}>Zamknij</button>
        </div>
      </div>
    </div>
  );
}

// ─── GŁÓWNY WIDOK ───
export default function PanelWiadomosci() {
  const navigate = useNavigate();
  const [wiadomosci, setWiadomosci] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filtr,      setFiltr]      = useState("wszystkie");
  const [otwarta,    setOtwarta]    = useState(null);
  const [usuwana,    setUsuwana]    = useState(null);

  const pobierz = async () => {
    try {
      // GET /api/core/kontakt/ — lista (wymaga auth, obsługuje KontaktCreateView)
      const res = await axios.get(`${API}/core/kontakt/`, { headers: getHeaders() });
      setWiadomosci(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { pobierz(); }, []);

  const oznaczPrzeczytana = async (id) => {
    try {
      await axios.patch(
        `${API}/core/manage/kontakt/${id}/`,
        { przeczytana: true },
        { headers: getHeaders() }
      );
      setWiadomosci(w => w.map(x => x.id === id ? { ...x, przeczytana: true } : x));
      if (otwarta?.id === id) setOtwarta(o => ({ ...o, przeczytana: true }));
    } catch {
      alert("Błąd zapisu.");
    }
  };

  const handleOtworz = async (w) => {
    setOtwarta(w);
    if (!w.przeczytana) oznaczPrzeczytana(w.id);
  };

  const handleUsun = async (id) => {
    try {
      await axios.delete(`${API}/core/manage/kontakt/${id}/`, { headers: getHeaders() });
      setUsuwana(null);
      if (otwarta?.id === id) setOtwarta(null);
      pobierz();
    } catch {
      alert("Błąd podczas usuwania.");
    }
  };

  const handleLogout = () => {
    const token = localStorage.getItem("token");
    axios.post(`${API}/core/auth/logout/`, {}, {
      headers: { Authorization: `Token ${token}` }
    }).finally(() => {
      localStorage.removeItem("token");
      navigate("/login");
    });
  };

  const nieprzeczytane = wiadomosci.filter(w => !w.przeczytana).length;

  const widoczne = wiadomosci.filter(w => {
    if (filtr === "nieprzeczytane") return !w.przeczytana;
    if (filtr === "przeczytane")    return w.przeczytana;
    return true;
  });

  return (
    <>
      <style>{STYLES}</style>
      <div className="panel-page">
        <header className="panel-topbar">
          <Link to="/panel" className="topbar-back">← Panel główny</Link>
          <button className="btn-logout" onClick={handleLogout}>Wyloguj</button>
        </header>

        <main className="panel-main">
          <div className="page-header">
            <div>
              <div className="page-label">Panel zarządzania</div>
              <h1 className="page-title">
                Wiadomości
                {nieprzeczytane > 0 && (
                  <span className="title-badge">{nieprzeczytane}</span>
                )}
              </h1>
            </div>
          </div>

          {/* FILTRY */}
          <div className="filtry">
            {[
              { key: "wszystkie",      label: `Wszystkie (${wiadomosci.length})` },
              { key: "nieprzeczytane", label: `Nieprzeczytane (${nieprzeczytane})` },
              { key: "przeczytane",    label: `Przeczytane (${wiadomosci.length - nieprzeczytane})` },
            ].map(f => (
              <button
                key={f.key}
                className={`filtr-btn ${filtr === f.key ? "filtr-btn--active" : ""}`}
                onClick={() => setFiltr(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="skeleton-list">
              {[1,2,3,4,5].map(i => <div key={i} className="skeleton-row" />)}
            </div>
          ) : widoczne.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state__ikona">📬</span>
              <p>{filtr === "nieprzeczytane" ? "Brak nieprzeczytanych wiadomości." : "Brak wiadomości."}</p>
            </div>
          ) : (
            <div className="lista">
              {widoczne.map(w => (
                <div
                  key={w.id}
                  className={`wiad-row ${!w.przeczytana ? "wiad-row--nowa" : ""}`}
                  onClick={() => handleOtworz(w)}
                >
                  <div className="wiad-row__dot">
                    {!w.przeczytana && <span className="dot" />}
                  </div>
                  <div className="wiad-row__content">
                    <div className="wiad-row__top">
                      <span className="wiad-row__nadawca">{w.imie}</span>
                      <span className="wiad-row__temat">{w.temat}</span>
                    </div>
                    <div className="wiad-row__preview">{w.wiadomosc}</div>
                  </div>
                  <div className="wiad-row__right">
                    <span className="wiad-row__data">{formatData(w.data_wyslania)}</span>
                    <div className="wiad-row__actions" onClick={e => e.stopPropagation()}>
                      {!w.przeczytana && (
                        <button
                          className="btn-icon"
                          title="Oznacz jako przeczytaną"
                          onClick={() => oznaczPrzeczytana(w.id)}
                        >
                          ✓
                        </button>
                      )}
                      <button
                        className="btn-icon btn-icon--delete"
                        title="Usuń"
                        onClick={() => setUsuwana(w)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {otwarta && (
        <ModalWiadomosci
          wiadomosc={otwarta}
          onClose={() => setOtwarta(null)}
          onPrzeczytana={oznaczPrzeczytana}
        />
      )}

      {usuwana && (
        <div className="modal-overlay" onClick={() => setUsuwana(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal__title">Usuń wiadomość</h3>
            <p className="modal__text">
              Czy na pewno chcesz usunąć wiadomość od <strong>{usuwana.imie}</strong>?
              Tej operacji nie można cofnąć.
            </p>
            <div className="modal__footer">
              <button className="btn-danger" onClick={() => handleUsun(usuwana.id)}>Tak, usuń</button>
              <button className="btn-secondary" onClick={() => setUsuwana(null)}>Anuluj</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --olive:       #4a5240;
    --olive-dark:  #2e3328;
    --olive-light: #6b7560;
    --amber:       #c8973a;
    --amber-light: #e8b85a;
    --cream:       #f5f0e8;
    --cream-dark:  #ede7d8;
    --white:       #ffffff;
    --border:      rgba(74,82,64,.12);
  }

  body { font-family: 'DM Sans', sans-serif; background: var(--cream); min-height: 100vh; }
  .panel-page { min-height: 100vh; display: flex; flex-direction: column; }

  .panel-topbar {
    background: var(--olive-dark); height: 56px; padding: 0 2.5rem;
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 100;
  }
  .topbar-back {
    font-family: 'DM Sans', sans-serif; font-size: .75rem; font-weight: 300;
    letter-spacing: .1em; text-transform: uppercase;
    color: rgba(255,255,255,.5); text-decoration: none; transition: color .2s;
  }
  .topbar-back:hover { color: var(--white); }
  .btn-logout {
    font-family: 'DM Sans', sans-serif; font-size: .72rem; font-weight: 400;
    letter-spacing: .1em; text-transform: uppercase;
    color: rgba(255,255,255,.4); background: none;
    border: 1px solid rgba(255,255,255,.12); padding: .35rem .9rem;
    border-radius: 1px; cursor: pointer; transition: all .2s;
  }
  .btn-logout:hover { color: var(--white); border-color: rgba(255,255,255,.3); }

  .panel-main { max-width: 900px; margin: 0 auto; padding: 2.5rem 2.5rem 4rem; width: 100%; }

  .page-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    flex-wrap: wrap; gap: 1rem; margin-bottom: 1.75rem;
    padding-bottom: 1.5rem; border-bottom: 1px solid var(--border);
  }
  .page-label {
    font-family: 'DM Sans', sans-serif; font-size: .62rem; font-weight: 300;
    letter-spacing: .3em; text-transform: uppercase; color: var(--amber); margin-bottom: .35rem;
  }
  .page-title {
    font-family: 'Cormorant Garamond', serif; font-size: 2rem; font-weight: 300;
    color: var(--olive-dark); display: flex; align-items: center; gap: .75rem;
  }
  .title-badge {
    font-family: 'DM Sans', sans-serif; font-size: .75rem; font-weight: 500;
    background: var(--amber); color: var(--white);
    padding: .15rem .55rem; border-radius: 10px; line-height: 1.4;
  }

  .filtry { display: flex; gap: .5rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
  .filtr-btn {
    font-family: 'DM Sans', sans-serif; font-size: .72rem; font-weight: 300;
    color: var(--olive-light); background: var(--white);
    border: 1px solid var(--border); border-radius: 1px;
    padding: .4rem .9rem; cursor: pointer; transition: all .2s;
  }
  .filtr-btn:hover { border-color: var(--olive-light); color: var(--olive); }
  .filtr-btn--active { background: var(--olive-dark); color: var(--white); border-color: var(--olive-dark); }

  .lista { display: flex; flex-direction: column; border: 1px solid var(--border); border-radius: 2px; overflow: hidden; }
  .wiad-row {
    display: flex; align-items: center; gap: 1rem;
    padding: 1rem 1.25rem; background: var(--white);
    border-bottom: 1px solid var(--border); cursor: pointer; transition: background .15s;
  }
  .wiad-row:last-child { border-bottom: none; }
  .wiad-row:hover { background: var(--cream); }
  .wiad-row--nowa { background: rgba(200,151,58,.04); }
  .wiad-row--nowa:hover { background: rgba(200,151,58,.08); }

  .wiad-row__dot { width: 8px; flex-shrink: 0; display: flex; justify-content: center; }
  .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--amber); flex-shrink: 0; }

  .wiad-row__content { flex: 1; min-width: 0; }
  .wiad-row__top { display: flex; align-items: baseline; gap: .6rem; margin-bottom: .2rem; flex-wrap: wrap; }
  .wiad-row__nadawca {
    font-family: 'DM Sans', sans-serif; font-size: .85rem; font-weight: 500;
    color: var(--olive-dark); white-space: nowrap;
  }
  .wiad-row__temat {
    font-family: 'DM Sans', sans-serif; font-size: .82rem; font-weight: 300;
    color: var(--olive); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 300px;
  }
  .wiad-row__preview {
    font-family: 'DM Sans', sans-serif; font-size: .75rem; font-weight: 300;
    color: var(--olive-light); line-height: 1.4;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .wiad-row__right { display: flex; flex-direction: column; align-items: flex-end; gap: .4rem; flex-shrink: 0; }
  .wiad-row__data {
    font-family: 'DM Sans', sans-serif; font-size: .65rem; font-weight: 300;
    color: var(--olive-light); white-space: nowrap;
  }
  .wiad-row__actions { display: flex; gap: .35rem; }

  .btn-icon {
    width: 26px; height: 26px; border-radius: 1px;
    background: transparent; border: 1px solid var(--border);
    color: var(--olive-light); font-size: .7rem; cursor: pointer;
    display: flex; align-items: center; justify-content: center; transition: all .2s;
  }
  .btn-icon:hover { border-color: var(--olive); color: var(--olive); background: var(--cream-dark); }
  .btn-icon--delete:hover { border-color: rgba(180,80,80,.4); color: #c05050; background: rgba(180,80,80,.06); }

  .modal-overlay {
    position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,.5);
    display: flex; align-items: center; justify-content: center; padding: 1rem;
  }
  .modal {
    background: var(--white); border-radius: 2px; padding: 2rem; max-width: 420px; width: 100%;
    box-shadow: 0 16px 48px rgba(0,0,0,.2);
  }
  .modal--wide { max-width: 580px; }
  .modal__header {
    display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem;
    margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border);
  }
  .modal__temat {
    font-family: 'Cormorant Garamond', serif; font-size: 1.35rem; font-weight: 400;
    color: var(--olive-dark); margin-bottom: .35rem;
  }
  .modal__meta {
    display: flex; align-items: center; gap: .5rem; flex-wrap: wrap;
    font-family: 'DM Sans', sans-serif; font-size: .75rem; font-weight: 300; color: var(--olive-light);
  }
  .modal__nadawca { font-weight: 400; color: var(--olive); }
  .modal__sep { color: var(--border); }
  .modal__email { color: var(--amber); text-decoration: none; }
  .modal__email:hover { text-decoration: underline; }
  .modal__close {
    background: none; border: none; font-size: 1rem; color: var(--olive-light);
    cursor: pointer; padding: .25rem; flex-shrink: 0; transition: color .2s;
  }
  .modal__close:hover { color: var(--olive-dark); }
  .modal__tresc {
    font-family: 'DM Sans', sans-serif; font-size: .88rem; font-weight: 300;
    line-height: 1.75; color: var(--olive); white-space: pre-wrap;
    margin-bottom: 1.75rem; min-height: 80px;
  }
  .modal__footer { display: flex; gap: .75rem; flex-wrap: wrap; }
  .modal__title {
    font-family: 'Cormorant Garamond', serif; font-size: 1.4rem; font-weight: 300;
    color: var(--olive-dark); margin-bottom: .75rem;
  }
  .modal__text {
    font-family: 'DM Sans', sans-serif; font-size: .85rem; font-weight: 300;
    line-height: 1.6; color: var(--olive); margin-bottom: 1.5rem;
  }

  .btn-primary {
    font-family: 'DM Sans', sans-serif; font-size: .72rem; font-weight: 400;
    letter-spacing: .15em; text-transform: uppercase;
    color: var(--white); background: var(--amber);
    border: none; border-radius: 1px; padding: .7rem 1.5rem;
    cursor: pointer; transition: background .2s; text-decoration: none;
    display: inline-flex; align-items: center;
  }
  .btn-primary:hover { background: var(--amber-light); }
  .btn-secondary {
    font-family: 'DM Sans', sans-serif; font-size: .72rem; font-weight: 400;
    letter-spacing: .15em; text-transform: uppercase; color: var(--olive);
    background: transparent; border: 1px solid var(--border); border-radius: 1px;
    padding: .7rem 1.5rem; cursor: pointer; transition: border-color .2s;
  }
  .btn-secondary:hover { border-color: rgba(74,82,64,.3); }
  .btn-danger {
    font-family: 'DM Sans', sans-serif; font-size: .72rem; font-weight: 400;
    letter-spacing: .15em; text-transform: uppercase; color: var(--white); background: #c05050;
    border: none; border-radius: 1px; padding: .7rem 1.5rem; cursor: pointer;
  }
  .btn-danger:hover { background: #a03030; }

  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }
  .skeleton-list { display: flex; flex-direction: column; gap: .5rem; }
  .skeleton-row {
    height: 64px; border-radius: 2px;
    background: linear-gradient(90deg, #e2ddd6 25%, #ede9e2 50%, #e2ddd6 75%);
    background-size: 800px 100%; animation: shimmer 1.4s infinite;
  }

  .empty-state {
    text-align: center; padding: 4rem 2rem;
    font-family: 'DM Sans', sans-serif; font-size: .9rem; font-weight: 300; color: var(--olive-light);
  }
  .empty-state__ikona { font-size: 2.5rem; display: block; margin-bottom: 1rem; }

  @media (max-width: 700px) {
    .panel-main { padding: 1.5rem 1.25rem 3rem; }
    .panel-topbar { padding: 0 1.25rem; }
    .wiad-row__temat { max-width: 140px; }
    .modal--wide { padding: 1.5rem; }
    .modal__footer { flex-direction: column; }
  }
`;
