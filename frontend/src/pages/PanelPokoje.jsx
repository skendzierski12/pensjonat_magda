import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:8000/api";

const getHeaders = () => ({
  Authorization: `Token ${localStorage.getItem("token")}`,
});

// ─── FORMULARZ TYPU POKOJU ───
function FormularzTypu({ typ, onSave, onCancel }) {
  const [form, setForm] = useState({
    nazwa: typ?.nazwa || "",
    opis: typ?.opis || "",
    liczba_osob: typ?.liczba_osob || "",
    powierzchnia: typ?.powierzchnia || "",
    aktywny: typ?.aktywny ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSave = async () => {
    if (!form.nazwa.trim() || !form.opis.trim() || !form.liczba_osob) {
      setError("Nazwa, opis i liczba osób są wymagane.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const data = {
        ...form,
        powierzchnia: form.powierzchnia || null,
      };
      if (typ) {
        await axios.put(`${API}/oferta/manage/typy-pokoi/${typ.id}/`, data, { headers: getHeaders() });
      } else {
        await axios.post(`${API}/oferta/manage/typy-pokoi/`, data, { headers: getHeaders() });
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
        {typ ? "Edytuj typ pokoju" : "Nowy typ pokoju"}
      </h2>

      <div className="form-row">
        <div className="form-field">
          <label className="form-label">Nazwa *</label>
          <input className="form-input" name="nazwa" value={form.nazwa} onChange={handleChange} placeholder="np. Pokój Dwuosobowy" />
        </div>
        <div className="form-field">
          <label className="form-label">Liczba osób *</label>
          <input className="form-input" type="number" name="liczba_osob" value={form.liczba_osob} onChange={handleChange} min="1" placeholder="2" />
        </div>
        <div className="form-field">
          <label className="form-label">Powierzchnia (m²)</label>
          <input className="form-input" type="number" name="powierzchnia" value={form.powierzchnia} onChange={handleChange} step="0.01" placeholder="22.00" />
        </div>
      </div>

      <div className="form-field">
        <label className="form-label">Opis *</label>
        <textarea className="form-input form-textarea" name="opis" value={form.opis} onChange={handleChange} placeholder="Opis typu pokoju..." rows={4} />
      </div>

      <div className="form-checkboxes">
        <label className="form-checkbox">
          <input type="checkbox" name="aktywny" checked={form.aktywny} onChange={handleChange} />
          <span>Aktywny (widoczny na stronie)</span>
        </label>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="form-actions">
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? "Zapisywanie..." : "Zapisz"}
        </button>
        <button className="btn-secondary" onClick={onCancel}>Anuluj</button>
      </div>
    </div>
  );
}

// ─── FORMULARZ POKOJU ───
function FormularzPokoju({ pokoj, typy, onSave, onCancel }) {
  const [form, setForm] = useState({
    numer: pokoj?.numer || "",
    typ_id: pokoj?.typ?.id || "",
    opis_dodatkowy: pokoj?.opis_dodatkowy || "",
    dostepny: pokoj?.dostepny ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSave = async () => {
    if (!form.numer.trim() || !form.typ_id) {
      setError("Numer pokoju i typ są wymagane.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (pokoj) {
        await axios.put(`${API}/oferta/manage/pokoje/${pokoj.id}/`, form, { headers: getHeaders() });
      } else {
        await axios.post(`${API}/oferta/manage/pokoje/`, form, { headers: getHeaders() });
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
        {pokoj ? "Edytuj pokój" : "Nowy pokój"}
      </h2>

      <div className="form-row">
        <div className="form-field">
          <label className="form-label">Numer pokoju *</label>
          <input className="form-input" name="numer" value={form.numer} onChange={handleChange} placeholder="np. 101" />
        </div>
        <div className="form-field">
          <label className="form-label">Typ pokoju *</label>
          <select className="form-input form-select" name="typ_id" value={form.typ_id} onChange={handleChange}>
            <option value="">— wybierz typ —</option>
            {typy.map(t => (
              <option key={t.id} value={t.id}>{t.nazwa}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-field">
        <label className="form-label">Opis dodatkowy</label>
        <textarea className="form-input form-textarea" name="opis_dodatkowy" value={form.opis_dodatkowy} onChange={handleChange} placeholder="Opcjonalny opis szczegółowy dla tego pokoju..." rows={3} />
      </div>

      <div className="form-checkboxes">
        <label className="form-checkbox">
          <input type="checkbox" name="dostepny" checked={form.dostepny} onChange={handleChange} />
          <span>Dostępny</span>
        </label>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="form-actions">
        <button className="btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? "Zapisywanie..." : "Zapisz"}
        </button>
        <button className="btn-secondary" onClick={onCancel}>Anuluj</button>
      </div>
    </div>
  );
}

// ─── TAB: TYPY POKOI ───
function TabTypy() {
  const [typy, setTypy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [widok, setWidok] = useState("lista");
  const [edytowany, setEdytowany] = useState(null);
  const [usuwany, setUsuwany] = useState(null);

  const pobierz = async () => {
    try {
      const res = await axios.get(`${API}/oferta/manage/typy-pokoi/`, { headers: getHeaders() });
      setTypy(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { pobierz(); }, []);

  const handleUsun = async (id) => {
    try {
      await axios.delete(`${API}/oferta/manage/typy-pokoi/${id}/`, { headers: getHeaders() });
      setUsuwany(null);
      pobierz();
    } catch {
      alert("Błąd podczas usuwania.");
    }
  };

  if (widok !== "lista") {
    return (
      <FormularzTypu
        typ={edytowany}
        onSave={() => { setWidok("lista"); setEdytowany(null); pobierz(); }}
        onCancel={() => { setWidok("lista"); setEdytowany(null); }}
      />
    );
  }

  return (
    <>
      <div className="tab-header">
        <span className="tab-count">{typy.length} typów</span>
        <button className="btn-primary" onClick={() => setWidok("nowy")}>+ Dodaj typ</button>
      </div>

      {loading ? (
        <div className="skeleton-list">{[1,2,3].map(i => <div key={i} className="skeleton-row" />)}</div>
      ) : typy.length === 0 ? (
        <div className="empty-state"><span className="empty-state__ikona">🛏️</span><p>Brak typów pokoi.</p></div>
      ) : (
        <div className="lista">
          {typy.map(t => (
            <div key={t.id} className="lista-row">
              <div className="lista-row__content">
                <div className="lista-row__top">
                  <span className="lista-row__tytul">{t.nazwa}</span>
                  <div className="lista-row__badges">
                    <span className="badge badge--olive">{"👤".repeat(Math.min(t.liczba_osob, 4))} {t.liczba_osob} os.</span>
                    {t.powierzchnia && <span className="badge badge--gray">{parseFloat(t.powierzchnia).toFixed(0)} m²</span>}
                    {t.aktywny
                      ? <span className="badge badge--green">Aktywny</span>
                      : <span className="badge badge--gray">Nieaktywny</span>
                    }
                  </div>
                </div>
                <div className="lista-row__tresc">{t.opis}</div>
              </div>
              <div className="lista-row__actions">
                <button className="btn-edit" onClick={() => { setEdytowany(t); setWidok("edytuj"); }}>Edytuj</button>
                <button className="btn-delete" onClick={() => setUsuwany(t)}>Usuń</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {usuwany && (
        <div className="modal-overlay" onClick={() => setUsuwany(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal__title">Usuń typ pokoju</h3>
            <p className="modal__text">Czy na pewno chcesz usunąć typ <strong>„{usuwany.nazwa}"</strong>? Tej operacji nie można cofnąć.</p>
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

// ─── TAB: POKOJE ───
function TabPokoje() {
  const [pokoje, setPokoje] = useState([]);
  const [typy, setTypy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [widok, setWidok] = useState("lista");
  const [edytowany, setEdytowany] = useState(null);
  const [usuwany, setUsuwany] = useState(null);

  const pobierz = async () => {
    try {
      const [rPokoje, rTypy] = await Promise.all([
        axios.get(`${API}/oferta/manage/pokoje/`, { headers: getHeaders() }),
        axios.get(`${API}/oferta/manage/typy-pokoi/`, { headers: getHeaders() }),
      ]);
      setPokoje(rPokoje.data);
      setTypy(rTypy.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { pobierz(); }, []);

  const handleUsun = async (id) => {
    try {
      await axios.delete(`${API}/oferta/manage/pokoje/${id}/`, { headers: getHeaders() });
      setUsuwany(null);
      pobierz();
    } catch {
      alert("Błąd podczas usuwania.");
    }
  };

  if (widok !== "lista") {
    return (
      <FormularzPokoju
        pokoj={edytowany}
        typy={typy}
        onSave={() => { setWidok("lista"); setEdytowany(null); pobierz(); }}
        onCancel={() => { setWidok("lista"); setEdytowany(null); }}
      />
    );
  }

  return (
    <>
      <div className="tab-header">
        <span className="tab-count">{pokoje.length} pokoi</span>
        <button className="btn-primary" onClick={() => setWidok("nowy")}>+ Dodaj pokój</button>
      </div>

      {loading ? (
        <div className="skeleton-list">{[1,2,3].map(i => <div key={i} className="skeleton-row" />)}</div>
      ) : pokoje.length === 0 ? (
        <div className="empty-state"><span className="empty-state__ikona">🚪</span><p>Brak pokoi.</p></div>
      ) : (
        <div className="lista">
          {pokoje.map(p => (
            <div key={p.id} className="lista-row">
              <div className="lista-row__content">
                <div className="lista-row__top">
                  <span className="lista-row__tytul">Pokój {p.numer}</span>
                  <div className="lista-row__badges">
                    <span className="badge badge--olive">{p.typ?.nazwa}</span>
                    {p.dostepny
                      ? <span className="badge badge--green">Dostępny</span>
                      : <span className="badge badge--gray">Zajęty</span>
                    }
                  </div>
                </div>
                {p.opis_dodatkowy && (
                  <div className="lista-row__tresc">{p.opis_dodatkowy}</div>
                )}
              </div>
              <div className="lista-row__actions">
                <button className="btn-edit" onClick={() => { setEdytowany(p); setWidok("edytuj"); }}>Edytuj</button>
                <button className="btn-delete" onClick={() => setUsuwany(p)}>Usuń</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {usuwany && (
        <div className="modal-overlay" onClick={() => setUsuwany(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal__title">Usuń pokój</h3>
            <p className="modal__text">Czy na pewno chcesz usunąć <strong>Pokój {usuwany.numer}</strong>? Tej operacji nie można cofnąć.</p>
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

// ─── TAB: ZDJĘCIA POKOI ───
function TabZdjecia() {
  const [typy, setTypy]         = useState([]);
  const [zdjecia, setZdjecia]   = useState([]);
  const [aktywnyTyp, setAktywnyTyp] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [usuwane, setUsuwane]   = useState(null);
  const [error, setError]       = useState("");

  const headers = () => ({
    Authorization: `Token ${localStorage.getItem("token")}`,
  });

  const pobierzTypy = async () => {
    const res = await axios.get(`${API}/oferta/typy-pokoi/`);
    setTypy(res.data);
    if (res.data.length > 0) setAktywnyTyp(prev => prev ?? res.data[0].id);
  };

  const pobierzZdjecia = async (typId) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API}/oferta/manage/zdjecia-pokoi/?typ_pokoju=${typId}`,
        { headers: headers() }
      );
      setZdjecia(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { pobierzTypy(); }, []);
  useEffect(() => { if (aktywnyTyp) pobierzZdjecia(aktywnyTyp); }, [aktywnyTyp]);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length || !aktywnyTyp) return;
    setUploading(true); setError("");
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("zdjecie", file);
        fd.append("typ_pokoju", aktywnyTyp);
        fd.append("kolejnosc", zdjecia.length);
        await axios.post(`${API}/oferta/manage/zdjecia-pokoi/`, fd, {
          headers: { ...headers(), "Content-Type": "multipart/form-data" },
        });
      }
      pobierzZdjecia(aktywnyTyp);
    } catch {
      setError("Błąd uploadu. Sprawdź format pliku (jpg, png, webp).");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleOkladka = async (zdj) => {
    try {
      await axios.patch(
        `${API}/oferta/manage/zdjecia-pokoi/${zdj.id}/`,
        { okladka: !zdj.okladka },
        { headers: headers() }
      );
      pobierzZdjecia(aktywnyTyp);
    } catch { setError("Błąd zmiany okładki."); }
  };

  const handleUsun = async (id) => {
    try {
      await axios.delete(`${API}/oferta/manage/zdjecia-pokoi/${id}/`, { headers: headers() });
      setUsuwane(null);
      pobierzZdjecia(aktywnyTyp);
    } catch { setError("Błąd usuwania."); }
  };

  const aktywnyNazwa = typy.find(t => t.id === aktywnyTyp)?.nazwa || "";

  return (
    <>
      {error && <div className="form-error">{error}</div>}

      <div className="zdjecia-typy">
        {typy.map(t => (
          <button
            key={t.id}
            className={`zdjecia-typ-btn${aktywnyTyp === t.id ? " zdjecia-typ-btn--active" : ""}`}
            onClick={() => setAktywnyTyp(t.id)}
          >
            {t.nazwa}
            <span className="zdjecia-typ-count">{t.zdjecia?.length ?? 0}</span>
          </button>
        ))}
      </div>

      <div className="tab-header" style={{ marginTop: "1.5rem" }}>
        <span className="tab-count">
          {loading ? "Ładowanie..." : `${zdjecia.length} zdjęć — ${aktywnyNazwa}`}
        </span>
        <label className={`btn-primary${uploading ? " btn--disabled" : ""}`} style={{ cursor: "pointer" }}>
          {uploading ? "Wgrywanie..." : "+ Dodaj zdjęcia"}
          <input
            type="file" accept="image/*" multiple
            onChange={handleUpload} disabled={uploading}
            style={{ display: "none" }}
          />
        </label>
      </div>

      {loading ? (
        <div className="zdjecia-grid">
          {[1,2,3,4].map(i => <div key={i} className="zdjecie-skeleton" />)}
        </div>
      ) : zdjecia.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__ikona">🖼️</span>
          <p>Brak zdjęć dla tego typu pokoju.<br/>Kliknij „Dodaj zdjęcia" aby wgrać pierwsze.</p>
        </div>
      ) : (
        <div className="zdjecia-grid">
          {zdjecia.map(z => (
            <div key={z.id} className={`zdjecie-card${z.okladka ? " zdjecie-card--okladka" : ""}`}>
              <div className="zdjecie-card__img-wrap">
                {/* DRF zwraca pełny URL z http://localhost:8000/media/... */}
                <img src={z.zdjecie} alt={z.opis || "Zdjęcie pokoju"} className="zdjecie-card__img" />
                {z.okladka && <span className="zdjecie-card__badge">Okładka</span>}
              </div>
              <div className="zdjecie-card__actions">
                <button
                  className={`btn-okladka${z.okladka ? " btn-okladka--active" : ""}`}
                  onClick={() => handleOkladka(z)}
                  title={z.okladka ? "Usuń okładkę" : "Ustaw jako okładkę"}
                >
                  {z.okladka ? "★" : "☆"} Okładka
                </button>
                <button className="btn-delete btn-delete--sm" onClick={() => setUsuwane(z)}>Usuń</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {usuwane && (
        <div className="modal-overlay" onClick={() => setUsuwane(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal__title">Usuń zdjęcie</h3>
            <p className="modal__text">Czy na pewno chcesz usunąć to zdjęcie? Operacji nie można cofnąć.</p>
            <div className="modal__actions">
              <button className="btn-danger" onClick={() => handleUsun(usuwane.id)}>Tak, usuń</button>
              <button className="btn-secondary" onClick={() => setUsuwane(null)}>Anuluj</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── GŁÓWNY WIDOK ───
export default function PanelPokoje() {
  const navigate = useNavigate();
  const [aktywnyTab, setAktywnyTab] = useState("typy");

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
              <h1 className="page-title">Pokoje</h1>
            </div>
          </div>

          <div className="tabs">
            <button
              className={`tab ${aktywnyTab === "typy" ? "tab--active" : ""}`}
              onClick={() => setAktywnyTab("typy")}
            >
              Typy pokoi
            </button>
            <button
              className={`tab ${aktywnyTab === "pokoje" ? "tab--active" : ""}`}
              onClick={() => setAktywnyTab("pokoje")}
            >
              Pokoje
            </button>
            <button
              className={`tab ${aktywnyTab === "zdjecia" ? "tab--active" : ""}`}
              onClick={() => setAktywnyTab("zdjecia")}
            >
              Zdjęcia
            </button>
          </div>

          <div className="tab-content">
            {aktywnyTab === "typy"    && <TabTypy />}
            {aktywnyTab === "pokoje"  && <TabPokoje />}
            {aktywnyTab === "zdjecia" && <TabZdjecia />}
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

  /* TOPBAR */
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

  /* MAIN */
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
    font-family: 'Cormorant Garamond', serif;
    font-size: 2rem; font-weight: 300; color: var(--olive-dark);
  }

  /* TABS */
  .tabs {
    display: flex; gap: 0; margin-bottom: 1.5rem;
    border-bottom: 1px solid var(--border);
  }
  .tab {
    font-family: 'DM Sans', sans-serif; font-size: .75rem; font-weight: 400;
    letter-spacing: .1em; text-transform: uppercase;
    color: var(--olive-light); background: none; border: none;
    padding: .75rem 1.5rem; cursor: pointer;
    border-bottom: 2px solid transparent; margin-bottom: -1px;
    transition: color .2s, border-color .2s;
  }
  .tab:hover { color: var(--olive); }
  .tab--active { color: var(--olive-dark); border-bottom-color: var(--amber); }

  .tab-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 1.25rem;
  }
  .tab-count {
    font-family: 'DM Sans', sans-serif; font-size: .78rem; font-weight: 300;
    color: var(--olive-light);
  }

  /* LISTA */
  .lista { display: flex; flex-direction: column; gap: .75rem; }
  .lista-row {
    background: var(--white); border: 1px solid var(--border); border-radius: 2px;
    padding: 1.25rem 1.5rem;
    display: flex; align-items: flex-start; justify-content: space-between; gap: 1.5rem;
    transition: border-color .2s;
  }
  .lista-row:hover { border-color: rgba(74,82,64,.25); }
  .lista-row__content { flex: 1; min-width: 0; }
  .lista-row__top {
    display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; margin-bottom: .4rem;
  }
  .lista-row__tytul {
    font-family: 'Cormorant Garamond', serif;
    font-size: 1.1rem; font-weight: 400; color: var(--olive-dark);
  }
  .lista-row__badges { display: flex; gap: .4rem; flex-wrap: wrap; }
  .lista-row__tresc {
    font-family: 'DM Sans', sans-serif; font-size: .82rem; font-weight: 300;
    line-height: 1.55; color: var(--olive);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 600px;
  }
  .lista-row__actions { display: flex; gap: .5rem; flex-shrink: 0; align-items: flex-start; }

  /* BADGES */
  .badge {
    font-family: 'DM Sans', sans-serif; font-size: .6rem; font-weight: 400;
    letter-spacing: .12em; text-transform: uppercase; padding: .2rem .6rem; border-radius: 1px;
  }
  .badge--amber { background: rgba(200,151,58,.12); color: var(--amber); border: 1px solid rgba(200,151,58,.25); }
  .badge--green { background: rgba(74,130,74,.1); color: #4a824a; border: 1px solid rgba(74,130,74,.2); }
  .badge--gray  { background: rgba(74,82,64,.08); color: var(--olive-light); border: 1px solid var(--border); }
  .badge--olive { background: rgba(74,82,64,.08); color: var(--olive); border: 1px solid var(--border); }

  /* BUTTONS */
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
    letter-spacing: .15em; text-transform: uppercase;
    color: var(--olive); background: transparent;
    border: 1px solid var(--border); border-radius: 1px; padding: .7rem 1.5rem;
    cursor: pointer; transition: border-color .2s;
  }
  .btn-secondary:hover { border-color: rgba(74,82,64,.3); }
  .btn-edit {
    font-family: 'DM Sans', sans-serif; font-size: .68rem; font-weight: 400;
    letter-spacing: .1em; text-transform: uppercase;
    color: var(--olive); background: transparent;
    border: 1px solid var(--border); border-radius: 1px;
    padding: .4rem .9rem; cursor: pointer; transition: all .2s;
  }
  .btn-edit:hover { border-color: var(--olive); }
  .btn-delete {
    font-family: 'DM Sans', sans-serif; font-size: .68rem; font-weight: 400;
    letter-spacing: .1em; text-transform: uppercase;
    color: #c05050; background: transparent;
    border: 1px solid rgba(180,80,80,.2); border-radius: 1px;
    padding: .4rem .9rem; cursor: pointer; transition: all .2s;
  }
  .btn-delete:hover { background: rgba(180,80,80,.06); border-color: rgba(180,80,80,.4); }
  .btn-danger {
    font-family: 'DM Sans', sans-serif; font-size: .72rem; font-weight: 400;
    letter-spacing: .15em; text-transform: uppercase;
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
    font-family: 'Cormorant Garamond', serif; font-size: 1.6rem; font-weight: 300;
    color: var(--olive-dark); margin-bottom: 1.75rem;
    padding-bottom: 1rem; border-bottom: 1px solid var(--border);
  }
  .form-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
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

  /* MODAL */
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

  /* SKELETON */
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }
  .skeleton-list { display: flex; flex-direction: column; gap: .75rem; }
  .skeleton-row {
    height: 80px; border-radius: 2px;
    background: linear-gradient(90deg, #e2ddd6 25%, #ede9e2 50%, #e2ddd6 75%);
    background-size: 800px 100%; animation: shimmer 1.4s infinite;
  }

  /* EMPTY */
  .empty-state {
    text-align: center; padding: 4rem 2rem;
    font-family: 'DM Sans', sans-serif; font-size: .9rem; font-weight: 300; color: var(--olive-light);
  }
  .empty-state__ikona { font-size: 2.5rem; display: block; margin-bottom: 1rem; }

  /* ZDJĘCIA */
  .zdjecia-typy { display: flex; flex-wrap: wrap; gap: .5rem; }
  .zdjecia-typ-btn {
    display: inline-flex; align-items: center; gap: .4rem;
    padding: .45rem 1rem; border-radius: 6px; border: 1.5px solid rgba(74,82,64,.2);
    background: white; font-family: inherit; font-size: .875rem;
    cursor: pointer; transition: all .15s;
  }
  .zdjecia-typ-btn:hover { border-color: var(--olive-light); }
  .zdjecia-typ-btn--active { background: var(--olive-dark); color: white; border-color: var(--olive-dark); }
  .zdjecia-typ-count {
    font-size: .72rem; padding: 1px 6px; border-radius: 10px;
    background: rgba(74,82,64,.12); color: var(--olive-dark);
  }
  .zdjecia-typ-btn--active .zdjecia-typ-count { background: rgba(255,255,255,.2); color: white; }
  .btn--disabled { opacity: .6; pointer-events: none; }
  .zdjecia-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem; margin-top: 1.25rem;
  }
  .zdjecie-skeleton {
    height: 180px; border-radius: 10px;
    background: linear-gradient(90deg, #f0ede8 25%, #e8e3da 50%, #f0ede8 75%);
    background-size: 200% 100%; animation: shimmer 1.4s infinite;
  }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  .zdjecie-card {
    border-radius: 10px; overflow: hidden; border: 2px solid transparent;
    background: white; box-shadow: 0 1px 6px rgba(0,0,0,.08); transition: all .2s;
  }
  .zdjecie-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.13); transform: translateY(-2px); }
  .zdjecie-card--okladka { border-color: var(--amber); }
  .zdjecie-card__img-wrap { position: relative; height: 160px; overflow: hidden; }
  .zdjecie-card__img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .zdjecie-card__badge {
    position: absolute; top: 8px; right: 8px;
    background: var(--amber); color: white; font-size: .7rem; font-weight: 700;
    padding: 2px 8px; border-radius: 10px; letter-spacing: .3px;
  }
  .zdjecie-card__actions { display: flex; gap: .4rem; padding: .5rem; }
  .btn-okladka {
    flex: 1; padding: .35rem .5rem; border-radius: 5px; font-size: .75rem;
    font-family: inherit; border: 1.5px solid rgba(74,82,64,.2);
    background: white; cursor: pointer; transition: all .15s;
  }
  .btn-okladka:hover { border-color: var(--amber); color: #9a6f1a; }
  .btn-okladka--active { border-color: var(--amber); background: rgba(200,151,58,.1); color: #9a6f1a; font-weight: 600; }
  .btn-delete--sm { padding: .35rem .65rem; font-size: .75rem; }

  /* RESPONSIVE */
  @media (max-width: 700px) {
    .form-row { grid-template-columns: 1fr; }
    .panel-main { padding: 1.5rem 1.25rem 3rem; }
    .lista-row { flex-direction: column; }
    .panel-topbar { padding: 0 1.25rem; }
    .zdjecia-grid { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }
  }
`;
