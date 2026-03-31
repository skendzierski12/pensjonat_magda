import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const getHeaders = () => ({
  Authorization: `Token ${localStorage.getItem("token")}`,
});

const RODZAJE = [
  { value: "standard", label: "Standard", ikona: "📅" },
  { value: "lato",     label: "Lato",     ikona: "☀️" },
  { value: "zima",     label: "Zima",     ikona: "❄️" },
  { value: "swieta",  label: "Święta",   ikona: "🎄" },
];

// ─── FORMULARZ SEZONU ───
function FormularzSezonu({ sezon, onSave, onCancel }) {
  const [form, setForm] = useState({
    nazwa:   sezon?.nazwa   || "",
    rodzaj:  sezon?.rodzaj  || "standard",
    data_od: sezon?.data_od || "",
    data_do: sezon?.data_do || "",
    aktywny: sezon?.aktywny ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSave = async () => {
    if (!form.nazwa.trim() || !form.data_od || !form.data_do) {
      setError("Nazwa, data od i data do są wymagane.");
      return;
    }
    setSaving(true); setError("");
    try {
      if (sezon) {
        await axios.put(`${API}/oferta/manage/sezony/${sezon.id}/`, form, { headers: getHeaders() });
      } else {
        await axios.post(`${API}/oferta/manage/sezony/`, form, { headers: getHeaders() });
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
      <h2 className="formularz__title">{sezon ? "Edytuj sezon" : "Nowy sezon"}</h2>

      <div className="form-row-2">
        <div className="form-field">
          <label className="form-label">Nazwa *</label>
          <input className="form-input" name="nazwa" value={form.nazwa} onChange={handleChange} placeholder="np. Lato 2025" />
        </div>
        <div className="form-field">
          <label className="form-label">Rodzaj *</label>
          <select className="form-input form-select" name="rodzaj" value={form.rodzaj} onChange={handleChange}>
            {RODZAJE.map(r => (
              <option key={r.value} value={r.value}>{r.ikona} {r.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row-2">
        <div className="form-field">
          <label className="form-label">Data od *</label>
          <input className="form-input" type="date" name="data_od" value={form.data_od} onChange={handleChange} />
        </div>
        <div className="form-field">
          <label className="form-label">Data do *</label>
          <input className="form-input" type="date" name="data_do" value={form.data_do} onChange={handleChange} />
        </div>
      </div>

      <div className="form-checkboxes">
        <label className="form-checkbox">
          <input type="checkbox" name="aktywny" checked={form.aktywny} onChange={handleChange} />
          <span>Aktywny</span>
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

// ─── TAB: SEZONY ───
function TabSezony({ onRefresh }) {
  const [sezony, setSezony] = useState([]);
  const [loading, setLoading] = useState(true);
  const [widok, setWidok] = useState("lista");
  const [edytowany, setEdytowany] = useState(null);
  const [usuwany, setUsuwany] = useState(null);

  const pobierz = async () => {
    try {
      const res = await axios.get(`${API}/oferta/manage/sezony/`, { headers: getHeaders() });
      setSezony(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { pobierz(); }, []);

  const handleUsun = async (id) => {
    try {
      await axios.delete(`${API}/oferta/manage/sezony/${id}/`, { headers: getHeaders() });
      setUsuwany(null);
      pobierz();
      onRefresh();
    } catch {
      alert("Błąd podczas usuwania. Sezon może być powiązany z cenami.");
    }
  };

  const handleSave = () => {
    setWidok("lista"); setEdytowany(null);
    pobierz(); onRefresh();
  };

  if (widok !== "lista") {
    return <FormularzSezonu sezon={edytowany} onSave={handleSave} onCancel={() => { setWidok("lista"); setEdytowany(null); }} />;
  }

  return (
    <>
      <div className="tab-header">
        <span className="tab-count">{sezony.length} sezonów</span>
        <button className="btn-primary" onClick={() => setWidok("nowy")}>+ Dodaj sezon</button>
      </div>

      {loading ? (
        <div className="skeleton-list">{[1,2,3].map(i => <div key={i} className="skeleton-row" />)}</div>
      ) : sezony.length === 0 ? (
        <div className="empty-state"><span className="empty-state__ikona">📅</span><p>Brak sezonów. Dodaj pierwszy sezon.</p></div>
      ) : (
        <div className="lista">
          {sezony.map(s => {
            const rodzaj = RODZAJE.find(r => r.value === s.rodzaj) || RODZAJE[0];
            return (
              <div key={s.id} className="lista-row">
                <div className="lista-row__content">
                  <div className="lista-row__top">
                    <span className="lista-row__ikona">{rodzaj.ikona}</span>
                    <span className="lista-row__tytul">{s.nazwa}</span>
                    <div className="lista-row__badges">
                      <span className="badge badge--olive">{rodzaj.label}</span>
                      {s.aktywny
                        ? <span className="badge badge--green">Aktywny</span>
                        : <span className="badge badge--gray">Nieaktywny</span>
                      }
                    </div>
                  </div>
                  <div className="lista-row__meta">
                    {new Date(s.data_od).toLocaleDateString("pl-PL")} — {new Date(s.data_do).toLocaleDateString("pl-PL")}
                  </div>
                </div>
                <div className="lista-row__actions">
                  <button className="btn-edit" onClick={() => { setEdytowany(s); setWidok("edytuj"); }}>Edytuj</button>
                  <button className="btn-delete" onClick={() => setUsuwany(s)}>Usuń</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {usuwany && (
        <div className="modal-overlay" onClick={() => setUsuwany(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal__title">Usuń sezon</h3>
            <p className="modal__text">Czy na pewno chcesz usunąć sezon <strong>„{usuwany.nazwa}"</strong>? Usunięcie sezonu usunie też powiązane ceny.</p>
            <div className="modal__actions">
              <button className="btn-danger" onClick={() => handleUsun(usuwany.id)}>Tak, usuń</button>
              <button className="btn-secondary" onClick={() => setUsuwany(null)}>Anuluj</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── TAB: CENY ───
function TabCeny() {
  const [typy, setTypy] = useState([]);
  const [sezony, setSezony] = useState([]);
  const [ceny, setCeny] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [saved, setSaved] = useState({});

  const pobierz = async () => {
    try {
      const [rTypy, rSezony, rCeny] = await Promise.all([
        axios.get(`${API}/oferta/manage/typy-pokoi/`, { headers: getHeaders() }),
        axios.get(`${API}/oferta/manage/sezony/`, { headers: getHeaders() }),
        axios.get(`${API}/oferta/manage/ceny/`, { headers: getHeaders() }),
      ]);
      setTypy(rTypy.data);
      setSezony(rSezony.data);
      setCeny(rCeny.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { pobierz(); }, []);

  // Znajdź istniejącą cenę
  const getCena = (typId, sezonId) => {
    return ceny.find(c => c.typ_pokoju === typId && c.sezon === sezonId);
  };

  // Zapisz/aktualizuj cenę
  const handleCenaChange = async (typId, sezonId, wartość) => {
    const key = `${typId}-${sezonId}`;
    if (!wartość || isNaN(parseFloat(wartość))) return;

    setSaving(s => ({ ...s, [key]: true }));
    try {
      const istniejaca = getCena(typId, sezonId);
      if (istniejaca) {
        await axios.put(`${API}/oferta/manage/ceny/${istniejaca.id}/`, {
          typ_pokoju: typId, sezon: sezonId, cena_za_noc: wartość
        }, { headers: getHeaders() });
      } else {
        const res = await axios.post(`${API}/oferta/manage/ceny/`, {
          typ_pokoju: typId, sezon: sezonId, cena_za_noc: wartość
        }, { headers: getHeaders() });
        setCeny(c => [...c, res.data]);
      }
      setSaved(s => ({ ...s, [key]: true }));
      setTimeout(() => setSaved(s => ({ ...s, [key]: false })), 1500);
      pobierz();
    } catch {
      alert("Błąd zapisu ceny.");
    } finally {
      setSaving(s => ({ ...s, [key]: false }));
    }
  };

  if (loading) return <div className="skeleton-list">{[1,2,3].map(i => <div key={i} className="skeleton-row" />)}</div>;

  if (sezony.length === 0 || typy.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-state__ikona">💰</span>
        <p>Najpierw dodaj typy pokoi i sezony, aby móc ustawiać ceny.</p>
      </div>
    );
  }

  return (
    <div className="ceny-wrap">
      <p className="ceny-hint">Wpisz cenę i kliknij Enter lub kliknij poza pole — zapis jest automatyczny.</p>
      <div className="ceny-table-wrap">
        <table className="ceny-table">
          <thead>
            <tr>
              <th className="ceny-th ceny-th--pokoj">Typ pokoju</th>
              {sezony.map(s => {
                const rodzaj = RODZAJE.find(r => r.value === s.rodzaj) || RODZAJE[0];
                return (
                  <th key={s.id} className="ceny-th">
                    <span className="ceny-sezon-ikona">{rodzaj.ikona}</span>
                    <span className="ceny-sezon-nazwa">{s.nazwa}</span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {typy.map(t => (
              <tr key={t.id} className="ceny-row">
                <td className="ceny-td ceny-td--pokoj">
                  <div className="ceny-pokoj-nazwa">{t.nazwa}</div>
                  <div className="ceny-pokoj-meta">{"👤".repeat(Math.min(t.liczba_osob, 4))} {t.liczba_osob} os.</div>
                </td>
                {sezony.map(s => {
                  const key = `${t.id}-${s.id}`;
                  const cena = getCena(t.id, s.id);
                  return (
                    <td key={s.id} className="ceny-td">
                      <div className="ceny-input-wrap">
                        <input
                          className={`ceny-input ${saved[key] ? "ceny-input--saved" : ""}`}
                          type="number"
                          min="0"
                          step="1"
                          defaultValue={cena ? parseFloat(cena.cena_za_noc).toFixed(0) : ""}
                          placeholder="—"
                          onBlur={e => handleCenaChange(t.id, s.id, e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") { e.target.blur(); } }}
                        />
                        {saving[key] && <span className="ceny-saving">⟳</span>}
                        {saved[key] && <span className="ceny-saved">✓</span>}
                        <span className="ceny-unit">zł</span>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── GŁÓWNY WIDOK ───
export default function PanelCennik() {
  const navigate = useNavigate();
  const [aktywnyTab, setAktywnyTab] = useState("ceny");
  const [refreshKey, setRefreshKey] = useState(0);

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
              <h1 className="page-title">Cennik</h1>
            </div>
          </div>

          <div className="tabs">
            <button className={`tab ${aktywnyTab === "ceny" ? "tab--active" : ""}`} onClick={() => setAktywnyTab("ceny")}>
              Ceny pokoi
            </button>
            <button className={`tab ${aktywnyTab === "sezony" ? "tab--active" : ""}`} onClick={() => setAktywnyTab("sezony")}>
              Sezony
            </button>
          </div>

          <div className="tab-content">
            {aktywnyTab === "ceny"
              ? <TabCeny key={refreshKey} />
              : <TabSezony onRefresh={() => setRefreshKey(k => k + 1)} />
            }
          </div>
        </main>
      </div>
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

  .tabs {
    display: flex; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border);
  }
  .tab {
    font-family: 'DM Sans', sans-serif; font-size: .75rem; font-weight: 400;
    letter-spacing: .1em; text-transform: uppercase;
    color: var(--olive-light); background: none; border: none;
    padding: .75rem 1.5rem; cursor: pointer;
    border-bottom: 2px solid transparent; margin-bottom: -1px; transition: color .2s, border-color .2s;
  }
  .tab:hover { color: var(--olive); }
  .tab--active { color: var(--olive-dark); border-bottom-color: var(--amber); }

  .tab-header {
    display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem;
  }
  .tab-count {
    font-family: 'DM Sans', sans-serif; font-size: .78rem; font-weight: 300; color: var(--olive-light);
  }

  /* CENY TABELA */
  .ceny-wrap { }
  .ceny-hint {
    font-family: 'DM Sans', sans-serif; font-size: .75rem; font-weight: 300;
    color: var(--olive-light); margin-bottom: 1.25rem;
  }
  .ceny-table-wrap {
    overflow-x: auto; border: 1px solid var(--border); border-radius: 2px;
  }
  .ceny-table { width: 100%; border-collapse: collapse; min-width: 500px; }
  .ceny-th {
    background: var(--cream-dark); padding: .9rem 1rem; text-align: left;
    border-bottom: 1px solid var(--border);
    font-family: 'DM Sans', sans-serif; font-size: .68rem; font-weight: 400;
    letter-spacing: .1em; text-transform: uppercase; color: var(--olive-light);
  }
  .ceny-th--pokoj { width: 220px; }
  .ceny-sezon-ikona { margin-right: .4rem; }
  .ceny-sezon-nazwa { color: var(--olive); }

  .ceny-row { transition: background .15s; }
  .ceny-row:hover { background: rgba(74,82,64,.02); }
  .ceny-row:not(:last-child) td { border-bottom: 1px solid var(--border); }

  .ceny-td { padding: .75rem 1rem; background: var(--white); }
  .ceny-td--pokoj { padding: .9rem 1.25rem; background: var(--cream); }
  .ceny-pokoj-nazwa {
    font-family: 'Cormorant Garamond', serif; font-size: 1rem; font-weight: 400; color: var(--olive-dark);
  }
  .ceny-pokoj-meta {
    font-family: 'DM Sans', sans-serif; font-size: .68rem; font-weight: 300; color: var(--olive-light);
    margin-top: .15rem;
  }

  .ceny-input-wrap { position: relative; display: flex; align-items: center; gap: .35rem; }
  .ceny-input {
    width: 80px; font-family: 'DM Sans', sans-serif; font-size: .88rem; font-weight: 300;
    color: var(--olive-dark); background: var(--cream);
    border: 1px solid var(--border); border-radius: 1px; padding: .45rem .6rem;
    outline: none; transition: border-color .2s, background .2s;
    -moz-appearance: textfield;
  }
  .ceny-input::-webkit-inner-spin-button,
  .ceny-input::-webkit-outer-spin-button { -webkit-appearance: none; }
  .ceny-input:focus { border-color: var(--amber); background: var(--white); }
  .ceny-input--saved { border-color: #4a824a; background: rgba(74,130,74,.05); }
  .ceny-unit {
    font-family: 'DM Sans', sans-serif; font-size: .68rem; font-weight: 300; color: var(--olive-light);
  }
  .ceny-saving { font-size: .8rem; color: var(--amber); animation: spin .6s linear infinite; }
  .ceny-saved { font-size: .8rem; color: #4a824a; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* LISTA */
  .lista { display: flex; flex-direction: column; gap: .75rem; }
  .lista-row {
    background: var(--white); border: 1px solid var(--border); border-radius: 2px;
    padding: 1.25rem 1.5rem;
    display: flex; align-items: flex-start; justify-content: space-between; gap: 1.5rem;
    transition: border-color .2s;
  }
  .lista-row:hover { border-color: rgba(74,82,64,.25); }
  .lista-row__content { flex: 1; }
  .lista-row__top {
    display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; margin-bottom: .3rem;
  }
  .lista-row__ikona { font-size: 1.2rem; }
  .lista-row__tytul {
    font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; font-weight: 400; color: var(--olive-dark);
  }
  .lista-row__badges { display: flex; gap: .4rem; }
  .lista-row__meta {
    font-family: 'DM Sans', sans-serif; font-size: .72rem; font-weight: 300; color: var(--olive-light);
  }
  .lista-row__actions { display: flex; gap: .5rem; flex-shrink: 0; }

  .badge {
    font-family: 'DM Sans', sans-serif; font-size: .6rem; font-weight: 400;
    letter-spacing: .12em; text-transform: uppercase; padding: .2rem .6rem; border-radius: 1px;
  }
  .badge--green { background: rgba(74,130,74,.1); color: #4a824a; border: 1px solid rgba(74,130,74,.2); }
  .badge--gray  { background: rgba(74,82,64,.08); color: var(--olive-light); border: 1px solid var(--border); }
  .badge--olive { background: rgba(74,82,64,.08); color: var(--olive); border: 1px solid var(--border); }

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
    border: none; border-radius: 1px; padding: .7rem 1.5rem; cursor: pointer; transition: background .2s;
  }
  .btn-danger:hover { background: #a03030; }

  .formularz {
    background: var(--white); border: 1px solid var(--border);
    border-radius: 2px; padding: 2rem; max-width: 580px;
  }
  .formularz__title {
    font-family: 'Cormorant Garamond', serif; font-size: 1.6rem; font-weight: 300;
    color: var(--olive-dark); margin-bottom: 1.75rem;
    padding-bottom: 1rem; border-bottom: 1px solid var(--border);
  }
  .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
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
  .form-select { appearance: none; cursor: pointer; }
  .form-checkboxes { display: flex; gap: 1.5rem; margin-bottom: 1.5rem; }
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
    height: 72px; border-radius: 2px;
    background: linear-gradient(90deg, #e2ddd6 25%, #ede9e2 50%, #e2ddd6 75%);
    background-size: 800px 100%; animation: shimmer 1.4s infinite;
  }

  .empty-state {
    text-align: center; padding: 4rem 2rem;
    font-family: 'DM Sans', sans-serif; font-size: .9rem; font-weight: 300; color: var(--olive-light);
  }
  .empty-state__ikona { font-size: 2.5rem; display: block; margin-bottom: 1rem; }

  @media (max-width: 700px) {
    .form-row-2 { grid-template-columns: 1fr; }
    .panel-main { padding: 1.5rem 1.25rem 3rem; }
    .lista-row { flex-direction: column; }
    .panel-topbar { padding: 0 1.25rem; }
  }
`;
