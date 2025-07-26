'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { destinations } from '@/app/medical-tourism/data';

const Map = () => {
  return (
    <div className="relative w-full h-[500px] border border-gray-300 rounded-lg overflow-hidden">
      <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {destinations.map((destination, index) => (
          <Marker key={index} position={destination.coordinates}>
            <Popup>
              <h3 className="font-bold">{destination.name}</h3>
              <p>Specialties: {destination.specialties.join(', ')}</p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;
