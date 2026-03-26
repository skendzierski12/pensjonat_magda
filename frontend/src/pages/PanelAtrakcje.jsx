import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:8000/api";

const getHeaders = () => ({
  Authorization: `Token ${localStorage.getItem("token")}`,
});

const TRUDNOSCI = [
  { value: "",       label: "— brak —" },
  { value: "latwa",  label: "🟢 Łatwa" },
  { value: "srednia",label: "🟡 Średnia" },
  { value: "trudna", label: "🔴 Trudna" },
];

const TRUDNOSC_BADGE = {
  latwa:   { label: "Łatwa",   cls: "badge--green" },
  srednia: { label: "Średnia", cls: "badge--amber" },
  trudna:  { label: "Trudna",  cls: "badge--red" },
};

// ─── FORMULARZ ATRAKCJI ───
function FormularzAtrakcji({ atrakcja, kategorie, onSave, onCancel }) {
  const [form, setForm] = useState({
    nazwa:              atrakcja?.nazwa              || "",
    opis:               atrakcja?.opis               || "",
    kategoria:          atrakcja?.kategoria          || "",
    odleglosc_km:       atrakcja?.odleglosc_km       ? String(atrakcja.odleglosc_km) : "",
    czas_dojazdu_min:   atrakcja?.czas_dojazdu_min   || "",
    trudnosc:           atrakcja?.trudnosc           || "",
    dlugosc_trasy_km:   atrakcja?.dlugosc_trasy_km   ? String(atrakcja.dlugosc_trasy_km) : "",
    link_zewnetrzny:    atrakcja?.link_zewnetrzny    || "",
    kolejnosc:          atrakcja?.kolejnosc          ?? 0,
    aktywna:            atrakcja?.aktywna            ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSave = async () => {
    if (!form.nazwa.trim() || !form.opis.trim() || !form.odleglosc_km || !form.kategoria) {
      setError("Nazwa, opis, kategoria i odległość są wymagane."); return;
    }
    setSaving(true); setError("");
    const payload = {
      ...form,
      czas_dojazdu_min: form.czas_dojazdu_min || null,
      dlugosc_trasy_km: form.dlugosc_trasy_km || null,
    };
    try {
      if (atrakcja) {
        await axios.put(`${API}/atrakcje/manage/lista/${atrakcja.id}/`, payload, { headers: getHeaders() });
      } else {
        await axios.post(`${API}/atrakcje/manage/lista/`, payload, { headers: getHeaders() });
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
      <h2 className="formularz__title">{atrakcja ? "Edytuj atrakcję" : "Nowa atrakcja"}</h2>

      <div className="form-row-2">
        <div className="form-field" style={{ gridColumn: "1/3" }}>
          <label className="form-label">Nazwa *</label>
          <input className="form-input" name="nazwa" value={form.nazwa} onChange={handleChange} placeholder="np. Wodospad Siklawa" />
        </div>
      </div>

      <div className="form-row-3">
        <div className="form-field">
          <label className="form-label">Kategoria *</label>
          <select className="form-input form-select" name="kategoria" value={form.kategoria} onChange={handleChange}>
            <option value="">— wybierz —</option>
            {kategorie.map(k => (
              <option key={k.id} value={k.id}>{k.ikona ? `${k.ikona} ` : ""}{k.nazwa}</option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label className="form-label">Odległość (km) *</label>
          <input className="form-input" type="number" name="odleglosc_km" value={form.odleglosc_km} onChange={handleChange} step="0.1" min="0" placeholder="5.0" />
        </div>
        <div className="form-field">
          <label className="form-label">Czas dojazdu (min)</label>
          <input className="form-input" type="number" name="czas_dojazdu_min" value={form.czas_dojazdu_min} onChange={handleChange} min="0" placeholder="15" />
        </div>
      </div>

      <div className="form-row-3">
        <div className="form-field">
          <label className="form-label">Trudność trasy</label>
          <select className="form-input form-select" name="trudnosc" value={form.trudnosc} onChange={handleChange}>
            {TRUDNOSCI.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label className="form-label">Długość trasy (km)</label>
          <input className="form-input" type="number" name="dlugosc_trasy_km" value={form.dlugosc_trasy_km} onChange={handleChange} step="0.1" min="0" placeholder="8.5" />
        </div>
        <div className="form-field">
          <label className="form-label">Kolejność</label>
          <input className="form-input" type="number" name="kolejnosc" value={form.kolejnosc} onChange={handleChange} min="0" />
        </div>
      </div>

      <div className="form-field">
        <label className="form-label">Opis *</label>
        <textarea className="form-input form-textarea" name="opis" value={form.opis} onChange={handleChange} placeholder="Opis atrakcji..." rows={4} />
      </div>

      <div className="form-field">
        <label className="form-label">Link zewnętrzny (mapa / strona)</label>
        <input className="form-input" name="link_zewnetrzny" value={form.link_zewnetrzny} onChange={handleChange} placeholder="https://..." type="url" />
      </div>

      <div className="form-checkboxes">
        <label className="form-checkbox">
          <input type="checkbox" name="aktywna" checked={form.aktywna} onChange={handleChange} />
          <span>Aktywna (widoczna na stronie)</span>
        </label>
      </div>

      {error && <div className="form-error">{error}</div>}
      <div className="form-actions">
        <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? "Zapisywanie..." : "Zapisz"}</button>
        <button className="btn-secondary" onClick={onCancel}>Anuluj</button>
      </div>
    </div>
  );
}

// ─── GŁÓWNY WIDOK ───
export default function PanelAtrakcje() {
  const navigate = useNavigate();
  const [atrakcje,  setAtrakcje]  = useState([]);
  const [kategorie, setKategorie] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [widok,     setWidok]     = useState("lista");
  const [edytowana, setEdytowana] = useState(null);
  const [usuwana,   setUsuwana]   = useState(null);
  const [filtrKat,  setFiltrKat]  = useState("");

  const pobierz = async () => {
    try {
      const [rAtr, rKat] = await Promise.all([
        axios.get(`${API}/atrakcje/manage/lista/`, { headers: getHeaders() }),
        axios.get(`${API}/atrakcje/manage/kategorie/`, { headers: getHeaders() }),
      ]);
      setAtrakcje(rAtr.data);
      setKategorie(rKat.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { pobierz(); }, []);

  const handleUsun = async (id) => {
    try {
      await axios.delete(`${API}/atrakcje/manage/lista/${id}/`, { headers: getHeaders() });
      setUsuwana(null); pobierz();
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

  if (widok !== "lista") {
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
              <div><div className="page-label">Panel zarządzania</div><h1 className="page-title">Atrakcje</h1></div>
            </div>
            <FormularzAtrakcji
              atrakcja={edytowana}
              kategorie={kategorie}
              onSave={() => { setWidok("lista"); setEdytowana(null); pobierz(); }}
              onCancel={() => { setWidok("lista"); setEdytowana(null); }}
            />
          </main>
        </div>
      </>
    );
  }

  const widoczne = filtrKat
    ? atrakcje.filter(a => String(a.kategoria) === filtrKat)
    : atrakcje;

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
              <h1 className="page-title">Atrakcje i okolice</h1>
            </div>
          </div>

          <div className="tab-header">
            <span className="tab-count">{widoczne.length} atrakcji</span>
            <div className="tab-header__right">
              <select
                className="form-input form-select filtr-select"
                value={filtrKat}
                onChange={e => setFiltrKat(e.target.value)}
              >
                <option value="">Wszystkie kategorie</option>
                {kategorie.map(k => (
                  <option key={k.id} value={String(k.id)}>
                    {k.ikona ? `${k.ikona} ` : ""}{k.nazwa}
                  </option>
                ))}
              </select>
              <button className="btn-primary" onClick={() => setWidok("nowy")}>+ Dodaj atrakcję</button>
            </div>
          </div>

          {loading ? (
            <div className="skeleton-list">{[1,2,3,4].map(i => <div key={i} className="skeleton-row" />)}</div>
          ) : widoczne.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state__ikona">⛰️</span>
              <p>Brak atrakcji. Dodaj pierwszą atrakcję w okolicy.</p>
            </div>
          ) : (
            <div className="lista">
              {widoczne.map(a => {
                const kat = kategorie.find(k => k.id === a.kategoria);
                const trudnosc = TRUDNOSC_BADGE[a.trudnosc];
                return (
                  <div key={a.id} className={`lista-row ${!a.aktywna ? "lista-row--nieaktywna" : ""}`}>
                    <div className="lista-row__content">
                      <div className="lista-row__top">
                        <span className="lista-row__tytul">{a.nazwa}</span>
                        <div className="lista-row__badges">
                          <span className="badge badge--olive">
                            📍 {parseFloat(a.odleglosc_km).toFixed(1)} km
                          </span>
                          {a.czas_dojazdu_min && (
                            <span className="badge badge--gray">🚗 {a.czas_dojazdu_min} min</span>
                          )}
                          {trudnosc && (
                            <span className={`badge ${trudnosc.cls}`}>{trudnosc.label}</span>
                          )}
                          {a.dlugosc_trasy_km && (
                            <span className="badge badge--gray">🥾 {parseFloat(a.dlugosc_trasy_km).toFixed(1)} km</span>
                          )}
                          {kat && (
                            <span className="badge badge--gray">
                              {kat.ikona ? `${kat.ikona} ` : ""}{kat.nazwa}
                            </span>
                          )}
                          {!a.aktywna && <span className="badge badge--off">Nieaktywna</span>}
                        </div>
                      </div>
                      <div className="lista-row__opis">{a.opis}</div>
                      {a.link_zewnetrzny && (
                        <a href={a.link_zewnetrzny} target="_blank" rel="noreferrer" className="lista-row__link">
                          🔗 {a.link_zewnetrzny}
                        </a>
                      )}
                    </div>
                    <div className="lista-row__actions">
                      <button className="btn-edit" onClick={() => { setEdytowana(a); setWidok("edytuj"); }}>Edytuj</button>
                      <button className="btn-delete" onClick={() => setUsuwana(a)}>Usuń</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="admin-hint">
            💡 Zarządzanie <strong>kategoriami atrakcji</strong> dostępne jest w <a href="http://localhost:8000/admin" target="_blank" rel="noreferrer">Django Admin</a>.
          </div>
        </main>
      </div>

      {usuwana && (
        <div className="modal-overlay" onClick={() => setUsuwana(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal__title">Usuń atrakcję</h3>
            <p className="modal__text">Czy na pewno chcesz usunąć atrakcję <strong>„{usuwana.nazwa}"</strong>? Tej operacji nie można cofnąć.</p>
            <div className="modal__actions">
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
    font-family: 'DM Sans', sans-serif; font-size: .72rem;
    letter-spacing: .1em; text-transform: uppercase;
    color: rgba(255,255,255,.4); background: none;
    border: 1px solid rgba(255,255,255,.12); padding: .35rem .9rem;
    border-radius: 1px; cursor: pointer; transition: all .2s;
  }
  .btn-logout:hover { color: var(--white); border-color: rgba(255,255,255,.3); }

  .panel-main { max-width: 1000px; margin: 0 auto; padding: 2.5rem 2.5rem 4rem; width: 100%; }

  .page-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem;
    padding-bottom: 1.5rem; border-bottom: 1px solid var(--border);
  }
  .page-label {
    font-family: 'DM Sans', sans-serif; font-size: .62rem; font-weight: 300;
    letter-spacing: .3em; text-transform: uppercase; color: var(--amber); margin-bottom: .35rem;
  }
  .page-title {
    font-family: 'Cormorant Garamond', serif; font-size: 2rem; font-weight: 300; color: var(--olive-dark);
  }

  .tab-header {
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: .75rem; margin-bottom: 1.25rem;
  }
  .tab-header__right { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; }
  .tab-count {
    font-family: 'DM Sans', sans-serif; font-size: .78rem; font-weight: 300; color: var(--olive-light);
  }
  .filtr-select { width: auto; min-width: 180px; font-size: .78rem; padding: .45rem .75rem; }

  .lista { display: flex; flex-direction: column; gap: .75rem; }
  .lista-row {
    background: var(--white); border: 1px solid var(--border); border-radius: 2px;
    padding: 1.25rem 1.5rem;
    display: flex; align-items: flex-start; justify-content: space-between; gap: 1.5rem;
    transition: border-color .2s;
  }
  .lista-row:hover { border-color: rgba(74,82,64,.25); }
  .lista-row--nieaktywna { opacity: .55; }
  .lista-row__content { flex: 1; min-width: 0; }
  .lista-row__top {
    display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; margin-bottom: .4rem;
  }
  .lista-row__tytul {
    font-family: 'Cormorant Garamond', serif; font-size: 1.15rem; font-weight: 400; color: var(--olive-dark);
  }
  .lista-row__badges { display: flex; gap: .4rem; flex-wrap: wrap; }
  .lista-row__opis {
    font-family: 'DM Sans', sans-serif; font-size: .82rem; font-weight: 300;
    line-height: 1.55; color: var(--olive);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 600px;
    margin-bottom: .25rem;
  }
  .lista-row__link {
    font-family: 'DM Sans', sans-serif; font-size: .7rem; font-weight: 300;
    color: var(--amber); text-decoration: none;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    display: block; max-width: 400px;
  }
  .lista-row__link:hover { text-decoration: underline; }
  .lista-row__actions { display: flex; gap: .5rem; flex-shrink: 0; align-items: flex-start; }

  .badge {
    font-family: 'DM Sans', sans-serif; font-size: .6rem; font-weight: 400;
    letter-spacing: .08em; text-transform: uppercase; padding: .2rem .6rem; border-radius: 1px;
  }
  .badge--amber  { background: rgba(200,151,58,.12); color: var(--amber); border: 1px solid rgba(200,151,58,.25); }
  .badge--green  { background: rgba(74,130,74,.1); color: #4a824a; border: 1px solid rgba(74,130,74,.2); }
  .badge--gray   { background: rgba(74,82,64,.08); color: var(--olive-light); border: 1px solid var(--border); }
  .badge--olive  { background: rgba(74,82,64,.08); color: var(--olive); border: 1px solid var(--border); }
  .badge--red    { background: rgba(180,60,60,.1); color: #c05050; border: 1px solid rgba(180,60,60,.2); }
  .badge--off    { background: rgba(180,80,80,.08); color: #c05050; border: 1px solid rgba(180,80,80,.2); }

  .admin-hint {
    margin-top: 2rem; padding: .85rem 1.1rem;
    font-family: 'DM Sans', sans-serif; font-size: .78rem; font-weight: 300; line-height: 1.6;
    color: var(--olive-light); background: var(--cream-dark);
    border: 1px solid var(--border); border-radius: 1px;
  }
  .admin-hint a { color: var(--amber); text-decoration: none; }
  .admin-hint a:hover { text-decoration: underline; }

  .btn-primary {
    font-family: 'DM Sans', sans-serif; font-size: .72rem; font-weight: 400;
    letter-spacing: .15em; text-transform: uppercase;
    color: var(--white); background: var(--amber);
    border: none; border-radius: 1px; padding: .7rem 1.5rem;
    cursor: pointer; transition: background .2s, transform .15s;
  }
  .btn-primary:hover:not(:disabled) { background: var(--amber-light); transform: translateY(-1px); }
  .btn-primary:disabled { opacity: .55; cursor: not-allowed; }
  .btn-secondary {
    font-family: 'DM Sans', sans-serif; font-size: .72rem; font-weight: 400;
    letter-spacing: .15em; text-transform: uppercase; color: var(--olive);
    background: transparent; border: 1px solid var(--border); border-radius: 1px;
    padding: .7rem 1.5rem; cursor: pointer; transition: border-color .2s;
  }
  .btn-secondary:hover { border-color: rgba(74,82,64,.3); }
  .btn-edit {
    font-family: 'DM Sans', sans-serif; font-size: .68rem; font-weight: 400;
    letter-spacing: .1em; text-transform: uppercase; color: var(--olive);
    background: transparent; border: 1px solid var(--border); border-radius: 1px;
    padding: .4rem .9rem; cursor: pointer; transition: all .2s;
  }
  .btn-edit:hover { border-color: var(--olive); }
  .btn-delete {
    font-family: 'DM Sans', sans-serif; font-size: .68rem; font-weight: 400;
    letter-spacing: .1em; text-transform: uppercase; color: #c05050;
    background: transparent; border: 1px solid rgba(180,80,80,.2); border-radius: 1px;
    padding: .4rem .9rem; cursor: pointer; transition: all .2s;
  }
  .btn-delete:hover { background: rgba(180,80,80,.06); border-color: rgba(180,80,80,.4); }
  .btn-danger {
    font-family: 'DM Sans', sans-serif; font-size: .72rem; font-weight: 400;
    letter-spacing: .15em; text-transform: uppercase; color: var(--white); background: #c05050;
    border: none; border-radius: 1px; padding: .7rem 1.5rem; cursor: pointer;
  }
  .btn-danger:hover { background: #a03030; }

  .formularz {
    background: var(--white); border: 1px solid var(--border);
    border-radius: 2px; padding: 2rem; max-width: 720px;
  }
  .formularz__title {
    font-family: 'Cormorant Garamond', serif; font-size: 1.6rem; font-weight: 300;
    color: var(--olive-dark); margin-bottom: 1.75rem;
    padding-bottom: 1rem; border-bottom: 1px solid var(--border);
  }
  .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .form-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
  .form-field { margin-bottom: 1.25rem; }
  .form-label {
    display: block; font-family: 'DM Sans', sans-serif; font-size: .65rem; font-weight: 400;
    letter-spacing: .2em; text-transform: uppercase; color: var(--olive-light); margin-bottom: .4rem;
  }
  .form-input {
    width: 100%; font-family: 'DM Sans', sans-serif; font-size: .88rem; font-weight: 300;
    color: var(--olive-dark); background: var(--cream);
    border: 1px solid var(--border); border-radius: 1px; padding: .65rem .9rem;
    outline: none; transition: border-color .2s;
  }
  .form-input:focus { border-color: var(--amber); background: var(--white); }
  .form-textarea { resize: vertical; min-height: 100px; }
  .form-select { appearance: none; cursor: pointer; }
  .form-checkboxes { display: flex; gap: 1.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
  .form-checkbox {
    display: flex; align-items: center; gap: .5rem;
    font-family: 'DM Sans', sans-serif; font-size: .82rem; font-weight: 300;
    color: var(--olive); cursor: pointer;
  }
  .form-checkbox input { accent-color: var(--amber); width: 15px; height: 15px; cursor: pointer; }
  .form-error {
    font-family: 'DM Sans', sans-serif; font-size: .78rem; font-weight: 300; color: #c05050;
    padding: .6rem .9rem; margin-bottom: 1rem;
    background: rgba(180,80,80,.07); border-left: 2px solid rgba(180,80,80,.4);
  }
  .form-actions { display: flex; gap: .75rem; }

  .modal-overlay {
    position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,.5);
    display: flex; align-items: center; justify-content: center; padding: 1rem;
  }
  .modal {
    background: var(--white); border-radius: 2px; padding: 2rem; max-width: 420px; width: 100%;
    box-shadow: 0 16px 48px rgba(0,0,0,.2);
  }
  .modal__title {
    font-family: 'Cormorant Garamond', serif; font-size: 1.4rem; font-weight: 300;
    color: var(--olive-dark); margin-bottom: .75rem;
  }
  .modal__text {
    font-family: 'DM Sans', sans-serif; font-size: .85rem; font-weight: 300;
    line-height: 1.6; color: var(--olive); margin-bottom: 1.5rem;
  }
  .modal__actions { display: flex; gap: .75rem; }

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

  .empty-state {
    text-align: center; padding: 4rem 2rem;
    font-family: 'DM Sans', sans-serif; font-size: .9rem; font-weight: 300; color: var(--olive-light);
  }
  .empty-state__ikona { font-size: 2.5rem; display: block; margin-bottom: 1rem; }

  @media (max-width: 700px) {
    .form-row-2, .form-row-3 { grid-template-columns: 1fr; }
    .form-row-2 .form-field[style], .form-row-3 .form-field[style] { grid-column: auto !important; }
    .panel-main { padding: 1.5rem 1.25rem 3rem; }
    .lista-row { flex-direction: column; }
    .panel-topbar { padding: 0 1.25rem; }
    .tab-header { flex-direction: column; align-items: flex-start; }
  }
`;
