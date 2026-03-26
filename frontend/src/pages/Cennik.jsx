import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API = "http://localhost:8000/api";

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
const SEZON_IKONA = {
  lato:     "☀️",
  zima:     "❄️",
  swieta:   "🎄",
  standard: "📅",
};
const SEZON_KOLOR = {
  lato:     { bg: "rgba(200,151,58,.12)", border: "rgba(200,151,58,.25)", text: "#c8973a" },
  zima:     { bg: "rgba(100,160,220,.1)",  border: "rgba(100,160,220,.2)",  text: "#7ab0dc" },
  swieta:   { bg: "rgba(180,80,80,.1)",    border: "rgba(180,80,80,.2)",    text: "#c87070" },
  standard: { bg: "rgba(74,82,64,.1)",     border: "rgba(74,82,64,.2)",     text: "#6b7560" },
};

// ─── DEMO DATA ───
const DEMO_TYPY = [
  {
    id: 1, nazwa: "Pokój Dwuosobowy", liczba_osob: 2, powierzchnia: "22.00",
    ceny: [
      { id: 1, sezon: 1, sezon_nazwa: "Standard",    sezon_rodzaj: "standard", cena_za_noc: "180.00" },
      { id: 2, sezon: 2, sezon_nazwa: "Lato 2025",   sezon_rodzaj: "lato",     cena_za_noc: "240.00" },
      { id: 3, sezon: 3, sezon_nazwa: "Zima 2025",   sezon_rodzaj: "zima",     cena_za_noc: "220.00" },
      { id: 4, sezon: 4, sezon_nazwa: "Święta 2025", sezon_rodzaj: "swieta",   cena_za_noc: "290.00" },
    ],
  },
  {
    id: 2, nazwa: "Pokój Trzyosobowy", liczba_osob: 3, powierzchnia: "28.00",
    ceny: [
      { id: 5, sezon: 1, sezon_nazwa: "Standard",    sezon_rodzaj: "standard", cena_za_noc: "230.00" },
      { id: 6, sezon: 2, sezon_nazwa: "Lato 2025",   sezon_rodzaj: "lato",     cena_za_noc: "300.00" },
      { id: 7, sezon: 3, sezon_nazwa: "Zima 2025",   sezon_rodzaj: "zima",     cena_za_noc: "280.00" },
      { id: 8, sezon: 4, sezon_nazwa: "Święta 2025", sezon_rodzaj: "swieta",   cena_za_noc: "360.00" },
    ],
  },
  {
    id: 3, nazwa: "Apartament Rodzinny", liczba_osob: 4, powierzchnia: "48.00",
    ceny: [
      { id: 9,  sezon: 1, sezon_nazwa: "Standard",    sezon_rodzaj: "standard", cena_za_noc: "320.00" },
      { id: 10, sezon: 2, sezon_nazwa: "Lato 2025",   sezon_rodzaj: "lato",     cena_za_noc: "420.00" },
      { id: 11, sezon: 3, sezon_nazwa: "Zima 2025",   sezon_rodzaj: "zima",     cena_za_noc: "390.00" },
      { id: 12, sezon: 4, sezon_nazwa: "Święta 2025", sezon_rodzaj: "swieta",   cena_za_noc: "500.00" },
    ],
  },
  {
    id: 4, nazwa: "Pokój Górski", liczba_osob: 2, powierzchnia: "30.00",
    ceny: [
      { id: 13, sezon: 1, sezon_nazwa: "Standard",    sezon_rodzaj: "standard", cena_za_noc: "210.00" },
      { id: 14, sezon: 2, sezon_nazwa: "Lato 2025",   sezon_rodzaj: "lato",     cena_za_noc: "270.00" },
      { id: 15, sezon: 3, sezon_nazwa: "Zima 2025",   sezon_rodzaj: "zima",     cena_za_noc: "260.00" },
      { id: 16, sezon: 4, sezon_nazwa: "Święta 2025", sezon_rodzaj: "swieta",   cena_za_noc: "330.00" },
    ],
  },
];

const DEMO_SEZONY = [
  { id: 1, nazwa: "Standard",    rodzaj: "standard", data_od: "2025-01-01", data_do: "2025-12-31" },
  { id: 2, nazwa: "Lato 2025",   rodzaj: "lato",     data_od: "2025-06-20", data_do: "2025-08-31" },
  { id: 3, nazwa: "Zima 2025",   rodzaj: "zima",     data_od: "2026-01-02", data_do: "2026-02-28" },
  { id: 4, nazwa: "Święta 2025", rodzaj: "swieta",   data_od: "2025-12-23", data_do: "2026-01-01" },
];

// ─── PAGE HEADER ───
function PageHeader() {
  return (
    <div className="page-header">
      <div className="page-header__inner">
        <div className="page-header__label">Noclegi</div>
        <h1 className="page-header__title">Cennik<br /><em>pokojów</em></h1>
        <p className="page-header__sub">
          Ceny za pokój za dobę, śniadanie wliczone. Bez ukrytych opłat.
        </p>
      </div>
    </div>
  );
}

// ─── TABELA CENNIK ───
function CennikSection() {
  const [ref, visible] = useReveal();
  const [typy, setTypy] = useState([]);
  const [sezony, setSezony] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/oferta/typy-pokoi/`),
      axios.get(`${API}/oferta/sezony/`),
    ])
      .then(([rTypy, rSezony]) => {
        setTypy(rTypy.data);
        setSezony(rSezony.data);
      })
      .catch(() => {
        setTypy(DEMO_TYPY);
        setSezony(DEMO_SEZONY);
      })
      .finally(() => setLoading(false));
  }, []);

  const sezonyCols = sezony.length > 0
    ? sezony
    : [...new Map(
        typy.flatMap(t => t.ceny).map(c => [c.sezon, { id: c.sezon, nazwa: c.sezon_nazwa, rodzaj: c.sezon_rodzaj }])
      ).values()];

  const getCena = (typ, sezonId) => {
    const cena = typ.ceny?.find(c => c.sezon === sezonId);
    return cena ? parseFloat(cena.cena_za_noc) : null;
  };

  return (
    <section className="cennik-section" ref={ref}>
      <div className={`section-inner ${visible ? "reveal-in" : ""}`}>
        <div className="cennik-header">
          <div>
            <div className="section-label">Ceny sezonowe</div>
            <h2 className="section-title">Tabela<br /><em>cenowa</em></h2>
          </div>
          <div className="cennik-info">
            <div className="info-chip">✓ Śniadanie wliczone</div>
            <div className="info-chip">✓ Bezpłatne Wi-Fi</div>
            <div className="info-chip">✓ Parking w cenie</div>
          </div>
        </div>

        {loading ? (
          <div className="cennik-skeleton">
            <div className="skeleton-table-header" />
            {[1,2,3,4].map(i => <div key={i} className="skeleton-table-row" />)}
          </div>
        ) : (
          <>
            {/* TABELA DESKTOPOWA */}
            <div className="cennik-table-wrap">
              <table className="cennik-table">
                <thead>
                  <tr>
                    <th className="th-pokoj"></th>
                    {sezonyCols.map(s => {
                      const k = SEZON_KOLOR[s.rodzaj] || SEZON_KOLOR.standard;
                      return (
                        <th key={s.id} className="th-sezon">
                          <div className="sezon-head" style={{ background: k.bg, border: `1px solid ${k.border}` }}>
                            <span className="sezon-head__ikona">{SEZON_IKONA[s.rodzaj] || "📅"}</span>
                            <span className="sezon-head__nazwa" style={{ color: k.text }}>{s.nazwa}</span>
                            {s.data_od && (
                              <span className="sezon-head__daty">
                                {new Date(s.data_od).toLocaleDateString("pl-PL", { day: "numeric", month: "short" })}
                                {" – "}
                                {new Date(s.data_do).toLocaleDateString("pl-PL", { day: "numeric", month: "short" })}
                              </span>
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {typy.map((t, ti) => (
                    <tr key={t.id} className={`cennik-row ${ti % 2 === 0 ? "cennik-row--even" : ""}`}>
                      <td className="td-pokoj">
                        <div className="pokoj-cell">
                          <span className="pokoj-cell__num">0{ti + 1}</span>
                          <div>
                            <div className="pokoj-cell__nazwa">{t.nazwa}</div>
                            <div className="pokoj-cell__meta">
                              {"👤".repeat(Math.min(t.liczba_osob, 4))}
                              {" "}
                              {t.liczba_osob} {t.liczba_osob === 1 ? "osoba" : "osoby"}
                              {t.powierzchnia && ` · ${parseFloat(t.powierzchnia).toFixed(0)} m²`}
                            </div>
                          </div>
                        </div>
                      </td>
                      {sezonyCols.map(s => {
                        const cena = getCena(t, s.id);
                        const k = SEZON_KOLOR[s.rodzaj] || SEZON_KOLOR.standard;
                        return (
                          <td key={s.id} className="td-cena">
                            {cena !== null ? (
                              <div className="cena-cell">
                                <span className="cena-cell__val" style={{ color: k.text }}>
                                  {cena.toFixed(0)}
                                </span>
                                <span className="cena-cell__unit">zł/noc</span>
                              </div>
                            ) : (
                              <span className="cena-brak">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* KARTY MOBILNE */}
            <div className="cennik-mobile">
              {typy.map((t, ti) => (
                <div key={t.id} className="cennik-mobile-card">
                  <div className="cennik-mobile-card__header">
                    <span className="pokoj-cell__num">0{ti + 1}</span>
                    <div>
                      <div className="pokoj-cell__nazwa">{t.nazwa}</div>
                      <div className="pokoj-cell__meta">
                        {"👤".repeat(Math.min(t.liczba_osob, 4))}
                        {" "}{t.liczba_osob} {t.liczba_osob === 1 ? "osoba" : "osoby"}
                        {t.powierzchnia && ` · ${parseFloat(t.powierzchnia).toFixed(0)} m²`}
                      </div>
                    </div>
                  </div>
                  <div className="cennik-mobile-card__ceny">
                    {t.ceny?.map(c => {
                      const k = SEZON_KOLOR[c.sezon_rodzaj] || SEZON_KOLOR.standard;
                      return (
                        <div key={c.id} className="mobile-cena-row" style={{ borderLeftColor: k.text }}>
                          <span className="mobile-cena-row__sezon" style={{ color: k.text }}>
                            {SEZON_IKONA[c.sezon_rodzaj] || "📅"} {c.sezon_nazwa}
                          </span>
                          <span className="mobile-cena-row__val">
                            {parseFloat(c.cena_za_noc).toFixed(0)} zł/noc
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <p className="cennik-uwaga">
              * Ceny za pokój za dobę. Dzieci do 3 lat gratis, 4–12 lat — 50% ceny.
              Przy pobycie 7+ nocy — 10% rabatu. Ceny mogą ulec zmianie.
            </p>
          </>
        )}
      </div>
    </section>
  );
}

// ─── INFO ───
function InfoSection() {
  const [ref, visible] = useReveal();

  const items = [
    { ikona: "🍳", tytul: "Śniadania",    opis: "Codziennie 7:30–10:00. Bufet z regionalnych produktów — domowe wędliny, oscypek, świeże pieczywo." },
    { ikona: "🅿️", tytul: "Parking",      opis: "Bezpłatny parking strzeżony na terenie pensjonatu. Miejsca dla wszystkich gości." },
    { ikona: "🐾", tytul: "Zwierzęta",    opis: "Przyjazny dla zwierząt — psy mile widziane za dodatkową opłatą 30 zł/noc." },
    { ikona: "📅", tytul: "Rezerwacja",   opis: "Rezerwacja telefonicznie lub mailowo. Zaliczka 30% przy rezerwacji, reszta przy zameldowaniu." },
    { ikona: "↩️", tytul: "Anulacja",     opis: "Bezpłatna anulacja do 7 dni przed przyjazdem. Późniejsza anulacja — utrata zaliczki." },
    { ikona: "🕐", tytul: "Zameldowanie", opis: "Check-in od 14:00, check-out do 11:00. Możliwość późniejszego wymeldowania po uzgodnieniu." },
  ];

  return (
    <section className="info-section" ref={ref}>
      <div className={`section-inner ${visible ? "reveal-in" : ""}`}>
        <div className="section-label">Zasady pobytu</div>
        <h2 className="section-title section-title--light">Co warto<br /><em>wiedzieć</em></h2>
        <div className="info-grid">
          {items.map((item, i) => (
            <div key={i} className="info-card" style={{ animationDelay: `${i * 0.08}s` }}>
              <span className="info-card__ikona">{item.ikona}</span>
              <div>
                <h3 className="info-card__tytul">{item.tytul}</h3>
                <p className="info-card__opis">{item.opis}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ───
function CTASection() {
  const [ref, visible] = useReveal();
  return (
    <section className="cta-section" ref={ref}>
      <div className={`section-inner cta-inner ${visible ? "reveal-in" : ""}`}>
        <p className="eyebrow eyebrow--amber">Rezerwacje</p>
        <h2 className="section-title section-title--light">
          Gotowy na<br /><em>rezerwację?</em>
        </h2>
        <p className="cta-sub">
          Sprawdź dostępność i zarezerwuj swój pokój — zadzwoń
          lub napisz, odpiszemy w ciągu kilku godzin.
        </p>
        <div className="cta-btns">
          <a href="/kontakt" className="btn-primary">Napisz do nas</a>
          <a href="tel:+48748369928" className="btn-ghost">+48 74 836 99 28</a>
        </div>
      </div>
    </section>
  );
}

// ─── MAIN ───
export default function Cennik() {
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

        body { font-family: 'DM Sans', sans-serif; }

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
          font-size: clamp(2.2rem, 4vw, 3.2rem);
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

        /* ══ SKELETONS ══ */
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }
        .skeleton-table-header, .skeleton-table-row {
          background: linear-gradient(90deg, #e2ddd6 25%, #ede9e2 50%, #e2ddd6 75%);
          background-size: 800px 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 2px; margin-bottom: .5rem;
        }
        .skeleton-table-header { height: 56px; margin-bottom: 1rem; }
        .skeleton-table-row { height: 64px; }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ══════════════════════════════
           PAGE HEADER
        ══════════════════════════════ */
        .page-header {
          background: var(--olive-dark);
          padding: 8rem 2.5rem 5rem;
        }
        .page-header__inner { max-width: 1200px; margin: 0 auto; }
        .page-header__label {
          font-family: 'DM Sans', sans-serif;
          font-size: .68rem; font-weight: 300;
          letter-spacing: .3em; text-transform: uppercase;
          color: var(--amber); margin-bottom: .75rem;
        }
        .page-header__title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(3rem, 7vw, 5.5rem);
          font-weight: 300; line-height: 1.0;
          color: var(--white);
        }
        .page-header__title em { font-style: italic; color: var(--amber-light); }
        .page-header__sub {
          font-family: 'DM Sans', sans-serif;
          font-size: .9rem; font-weight: 300;
          color: rgba(255,255,255,.45);
          margin-top: 1rem; max-width: 50ch;
        }

        /* ══════════════════════════════
           CENNIK
        ══════════════════════════════ */
        .cennik-section { background: var(--cream); }

        .cennik-header {
          display: flex; align-items: flex-start;
          justify-content: space-between; flex-wrap: wrap;
          gap: 2rem; margin-bottom: 3rem;
        }
        .cennik-info {
          display: flex; flex-direction: column; gap: .5rem;
          align-self: flex-end;
        }
        .info-chip {
          font-family: 'DM Sans', sans-serif;
          font-size: .75rem; font-weight: 300;
          color: var(--olive);
          background: rgba(74,82,64,.08);
          border: 1px solid rgba(74,82,64,.15);
          padding: .35rem .9rem; border-radius: 1px;
        }

        .cennik-table-wrap {
          overflow-x: auto; border-radius: 2px;
          border: 1px solid rgba(74,82,64,.12);
        }
        .cennik-table { width: 100%; border-collapse: collapse; min-width: 600px; }

        .th-pokoj, .th-sezon {
          padding: 0; text-align: left;
          background: var(--cream-dark);
          border-bottom: 1px solid rgba(74,82,64,.12);
        }
        .th-pokoj { width: 260px; padding: 1.25rem 1.5rem; }
        .th-sezon { padding: .75rem 1rem; }

        .sezon-head {
          padding: .65rem 1rem; border-radius: 2px;
          display: flex; flex-direction: column; gap: .2rem;
        }
        .sezon-head__ikona { font-size: 1.1rem; }
        .sezon-head__nazwa {
          font-family: 'DM Sans', sans-serif;
          font-size: .75rem; font-weight: 500; letter-spacing: .06em;
        }
        .sezon-head__daty {
          font-family: 'DM Sans', sans-serif;
          font-size: .62rem; font-weight: 300; color: var(--olive-light);
        }

        .cennik-row { transition: background .15s; }
        .cennik-row:hover { background: rgba(74,82,64,.04); }
        .cennik-row--even { background: rgba(74,82,64,.02); }
        .cennik-row td { border-bottom: 1px solid rgba(74,82,64,.08); }
        .cennik-row:last-child td { border-bottom: none; }

        .td-pokoj { padding: 1.25rem 1.5rem; }
        .td-cena  { padding: 1.25rem 1rem; }

        .pokoj-cell { display: flex; align-items: center; gap: 1rem; }
        .pokoj-cell__num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.6rem; font-weight: 300;
          color: rgba(74,82,64,.2); min-width: 36px; line-height: 1;
        }
        .pokoj-cell__nazwa {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.05rem; font-weight: 400; color: var(--olive-dark);
        }
        .pokoj-cell__meta {
          font-family: 'DM Sans', sans-serif;
          font-size: .7rem; font-weight: 300;
          color: var(--olive-light); margin-top: .15rem;
        }

        .cena-cell { display: flex; flex-direction: column; gap: .05rem; }
        .cena-cell__val {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.4rem; font-weight: 300; line-height: 1;
        }
        .cena-cell__unit {
          font-family: 'DM Sans', sans-serif;
          font-size: .62rem; font-weight: 300; color: var(--olive-light);
        }
        .cena-brak { color: rgba(74,82,64,.25); font-size: 1.1rem; }

        .cennik-uwaga {
          margin-top: 1.25rem;
          font-family: 'DM Sans', sans-serif;
          font-size: .75rem; font-weight: 300;
          color: var(--olive-light); line-height: 1.6;
        }

        .cennik-mobile { display: none; }

        .cennik-mobile-card {
          background: var(--white);
          border: 1px solid rgba(74,82,64,.12);
          border-radius: 2px; overflow: hidden;
          margin-bottom: 1rem;
          animation: cardIn .4s ease both;
        }
        .cennik-mobile-card__header {
          display: flex; align-items: center; gap: 1rem;
          padding: 1rem 1.25rem;
          background: var(--cream-dark);
          border-bottom: 1px solid rgba(74,82,64,.1);
        }
        .cennik-mobile-card__ceny {
          padding: .75rem 1.25rem;
          display: flex; flex-direction: column; gap: .5rem;
        }
        .mobile-cena-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: .5rem .75rem; border-left: 3px solid;
          background: rgba(74,82,64,.03);
        }
        .mobile-cena-row__sezon {
          font-family: 'DM Sans', sans-serif;
          font-size: .78rem; font-weight: 400;
        }
        .mobile-cena-row__val {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.05rem; font-weight: 400; color: var(--olive-dark);
        }

        /* ══════════════════════════════
           INFO
        ══════════════════════════════ */
        .info-section { background: var(--olive-dark); }

        .info-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem; margin-top: 2.5rem;
        }
        .info-card {
          display: flex; gap: 1rem; align-items: flex-start;
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 2px; padding: 1.5rem;
          animation: cardIn .5s ease both; transition: background .2s;
        }
        .info-card:hover { background: rgba(255,255,255,.09); }
        .info-card__ikona { font-size: 1.5rem; flex-shrink: 0; }
        .info-card__tytul {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.1rem; font-weight: 400;
          color: var(--white); margin-bottom: .4rem;
        }
        .info-card__opis {
          font-family: 'DM Sans', sans-serif;
          font-size: .8rem; font-weight: 300; line-height: 1.65;
          color: rgba(255,255,255,.45);
        }

        /* ══════════════════════════════
           CTA
        ══════════════════════════════ */
        .cta-section {
          background: var(--olive-deep);
          padding: 7rem 2.5rem;
          display: flex; align-items: center; justify-content: center;
        }
        .cta-inner { text-align: center; }
        .cta-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: .92rem; font-weight: 300; line-height: 1.75;
          color: rgba(255,255,255,.45); max-width: 45ch; margin: 0 auto;
        }
        .cta-btns {
          display: flex; gap: 1rem; justify-content: center;
          flex-wrap: wrap; margin-top: 2.5rem;
        }

        /* ══ RESPONSIVE ══ */
        @media (max-width: 900px) {
          .info-grid { grid-template-columns: repeat(2, 1fr); }
          .cennik-header { flex-direction: column; }
          .cennik-info { flex-direction: row; flex-wrap: wrap; }
          .page-header { padding: 7rem 1.5rem 4rem; }
        }
        @media (max-width: 700px) {
          .cennik-table-wrap { display: none; }
          .cennik-mobile { display: block; }
          .info-grid { grid-template-columns: 1fr; }
          .section-inner { padding: 4rem 1.5rem; }
        }
        @media (max-width: 480px) {
          .cta-btns { flex-direction: column; align-items: center; }
        }
      `}</style>

      <PageHeader />
      <CennikSection />
      <InfoSection />
      <CTASection />
    </>
  );
}
