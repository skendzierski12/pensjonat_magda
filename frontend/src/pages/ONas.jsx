import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API = "http://localhost:8000/api";

const FALLBACK_TYTUL = "Kilka słów o nas";
const FALLBACK_TRESC = `W sercu Gór Sowich, w uroczej, małej miejscowości Lasocin położony jest Pensjonat „Magda". Wiedzie od niego najkrótszy szlak na Wielką Sowę - najwyższy szczyt Gór Sowich (1015 m n.p.m.). Pasmo to należy do najstarszych (obok Świętokrzyskich) gór w Polsce. Rozciąga się od doliny rzeki Bystrzycy z zamkiem GRODNO i Jeziorem Bystrzyckim w pn.-zach. części po przełęcz Srebrną ze srebrnogórskimi fortyfikacjami na pd.-wsch. Całe pasmo ma ok. 25km długości.

Pensjonat „Magda" to świetne miejsce odpoczynku w ciszy, spokoju i na łonie przyrody, blisko aglomeracji miejskich takich jak Dzierżoniów (10km) czy Wrocław (65km). Każdy znajdzie tu odrobinę relaksu i ukojenia dla siebie. Klienci indywidualni: liczne szlaki turystyczne doskonałe do pieszych i rowerowych wycieczek, ścieżki zdrowia, trasy turystyczne i narciarskie. Miłośnicy przyrody odnajdą tu liczne gatunki flory i fauny, grzybów oraz unikatowe na skalę krajową stada muflonów.

Dla Klientów instytucjonalnych/firmowych to doskonałe miejsce na zorganizowanie szkoleń, konferencji, spotkań biznesowych, firmowych czy integracyjnych.`;

const FAKTY = [
  { liczba: "1015", jednostka: "m n.p.m.", opis: "Wielka Sowa — najwyższy szczyt Gór Sowich" },
  { liczba: "25", jednostka: "km", opis: "Długość pasma Gór Sowich" },
  { liczba: "10", jednostka: "km", opis: "Do centrum Dzierżoniowa" },
  { liczba: "65", jednostka: "km", opis: "Do Wrocławia" },
];

function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

export default function ONas() {
  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [heroRef, heroVisible] = useReveal(0.1);
  const [trescRef, trescVisible] = useReveal(0.1);
  const [faktyRef, faktyVisible] = useReveal(0.1);

  useEffect(() => {
    axios.get(`${API}/core/o-nas/`)
      .then(r => {
        const item = Array.isArray(r.data) ? r.data[0] : r.data;
        setData(item);
      })
      .catch(() => setData(null))
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
  }, []);

  const tytul = data?.tytul || FALLBACK_TYTUL;
  const tresc = data?.tresc || FALLBACK_TRESC;
  const zdjecie = data?.zdjecie || null;

  // Dzielimy treść na akapity
  const akapity = tresc.split("\n").filter(p => p.trim().length > 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --olive:      #4a5240;
          --olive-dark: #2e3328;
          --olive-deep: #1a1d15;
          --olive-light:#6b7560;
          --amber:      #c8973a;
          --amber-light:#e8b85a;
          --cream:      #f5f0e8;
          --cream-dark: #ede7d8;
          --white:      #ffffff;
        }

        body { font-family: 'DM Sans', sans-serif; background: var(--cream); }

        /* ══ REVEAL ══ */
        .reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity .8s ease, transform .8s cubic-bezier(.4,0,.2,1);
        }
        .reveal.in { opacity: 1; transform: translateY(0); }

        /* ══ HERO ══ */
        .onas-hero {
          min-height: 52vh;
          background:
            linear-gradient(170deg, rgba(20,24,16,.72) 0%, rgba(46,51,40,.55) 100%),
            url('/onas_background.png') center 60% / cover no-repeat;
          display: flex;
          align-items: flex-end;
          padding: 0 2.5rem 5rem;
          position: relative;
          overflow: hidden;
        }

        .onas-hero::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 120px;
          background: linear-gradient(to bottom, transparent, var(--cream));
        }

        .onas-hero__content {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
        }

        .onas-hero__eyebrow {
          font-family: 'DM Sans', sans-serif;
          font-size: .68rem;
          letter-spacing: .38em;
          text-transform: uppercase;
          color: var(--amber);
          margin-bottom: 1rem;
          display: block;
        }

        .onas-hero__title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: clamp(2.8rem, 7vw, 6rem);
          color: var(--white);
          line-height: 1.02;
        }

        .onas-hero__title em {
          font-style: italic;
          color: var(--amber);
        }

        /* ══ MAIN CONTENT ══ */
        .onas-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 5rem 2.5rem;
        }

        .onas-layout {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 6rem;
          align-items: start;
        }

        /* Tekst */
        .onas-text__label {
          font-family: 'DM Sans', sans-serif;
          font-size: .68rem;
          letter-spacing: .35em;
          text-transform: uppercase;
          color: var(--amber);
          margin-bottom: 1.5rem;
          display: block;
        }

        .onas-text__heading {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: clamp(1.8rem, 3.5vw, 2.8rem);
          color: var(--olive-dark);
          line-height: 1.1;
          margin-bottom: 2.5rem;
        }

        .onas-text__heading em {
          font-style: italic;
          color: var(--amber);
        }

        .onas-text__body p {
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
          font-size: .95rem;
          line-height: 1.85;
          color: var(--olive-light);
          margin-bottom: 1.4rem;
        }

        .onas-text__body p:last-child { margin-bottom: 0; }

        /* Dekoracyjna linia */
        .onas-text__body p:first-child {
          font-size: 1.05rem;
          color: var(--olive);
          font-weight: 400;
        }

        /* Zdjęcie / panel prawy */
        .onas-visual {
          position: sticky;
          top: 100px;
        }

        .onas-photo {
          width: 100%;
          aspect-ratio: 3/4;
          object-fit: cover;
          border-radius: 2px;
          display: block;
          filter: saturate(85%);
        }

        .onas-photo-placeholder {
          width: 100%;
          aspect-ratio: 3/4;
          background: var(--olive-dark);
          border-radius: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .onas-photo-placeholder::before {
          content: '';
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 30% 70%, rgba(200,151,58,.15) 0%, transparent 60%),
            linear-gradient(160deg, #2e3328 0%, #4a5240 100%);
        }

        .onas-photo-placeholder__text {
          position: relative;
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: 1.1rem;
          color: rgba(255,255,255,.3);
          letter-spacing: .15em;
          text-transform: uppercase;
        }

        /* Dekoracyjny element na zdjęciu */
        .onas-photo-badge {
          position: absolute;
          bottom: -1.5rem;
          left: -1.5rem;
          background: var(--amber);
          color: var(--olive-dark);
          padding: 1.5rem;
          border-radius: 2px;
          box-shadow: 0 8px 32px rgba(0,0,0,.2);
        }

        .onas-photo-badge__num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 2.5rem;
          font-weight: 300;
          line-height: 1;
          display: block;
        }

        .onas-photo-badge__text {
          font-family: 'DM Sans', sans-serif;
          font-size: .62rem;
          letter-spacing: .18em;
          text-transform: uppercase;
          font-weight: 500;
          display: block;
          margin-top: .25rem;
        }

        /* ══ FAKTY ══ */
        .onas-fakty {
          background: var(--olive-dark);
          padding: 5rem 2.5rem;
        }

        .onas-fakty__inner {
          max-width: 1200px;
          margin: 0 auto;
        }

        .onas-fakty__label {
          font-family: 'DM Sans', sans-serif;
          font-size: .68rem;
          letter-spacing: .35em;
          text-transform: uppercase;
          color: var(--amber);
          margin-bottom: 3rem;
          display: block;
          text-align: center;
        }

        .onas-fakty__grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: rgba(255,255,255,.07);
        }

        .onas-fakt {
          background: var(--olive-dark);
          padding: 2.5rem 2rem;
          text-align: center;
          transition: background .25s;
        }

        .onas-fakt:hover { background: rgba(255,255,255,.04); }

        .onas-fakt__num {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: 3.5rem;
          color: var(--amber);
          line-height: 1;
          display: block;
        }

        .onas-fakt__unit {
          font-family: 'DM Sans', sans-serif;
          font-size: .72rem;
          letter-spacing: .2em;
          text-transform: uppercase;
          color: rgba(255,255,255,.4);
          display: block;
          margin: .4rem 0 .75rem;
        }

        .onas-fakt__opis {
          font-family: 'DM Sans', sans-serif;
          font-size: .8rem;
          font-weight: 300;
          color: rgba(255,255,255,.55);
          line-height: 1.5;
        }

        /* ══ CTA ══ */
        .onas-cta {
          background: var(--cream-dark);
          padding: 6rem 2.5rem;
          text-align: center;
        }

        .onas-cta__inner { max-width: 600px; margin: 0 auto; }

        .onas-cta__title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: clamp(2rem, 4vw, 3.2rem);
          color: var(--olive-dark);
          margin-bottom: 1rem;
          line-height: 1.1;
        }

        .onas-cta__title em { font-style: italic; color: var(--amber); }

        .onas-cta__sub {
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
          font-size: .9rem;
          color: var(--olive-light);
          line-height: 1.7;
          margin-bottom: 2.5rem;
        }

        .onas-cta__btns {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-primary {
          display: inline-block;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          font-size: .78rem;
          letter-spacing: .2em;
          text-transform: uppercase;
          color: var(--olive-dark);
          background: var(--amber);
          padding: 1rem 2.4rem;
          border-radius: 1px;
          text-decoration: none;
          transition: background .25s, transform .2s;
        }
        .btn-primary:hover { background: var(--amber-light); transform: translateY(-2px); }

        .btn-ghost {
          display: inline-block;
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
          font-size: .78rem;
          letter-spacing: .2em;
          text-transform: uppercase;
          color: var(--olive);
          border: 1px solid rgba(74,82,64,.3);
          padding: 1rem 2.4rem;
          border-radius: 1px;
          text-decoration: none;
          transition: border-color .25s, color .25s;
        }
        .btn-ghost:hover { border-color: var(--amber); color: var(--amber); }

        /* ══ RESPONSIVE ══ */
        @media (max-width: 900px) {
          .onas-layout { grid-template-columns: 1fr; gap: 3rem; }
          .onas-visual { position: static; }
          .onas-fakty__grid { grid-template-columns: repeat(2, 1fr); }
          .onas-photo-badge { left: 1rem; bottom: 1rem; }
        }

        @media (max-width: 480px) {
          .onas-hero { padding: 0 1.5rem 4rem; }
          .onas-main { padding: 3rem 1.5rem; }
          .onas-fakty { padding: 3rem 1.5rem; }
          .onas-fakty__grid { grid-template-columns: 1fr 1fr; }
          .onas-cta { padding: 4rem 1.5rem; }
        }
      `}</style>

      {/* ══ HERO ══ */}
      <section className="onas-hero" ref={heroRef}>
        <div className={`onas-hero__content reveal ${heroVisible ? "in" : ""}`}>
          <span className="onas-hero__eyebrow">Góry Sowie · Lasocin</span>
          <h1 className="onas-hero__title">
            Poznaj<br />
            <em>Pensjonat Magda</em>
          </h1>
        </div>
      </section>

      {/* ══ GŁÓWNA TREŚĆ ══ */}
      <div className="onas-main">
        <div className="onas-layout" ref={trescRef}>

          {/* Tekst */}
          <div className={`onas-text reveal ${trescVisible ? "in" : ""}`}>
            <span className="onas-text__label">O nas</span>
            <h2 className="onas-text__heading">
              {tytul.includes("nas") ? (
                <>Kilka słów<br /><em>o nas</em></>
              ) : (
                tytul
              )}
            </h2>
            <div className="onas-text__body">
              {akapity.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>

          {/* Zdjęcie */}
          <div className={`onas-visual reveal ${trescVisible ? "in" : ""}`} style={{ transitionDelay: ".15s" }}>
            <div style={{ position: "relative" }}>
              <img
                src={zdjecie || "/pensjonat.png"}
                alt="Pensjonat Magda"
                className="onas-photo"
              />
              <div className="onas-photo-badge">
                <span className="onas-photo-badge__num">1015</span>
                <span className="onas-photo-badge__text">m n.p.m.</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ══ FAKTY ══ */}
      <section className="onas-fakty" ref={faktyRef}>
        <div className="onas-fakty__inner">
          <span className="onas-fakty__label">W liczbach</span>
          <div className="onas-fakty__grid">
            {FAKTY.map((f, i) => (
              <div
                key={i}
                className={`onas-fakt reveal ${faktyVisible ? "in" : ""}`}
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <span className="onas-fakt__num">{f.liczba}</span>
                <span className="onas-fakt__unit">{f.jednostka}</span>
                <span className="onas-fakt__opis">{f.opis}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="onas-cta">
        <div className="onas-cta__inner">
          <h2 className="onas-cta__title">
            Zaplanuj swój<br /><em>wypoczynek</em>
          </h2>
          <p className="onas-cta__sub">
            Sprawdź dostępne pokoje lub napisz do nas — chętnie pomożemy
            zaplanować idealny pobyt w Górach Sowich.
          </p>
          <div className="onas-cta__btns">
            <a href="/oferta" className="btn-primary">Zobacz Ofertę</a>
            <a href="/kontakt" className="btn-ghost">Skontaktuj się</a>
          </div>
        </div>
      </section>
    </>
  );
}
