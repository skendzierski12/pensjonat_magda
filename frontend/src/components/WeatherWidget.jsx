import { useState, useEffect } from "react";

// Open-Meteo — bez klucza API, całkowicie darmowe
const LAT = 50.726;
const LON = 16.542;

const WMO_IKONY = {
  0:  { ikona: "☀️",  opis: "Bezchmurnie" },
  1:  { ikona: "🌤️", opis: "Przeważnie pogodnie" },
  2:  { ikona: "⛅",  opis: "Częściowe zachmurzenie" },
  3:  { ikona: "☁️",  opis: "Pochmurno" },
  45: { ikona: "🌫️", opis: "Mgła" },
  48: { ikona: "🌫️", opis: "Mgła szronowa" },
  51: { ikona: "🌦️", opis: "Mżawka" },
  53: { ikona: "🌦️", opis: "Mżawka" },
  55: { ikona: "🌧️", opis: "Silna mżawka" },
  61: { ikona: "🌧️", opis: "Lekki deszcz" },
  63: { ikona: "🌧️", opis: "Deszcz" },
  65: { ikona: "🌧️", opis: "Ulewny deszcz" },
  71: { ikona: "🌨️", opis: "Lekki śnieg" },
  73: { ikona: "❄️",  opis: "Śnieg" },
  75: { ikona: "❄️",  opis: "Intensywny śnieg" },
  77: { ikona: "🌨️", opis: "Ziarnisty śnieg" },
  80: { ikona: "🌦️", opis: "Przelotne opady" },
  81: { ikona: "🌧️", opis: "Przelotny deszcz" },
  82: { ikona: "⛈️",  opis: "Gwałtowny deszcz" },
  85: { ikona: "🌨️", opis: "Przelotny śnieg" },
  86: { ikona: "❄️",  opis: "Intensywny śnieg" },
  95: { ikona: "⛈️",  opis: "Burza" },
  96: { ikona: "⛈️",  opis: "Burza z gradem" },
  99: { ikona: "⛈️",  opis: "Silna burza z gradem" },
};

const getDzienTygodnia = (dateStr) => {
  const dni = ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"];
  return dni[new Date(dateStr).getDay()];
};

export default function WeatherWidget() {
  const [pogoda,  setPogoda]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [blad,    setBlad]    = useState(false);

  useEffect(() => {
    const pobierz = async () => {
      try {
        const url = [
          "https://api.open-meteo.com/v1/forecast",
          `?latitude=${LAT}&longitude=${LON}`,
          "&current=temperature_2m,weathercode,windspeed_10m,relativehumidity_2m",
          "&daily=weathercode,temperature_2m_max,temperature_2m_min",
          "&timezone=Europe%2FWarsaw",
          "&forecast_days=5",
        ].join("");

        const res  = await fetch(url);
        const data = await res.json();

        setPogoda({
          teraz: {
            temp:      Math.round(data.current.temperature_2m),
            kod:       data.current.weathercode,
            wiatr:     Math.round(data.current.windspeed_10m),
            wilgotnosc: data.current.relativehumidity_2m,
          },
          prognoza: data.daily.time.slice(0, 5).map((dzien, i) => ({
            dzien,
            kod:     data.daily.weathercode[i],
            max:     Math.round(data.daily.temperature_2m_max[i]),
            min:     Math.round(data.daily.temperature_2m_min[i]),
          })),
        });
      } catch {
        setBlad(true);
      } finally {
        setLoading(false);
      }
    };

    pobierz();
  }, []);

  if (loading) return (
    <div className="weather-widget weather-widget--loading">
      <div className="weather-skeleton" />
    </div>
  );

  if (blad || !pogoda) return null;
  const terazMeta = WMO_IKONY[pogoda.teraz.kod] || { ikona: "🌡️", opis: "Brak danych" };

  return (
    <>
      <style>{STYLES}</style>
      <div className="weather-widget">
        {/* AKTUALNIE */}
        <div className="weather-teraz">
          <div className="weather-teraz__left">
            <div className="weather-ikona">{terazMeta.ikona}</div>
            <div>
              <div className="weather-temp">{pogoda.teraz.temp}°C</div>
              <div className="weather-opis">{terazMeta.opis}</div>
              <div className="weather-lokalizacja">Lasocin · {Math.round(500)} m n.p.m.</div>
            </div>
          </div>
          <div className="weather-teraz__right">
            <div className="weather-detail">
              <span className="weather-detail__ikona">💨</span>
              <span>{pogoda.teraz.wiatr} km/h</span>
            </div>
            <div className="weather-detail">
              <span className="weather-detail__ikona">💧</span>
              <span>{pogoda.teraz.wilgotnosc}%</span>
            </div>
          </div>
        </div>

        {/* PROGNOZA 5 DNI */}
        <div className="weather-prognoza">
          {pogoda.prognoza.map((d, i) => {
            const meta = WMO_IKONY[d.kod] || { ikona: "🌡️" };
            return (
              <div key={d.dzien} className={`weather-dzien ${i === 0 ? "weather-dzien--dzisiaj" : ""}`}>
                <div className="weather-dzien__nazwa">
                  {i === 0 ? "Dziś" : getDzienTygodnia(d.dzien)}
                </div>
                <div className="weather-dzien__ikona">{meta.ikona}</div>
                <div className="weather-dzien__temp">
                  <span className="weather-dzien__max">{d.max}°</span>
                  <span className="weather-dzien__min">{d.min}°</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="weather-source">Dane: Open-Meteo.com</div>
      </div>
    </>
  );
}

const STYLES = `
  .weather-widget {
    background: rgba(255,255,255,.08);
    border: 1px solid rgba(255,255,255,.12);
    border-radius: 2px;
    backdrop-filter: blur(12px);
    padding: 1.25rem 1.5rem;
    min-width: 280px;
    max-width: 380px;
  }

  .weather-widget--loading {
    min-height: 120px; display: flex; align-items: center; justify-content: center;
  }
  .weather-skeleton {
    width: 100%; height: 80px; border-radius: 2px;
    background: rgba(255,255,255,.06);
    animation: wpulse 1.5s ease-in-out infinite;
  }
  @keyframes wpulse {
    0%, 100% { opacity: .4; }
    50%       { opacity: .8; }
  }

  .weather-teraz {
    display: flex; align-items: center; justify-content: space-between;
    gap: 1rem; margin-bottom: 1.25rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255,255,255,.1);
  }
  .weather-teraz__left { display: flex; align-items: center; gap: .9rem; }
  .weather-ikona { font-size: 2.5rem; line-height: 1; }
  .weather-temp {
    font-family: 'Cormorant Garamond', serif;
    font-size: 2.2rem; font-weight: 300; color: #fff; line-height: 1;
  }
  .weather-opis {
    font-family: 'DM Sans', sans-serif;
    font-size: .75rem; font-weight: 300; color: rgba(255,255,255,.7);
    margin-top: .15rem;
  }
  .weather-lokalizacja {
    font-family: 'DM Sans', sans-serif;
    font-size: .62rem; font-weight: 300; color: rgba(255,255,255,.4);
    margin-top: .1rem; letter-spacing: .05em;
  }

  .weather-teraz__right { display: flex; flex-direction: column; gap: .4rem; align-items: flex-end; }
  .weather-detail {
    display: flex; align-items: center; gap: .35rem;
    font-family: 'DM Sans', sans-serif;
    font-size: .72rem; font-weight: 300; color: rgba(255,255,255,.6);
  }
  .weather-detail__ikona { font-size: .85rem; }

  .weather-prognoza {
    display: flex; gap: .25rem; justify-content: space-between;
    margin-bottom: .75rem;
  }
  .weather-dzien {
    flex: 1; display: flex; flex-direction: column; align-items: center; gap: .3rem;
    padding: .5rem .25rem; border-radius: 2px;
    transition: background .2s;
  }
  .weather-dzien--dzisiaj { background: rgba(255,255,255,.08); }
  .weather-dzien__nazwa {
    font-family: 'DM Sans', sans-serif;
    font-size: .6rem; font-weight: 400; letter-spacing: .1em; text-transform: uppercase;
    color: rgba(255,255,255,.5);
  }
  .weather-dzien--dzisiaj .weather-dzien__nazwa { color: var(--amber, #c8973a); }
  .weather-dzien__ikona { font-size: 1.1rem; }
  .weather-dzien__temp {
    display: flex; flex-direction: column; align-items: center; gap: .05rem;
    font-family: 'DM Sans', sans-serif; font-size: .7rem; font-weight: 300;
  }
  .weather-dzien__max { color: #fff; }
  .weather-dzien__min { color: rgba(255,255,255,.4); }

  .weather-source {
    font-family: 'DM Sans', sans-serif;
    font-size: .55rem; font-weight: 300; color: rgba(255,255,255,.25);
    text-align: right; letter-spacing: .05em;
  }
`;
