import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API = "http://localhost:8000/api";

// ─── HOOK: Intersection Observer do animacji wejścia ───
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

// ─── SEKCJA HERO ───
function HeroSection() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  return (
    <section className="snap-section hero-section">
      <div className="hero-bg" />
      <div className="hero-overlay" />
      <div className={`hero-content ${loaded ? "hero-content--in" : ""}`}>
        <p className="eyebrow">Pokoje · Apartamenty · Noclegi</p>
        <h1 className="hero-title">
          Twoje miejsce<br />
          <em>w górach</em>
        </h1>
        <p className="hero-sub">
          Przytulne pokoje z widokiem na góry, drewniane wykończenia
          i cisza, której szukasz — to nasz standard.
        </p>
        <div className="hero-btns">
          <a href="#pokoje" className="btn-primary">Zobacz pokoje</a>
          <a href="/cennik" className="btn-ghost">Cennik</a>
        </div>
      </div>
      <div className="scroll-hint">
        <div className="scroll-line" />
        <span>Przewiń</span>
      </div>
    </section>
  );
}

// ─── SEKCJA TYPY POKOI ───
function PokojeSections() {
  const [ref, visible] = useReveal();
  const [typy, setTypy] = useState([]);
  const [udogodnienia, setUdogodnienia] = useState([]);
  const [aktywny, setAktywny] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/oferta/typy-pokoi/`),
      axios.get(`${API}/oferta/udogodnienia/`),
    ])
      .then(([rTypy, rUdo]) => {
        const data = rTypy.data;
        setTypy(data);
        setAktywny(data[0]?.id ?? null);
        setUdogodnienia(rUdo.data);
      })
      .catch(() => {
        const demoTypy = [
          {
            id: 1, nazwa: "Pokój Dwuosobowy", opis: "Przytulny pokój z widokiem na dolinę. Własna łazienka, balkon z leżakami i widokiem na góry. Idealne miejsce dla par szukających spokoju.",
            liczba_osob: 2, powierzchnia: "22.00", aktywny: true,
            zdjecia: [], pokoje: [{ id: 1 }, { id: 2 }],
          },
          {
            id: 2, nazwa: "Apartament Rodzinny", opis: "Przestronny apartament dla 4 osób — dwa osobne pokoje, aneks kuchenny i taras z panoramą Tatr. Doskonały wybór dla rodzin z dziećmi.",
            liczba_osob: 4, powierzchnia: "48.00", aktywny: true,
            zdjecia: [], pokoje: [{ id: 3 }],
          },
          {
            id: 3, nazwa: "Pokój Górski", opis: "Panoramiczny widok na Tatry, kominek na wieczory, drewniane wykończenia premium. Nasz flagowy pokój z najlepszą ekspozycją.",
            liczba_osob: 2, powierzchnia: "30.00", aktywny: true,
            zdjecia: [], pokoje: [{ id: 4 }, { id: 5 }],
          },
          {
            id: 4, nazwa: "Pokój Trzyosobowy", opis: "Ekonomiczny wybór dla grupy znajomych lub rodziny z dzieckiem. Trzy osobne łóżka, wspólna łazienka i dostęp do tarasu.",
            liczba_osob: 3, powierzchnia: "28.00", aktywny: true,
            zdjecia: [], pokoje: [{ id: 6 }],
          },
        ];
        const demoUdo = [
          { id: 1, nazwa: "Wi-Fi", ikona: "fa-wifi" },
          { id: 2, nazwa: "Balkon", ikona: "fa-building" },
          { id: 3, nazwa: "Łazienka", ikona: "fa-bath" },
          { id: 4, nazwa: "TV", ikona: "fa-tv" },
          { id: 5, nazwa: "Klimatyzacja", ikona: "fa-snowflake" },
          { id: 6, nazwa: "Kominek", ikona: "fa-fire" },
        ];
        setTypy(demoTypy);
        setAktywny(demoTypy[0].id);
        setUdogodnienia(demoUdo);
      })
      .finally(() => setLoading(false));
  }, []);

  const ikonaUdo = (ikona) => {
    const mapa = {
      "fa-wifi": "📶", "fa-bath": "🛁", "fa-tv": "📺",
      "fa-snowflake": "❄️", "fa-fire": "🔥", "fa-building": "🏢",
      "fa-parking": "🅿️", "fa-utensils": "🍴", "fa-mountain": "⛰️",
    };
    return mapa[ikona] || "✓";
  };

  const aktywnyTyp = typy.find(t => t.id === aktywny);

  return (
    <section className="snap-section pokoje-section" id="pokoje" ref={ref}>
      <div className={`section-inner ${visible ? "reveal-in" : ""}`}>
        <div className="section-header">
          <div className="section-label">Noclegi</div>
          <h2 className="section-title">Nasze<br /><em>pokoje</em></h2>
          <p className="section-desc">
            Każdy pokój to osobna historia — drewno, kamień i góry za oknem.
            Wybierz swoje miejsce odpoczynku.
          </p>
        </div>

        {loading ? (
          <div className="pokoje-skeleton">
            {[1,2,3,4].map(i => <div key={i} className="skeleton-tab" />)}
            <div className="skeleton-detail" />
          </div>
        ) : (
          <div className="pokoje-explorer">
            {/* Tabs */}
            <div className="pokoje-tabs">
              {typy.map((t, i) => (
                <button
                  key={t.id}
                  className={`pokoj-tab ${aktywny === t.id ? "pokoj-tab--active" : ""}`}
                  onClick={() => setAktywny(t.id)}
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <span className="pokoj-tab__num">0{i + 1}</span>
                  <span className="pokoj-tab__name">{t.nazwa}</span>
                  <span className="pokoj-tab__guests">
                    {"👤".repeat(Math.min(t.liczba_osob, 4))}
                  </span>
                </button>
              ))}
            </div>

            {/* Detail */}
            {aktywnyTyp && (
              <div className="pokoj-detail" key={aktywnyTyp.id}>
                <div className="pokoj-detail__img-wrap">
                  {aktywnyTyp.zdjecia && aktywnyTyp.zdjecia.length > 0 ? (
                    <img
                      src={aktywnyTyp.zdjecia[0].zdjecie}
                      alt={aktywnyTyp.nazwa}
                      className="pokoj-detail__img"
                    />
                  ) : (
                    <div className="pokoj-detail__img-placeholder">
                      <span>🏔️</span>
                    </div>
                  )}
                  <div className="pokoj-detail__badge">
                    {aktywnyTyp.liczba_osob === 1
                      ? "1 osoba"
                      : aktywnyTyp.liczba_osob <= 4
                      ? `do ${aktywnyTyp.liczba_osob} osób`
                      : `${aktywnyTyp.liczba_osob} osób`}
                  </div>
                </div>

                <div className="pokoj-detail__body">
                  <h3 className="pokoj-detail__name">{aktywnyTyp.nazwa}</h3>

                  <div className="pokoj-detail__meta">
                    {aktywnyTyp.powierzchnia && (
                      <span className="pokoj-meta-chip">
                        <span className="chip-icon">📐</span>
                        {parseFloat(aktywnyTyp.powierzchnia).toFixed(0)} m²
                      </span>
                    )}
                    <span className="pokoj-meta-chip">
                      <span className="chip-icon">👤</span>
                      {aktywnyTyp.liczba_osob}{" "}
                      {aktywnyTyp.liczba_osob === 1 ? "osoba" : "osoby"}
                    </span>
                    {aktywnyTyp.pokoje && (
                      <span className="pokoj-meta-chip">
                        <span className="chip-icon">🚪</span>
                        {aktywnyTyp.pokoje.length}{" "}
                        {aktywnyTyp.pokoje.length === 1 ? "pokój" : "pokoje"}
                      </span>
                    )}
                  </div>

                  <p className="pokoj-detail__opis">{aktywnyTyp.opis}</p>

                  {udogodnienia.length > 0 && (
                    <div className="pokoj-udogodnienia">
                      <p className="pokoj-udogodnienia__label">Udogodnienia</p>
                      <div className="udogodnienia-grid">
                        {udogodnienia.slice(0, 8).map(u => (
                          <span key={u.id} className="udo-chip">
                            <span>{ikonaUdo(u.ikona)}</span>
                            {u.nazwa}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pokoj-detail__actions">
                    <a href="/kontakt" className="btn-primary btn-primary--sm">
                      Zapytaj o termin
                    </a>
                    <a href="/cennik" className="btn-ghost btn-ghost--sm">
                      Zobacz ceny
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── SEKCJA IMPREZY OKOLICZNOŚCIOWE ───
function ImprezaSection() {
  const [ref, visible] = useReveal();
  const [imprezy, setImprezy] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/oferta/imprezy/`)
      .then(r => setImprezy(r.data))
      .catch(() => setImprezy([
        { id: 1, nazwa: "Wesele", opis: "Organizujemy wesela do 80 osób w klimatycznej sali z widokiem na góry. Własna kuchnia, nocleg dla gości, dekoracje.", cena_od: "4500.00", zdjecie: null },
        { id: 2, nazwa: "Urodziny i imieniny", opis: "Niezapomniane przyjęcie urodzinowe w górskim otoczeniu. Możliwość rezerwacji całego obiektu dla grupy.", cena_od: "800.00", zdjecie: null },
        { id: 3, nazwa: "Integracja firmowa", opis: "Team building, szkolenia wyjazdowe i wyjazdy integracyjne. Sala konferencyjna, catering, atrakcje turystyczne.", cena_od: "150.00", zdjecie: null },
      ]))
      .finally(() => setLoading(false));
  }, []);

  const ikonyImpreza = ["💒", "🎂", "🏢", "🎉", "🍾", "🎊"];

  return (
    <section className="snap-section imprezy-section" ref={ref}>
      <div className={`section-inner ${visible ? "reveal-in" : ""}`}>
        <div className="imprezy-layout">
          <div className="imprezy-header">
            <div className="section-label">Eventy</div>
            <h2 className="section-title section-title--light">
              Imprezy<br /><em>okolicznościowe</em>
            </h2>
            <p className="section-desc" style={{ color: "rgba(255,255,255,.55)" }}>
              Wesela, urodziny, integracje firmowe — organizujemy
              każde wydarzenie w pięknym górskim otoczeniu.
            </p>
            <a href="/kontakt" className="btn-primary btn-primary--sm" style={{ marginTop: "1.5rem", display: "inline-block" }}>
              Zapytaj o wycenę
            </a>
          </div>

          <div className="imprezy-cards">
            {loading ? (
              [1,2,3].map(i => <div key={i} className="skeleton-card" />)
            ) : (
              imprezy.map((imp, i) => (
                <div key={imp.id} className="impreza-card" style={{ animationDelay: `${i * 0.12}s` }}>
                  <div className="impreza-card__icon">{ikonyImpreza[i % ikonyImpreza.length]}</div>
                  <div className="impreza-card__body">
                    <h3 className="impreza-card__name">{imp.nazwa}</h3>
                    <p className="impreza-card__opis">{imp.opis}</p>
                    {imp.cena_od && (
                      <div className="impreza-card__cena">
                        od <strong>{parseFloat(imp.cena_od).toFixed(0)} zł</strong>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── SEKCJA CTA ───
function CTASection() {
  const [ref, visible] = useReveal();
  return (
    <section className="cta-section" ref={ref}>
      <div className={`section-inner cta-inner ${visible ? "reveal-in" : ""}`}>
        <p className="eyebrow eyebrow--amber">Rezerwacje</p>
        <h2 className="section-title section-title--light">
          Gotowy na<br /><em>górski wypoczynek?</em>
        </h2>
        <p className="cta-sub">
          Skontaktuj się z nami — dobierzemy pokój idealny dla Ciebie
          i sprawdzimy dostępność w wybranym terminie.
        </p>
        <div className="hero-btns" style={{ marginTop: "2.5rem" }}>
          <a href="/kontakt" className="btn-primary">Napisz do nas</a>
          <a href="tel:+48748369928" className="btn-ghost">+48 74 836 99 28</a>
        </div>
      </div>
    </section>
  );
}

// ─── MAIN OFERTA ───
export default function Oferta() {
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

        html { scroll-snap-type: y proximity; overflow-y: scroll; height: 100%; }
        body { height: 100%; font-family: 'DM Sans', sans-serif; }

        /* ══ SNAP SECTIONS ══ */
        .snap-section {
          scroll-snap-align: start;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .section-inner {
          width: 100%;
          max-width: 1200px;
          padding: 5rem 2.5rem;
          margin: 0 auto;
          opacity: 0;
          transform: translateY(32px);
          transition: opacity .7s ease, transform .7s cubic-bezier(.4,0,.2,1);
        }
        .section-inner.reveal-in { opacity: 1; transform: translateY(0); }

        /* ══ TYPOGRAPHY ══ */
        .section-label {
          font-family: 'DM Sans', sans-serif;
          font-size: .68rem; font-weight: 300;
          letter-spacing: .3em; text-transform: uppercase;
          color: var(--amber); margin-bottom: .75rem;
        }
        .section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.4rem, 5vw, 3.8rem);
          font-weight: 300; line-height: 1.1;
          color: var(--olive-dark); margin-bottom: 1.25rem;
        }
        .section-title em { font-style: italic; color: var(--olive); }
        .section-title--light { color: var(--white); }
        .section-title--light em { color: var(--amber-light); }
        .section-desc {
          font-family: 'DM Sans', sans-serif;
          font-size: .92rem; font-weight: 300; line-height: 1.75;
          color: var(--olive-light); max-width: 42ch;
        }
        .eyebrow {
          font-family: 'DM Sans', sans-serif;
          font-size: .68rem; font-weight: 300;
          letter-spacing: .3em; text-transform: uppercase;
          color: var(--amber); margin-bottom: .75rem;
        }
        .eyebrow--amber { color: var(--amber-light); }

        /* ══ BUTTONS ══ */
        .btn-primary {
          display: inline-flex; align-items: center; gap: .5rem;
          font-family: 'DM Sans', sans-serif;
          font-size: .78rem; font-weight: 400; letter-spacing: .15em;
          text-transform: uppercase; text-decoration: none;
          padding: .85rem 2.25rem;
          background: var(--amber); color: var(--white);
          border: none; border-radius: 1px; cursor: pointer;
          transition: background .25s, transform .2s;
        }
        .btn-primary:hover { background: var(--amber-light); transform: translateY(-1px); }
        .btn-primary--sm { padding: .65rem 1.6rem; font-size: .72rem; }

        .btn-ghost {
          display: inline-flex; align-items: center;
          font-family: 'DM Sans', sans-serif;
          font-size: .78rem; font-weight: 400; letter-spacing: .15em;
          text-transform: uppercase; text-decoration: none;
          padding: .85rem 2.25rem;
          background: transparent; color: var(--white);
          border: 1px solid rgba(255,255,255,.3); border-radius: 1px; cursor: pointer;
          transition: border-color .25s, color .25s, transform .2s;
        }
        .btn-ghost:hover { border-color: var(--white); transform: translateY(-1px); }
        .btn-ghost--sm { padding: .65rem 1.6rem; font-size: .72rem; }

        /* ══ SKELETONS ══ */
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .skeleton-card, .skeleton-tab, .skeleton-detail {
          background: linear-gradient(90deg, #e2ddd6 25%, #ede9e2 50%, #e2ddd6 75%);
          background-size: 800px 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 2px;
        }
        .skeleton-tab { height: 72px; }
        .skeleton-detail { height: 420px; margin-top: 1rem; }
        .pokoje-skeleton { display: flex; flex-direction: column; gap: .75rem; }

        /* ══════════════════════════════
           1. HERO
        ══════════════════════════════ */
        .hero-section { background: var(--olive-deep); }

        .hero-bg {
          position: absolute; inset: 0;
          background:
            linear-gradient(160deg, rgba(26,29,21,.55) 0%, rgba(46,51,40,.8) 100%),
            url('/home_background.png') center/cover no-repeat;
        }
        .hero-overlay {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 30% 60%, rgba(200,151,58,.08) 0%, transparent 70%);
        }

        .hero-content {
          position: relative; z-index: 2;
          text-align: center; max-width: 700px;
          padding: 2rem 1.5rem;
          opacity: 0; transform: translateY(28px);
          transition: opacity .9s ease, transform .9s cubic-bezier(.4,0,.2,1);
        }
        .hero-content--in { opacity: 1; transform: translateY(0); }

        .hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(3rem, 8vw, 6rem);
          font-weight: 300; line-height: 1.05;
          color: var(--white); margin-bottom: 1.5rem; margin-top: .5rem;
        }
        .hero-title em { font-style: italic; color: var(--amber-light); }

        .hero-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: .95rem; font-weight: 300; line-height: 1.7;
          color: rgba(255,255,255,.6); max-width: 50ch;
          margin: 0 auto 2.5rem;
        }
        .hero-btns { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }

        .scroll-hint {
          position: absolute; bottom: 2.5rem; left: 50%;
          transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center;
          gap: .5rem; color: rgba(255,255,255,.35);
          font-family: 'DM Sans', sans-serif;
          font-size: .6rem; letter-spacing: .25em; text-transform: uppercase;
        }
        .scroll-line {
          width: 1px; height: 40px;
          background: linear-gradient(to bottom, rgba(255,255,255,.5), transparent);
          animation: scrollPulse 2s ease-in-out infinite;
        }
        @keyframes scrollPulse {
          0%, 100% { opacity: .4; } 50% { opacity: 1; }
        }

        /* ══════════════════════════════
           2. POKOJE EXPLORER
        ══════════════════════════════ */
        .pokoje-section { background: var(--cream); }

        .section-header {
          margin-bottom: 3rem;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .pokoje-explorer {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 2.5rem;
          align-items: start;
        }

        /* Tabs */
        .pokoje-tabs {
          display: flex; flex-direction: column; gap: .5rem;
        }
        .pokoj-tab {
          display: flex; align-items: center; gap: 1rem;
          padding: 1.1rem 1.25rem;
          background: transparent;
          border: 1px solid rgba(74,82,64,.12);
          border-radius: 2px; cursor: pointer;
          text-align: left;
          transition: background .2s, border-color .2s, transform .2s;
          animation: cardIn .4s ease both;
        }
        .pokoj-tab:hover { background: rgba(74,82,64,.05); transform: translateX(3px); }
        .pokoj-tab--active {
          background: var(--olive);
          border-color: var(--olive);
        }
        .pokoj-tab__num {
          font-family: 'Cormorant Garamond', serif;
          font-size: .85rem; font-weight: 300;
          color: var(--olive-light); min-width: 22px;
          transition: color .2s;
        }
        .pokoj-tab--active .pokoj-tab__num { color: rgba(255,255,255,.45); }
        .pokoj-tab__name {
          font-family: 'DM Sans', sans-serif;
          font-size: .82rem; font-weight: 400;
          color: var(--olive-dark); flex: 1;
          transition: color .2s;
        }
        .pokoj-tab--active .pokoj-tab__name { color: var(--white); }
        .pokoj-tab__guests {
          font-size: .72rem;
          filter: grayscale(0);
        }

        /* Detail */
        .pokoj-detail {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2.5rem;
          align-items: start;
          animation: cardIn .45s ease;
        }

        .pokoj-detail__img-wrap {
          position: relative; border-radius: 2px; overflow: hidden;
          aspect-ratio: 4/3;
          background: var(--cream-dark);
        }
        .pokoj-detail__img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform .4s ease;
        }
        .pokoj-detail__img-wrap:hover .pokoj-detail__img { transform: scale(1.03); }

        .pokoj-detail__img-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          font-size: 3.5rem;
          background: linear-gradient(135deg, var(--cream-dark), var(--cream));
          color: var(--olive-light);
        }

        .pokoj-detail__badge {
          position: absolute; top: 1rem; right: 1rem;
          background: var(--olive-deep);
          color: var(--amber);
          font-family: 'DM Sans', sans-serif;
          font-size: .65rem; letter-spacing: .15em; text-transform: uppercase;
          padding: .4rem .85rem;
          border-radius: 1px;
        }

        .pokoj-detail__body { display: flex; flex-direction: column; gap: 1.25rem; }

        .pokoj-detail__name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2rem; font-weight: 300;
          color: var(--olive-dark); line-height: 1.2;
        }

        .pokoj-detail__meta {
          display: flex; flex-wrap: wrap; gap: .6rem;
        }
        .pokoj-meta-chip {
          display: inline-flex; align-items: center; gap: .4rem;
          font-family: 'DM Sans', sans-serif;
          font-size: .72rem; font-weight: 400;
          color: var(--olive-light);
          background: rgba(74,82,64,.08);
          padding: .35rem .85rem; border-radius: 1px;
          border: 1px solid rgba(74,82,64,.1);
        }
        .chip-icon { font-size: .8rem; }

        .pokoj-detail__opis {
          font-family: 'DM Sans', sans-serif;
          font-size: .9rem; font-weight: 300; line-height: 1.75;
          color: var(--olive-light);
        }

        .pokoj-udogodnienia__label {
          font-family: 'DM Sans', sans-serif;
          font-size: .65rem; letter-spacing: .2em; text-transform: uppercase;
          color: var(--olive-light); margin-bottom: .75rem;
        }
        .udogodnienia-grid {
          display: flex; flex-wrap: wrap; gap: .5rem;
        }
        .udo-chip {
          display: inline-flex; align-items: center; gap: .4rem;
          font-family: 'DM Sans', sans-serif;
          font-size: .75rem; font-weight: 300;
          color: var(--olive);
          border: 1px solid rgba(74,82,64,.18);
          padding: .3rem .8rem; border-radius: 1px;
          transition: background .2s, border-color .2s;
        }
        .udo-chip:hover { background: rgba(74,82,64,.07); border-color: rgba(74,82,64,.3); }

        .pokoj-detail__actions {
          display: flex; gap: 1rem; flex-wrap: wrap; margin-top: .5rem;
        }
        .pokoj-detail__actions .btn-primary { background: var(--olive); }
        .pokoj-detail__actions .btn-primary:hover { background: var(--olive-dark); }
        .pokoj-detail__actions .btn-ghost {
          color: var(--olive-dark);
          border-color: rgba(74,82,64,.3);
        }
        .pokoj-detail__actions .btn-ghost:hover {
          border-color: var(--olive); color: var(--olive);
        }

        /* ══════════════════════════════
           3. IMPREZY
        ══════════════════════════════ */
        .imprezy-section { background: var(--olive-dark); }

        .imprezy-layout {
          display: grid;
          grid-template-columns: 1fr 1.6fr;
          gap: 5rem;
          align-items: center;
        }

        .imprezy-cards {
          display: flex; flex-direction: column; gap: 1rem;
        }

        .impreza-card {
          display: flex; gap: 1.25rem; align-items: flex-start;
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 2px;
          padding: 1.75rem;
          animation: cardIn .5s ease both;
          transition: background .25s, transform .25s, border-color .25s;
        }
        .impreza-card:hover {
          background: rgba(255,255,255,.08);
          border-color: rgba(200,151,58,.2);
          transform: translateX(4px);
        }

        .impreza-card__icon {
          font-size: 2rem; line-height: 1;
          flex-shrink: 0; margin-top: .1rem;
        }

        .impreza-card__body { display: flex; flex-direction: column; gap: .5rem; }

        .impreza-card__name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.35rem; font-weight: 400;
          color: var(--white); line-height: 1.2;
        }

        .impreza-card__opis {
          font-family: 'DM Sans', sans-serif;
          font-size: .82rem; font-weight: 300; line-height: 1.65;
          color: rgba(255,255,255,.45);
        }

        .impreza-card__cena {
          font-family: 'DM Sans', sans-serif;
          font-size: .75rem; font-weight: 300;
          color: rgba(255,255,255,.4);
          margin-top: .25rem;
        }
        .impreza-card__cena strong {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.05rem; font-weight: 400;
          color: var(--amber);
        }

        /* ══════════════════════════════
           4. CTA
        ══════════════════════════════ */
        .cta-section {
          background: var(--olive-deep);
          min-height: 60vh;
          display: flex; align-items: center; justify-content: center;
          scroll-snap-align: start;
        }
        .cta-inner { text-align: center; }
        .cta-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: .92rem; font-weight: 300; line-height: 1.75;
          color: rgba(255,255,255,.45);
          max-width: 45ch; margin: 0 auto;
        }

        /* ══ RESPONSIVE ══ */
        @media (max-width: 1000px) {
          .pokoje-explorer {
            grid-template-columns: 1fr;
          }
          .pokoje-tabs {
            flex-direction: row; flex-wrap: wrap;
          }
          .pokoj-tab { flex: 1 1 calc(50% - .5rem); }
          .pokoj-detail { grid-template-columns: 1fr; }
        }

        @media (max-width: 800px) {
          .imprezy-layout { grid-template-columns: 1fr; gap: 2.5rem; }
          .section-inner { padding: 4rem 1.5rem; }
        }

        @media (max-width: 540px) {
          .hero-btns { flex-direction: column; align-items: center; }
          .pokoj-tab { flex: 1 1 100%; }
          .pokoj-detail__actions { flex-direction: column; }
        }
      `}</style>

      <HeroSection />
      <PokojeSections />
      <ImprezaSection />
      <CTASection />
    </>
  );
}
