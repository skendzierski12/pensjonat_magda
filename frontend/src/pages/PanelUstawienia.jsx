import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const getHeaders = () => ({
  Authorization: `Token ${localStorage.getItem("token")}`,
});

export default function PanelUstawienia() {
  const navigate = useNavigate();
  const [form,    setForm]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState("");
  const [id,      setId]      = useState(null);

  const pobierz = async () => {
    try {
      const res = await axios.get(`${API}/core/ustawienia/`);
      if (res.data) {
        setId(res.data.id);
        setForm({
          nazwa_pensjonatu: res.data.nazwa_pensjonatu || "",
          opis_hero:        res.data.opis_hero        || "",
          telefon:          res.data.telefon          || "",
          email:            res.data.email            || "",
          adres:            res.data.adres            || "",
          google_maps_url:  res.data.google_maps_url  || "",
          facebook_url:     res.data.facebook_url     || "",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { pobierz(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!form.nazwa_pensjonatu.trim() || !form.telefon.trim() || !form.email.trim()) {
      setError("Nazwa, telefon i e-mail są wymagane."); return;
    }
    setSaving(true); setError("");
    try {
      if (id) {
        await axios.put(`${API}/core/manage/ustawienia/${id}/`, form, { headers: getHeaders() });
      } else {
        // Brak rekordu — utwórz przez Django Admin
        setError("Brak rekordu ustawień. Utwórz go najpierw w Django Admin.");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Błąd zapisu. Sprawdź dane i spróbuj ponownie.");
    } finally {
      setSaving(false);
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
              <h1 className="page-title">Ustawienia strony</h1>
            </div>
            {!loading && form && (
              <div className="save-bar">
                {saved && <span className="save-ok">✓ Zapisano</span>}
                <button className="btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? "Zapisywanie..." : "Zapisz zmiany"}
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="skeleton-form">
              {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton-field" />)}
            </div>
          ) : !form ? (
            <div className="empty-state">
              <span className="empty-state__ikona">⚙️</span>
              <p>Brak ustawień. Utwórz rekord w <a href="http://neil193.mikrus.xyz:8000/admin" target="_blank" rel="noreferrer">Django Admin</a>.</p>
            </div>
          ) : (
            <div className="sekcje">

              {/* PODSTAWOWE */}
              <section className="karta">
                <h2 className="karta__tytul">Dane podstawowe</h2>

                <div className="form-field">
                  <label className="form-label">Nazwa pensjonatu *</label>
                  <input
                    className="form-input"
                    name="nazwa_pensjonatu"
                    value={form.nazwa_pensjonatu}
                    onChange={handleChange}
                    placeholder="np. Pensjonat Magda"
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Opis na stronie głównej (hero)</label>
                  <textarea
                    className="form-input form-textarea"
                    name="opis_hero"
                    value={form.opis_hero}
                    onChange={handleChange}
                    placeholder="Krótki opis widoczny na stronie głównej..."
                    rows={4}
                  />
                  <div className="form-hint">{form.opis_hero.length} znaków</div>
                </div>
              </section>

              {/* KONTAKT */}
              <section className="karta">
                <h2 className="karta__tytul">Dane kontaktowe</h2>

                <div className="form-row-2">
                  <div className="form-field">
                    <label className="form-label">Telefon *</label>
                    <input
                      className="form-input"
                      name="telefon"
                      value={form.telefon}
                      onChange={handleChange}
                      placeholder="+48 123 456 789"
                      type="tel"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">E-mail *</label>
                    <input
                      className="form-input"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="kontakt@pensjonat.pl"
                      type="email"
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label className="form-label">Adres</label>
                  <textarea
                    className="form-input form-textarea form-textarea--sm"
                    name="adres"
                    value={form.adres}
                    onChange={handleChange}
                    placeholder="ul. Górska 1&#10;34-500 Miejscowość"
                    rows={3}
                  />
                </div>
              </section>

              {/* MEDIA SPOŁECZNOŚCIOWE */}
              <section className="karta">
                <h2 className="karta__tytul">Media i mapy</h2>

                <div className="form-field">
                  <label className="form-label">
                    <span className="form-label__ikona">📍</span> Link Google Maps
                  </label>
                  <input
                    className="form-input"
                    name="google_maps_url"
                    value={form.google_maps_url}
                    onChange={handleChange}
                    placeholder="https://maps.google.com/..."
                    type="url"
                  />
                  <div className="form-hint">Wklej link do udostępnionej mapy — pojawi się na stronie Kontakt</div>
                </div>

                <div className="form-field">
                  <label className="form-label">
                    <span className="form-label__ikona">📘</span> Strona Facebook
                  </label>
                  <input
                    className="form-input"
                    name="facebook_url"
                    value={form.facebook_url}
                    onChange={handleChange}
                    placeholder="https://facebook.com/pensjonat..."
                    type="url"
                  />
                </div>

                {/* PODGLĄDY LINKÓW */}
                {(form.google_maps_url || form.facebook_url) && (
                  <div className="linki-podglad">
                    {form.google_maps_url && (
                      <a href={form.google_maps_url} target="_blank" rel="noreferrer" className="link-chip">
                        📍 Sprawdź mapę
                      </a>
                    )}
                    {form.facebook_url && (
                      <a href={form.facebook_url} target="_blank" rel="noreferrer" className="link-chip">
                        📘 Otwórz Facebook
                      </a>
                    )}
                  </div>
                )}
              </section>

              {error && <div className="form-error">{error}</div>}

              <div className="bottom-actions">
                <button className="btn-primary btn-primary--lg" onClick={handleSave} disabled={saving}>
                  {saving ? "Zapisywanie..." : "Zapisz zmiany"}
                </button>
                {saved && <span className="save-ok">✓ Zmiany zostały zapisane</span>}
              </div>

            </div>
          )}
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

  .panel-main { max-width: 820px; margin: 0 auto; padding: 2.5rem 2.5rem 4rem; width: 100%; }

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
  .save-bar { display: flex; align-items: center; gap: 1rem; }
  .save-ok {
    font-family: 'DM Sans', sans-serif; font-size: .78rem; font-weight: 400;
    color: #4a824a;
  }

  /* KARTY SEKCJI */
  .sekcje { display: flex; flex-direction: column; gap: 1.5rem; }
  .karta {
    background: var(--white); border: 1px solid var(--border); border-radius: 2px; padding: 1.75rem 2rem;
  }
  .karta__tytul {
    font-family: 'Cormorant Garamond', serif; font-size: 1.2rem; font-weight: 400;
    color: var(--olive-dark); margin-bottom: 1.5rem;
    padding-bottom: .75rem; border-bottom: 1px solid var(--border);
  }

  /* FORMULARZ */
  .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .form-field { margin-bottom: 1.25rem; }
  .form-field:last-child { margin-bottom: 0; }
  .form-label {
    display: flex; align-items: center; gap: .4rem;
    font-family: 'DM Sans', sans-serif; font-size: .65rem; font-weight: 400;
    letter-spacing: .2em; text-transform: uppercase; color: var(--olive-light); margin-bottom: .4rem;
  }
  .form-label__ikona { font-size: .9rem; }
  .form-input {
    width: 100%; font-family: 'DM Sans', sans-serif; font-size: .88rem; font-weight: 300;
    color: var(--olive-dark); background: var(--cream);
    border: 1px solid var(--border); border-radius: 1px; padding: .65rem .9rem;
    outline: none; transition: border-color .2s;
  }
  .form-input:focus { border-color: var(--amber); background: var(--white); }
  .form-textarea { resize: vertical; min-height: 90px; line-height: 1.65; }
  .form-textarea--sm { min-height: 70px; }
  .form-hint {
    font-family: 'DM Sans', sans-serif; font-size: .65rem; font-weight: 300;
    color: var(--olive-light); margin-top: .3rem;
  }
  .form-error {
    font-family: 'DM Sans', sans-serif; font-size: .78rem; font-weight: 300; color: #c05050;
    padding: .6rem .9rem;
    background: rgba(180,80,80,.07); border-left: 2px solid rgba(180,80,80,.4); border-radius: 1px;
  }

  /* LINKI PODGLĄD */
  .linki-podglad { display: flex; gap: .75rem; flex-wrap: wrap; margin-top: .75rem; }
  .link-chip {
    font-family: 'DM Sans', sans-serif; font-size: .72rem; font-weight: 300;
    color: var(--amber); text-decoration: none;
    border: 1px solid rgba(200,151,58,.3); border-radius: 1px; padding: .3rem .8rem;
    transition: all .2s;
  }
  .link-chip:hover { background: rgba(200,151,58,.07); border-color: var(--amber); }

  /* BOTTOM ACTIONS */
  .bottom-actions {
    display: flex; align-items: center; gap: 1.25rem; flex-wrap: wrap;
    padding-top: .5rem;
  }

  /* BUTTONS */
  .btn-primary {
    font-family: 'DM Sans', sans-serif; font-size: .72rem; font-weight: 400;
    letter-spacing: .15em; text-transform: uppercase;
    color: var(--white); background: var(--amber);
    border: none; border-radius: 1px; padding: .7rem 1.75rem;
    cursor: pointer; transition: background .2s, transform .15s;
  }
  .btn-primary:hover:not(:disabled) { background: var(--amber-light); transform: translateY(-1px); }
  .btn-primary:disabled { opacity: .55; cursor: not-allowed; }
  .btn-primary--lg { padding: .8rem 2.25rem; font-size: .76rem; }

  /* SKELETON */
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }
  .skeleton-form { display: flex; flex-direction: column; gap: 1rem; }
  .skeleton-field {
    height: 56px; border-radius: 2px;
    background: linear-gradient(90deg, #e2ddd6 25%, #ede9e2 50%, #e2ddd6 75%);
    background-size: 800px 100%; animation: shimmer 1.4s infinite;
  }
  .skeleton-field:nth-child(1) { height: 72px; }
  .skeleton-field:nth-child(3) { height: 100px; }

  .empty-state {
    text-align: center; padding: 4rem 2rem;
    font-family: 'DM Sans', sans-serif; font-size: .9rem; font-weight: 300; color: var(--olive-light);
  }
  .empty-state__ikona { font-size: 2.5rem; display: block; margin-bottom: 1rem; }
  .empty-state a { color: var(--amber); text-decoration: none; }
  .empty-state a:hover { text-decoration: underline; }

  @media (max-width: 700px) {
    .form-row-2 { grid-template-columns: 1fr; }
    .panel-main { padding: 1.5rem 1.25rem 3rem; }
    .panel-topbar { padding: 0 1.25rem; }
    .karta { padding: 1.25rem; }
    .page-header { flex-direction: column; }
    .save-bar { width: 100%; }
  }
`;
