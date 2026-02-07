import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to update map view when projects change
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const Map = ({ projects, selectedProject }) => {
  // Default center (Atlantic Ocean)
  const defaultCenter = [30, -40];
  
  return (
    <div className="h-full w-full bg-slate-100">
      <MapContainer 
        center={defaultCenter} 
        zoom={3} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {projects.map((project, index) => {
          // Generate pseudo-random coordinates based on title length if not provided
          const lat = (project.title.length * 7) % 60 - 10; 
          const lng = (project.description.length * 3) % 360 - 180;
          
          // Create custom pill marker
          const customIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div class="bg-white text-gray-800 font-bold px-3 py-1 rounded-full shadow-md border border-gray-200 text-xs hover:scale-110 transition-transform whitespace-nowrap flex items-center gap-1">
                    <span class="w-2 h-2 bg-primary rounded-full"></span>
                    ${project.categories[0].split(' ')[0].toUpperCase()}
                   </div>`,
            iconSize: [null, 30],
            iconAnchor: [20, 15]
          });

          return (
            <Marker key={project.title} position={[lat, lng]} icon={customIcon}>
              <Popup>
                <div className="font-sans min-w-[200px]">
                  <div className="relative h-24 bg-gray-100 rounded-t-lg mb-2 overflow-hidden">
                     {/* Placeholder for project image */}
                     <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
                  </div>
                  <h3 className="font-bold text-sm text-gray-900">{project.title}</h3>
                  <p className="text-xs text-gray-500 mb-2">{project.categories[0]}</p>
                  <div className="text-xs font-medium text-gray-800">
                    {project.tech.length} technologies
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default Map;
