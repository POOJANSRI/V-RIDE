
import React, { useState, useEffect } from 'react';
import { User, RideRequest, DriverState } from '../types';
import { dbUpdateDriverStatus, dbUpdateRequestStatus, subscribeToRequests, subscribeToDriverActiveRide, subscribeToDrivers } from '../services/db';
import { Power, MapPin, Navigation, Clock, Ban, LogOut, AlertTriangle, CheckCircle2 } from 'lucide-react';
import MapComponent from '../components/MapComponent';
import { cleanupOldRequests } from '../services/db';

interface DriverDashboardProps {
  user: User;
  onLogout: () => void;
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({ user, onLogout }) => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [requests, setRequests] = useState<RideRequest[]>([]);
  const [activeRide, setActiveRide] = useState<RideRequest | null>(null);
  const [drivers, setDrivers] = useState<DriverState[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | undefined>();
  const [locationStatus, setLocationStatus] = useState<'pending' | 'enabled' | 'denied'>('pending');

  useEffect(() => {
  cleanupOldRequests();

  // Subscribe to pending requests
  const unsubscribeRequests = subscribeToRequests((newRequests) => {
    setRequests(newRequests);
  });

  // Subscribe to active ride
  const unsubscribeActiveRide = subscribeToDriverActiveRide(user.id, (ride) => {
    setActiveRide(ride);
  });

  // Subscribe to drivers (for map updates)
  const unsubscribeDrivers = subscribeToDrivers((updatedDrivers) => {
    setDrivers(updatedDrivers);
  });

  let watchId: number | undefined;

  if ("geolocation" in navigator) {
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setLocationStatus('enabled');

        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };

        setCurrentLocation(loc);

        // 🔥 ALWAYS update driver location if available OR on ride
        if (isAvailable || activeRide) {
          dbUpdateDriverStatus(user.id, isAvailable, loc);
        }
      },
      () => {
        setLocationStatus('denied');
        alert("Location permission is required to go online.");
      },
      { enableHighAccuracy: true }
    );
  }

  return () => {
    unsubscribeRequests();
    unsubscribeActiveRide();
    unsubscribeDrivers();
    if (watchId) navigator.geolocation.clearWatch(watchId);
  };
}, [isAvailable, activeRide, user.id]); 

  const toggleAvailability = async () => {
    const nextState = !isAvailable;
    setIsAvailable(nextState);
    await dbUpdateDriverStatus(user.id, nextState);
  };

  const handleResponse = async (requestId: string, status: RideRequest['status']) => {
  await dbUpdateRequestStatus(requestId, status, status === 'ON_THE_WAY' ? user.id : undefined);

  if (status === 'ON_THE_WAY') {
    setIsAvailable(false);
  }

  if (status === 'COMPLETED') {
    setIsAvailable(true);
  }
  };



  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 min-h-screen bg-gray-50">
      <header className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Welcome, {user.name}! 👋</h1>
          <p className="text-gray-500 font-medium">Vignan Driver Console</p>
        </div>
        <button onClick={onLogout} className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
          <LogOut size={24} />
        </button>
      </header>

      <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl ${isAvailable ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
            <Power size={28} />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase">Duty Status</p>
            <p className={`text-lg font-black ${isAvailable ? 'text-green-600' : 'text-gray-400'}`}>
              {isAvailable ? 'ONLINE' : 'OFFLINE'}
            </p>
          </div>
        </div>
        <button 
          onClick={toggleAvailability}
          className={`px-8 py-4 rounded-2xl font-black ${isAvailable ? 'bg-gray-100 text-gray-800' : 'bg-green-600 text-white shadow-xl'}`}
        >
          {isAvailable ? 'Go Offline' : 'Go Online'}
        </button>
      </div>

      {activeRide && (
        <section className="space-y-4">
          <div className="bg-indigo-600 text-white p-6 rounded-[2.5rem] shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Navigation size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase opacity-70 tracking-widest">Active Ride</p>
                  <h3 className="text-xl font-black">{activeRide.requesterName}</h3>
                </div>
              </div>
              <button 
                onClick={() => handleResponse(activeRide.id, 'NOT_POSSIBLE')}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                <Ban size={20} />
              </button>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold bg-white/10 p-3 rounded-2xl">
              <MapPin size={16} />
              <span>Pickup: {activeRide.pickupLocation}</span>
            </div>
            {activeRide.status === 'PLEASE_WAIT' && (
              <div className="mt-4 flex items-center gap-2 text-xs font-black bg-amber-400 text-amber-900 p-2 rounded-xl">
                <Clock size={14} />
                <span>USER NOTIFIED TO WAIT</span>
              </div>
            )}
            <div className="mt-4">
              <button 
  onClick={() => handleResponse(activeRide.id, 'COMPLETED')}
  className="w-full py-3 bg-white text-indigo-600 rounded-2xl font-black text-sm shadow-lg"
>
  Complete Ride
</button>
            </div>
          </div>

          <div className="relative rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl bg-gray-100 h-[300px]">
            <MapComponent 
              drivers={drivers} 
              riderLocation={activeRide.requesterLocation}
              targetDriverId={user.id}
              currentLocation={currentLocation}
            />
          </div>
        </section>
      )}

      <section className="space-y-4 pb-12">
        <h2 className="text-xl font-black text-gray-900 px-2">Pending Requests ({requests.length})</h2>
        {requests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200">
            <Clock size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-bold">No incoming requests</p>
          </div>
        ) : (
          requests.map(req => (
            <div key={req.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border-2 border-gray-50">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase mb-2 inline-block">{req.role}</span>
                  <h3 className="text-xl font-black text-gray-900">{req.requesterName}</h3>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-indigo-600 font-black justify-end">
                    <MapPin size={18} />
                    <span>{req.pickupLocation}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <button onClick={() => handleResponse(req.id, 'ON_THE_WAY')} className="p-4 rounded-2xl bg-green-50 text-green-600 font-bold text-xs"><Navigation className="mx-auto mb-1" /> ON THE WAY</button>
                <button onClick={() => handleResponse(req.id, 'PLEASE_WAIT')} className="p-4 rounded-2xl bg-amber-50 text-amber-600 font-bold text-xs"><Clock className="mx-auto mb-1" /> WAIT</button>
                <button onClick={() => handleResponse(req.id, 'NOT_POSSIBLE')} className="p-4 rounded-2xl bg-red-50 text-red-600 font-bold text-xs"><Ban className="mx-auto mb-1" /> CANCEL</button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default DriverDashboard;
