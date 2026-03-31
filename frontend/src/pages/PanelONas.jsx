import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;
const MEDIA = import.meta.env.VITE_MEDIA_URL;

const getHeaders = () => ({
  Authorization: `Token ${localStorage.getItem("token")}`,
});

// ─── FORMULARZ SEKCJI ───
function FormularzSekcji({ sekcja, onSave, onCancel }) {
  const [form, setForm] = useState({
    tytul:     sekcja?.tytul     || "",
    tresc:     sekcja?.tresc     || "",
    kolejnosc: sekcja?.kolejnosc ?? 0,
    aktywne:   sekcja?.aktywne   ?? true,
  });
  const [noweZdjecie, setNoweZdjecie] = useState(null);
  const [preview,     setPreview]     = useState(
    sekcja?.zdjecie ? `${MEDIA}${sekcja.zdjecie}` : null
  );
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");
  const inputRef = useRef();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleFileChange = (e) => {
    const plik = e.target.files[0];
    if (!plik) return;
    setNoweZdjecie(plik);
    setPreview(URL.createObjectURL(plik));
  };

  const handleSave = async () => {
    if (!form.tytul.trim() || !form.tresc.trim()) {
      setError("Tytuł i treść są wymagane."); return;
    }
    setSaving(true); setError("");
    try {
      const fd = new FormData();
      fd.append("tytul",     form.tytul);
      fd.append("tresc",     form.tresc);
      fd.append("kolejnosc", form.kolejnosc);
      fd.append("aktywne",   form.aktywne);
      if (noweZdjecie) fd.append("zdjecie", noweZdjecie);

      if (sekcja) {
        await axios.patch(
          `${API}/core/manage/o-nas/${sekcja.id}/`,
          fd,
          { headers: getHeaders() }
        );
      } else {
        await axios.post(
          `${API}/core/manage/o-nas/`,
          fd,
          { headers: getHeaders() }
        );
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
        {sekcja ? "Edytuj sekcję O nas" : "Nowa sekcja O nas"}
      </h2>

      <div className="form-row-2">
        <div className="form-field">
          <label className="form-label">Tytuł *</label>
          <input
            className="form-input"
            name="tytul"
            value={form.tytul}
            onChange={handleChange}
            placeholder="np. Nasza historia"
          />
        </div>
        <div className="form-field">
          <label className="form-label">Kolejność</label>
          <input
            className="form-input"
            type="number"
            name="kolejnosc"
            value={form.kolejnosc}
            onChange={handleChange}
            min="0"
          />
        </div>
      </div>

      <div className="form-field">
        <label className="form-label">Treść *</label>
        <textarea
          className="form-input form-textarea"
          name="tresc"
          value={form.tresc}
          onChange={handleChange}
          placeholder="Treść sekcji..."
          rows={7}
        />
        <div className="form-hint">{form.tresc.length} znaków</div>
      </div>

      {/* ZDJĘCIE */}
      <div className="form-field">
        <label className="form-label">Zdjęcie (opcjonalne)</label>
        <div className="zdjecie-wrap">
          {preview && (
            <div className="zdjecie-preview">
              <img src={preview} alt="podgląd" className="zdjecie-img" />
              <button
                className="zdjecie-remove"
                onClick={() => { setNoweZdjecie(null); setPreview(null); }}
                type="button"
              >✕</button>
            </div>
          )}
          <button
            className="btn-upload"
            onClick={() => inputRef.current?.click()}
            type="button"
          >
            {preview ? "Zmień zdjęcie" : "+ Dodaj zdjęcie"}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>
      </div>

      <div className="form-checkboxes">
        <label className="form-checkbox">
          <input type="checkbox" name="aktywne" checked={form.aktywne} onChange={handleChange} />
          <span>Aktywna (widoczna na stronie)</span>
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

// ─── GŁÓWNY WIDOK ───
export default function PanelONas() {
  const navigate = useNavigate();
  const [sekcje,    setSekcje]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [widok,     setWidok]     = useState("lista");
  const [edytowana, setEdytowana] = useState(null);
  const [usuwana,   setUsuwana]   = useState(null);

  const pobierz = async () => {
    try {
      const res = await axios.get(`${API}/core/manage/o-nas/`, { headers: getHeaders() });
      setSekcje(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { pobierz(); }, []);

  const handleUsun = async (id) => {
    try {
      await axios.delete(`${API}/core/manage/o-nas/${id}/`, { headers: getHeaders() });
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
              <div>
                <div className="page-label">Panel zarządzania</div>
                <h1 className="page-title">O nas</h1>
              </div>
            </div>
            <FormularzSekcji
              sekcja={edytowana}
              onSave={() => { setWidok("lista"); setEdytowana(null); pobierz(); }}
              onCancel={() => { setWidok("lista"); setEdytowana(null); }}
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
              <h1 className="page-title">O nas</h1>
            </div>
            <button className="btn-primary" onClick={() => setWidok("nowy")}>
              + Dodaj sekcję
            </button>
          </div>

          <p className="page-desc">
            Każda sekcja to osobny blok na stronie „O nas" — tytuł, tekst i opcjonalne zdjęcie.
            Kolejność decyduje o porządku wyświetlania.
          </p>

          {loading ? (
            <div className="skeleton-list">
              {[1,2,3].map(i => <div key={i} className="skeleton-row" />)}
            </div>
          ) : sekcje.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state__ikona">📖</span>
              <p>Brak sekcji. Dodaj pierwszą sekcję strony „O nas".</p>
            </div>
          ) : (
            <div className="lista">
              {sekcje.map(s => (
                <div key={s.id} className={`lista-row ${!s.aktywne ? "lista-row--nieaktywna" : ""}`}>

                  {s.zdjecie && (
                    <div className="lista-row__thumb">
                      <img
                        src={`${MEDIA}${s.zdjecie}`}
                        alt={s.tytul}
                        className="lista-row__thumb-img"
                      />
                    </div>
                  )}

                  <div className="lista-row__content">
                    <div className="lista-row__top">
                      <span className="lista-row__kolejnosc">#{s.kolejnosc}</span>
                      <span className="lista-row__tytul">{s.tytul}</span>
                      <div className="lista-row__badges">
                        {s.aktywne
                          ? <span className="badge badge--green">Aktywna</span>
                          : <span className="badge badge--gray">Nieaktywna</span>
                        }
                        {s.zdjecie && <span className="badge badge--olive">📷 Ze zdjęciem</span>}
                      </div>
                    </div>
                    <p className="lista-row__tresc">{s.tresc}</p>
                  </div>

                  <div className="lista-row__actions">
                    <button
                      className="btn-edit"
                      onClick={() => { setEdytowana(s); setWidok("edytuj"); }}
                    >
                      Edytuj
                    </button>
                    <button className="btn-delete" onClick={() => setUsuwana(s)}>
                      Usuń
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {usuwana && (
        <div className="modal-overlay" onClick={() => setUsuwana(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal__title">Usuń sekcję</h3>
            <p className="modal__text">
              Czy na pewno chcesz usunąć sekcję <strong>„{usuwana.tytul}"</strong>?
              Tej operacji nie można cofnąć.
            </p>
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
    flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem;
    padding-bottom: 1.5rem; border-bottom: 1px solid var(--border);
  }
  .page-label {
    font-family: 'DM Sans', sans-serif; font-size: .62rem; font-weight: 300;
    letter-spacing: .3em; text-transform: uppercase; color: var(--amber); margin-bottom: .35rem;
  }
  .page-title {
    font-family: 'Cormorant Garamond', serif; font-size: 2rem; font-weight: 300; color: var(--olive-dark);
  }
  .page-desc {
    font-family: 'DM Sans', sans-serif; font-size: .8rem; font-weight: 300;
    color: var(--olive-light); line-height: 1.6; margin-bottom: 1.75rem;
  }

  /* LISTA */
  .lista { display: flex; flex-direction: column; gap: .75rem; }
  .lista-row {
    background: var(--white); border: 1px solid var(--border); border-radius: 2px;
    padding: 1.25rem 1.5rem;
    display: flex; align-items: flex-start; gap: 1.25rem;
    transition: border-color .2s;
  }
  .lista-row:hover { border-color: rgba(74,82,64,.25); }
  .lista-row--nieaktywna { opacity: .55; }

  .lista-row__thumb {
    flex-shrink: 0; width: 80px; height: 80px; border-radius: 2px; overflow: hidden;
    background: var(--cream-dark);
  }
  .lista-row__thumb-img { width: 100%; height: 100%; object-fit: cover; display: block; }

  .lista-row__content { flex: 1; min-width: 0; }
  .lista-row__top {
    display: flex; align-items: center; gap: .6rem; flex-wrap: wrap; margin-bottom: .4rem;
  }
  .lista-row__kolejnosc {
    font-family: 'DM Sans', sans-serif; font-size: .68rem; font-weight: 300;
    color: var(--olive-light); background: var(--cream-dark);
    padding: .15rem .45rem; border-radius: 1px; flex-shrink: 0;
  }
  .lista-row__tytul {
    font-family: 'Cormorant Garamond', serif; font-size: 1.15rem; font-weight: 400; color: var(--olive-dark);
  }
  .lista-row__badges { display: flex; gap: .4rem; flex-wrap: wrap; }
  .lista-row__tresc {
    font-family: 'DM Sans', sans-serif; font-size: .8rem; font-weight: 300;
    line-height: 1.6; color: var(--olive);
    display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .lista-row__actions {
    display: flex; flex-direction: column; gap: .5rem; flex-shrink: 0; align-items: stretch;
    min-width: 70px;
  }

  /* BADGE */
  .badge {
    font-family: 'DM Sans', sans-serif; font-size: .6rem; font-weight: 400;
    letter-spacing: .1em; text-transform: uppercase; padding: .2rem .6rem; border-radius: 1px;
  }
  .badge--green { background: rgba(74,130,74,.1); color: #4a824a; border: 1px solid rgba(74,130,74,.2); }
  .badge--gray  { background: rgba(74,82,64,.08); color: var(--olive-light); border: 1px solid var(--border); }
  .badge--olive { background: rgba(74,82,64,.08); color: var(--olive); border: 1px solid var(--border); }

  /* ZDJĘCIE UPLOAD */
  .zdjecie-wrap { display: flex; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
  .zdjecie-preview {
    position: relative; width: 120px; height: 90px;
    border-radius: 2px; overflow: hidden; flex-shrink: 0;
    border: 1px solid var(--border);
  }
  .zdjecie-img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .zdjecie-remove {
    position: absolute; top: .25rem; right: .25rem;
    width: 20px; height: 20px; border-radius: 50%;
    background: rgba(0,0,0,.65); color: var(--white); border: none;
    font-size: .7rem; cursor: pointer; display: flex; align-items: center; justify-content: center;
  }
  .btn-upload {
    font-family: 'DM Sans', sans-serif; font-size: .72rem; font-weight: 400;
    letter-spacing: .1em; text-transform: uppercase; color: var(--olive);
    background: transparent; border: 1px dashed rgba(74,82,64,.3); border-radius: 1px;
    padding: .6rem 1.1rem; cursor: pointer; transition: all .2s; align-self: center;
  }
  .btn-upload:hover { border-color: var(--amber); color: var(--amber); }

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
    letter-spacing: .15em; text-transform: uppercase; color: var(--olive);
    background: transparent; border: 1px solid var(--border); border-radius: 1px;
    padding: .7rem 1.5rem; cursor: pointer; transition: border-color .2s;
  }
  .btn-secondary:hover { border-color: rgba(74,82,64,.3); }
  .btn-edit {
    font-family: 'DM Sans', sans-serif; font-size: .68rem; font-weight: 400;
    letter-spacing: .1em; text-transform: uppercase; color: var(--olive);
    background: transparent; border: 1px solid var(--border); border-radius: 1px;
    padding: .4rem .9rem; cursor: pointer; transition: all .2s; text-align: center;
  }
  .btn-edit:hover { border-color: var(--olive); }
  .btn-delete {
    font-family: 'DM Sans', sans-serif; font-size: .68rem; font-weight: 400;
    letter-spacing: .1em; text-transform: uppercase; color: #c05050;
    background: transparent; border: 1px solid rgba(180,80,80,.2); border-radius: 1px;
    padding: .4rem .9rem; cursor: pointer; transition: all .2s; text-align: center;
  }
  .btn-delete:hover { background: rgba(180,80,80,.06); border-color: rgba(180,80,80,.4); }
  .btn-danger {
    font-family: 'DM Sans', sans-serif; font-size: .72rem; font-weight: 400;
    letter-spacing: .15em; text-transform: uppercase; color: var(--white); background: #c05050;
    border: none; border-radius: 1px; padding: .7rem 1.5rem; cursor: pointer;
  }
  .btn-danger:hover { background: #a03030; }

  /* FORMULARZ */
  .formularz {
    background: var(--white); border: 1px solid var(--border);
    border-radius: 2px; padding: 2rem; max-width: 720px;
  }
  .formularz__title {
    font-family: 'Cormorant Garamond', serif; font-size: 1.6rem; font-weight: 300;
    color: var(--olive-dark); margin-bottom: 1.75rem;
    padding-bottom: 1rem; border-bottom: 1px solid var(--border);
  }
  .form-row-2 { display: grid; grid-template-columns: 1fr 140px; gap: 1rem; }
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
  .form-textarea { resize: vertical; min-height: 140px; line-height: 1.65; }
  .form-hint {
    font-family: 'DM Sans', sans-serif; font-size: .65rem; font-weight: 300;
    color: var(--olive-light); text-align: right; margin-top: .25rem;
  }
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
    height: 100px; border-radius: 2px;
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
    .lista-row { flex-wrap: wrap; }
    .lista-row__thumb { width: 60px; height: 60px; }
    .lista-row__actions { flex-direction: row; min-width: unset; width: 100%; }
    .panel-topbar { padding: 0 1.25rem; }
  }
`;
