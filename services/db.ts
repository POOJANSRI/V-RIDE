// import { initializeApp } from 'firebase/app';
// import {
//   getFirestore,
//   collection,
//   doc,
//   setDoc,
//   onSnapshot,
//   query,
//   where,
//   updateDoc,
//   getDocs,
//   Timestamp,
//   orderBy
// } from 'firebase/firestore';
// import { User, RideRequest, DriverState } from '../types';

// // ✅ Correct env usage
// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
//   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
//   storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
//   appId: import.meta.env.VITE_FIREBASE_APP_ID
// };

// console.log("🔥 Firebase Project:", firebaseConfig.projectId);

// const app = initializeApp(firebaseConfig);

// // ✅ Stable Firestore initialization
// const db = getFirestore(app);

// // ---------------- USER MANAGEMENT ----------------

// export const dbAddUser = async (user: User) => {
//   try {
//     console.log("Saving user:", user);
//     await setDoc(doc(db, 'users', user.id), user);
//     console.log("✅ User saved successfully");
//   } catch (error) {
//     console.error("❌ Error saving user:", error);
//     throw error;
//   }
// };

// export const dbGetUsers = async (): Promise<User[]> => {
//   try {
//     const snapshot = await getDocs(collection(db, 'users'));
//     return snapshot.docs.map(doc => doc.data() as User);
//   } catch (error) {
//     console.error("❌ Error fetching users:", error);
//     return [];
//   }
// };

// // ---------------- RIDE REQUESTS ----------------

// export const dbAddRequest = async (request: RideRequest) => {
//   try {
//     const reqData = {
//       ...request,
//       timestamp: Timestamp.now()
//     };
//     await setDoc(doc(db, 'requests', request.id), reqData);
//   } catch (error) {
//     console.error("❌ Error adding request:", error);
//   }
// };

// export const dbUpdateRequestStatus = async (
//   requestId: string,
//   status: RideRequest['status'],
//   driverId?: string
// ) => {
//   try {
//     const reqRef = doc(db, 'requests', requestId);
//     const updateData: any = { status };
//     if (driverId) updateData.driverId = driverId;
//     await updateDoc(reqRef, updateData);
//   } catch (error) {
//     console.error("❌ Error updating request:", error);
//   }
// };

// export const subscribeToRequests = (callback: (requests: RideRequest[]) => void) => {
//   const q = query(
//     collection(db, 'requests'),
//     where('status', '==', 'PENDING'),
//     orderBy('timestamp', 'desc')
//   );

//   return onSnapshot(q, (snapshot) => {
//     const reqs = snapshot.docs.map(doc => doc.data() as RideRequest);
//     callback(reqs);
//   });
// };

// export const subscribeToMyRequest = (
//   userId: string,
//   callback: (request: RideRequest | null) => void
// ) => {
//   const q = query(collection(db, 'requests'), where('requesterId', '==', userId));

//   return onSnapshot(q, (snapshot) => {
//     if (snapshot.empty) {
//       callback(null);
//     } else {
//       const active = snapshot.docs
//         .map(doc => doc.data() as RideRequest)
//         .sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds)[0];

//       callback(active);
//     }
//   });
// };

// // ---------------- DRIVER TRACKING ----------------

// export const dbUpdateDriverStatus = async (
//   driverId: string,
//   isAvailable: boolean,
//   location?: { lat: number; lng: number }
// ) => {
//   try {
//     const driverRef = doc(db, 'drivers', driverId);
//     const data: any = {
//       driverId,
//       isAvailable,
//       lastUpdate: Timestamp.now()
//     };

//     if (location) data.location = location;

//     await setDoc(driverRef, data, { merge: true });
//   } catch (error) {
//     console.error("❌ Error updating driver:", error);
//   }
// };

// export const subscribeToDrivers = (callback: (drivers: DriverState[]) => void) => {
//   return onSnapshot(collection(db, 'drivers'), (snapshot) => {
//     const drivers = snapshot.docs.map(doc => doc.data() as DriverState);
//     callback(drivers);
//   });
// };

// export const subscribeToDriverActiveRide = (
//   driverId: string,
//   callback: (request: RideRequest | null) => void
// ) => {
//   const q = query(
//     collection(db, 'requests'),
//     where('driverId', '==', driverId),
//     where('status', 'in', ['ON_THE_WAY', 'PLEASE_WAIT'])
//   );

//   return onSnapshot(q, (snapshot) => {
//     if (snapshot.empty) {
//       callback(null);
//     } else {
//       const active = snapshot.docs
//         .map(doc => doc.data() as RideRequest)
//         .sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds)[0];

//       callback(active);

//     }
//   });
// };



// import { initializeApp } from 'firebase/app';
// import { deleteDoc } from 'firebase/firestore';
// import {
//   getFirestore,
//   collection,
//   doc,
//   setDoc,
//   onSnapshot,
//   query,
//   where,
//   updateDoc,
//   getDocs,
//   Timestamp
// } from 'firebase/firestore';
// import { User, RideRequest, DriverState } from '../types';

// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
//   authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
//   projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
//   storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
//   appId: import.meta.env.VITE_FIREBASE_APP_ID
// };

// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

// /* ---------------- USERS ---------------- */

// export const dbAddUser = async (user: User) => {
//   await setDoc(doc(db, 'users', user.id), user);
// };

// export const dbGetUsers = async (): Promise<User[]> => {
//   const snapshot = await getDocs(collection(db, 'users'));
//   return snapshot.docs.map(doc => doc.data() as User);
// };

// /* ---------------- REQUESTS ---------------- */

// export const dbAddRequest = async (request: RideRequest) => {
//   const expireAt = Timestamp.fromDate(
//     new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours TTL
//   );

//   await setDoc(doc(db, 'requests', request.id), {
//     ...request,
//     status: 'PENDING',
//     timestamp: Timestamp.now(),
//     expireAt
//   });
// };

// export const dbUpdateRequestStatus = async (
//   requestId: string,
//   status: RideRequest['status'],
//   driverId?: string
// ) => {
//   const updateData: any = { status };
//   if (driverId) updateData.driverId = driverId;

//   await updateDoc(doc(db, 'requests', requestId), updateData);
// };

// /* 🔥 FIXED — NO orderBy (no index required) */
// export const subscribeToRequests = (callback: (requests: RideRequest[]) => void) => {
//   const q = query(
//     collection(db, 'requests'),
//     where('status', '==', 'PENDING')
//   );

//   return onSnapshot(q, (snapshot) => {
//     const reqs = snapshot.docs.map(doc => doc.data() as RideRequest);
//     callback(reqs);
//   });
// };

// export const subscribeToMyRequest = (
//   userId: string,
//   callback: (request: RideRequest | null) => void
// ) => {
//   const q = query(
//     collection(db, 'requests'),
//     where('requesterId', '==', userId)
//   );

//   return onSnapshot(q, (snapshot) => {
//     if (snapshot.empty) {
//       callback(null);
//     } else {
//       const active = snapshot.docs
//         .map(doc => doc.data() as RideRequest)
//         .sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds)[0];

//       callback(active);
//     }
//   });
// };

// /* ---------------- DRIVER ---------------- */

// export const dbUpdateDriverStatus = async (
//   driverId: string,
//   isAvailable: boolean,
//   location?: { lat: number; lng: number }
// ) => {
//   const data: any = {
//     driverId,
//     isAvailable,
//     lastUpdate: Timestamp.now()
//   };

//   if (location) data.location = location;

//   await setDoc(doc(db, 'drivers', driverId), data, { merge: true });
// };

// export const subscribeToDrivers = (callback: (drivers: DriverState[]) => void) => {
//   return onSnapshot(collection(db, 'drivers'), (snapshot) => {
//     const drivers = snapshot.docs.map(doc => doc.data() as DriverState);
//     callback(drivers);
//   });
// };

// export const subscribeToDriverActiveRide = (
//   driverId: string,
//   callback: (request: RideRequest | null) => void
// ) => {
//   const q = query(
//     collection(db, 'requests'),
//     where('driverId', '==', driverId)
//   );

//   return onSnapshot(q, (snapshot) => {
//     const ride = snapshot.docs
//       .map(doc => doc.data() as RideRequest)
//       .find(r => r.status === 'ON_THE_WAY' || r.status === 'PLEASE_WAIT');

//     callback(ride || null);
//   });
// };





// export const cleanupOldRequests = async () => {
//   try {
//     const snapshot = await getDocs(collection(db, 'requests'));

//     const now = Date.now();
//     const twentyFourHours = 24 * 60 * 60 * 1000;

//     for (const docSnap of snapshot.docs) {
//       const data = docSnap.data();

//       if (data.timestamp?.seconds) {
//         const requestTime = data.timestamp.seconds * 1000;

//         if (now - requestTime > twentyFourHours) {
//           await deleteDoc(doc(db, 'requests', docSnap.id));
//           console.log("Deleted old request:", docSnap.id);
//         }
//       }
//     }
//   } catch (error) {
//     console.error("Cleanup error:", error);
//   }
// };






import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  where,
  updateDoc,
  getDocs,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';

import { User, RideRequest, DriverState } from '../types';

/* ---------------- FIREBASE INIT ---------------- */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* =========================================================
   USERS
========================================================= */

export const dbAddUser = async (user: User) => {
  await setDoc(doc(db, 'users', user.id), user);
};

export const dbGetUsers = async (): Promise<User[]> => {
  const snapshot = await getDocs(collection(db, 'users'));
  return snapshot.docs.map(d => d.data() as User);
};

/* =========================================================
   REQUESTS
========================================================= */

export const dbAddRequest = async (request: RideRequest) => {
  await setDoc(doc(db, 'requests', request.id), {
    ...request,
    status: 'PENDING',
    timestamp: Timestamp.now()
  });
};

export const dbUpdateRequestStatus = async (
  requestId: string,
  status: RideRequest['status'],
  driverId?: string
) => {
  const updateData: Partial<RideRequest> = { status };

  if (driverId) {
    updateData.driverId = driverId;
  }

  await updateDoc(doc(db, 'requests', requestId), updateData);
};

/* 🔥 Only pending requests (for drivers) */
export const subscribeToRequests = (
  callback: (requests: RideRequest[]) => void
) => {
  const q = query(
    collection(db, 'requests'),
    where('status', '==', 'PENDING')
  );

  return onSnapshot(q, (snapshot) => {
    const reqs = snapshot.docs.map(d => d.data() as RideRequest);
    callback(reqs);
  });
};

/* 🔥 User active request (latest one only) */
export const subscribeToMyRequest = (
  userId: string,
  callback: (request: RideRequest | null) => void
) => {
  const q = query(
    collection(db, 'requests'),
    where('requesterId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback(null);
      return;
    }

    const sorted = snapshot.docs
      .map(d => d.data() as RideRequest)
      .sort(
        (a, b) =>
          (b.timestamp?.seconds || 0) -
          (a.timestamp?.seconds || 0)
      );

    callback(sorted[0]);
  });
};

/* =========================================================
   DRIVERS
========================================================= */

export const dbUpdateDriverStatus = async (
  driverId: string,
  isAvailable: boolean,
  location?: { lat: number; lng: number }
) => {
  const data: Partial<DriverState> & { lastUpdate: Timestamp } = {
    driverId,
    isAvailable,
    lastUpdate: Timestamp.now()
  };

  if (location) {
    data.location = location;
  }

  await setDoc(doc(db, 'drivers', driverId), data, { merge: true });
};

export const subscribeToDrivers = (
  callback: (drivers: DriverState[]) => void
) => {
  return onSnapshot(collection(db, 'drivers'), (snapshot) => {
    const drivers = snapshot.docs.map(d => d.data() as DriverState);
    callback(drivers);
  });
};

/* 🔥 Driver active ride (ONLY real active ones) */
export const subscribeToDriverActiveRide = (
  driverId: string,
  callback: (request: RideRequest | null) => void
) => {
  const q = query(
    collection(db, 'requests'),
    where('driverId', '==', driverId)
  );

  return onSnapshot(q, (snapshot) => {
    const activeRide = snapshot.docs
      .map(d => d.data() as RideRequest)
      .find(
        r =>
          r.status === 'ON_THE_WAY' ||
          r.status === 'PLEASE_WAIT'
      );

    callback(activeRide || null);
  });
};

/* =========================================================
   CLEANUP (24hr auto delete - NO TTL REQUIRED)
========================================================= */

export const cleanupOldRequests = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'requests'));

    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();

      if (data.timestamp?.seconds) {
        const requestTime = data.timestamp.seconds * 1000;

        if (now - requestTime > twentyFourHours) {
          await deleteDoc(doc(db, 'requests', docSnap.id));
          console.log('Deleted old request:', docSnap.id);
        }
      }
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
};