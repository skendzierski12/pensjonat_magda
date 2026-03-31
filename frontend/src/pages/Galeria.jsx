import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

// ─── HOOK: Intersection Observer ───
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

// ─── HELPERS ───
const SEKCJA_IKONA = {
  pokoje:      "🛏️",
  podworze:    "🌿",
  pensjonat:   "🏠",
  okolice:     "⛰️",
  restauracja: "🍽️",
};

const SEKCJA_LABEL = {
  pokoje:      "Pokoje",
  podworze:    "Podwórze",
  pensjonat:   "Pensjonat",
  okolice:     "Okolice",
  restauracja: "Restauracja",
};

// ─── DEMO ZDJECIA (placeholder) ───
// Generujemy demo z gradientami — zastąpione przez prawdziwe zdjęcia z API
const DEMO_KOLORY = [
  "#4a5240","#2e3328","#6b7560","#c8973a","#3d4535",
  "#5a6350","#8a9280","#b8a878","#7a8870","#4e5845",
];

function DemoImg({ idx, sekcja }) {
  const kolor = DEMO_KOLORY[idx % DEMO_KOLORY.length];
  const ikona = SEKCJA_IKONA[sekcja] || "📷";
  return (
    <div style={{
      width: "100%", height: "100%",
      background: `linear-gradient(135deg, ${kolor}dd, ${kolor}88)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "2.5rem", color: "rgba(255,255,255,.4)",
    }}>
      {ikona}
    </div>
  );
}

// Generujemy demo zdjecia z różnymi proporcjami
const DEMO_SEKCJE = [
  { id: 1, nazwa: "pokoje",      opis: "Wnętrza naszych pokoi i apartamentów", kolejnosc: 1, aktywna: true },
  { id: 2, nazwa: "restauracja", opis: "Sala restauracyjna i nasze potrawy",    kolejnosc: 2, aktywna: true },
  { id: 3, nazwa: "okolice",     opis: "Piękne krajobrazy w okolicy",           kolejnosc: 3, aktywna: true },
  { id: 4, nazwa: "pensjonat",   opis: "Budynek i teren pensjonatu",            kolejnosc: 4, aktywna: true },
  { id: 5, nazwa: "podworze",    opis: "Nasze podwórze i ogród",               kolejnosc: 5, aktywna: true },
];

function genDemoZdjecia() {
  const all = [];
  let id = 1;
  DEMO_SEKCJE.forEach(s => {
    for (let i = 0; i < 8; i++) {
      all.push({
        id: id++,
        sekcja: s.id,
        sekcja_nazwa: s.nazwa,
        zdjecie: null,
        tytul: `${SEKCJA_LABEL[s.nazwa]} ${i + 1}`,
        opis: "",
        kolejnosc: i,
        aktywne: true,
        wyroznienie: i === 0,
      });
    }
  });
  return all;
}

// ─── LIGHTBOX ───
function Lightbox({ zdjecia, aktywnyIdx, onClose, onPrev, onNext }) {
  const z = zdjecia[aktywnyIdx];
  if (!z) return null;

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onPrev, onNext]);

  return (
    <div className="lightbox" onClick={onClose}>
      <button className="lightbox__close" onClick={onClose}>✕</button>

      <button
        className="lightbox__nav lightbox__nav--prev"
        onClick={e => { e.stopPropagation(); onPrev(); }}
        disabled={aktywnyIdx === 0}
      >
        ‹
      </button>

      <div className="lightbox__content" onClick={e => e.stopPropagation()}>
        <div className="lightbox__img-wrap">
          {z.zdjecie ? (
            <img
              src={z.zdjecie}
              alt={z.tytul}
              className="lightbox__img"
            />
          ) : (
            <div className="lightbox__demo-img">
              <DemoImg idx={z.id} sekcja={z.sekcja_nazwa} />
            </div>
          )}
        </div>
        {(z.tytul || z.opis) && (
          <div className="lightbox__caption">
            {z.tytul && <span className="lightbox__tytul">{z.tytul}</span>}
            {z.opis  && <span className="lightbox__opis">{z.opis}</span>}
            <span className="lightbox__counter">
              {aktywnyIdx + 1} / {zdjecia.length}
            </span>
          </div>
        )}
      </div>

      <button
        className="lightbox__nav lightbox__nav--next"
        onClick={e => { e.stopPropagation(); onNext(); }}
        disabled={aktywnyIdx === zdjecia.length - 1}
      >
        ›
      </button>
    </div>
  );
}

// ─── HERO ───
function HeroSection() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  return (
    <section className="snap-section hero-section">
      <div className="hero-bg" />
      <div className="hero-overlay" />
      <div className={`hero-content ${loaded ? "hero-content--in" : ""}`}>
        <p className="eyebrow">Pokoje · Okolice · Wnętrza</p>
        <h1 className="hero-title">
          Galeria<br />
          <em>pensjonatu</em>
        </h1>
        <p className="hero-sub">
          Zajrzyj do środka — nasze pokoje, restauracja,
          górskie krajobrazy i wszystko co sprawia, że tu chce się wracać.
        </p>
        <div className="hero-btns">
          <a href="#galeria" className="btn-primary">Przeglądaj zdjęcia</a>
          <a href="/oferta" className="btn-ghost">Zobacz pokoje</a>
        </div>
      </div>
      <div className="scroll-hint">
        <div className="scroll-line" />
        <span>Przewiń</span>
      </div>
    </section>
  );
}

// ─── GRID GALERIA ───
function GaleriaSection() {
  const [ref, visible] = useReveal();
  const [sekcje, setSekcje] = useState([]);
  const [zdjecia, setZdjecia] = useState([]);
  const [aktywnaSekcja, setAktywnaSekcja] = useState("wszystkie");
  const [loading, setLoading] = useState(true);
  const [lightboxIdx, setLightboxIdx] = useState(null);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/galeria/sekcje/`),
      axios.get(`${API}/galeria/zdjecia/`),
    ])
      .then(([rSekcje, rZdjecia]) => {
        setSekcje(rSekcje.data);
        // Mapujemy sekcja_nazwa z relacji
        const zdj = rZdjecia.data.map(z => ({
          ...z,
          sekcja_nazwa: rSekcje.data.find(s => s.id === z.sekcja)?.nazwa || "",
        }));
        setZdjecia(zdj);
      })
      .catch(() => {
        setSekcje(DEMO_SEKCJE);
        setZdjecia(genDemoZdjecia());
      })
      .finally(() => setLoading(false));
  }, []);

  const widoczne = aktywnaSekcja === "wszystkie"
    ? zdjecia
    : zdjecia.filter(z => z.sekcja_nazwa === aktywnaSekcja);

  const openLightbox = useCallback((idx) => {
    setLightboxIdx(idx);
    document.body.style.overflow = "hidden";
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIdx(null);
    document.body.style.overflow = "";
  }, []);

  const prevPhoto = useCallback(() => {
    setLightboxIdx(i => (i > 0 ? i - 1 : i));
  }, []);

  const nextPhoto = useCallback(() => {
    setLightboxIdx(i => (i < widoczne.length - 1 ? i + 1 : i));
  }, [widoczne.length]);

  return (
    <section className="galeria-section" id="galeria" ref={ref}>
      <div className={`section-inner ${visible ? "reveal-in" : ""}`}>

        {/* Filtry */}
        <div className="galeria-filtry">
          <button
            className={`galeria-filtr ${aktywnaSekcja === "wszystkie" ? "galeria-filtr--active" : ""}`}
            onClick={() => setAktywnaSekcja("wszystkie")}
          >
            <span>🖼️</span> Wszystkie
            <span className="filtr-count">{zdjecia.length}</span>
          </button>
          {sekcje.map(s => (
            <button
              key={s.id}
              className={`galeria-filtr ${aktywnaSekcja === s.nazwa ? "galeria-filtr--active" : ""}`}
              onClick={() => setAktywnaSekcja(s.nazwa)}
            >
              <span>{SEKCJA_IKONA[s.nazwa] || "📷"}</span>
              {SEKCJA_LABEL[s.nazwa] || s.nazwa}
              <span className="filtr-count">
                {zdjecia.filter(z => z.sekcja_nazwa === s.nazwa).length}
              </span>
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="galeria-skeleton">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="skeleton-foto"
                style={{ gridRow: i % 5 === 0 ? "span 2" : "span 1" }}
              />
            ))}
          </div>
        ) : widoczne.length === 0 ? (
          <div className="galeria-empty">
            <span>📷</span>
            <p>Brak zdjęć w tej sekcji</p>
          </div>
        ) : (
          <div className="galeria-grid" key={aktywnaSekcja}>
            {widoczne.map((z, i) => (
              <div
                key={z.id}
                className={`foto-item ${z.wyroznienie ? "foto-item--wide" : ""}`}
                onClick={() => openLightbox(i)}
                style={{ animationDelay: `${Math.min(i, 12) * 0.04}s` }}
              >
                {z.zdjecie ? (
                  <img
                    src={z.zdjecie}
                    alt={z.tytul || "Zdjęcie"}
                    className="foto-item__img"
                    loading="lazy"
                  />
                ) : (
                  <DemoImg idx={z.id} sekcja={z.sekcja_nazwa} />
                )}

                <div className="foto-item__overlay">
                  {z.tytul && <span className="foto-item__tytul">{z.tytul}</span>}
                  <span className="foto-item__zoom">⊕</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="galeria-uwaga">
          Kliknij zdjęcie aby powiększyć · Nawigacja strzałkami klawiatury
        </p>
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <Lightbox
          zdjecia={widoczne}
          aktywnyIdx={lightboxIdx}
          onClose={closeLightbox}
          onPrev={prevPhoto}
          onNext={nextPhoto}
        />
      )}
    </section>
  );
}

// ─── MAIN ───
export default function Galeria() {
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

        .snap-section {
          scroll-snap-align: start;
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          position: relative; overflow: hidden;
        }
        .section-inner {
          width: 100%; max-width: 1300px;
          padding: 4rem 2.5rem; margin: 0 auto;
          opacity: 0; transform: translateY(32px);
          transition: opacity .7s ease, transform .7s cubic-bezier(.4,0,.2,1);
        }
        .section-inner.reveal-in { opacity: 1; transform: translateY(0); }

        /* ══ TYPOGRAPHY ══ */
        .eyebrow {
          font-family: 'DM Sans', sans-serif;
          font-size: .68rem; font-weight: 300;
          letter-spacing: .3em; text-transform: uppercase;
          color: var(--amber); margin-bottom: .75rem;
        }
        .section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.4rem, 5vw, 3.8rem);
          font-weight: 300; line-height: 1.1;
          color: var(--white); margin-bottom: 1.25rem;
        }
        .section-title em { font-style: italic; color: var(--amber-light); }

        /* ══ BUTTONS ══ */
        .btn-primary {
          display: inline-flex; align-items: center;
          font-family: 'DM Sans', sans-serif;
          font-size: .78rem; font-weight: 400; letter-spacing: .15em;
          text-transform: uppercase; text-decoration: none;
          padding: .85rem 2.25rem;
          background: var(--amber); color: var(--white);
          border: none; border-radius: 1px; cursor: pointer;
          transition: background .25s, transform .2s;
        }
        .btn-primary:hover { background: var(--amber-light); transform: translateY(-1px); }
        .btn-ghost {
          display: inline-flex; align-items: center;
          font-family: 'DM Sans', sans-serif;
          font-size: .78rem; font-weight: 400; letter-spacing: .15em;
          text-transform: uppercase; text-decoration: none;
          padding: .85rem 2.25rem;
          background: transparent; color: var(--white);
          border: 1px solid rgba(255,255,255,.3); border-radius: 1px; cursor: pointer;
          transition: border-color .25s, transform .2s;
        }
        .btn-ghost:hover { border-color: var(--white); transform: translateY(-1px); }

        /* ══ SKELETONS ══ */
        @keyframes shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        .skeleton-foto {
          background: linear-gradient(90deg, #e2ddd6 25%, #ede9e2 50%, #e2ddd6 75%);
          background-size: 1200px 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 2px;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: scale(.97); }
          to   { opacity: 1; transform: scale(1); }
        }

        /* ══════════════════════════════
           1. HERO
        ══════════════════════════════ */
        .hero-section { background: var(--olive-deep); }
        .hero-bg {
          position: absolute; inset: 0;
          background:
            linear-gradient(160deg, rgba(26,29,21,.5) 0%, rgba(46,51,40,.82) 100%),
            url('/home_background.png') center/cover no-repeat;
        }
        .hero-overlay {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 50% 60%, rgba(200,151,58,.08) 0%, transparent 65%);
        }
        .hero-content {
          position: relative; z-index: 2;
          text-align: center; max-width: 700px; padding: 2rem 1.5rem;
          opacity: 0; transform: translateY(28px);
          transition: opacity .9s ease, transform .9s cubic-bezier(.4,0,.2,1);
        }
        .hero-content--in { opacity: 1; transform: translateY(0); }
        .hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(3rem, 8vw, 6rem);
          font-weight: 300; line-height: 1.05;
          color: var(--white); margin: .5rem 0 1.5rem;
        }
        .hero-title em { font-style: italic; color: var(--amber-light); }
        .hero-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: .95rem; font-weight: 300; line-height: 1.7;
          color: rgba(255,255,255,.6); max-width: 50ch; margin: 0 auto 2.5rem;
        }
        .hero-btns { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
        .scroll-hint {
          position: absolute; bottom: 2.5rem; left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: .5rem;
          color: rgba(255,255,255,.35);
          font-family: 'DM Sans', sans-serif;
          font-size: .6rem; letter-spacing: .25em; text-transform: uppercase;
        }
        .scroll-line {
          width: 1px; height: 40px;
          background: linear-gradient(to bottom, rgba(255,255,255,.5), transparent);
          animation: scrollPulse 2s ease-in-out infinite;
        }
        @keyframes scrollPulse { 0%, 100% { opacity: .4; } 50% { opacity: 1; } }

        /* ══════════════════════════════
           2. GALERIA
        ══════════════════════════════ */
        .galeria-section {
          background: var(--cream);
          min-height: 100vh;
          padding: 0;
        }

        /* Filtry */
        .galeria-filtry {
          display: flex; flex-wrap: wrap; gap: .6rem;
          margin-bottom: 2.5rem;
        }
        .galeria-filtr {
          display: inline-flex; align-items: center; gap: .45rem;
          font-family: 'DM Sans', sans-serif;
          font-size: .75rem; font-weight: 400;
          padding: .5rem 1rem;
          background: transparent;
          color: var(--olive-light);
          border: 1px solid rgba(74,82,64,.2); border-radius: 20px;
          cursor: pointer; transition: all .2s;
        }
        .galeria-filtr:hover { background: rgba(74,82,64,.07); color: var(--olive-dark); }
        .galeria-filtr--active {
          background: var(--olive); color: var(--white);
          border-color: var(--olive);
        }
        .filtr-count {
          font-size: .65rem; font-weight: 300;
          background: rgba(255,255,255,.2);
          padding: .1rem .4rem; border-radius: 10px;
        }
        .galeria-filtr:not(.galeria-filtr--active) .filtr-count {
          background: rgba(74,82,64,.1); color: var(--olive-light);
        }

        /* Masonry grid */
        .galeria-grid {
          columns: 4;
          column-gap: 10px;
        }
        .galeria-skeleton {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-auto-rows: 180px;
          gap: 10px;
        }

        .foto-item {
          break-inside: avoid;
          margin-bottom: 10px;
          position: relative;
          overflow: hidden;
          border-radius: 2px;
          cursor: pointer;
          animation: cardIn .4s ease both;
          background: var(--cream-dark);
        }
        .foto-item--wide {
          /* wyróżnione zdjęcia — większe w masonry przez min-height */
        }
        .foto-item__img {
          width: 100%;
          display: block;
          transition: transform .4s ease;
        }
        .foto-item:hover .foto-item__img { transform: scale(1.04); }

        .foto-item__overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(26,29,21,.7) 0%, transparent 50%);
          opacity: 0;
          display: flex; align-items: flex-end; justify-content: space-between;
          padding: 1rem;
          transition: opacity .25s;
        }
        .foto-item:hover .foto-item__overlay { opacity: 1; }

        .foto-item__tytul {
          font-family: 'Cormorant Garamond', serif;
          font-size: .95rem; font-weight: 300;
          color: var(--white); line-height: 1.3;
        }
        .foto-item__zoom {
          font-size: 1.4rem; color: rgba(255,255,255,.7);
          flex-shrink: 0;
        }

        .galeria-empty {
          text-align: center; padding: 5rem 2rem;
          display: flex; flex-direction: column; align-items: center; gap: 1rem;
        }
        .galeria-empty span { font-size: 3rem; opacity: .4; }
        .galeria-empty p {
          font-family: 'DM Sans', sans-serif;
          font-size: .9rem; color: var(--olive-light);
        }

        .galeria-uwaga {
          margin-top: 1.5rem;
          font-family: 'DM Sans', sans-serif;
          font-size: .7rem; font-weight: 300;
          color: var(--olive-light); text-align: center;
          letter-spacing: .08em;
        }

        /* ══════════════════════════════
           3. LIGHTBOX
        ══════════════════════════════ */
        .lightbox {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(10,12,9,.92);
          display: flex; align-items: center; justify-content: center;
          animation: fadeIn .2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .lightbox__close {
          position: absolute; top: 1.5rem; right: 1.5rem;
          width: 44px; height: 44px;
          background: rgba(255,255,255,.1);
          border: 1px solid rgba(255,255,255,.15);
          border-radius: 50%; color: var(--white);
          font-size: 1rem; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background .2s;
          z-index: 10;
        }
        .lightbox__close:hover { background: rgba(255,255,255,.2); }

        .lightbox__nav {
          position: absolute;
          top: 50%; transform: translateY(-50%);
          width: 52px; height: 52px;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 50%; color: var(--white);
          font-size: 1.8rem; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background .2s;
          z-index: 10;
          line-height: 1;
        }
        .lightbox__nav:hover:not(:disabled) { background: rgba(255,255,255,.18); }
        .lightbox__nav:disabled { opacity: .2; cursor: default; }
        .lightbox__nav--prev { left: 1.5rem; }
        .lightbox__nav--next { right: 1.5rem; }

        .lightbox__content {
          max-width: 90vw; max-height: 90vh;
          display: flex; flex-direction: column;
          align-items: center; gap: .75rem;
        }

        .lightbox__img-wrap {
          max-width: 85vw; max-height: 80vh;
          display: flex; align-items: center; justify-content: center;
        }
        .lightbox__img {
          max-width: 85vw; max-height: 80vh;
          object-fit: contain;
          border-radius: 2px;
          animation: zoomIn .2s ease;
        }
        .lightbox__demo-img {
          width: 600px; height: 400px; max-width: 85vw;
          border-radius: 2px; overflow: hidden;
        }
        @keyframes zoomIn { from { transform: scale(.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        .lightbox__caption {
          display: flex; align-items: center; gap: 1.5rem;
          flex-wrap: wrap; justify-content: center;
        }
        .lightbox__tytul {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1rem; font-weight: 300;
          color: rgba(255,255,255,.8);
        }
        .lightbox__opis {
          font-family: 'DM Sans', sans-serif;
          font-size: .78rem; font-weight: 300;
          color: rgba(255,255,255,.45);
        }
        .lightbox__counter {
          font-family: 'DM Sans', sans-serif;
          font-size: .68rem; font-weight: 300;
          color: rgba(255,255,255,.3);
          letter-spacing: .1em;
        }

        /* ══ RESPONSIVE ══ */
        @media (max-width: 1100px) {
          .galeria-grid { columns: 3; }
          .galeria-skeleton { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 760px) {
          .galeria-grid { columns: 2; }
          .galeria-skeleton { grid-template-columns: repeat(2, 1fr); }
          .lightbox__nav--prev { left: .5rem; }
          .lightbox__nav--next { right: .5rem; }
          .section-inner { padding: 3rem 1.25rem; }
        }
        @media (max-width: 480px) {
          .galeria-grid { columns: 1; }
          .galeria-skeleton { grid-template-columns: 1fr; }
          .hero-btns { flex-direction: column; align-items: center; }
        }
      `}</style>

      <HeroSection />
      <GaleriaSection />
    </>
  );
}
