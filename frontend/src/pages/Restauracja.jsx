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

// ─── SEKCJA HERO ───
function HeroSection() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 100); }, []);

  return (
    <section className="snap-section hero-section">
      <div className="hero-bg" />
      <div className="hero-overlay" />
      <div className={`hero-content ${loaded ? "hero-content--in" : ""}`}>
        <p className="eyebrow">Kuchnia · Tradycja · Smak</p>
        <h1 className="hero-title">
          Góralskie<br />
          <em>smaki stołu</em>
        </h1>
        <p className="hero-sub">
          Gotujemy z lokalnych produktów, według starych receptur.
	  Tak jak robiła to babcia.
        </p>
        <div className="hero-btns">
          <a href="#menu" className="btn-primary">Zobacz menu</a>
          <a href="#wyroby" className="btn-ghost">Wyroby własne</a>
        </div>
      </div>
      <div className="scroll-hint">
        <div className="scroll-line" />
        <span>Przewiń</span>
      </div>
    </section>
  );
}

// ─── SEKCJA MENU ───
function MenuSection() {
  const [ref, visible] = useReveal();
  const [kategorie, setKategorie] = useState([]);
  const [aktywna, setAktywna] = useState(null);
  const [loading, setLoading] = useState(true);
  const [godziny, setGodziny] = useState([]);

  const DNI_SHORT = ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"];

  const DEMO_KATEGORIE = [
    {
      id: 1, nazwa: "Zupy", aktywna: true, kolejnosc: 1,
      dania: [
        { id: 1, nazwa: "Żurek góralski", opis: "Na zakwasie z białą kiełbasą i jajkiem", cena: "18.00", wegetarianskie: false, wegańskie: false, bezglutenowe: false, kategoria_nazwa: "Zupy" },
        { id: 2, nazwa: "Kapuśniak ze świeżej kapusty", opis: "Z żeberkami i kminkiem", cena: "16.00", wegetarianskie: false, wegańskie: false, bezglutenowe: true, kategoria_nazwa: "Zupy" },
        { id: 3, nazwa: "Zupa grzybowa", opis: "Na wywarze z leśnych grzybów, z łazankami", cena: "17.00", wegetarianskie: true, wegańskie: false, bezglutenowe: false, kategoria_nazwa: "Zupy" },
      ],
    },
    {
      id: 2, nazwa: "Przystawki", aktywna: true, kolejnosc: 2,
      dania: [
        { id: 4, nazwa: "Oscypek z borówkami", opis: "Smażony oscypek z konfiturą borówkową", cena: "22.00", wegetarianskie: true, wegańskie: false, bezglutenowe: true, kategoria_nazwa: "Przystawki" },
        { id: 5, nazwa: "Tatar z jelenia", opis: "Z kaparami, cebulką i żółtkiem", cena: "35.00", wegetarianskie: false, wegańskie: false, bezglutenowe: true, kategoria_nazwa: "Przystawki" },
      ],
    },
    {
      id: 3, nazwa: "Dania główne", aktywna: true, kolejnosc: 3,
      dania: [
        { id: 6, nazwa: "Pierogi z owczym serem", opis: "Z bryndzą i skwarkami", cena: "28.00", wegetarianskie: true, wegańskie: false, bezglutenowe: false, kategoria_nazwa: "Dania główne" },
        { id: 7, nazwa: "Pstrąg z Dunajca", opis: "Smażony na maśle z ziołami, frytki, surówka", cena: "45.00", wegetarianskie: false, wegańskie: false, bezglutenowe: true, kategoria_nazwa: "Dania główne" },
        { id: 8, nazwa: "Bigos myśliwski", opis: "Na kapuście kiszonej z dziczyzną, 3-dniowy", cena: "32.00", wegetarianskie: false, wegańskie: false, bezglutenowe: false, kategoria_nazwa: "Dania główne" },
        { id: 9, nazwa: "Golonka pieczona", opis: "Z czosnkiem i majerankiem, z kapustą zasmażaną", cena: "48.00", wegetarianskie: false, wegańskie: false, bezglutenowe: true, kategoria_nazwa: "Dania główne" },
      ],
    },
    {
      id: 4, nazwa: "Desery", aktywna: true, kolejnosc: 4,
      dania: [
        { id: 10, nazwa: "Szarlotka z lodami", opis: "Ciepła szarlotka z lodami waniliowymi", cena: "18.00", wegetarianskie: true, wegańskie: false, bezglutenowe: false, kategoria_nazwa: "Desery" },
        { id: 11, nazwa: "Placuszki jagodowe", opis: "Z jagodami leśnymi i śmietaną", cena: "20.00", wegetarianskie: true, wegańskie: false, bezglutenowe: false, kategoria_nazwa: "Desery" },
      ],
    },
  ];

  useEffect(() => {
    axios.get(`${API}/restauracja/godziny/`)
      .then(r => setGodziny(r.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    axios.get(`${API}/restauracja/menu/`)
      .then(r => {
        const data = r.data.filter(k => k.aktywna && k.dania?.length > 0);
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
  const dania = aktywnaKat?.dania || [];

  return (
    <section className="snap-section menu-section" id="menu" ref={ref}>
      <div className={`section-inner ${visible ? "reveal-in" : ""}`}>
        <div className="menu-header">
          <div>
            <div className="section-label">Karta dań</div>
            <h2 className="section-title">Nasze<br /><em>menu</em></h2>
          </div>
          <p className="menu-godziny">
            {godziny.length > 0 ? (
              <>
                {(() => {
                  // Znajdź zakres dni z tymi samymi godzinami
                  const otwarte = godziny.filter(g => !g.zamkniete);
                  if (otwarte.length === 0) return "Restauracja chwilowo nieczynna";
                  // Jeśli wszystkie dni mają te same godziny — pokaż skrótowo
                  const pierwsza = otwarte[0];
                  const wszystkieSame = otwarte.every(
                    g => g.godzina_od === pierwsza.godzina_od && g.godzina_do === pierwsza.godzina_do
                  );
                  if (wszystkieSame && otwarte.length === 7) {
                    return <>Kuchnia czynna codziennie<br /><strong>{pierwsza.godzina_od?.slice(0,5)} — {pierwsza.godzina_do?.slice(0,5)}</strong></>;
                  }
                  // Inaczej pokaż skróty dni
                  return (
                    <span className="menu-godziny-lista">
                      {godziny.map(g => (
                        <span key={g.dzien} className={`menu-godz-dzien ${g.zamkniete ? "menu-godz-dzien--zamkniete" : ""}`}>
                          <span className="menu-godz-nazwa">{DNI_SHORT[g.dzien]}</span>
                          <span className="menu-godz-czas">
                            {g.zamkniete ? "—" : `${g.godzina_od?.slice(0,5)}–${g.godzina_do?.slice(0,5)}`}
                          </span>
                        </span>
                      ))}
                    </span>
                  );
                })()}
              </>
            ) : (
              <>Kuchnia czynna codziennie<br /><strong>8:00 — 21:00</strong></>
            )}
          </p>
        </div>

        {loading ? (
          <div className="menu-skeleton">
            <div className="skeleton-tabs-row">
              {[1,2,3,4].map(i => <div key={i} className="skeleton-tab-pill" />)}
            </div>
            <div className="skeleton-dania">
              {[1,2,3,4].map(i => <div key={i} className="skeleton-danie" />)}
            </div>
          </div>
        ) : (
          <div className="menu-body">
            {/* Filtry kategorii */}
            <div className="menu-filtry">
              {kategorie.map((k, i) => (
                <button
                  key={k.id}
                  className={`menu-filtr ${aktywna === k.id ? "menu-filtr--active" : ""}`}
                  onClick={() => setAktywna(k.id)}
                  style={{ animationDelay: `${i * 0.07}s` }}
                >
                  {k.nazwa}
                  <span className="menu-filtr__count">{k.dania?.length || 0}</span>
                </button>
              ))}
            </div>

            {/* Lista dań */}
            <div className="dania-lista" key={aktywna}>
              {dania.map((d, i) => (
                <div
                  key={d.id}
                  className="danie-row"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <div className="danie-row__left">
                    <div className="danie-row__top">
                      <h3 className="danie-row__nazwa">{d.nazwa}</h3>
                      <div className="danie-row__badges">
                        {d.wegetarianskie && <span className="badge badge--v" title="Wegetariańskie">V</span>}
                        {d.wegańskie && <span className="badge badge--vg" title="Wegańskie">VG</span>}
                        {d.bezglutenowe && <span className="badge badge--gf" title="Bezglutenowe">GF</span>}
                      </div>
                    </div>
                    {d.opis && <p className="danie-row__opis">{d.opis}</p>}
                  </div>
                  <span className="danie-row__cena">
                    {parseFloat(d.cena).toFixed(0)} <span className="cena-zl">zł</span>
                  </span>
                </div>
              ))}
            </div>

            {/* Legenda */}
            <div className="menu-legenda">
              <span className="badge badge--v">V</span> Wegetariańskie &nbsp;·&nbsp;
              <span className="badge badge--vg">VG</span> Wegańskie &nbsp;·&nbsp;
              <span className="badge badge--gf">GF</span> Bezglutenowe
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── SEKCJA SALE ───
function SaleSection() {
  const [ref, visible] = useReveal();
  const [sale, setSale] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/restauracja/sale/`)
      .then(r => setSale(r.data))
      .catch(() => setSale([
        { id: 1, nazwa: "Sala Główna", opis: "Przytulna sala z widokiem na ogród i góry w tle. Drewniane meble, kominek, regionalne dekoracje. Idealna na rodzinne obiady.", liczba_miejsc: 50, dostepna_na_imprezy: true, zdjecia: [] },
        { id: 2, nazwa: "Sala Weselna", opis: "Przestronna sala balowa z własnym wyjściem na taras. Klimatyzacja, nowoczesne nagłośnienie, osobne wejście dla gości.", liczba_miejsc: 80, dostepna_na_imprezy: true, zdjecia: [] },
        { id: 3, nazwa: "Altana Letnia", opis: "Zadaszony taras z widokiem na Tatry. Idealne miejsce na letnie kolacje w otoczeniu natury.", liczba_miejsc: 30, dostepna_na_imprezy: false, zdjecia: [] },
      ]))
      .finally(() => setLoading(false));
  }, []);

  const ikonaSali = (idx) => ["🍽️", "🥂", "☀️", "🌿"][idx % 4];

  return (
    <section className="snap-section sale-section" ref={ref}>
      <div className={`section-inner ${visible ? "reveal-in" : ""}`}>
        <div className="sale-layout">
          <div className="sale-header">
            <div className="section-label">Przestrzeń</div>
            <h2 className="section-title section-title--light">
              Nasze<br /><em>sale</em>
            </h2>
            <p className="section-desc" style={{ color: "rgba(255,255,255,.5)" }}>
              Trzy unikalne przestrzenie do wyboru —
              od kameralnego obiadu po duże przyjęcie weselne.
            </p>
            <a href="/kontakt" className="btn-primary btn-primary--sm" style={{ marginTop: "1.5rem", display: "inline-block" }}>
              Zarezerwuj salę
            </a>
          </div>

          <div className="sale-cards">
            {loading ? (
              [1,2,3].map(i => <div key={i} className="skeleton-card" />)
            ) : (
              sale.map((s, i) => (
                <div key={s.id} className="sala-card" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="sala-card__img-wrap">
                    {s.zdjecia && s.zdjecia.length > 0 ? (
                      <img
                        src={s.zdjecia[0].zdjecie}
                        alt={s.nazwa}
                        className="sala-card__img"
                      />
                    ) : (
                      <div className="sala-card__img-placeholder">
                        <span>{ikonaSali(i)}</span>
                      </div>
                    )}
                    {s.dostepna_na_imprezy && (
                      <div className="sala-card__tag">Na imprezy</div>
                    )}
                  </div>
                  <div className="sala-card__body">
                    <h3 className="sala-card__name">{s.nazwa}</h3>
                    <p className="sala-card__opis">{s.opis}</p>
                    <div className="sala-card__meta">
                      <span className="sala-meta-chip">👥 {s.liczba_miejsc} miejsc</span>
                    </div>
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

// ─── SEKCJA WYROBY WŁASNE ───
function WyrobySection() {
  const [ref, visible] = useReveal();
  const [kategorie, setKategorie] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/restauracja/kategorie-wyrobow/`)
      .then(r => setKategorie(r.data.filter(k => k.wyroby?.length > 0)))
      .catch(() => setKategorie([
        {
          id: 1, nazwa: "Wędliny i kiełbasy",
          wyroby: [
            { id: 1, nazwa: "Kiełbasa podhalańska", opis: "Wędzona na buczynie, z czosnkiem i pieprzem", cena: "28.00", jednostka: "kg", dostepny: true, zdjecia: [] },
            { id: 2, nazwa: "Szynka wiejska", opis: "Peklowana przez 2 tygodnie, wędzona na zimno", cena: "45.00", jednostka: "kg", dostepny: true, zdjecia: [] },
            { id: 3, nazwa: "Kabanosy domowe", opis: "Z mielonej wieprzowiny z kminkiem", cena: "38.00", jednostka: "kg", dostepny: true, zdjecia: [] },
          ]
        },
        {
          id: 2, nazwa: "Przetwory",
          wyroby: [
            { id: 4, nazwa: "Dżem jagodowy", opis: "Z leśnych jagód, bez konserwantów, 300g", cena: "12.00", jednostka: "szt", dostepny: true, zdjecia: [] },
            { id: 5, nazwa: "Kapusta kiszona", opis: "Kwaszona w beczce przez 4 tygodnie, 1kg", cena: "8.00", jednostka: "opak", dostepny: true, zdjecia: [] },
            { id: 6, nazwa: "Konfitura z borówek", opis: "Z cynamonem i skórką pomarańczową, 250g", cena: "15.00", jednostka: "szt", dostepny: false, zdjecia: [] },
          ]
        },
      ]))
      .finally(() => setLoading(false));
  }, []);

  const jednostkaLabel = { kg: "/ kg", szt: "/ szt.", opak: "/ opak." };

  return (
    <section className="snap-section wyroby-section" id="wyroby" ref={ref}>
      <div className={`section-inner ${visible ? "reveal-in" : ""}`}>
        <div className="section-header-row">
          <div>
            <div className="section-label">Sklep</div>
            <h2 className="section-title">Wyroby<br /><em>własne</em></h2>
          </div>
          <p className="wyroby-sub">
            Wszystko produkujemy na miejscu — tradycyjnymi metodami,
            bez ulepszaczy. Kupić można w recepcji pensjonatu.
          </p>
        </div>

        {loading ? (
          <div className="wyroby-skeleton">
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton-wyrob" />)}
          </div>
        ) : (
          <div className="wyroby-body">
            {kategorie.map((kat, ki) => (
              <div key={kat.id} className="wyrob-kategoria" style={{ animationDelay: `${ki * 0.1}s` }}>
                <h3 className="wyrob-kategoria__nazwa">{kat.nazwa}</h3>
                <div className="wyroby-grid">
                  {kat.wyroby.map((w, i) => (
                    <div
                      key={w.id}
                      className={`wyrob-card ${!w.dostepny ? "wyrob-card--niedostepny" : ""}`}
                      style={{ animationDelay: `${(ki * 3 + i) * 0.07}s` }}
                    >
                      <div className="wyrob-card__img-wrap">
                        {w.zdjecia && w.zdjecia.length > 0 ? (
                          <img
                            src={w.zdjecia[0].zdjecie}
                            alt={w.nazwa}
                            className="wyrob-card__img"
                          />
                        ) : (
                          <div className="wyrob-card__img-placeholder">🥩</div>
                        )}
                        {!w.dostepny && (
                          <div className="wyrob-card__overlay">Chwilowo<br />niedostępny</div>
                        )}
                      </div>
                      <div className="wyrob-card__body">
                        <h4 className="wyrob-card__nazwa">{w.nazwa}</h4>
                        <p className="wyrob-card__opis">{w.opis}</p>
                        <div className="wyrob-card__footer">
                          <span className="wyrob-card__cena">
                            {parseFloat(w.cena).toFixed(2)} zł
                            <span className="wyrob-jednostka"> {jednostkaLabel[w.jednostka] || `/${w.jednostka}`}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
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
          Zarezerwuj<br /><em>stolik lub salę</em>
        </h2>
        <p className="cta-sub">
          Zadzwoń lub napisz — przygotujemy stolik w wybranym terminie
          lub wycenimy organizację Twojego wydarzenia.
        </p>
        <div className="hero-btns" style={{ marginTop: "2.5rem" }}>
          <a href="/kontakt" className="btn-primary">Napisz do nas</a>
          <a href="tel:+48748369928" className="btn-ghost">+48 74 836 99 28</a>
        </div>
      </div>
    </section>
  );
}

// ─── MAIN ───
export default function Restauracja() {
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
        .btn-primary--sm { padding: .65rem 1.6rem; font-size: .72rem; }

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
        .btn-ghost--sm { padding: .65rem 1.6rem; font-size: .72rem; }

        /* ══ SKELETONS ══ */
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .skeleton-tab-pill, .skeleton-danie, .skeleton-card, .skeleton-wyrob {
          background: linear-gradient(90deg, #e2ddd6 25%, #ede9e2 50%, #e2ddd6 75%);
          background-size: 800px 100%;
          animation: shimmer 1.4s infinite;
          border-radius: 2px;
        }
        .skeleton-tabs-row { display: flex; gap: .75rem; margin-bottom: 2rem; }
        .skeleton-tab-pill { height: 38px; width: 110px; border-radius: 20px; }
        .skeleton-danie { height: 64px; margin-bottom: .5rem; }
        .skeleton-dania { display: flex; flex-direction: column; }
        .wyroby-skeleton { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
        .skeleton-wyrob { height: 220px; }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ══════════════════════════════
           1. HERO
        ══════════════════════════════ */
        .hero-section { background: var(--olive-deep); }

        .hero-bg {
          position: absolute; inset: 0;
          background:
            linear-gradient(160deg, rgba(26,29,21,.55) 0%, rgba(46,51,40,.8) 100%),
            url('/restauracja_background.png') center/cover no-repeat;
        }
        .hero-overlay {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 70% 40%, rgba(200,151,58,.1) 0%, transparent 65%);
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
          color: var(--white); margin-bottom: 1.5rem; margin-top: .5rem;
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
        @keyframes scrollPulse { 0%, 100% { opacity: .4; } 50% { opacity: 1; } }

        .menu-godziny-lista {
          display: flex; flex-wrap: wrap; gap: .4rem .75rem; margin-top: .25rem;
        }
        .menu-godz-dzien {
          display: flex; flex-direction: column; align-items: center;
          gap: .15rem;
        }
        .menu-godz-nazwa {
          font-family: 'DM Sans', sans-serif;
          font-size: .6rem; font-weight: 400; letter-spacing: .1em;
          text-transform: uppercase; color: var(--amber);
        }
        .menu-godz-czas {
          font-family: 'DM Sans', sans-serif;
          font-size: .72rem; font-weight: 300; color: var(--olive-light);
          white-space: nowrap;
        }
        .menu-godz-dzien--zamkniete .menu-godz-nazwa { color: var(--olive-light); opacity: .5; }
        .menu-godz-dzien--zamkniete .menu-godz-czas  { opacity: .4; }

        /* ══════════════════════════════
           2. MENU
        ══════════════════════════════ */
        .menu-section { background: var(--cream); }

        .menu-header {
          display: flex; align-items: flex-start;
          justify-content: space-between; flex-wrap: wrap;
          gap: 1.5rem; margin-bottom: 2.5rem;
        }
        .menu-godziny {
          font-family: 'DM Sans', sans-serif;
          font-size: .82rem; font-weight: 300; line-height: 1.6;
          color: var(--olive-light); text-align: right;
        }
        .menu-godziny strong {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.1rem; font-weight: 400; color: var(--olive-dark);
          display: block;
        }

        /* Filtry */
        .menu-filtry {
          display: flex; flex-wrap: wrap; gap: .6rem; margin-bottom: 2rem;
        }
        .menu-filtr {
          display: inline-flex; align-items: center; gap: .5rem;
          font-family: 'DM Sans', sans-serif;
          font-size: .75rem; font-weight: 400; letter-spacing: .08em;
          padding: .5rem 1.1rem;
          background: transparent; color: var(--olive-light);
          border: 1px solid rgba(74,82,64,.2); border-radius: 20px;
          cursor: pointer;
          transition: all .2s;
          animation: cardIn .4s ease both;
        }
        .menu-filtr:hover { background: rgba(74,82,64,.06); color: var(--olive-dark); }
        .menu-filtr--active {
          background: var(--olive);
          color: var(--white);
          border-color: var(--olive);
        }
        .menu-filtr__count {
          font-size: .65rem; font-weight: 300;
          background: rgba(255,255,255,.2);
          padding: .1rem .45rem; border-radius: 10px;
        }
        .menu-filtr--active .menu-filtr__count { background: rgba(255,255,255,.18); }

        /* Dania lista */
        .dania-lista { display: flex; flex-direction: column; }

        .danie-row {
          display: flex; align-items: flex-start;
          justify-content: space-between; gap: 1.5rem;
          padding: 1.1rem 0;
          border-bottom: 1px solid rgba(74,82,64,.1);
          animation: cardIn .4s ease both;
        }
        .danie-row:first-child { border-top: 1px solid rgba(74,82,64,.1); }

        .danie-row__left { flex: 1; }
        .danie-row__top { display: flex; align-items: center; gap: .6rem; margin-bottom: .3rem; }

        .danie-row__nazwa {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.15rem; font-weight: 400;
          color: var(--olive-dark);
        }
        .danie-row__opis {
          font-family: 'DM Sans', sans-serif;
          font-size: .8rem; font-weight: 300; line-height: 1.55;
          color: var(--olive-light);
        }
        .danie-row__cena {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.25rem; font-weight: 300;
          color: var(--olive); white-space: nowrap; flex-shrink: 0;
        }
        .cena-zl {
          font-family: 'DM Sans', sans-serif;
          font-size: .75rem; font-weight: 300; color: var(--olive-light);
        }

        /* Badges */
        .danie-row__badges { display: flex; gap: .3rem; }
        .badge {
          font-family: 'DM Sans', sans-serif;
          font-size: .58rem; font-weight: 500; letter-spacing: .05em;
          padding: .15rem .45rem; border-radius: 2px;
        }
        .badge--v  { background: rgba(100,180,80,.15); color: #5a9a48; border: 1px solid rgba(100,180,80,.25); }
        .badge--vg { background: rgba(60,160,60,.15);  color: #3a8a3a; border: 1px solid rgba(60,160,60,.25); }
        .badge--gf { background: rgba(200,151,58,.15); color: var(--amber); border: 1px solid rgba(200,151,58,.25); }

        .menu-legenda {
          display: flex; align-items: center; flex-wrap: wrap; gap: .5rem;
          margin-top: 1.5rem;
          font-family: 'DM Sans', sans-serif;
          font-size: .72rem; font-weight: 300;
          color: var(--olive-light);
        }
        .menu-legenda .badge { font-size: .58rem; }

        /* ══════════════════════════════
           3. SALE
        ══════════════════════════════ */
        .sale-section { background: var(--olive); }

        .sale-layout {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 5rem; align-items: center;
        }

        .sale-cards {
          display: flex; flex-direction: column; gap: 1rem;
        }

        .sala-card {
          display: grid;
          grid-template-columns: 160px 1fr;
          gap: 1.25rem;
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 2px;
          overflow: hidden;
          animation: cardIn .5s ease both;
          transition: background .25s, transform .25s;
        }
        .sala-card:hover { background: rgba(255,255,255,.1); transform: translateX(4px); }

        .sala-card__img-wrap {
          position: relative; overflow: hidden;
          background: rgba(255,255,255,.05);
        }
        .sala-card__img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform .4s;
        }
        .sala-card:hover .sala-card__img { transform: scale(1.05); }
        .sala-card__img-placeholder {
          width: 100%; height: 100%; min-height: 100px;
          display: flex; align-items: center; justify-content: center;
          font-size: 2.5rem;
          background: rgba(255,255,255,.04);
        }
        .sala-card__tag {
          position: absolute; top: .6rem; left: .6rem;
          background: var(--amber); color: var(--white);
          font-family: 'DM Sans', sans-serif;
          font-size: .58rem; letter-spacing: .12em; text-transform: uppercase;
          padding: .25rem .65rem; border-radius: 1px;
        }

        .sala-card__body {
          padding: 1.25rem 1.25rem 1.25rem 0;
          display: flex; flex-direction: column; gap: .4rem;
        }
        .sala-card__name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.2rem; font-weight: 400; color: var(--white);
        }
        .sala-card__opis {
          font-family: 'DM Sans', sans-serif;
          font-size: .78rem; font-weight: 300; line-height: 1.6;
          color: rgba(255,255,255,.45);
        }
        .sala-card__meta { display: flex; gap: .5rem; margin-top: .25rem; }
        .sala-meta-chip {
          font-family: 'DM Sans', sans-serif;
          font-size: .7rem; font-weight: 300;
          color: rgba(255,255,255,.5);
          background: rgba(255,255,255,.07);
          padding: .25rem .7rem; border-radius: 1px;
        }

        /* ══════════════════════════════
           4. WYROBY
        ══════════════════════════════ */
        .wyroby-section { background: var(--cream-dark); }

        .section-header-row {
          display: flex; align-items: flex-start;
          justify-content: space-between; flex-wrap: wrap;
          gap: 2rem; margin-bottom: 3rem;
        }
        .wyroby-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: .88rem; font-weight: 300; line-height: 1.75;
          color: var(--olive-light); max-width: 42ch;
          align-self: flex-end;
        }

        .wyrob-kategoria { margin-bottom: 2.5rem; animation: cardIn .5s ease both; }
        .wyrob-kategoria__nazwa {
          font-family: 'DM Sans', sans-serif;
          font-size: .68rem; font-weight: 400; letter-spacing: .25em;
          text-transform: uppercase; color: var(--amber);
          margin-bottom: 1.25rem;
          padding-bottom: .6rem;
          border-bottom: 1px solid rgba(74,82,64,.15);
        }

        .wyroby-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
        }

        .wyrob-card {
          background: var(--white);
          border: 1px solid rgba(74,82,64,.1);
          border-radius: 2px;
          overflow: hidden;
          animation: cardIn .4s ease both;
          transition: box-shadow .25s, transform .25s;
        }
        .wyrob-card:hover { box-shadow: 0 8px 30px rgba(74,82,64,.1); transform: translateY(-3px); }
        .wyrob-card--niedostepny { opacity: .55; pointer-events: none; }

        .wyrob-card__img-wrap {
          position: relative;
          aspect-ratio: 4/3;
          background: var(--cream);
          overflow: hidden;
        }
        .wyrob-card__img { width: 100%; height: 100%; object-fit: cover; }
        .wyrob-card__img-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          font-size: 2.5rem; color: var(--olive-light);
        }
        .wyrob-card__overlay {
          position: absolute; inset: 0;
          background: rgba(26,29,21,.65);
          display: flex; align-items: center; justify-content: center;
          font-family: 'DM Sans', sans-serif;
          font-size: .7rem; letter-spacing: .1em; text-transform: uppercase;
          color: rgba(255,255,255,.8); text-align: center; line-height: 1.4;
        }

        .wyrob-card__body { padding: 1.1rem; }
        .wyrob-card__nazwa {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.1rem; font-weight: 400;
          color: var(--olive-dark); margin-bottom: .3rem;
        }
        .wyrob-card__opis {
          font-family: 'DM Sans', sans-serif;
          font-size: .78rem; font-weight: 300; line-height: 1.55;
          color: var(--olive-light); margin-bottom: .75rem;
        }
        .wyrob-card__footer { display: flex; align-items: center; justify-content: space-between; }
        .wyrob-card__cena {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.15rem; font-weight: 400; color: var(--olive);
        }
        .wyrob-jednostka {
          font-family: 'DM Sans', sans-serif;
          font-size: .72rem; font-weight: 300; color: var(--olive-light);
        }

        /* ══════════════════════════════
           5. CTA
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
          color: rgba(255,255,255,.45); max-width: 45ch; margin: 0 auto;
        }

        /* ══ RESPONSIVE ══ */
        @media (max-width: 900px) {
          .sale-layout { grid-template-columns: 1fr; gap: 2.5rem; }
          .sala-card { grid-template-columns: 120px 1fr; }
          .wyroby-grid { grid-template-columns: repeat(2, 1fr); }
          .section-inner { padding: 4rem 1.5rem; }
        }
        @media (max-width: 600px) {
          .wyroby-grid { grid-template-columns: 1fr; }
          .menu-header { flex-direction: column; }
          .menu-godziny { text-align: left; }
          .hero-btns { flex-direction: column; align-items: center; }
          .sala-card { grid-template-columns: 1fr; }
          .sala-card__img-wrap { min-height: 160px; }
          .section-header-row { flex-direction: column; }
        }
      `}</style>

      <HeroSection />
      <MenuSection />
      <SaleSection />
      <WyrobySection />
      <CTASection />
    </>
  );
}
