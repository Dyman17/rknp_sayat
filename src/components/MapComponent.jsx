import React from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// MapClickHandler component to handle map clicks
export function MapClickHandler({ onAddHouse }) {
  useMapEvents({
    click(e) {
      onAddHouse(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const MapComponent = ({ mapCenter, houses, result, onAddHouse }) => {
  return (
    <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
      <TileLayer 
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      <MapClickHandler onAddHouse={onAddHouse} />
      
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
  );
};

export default MapComponent;