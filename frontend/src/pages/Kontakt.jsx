import { useState, useRef, useEffect } from "react";
import WeatherWidget from '../components/WeatherWidget';
import axios from "axios";

const API = "http://localhost:8000/api";

function useReveal(threshold = 0.1) {
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

export default function Kontakt() {
  const [form, setForm] = useState({ imie: "", email: "", temat: "", wiadomosc: "" });
  const [status, setStatus] = useState(null); // null | 'sending' | 'ok' | 'err'
  const [heroRef, heroVisible] = useReveal(0.1);
  const [formRef, formVisible] = useReveal(0.1);

  const handleChange = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setStatus("sending");
    try {
      await axios.post(`${API}/core/kontakt/`, form);
      setStatus("ok");
      setForm({ imie: "", email: "", temat: "", wiadomosc: "" });
    } catch {
      setStatus("err");
    }
  };

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

        .reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity .8s ease, transform .8s cubic-bezier(.4,0,.2,1);
        }
        .reveal.in { opacity: 1; transform: translateY(0); }

        /* ══ HERO ══ */
        .kontakt-hero {
          min-height: 48vh;
          background:
            linear-gradient(170deg, rgba(20,24,16,.72) 0%, rgba(46,51,40,.55) 100%),
            url('/home_background.png') center 40% / cover no-repeat;
          display: flex;
          align-items: flex-end;
          padding: 0 2.5rem 5rem;
          position: relative;
          overflow: hidden;
        }

        .kontakt-hero::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 120px;
          background: linear-gradient(to bottom, transparent, var(--cream));
        }

        .kontakt-hero__content {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
        }

        .kontakt-hero__eyebrow {
          font-family: 'DM Sans', sans-serif;
          font-size: .68rem;
          letter-spacing: .38em;
          text-transform: uppercase;
          color: var(--amber);
          margin-bottom: 1rem;
          display: block;
        }

        .kontakt-hero__title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: clamp(2.8rem, 7vw, 6rem);
          color: var(--white);
          line-height: 1.02;
        }

        .kontakt-hero__title em { font-style: italic; color: var(--amber); }

        /* ══ MAIN ══ */
        .kontakt-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 5rem 2.5rem 6rem;
        }

        .kontakt-layout {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 6rem;
          align-items: start;
        }

        /* ══ INFO ══ */
        .kontakt-info__label {
          font-family: 'DM Sans', sans-serif;
          font-size: .68rem;
          letter-spacing: .35em;
          text-transform: uppercase;
          color: var(--amber);
          margin-bottom: 1.5rem;
          display: block;
        }

        .kontakt-info__title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: clamp(1.8rem, 3vw, 2.6rem);
          color: var(--olive-dark);
          line-height: 1.1;
          margin-bottom: 2.5rem;
        }

        .kontakt-info__title em { font-style: italic; color: var(--amber); }

        .kontakt-info__desc {
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
          font-size: .9rem;
          line-height: 1.8;
          color: var(--olive-light);
          margin-bottom: 3rem;
        }

        .kontakt-items {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        .kontakt-item {
          display: flex;
          align-items: flex-start;
          gap: 1.25rem;
        }

        .kontakt-item__icon {
          width: 44px; height: 44px;
          background: rgba(200,151,58,.1);
          border: 1px solid rgba(200,151,58,.25);
          border-radius: 1px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem;
          flex-shrink: 0;
        }

        .kontakt-item__label {
          font-family: 'DM Sans', sans-serif;
          font-size: .62rem;
          letter-spacing: .2em;
          text-transform: uppercase;
          color: var(--amber);
          margin-bottom: .3rem;
          display: block;
        }

        .kontakt-item__val {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.1rem;
          color: var(--olive-dark);
          text-decoration: none;
          display: block;
          transition: color .25s;
        }

        a.kontakt-item__val:hover { color: var(--amber); }

        .kontakt-item__sub {
          font-family: 'DM Sans', sans-serif;
          font-size: .78rem;
          font-weight: 300;
          color: var(--olive-light);
          margin-top: .2rem;
          display: block;
        }

        /* ══ FORM ══ */
        .kontakt-form-wrap {
          background: var(--white);
          border-radius: 2px;
          padding: 3rem;
          box-shadow: 0 8px 48px rgba(0,0,0,.07);
          border: 1px solid rgba(74,82,64,.08);
        }

        .kontakt-form-title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: 1.6rem;
          color: var(--olive-dark);
          margin-bottom: .5rem;
        }

        .kontakt-form-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: .8rem;
          font-weight: 300;
          color: var(--olive-light);
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .kontakt-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        .kontakt-form label {
          display: flex;
          flex-direction: column;
          gap: .5rem;
        }

        .kontakt-form label span {
          font-family: 'DM Sans', sans-serif;
          font-size: .62rem;
          letter-spacing: .2em;
          text-transform: uppercase;
          color: var(--olive-light);
        }

        .kontakt-form input,
        .kontakt-form textarea {
          font-family: 'DM Sans', sans-serif;
          font-size: .9rem;
          font-weight: 300;
          color: var(--olive-dark);
          background: var(--cream);
          border: 1px solid rgba(74,82,64,.15);
          border-radius: 1px;
          padding: .85rem 1rem;
          outline: none;
          transition: border-color .25s, background .25s;
          resize: vertical;
          width: 100%;
        }

        .kontakt-form input::placeholder,
        .kontakt-form textarea::placeholder {
          color: rgba(74,82,64,.3);
        }

        .kontakt-form input:focus,
        .kontakt-form textarea:focus {
          border-color: var(--amber);
          background: var(--white);
        }

        .btn-submit {
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          font-size: .78rem;
          letter-spacing: .2em;
          text-transform: uppercase;
          color: var(--olive-dark);
          background: var(--amber);
          padding: 1rem 2.4rem;
          border-radius: 1px;
          border: none;
          cursor: pointer;
          transition: background .25s, transform .2s;
          align-self: flex-start;
        }
        .btn-submit:hover { background: var(--amber-light); transform: translateY(-2px); }
        .btn-submit:disabled { opacity: .6; cursor: not-allowed; transform: none; }

        /* ══ SUCCESS / ERROR ══ */
        .form-success, .form-error {
          text-align: center;
          padding: 3rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .form-success__icon {
          width: 60px; height: 60px;
          background: rgba(200,151,58,.1);
          border: 1px solid var(--amber);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.5rem; color: var(--amber);
        }

        .form-error__icon {
          width: 60px; height: 60px;
          background: rgba(200,80,60,.08);
          border: 1px solid rgba(200,80,60,.3);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.5rem;
        }

        .form-success h3, .form-error h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.6rem;
          font-weight: 300;
          color: var(--olive-dark);
        }

        .form-success p, .form-error p {
          font-family: 'DM Sans', sans-serif;
          font-size: .85rem;
          color: var(--olive-light);
          line-height: 1.6;
        }

        .btn-retry {
          font-family: 'DM Sans', sans-serif;
          font-weight: 300;
          font-size: .75rem;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: var(--olive);
          border: 1px solid rgba(74,82,64,.25);
          padding: .7rem 1.6rem;
          border-radius: 1px;
          background: none;
          cursor: pointer;
          transition: border-color .25s, color .25s;
          margin-top: .5rem;
        }
        .btn-retry:hover { border-color: var(--amber); color: var(--amber); }

        /* ══ MAPA / DOJAZD ══ */
        .kontakt-dojazd {
          background: var(--olive-dark);
          padding: 5rem 2.5rem;
        }

        .kontakt-dojazd__inner {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 5rem;
          align-items: center;
        }

        .kontakt-dojazd__label {
          font-family: 'DM Sans', sans-serif;
          font-size: .68rem;
          letter-spacing: .35em;
          text-transform: uppercase;
          color: var(--amber);
          margin-bottom: 1.5rem;
          display: block;
        }

        .kontakt-dojazd__title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: clamp(1.8rem, 3vw, 2.6rem);
          color: var(--white);
          line-height: 1.1;
          margin-bottom: 2rem;
        }

        .kontakt-dojazd__title em { font-style: italic; color: var(--amber); }

        .dojazd-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .dojazd-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.25rem;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 1px;
        }

        .dojazd-item__from {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1rem;
          color: var(--white);
          flex: 1;
        }

        .dojazd-item__dist {
          font-family: 'DM Sans', sans-serif;
          font-size: .75rem;
          font-weight: 300;
          color: var(--amber);
          letter-spacing: .08em;
          white-space: nowrap;
        }

        .kontakt-map {
          aspect-ratio: 4/3;
          border-radius: 2px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.08);
        }

        .kontakt-map iframe {
          width: 100%;
          height: 100%;
          border: none;
          filter: grayscale(30%) contrast(90%);
        }

        /* ══ RESPONSIVE ══ */
        @media (max-width: 900px) {
          .kontakt-layout { grid-template-columns: 1fr; gap: 3rem; }
          .kontakt-dojazd__inner { grid-template-columns: 1fr; gap: 3rem; }
          .form-row { grid-template-columns: 1fr; }
          .kontakt-main { padding: 3rem 1.5rem 4rem; }
          .kontakt-dojazd { padding: 3rem 1.5rem; }
        }

        @media (max-width: 480px) {
          .kontakt-hero { padding: 0 1.5rem 4rem; }
          .kontakt-form-wrap { padding: 2rem 1.5rem; }
        }
      `}</style>

      {/* ══ HERO ══ */}
      <section className="kontakt-hero" ref={heroRef}>
        <div className={`kontakt-hero__content reveal ${heroVisible ? "in" : ""}`}>
          <span className="kontakt-hero__eyebrow">Pensjonat Magda · Lasocin</span>
          <h1 className="kontakt-hero__title">
            Skontaktuj się<br />
            <em>z nami</em>
          </h1>
        </div>
      </section>

      {/* ══ GŁÓWNA TREŚĆ ══ */}
      <div className="kontakt-main" ref={formRef}>
        <div className={`kontakt-layout reveal ${formVisible ? "in" : ""}`}>

          {/* Dane kontaktowe */}
          <div className="kontakt-info">
            <span className="kontakt-info__label">Dane kontaktowe</span>
            <h2 className="kontakt-info__title">
              Jesteśmy<br /><em>do dyspozycji</em>
            </h2>
            <p className="kontakt-info__desc">
              Chętnie odpowiemy na wszelkie pytania dotyczące oferty,
              dostępności pokoi czy organizacji pobytów grupowych.
            </p>

            <div className="kontakt-items">
              <div className="kontakt-item">
                <div className="kontakt-item__icon">📞</div>
                <div>
                  <span className="kontakt-item__label">Telefon</span>
                  <a href="tel:+48123456789" className="kontakt-item__val">+48 123 456 789</a>
                  <span className="kontakt-item__sub">Pon–Nd, 8:00–20:00</span>
                </div>
              </div>

              <div className="kontakt-item">
                <div className="kontakt-item__icon">✉️</div>
                <div>
                  <span className="kontakt-item__label">E-mail</span>
                  <a href="mailto:magda@pensjonat.pl" className="kontakt-item__val">magda@pensjonat.pl</a>
                  <span className="kontakt-item__sub">Odpowiadamy w ciągu 24h</span>
                </div>
              </div>

              <div className="kontakt-item">
                <div className="kontakt-item__icon">📍</div>
                <div>
                  <span className="kontakt-item__label">Adres</span>
                  <span className="kontakt-item__val">Lasocin, Góry Sowie</span>
                  <span className="kontakt-item__sub">58-320 Walim, dolnośląskie</span>
                </div>
              </div>
            </div>
          </div>

          {/* Formularz */}
          <div className="kontakt-form-wrap">
            {status === "ok" ? (
              <div className="form-success">
                <div className="form-success__icon">✓</div>
                <h3>Wiadomość wysłana!</h3>
                <p>Dziękujemy za kontakt. Odezwiemy się najszybciej jak to możliwe.</p>
                <button className="btn-retry" onClick={() => setStatus(null)}>
                  Wyślij kolejną
                </button>
              </div>
            ) : status === "err" ? (
              <div className="form-error">
                <div className="form-error__icon">✗</div>
                <h3>Coś poszło nie tak</h3>
                <p>Spróbuj ponownie lub skontaktuj się telefonicznie.</p>
                <button className="btn-retry" onClick={() => setStatus(null)}>
                  Spróbuj ponownie
                </button>
              </div>
            ) : (
              <>
                <h3 className="kontakt-form-title">Napisz do nas</h3>
                <p className="kontakt-form-sub">
                  Pytanie o rezerwację, dostępność lub ofertę grupową?
                  Wypełnij formularz — odpiszemy szybko.
                </p>
                <form className="kontakt-form" onSubmit={handleSubmit}>
                  <div className="form-row">
                    <label>
                      <span>Imię i nazwisko</span>
                      <input
                        name="imie"
                        value={form.imie}
                        onChange={handleChange}
                        placeholder="Jan Kowalski"
                        required
                      />
                    </label>
                    <label>
                      <span>E-mail</span>
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="jan@example.com"
                        required
                      />
                    </label>
                  </div>
                  <label>
                    <span>Temat</span>
                    <input
                      name="temat"
                      type="text"
                      value={form.temat}
                      onChange={handleChange}
                      placeholder="W sprawie rezerwacji..."
                      required
                    />
                  </label>
                  <label>
                    <span>Wiadomość</span>
                    <textarea
                      name="wiadomosc"
                      value={form.wiadomosc}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Chciałbym zapytać o dostępność w sierpniu..."
                      required
                    />
                  </label>
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={status === "sending"}
                  >
                    {status === "sending" ? "Wysyłanie..." : "Wyślij wiadomość"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ══ DOJAZD ══ */}
      <section className="kontakt-dojazd">                                                                                                                                                                                                  
        <div className="kontakt-dojazd__inner">                                                                                                                                                                                             
          <div>                                                                                                                                                                                                                             
            <span className="kontakt-dojazd__label">Dojazd</span>                                                                                                                                                                           
            <h2 className="kontakt-dojazd__title">                                                                                                                                                                                          
              Jak do nas<br /><em>dojechać</em>                                                                                                                                                                                             
            </h2>                                                                                                                                                                                                                           
            <div className="dojazd-list">                                                                                                                                                                                                   
              {[                                                                                                                                                                                                                            
                { from: "Wrocław", dist: "65 km · ~55 min" },                                                                                                                                                                               
                { from: "Dzierżoniów", dist: "10 km · ~12 min" },                                                                                                                                                                           
                { from: "Świdnica", dist: "22 km · ~25 min" },                                                                                                                                                                              
                { from: "Wałbrzych", dist: "18 km · ~20 min" },                                                                                                                                                                             
              ].map((d, i) => (                                                                                                                                                                                                             
                <div key={i} className="dojazd-item">                                                                                                                                                                                       
                  <span className="dojazd-item__from">📍 {d.from}</span>                                                                                                                                                                    
                  <span className="dojazd-item__dist">{d.dist}</span>                                                                                                                                                                       
                </div>                                                                                                                                                                                                                      
              ))}                                                                                                                                                                                                                           
            </div>
	        <div className="dojazd-pogoda">        {/* ← DODAJ */}
        <WeatherWidget />
      </div>
      		</div>


                                                                                                                                                                                                                                            
          <div className="kontakt-map">                                                                                                                                                                                                     
            <iframe                                                                                                                                                                                                                         
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2522.5!2d16.48!3d50.67!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTDCsDQwJzEyLjAiTiAxNsKwMjgnNDguMCJF!5e0!3m2!1spl!2spl!4v1234567890"          
              allowFullScreen=""                                                                                                                                                                                                            
              loading="lazy"                                                                                                                                                                                                                
              title="Lokalizacja Pensjonat Magda"                                                                                                                                                                                           
            />                                                                                                                                                                                                                              
          </div>                                                                                                                                                                                                                            
        </div>                                                                                                                                                                                                                              
      </section>
	  </>
  );
}
