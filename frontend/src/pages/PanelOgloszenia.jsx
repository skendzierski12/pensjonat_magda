import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const getHeaders = () => ({
  Authorization: `Token ${localStorage.getItem("token")}`,
});

// ─── FORMULARZ ───
function Formularz({ ogloszenie, onSave, onCancel }) {
  const [form, setForm] = useState({
    tytul: ogloszenie?.tytul || "",
    tresc: ogloszenie?.tresc || "",
    data_wygasniecia: ogloszenie?.data_wygasniecia || "",
    aktywne: ogloszenie?.aktywne ?? true,
    wazne: ogloszenie?.wazne ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSave = async () => {
    if (!form.tytul.trim() || !form.tresc.trim()) {
      setError("Tytuł i treść są wymagane.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const data = {
        ...form,
        data_wygasniecia: form.data_wygasniecia || null,
      };
      if (ogloszenie) {
        await axios.put(`${API}/core/manage/ogloszenia/${ogloszenie.id}/`, data, { headers: getHeaders() });
      } else {
        await axios.post(`${API}/core/manage/ogloszenia/`, data, { headers: getHeaders() });
      }
      onSave();
    } catch {
      setError("Błąd zapisu. Sprawdź dane i spróbuj ponownie.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="formularz">
      <h2 className="formularz__title">
        {ogloszenie ? "Edytuj ogłoszenie" : "Nowe ogłoszenie"}
      </h2>

      <div className="form-field">
        <label className="form-label">Tytuł *</label>
        <input
          className="form-input"
          name="tytul"
          value={form.tytul}
          onChange={handleChange}
          placeholder="Tytuł ogłoszenia"
        />
      </div>

      <div className="form-field">
        <label className="form-label">Treść *</label>
        <textarea
          className="form-input form-textarea"
          name="tresc"
          value={form.tresc}
          onChange={handleChange}
          placeholder="Treść ogłoszenia..."
          rows={5}
        />
      </div>

      <div className="form-field">
        <label className="form-label">Data wygaśnięcia</label>
        <input
          className="form-input"
          type="date"
          name="data_wygasniecia"
          value={form.data_wygasniecia || ""}
          onChange={handleChange}
        />
        <span className="form-hint">Zostaw puste jeśli ogłoszenie ma być stałe</span>
      </div>

      <div className="form-checkboxes">
        <label className="form-checkbox">
          <input
            type="checkbox"
            name="aktywne"
            checked={form.aktywne}
            onChange={handleChange}
          />
          <span>Aktywne</span>
        </label>
        <label className="form-checkbox">
          <input
            type="checkbox"
            name="wazne"
            checked={form.wazne}
            onChange={handleChange}
          />
          <span>Ważne (wyróżnione na górze)</span>
        </label>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="form-actions">
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? "Zapisywanie..." : "Zapisz"}
        </button>
        <button className="btn-secondary" onClick={onCancel}>
          Anuluj
        </button>
      </div>
    </div>
  );
}

// ─── GŁÓWNY WIDOK ───
export default function PanelOgloszenia() {
  const navigate = useNavigate();
  const [ogloszenia, setOgloszenia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [widok, setWidok] = useState("lista"); // lista | nowe | edytuj
  const [edytowane, setEdytowane] = useState(null);
  const [usuwane, setUsuwane] = useState(null);

  const pobierz = async () => {
    try {
      const res = await axios.get(`${API}/core/manage/ogloszenia/`, { headers: getHeaders() });
      setOgloszenia(res.data);
    } catch {
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { pobierz(); }, []);

  const handleUsun = async (id) => {
    try {
      await axios.delete(`${API}/core/manage/ogloszenia/${id}/`, { headers: getHeaders() });
      setUsuwane(null);
      pobierz();
    } catch {
      alert("Błąd podczas usuwania.");
    }
  };

  const handleSave = () => {
    setWidok("lista");
    setEdytowane(null);
    pobierz();
  };

  if (widok === "nowe" || widok === "edytuj") {
    return (
      <>
        <style>{STYLES}</style>
        <div className="panel-page">
          <header className="panel-topbar">
            <TopbarContent />
          </header>
          <main className="panel-main">
            <Formularz
              ogloszenie={edytowane}
              onSave={handleSave}
              onCancel={() => { setWidok("lista"); setEdytowane(null); }}
            />
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="panel-page">
        <header className="panel-topbar">
          <TopbarContent />
        </header>

        <main className="panel-main">
          <div className="page-header">
            <div>
              <div className="page-label">Panel zarządzania</div>
              <h1 className="page-title">Ogłoszenia</h1>
            </div>
            <button className="btn-primary" onClick={() => setWidok("nowe")}>
              + Dodaj ogłoszenie
            </button>
          </div>

          {loading ? (
            <div className="skeleton-list">
              {[1,2,3].map(i => <div key={i} className="skeleton-row" />)}
            </div>
          ) : ogloszenia.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state__ikona">📢</span>
              <p>Brak ogłoszeń. Dodaj pierwsze ogłoszenie.</p>
            </div>
          ) : (
            <div className="lista">
              {ogloszenia.map(o => (
                <div key={o.id} className="lista-row">
                  <div className="lista-row__content">
                    <div className="lista-row__top">
                      <span className="lista-row__tytul">{o.tytul}</span>
                      <div className="lista-row__badges">
                        {o.wazne && <span className="badge badge--amber">Ważne</span>}
                        {o.aktywne
                          ? <span className="badge badge--green">Aktywne</span>
                          : <span className="badge badge--gray">Nieaktywne</span>
                        }
                      </div>
                    </div>
                    <div className="lista-row__meta">
                      {o.data_wygasniecia
                        ? `Wygasa: ${new Date(o.data_wygasniecia).toLocaleDateString("pl-PL")}`
                        : "Bez daty wygaśnięcia"
                      }
                      {" · "}
                      {new Date(o.data_dodania).toLocaleDateString("pl-PL")}
                    </div>
                    <div className="lista-row__tresc">{o.tresc}</div>
                  </div>
                  <div className="lista-row__actions">
                    <button className="btn-edit" onClick={() => { setEdytowane(o); setWidok("edytuj"); }}>
                      Edytuj
                    </button>
                    <button className="btn-delete" onClick={() => setUsuwane(o)}>
                      Usuń
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* MODAL POTWIERDZENIA USUNIĘCIA */}
        {usuwane && (
          <div className="modal-overlay" onClick={() => setUsuwane(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h3 className="modal__title">Usuń ogłoszenie</h3>
              <p className="modal__text">
                Czy na pewno chcesz usunąć ogłoszenie <strong>„{usuwane.tytul}"</strong>? Tej operacji nie można cofnąć.
              </p>
              <div className="modal__actions">
                <button className="btn-danger" onClick={() => handleUsun(usuwane.id)}>
                  Tak, usuń
                </button>
                <button className="btn-secondary" onClick={() => setUsuwane(null)}>
                  Anuluj
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function TopbarContent() {
  const navigate = useNavigate();
  const handleLogout = () => {
    const token = localStorage.getItem("token");
    axios.post(`${API}/core/auth/logout/`, {}, {
      headers: { Authorization: `Token ${token}` }
    }).finally(() => {
      localStorage.removeItem("token");
      navigate("/login");
    });
  };

  return (
    <>
      <Link to="/panel" className="topbar-back">
        ← Panel główny
      </Link>
      <button className="btn-logout" onClick={handleLogout}>Wyloguj</button>
    </>
  );
}

const STYLES = `
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

  .panel-page { min-height: 100vh; display: flex; flex-direction: column; }

  /* TOPBAR */
  .panel-topbar {
    background: var(--olive-dark);
    height: 56px; padding: 0 2.5rem;
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 100;
  }
  .topbar-back {
    font-family: 'DM Sans', sans-serif;
    font-size: .75rem; font-weight: 300;
    letter-spacing: .1em; text-transform: uppercase;
    color: rgba(255,255,255,.5); text-decoration: none;
    transition: color .2s;
  }
  .topbar-back:hover { color: var(--white); }
  .btn-logout {
    font-family: 'DM Sans', sans-serif;
    font-size: .72rem; font-weight: 400; letter-spacing: .1em; text-transform: uppercase;
    color: rgba(255,255,255,.4); background: none;
    border: 1px solid rgba(255,255,255,.12);
    padding: .35rem .9rem; border-radius: 1px; cursor: pointer; transition: all .2s;
  }
  .btn-logout:hover { color: var(--white); border-color: rgba(255,255,255,.3); }

  /* MAIN */
  .panel-main { max-width: 1000px; margin: 0 auto; padding: 2.5rem 2.5rem 4rem; width: 100%; }

  .page-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem;
    padding-bottom: 1.5rem; border-bottom: 1px solid var(--border);
  }
  .page-label {
    font-family: 'DM Sans', sans-serif;
    font-size: .62rem; font-weight: 300;
    letter-spacing: .3em; text-transform: uppercase;
    color: var(--amber); margin-bottom: .35rem;
  }
  .page-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 2rem; font-weight: 300; color: var(--olive-dark);
  }

  /* LISTA */
  .lista { display: flex; flex-direction: column; gap: .75rem; }
  .lista-row {
    background: var(--white);
    border: 1px solid var(--border); border-radius: 2px;
    padding: 1.25rem 1.5rem;
    display: flex; align-items: flex-start; justify-content: space-between; gap: 1.5rem;
    transition: border-color .2s;
  }
  .lista-row:hover { border-color: rgba(74,82,64,.25); }
  .lista-row__content { flex: 1; min-width: 0; }
  .lista-row__top {
    display: flex; align-items: center; gap: .75rem;
    flex-wrap: wrap; margin-bottom: .4rem;
  }
  .lista-row__tytul {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.1rem; font-weight: 400; color: var(--olive-dark);
  }
  .lista-row__badges { display: flex; gap: .4rem; }
  .lista-row__meta {
    font-family: 'DM Sans', sans-serif;
    font-size: .7rem; font-weight: 300; color: var(--olive-light);
    margin-bottom: .5rem;
  }
  .lista-row__tresc {
    font-family: 'DM Sans', sans-serif;
    font-size: .82rem; font-weight: 300; line-height: 1.55;
    color: var(--olive); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    max-width: 600px;
  }
  .lista-row__actions {
    display: flex; gap: .5rem; flex-shrink: 0; align-items: flex-start;
  }

  /* BADGES */
  .badge {
    font-family: 'DM Sans', sans-serif;
    font-size: .6rem; font-weight: 400;
    letter-spacing: .12em; text-transform: uppercase;
    padding: .2rem .6rem; border-radius: 1px;
  }
  .badge--amber { background: rgba(200,151,58,.12); color: var(--amber); border: 1px solid rgba(200,151,58,.25); }
  .badge--green { background: rgba(74,130,74,.1); color: #4a824a; border: 1px solid rgba(74,130,74,.2); }
  .badge--gray  { background: rgba(74,82,64,.08); color: var(--olive-light); border: 1px solid var(--border); }

  /* BUTTONS */
  .btn-primary {
    font-family: 'DM Sans', sans-serif;
    font-size: .72rem; font-weight: 400; letter-spacing: .15em; text-transform: uppercase;
    color: var(--white); background: var(--amber);
    border: none; border-radius: 1px; padding: .7rem 1.5rem;
    cursor: pointer; transition: background .2s, transform .15s;
  }
  .btn-primary:hover:not(:disabled) { background: var(--amber-light); transform: translateY(-1px); }
  .btn-primary:disabled { opacity: .55; cursor: not-allowed; }

  .btn-secondary {
    font-family: 'DM Sans', sans-serif;
    font-size: .72rem; font-weight: 400; letter-spacing: .15em; text-transform: uppercase;
    color: var(--olive); background: transparent;
    border: 1px solid var(--border); border-radius: 1px; padding: .7rem 1.5rem;
    cursor: pointer; transition: border-color .2s;
  }
  .btn-secondary:hover { border-color: rgba(74,82,64,.3); }

  .btn-edit {
    font-family: 'DM Sans', sans-serif;
    font-size: .68rem; font-weight: 400; letter-spacing: .1em; text-transform: uppercase;
    color: var(--olive); background: transparent;
    border: 1px solid var(--border); border-radius: 1px;
    padding: .4rem .9rem; cursor: pointer; transition: all .2s;
  }
  .btn-edit:hover { border-color: var(--olive); }

  .btn-delete {
    font-family: 'DM Sans', sans-serif;
    font-size: .68rem; font-weight: 400; letter-spacing: .1em; text-transform: uppercase;
    color: #c05050; background: transparent;
    border: 1px solid rgba(180,80,80,.2); border-radius: 1px;
    padding: .4rem .9rem; cursor: pointer; transition: all .2s;
  }
  .btn-delete:hover { background: rgba(180,80,80,.06); border-color: rgba(180,80,80,.4); }

  .btn-danger {
    font-family: 'DM Sans', sans-serif;
    font-size: .72rem; font-weight: 400; letter-spacing: .15em; text-transform: uppercase;
    color: var(--white); background: #c05050;
    border: none; border-radius: 1px; padding: .7rem 1.5rem;
    cursor: pointer; transition: background .2s;
  }
  .btn-danger:hover { background: #a03030; }

  /* FORMULARZ */
  .formularz {
    background: var(--white); border: 1px solid var(--border);
    border-radius: 2px; padding: 2rem; max-width: 680px;
  }
  .formularz__title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.6rem; font-weight: 300; color: var(--olive-dark);
    margin-bottom: 1.75rem; padding-bottom: 1rem;
    border-bottom: 1px solid var(--border);
  }
  .form-field { margin-bottom: 1.25rem; }
  .form-label {
    display: block;
    font-family: 'DM Sans', sans-serif;
    font-size: .65rem; font-weight: 400;
    letter-spacing: .2em; text-transform: uppercase;
    color: var(--olive-light); margin-bottom: .4rem;
  }
  .form-input {
    width: 100%;
    font-family: 'DM Sans', sans-serif;
    font-size: .88rem; font-weight: 300;
    color: var(--olive-dark);
    background: var(--cream);
    border: 1px solid var(--border); border-radius: 1px;
    padding: .65rem .9rem; outline: none;
    transition: border-color .2s;
  }
  .form-input:focus { border-color: var(--amber); background: var(--white); }
  .form-textarea { resize: vertical; min-height: 120px; }
  .form-hint {
    font-family: 'DM Sans', sans-serif;
    font-size: .68rem; font-weight: 300;
    color: var(--olive-light); margin-top: .3rem; display: block;
  }
  .form-checkboxes { display: flex; gap: 1.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
  .form-checkbox {
    display: flex; align-items: center; gap: .5rem;
    font-family: 'DM Sans', sans-serif;
    font-size: .82rem; font-weight: 300; color: var(--olive);
    cursor: pointer;
  }
  .form-checkbox input { accent-color: var(--amber); width: 15px; height: 15px; cursor: pointer; }
  .form-error {
    font-family: 'DM Sans', sans-serif;
    font-size: .78rem; font-weight: 300; color: #c05050;
    padding: .6rem .9rem; margin-bottom: 1rem;
    background: rgba(180,80,80,.07); border-left: 2px solid rgba(180,80,80,.4);
  }
  .form-actions { display: flex; gap: .75rem; }

  /* MODAL */
  .modal-overlay {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(0,0,0,.5);
    display: flex; align-items: center; justify-content: center;
    padding: 1rem;
  }
  .modal {
    background: var(--white); border-radius: 2px;
    padding: 2rem; max-width: 420px; width: 100%;
    box-shadow: 0 16px 48px rgba(0,0,0,.2);
  }
  .modal__title {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.4rem; font-weight: 300; color: var(--olive-dark);
    margin-bottom: .75rem;
  }
  .modal__text {
    font-family: 'DM Sans', sans-serif;
    font-size: .85rem; font-weight: 300; line-height: 1.6;
    color: var(--olive); margin-bottom: 1.5rem;
  }
  .modal__actions { display: flex; gap: .75rem; }

  /* SKELETON */
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }
  .skeleton-list { display: flex; flex-direction: column; gap: .75rem; }
  .skeleton-row {
    height: 88px; border-radius: 2px;
    background: linear-gradient(90deg, #e2ddd6 25%, #ede9e2 50%, #e2ddd6 75%);
    background-size: 800px 100%; animation: shimmer 1.4s infinite;
  }

  /* EMPTY */
  .empty-state {
    text-align: center; padding: 4rem 2rem;
    font-family: 'DM Sans', sans-serif;
    font-size: .9rem; font-weight: 300; color: var(--olive-light);
  }
  .empty-state__ikona { font-size: 2.5rem; display: block; margin-bottom: 1rem; }

  /* RESPONSIVE */
  @media (max-width: 600px) {
    .panel-main { padding: 1.5rem 1.25rem 3rem; }
    .lista-row { flex-direction: column; }
    .lista-row__actions { flex-direction: row; }
    .panel-topbar { padding: 0 1.25rem; }
  }
`;
