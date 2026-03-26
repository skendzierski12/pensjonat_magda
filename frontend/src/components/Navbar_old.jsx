import { useState, useEffect, useCallback, useRef } from "react";

const NAV_LINKS = [
  { label: "O Nas", href: "/o-nas" },
  { label: "Oferta", href: "/oferta" },
  { label: "Restauracja", href: "/restauracja" },
  { label: "Atrakcje", href: "/atrakcje" },
  { label: "Cennik", href: "/cennik" },
  { label: "Galeria", href: "/galeria" },
  { label: "Kontakt", href: "/kontakt" },
];

const COLLAPSE_LINKS = [
  { label: "O Nas", href: "/o-nas" },
  { label: "Restauracja", href: "/restauracja" },
  { label: "Atrakcje", href: "/atrakcje" },
  { label: "Galeria", href: "/galeria" },
];

const ALWAYS_LINKS = [
  { label: "Oferta", href: "/oferta" },
  { label: "Cennik", href: "/cennik" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollRef = useRef(0);

  const handleScroll = useCallback(() => {
    const current = window.scrollY;
    const last = lastScrollRef.current;
    setScrolled(current > 60);
    setVisible(current < last || current < 80);
    lastScrollRef.current = current;
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const navClass = [
    "navbar",
    scrolled ? "scrolled" : "transparent",
    !visible ? "hidden" : "",
  ].filter(Boolean).join(" ");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        :root {
          --olive-dark: #2e3328;
          --amber: #c8973a;
          --amber-light: #e8b85a;
          --cream: #f5f0e8;
          --olive-light: #6b7560;
          --white: #ffffff;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: var(--cream); }

        /* NAVBAR */
        .navbar {
          position: fixed; top: 0; left: 0; right: 0;
          z-index: 1000; height: 80px;
          display: flex; align-items: center;
          padding: 0 2.5rem;
          transition:
            background .5s ease,
            box-shadow .5s ease,
            height .45s cubic-bezier(.4,0,.2,1),
            transform .4s cubic-bezier(.4,0,.2,1);
        }
        .navbar.hidden { transform: translateY(-100%); }
        .navbar.transparent { background: transparent; }
        .navbar.scrolled {
          height: 60px;
          background: rgba(18,22,14,.94);
          backdrop-filter: blur(18px) saturate(180%);
          box-shadow: 0 2px 40px rgba(0,0,0,.32);
        }

        .navbar-inner {
          width: 100%; max-width: 1400px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
        }

        /* LOGO */
        .logo { display: flex; align-items: center; text-decoration: none; position: relative; height: 52px; }

        .logo-img {
          height: 48px;
          width: auto;
          max-width: 220px;
          object-fit: contain;
          object-position: left center;
          position: absolute;
          left: 0; top: 50%;
          filter: drop-shadow(0 1px 6px rgba(0,0,0,.25));
          transition: opacity .4s ease, transform .45s cubic-bezier(.4,0,.2,1);
        }

        /* Pełne logo — widoczne domyślnie, chowa się po scroll */
        .logo-img--full {
          opacity: 1;
          transform: translateY(-50%) scale(1);
        }
        .navbar.scrolled .logo-img--full {
          opacity: 0;
          transform: translateY(-50%) scale(.92) translateX(-6px);
          pointer-events: none;
        }

        /* Kompaktowe logo — ukryte domyślnie, pojawia się po scroll */
        .logo-img--compact {
          height: 36px;
          opacity: 0;
          transform: translateY(-50%) scale(.88) translateX(6px);
          pointer-events: none;
        }
        .navbar.scrolled .logo-img--compact {
          opacity: 1;
          transform: translateY(-50%) scale(1);
          pointer-events: auto;
        }

        /* Spacer trzyma szerokość miejsca na logo */
        .logo::after {
          content: '';
          display: inline-block;
          height: 48px;
          width: 200px; /* dopasuj do szerokości logo.png */
          transition: width .45s cubic-bezier(.4,0,.2,1);
        }
        .navbar.scrolled .logo::after { width: 52px; /* dopasuj do logo_m.png */ }


        /* NAV LINKS */
        .nav-links { display: flex; align-items: center; list-style: none; }

        .nav-link-item {
          overflow: hidden; max-width: 130px;
          transition: max-width .45s cubic-bezier(.4,0,.2,1), opacity .3s;
        }
        .navbar.scrolled .nav-link-item.collapse { max-width: 0; opacity: 0; pointer-events: none; }

        .nav-link-item a {
          font-family: 'DM Sans', sans-serif; font-weight: 300;
          font-size: .79rem; letter-spacing: .12em; text-transform: uppercase;
          color: rgba(255,255,255,.78); text-decoration: none;
          padding: .5rem .85rem; display: block; white-space: nowrap;
          position: relative; transition: color .25s;
        }
        .nav-link-item a::after {
          content: ''; position: absolute;
          bottom: 2px; left: .85rem; right: .85rem;
          height: 1px; background: var(--amber);
          transform: scaleX(0); transform-origin: left;
          transition: transform .3s;
        }
        .nav-link-item a:hover { color: var(--white); }
        .nav-link-item a:hover::after { transform: scaleX(1); }

        /* CTA */
        .nav-cta-wrap { margin-left: .6rem; flex-shrink: 0; }
        .nav-cta {
          font-family: 'DM Sans', sans-serif; font-weight: 500;
          font-size: .75rem; letter-spacing: .18em; text-transform: uppercase;
          color: var(--olive-dark); background: var(--amber);
          padding: .6rem 1.4rem; border-radius: 1px;
          text-decoration: none; white-space: nowrap;
          transition: background .25s, transform .2s, padding .4s;
          display: block;
        }
        .navbar.scrolled .nav-cta { padding: .6rem 1.9rem; }
        .nav-cta:hover { background: var(--amber-light); transform: translateY(-1px); }

        /* HAMBURGER */
        .hamburger {
          display: none; flex-direction: column; justify-content: center;
          gap: 5px; width: 44px; height: 44px; padding: 10px;
          cursor: pointer; background: none; border: none; z-index: 1100;
        }
        .hamburger span {
          display: block; width: 100%; height: 1.5px; background: var(--white);
          border-radius: 2px; transform-origin: center;
          transition: transform .4s cubic-bezier(.4,0,.2,1), opacity .3s;
        }
        .hamburger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
        .hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .hamburger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

        /* FULLSCREEN MENU */
        .burger-overlay { position: fixed; inset: 0; z-index: 900; pointer-events: none; }
        .burger-bg {
          position: absolute; inset: 0; background: var(--olive-dark);
          transform: scaleY(0); transform-origin: top;
          transition: transform .6s cubic-bezier(.77,0,.175,1);
        }
        .burger-overlay.open .burger-bg { transform: scaleY(1); pointer-events: all; }

        .burger-content {
          position: relative; z-index: 10; width: 100%; height: 100%;
          display: flex; flex-direction: column;
          padding: 110px 2.5rem 3rem;
          opacity: 0; transform: translateY(20px);
          transition: opacity .4s .3s, transform .4s .3s;
          overflow-y: auto;
        }
        .burger-overlay.open .burger-content { opacity: 1; transform: translateY(0); pointer-events: all; }

        .burger-nav { list-style: none; max-width: 600px; margin: 0 auto; width: 100%; }
        .burger-nav li { border-bottom: 1px solid rgba(255,255,255,.08); }
        .burger-nav li:first-child { border-top: 1px solid rgba(255,255,255,.08); }
        .burger-nav a {
          display: flex; align-items: center; justify-content: space-between;
          font-family: 'Cormorant Garamond', serif; font-weight: 300;
          font-size: clamp(1.8rem, 5vw, 3.2rem);
          color: rgba(255,255,255,.85); text-decoration: none;
          padding: .9rem 0; letter-spacing: .03em;
          transition: color .25s, padding-left .3s;
        }
        .burger-nav a:hover { color: var(--amber); padding-left: .8rem; }
        .burger-nav a .arr { font-size: .7em; opacity: 0; transform: translateX(-10px); transition: opacity .25s, transform .25s; }
        .burger-nav a:hover .arr { opacity: 1; transform: translateX(0); }

        .burger-footer {
          max-width: 600px; margin: 2.5rem auto 0; width: 100%;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 1.5rem;
        }
        .burger-contact p { font-family: 'DM Sans', sans-serif; font-size: .7rem; letter-spacing: .15em; text-transform: uppercase; color: rgba(255,255,255,.35); margin-bottom: .4rem; }
        .burger-contact a { font-family: 'Cormorant Garamond', serif; font-size: 1.2rem; color: var(--amber); text-decoration: none; }
        .burger-cta {
          font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: .78rem;
          letter-spacing: .2em; text-transform: uppercase;
          color: var(--olive-dark); background: var(--amber);
          padding: .9rem 2rem; border-radius: 1px; text-decoration: none;
          transition: background .25s, transform .2s; display: inline-block;
        }
        .burger-cta:hover { background: var(--amber-light); transform: translateY(-2px); }

        /* DEMO */
        .demo-hero {
          height: 100vh;
          background:
            linear-gradient(
              to bottom,
              rgba(20,24,16,.45) 0%,
              rgba(20,24,16,.25) 40%,
              rgba(20,24,16,.55) 100%
            ),
            url('/home_background.png') center center / cover no-repeat;
          /* Lekkie wyszarzenie + przyciemnienie przez filter na pseudo-elemencie */
          display: flex; align-items: center; justify-content: center;
          text-align: center; padding: 2rem; position: relative; overflow: hidden;
        }
        /* Wyszarzenie zdjęcia — saturate zmniejszone, delikatny szary overlay */
        .demo-hero::before {
          content: ''; position: absolute; inset: 0;
          background: rgba(30,34,26,.18);
          backdrop-filter: saturate(60%) brightness(0.88);
          z-index: 0;
        }
        .demo-content { position: relative; z-index: 1; }
        .scroll-hint { z-index: 1; }
        .demo-eyebrow { font-family: 'DM Sans',sans-serif; font-size: .68rem; letter-spacing: .38em; text-transform: uppercase; color: var(--amber); margin-bottom: 1.5rem; }
        .demo-title { font-family: 'Cormorant Garamond',serif; font-weight: 300; font-size: clamp(2.8rem,7vw,6rem); color: var(--white); line-height: 1.05; margin-bottom: 2rem; }
        .demo-title em { font-style: italic; color: var(--amber); }
        .demo-sub { font-family: 'DM Sans',sans-serif; font-weight: 300; font-size: 1rem; color: rgba(255,255,255,.5); max-width: 480px; margin: 0 auto 3rem; line-height: 1.75; }
        .demo-btns { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
        .btn-p { font-family: 'DM Sans',sans-serif; font-weight: 500; font-size: .78rem; letter-spacing: .2em; text-transform: uppercase; color: var(--olive-dark); background: var(--amber); padding: 1rem 2.5rem; border-radius: 1px; text-decoration: none; display: inline-block; transition: background .25s, transform .2s; }
        .btn-p:hover { background: var(--amber-light); transform: translateY(-2px); }
        .btn-g { font-family: 'DM Sans',sans-serif; font-weight: 300; font-size: .78rem; letter-spacing: .2em; text-transform: uppercase; color: rgba(255,255,255,.65); border: 1px solid rgba(255,255,255,.2); padding: 1rem 2.5rem; border-radius: 1px; text-decoration: none; display: inline-block; transition: border-color .25s, color .25s; }
        .btn-g:hover { border-color: var(--amber); color: var(--amber); }

        .scroll-hint { z-index: 1; position: absolute; bottom: 2.5rem; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: .5rem; color: rgba(255,255,255,.35); font-family: 'DM Sans',sans-serif; font-size: .62rem; letter-spacing: .22em; text-transform: uppercase; animation: pulse 2.5s ease-in-out infinite; }
        .scroll-line { width: 1px; height: 36px; background: linear-gradient(to bottom,transparent,rgba(200,151,58,.65)); animation: lineG 2.5s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{opacity:.35} 50%{opacity:.8} }
        @keyframes lineG { 0%{transform:scaleY(0);transform-origin:top} 50%{transform:scaleY(1);transform-origin:top} 51%{transform:scaleY(1);transform-origin:bottom} 100%{transform:scaleY(0);transform-origin:bottom} }

        .demo-sect { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--cream); padding: 6rem 2rem; text-align: center; }
        .demo-sect h2 { font-family: 'Cormorant Garamond',serif; font-weight: 300; font-size: 2.2rem; color: var(--olive-dark); margin-bottom: 1rem; }
        .demo-sect p { font-family: 'DM Sans',sans-serif; color: var(--olive-light); font-size: .9rem; line-height: 1.65; }

        @media (max-width: 900px) {
          .nav-links, .nav-cta-wrap { display: none; }
          .hamburger { display: flex; }
        }
        @media (max-width: 480px) {
          .navbar { padding: 0 1.5rem; }
          .burger-content { padding: 100px 1.5rem 3rem; }
        }
      `}</style>

      <nav className={navClass}>
        <div className="navbar-inner">

          <a href="/" className="logo">
            {/* logo.png — pełne logo widoczne na górze */}
            <img
              src="/logo.png"
              alt="Pensjonat Magda"
              className="logo-img logo-img--full"
            />
            {/* logo_m.png — zwięzłe logo widoczne po zescrollowaniu */}
            <img
              src="/logo_m.png"
              alt="Pensjonat Magda"
              className="logo-img logo-img--compact"
            />
          </a>

          <ul className="nav-links">
            {COLLAPSE_LINKS.map(({ label, href }) => (
              <li key={href} className="nav-link-item collapse">
                <a href={href}>{label}</a>
              </li>
            ))}
            {ALWAYS_LINKS.map(({ label, href }) => (
              <li key={href} className="nav-link-item">
                <a href={href}>{label}</a>
              </li>
            ))}
          </ul>

          <div className="nav-cta-wrap">
            <a href="/kontakt" className="nav-cta">Rezerwuj</a>
          </div>

          <button
            className={`hamburger ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Zamknij menu" : "Otwórz menu"}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <div className={`burger-overlay ${menuOpen ? "open" : ""}`}>
        <div className="burger-bg" />
        <div className="burger-content">
          <ul className="burger-nav">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <a href={href} onClick={() => setMenuOpen(false)}>
                  {label}<span className="arr">→</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="burger-footer">
            <div className="burger-contact">
              <p>Zadzwoń do nas</p>
              <a href="tel:+48123456789">+48 123 456 789</a>
            </div>
            <a href="/kontakt" className="burger-cta" onClick={() => setMenuOpen(false)}>
              Zarezerwuj pobyt
            </a>
          </div>
        </div>
      </div>

      <section className="demo-hero">
        <div className="demo-content">
          <p className="demo-eyebrow">Tatry · Beskidy · Cisza</p>
          <h1 className="demo-title">Odkryj spokój<br /><em>górskich przestrzeni</em></h1>
          <p className="demo-sub">Pensjonat Magda — miejsce, gdzie czas zwalnia, a smak domowej kuchni zostaje w pamięci na długo.</p>
          <div className="demo-btns">
            <a href="/oferta" className="btn-p">Sprawdź Ofertę</a>
            <a href="/galeria" className="btn-g">Galeria</a>
          </div>
        </div>
        <div className="scroll-hint">
          <div className="scroll-line" />
          Przewiń
        </div>
      </section>

      <section className="demo-sect">
        <div>
          <h2>Tutaj treść strony</h2>
          <p>Wróć na górę i zacznij scrollować.<br />
          Logo zwija się do ikony, środkowe linki znikają,<br />
          Navbar staje się kompaktowy i skupiony.</p>
        </div>
      </section>
    </>
  );
}
