import React from 'react';
import { HomeIcon, LocationIcon, PeopleIcon, DeleteIcon } from '../icons/Icons';

const HouseForm = ({ house, onUpdate, onDelete }) => {
  return (
    <div className="house-card">
      <div className="house-card-header">
        <h3>
          <HomeIcon />
          {house.name || `Дом #${house.id}`}
        </h3>
        <button 
          className="delete-btn"
          onClick={() => onDelete(house.id)}
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
            onChange={(e) => onUpdate(house.id, "name", e.target.value)}
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
            onChange={(e) => onUpdate(house.id, "lat", e.target.value)}
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
            onChange={(e) => onUpdate(house.id, "lon", e.target.value)}
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
            onChange={(e) => onUpdate(house.id, "population", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default HouseForm;