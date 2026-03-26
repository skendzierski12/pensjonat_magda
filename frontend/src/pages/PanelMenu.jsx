import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:8000/api";

const getHeaders = () => ({
  Authorization: `Token ${localStorage.getItem("token")}`,
});

// ─── FORMULARZ KATEGORII ───
function FormularzKategorii({ kat, onSave, onCancel }) {
  const [form, setForm] = useState({
    nazwa:    kat?.nazwa    || "",
    kolejnosc: kat?.kolejnosc ?? 0,
    aktywna:  kat?.aktywna  ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSave = async () => {
    if (!form.nazwa.trim()) { setError("Nazwa jest wymagana."); return; }
    setSaving(true); setError("");
    try {
      if (kat) {
        await axios.put(`${API}/restauracja/manage/menu/${kat.id}/`, form, { headers: getHeaders() });
      } else {
        await axios.post(`${API}/restauracja/manage/menu/`, form, { headers: getHeaders() });
      }
      onSave();
    } catch {
      setError("Błąd zapisu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="formularz">
      <h2 className="formularz__title">{kat ? "Edytuj kategorię" : "Nowa kategoria"}</h2>
      <div className="form-row-2">
        <div className="form-field">
          <label className="form-label">Nazwa *</label>
          <input className="form-input" name="nazwa" value={form.nazwa} onChange={handleChange} placeholder="np. Zupy" />
        </div>
        <div className="form-field">
          <label className="form-label">Kolejność</label>
          <input className="form-input" type="number" name="kolejnosc" value={form.kolejnosc} onChange={handleChange} min="0" />
        </div>
      </div>
      <div className="form-checkboxes">
        <label className="form-checkbox">
          <input type="checkbox" name="aktywna" checked={form.aktywna} onChange={handleChange} />
          <span>Aktywna</span>
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

// ─── FORMULARZ DANIA ───
function FormularzDania({ danie, kategorie, onSave, onCancel }) {
  const [form, setForm] = useState({
    nazwa:         danie?.nazwa         || "",
    opis:          danie?.opis          || "",
    cena:          danie?.cena          ? parseFloat(danie.cena).toFixed(2) : "",
    kategoria:     danie?.kategoria     || "",
    kolejnosc:     danie?.kolejnosc     ?? 0,
    widoczne:      danie?.widoczne      ?? true,
    wegetarianskie: danie?.wegetarianskie ?? false,
    wegańskie:     danie?.["wegańskie"] ?? false,
    bezglutenowe:  danie?.bezglutenowe  ?? false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSave = async () => {
    if (!form.nazwa.trim() || !form.cena || !form.kategoria) {
      setError("Nazwa, cena i kategoria są wymagane."); return;
    }
    setSaving(true); setError("");
    try {
      if (danie) {
        await axios.put(`${API}/restauracja/manage/dania/${danie.id}/`, form, { headers: getHeaders() });
      } else {
        await axios.post(`${API}/restauracja/manage/dania/`, form, { headers: getHeaders() });
      }
      onSave();
    } catch {
      setError("Błąd zapisu. Sprawdź dane.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="formularz">
      <h2 className="formularz__title">{danie ? "Edytuj danie" : "Nowe danie"}</h2>

      <div className="form-row-3">
        <div className="form-field" style={{ gridColumn: "1/3" }}>
          <label className="form-label">Nazwa *</label>
          <input className="form-input" name="nazwa" value={form.nazwa} onChange={handleChange} placeholder="np. Żurek staropolski" />
        </div>
        <div className="form-field">
          <label className="form-label">Cena (zł) *</label>
          <input className="form-input" type="number" name="cena" value={form.cena} onChange={handleChange} step="0.01" min="0" placeholder="25.00" />
        </div>
      </div>

      <div className="form-row-2">
        <div className="form-field">
          <label className="form-label">Kategoria *</label>
          <select className="form-input form-select" name="kategoria" value={form.kategoria} onChange={handleChange}>
            <option value="">— wybierz —</option>
            {kategorie.map(k => (
              <option key={k.id} value={k.id}>{k.nazwa}</option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label className="form-label">Kolejność</label>
          <input className="form-input" type="number" name="kolejnosc" value={form.kolejnosc} onChange={handleChange} min="0" />
        </div>
      </div>

      <div className="form-field">
        <label className="form-label">Opis</label>
        <textarea className="form-input form-textarea" name="opis" value={form.opis} onChange={handleChange} placeholder="Krótki opis dania..." rows={3} />
      </div>

      <div className="form-checkboxes">
        <label className="form-checkbox">
          <input type="checkbox" name="widoczne" checked={form.widoczne} onChange={handleChange} />
          <span>Widoczne w menu</span>
        </label>
        <label className="form-checkbox">
          <input type="checkbox" name="wegetarianskie" checked={form.wegetarianskie} onChange={handleChange} />
          <span>🌿 Wegetariańskie</span>
        </label>
        <label className="form-checkbox">
          <input type="checkbox" name="wegańskie" checked={form["wegańskie"]} onChange={handleChange} />
          <span>🌱 Wegańskie</span>
        </label>
        <label className="form-checkbox">
          <input type="checkbox" name="bezglutenowe" checked={form.bezglutenowe} onChange={handleChange} />
          <span>🌾 Bezglutenowe</span>
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

// ─── TAB: KATEGORIE ───
function TabKategorie() {
  const [kategorie, setKategorie] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [widok, setWidok]         = useState("lista");
  const [edytowana, setEdytowana] = useState(null);
  const [usuwana, setUsuwana]     = useState(null);

  const pobierz = async () => {
    try {
      const res = await axios.get(`${API}/restauracja/manage/menu/`, { headers: getHeaders() });
      setKategorie(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { pobierz(); }, []);

  const handleUsun = async (id) => {
    try {
      await axios.delete(`${API}/restauracja/manage/menu/${id}/`, { headers: getHeaders() });
      setUsuwana(null); pobierz();
    } catch {
      alert("Błąd podczas usuwania. Kategoria może być powiązana z daniami.");
    }
  };

  if (widok !== "lista") {
    return <FormularzKategorii
      kat={edytowana}
      onSave={() => { setWidok("lista"); setEdytowana(null); pobierz(); }}
      onCancel={() => { setWidok("lista"); setEdytowana(null); }}
    />;
  }

  return (
    <>
      <div className="tab-header">
        <span className="tab-count">{kategorie.length} kategorii</span>
        <button className="btn-primary" onClick={() => setWidok("nowy")}>+ Dodaj kategorię</button>
      </div>

      {loading ? (
        <div className="skeleton-list">{[1,2,3].map(i => <div key={i} className="skeleton-row" />)}</div>
      ) : kategorie.length === 0 ? (
        <div className="empty-state"><span className="empty-state__ikona">🍽️</span><p>Brak kategorii.</p></div>
      ) : (
        <div className="lista">
          {kategorie.map(k => (
            <div key={k.id} className="lista-row">
              <div className="lista-row__content">
                <div className="lista-row__top">
                  <span className="lista-row__tytul">{k.nazwa}</span>
                  <div className="lista-row__badges">
                    <span className="badge badge--gray">kol. {k.kolejnosc}</span>
                    {k.aktywna
                      ? <span className="badge badge--green">Aktywna</span>
                      : <span className="badge badge--gray">Nieaktywna</span>}
                    <span className="badge badge--olive">{(k.dania || []).length} dań</span>
                  </div>
                </div>
              </div>
              <div className="lista-row__actions">
                <button className="btn-edit" onClick={() => { setEdytowana(k); setWidok("edytuj"); }}>Edytuj</button>
                <button className="btn-delete" onClick={() => setUsuwana(k)}>Usuń</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {usuwana && (
        <div className="modal-overlay" onClick={() => setUsuwana(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal__title">Usuń kategorię</h3>
            <p className="modal__text">Czy na pewno chcesz usunąć kategorię <strong>„{usuwana.nazwa}"</strong>? Usunięcie może być niemożliwe jeśli są do niej przypisane dania.</p>
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

// ─── TAB: DANIA ───
function TabDania() {
  const [dania, setDania]         = useState([]);
  const [kategorie, setKategorie] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [widok, setWidok]         = useState("lista");
  const [edytowane, setEdytowane] = useState(null);
  const [usuwane, setUsuwane]     = useState(null);
  const [filtrKat, setFiltrKat]   = useState("");

  const pobierz = async () => {
    try {
      const [rDania, rKat] = await Promise.all([
        axios.get(`${API}/restauracja/manage/dania/`, { headers: getHeaders() }),
        axios.get(`${API}/restauracja/manage/menu/`, { headers: getHeaders() }),
      ]);
      setDania(rDania.data);
      setKategorie(rKat.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { pobierz(); }, []);

  const handleUsun = async (id) => {
    try {
      await axios.delete(`${API}/restauracja/manage/dania/${id}/`, { headers: getHeaders() });
      setUsuwane(null); pobierz();
    } catch {
      alert("Błąd podczas usuwania.");
    }
  };

  if (widok !== "lista") {
    return <FormularzDania
      danie={edytowane}
      kategorie={kategorie}
      onSave={() => { setWidok("lista"); setEdytowane(null); pobierz(); }}
      onCancel={() => { setWidok("lista"); setEdytowane(null); }}
    />;
  }

  const widoczne = filtrKat
    ? dania.filter(d => String(d.kategoria) === filtrKat)
    : dania;

  return (
    <>
      <div className="tab-header">
        <span className="tab-count">{widoczne.length} dań</span>
        <div className="tab-header__right">
          <select className="form-input form-select filtr-select" value={filtrKat} onChange={e => setFiltrKat(e.target.value)}>
            <option value="">Wszystkie kategorie</option>
            {kategorie.map(k => <option key={k.id} value={String(k.id)}>{k.nazwa}</option>)}
          </select>
          <button className="btn-primary" onClick={() => setWidok("nowy")}>+ Dodaj danie</button>
        </div>
      </div>

      {loading ? (
        <div className="skeleton-list">{[1,2,3,4].map(i => <div key={i} className="skeleton-row" />)}</div>
      ) : widoczne.length === 0 ? (
        <div className="empty-state"><span className="empty-state__ikona">🥘</span><p>Brak dań w tej kategorii.</p></div>
      ) : (
        <div className="lista">
          {widoczne.map(d => (
            <div key={d.id} className={`lista-row ${!d.widoczne ? "lista-row--ukryte" : ""}`}>
              <div className="lista-row__content">
                <div className="lista-row__top">
                  <span className="lista-row__tytul">{d.nazwa}</span>
                  <div className="lista-row__badges">
                    <span className="badge badge--amber">{parseFloat(d.cena).toFixed(2)} zł</span>
                    <span className="badge badge--gray">{d.kategoria_nazwa}</span>
                    {!d.widoczne && <span className="badge badge--ukryte">Ukryte</span>}
                    {d.wegetarianskie && <span className="badge badge--green">🌿 Weget.</span>}
                    {d["wegańskie"] && <span className="badge badge--green">🌱 Wegan.</span>}
                    {d.bezglutenowe && <span className="badge badge--olive">🌾 Bez glut.</span>}
                  </div>
                </div>
                {d.opis && <div className="lista-row__tresc">{d.opis}</div>}
              </div>
              <div className="lista-row__actions">
                <button className="btn-edit" onClick={() => { setEdytowane(d); setWidok("edytuj"); }}>Edytuj</button>
                <button className="btn-delete" onClick={() => setUsuwane(d)}>Usuń</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {usuwane && (
        <div className="modal-overlay" onClick={() => setUsuwane(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal__title">Usuń danie</h3>
            <p className="modal__text">Czy na pewno chcesz usunąć danie <strong>„{usuwane.nazwa}"</strong>?</p>
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

// ─── TAB: GODZINY OTWARCIA ───
const DNI = [
  "Poniedziałek", "Wtorek", "Środa", "Czwartek", "Piątek", "Sobota", "Niedziela"
];

function TabGodziny() {
  const [godziny, setGodziny] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(null); // id dnia który jest zapisywany
  const [error, setError]     = useState("");

  const pobierz = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/restauracja/manage/godziny/`, { headers: getHeaders() });
      // Uzupełnij brakujące dni (jeśli baza pusta)
      const istniejace = res.data;
      const pelne = DNI.map((_, i) => {
        const znaleziony = istniejace.find(g => g.dzien === i);
        return znaleziony || { dzien: i, godzina_od: "08:00", godzina_do: "21:00", zamkniete: false, id: null };
      });
      setGodziny(pelne);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { pobierz(); }, []);

  const handleChange = (dzien, pole, wartosc) => {
    setGodziny(prev => prev.map(g =>
      g.dzien === dzien ? { ...g, [pole]: wartosc } : g
    ));
  };

  const handleSave = async (g) => {
    setSaving(g.dzien); setError("");
    const toTime = (t) => t ? (t.length === 5 ? `${t}:00` : t) : null;
    const payload = {
      dzien:      g.dzien,
      godzina_od: g.zamkniete ? null : toTime(g.godzina_od),
      godzina_do: g.zamkniete ? null : toTime(g.godzina_do),
      zamkniete:  g.zamkniete,
    };
    try {
      if (g.id) {
        await axios.put(`${API}/restauracja/manage/godziny/${g.id}/`, payload, { headers: getHeaders() });
      } else {
        const res = await axios.post(`${API}/restauracja/manage/godziny/`, payload, { headers: getHeaders() });
        setGodziny(prev => prev.map(x => x.dzien === g.dzien ? { ...x, id: res.data.id } : x));
      }
    } catch {
      setError(`Błąd zapisu dla dnia ${DNI[g.dzien]}.`);
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <div className="skeleton-list">{[1,2,3,4,5,6,7].map(i => <div key={i} className="skeleton-row" />)}</div>;

  return (
    <>
      {error && <div className="form-error">{error}</div>}
      <div className="godziny-tabela">
        {godziny.map(g => (
          <div key={g.dzien} className={`godziny-row ${g.zamkniete ? "godziny-row--zamkniete" : ""}`}>
            <span className="godziny-dzien">{DNI[g.dzien]}</span>

            <label className="form-checkbox godziny-toggle">
              <input
                type="checkbox"
                checked={g.zamkniete}
                onChange={e => handleChange(g.dzien, "zamkniete", e.target.checked)}
              />
              <span>Zamknięte</span>
            </label>

            {!g.zamkniete ? (
              <div className="godziny-czasy">
                <input
                  type="time"
                  className="form-input godziny-input"
                  value={g.godzina_od || ""}
                  onChange={e => handleChange(g.dzien, "godzina_od", e.target.value)}
                />
                <span className="godziny-separator">—</span>
                <input
                  type="time"
                  className="form-input godziny-input"
                  value={g.godzina_do || ""}
                  onChange={e => handleChange(g.dzien, "godzina_do", e.target.value)}
                />
              </div>
            ) : (
              <div className="godziny-czasy godziny-czasy--empty">
                <span className="godziny-closed-label">Nieczynne</span>
              </div>
            )}

            <button
              className="btn-primary godziny-save"
              onClick={() => handleSave(g)}
              disabled={saving === g.dzien}
            >
              {saving === g.dzien ? "..." : "Zapisz"}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── GŁÓWNY WIDOK ───
export default function PanelMenu() {
  const navigate = useNavigate();
  const [aktywnyTab, setAktywnyTab] = useState("dania");

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
              <h1 className="page-title">Menu restauracji</h1>
            </div>
          </div>

          <div className="tabs">
            <button className={`tab ${aktywnyTab === "dania" ? "tab--active" : ""}`} onClick={() => setAktywnyTab("dania")}>Dania</button>
            <button className={`tab ${aktywnyTab === "kategorie" ? "tab--active" : ""}`} onClick={() => setAktywnyTab("kategorie")}>Kategorie</button>
            <button className={`tab ${aktywnyTab === "godziny" ? "tab--active" : ""}`} onClick={() => setAktywnyTab("godziny")}>Godziny otwarcia</button>
          </div>

          <div className="tab-content">
            {aktywnyTab === "dania" && <TabDania />}
            {aktywnyTab === "kategorie" && <TabKategorie />}
            {aktywnyTab === "godziny" && <TabGodziny />}
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

  .tabs { display: flex; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border); }
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
  .lista-row--ukryte { opacity: .6; }
  .lista-row__content { flex: 1; min-width: 0; }
  .lista-row__top {
    display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; margin-bottom: .3rem;
  }
  .lista-row__tytul {
    font-family: 'Cormorant Garamond', serif; font-size: 1.1rem; font-weight: 400; color: var(--olive-dark);
  }
  .lista-row__badges { display: flex; gap: .4rem; flex-wrap: wrap; }
  .lista-row__tresc {
    font-family: 'DM Sans', sans-serif; font-size: .82rem; font-weight: 300;
    line-height: 1.55; color: var(--olive-light);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 580px;
  }
  .lista-row__actions { display: flex; gap: .5rem; flex-shrink: 0; }

  .badge {
    font-family: 'DM Sans', sans-serif; font-size: .6rem; font-weight: 400;
    letter-spacing: .12em; text-transform: uppercase; padding: .2rem .6rem; border-radius: 1px;
  }
  .badge--amber    { background: rgba(200,151,58,.12); color: var(--amber); border: 1px solid rgba(200,151,58,.25); }
  .badge--green    { background: rgba(74,130,74,.1); color: #4a824a; border: 1px solid rgba(74,130,74,.2); }
  .badge--gray     { background: rgba(74,82,64,.08); color: var(--olive-light); border: 1px solid var(--border); }
  .badge--olive    { background: rgba(74,82,64,.08); color: var(--olive); border: 1px solid var(--border); }
  .badge--ukryte   { background: rgba(180,80,80,.08); color: #c05050; border: 1px solid rgba(180,80,80,.2); }

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
    border-radius: 2px; padding: 2rem; max-width: 680px;
  }
  .formularz__title {
    font-family: 'Cormorant Garamond', serif; font-size: 1.6rem; font-weight: 300;
    color: var(--olive-dark); margin-bottom: 1.75rem;
    padding-bottom: 1rem; border-bottom: 1px solid var(--border);
  }
  .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .form-row-3 { display: grid; grid-template-columns: 1fr 1fr 120px; gap: 1rem; }
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
  .form-textarea { resize: vertical; min-height: 80px; }
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

  .godziny-tabela {
    display: flex; flex-direction: column; gap: .5rem;
  }
  .godziny-row {
    background: var(--white); border: 1px solid var(--border); border-radius: 2px;
    padding: 1rem 1.25rem;
    display: grid;
    grid-template-columns: 140px 140px 1fr auto;
    align-items: center; gap: 1rem;
    transition: border-color .2s;
  }
  .godziny-row:hover { border-color: rgba(74,82,64,.22); }
  .godziny-row--zamkniete { opacity: .7; }
  .godziny-dzien {
    font-family: 'Cormorant Garamond', serif; font-size: 1.05rem;
    font-weight: 400; color: var(--olive-dark);
  }
  .godziny-toggle { flex-shrink: 0; }
  .godziny-czasy {
    display: flex; align-items: center; gap: .6rem;
  }
  .godziny-czasy--empty { min-height: 36px; }
  .godziny-input { width: 110px; padding: .45rem .6rem; font-size: .85rem; }
  .godziny-separator {
    font-family: 'DM Sans', sans-serif; font-size: .8rem;
    color: var(--olive-light); flex-shrink: 0;
  }
  .godziny-closed-label {
    font-family: 'DM Sans', sans-serif; font-size: .75rem;
    font-weight: 300; color: var(--olive-light); letter-spacing: .05em;
  }
  .godziny-save { padding: .45rem 1rem; font-size: .68rem; }

  @media (max-width: 700px) {
    .godziny-row { grid-template-columns: 1fr 1fr; grid-template-rows: auto auto; }
    .godziny-czasy { grid-column: 1/3; }
    .godziny-save { grid-column: 1/3; }
  }

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
    .form-row-2, .form-row-3 { grid-template-columns: 1fr; }
    .form-row-3 .form-field[style] { grid-column: auto !important; }
    .panel-main { padding: 1.5rem 1.25rem 3rem; }
    .lista-row { flex-direction: column; }
    .panel-topbar { padding: 0 1.25rem; }
    .tab-header { flex-direction: column; align-items: flex-start; }
  }
`;
