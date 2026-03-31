import { useState, useEffect, useRef } from "react";
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
const TRUDNOSC_LABEL = { latwa: "Łatwa", srednia: "Średnia", trudna: "Trudna" };
const TRUDNOSC_CLASS = { latwa: "tag--latwa", srednia: "tag--srednia", trudna: "tag--trudna" };

const IKONA_MAP = {
  "fa-hiking":      "⛰️",
  "fa-mountain":    "🏔️",
  "fa-swimming":    "🏊",
  "fa-bicycle":     "🚴",
  "fa-church":      "⛪",
  "fa-museum":      "🏛️",
  "fa-water":       "💧",
  "fa-tree":        "🌲",
  "fa-skiing":      "⛷️",
  "fa-spa":         "♨️",
  "fa-camera":      "📸",
  "fa-star":        "⭐",
};

function resolveIkona(ikona, nazwaKat) {
  if (ikona && IKONA_MAP[ikona]) return IKONA_MAP[ikona];
  const n = (nazwaKat || "").toLowerCase();
  if (n.includes("szlak") || n.includes("treking")) return "⛰️";
  if (n.includes("sport") || n.includes("rekreacja")) return "🏃";
  if (n.includes("basen") || n.includes("term")) return "♨️";
  if (n.includes("kultura") || n.includes("zabytek") || n.includes("muzeum") || n.includes("zamek") || n.includes("fort")) return "🏰";
  if (n.includes("podziemn") || n.includes("sztolni")) return "🪨";
  if (n.includes("jazda") || n.includes("rower")) return "🚴";
  if (n.includes("narcia") || n.includes("zima")) return "⛷️";
  if (n.includes("natura") || n.includes("park") || n.includes("arboret")) return "🌲";
  if (n.includes("wieża") || n.includes("widok")) return "🗼";
  return "📍";
}

// ─── DEMO DATA ───
const DEMO_KATEGORIE = [
  {
    id: 1, nazwa: "Wieże widokowe", ikona: "fa-mountain", kolejnosc: 1,
    atrakcje: [
      { id: 1, nazwa: "Wieża Bismarcka na Wielkiej Sowie", opis: "Zabytkowa wieża widokowa na najwyższym szczycie Gór Sowich (1015 m n.p.m.). Dawniej zwana wieżą Bismarcka — z góry rozciąga się panorama na całe Sudety.", odleglosc_km: "8.0", czas_dojazdu_min: 20, trudnosc: "srednia", dlugosc_trasy_km: null, link_zewnetrzny: "", aktywna: true, kategoria_nazwa: "Wieże widokowe", zdjecia: [] },
      { id: 2, nazwa: "Wieża widokowa na Kalenicy", opis: "Drewniana wieża widokowa na jednym z grzbietów Gór Sowich. Piękne widoki na okoliczne doliny i lasy.", odleglosc_km: "10.0", czas_dojazdu_min: 25, trudnosc: "latwa", dlugosc_trasy_km: null, link_zewnetrzny: "", aktywna: true, kategoria_nazwa: "Wieże widokowe", zdjecia: [] },
    ],
  },
  {
    id: 2, nazwa: "Zamki i zabytki", ikona: "fa-museum", kolejnosc: 2,
    atrakcje: [
      { id: 3, nazwa: "Zamek Grodno i jezioro w Zagórzu Śląskim", opis: "Gotycki zamek nad sztucznym jeziorem z tamą. Jedno z najpiękniejszych miejsc w Sudetach — zwiedzanie wnętrz, widok na zaporę i las.", odleglosc_km: "15.0", czas_dojazdu_min: 25, trudnosc: "latwa", dlugosc_trasy_km: null, link_zewnetrzny: "", aktywna: true, kategoria_nazwa: "Zamki i zabytki", zdjecia: [] },
      { id: 4, nazwa: "Zamek Książ w Wałbrzychu", opis: "Trzeci co do wielkości zamek w Polsce. Imponująca rezydencja z tarasami ogrodowymi, labiryntem podziemnych korytarzy i bogatą historią.", odleglosc_km: "35.0", czas_dojazdu_min: 45, trudnosc: "latwa", dlugosc_trasy_km: null, link_zewnetrzny: "", aktywna: true, kategoria_nazwa: "Zamki i zabytki", zdjecia: [] },
      { id: 5, nazwa: "Forty w Srebrnej Górze", opis: "XVIII-wieczna twierdza pruska — jeden z najlepiej zachowanych obiektów fortyfikacyjnych w Europie. Zwiedzanie fortów, bastionu i podziemnych korytarzy.", odleglosc_km: "18.0", czas_dojazdu_min: 30, trudnosc: "latwa", dlugosc_trasy_km: null, link_zewnetrzny: "", aktywna: true, kategoria_nazwa: "Zamki i zabytki", zdjecia: [] },
      { id: 6, nazwa: "Krzywa Wieża w Ząbkowicach Śląskich", opis: "Gotycka wieża z XIV w. nachylona pod kątem 2,14 m od pionu — więcej niż słynna wieża w Pizie. Wejście na szczyt i widok na stare miasto.", odleglosc_km: "22.0", czas_dojazdu_min: 30, trudnosc: "latwa", dlugosc_trasy_km: null, link_zewnetrzny: "", aktywna: true, kategoria_nazwa: "Zamki i zabytki", zdjecia: [] },
    ],
  },
  {
    id: 3, nazwa: "Atrakcje podziemne", ikona: "fa-camera", kolejnosc: 3,
    atrakcje: [
      { id: 7, nazwa: "Sztolnie w Walimiu i Osówce", opis: "Tajemnicze podziemia hitlerowskiego projektu Riese — gigantyczne tunele wykute w skale podczas II wojny światowej. Zwiedzanie z przewodnikiem.", odleglosc_km: "20.0", czas_dojazdu_min: 30, trudnosc: "latwa", dlugosc_trasy_km: null, link_zewnetrzny: "", aktywna: true, kategoria_nazwa: "Atrakcje podziemne", zdjecia: [] },
      { id: 8, nazwa: "Kompleks Włodarz", opis: "Trzecia część podziemnego kompleksu Riese — mniej znana, ale równie imponująca. Rozległa sieć korytarzy w sercu Gór Sowich.", odleglosc_km: "22.0", czas_dojazdu_min: 35, trudnosc: "latwa", dlugosc_trasy_km: null, link_zewnetrzny: "", aktywna: true, kategoria_nazwa: "Atrakcje podziemne", zdjecia: [] },
    ],
  },
  {
    id: 4, nazwa: "Natura i parki", ikona: "fa-tree", kolejnosc: 4,
    atrakcje: [
      { id: 9, nazwa: "Park Krajobrazowy Gór Sowich", opis: "Bogata fauna i flora sudecka — w tym unikalne na skalę krajową stada muflonów. Piękne szlaki piesze i rowerowe przez lasy i grzbiety górskie.", odleglosc_km: "2.0", czas_dojazdu_min: 5, trudnosc: "latwa", dlugosc_trasy_km: null, link_zewnetrzny: "", aktywna: true, kategoria_nazwa: "Natura i parki", zdjecia: [] },
      { id: 10, nazwa: "Arboretum w Wojsławicach", opis: "Jeden z najpiękniejszych ogrodów dendrologicznych w Polsce. Kolekcja ponad 4000 gatunków roślin, słynne w maju kwitnienie różaneczników.", odleglosc_km: "28.0", czas_dojazdu_min: 35, trudnosc: "latwa", dlugosc_trasy_km: null, link_zewnetrzny: "", aktywna: true, kategoria_nazwa: "Natura i parki", zdjecia: [] },
      { id: 11, nazwa: "Palmiarnia w Wałbrzychu", opis: "Jedna z największych palmiarni w Polsce. Egzotyczne rośliny, papugi i tropikalna atmosfera — atrakcja idealna przy każdej pogodzie.", odleglosc_km: "33.0", czas_dojazdu_min: 40, trudnosc: "latwa", dlugosc_trasy_km: null, link_zewnetrzny: "", aktywna: true, kategoria_nazwa: "Natura i parki", zdjecia: [] },
    ],
  },
];

// ─── SEKCJA HERO ───
function HeroSection() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  return (
    <section className="snap-section hero-section">
      <div className="hero-bg" />
      <div className="hero-overlay" />
      <div className={`hero-content ${loaded ? "hero-content--in" : ""}`}>
        <p className="eyebrow">Góry Sowie · Sudety · Okolica</p>
        <h1 className="hero-title">
          Odkryj<br />
          <em>okolice</em>
        </h1>
        <p className="hero-sub">
          Zamki, sztolnie, wieże widokowe i szlaki przez Góry Sowie —
          wszystko w zasięgu krótkiej drogi od pensjonatu.
        </p>
        <div className="hero-btns">
          <a href="#atrakcje" className="btn-primary">Zobacz atrakcje</a>
          <a href="/kontakt" className="btn-ghost">Zapytaj o trasę</a>
        </div>
      </div>
      <div className="scroll-hint">
        <div className="scroll-line" />
        <span>Przewiń</span>
      </div>
    </section>
  );
}

// ─── SEKCJA ATRAKCJE (główna) ───
function AtrakcjeSection() {
  const [ref, visible] = useReveal();
  const [kategorie, setKategorie] = useState([]);
  const [aktywna, setAktywna] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/atrakcje/kategorie/`)
      .then(r => {
        const data = r.data.filter(k => k.atrakcje?.length > 0);
        setKategorie(data);
        setAktywna(data[0]?.id ?? null);
      })
      .catch(() => {
        setKategorie(DEMO_KATEGORIE);
        setAktywna(DEMO_KATEGORIE[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  const aktywnaKat = kategorie.find(k => k.id === aktywna);
  const atrakcje = aktywnaKat?.atrakcje || [];

  return (
    <section className="snap-section atrakcje-section" id="atrakcje" ref={ref}>
      <div className={`section-inner ${visible ? "reveal-in" : ""}`}>
        <div className="atrakcje-header">
          <div>
            <div className="section-label">Okolica</div>
            <h2 className="section-title section-title--light">
              Co warto<br /><em>zobaczyć</em>
            </h2>
          </div>
          <p className="atrakcje-sub">
            Wszystkie odległości liczone od pensjonatu.
            Chętnie doradzimy trasę i pomożemy zaplanować wycieczkę.
          </p>
        </div>

        {loading ? (
          <div className="atrakcje-skeleton">
            <div className="skeleton-tabs-row">
              {[1,2,3,4].map(i => <div key={i} className="skeleton-tab-pill" />)}
            </div>
            <div className="skeleton-cards-grid">
              {[1,2,3].map(i => <div key={i} className="skeleton-card-lg" />)}
            </div>
          </div>
        ) : (
          <>
            {/* Filtry kategorii */}
            <div className="kat-filtry">
              {kategorie.map((k, i) => (
                <button
                  key={k.id}
                  className={`kat-filtr ${aktywna === k.id ? "kat-filtr--active" : ""}`}
                  onClick={() => setAktywna(k.id)}
                  style={{ animationDelay: `${i * 0.07}s` }}
                >
                  <span className="kat-filtr__ikona">{resolveIkona(k.ikona, k.nazwa)}</span>
                  <span>{k.nazwa}</span>
                  <span className="kat-filtr__count">{k.atrakcje?.length || 0}</span>
                </button>
              ))}
            </div>

            {/* Karty atrakcji */}
            <div className="atrakcje-grid" key={aktywna}>
              {atrakcje.map((a, i) => (
                <div
                  key={a.id}
                  className="atrakcja-card"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  {/* Zdjęcie lub placeholder */}
                  <div className="atrakcja-card__img-wrap">
                    {a.zdjecia && a.zdjecia.length > 0 ? (
                      <img
                        src={a.zdjecia[0].zdjecie}
                        alt={a.nazwa}
                        className="atrakcja-card__img"
                      />
                    ) : (
                      <div className="atrakcja-card__img-placeholder">
                        {resolveIkona(aktywnaKat?.ikona, a.kategoria_nazwa)}
                      </div>
                    )}
                    {/* Dystans badge */}
                    <div className="atrakcja-card__dist">
                      ~{parseFloat(a.odleglosc_km).toFixed(1)} km
                    </div>
                  </div>

                  <div className="atrakcja-card__body">
                    <h3 className="atrakcja-card__nazwa">{a.nazwa}</h3>
                    <p className="atrakcja-card__opis">{a.opis}</p>

                    {/* Meta */}
                    <div className="atrakcja-card__meta">
                      {a.czas_dojazdu_min && (
                        <span className="meta-chip">
                          🚗 {a.czas_dojazdu_min} min
                        </span>
                      )}
                      {a.dlugosc_trasy_km && (
                        <span className="meta-chip">
                          📏 {parseFloat(a.dlugosc_trasy_km).toFixed(1)} km trasy
                        </span>
                      )}
                      {a.trudnosc && (
                        <span className={`tag ${TRUDNOSC_CLASS[a.trudnosc]}`}>
                          {TRUDNOSC_LABEL[a.trudnosc]}
                        </span>
                      )}
                    </div>

                    {a.link_zewnetrzny && (
                      <a
                        href={a.link_zewnetrzny}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="atrakcja-card__link"
                      >
                        Więcej informacji →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

// ─── SEKCJA STATYSTYKI ───
function StatSection() {
  const [ref, visible] = useReveal();

  const stats = [
    { value: "1015",    unit: "m n.p.m.",   label: "Wielka Sowa — najwyższy szczyt Gór Sowich" },
    { value: "kilka",   unit: "szlaków",     label: "Górskich w bezpośredniej okolicy" },
    { value: "35",      unit: "km",          label: "Do Zamku Książ w Wałbrzychu" },
    { value: "365",     unit: "dni",         label: "Atrakcji przez cały rok" },
  ];

  return (
    <section className="stat-section" ref={ref}>
      <div className={`section-inner stat-inner ${visible ? "reveal-in" : ""}`}>
        {stats.map((s, i) => (
          <div key={i} className="stat-item" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="stat-item__value">
              {s.value}
              <span className="stat-item__unit">{s.unit}</span>
            </div>
            <p className="stat-item__label">{s.label}</p>
          </div>
        ))}
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
        <p className="eyebrow eyebrow--amber">Planowanie</p>
        <h2 className="section-title section-title--light">
          Pomożemy zaplanować<br /><em>Twój pobyt</em>
        </h2>
        <p className="cta-sub">
          Znamy okolicę jak własną kieszeń — podpowiemy najlepsze trasy,
          zarezerwujemy bilety i przygotujemy prowiant na wycieczkę.
        </p>
        <div className="hero-btns" style={{ marginTop: "2.5rem" }}>
          <a href="/kontakt" className="btn-primary">Napisz do nas</a>
          <a href="/oferta" className="btn-ghost">Zobacz pokoje</a>
        </div>
      </div>
    </section>
  );
}

// ─── MAIN ───
export default function Atrakcje() {
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
          width: 100%; max-width: 1200px;
          padding: 5rem 2.5rem; margin: 0 auto;
          opacity: 0; transform: translateY(32px);
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
        .eyebrow {
          font-family: 'DM Sans', sans-serif;
          font-size: .68rem; font-weight: 300;
          letter-spacing: .3em; text-transform: uppercase;
          color: var(--amber); margin-bottom: .75rem;
        }
        .eyebrow--amber { color: var(--amber-light); }

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

        /* ══ TAGS ══ */
        .tag {
          font-family: 'DM Sans', sans-serif;
          font-size: .6rem; letter-spacing: .1em; text-transform: uppercase;
          padding: .2rem .6rem; border-radius: 2px; font-weight: 400;
        }
        .tag--latwa  { background: rgba(100,180,80,.15); color: #5aaa48; border: 1px solid rgba(100,180,80,.2); }
        .tag--srednia{ background: rgba(200,151,58,.15); color: var(--amber); border: 1px solid rgba(200,151,58,.2); }
        .tag--trudna { background: rgba(200,80,60,.15);  color: #e0806a; border: 1px solid rgba(200,80,60,.2); }

        /* ══ SKELETONS ══ */
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        .skeleton-tab-pill, .skeleton-card-lg {
          background: linear-gradient(90deg, rgba(255,255,255,.08) 25%, rgba(255,255,255,.14) 50%, rgba(255,255,255,.08) 75%);
          background-size: 800px 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 2px;
        }
        .skeleton-tabs-row { display: flex; gap: .75rem; margin-bottom: 2rem; }
        .skeleton-tab-pill { height: 42px; width: 140px; border-radius: 4px; }
        .skeleton-cards-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.5rem; }
        .skeleton-card-lg { height: 320px; }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ══════════════════════════════
           1. HERO
        ══════════════════════════════ */
        .hero-section { background: var(--olive-deep); }
        .hero-bg {
          position: absolute; inset: 0;
          background:
            linear-gradient(160deg, rgba(26,29,21,.5) 0%, rgba(46,51,40,.82) 100%),
            url('/atrakcje_background.png') center/cover no-repeat;
        }
        .hero-overlay {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 20% 70%, rgba(200,151,58,.09) 0%, transparent 65%);
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
           2. ATRAKCJE
        ══════════════════════════════ */
        .atrakcje-section { background: var(--olive-dark); }

        .atrakcje-header {
          display: flex; align-items: flex-start;
          justify-content: space-between; flex-wrap: wrap;
          gap: 2rem; margin-bottom: 2.5rem;
        }
        .atrakcje-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: .85rem; font-weight: 300; line-height: 1.7;
          color: rgba(255,255,255,.4); max-width: 38ch;
          align-self: flex-end;
        }

        /* Filtry kategorii */
        .kat-filtry {
          display: flex; flex-wrap: wrap; gap: .6rem;
          margin-bottom: 2.5rem;
        }
        .kat-filtr {
          display: inline-flex; align-items: center; gap: .5rem;
          font-family: 'DM Sans', sans-serif;
          font-size: .75rem; font-weight: 400;
          padding: .55rem 1.1rem;
          background: rgba(255,255,255,.05);
          color: rgba(255,255,255,.55);
          border: 1px solid rgba(255,255,255,.1); border-radius: 4px;
          cursor: pointer;
          transition: all .2s;
          animation: cardIn .4s ease both;
        }
        .kat-filtr:hover {
          background: rgba(255,255,255,.1);
          color: var(--white);
        }
        .kat-filtr--active {
          background: var(--amber);
          color: var(--white);
          border-color: var(--amber);
        }
        .kat-filtr__ikona { font-size: 1rem; }
        .kat-filtr__count {
          font-size: .65rem; font-weight: 300;
          background: rgba(255,255,255,.15);
          padding: .1rem .4rem; border-radius: 10px;
        }

        /* Siatka kart */
        .atrakcje-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .atrakcja-card {
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.09);
          border-radius: 2px; overflow: hidden;
          animation: cardIn .45s ease both;
          transition: background .25s, transform .25s, border-color .25s;
          display: flex; flex-direction: column;
        }
        .atrakcja-card:hover {
          background: rgba(255,255,255,.09);
          border-color: rgba(200,151,58,.2);
          transform: translateY(-4px);
        }

        .atrakcja-card__img-wrap {
          position: relative;
          aspect-ratio: 16/9;
          background: rgba(255,255,255,.04);
          overflow: hidden;
          flex-shrink: 0;
        }
        .atrakcja-card__img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform .4s;
        }
        .atrakcja-card:hover .atrakcja-card__img { transform: scale(1.05); }
        .atrakcja-card__img-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          font-size: 3rem;
        }
        .atrakcja-card__dist {
          position: absolute; bottom: .6rem; right: .6rem;
          background: rgba(26,29,21,.8);
          color: var(--amber);
          font-family: 'DM Sans', sans-serif;
          font-size: .65rem; letter-spacing: .12em;
          padding: .3rem .7rem; border-radius: 1px;
        }

        .atrakcja-card__body {
          padding: 1.25rem;
          display: flex; flex-direction: column; gap: .6rem;
          flex: 1;
        }
        .atrakcja-card__nazwa {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.2rem; font-weight: 400;
          color: var(--white); line-height: 1.25;
        }
        .atrakcja-card__opis {
          font-family: 'DM Sans', sans-serif;
          font-size: .8rem; font-weight: 300; line-height: 1.6;
          color: rgba(255,255,255,.45);
          flex: 1;
        }
        .atrakcja-card__meta {
          display: flex; flex-wrap: wrap; gap: .4rem;
          align-items: center; margin-top: auto; padding-top: .5rem;
        }
        .meta-chip {
          font-family: 'DM Sans', sans-serif;
          font-size: .7rem; font-weight: 300;
          color: rgba(255,255,255,.4);
          background: rgba(255,255,255,.06);
          padding: .25rem .65rem; border-radius: 2px;
        }
        .atrakcja-card__link {
          font-family: 'DM Sans', sans-serif;
          font-size: .72rem; font-weight: 400;
          color: var(--amber); text-decoration: none;
          letter-spacing: .05em;
          transition: color .2s;
          margin-top: .25rem;
        }
        .atrakcja-card__link:hover { color: var(--amber-light); }

        /* ══════════════════════════════
           3. STATYSTYKI
        ══════════════════════════════ */
        .stat-section {
          background: var(--olive);
          scroll-snap-align: start;
          min-height: 30vh;
          display: flex; align-items: center; justify-content: center;
        }
        .stat-inner {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 3rem;
          text-align: center;
          padding: 4rem 2.5rem;
        }
        .stat-item { animation: cardIn .5s ease both; }
        .stat-item__value {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(2.8rem, 5vw, 4rem);
          font-weight: 300; line-height: 1;
          color: var(--white);
          margin-bottom: .5rem;
        }
        .stat-item__unit {
          font-family: 'DM Sans', sans-serif;
          font-size: .75rem; font-weight: 300;
          color: var(--amber);
          display: block; letter-spacing: .1em;
          text-transform: uppercase;
          margin-top: .3rem;
        }
        .stat-item__label {
          font-family: 'DM Sans', sans-serif;
          font-size: .75rem; font-weight: 300;
          color: rgba(255,255,255,.45);
          letter-spacing: .05em;
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
          color: rgba(255,255,255,.45); max-width: 48ch; margin: 0 auto;
        }

        /* ══ RESPONSIVE ══ */
        @media (max-width: 960px) {
          .atrakcje-grid { grid-template-columns: repeat(2, 1fr); }
          .stat-inner { grid-template-columns: repeat(2, 1fr); gap: 2rem; }
        }
        @media (max-width: 640px) {
          .atrakcje-grid { grid-template-columns: 1fr; }
          .stat-inner { grid-template-columns: repeat(2, 1fr); }
          .atrakcje-header { flex-direction: column; }
          .hero-btns { flex-direction: column; align-items: center; }
          .section-inner { padding: 4rem 1.5rem; }
          .skeleton-cards-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <HeroSection />
      <AtrakcjeSection />
      <StatSection />
      <CTASection />
    </>
  );
}
