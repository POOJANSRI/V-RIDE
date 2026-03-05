
// import React, { useState, useEffect } from 'react';
// import { User, RideRequest, DriverState } from '../types';
// import { dbAddRequest, subscribeToDrivers, subscribeToMyRequest } from '../services/db';
// import { CAMPUS_LOCATIONS } from '../constants';
// import MapComponent from '../components/MapComponent';
// import { LogOut, MapPin, ChevronRight, CheckCircle2, AlertCircle, Sparkles, Navigation } from 'lucide-react';

// interface UserDashboardProps {
//   user: User;
//   onLogout: () => void;
// }

// const UserDashboard: React.FC<UserDashboardProps> = ({ user, onLogout }) => {
//   const [drivers, setDrivers] = useState<DriverState[]>([]);
//   const [currentRequest, setCurrentRequest] = useState<RideRequest | null>(null);
//   const [selectedLocation, setSelectedLocation] = useState('');
//   const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | undefined>();

//   useEffect(() => {
//     // 1. Subscribe to all driver updates for the map
//     const unsubDrivers = subscribeToDrivers((updatedDrivers) => {
//       setDrivers(updatedDrivers);
//     });

//     // 2. Subscribe to this user's specific request updates
//     const unsubMyReq = subscribeToMyRequest(user.id, (myReq) => {
//       setCurrentRequest(myReq);
//       if (myReq) setSelectedLocation(myReq.pickupLocation);
//     });

//     // 3. Track current device location
//     let watchId: number;
//     if ("geolocation" in navigator) {
//       watchId = navigator.geolocation.watchPosition(
//         (pos) => {
//           setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
//         },
//         (err) => console.error("Location access denied"),
//         { enableHighAccuracy: true }
//       );
//     }

//     return () => {
//       unsubDrivers();
//       unsubMyReq();
//       if (watchId) navigator.geolocation.clearWatch(watchId);
//     };
//   }, [user.id]);

//   const requestRide = async (location: string) => {
//     let requesterLocation;
    
//     if ("geolocation" in navigator) {
//       try {
//         const position = await new Promise<GeolocationPosition>((resolve, reject) => {
//           navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
//         });
//         requesterLocation = {
//           lat: position.coords.latitude,
//           lng: position.coords.longitude
//         };
//       } catch (error) {
//         console.error("Error getting location", error);
//       }
//     }

//     const newRequest: RideRequest = {
//       id: `req_${Date.now()}`,
//       requesterId: user.id,
//       requesterName: user.name,
//       role: user.role,
//       pickupLocation: location,
//       requesterLocation,
//       status: 'PENDING',
//       timestamp: Date.now()
//     };
//     await dbAddRequest(newRequest);
//     setSelectedLocation(location);
//   };

//   const activeDriver = drivers.find(d => d.isAvailable);

//   return (
//     <div className="min-h-screen flex flex-col max-w-7xl mx-auto bg-white md:bg-gray-50 pb-10">
//       <header className="flex justify-between items-center p-6 bg-white border-b md:border-none md:bg-transparent">
//         <div className="flex items-center gap-4">
//           <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-100">
//             <Sparkles size={24} />
//           </div>
//           <div>
//             <h1 className="text-2xl font-black text-gray-900 tracking-tight">Welcome, {user.name}</h1>
//             <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{user.role} Console</p>
//           </div>
//         </div>
//         <button onClick={onLogout} className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
//           <LogOut size={24} />
//         </button>
//       </header>

//       <main className="flex-1 grid lg:grid-cols-12 gap-6 p-4 lg:p-6 lg:pt-0">
//         <div className="lg:col-span-8 flex flex-col gap-4">
//           <div className="bg-white p-5 rounded-[2rem] shadow-sm border-2 border-gray-50 flex flex-wrap items-center justify-between gap-4">
//             <div className="flex items-center gap-4">
//               <div className={`h-4 w-4 rounded-full ${activeDriver ? 'bg-green-500 animate-pulse' : 'bg-red-500'} shadow-[0_0_15px_rgba(34,197,94,0.4)]`} />
//               <div>
//                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Driver Availability</p>
//                 <p className="font-black text-lg text-gray-800">
//                   {activeDriver ? 'Drivers Active Near You' : 'No Drivers Available'}
//                 </p>
//               </div>
//             </div>
//             <div className="text-right">
//               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Campus Hub</p>
//               <p className="font-bold text-indigo-600">Vignan University</p>
//             </div>
//           </div>

//           <div className="relative rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl bg-gray-100 h-[400px] lg:h-[500px]">
//             <MapComponent 
//               drivers={drivers} 
//               riderLocation={currentRequest?.requesterLocation}
//               targetDriverId={currentRequest?.driverId}
//               currentLocation={currentLocation}
//             />
//           </div>
//         </div>

//         <div className="lg:col-span-4 flex flex-col gap-6">
//           <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border-2 border-gray-50">
//             <h2 className="font-black text-xl text-gray-900 mb-6 flex items-center gap-3">
//               <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
//                 <Navigation size={20} />
//               </div>
//               Where to pick you up?
//             </h2>
//             <div className="grid grid-cols-1 gap-3">
//               {CAMPUS_LOCATIONS.map(loc => (
//                 <button
//                   key={loc}
//                   onClick={() => requestRide(loc)}
//                   disabled={!!currentRequest && currentRequest.status === 'PENDING'}
//                   className={`p-4 text-sm font-black rounded-2xl border-2 transition-all flex items-center justify-between group ${
//                     selectedLocation === loc 
//                       ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100 translate-x-1' 
//                       : 'bg-white text-gray-700 border-gray-50 hover:border-indigo-200 hover:bg-gray-50'
//                   } disabled:opacity-50`}
//                 >
//                   <span className="flex items-center gap-3">
//                     <MapPin size={18} className={selectedLocation === loc ? 'text-white' : 'text-gray-300 group-hover:text-indigo-400'} />
//                     {loc}
//                   </span>
//                   <ChevronRight size={18} className={`${selectedLocation === loc ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`} />
//                 </button>
//               ))}
//             </div>
//           </section>

//           {currentRequest && (
//             <section className={`p-8 rounded-[2.5rem] shadow-2xl animate-fadeIn transition-colors duration-500 ${
//               currentRequest.status === 'NOT_POSSIBLE' ? 'bg-red-600 text-white' : 'bg-indigo-600 text-white'
//             }`}>
//               <div className="flex items-start gap-5">
//                 <div className="shrink-0 p-3 bg-white/20 rounded-2xl">
//                   {currentRequest.status === 'ON_THE_WAY' && <CheckCircle2 size={32} />}
//                   {currentRequest.status === 'PENDING' && <ClockLoader />}
//                   {currentRequest.status === 'PLEASE_WAIT' && <ClockLoader />}
//                   {currentRequest.status === 'NOT_POSSIBLE' && <AlertCircle size={32} />}
//                 </div>
//                 <div>
//                   <h3 className="text-2xl font-black leading-tight">
//                     {currentRequest.status === 'PENDING' && "Finding driver..."}
//                     {currentRequest.status === 'ON_THE_WAY' && "Coming to you!"}
//                     {currentRequest.status === 'PLEASE_WAIT' && "Wait a moment..."}
//                     {currentRequest.status === 'NOT_POSSIBLE' && "Ride Declined"}
//                   </h3>
//                   <p className="text-sm font-medium opacity-80">Location: {currentRequest.pickupLocation}</p>
//                 </div>
//               </div>
//             </section>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// };

// const ClockLoader = () => (
//   <div className="animate-spin"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
// );

// export default UserDashboard;







import React, { useState, useEffect } from 'react';
import { User, RideRequest, DriverState } from '../types';
import { dbAddRequest, subscribeToDrivers, subscribeToMyRequest } from '../services/db';
import { CAMPUS_LOCATIONS } from '../constants';
import MapComponent from '../components/MapComponent';
import { LogOut, MapPin, ChevronRight, CheckCircle2, AlertCircle, Sparkles, Navigation } from 'lucide-react';
import { cleanupOldRequests } from '../services/db';

interface UserDashboardProps {
  user: User;
  onLogout: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, onLogout }) => {
  const [drivers, setDrivers] = useState<DriverState[]>([]);
  const [currentRequest, setCurrentRequest] = useState<RideRequest | null>(null);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | undefined>();
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [loadingRequest, setLoadingRequest] = useState(false);

  /* ---------------- INITIALIZE ---------------- */
  useEffect(() => {
    let watchId: number | undefined;

    // 1️⃣ FORCE LOCATION PERMISSION
    if (!navigator.geolocation) {
      alert("⚠️ Geolocation is not supported in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationEnabled(true);
        setCurrentLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });

        // Start continuous tracking (only for map display)
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            setCurrentLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          () => console.log("Location tracking stopped"),
          { enableHighAccuracy: true }
        );
      },
      () => {
        alert("⚠️ Location access is required to request a ride.");
        setLocationEnabled(false);
      },
      { enableHighAccuracy: true }
    );

    cleanupOldRequests(); // 🔥 Auto cleanup

    // 2️⃣ Subscribe to drivers
    const unsubDrivers = subscribeToDrivers(setDrivers);

    // 3️⃣ Subscribe to this user's ride
    const unsubMyReq = subscribeToMyRequest(user.id, (myReq) => {
      setCurrentRequest(myReq);
      if (myReq) {
        setSelectedLocation(myReq.pickupLocation);
        setLoadingRequest(false);
      } else {
        setLoadingRequest(false);
      }
    });

    return () => {
      unsubDrivers();
      unsubMyReq();
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [user.id]);

  /* ---------------- REQUEST RIDE ---------------- */
  const requestRide = async (location: string) => {
    if (!locationEnabled) {
      alert("⚠️ Please enable location first.");
      return;
    }

    if (!currentLocation) {
      alert("Getting your location... please wait.");
      return;
    }

    try {
      setLoadingRequest(true); // 🔥 instant UI feedback
      setSelectedLocation(location);

      const newRequest: RideRequest = {
        id: `req_${Date.now()}`,
        requesterId: user.id,
        requesterName: user.name,
        role: user.role,
        pickupLocation: location,
        requesterLocation: currentLocation, // Only snapshot once
        status: 'PENDING',
        timestamp: Date.now()
      };

      await dbAddRequest(newRequest);
    } catch (err) {
      console.error("Ride request failed:", err);
      setLoadingRequest(false);
      alert("Something went wrong. Try again.");
    }
  };

  const activeDriver = drivers.find(d => d.isAvailable);

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen flex flex-col max-w-7xl mx-auto bg-white md:bg-gray-50 pb-10">
      <header className="flex justify-between items-center p-6 bg-white border-b md:border-none md:bg-transparent">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-100">
            <Sparkles size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              Welcome, {user.name}
            </h1>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              {user.role} Console
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
        >
          <LogOut size={24} />
        </button>
      </header>

      <main className="flex-1 grid lg:grid-cols-12 gap-6 p-4 lg:p-6 lg:pt-0">

        {/* MAP SECTION */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-white p-5 rounded-[2rem] shadow-sm border-2 border-gray-50 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className={`h-4 w-4 rounded-full ${
                activeDriver ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`} />
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Driver Availability
                </p>
                <p className="font-black text-lg text-gray-800">
                  {activeDriver ? 'Drivers Active Near You' : 'No Drivers Available'}
                </p>
              </div>
            </div>
          </div>

          <div className="relative rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl bg-gray-100 h-[450px]">
            <MapComponent
  drivers={drivers}
  riderLocation={
    currentRequest?.status === 'ON_THE_WAY'
      ? currentRequest.requesterLocation
      : undefined
  }
  targetDriverId={
    currentRequest?.status === 'ON_THE_WAY'
      ? currentRequest.driverId
      : undefined
  }
  currentLocation={currentLocation}
/>
          </div>
        </div>

        {/* REQUEST SECTION */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border-2 border-gray-50">
            <h2 className="font-black text-xl text-gray-900 mb-6 flex items-center gap-3">
              <Navigation size={20} />
              Where to pick you up?
            </h2>

            <div className="grid gap-3">
              {CAMPUS_LOCATIONS.map(loc => (
                <button
                  key={loc}
                  onClick={() => requestRide(loc)}
                  disabled={loadingRequest || currentRequest?.status === 'PENDING'}
                  className={`p-4 text-sm font-black rounded-2xl border-2 transition-all flex justify-between ${
                    selectedLocation === loc
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-50 hover:border-indigo-200'
                  } disabled:opacity-50`}
                >
                  <span className="flex items-center gap-3">
                    <MapPin size={18} />
                    {loc}
                  </span>
                  <ChevronRight size={18} />
                </button>
              ))}
            </div>
          </section>

          {currentRequest && (
            <section className={`p-8 rounded-[2.5rem] shadow-2xl text-white ${
              currentRequest.status === 'NOT_POSSIBLE'
                ? 'bg-red-600'
                : 'bg-indigo-600'
            }`}>
              <div className="flex items-start gap-5">
                <div className="p-3 bg-white/20 rounded-2xl">
                  {currentRequest.status === 'ON_THE_WAY' && <CheckCircle2 size={32} />}
                  {(currentRequest.status === 'PENDING' || loadingRequest) && <ClockLoader />}
                  {currentRequest.status === 'PLEASE_WAIT' && <ClockLoader />}
                  {currentRequest.status === 'NOT_POSSIBLE' && <AlertCircle size={32} />}
                </div>
                <div>
                  <h3 className="text-2xl font-black">
                    {currentRequest.status === 'PENDING' && "Finding driver..."}
                    {currentRequest.status === 'ON_THE_WAY' && "Driver is coming!"}
                    {currentRequest.status === 'PLEASE_WAIT' && "Please wait..."}
                    {currentRequest.status === 'NOT_POSSIBLE' && "Ride Declined"}
                  </h3>
                  <p className="text-sm opacity-80">
                    Location: {currentRequest.pickupLocation}
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

const ClockLoader = () => (
  <div className="animate-spin">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  </div>
);

export default UserDashboard;