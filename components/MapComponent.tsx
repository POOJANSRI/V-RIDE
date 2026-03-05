
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { CAMPUS_CENTER } from '../constants';
import { DriverState } from '../types';

interface MapComponentProps {
  drivers: DriverState[];
  currentLocation?: { lat: number, lng: number };
  riderLocation?: { lat: number, lng: number };
  targetDriverId?: string;
}

const MapComponent: React.FC<MapComponentProps> = ({ drivers, currentLocation, riderLocation, targetDriverId }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});
  const polylineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([CAMPUS_CENTER.lat, CAMPUS_CENTER.lng], 16);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Update Driver Markers
    const currentDriverIds = new Set(drivers.map(d => d.driverId));
    
    // Remove markers for drivers no longer in the list
    Object.keys(markersRef.current).forEach(id => {
      if (id !== 'user' && id !== 'rider' && !currentDriverIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    drivers.forEach(driver => {
      if (driver.location) {
        if (markersRef.current[driver.driverId]) {
          markersRef.current[driver.driverId].setLatLng([driver.location.lat, driver.location.lng]);
        } else {
          const driverIcon = L.divIcon({
            className: 'relative h-8 w-8',
            html: `
              <div class="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-25"></div>
              <div class="relative flex items-center justify-center bg-red-600 text-white rounded-full h-8 w-8 shadow-xl border-2 border-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
              </div>
            `,
            iconSize: [32, 32]
          });
          markersRef.current[driver.driverId] = L.marker([driver.location.lat, driver.location.lng], { icon: driverIcon })
            .addTo(mapRef.current!)
            .bindPopup(`<b>Driver Active</b><br/>Status: ${driver.isAvailable ? 'Available' : 'Busy'}`);
        }
      }
    });

    // Handle user marker (current device location)
    if (currentLocation) {
      if (markersRef.current['user']) {
        markersRef.current['user'].setLatLng([currentLocation.lat, currentLocation.lng]);
      } else {
        const userIcon = L.divIcon({
          className: 'h-4 w-4 bg-blue-500 border-2 border-white rounded-full shadow-lg',
          iconSize: [16, 16]
        });
        markersRef.current['user'] = L.marker([currentLocation.lat, currentLocation.lng], { icon: userIcon })
          .addTo(mapRef.current!)
          .bindPopup('Your Current Location');
      }
    }

    // Handle rider marker (the person who booked the ride)
    if (riderLocation) {
      if (markersRef.current['rider']) {
        markersRef.current['rider'].setLatLng([riderLocation.lat, riderLocation.lng]);
      } else {
        const riderIcon = L.divIcon({
          className: 'relative h-10 w-10',
          html: `
            <div class="absolute inset-0 bg-indigo-500 rounded-full animate-pulse opacity-20"></div>
            <div class="relative flex items-center justify-center bg-indigo-600 text-white rounded-2xl h-10 w-10 shadow-xl border-2 border-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
          `,
          iconSize: [40, 40]
        });
        markersRef.current['rider'] = L.marker([riderLocation.lat, riderLocation.lng], { icon: riderIcon })
          .addTo(mapRef.current!)
          .bindPopup('Rider Pickup Point');
      }
    } else if (markersRef.current['rider']) {
      markersRef.current['rider'].remove();
      delete markersRef.current['rider'];
    }

    // Handle path line between driver and rider
    if (riderLocation && targetDriverId) {
      const targetDriver = drivers.find(d => d.driverId === targetDriverId);
      if (targetDriver?.location) {
        const pathPoints: [number, number][] = [
          [targetDriver.location.lat, targetDriver.location.lng],
          [riderLocation.lat, riderLocation.lng]
        ];

        if (polylineRef.current) {
          polylineRef.current.setLatLngs(pathPoints);
        } else {
          polylineRef.current = L.polyline(pathPoints, {
            color: '#4f46e5',
            weight: 4,
            opacity: 0.6,
            dashArray: '10, 10',
            lineCap: 'round'
          }).addTo(mapRef.current!);
        }
      }
    } else if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }
  }, [drivers, currentLocation, riderLocation, targetDriverId]);

  return <div ref={mapContainerRef} className="w-full h-full shadow-inner border border-gray-200" />;
};

export default MapComponent;
