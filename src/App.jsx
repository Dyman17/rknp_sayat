import React, { useState, useCallback } from "react";
import { MapContainer, TileLayer, Circle, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Import marker icons explicitly to ensure they load correctly
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// MapClickHandler component to handle map clicks
function MapClickHandler({ onAddHouse }) {
  useMapEvents({
    click(e) {
      onAddHouse(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// === Расчёт расстояния (haversine) ===
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const dphi = ((lat2 - lat1) * Math.PI) / 180;
  const dlambda = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dphi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dlambda / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function pointInCircle(p, c) {
  const [plat, plon] = p;
  const [clat, clon, r] = c;
  return haversine(plat, plon, clat, clon) <= r + 1e-6;
}

// === Вычисление оптимальной точки (пока центр масс) ===
function optimalStop(houses) {
  console.log("Входные данные для расчета:", houses);
  
  // Берём только валидные дома (с координатами)
  const validHouses = houses.filter(
    (h) => {
      const isValid = 
        typeof h.lat === 'number' && !isNaN(h.lat) &&
        typeof h.lon === 'number' && !isNaN(h.lon);
      console.log(`Дом ${h.id}: lat=${h.lat}, lon=${h.lon}, population=${h.population}, isValid=${isValid}`);
      return isValid;
    }
  );

  console.log("Валидные дома:", validHouses);
  
  if (validHouses.length === 0) {
    console.log("Нет валидных домов, возвращаем значения по умолчанию");
    return { best_pt: [0, 0], covered: 0, total: 0, circles: [] };
  }

  // Среднее население (если у всех population = 0, то используем 1 как значение по умолчанию)
  const ps = validHouses.map((h) => h.population > 0 ? h.population : 1);
  const p_avg = ps.reduce((a, b) => a + b, 0) / validHouses.length;

  // Радиусы окружностей (если население = 0, то используем минимальный радиус)
  const circles = validHouses.map((h) => [
    h.lat,
    h.lon,
    250 + 250 * ((h.population > 0 ? h.population : 1) / p_avg),
  ]);

  // Центр масс по населению (если население = 0, то используем 1)
  const populations = validHouses.map(h => h.population > 0 ? h.population : 1);
  const totalPop = populations.reduce((a, b) => a + b, 0);
  const lat_c =
    validHouses.reduce((sum, h, i) => sum + h.lat * populations[i], 0) / totalPop;
  const lon_c =
    validHouses.reduce((sum, h, i) => sum + h.lon * populations[i], 0) / totalPop;

  const best_pt = [lat_c, lon_c];
  const covered = circles.filter((c) => pointInCircle(best_pt, c)).length;

  console.log("Результат расчета:", { best_pt, covered, total: validHouses.length, circles });
  
  return { best_pt, covered, total: validHouses.length, circles };
}

// SVG Icons
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
  </svg>
);

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
);

const PeopleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H16c-.8 0-1.54.37-2.01.99l-3.52-1.97c.15-.36.23-.76.23-1.18 0-1.11-.89-2-2-2s-2 .89-2 2 .89 2 2 2c.18 0 .35-.03.51-.08L7.54 8H5.46c-.58 0-1.11.31-1.41.81L1.5 16.5c-.3.5-.3 1.11 0 1.61.3.5.84.81 1.41.81H6v6h2v-6h8v6h2z"/>
  </svg>
);

const CalculateIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
  </svg>
);

const ResultIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
  </svg>
);

export default function App() {
  const [houses, setHouses] = useState([]);
  const [result, setResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [mapCenter, setMapCenter] = useState([43.65, 51.17]); // Default to Aktau

  // Function to add a new house with coordinates from map click
  const addHouseFromMap = useCallback((lat, lng) => {
    const newHouse = {
      id: Date.now(), // Unique ID based on timestamp
      name: `Дом #${houses.length + 1}`,
      lat: parseFloat(lat.toFixed(4)),
      lon: parseFloat(lng.toFixed(4)),
      population: 0,
    };
    
    setHouses(prevHouses => [...prevHouses, newHouse]);
    
    // Update map center to the new point
    setMapCenter([lat, lng]);
  }, [houses.length]);

  // Function to update house data
  const updateHouse = (id, field, value) => {
    setHouses(prevHouses => {
      console.log(`Обновление дома ${id}, поле ${field}, значение ${value}`);
      return prevHouses.map(house => {
        if (house.id === id) {
          let updatedValue;
          if (field === "lat" || field === "lon") {
            updatedValue = value === "" ? 0 : parseFloat(value);
            updatedValue = isNaN(updatedValue) ? 0 : updatedValue;
          } else if (field === "population") {
            updatedValue = value === "" ? 0 : parseInt(value);
            updatedValue = isNaN(updatedValue) ? 0 : updatedValue;
          } else {
            updatedValue = value;
          }
          
          const updatedHouse = {
            ...house,
            [field]: updatedValue
          };
          
          console.log("Обновленный дом:", updatedHouse);
          
          // Update map center if this is the first house
          if (prevHouses.length === 1) {
            setMapCenter([updatedHouse.lat, updatedHouse.lon]);
          }
          
          return updatedHouse;
        }
        return house;
      });
    });
  };

  // Function to remove a house
  const removeHouse = (id) => {
    setHouses(prevHouses => prevHouses.filter(house => house.id !== id));
    
    // Clear result when a house is removed
    setResult(null);
  };

  const handleSubmit = () => {
    if (houses.length === 0) return;
    
    setIsCalculating(true);
    
    // Simulate calculation delay for better UX
    setTimeout(() => {
      try {
        const res = optimalStop(houses);
        setResult(res);
        setIsCalculating(false);
        
        // Center map on optimal point
        if (res.best_pt && res.best_pt.length >= 2 && !isNaN(res.best_pt[0]) && !isNaN(res.best_pt[1])) {
          setMapCenter([res.best_pt[0], res.best_pt[1]]);
        }
        
        console.log("Результат расчета:", res); // Для отладки
      } catch (error) {
        console.error("Ошибка расчета:", error);
        setIsCalculating(false);
      }
    }, 800);
  };

  return (
    <div className="app-container">
      <header>
        <h1>GeoStop</h1>
        <p>Оптимизация расположения транспортных остановок</p>
      </header>

      <div className="card">
        <div className="input-section">
          <div className="input-group">
            <div className="input-label">
              <HomeIcon />
              Количество домов: {houses.length}
            </div>
            <div className="instruction">
              Кликните на карту, чтобы добавить дома
            </div>
          </div>

          {houses.length > 0 && (
            <div className="houses-container">
              {houses.map((house) => (
                <div key={house.id} className="house-card">
                  <div className="house-card-header">
                    <h3>
                      <HomeIcon />
                      {house.name || `Дом #${house.id}`}
                    </h3>
                    <button 
                      className="delete-btn"
                      onClick={() => removeHouse(house.id)}
                      aria-label="Удалить дом"
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                  <div className="house-fields">
                    <div className="house-field">
                      <label>
                        <LocationIcon />
                        Название
                      </label>
                      <input
                        placeholder="Название дома"
                        value={house.name || ""}
                        onChange={(e) => updateHouse(house.id, "name", e.target.value)}
                      />
                    </div>
                    <div className="house-field">
                      <label>
                        <LocationIcon />
                        Широта
                      </label>
                      <input
                        placeholder="Широта"
                        type="number"
                        step="0.0001"
                        value={house.lat || ""}
                        onChange={(e) => updateHouse(house.id, "lat", e.target.value)}
                      />
                    </div>
                    <div className="house-field">
                      <label>
                        <LocationIcon />
                        Долгота
                      </label>
                      <input
                        placeholder="Долгота"
                        type="number"
                        step="0.0001"
                        value={house.lon || ""}
                        onChange={(e) => updateHouse(house.id, "lon", e.target.value)}
                      />
                    </div>
                    <div className="house-field">
                      <label>
                        <PeopleIcon />
                        Население
                      </label>
                      <input
                        placeholder="Количество жителей"
                        type="number"
                        value={house.population || ""}
                        onChange={(e) => updateHouse(house.id, "population", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {houses.length > 0 && (
            <button 
              onClick={handleSubmit} 
              className="calculate-btn"
              disabled={isCalculating}
            >
              {isCalculating ? (
                <>
                  <div className="spinner"></div>
                  Расчет...
                </>
              ) : (
                <>
                  <CalculateIcon />
                  Рассчитать оптимальную точку
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="map-section">
        <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer 
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <MapClickHandler onAddHouse={addHouseFromMap} />
          
          {houses.map(
            (house) =>
              house.lat &&
              house.lon && !isNaN(house.lat) && !isNaN(house.lon) && (
                <Circle
                  key={house.id}
                  center={[parseFloat(house.lat), parseFloat(house.lon)]}
                  radius={result && result.circles ? 
                    result.circles[houses.findIndex(h => h.id === house.id)]?.[2] || 300 : 
                    300}
                  color="#007BFF"
                  fillColor="#4da6ff"
                  fillOpacity={0.3}
                  weight={2}
                >
                  <Popup>
                    <strong>{house.name || `Дом #${house.id}`}</strong>
                    <br />
                    Координаты: {parseFloat(house.lat).toFixed(4)}, {parseFloat(house.lon).toFixed(4)}
                    <br />
                    Население: {house.population || 0}
                  </Popup>
                </Circle>
              )
          )}
          
          {result && result.best_pt && result.best_pt.length >= 2 && 
           !isNaN(result.best_pt[0]) && !isNaN(result.best_pt[1]) && (
            <Marker
              position={[parseFloat(result.best_pt[0]), parseFloat(result.best_pt[1])]}
            >
              <Popup>
                <strong>Оптимальная точка остановки</strong>
                <br />
                Координаты: {parseFloat(result.best_pt[0]).toFixed(5)}, {parseFloat(result.best_pt[1]).toFixed(5)}
                <br />
                Покрыто домов: {result.covered || 0} из {result.total || 0}
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {result && (
        <div className="result-panel">
          <h2>
            <ResultIcon />
            Результат анализа
          </h2>
          <div className="result-grid">
            <div className="result-item">
              <div className="result-label">Координаты точки</div>
              <div className="coordinates">
                {result.best_pt && result.best_pt.length >= 2 && 
                 !isNaN(result.best_pt[0]) && !isNaN(result.best_pt[1])
                  ? `${parseFloat(result.best_pt[0]).toFixed(5)}, ${parseFloat(result.best_pt[1]).toFixed(5)}` 
                  : 'Не определены'}
              </div>
            </div>
            <div className="result-item">
              <div className="result-label">Покрыто домов</div>
              <div className="result-value">{result ? result.covered || 0 : 0}</div>
              <div className="result-label">из {result ? result.total || 0 : 0}</div>
            </div>
            <div className="result-item">
              <div className="result-label">Эффективность</div>
              <div className="result-value">
                {result && result.total > 0 
                  ? Math.round(((result.covered || 0) / result.total) * 100) 
                  : 0}%
              </div>
              <div className="result-label">покрытие</div>
            </div>
          </div>
        </div>
      )}

      <footer>
        <p>GeoStop — Анализ геопространственных данных</p>
      </footer>
    </div>
  );
}