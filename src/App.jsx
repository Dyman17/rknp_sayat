import React, { useState, useCallback, useMemo } from "react";
import HouseForm from "./components/HouseForm";
import MapComponent from "./components/MapComponent";
import ResultsPanel from "./components/ResultsPanel";
import { optimalStop } from "./utils/calculations";
import { HomeIcon, CalculateIcon } from "./icons/Icons";

export default function App() {
  const [houses, setHouses] = useState([]);
  const [result, setResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [mapCenter, setMapCenter] = useState([43.65, 51.17]); // Default to Aktau

  // Function to add a new house with coordinates from map click
  const addHouseFromMap = useCallback((lat, lng) => {
    const newHouse = {
      id: Date.now(),
      name: `Дом #${houses.length + 1}`,
      lat: parseFloat(lat.toFixed(4)),
      lon: parseFloat(lng.toFixed(4)),
      population: 0,
    };
    
    setHouses(prevHouses => [...prevHouses, newHouse]);
    setMapCenter([lat, lng]);
  }, [houses.length]);

  // Function to update house data
  const updateHouse = useCallback((id, field, value) => {
    setHouses(prevHouses => 
      prevHouses.map(house => {
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
          
          // Update map center if this is the first house
          if (prevHouses.length === 1) {
            setMapCenter([updatedHouse.lat, updatedHouse.lon]);
          }
          
          return updatedHouse;
        }
        return house;
      })
    );
  }, []);

  // Function to remove a house
  const removeHouse = useCallback((id) => {
    setHouses(prevHouses => prevHouses.filter(house => house.id !== id));
    setResult(null);
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(() => {
    if (houses.length === 0) return;
    
    setIsCalculating(true);
    
    // Use setTimeout to simulate calculation delay for better UX
    setTimeout(() => {
      try {
        const res = optimalStop(houses);
        setResult(res);
        setIsCalculating(false);
        
        // Center map on optimal point
        if (res.best_pt && res.best_pt.length >= 2 && 
            !isNaN(res.best_pt[0]) && !isNaN(res.best_pt[1])) {
          setMapCenter([res.best_pt[0], res.best_pt[1]]);
        }
      } catch (error) {
        console.error("Ошибка расчета:", error);
        setIsCalculating(false);
      }
    }, 500);
  }, [houses]);

  // Memoize the houses list to prevent unnecessary re-renders
  const housesList = useMemo(() => (
    <div className="houses-container">
      {houses.map((house) => (
        <HouseForm 
          key={house.id} 
          house={house} 
          onUpdate={updateHouse} 
          onDelete={removeHouse} 
        />
      ))}
    </div>
  ), [houses, updateHouse, removeHouse]);

  return (
    <div className="app-container">
      <header>
        <h1>OptiSpot</h1>
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

          {houses.length > 0 && housesList}

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
        <MapComponent 
          mapCenter={mapCenter} 
          houses={houses} 
          result={result} 
          onAddHouse={addHouseFromMap} 
        />
      </div>

      <ResultsPanel result={result} />

      <footer>
        <p>OptiSpot — Анализ геопространственных данных</p>
      </footer>
    </div>
  );
}