import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const MEDIA = import.meta.env.VITE_MEDIA_URL;

const getHeaders = () => ({
  Authorization: `Token ${localStorage.getItem("token")}`,
});

const SEKCJE_NAZWY = {
  pokoje:      { label: "Pokoje",     ikona: "🛏️" },
  podworze:    { label: "Podwórze",   ikona: "🌿" },
  pensjonat:   { label: "Pensjonat",  ikona: "🏡" },
  okolice:     { label: "Okolice",    ikona: "⛰️" },
  restauracja: { label: "Restauracja",ikona: "🍽️" },
};

// ─── FORMULARZ DODAWANIA ZDJĘĆ ───
function FormularzZdjecia({ sekcjeAll, onSave, onCancel }) {
  const [sekcja,    setSekcja]    = useState(sekcjeAll[0]?.id || "");
  const [pliki,     setPliki]     = useState([]);
  const [opis,      setOopis]     = useState("");
  const [kolejnosc, setKolejnosc] = useState(0);
  const [wyroznienie, setWyroznienie] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [error,     setError]     = useState("");
  const inputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
    setPliki(prev => [...prev, ...dropped]);
  };

  const handleFileChange = (e) => {
    const wybrane = Array.from(e.target.files).filter(f => f.type.startsWith("image/"));
    setPliki(prev => [...prev, ...wybrane]);
  };

  const usunPlik = (idx) => setPliki(prev => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!sekcja || pliki.length === 0) {
      setError("Wybierz sekcję i przynajmniej jedno zdjęcie."); return;
    }
    setSaving(true); setError(""); setProgress(0);
    let uploaded = 0;
    try {
      for (const plik of pliki) {
        const fd = new FormData();
        fd.append("sekcja", sekcja);
        fd.append("zdjecie", plik);
        fd.append("opis", opis);
        fd.append("kolejnosc", kolejnosc);
        fd.append("wyroznienie", wyroznienie);
        fd.append("aktywne", true);
        await axios.post(`${API}/galeria/manage/zdjecia/`, fd, {
          headers: { ...getHeaders(), "Content-Type": "multipart/form-data" },
        });
        uploaded++;
        setProgress(Math.round((uploaded / pliki.length) * 100));
      }
      onSave();
    } catch {
      setError("Błąd podczas uploadu. Sprawdź format pliku.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="formularz">
      <h2 className="formularz__title">Dodaj zdjęcia</h2>

      <div className="form-row-2">
        <div className="form-field">
          <label className="form-label">Sekcja *</label>
          <select className="form-input form-select" value={sekcja} onChange={e => setSekcja(e.target.value)}>
            <option value="">— wybierz —</option>
            {sekcjeAll.map(s => {
              const meta = SEKCJE_NAZWY[s.nazwa] || { label: s.nazwa, ikona: "📁" };
              return <option key={s.id} value={s.id}>{meta.ikona} {meta.label}</option>;
            })}
          </select>
        </div>
        <div className="form-field">
          <label className="form-label">Kolejność</label>
          <input className="form-input" type="number" value={kolejnosc} onChange={e => setKolejnosc(e.target.value)} min="0" />
        </div>
      </div>

      <div className="form-field">
        <label className="form-label">Opis (opcjonalny — zostanie przypisany do wszystkich)</label>
        <input className="form-input" value={opis} onChange={e => setOopis(e.target.value)} placeholder="Opis zdjęcia..." />
      </div>

      <div className="form-checkboxes">
        <label className="form-checkbox">
          <input type="checkbox" checked={wyroznienie} onChange={e => setWyroznienie(e.target.checked)} />
          <span>Wyróżnione (widoczne na głównej sekcji)</span>
        </label>
      </div>

      {/* DROP ZONE */}
      <div
        className="dropzone"
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={handleFileChange} />
        <span className="dropzone__ikona">📸</span>
        <p className="dropzone__tekst">Przeciągnij zdjęcia tutaj lub kliknij aby wybrać</p>
        <p className="dropzone__hint">JPG, PNG, WebP — bez limitu ilości</p>
      </div>

      {pliki.length > 0 && (
        <div className="preview-grid">
          {pliki.map((plik, idx) => (
            <div key={idx} className="preview-item">
              <img src={URL.createObjectURL(plik)} alt={plik.name} className="preview-img" />
              <button className="preview-remove" onClick={() => usunPlik(idx)}>✕</button>
              <span className="preview-name">{plik.name}</span>
            </div>
          ))}
        </div>
      )}

      {saving && (
        <div className="progress-wrap">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
          <span className="progress-label">{progress}% — wysyłanie {pliki.length} zdjęć...</span>
        </div>
      )}

      {error && <div className="form-error">{error}</div>}
      <div className="form-actions">
        <button className="btn-primary" onClick={handleSave} disabled={saving || pliki.length === 0}>
          {saving ? `Wysyłanie... ${progress}%` : `Wgraj ${pliki.length > 0 ? `(${pliki.length})` : ""}`}
        </button>
        <button className="btn-secondary" onClick={onCancel}>Anuluj</button>
      </div>
    </div>
  );
}

// ─── MODAL EDYCJI ZDJĘCIA ───
function ModalEdycjiZdjecia({ zdjecie, onSave, onClose }) {
  const [form, setForm] = useState({
    tytul:       zdjecie.tytul       || "",
    opis:        zdjecie.opis        || "",
    kolejnosc:   zdjecie.kolejnosc   ?? 0,
    wyroznienie: zdjecie.wyroznienie ?? false,
    aktywne:     zdjecie.aktywne     ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.patch(`${API}/galeria/manage/zdjecia/${zdjecie.id}/`, form, { headers: getHeaders() });
      onSave();
    } catch {
      alert("Błąd zapisu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--wide" onClick={e => e.stopPropagation()}>
        <div className="modal__preview">
          <img src={`${MEDIA}${zdjecie.zdjecie}`} alt="" className="modal__img" />
        </div>
        <h3 className="modal__title">Edytuj zdjęcie</h3>

        <div className="form-field">
          <label className="form-label">Tytuł</label>
          <input className="form-input" value={form.tytul} onChange={e => setForm(f => ({...f, tytul: e.target.value}))} placeholder="Tytuł zdjęcia" />
        </div>
        <div className="form-field">
          <label className="form-label">Opis</label>
          <input className="form-input" value={form.opis} onChange={e => setForm(f => ({...f, opis: e.target.value}))} placeholder="Opis zdjęcia" />
        </div>
        <div className="form-row-2" style={{ gap: "1rem" }}>
          <div className="form-field" style={{ marginBottom: 0 }}>
            <label className="form-label">Kolejność</label>
            <input className="form-input" type="number" value={form.kolejnosc} onChange={e => setForm(f => ({...f, kolejnosc: e.target.value}))} min="0" />
          </div>
        </div>
        <div className="form-checkboxes" style={{ marginTop: "1rem" }}>
          <label className="form-checkbox">
            <input type="checkbox" checked={form.wyroznienie} onChange={e => setForm(f => ({...f, wyroznienie: e.target.checked}))} />
            <span>Wyróżnione</span>
          </label>
          <label className="form-checkbox">
            <input type="checkbox" checked={form.aktywne} onChange={e => setForm(f => ({...f, aktywne: e.target.checked}))} />
            <span>Aktywne</span>
          </label>
        </div>

        <div className="modal__actions" style={{ marginTop: "1.25rem" }}>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? "Zapisywanie..." : "Zapisz"}</button>
          <button className="btn-secondary" onClick={onClose}>Anuluj</button>
        </div>
      </div>
    </div>
  );
}

// ─── GŁÓWNY WIDOK ───
export default function PanelGaleria() {
  const navigate = useNavigate();
  const [sekcje,       setSekcje]       = useState([]);
  const [zdjecia,      setZdjecia]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [aktywnaSekcja,setAktywnaSekcja]= useState("all");
  const [widok,        setWidok]        = useState("lista");
  const [edytowane,    setEdytowane]    = useState(null);
  const [usuwane,      setUsuwane]      = useState(null);

  const pobierz = async () => {
    try {
      const [rSekcje, rZdjecia] = await Promise.all([
        axios.get(`${API}/galeria/manage/sekcje/`, { headers: getHeaders() }),
        axios.get(`${API}/galeria/manage/zdjecia/`, { headers: getHeaders() }),
      ]);
      setSekcje(rSekcje.data);
      setZdjecia(rZdjecia.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { pobierz(); }, []);

  const handleUsun = async (id) => {
    try {
      await axios.delete(`${API}/galeria/manage/zdjecia/${id}/`, { headers: getHeaders() });
      setUsuwane(null); pobierz();
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

  const widoczneZdjecia = aktywnaSekcja === "all"
    ? zdjecia
    : zdjecia.filter(z => String(z.sekcja) === aktywnaSekcja);

  if (widok === "dodaj") {
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
              <div><div className="page-label">Panel zarządzania</div><h1 className="page-title">Galeria</h1></div>
            </div>
            <FormularzZdjecia
              sekcjeAll={sekcje}
              onSave={() => { setWidok("lista"); pobierz(); }}
              onCancel={() => setWidok("lista")}
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
          <Link to="/panel" className="topbar-back">← Panel główny</Link>
          <button className="btn-logout" onClick={handleLogout}>Wyloguj</button>
        </header>

        <main className="panel-main">
          <div className="page-header">
            <div>
              <div className="page-label">Panel zarządzania</div>
              <h1 className="page-title">Galeria</h1>
            </div>
            <button className="btn-primary" onClick={() => setWidok("dodaj")}>+ Dodaj zdjęcia</button>
          </div>

          {/* FILTRY SEKCJI */}
          <div className="sekcje-filtry">
            <button
              className={`sekcja-btn ${aktywnaSekcja === "all" ? "sekcja-btn--active" : ""}`}
              onClick={() => setAktywnaSekcja("all")}
            >
              Wszystkie <span className="sekcja-count">{zdjecia.length}</span>
            </button>
            {sekcje.map(s => {
              const meta = SEKCJE_NAZWY[s.nazwa] || { label: s.nazwa, ikona: "📁" };
              const count = zdjecia.filter(z => z.sekcja === s.id).length;
              return (
                <button
                  key={s.id}
                  className={`sekcja-btn ${aktywnaSekcja === String(s.id) ? "sekcja-btn--active" : ""}`}
                  onClick={() => setAktywnaSekcja(String(s.id))}
                >
                  {meta.ikona} {meta.label} <span className="sekcja-count">{count}</span>
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="foto-grid">
              {[1,2,3,4,5,6].map(i => <div key={i} className="foto-skeleton" />)}
            </div>
          ) : widoczneZdjecia.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state__ikona">🖼️</span>
              <p>Brak zdjęć w tej sekcji. Kliknij „+ Dodaj zdjęcia" aby wgrać.</p>
            </div>
          ) : (
            <div className="foto-grid">
              {widoczneZdjecia.map(z => {
                const sekcja = sekcje.find(s => s.id === z.sekcja);
                const meta = sekcja ? (SEKCJE_NAZWY[sekcja.nazwa] || { label: sekcja.nazwa }) : null;
                return (
                  <div key={z.id} className={`foto-card ${!z.aktywne ? "foto-card--nieaktywne" : ""}`}>
                    <div className="foto-card__img-wrap">
                      <img src={`${MEDIA}${z.zdjecie}`} alt={z.tytul || z.opis || ""} className="foto-card__img" loading="lazy" />
                      {z.wyroznienie && <span className="foto-card__badge">⭐ Wyróżnione</span>}
                      {!z.aktywne && <span className="foto-card__badge foto-card__badge--off">Nieaktywne</span>}
                    </div>
                    <div className="foto-card__body">
                      <div className="foto-card__meta">
                        {meta && <span className="badge badge--gray">{meta.ikona} {meta.label}</span>}
                      </div>
                      {(z.tytul || z.opis) && (
                        <p className="foto-card__opis">{z.tytul || z.opis}</p>
                      )}
                      <div className="foto-card__actions">
                        <button className="btn-edit" onClick={() => setEdytowane(z)}>Edytuj</button>
                        <button className="btn-delete" onClick={() => setUsuwane(z)}>Usuń</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {edytowane && (
        <ModalEdycjiZdjecia
          zdjecie={edytowane}
          onSave={() => { setEdytowane(null); pobierz(); }}
          onClose={() => setEdytowane(null)}
        />
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

  .panel-main { max-width: 1200px; margin: 0 auto; padding: 2.5rem 2.5rem 4rem; width: 100%; }

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

  /* SEKCJE FILTRY */
  .sekcje-filtry {
    display: flex; gap: .5rem; flex-wrap: wrap; margin-bottom: 1.75rem;
  }
  .sekcja-btn {
    font-family: 'DM Sans', sans-serif; font-size: .72rem; font-weight: 300;
    color: var(--olive-light); background: var(--white);
    border: 1px solid var(--border); border-radius: 1px;
    padding: .45rem .9rem; cursor: pointer; transition: all .2s;
    display: flex; align-items: center; gap: .4rem;
  }
  .sekcja-btn:hover { border-color: var(--olive-light); color: var(--olive); }
  .sekcja-btn--active {
    background: var(--olive-dark); color: var(--white); border-color: var(--olive-dark);
  }
  .sekcja-count {
    font-size: .65rem; padding: .1rem .4rem;
    background: rgba(255,255,255,.15); border-radius: 8px;
  }
  .sekcja-btn:not(.sekcja-btn--active) .sekcja-count {
    background: rgba(74,82,64,.1); color: var(--olive-light);
  }

  /* FOTO GRID */
  .foto-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1rem;
  }
  .foto-skeleton {
    aspect-ratio: 4/3; border-radius: 2px;
    background: linear-gradient(90deg, #e2ddd6 25%, #ede9e2 50%, #e2ddd6 75%);
    background-size: 800px 100%;
    animation: shimmer 1.4s infinite;
  }
  .foto-card {
    background: var(--white); border: 1px solid var(--border); border-radius: 2px;
    overflow: hidden; transition: border-color .2s, transform .2s;
  }
  .foto-card:hover { border-color: rgba(74,82,64,.3); transform: translateY(-2px); }
  .foto-card--nieaktywne { opacity: .5; }
  .foto-card__img-wrap { position: relative; aspect-ratio: 4/3; overflow: hidden; background: var(--cream-dark); }
  .foto-card__img { width: 100%; height: 100%; object-fit: cover; transition: transform .3s; }
  .foto-card:hover .foto-card__img { transform: scale(1.04); }
  .foto-card__badge {
    position: absolute; top: .5rem; left: .5rem;
    font-family: 'DM Sans', sans-serif; font-size: .58rem; font-weight: 400;
    letter-spacing: .1em; text-transform: uppercase;
    background: rgba(200,151,58,.9); color: var(--white);
    padding: .2rem .5rem; border-radius: 1px;
  }
  .foto-card__badge--off { background: rgba(50,50,50,.75); }
  .foto-card__body { padding: .75rem; }
  .foto-card__meta { margin-bottom: .35rem; }
  .foto-card__opis {
    font-family: 'DM Sans', sans-serif; font-size: .75rem; font-weight: 300;
    color: var(--olive); line-height: 1.45;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    margin-bottom: .6rem;
  }
  .foto-card__actions { display: flex; gap: .5rem; }

  /* DROPZONE */
  .dropzone {
    border: 2px dashed rgba(74,82,64,.2); border-radius: 2px;
    padding: 2.5rem; text-align: center; cursor: pointer;
    transition: border-color .2s, background .2s;
    margin-bottom: 1.25rem; background: var(--cream);
  }
  .dropzone:hover { border-color: var(--amber); background: rgba(200,151,58,.05); }
  .dropzone__ikona { font-size: 2rem; display: block; margin-bottom: .75rem; }
  .dropzone__tekst {
    font-family: 'DM Sans', sans-serif; font-size: .88rem; font-weight: 300;
    color: var(--olive); margin-bottom: .35rem;
  }
  .dropzone__hint {
    font-family: 'DM Sans', sans-serif; font-size: .72rem; font-weight: 300; color: var(--olive-light);
  }

  /* PREVIEW GRID */
  .preview-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: .75rem; margin-bottom: 1.25rem;
  }
  .preview-item { position: relative; }
  .preview-img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 2px; display: block; }
  .preview-remove {
    position: absolute; top: .25rem; right: .25rem;
    width: 20px; height: 20px; border-radius: 50%;
    background: rgba(0,0,0,.65); color: var(--white); border: none;
    font-size: .7rem; cursor: pointer; display: flex; align-items: center; justify-content: center;
    line-height: 1;
  }
  .preview-name {
    display: block; font-family: 'DM Sans', sans-serif; font-size: .6rem; font-weight: 300;
    color: var(--olive-light); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;
    margin-top: .25rem;
  }

  /* PROGRESS */
  .progress-wrap {
    margin-bottom: 1rem; background: var(--cream-dark); border-radius: 1px; overflow: hidden; position: relative;
    height: 28px; border: 1px solid var(--border);
  }
  .progress-bar { height: 100%; background: var(--amber); transition: width .3s; }
  .progress-label {
    position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    font-family: 'DM Sans', sans-serif; font-size: .72rem; font-weight: 400; color: var(--olive-dark);
  }

  /* MODAL */
  .modal-overlay {
    position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,.55);
    display: flex; align-items: center; justify-content: center; padding: 1rem;
  }
  .modal {
    background: var(--white); border-radius: 2px; padding: 2rem; max-width: 420px; width: 100%;
    box-shadow: 0 16px 48px rgba(0,0,0,.2);
  }
  .modal--wide { max-width: 520px; }
  .modal__preview { margin-bottom: 1.25rem; border-radius: 1px; overflow: hidden; max-height: 200px; }
  .modal__img { width: 100%; height: 200px; object-fit: cover; display: block; }
  .modal__title {
    font-family: 'Cormorant Garamond', serif; font-size: 1.4rem; font-weight: 300;
    color: var(--olive-dark); margin-bottom: .75rem;
  }
  .modal__text {
    font-family: 'DM Sans', sans-serif; font-size: .85rem; font-weight: 300;
    line-height: 1.6; color: var(--olive); margin-bottom: 1.5rem;
  }
  .modal__actions { display: flex; gap: .75rem; }

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
  .form-checkboxes { display: flex; gap: 1.5rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
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
    font-family: 'DM Sans', sans-serif; font-size: .65rem; font-weight: 400;
    letter-spacing: .1em; text-transform: uppercase; color: var(--olive);
    background: transparent; border: 1px solid var(--border); border-radius: 1px;
    padding: .35rem .75rem; cursor: pointer; transition: all .2s; flex: 1;
  }
  .btn-edit:hover { border-color: var(--olive); }
  .btn-delete {
    font-family: 'DM Sans', sans-serif; font-size: .65rem; font-weight: 400;
    letter-spacing: .1em; text-transform: uppercase; color: #c05050;
    background: transparent; border: 1px solid rgba(180,80,80,.2); border-radius: 1px;
    padding: .35rem .75rem; cursor: pointer; transition: all .2s; flex: 1;
  }
  .btn-delete:hover { background: rgba(180,80,80,.06); border-color: rgba(180,80,80,.4); }
  .btn-danger {
    font-family: 'DM Sans', sans-serif; font-size: .72rem; font-weight: 400;
    letter-spacing: .15em; text-transform: uppercase; color: var(--white); background: #c05050;
    border: none; border-radius: 1px; padding: .7rem 1.5rem; cursor: pointer;
  }
  .btn-danger:hover { background: #a03030; }

  .badge {
    font-family: 'DM Sans', sans-serif; font-size: .6rem; font-weight: 400;
    letter-spacing: .1em; text-transform: uppercase; padding: .2rem .6rem; border-radius: 1px;
  }
  .badge--gray { background: rgba(74,82,64,.08); color: var(--olive-light); border: 1px solid var(--border); }

  .empty-state {
    text-align: center; padding: 4rem 2rem;
    font-family: 'DM Sans', sans-serif; font-size: .9rem; font-weight: 300; color: var(--olive-light);
  }
  .empty-state__ikona { font-size: 2.5rem; display: block; margin-bottom: 1rem; }

  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }

  @media (max-width: 700px) {
    .form-row-2 { grid-template-columns: 1fr; }
    .panel-main { padding: 1.5rem 1.25rem 3rem; }
    .foto-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
    .panel-topbar { padding: 0 1.25rem; }
    .sekcje-filtry { gap: .35rem; }
  }
`;
