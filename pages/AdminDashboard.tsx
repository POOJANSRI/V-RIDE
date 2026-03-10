
// import React, { useState, useEffect } from 'react';
// import { User, Role } from '../types';
// import { dbAddUser, dbGetUsers } from '../services/db';
// import { Plus, Users, ShieldCheck } from 'lucide-react';

// const AdminDashboard: React.FC = () => {
//   const [users, setUsers] = useState<User[]>([]);
//   const [name, setName] = useState('');
//   const [role, setRole] = useState<Role>('FACULTY');
//   const [userId, setUserId] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const fetchUsers = async () => {
//     const list = await dbGetUsers();
//     setUsers(list);
//   };

//   const handleAddUser = async (e: React.FormEvent) => {
//   e.preventDefault();
//   if (!name || !userId || !password) return;

//   setLoading(true);

//   try {
//     const newUser: User = { id: userId, name, role, password };
//     await dbAddUser(newUser);

//     setName('');
//     setUserId('');
//     setPassword('');

//     await fetchUsers();

//     alert(`${role} account created successfully!`);
//   } catch (error) {
//     console.error(error);
//     alert("Failed to save user to Firebase");
//   } finally {
//     setLoading(false); // 🔥 THIS PREVENTS STUCK BUTTON
//   }
//   };



//   return (
//     <div className="max-w-4xl mx-auto p-6 space-y-8 animate-fadeIn pb-12">
//       <header className="flex items-center gap-3 border-b pb-4">
//         <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600"><ShieldCheck size={32} /></div>
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Admin Portal</h1>
//           <p className="text-gray-500">Manage Vignan University campus users</p>
//         </div>
//       </header>

//       <div className="grid md:grid-cols-2 gap-8">
//         <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
//           <h2 className="text-xl font-semibold mb-6 flex items-center gap-2"><Plus size={20} /> Create New Login</h2>
//           <form onSubmit={handleAddUser} className="space-y-4">
//             <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Display Name" className="w-full p-2.5 rounded-lg border outline-none" />
//             <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="w-full p-2.5 rounded-lg border outline-none">
//               <option value="FACULTY">Faculty</option>
//               <option value="DRIVER">Driver</option>
//             </select>
//             <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="User ID" className="w-full p-2.5 rounded-lg border outline-none" />
//             <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full p-2.5 rounded-lg border outline-none" />
//             <button disabled={loading} type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg disabled:opacity-50">
//               {loading ? 'Creating...' : 'Generate Credentials'}
//             </button>
//           </form>
//         </section>

//         <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
//           <h2 className="text-xl font-semibold mb-6 flex items-center gap-2"><Users size={20} /> Active Users</h2>
//           <div className="space-y-3">
//             {users.map((user) => (
//               <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border">
//                 <div>
//                   <h3 className="font-semibold">{user.name}</h3>
//                   <p className="text-xs text-gray-500">ID: {user.id} • {user.role}</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;


import React, { useState, useEffect } from 'react';
import { User, Role } from '../types';
import { dbAddUser, dbGetUsers } from '../services/db';
import { Plus, Users, ShieldCheck, Lock } from 'lucide-react';

const AdminDashboard: React.FC = () => {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');

  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('FACULTY');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  const fetchUsers = async () => {
    const list = await dbGetUsers();
    setUsers(list);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (adminUser === "admin" && adminPass === "admin123") {
      setIsAuthenticated(true);
    } else {
      alert("Invalid Admin Credentials");
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !userId || !password) return;

    setLoading(true);

    try {
      const newUser: User = { id: userId, name, role, password };
      await dbAddUser(newUser);

      setName('');
      setUserId('');
      setPassword('');

      await fetchUsers();

      alert(`${role} account created successfully!`);
    } catch (error) {
      console.error(error);
      alert("Failed to save user to Firebase");
    } finally {
      setLoading(false);
    }
  };

  /* 🔒 ADMIN LOGIN SCREEN */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form onSubmit={handleAdminLogin} className="bg-white p-8 rounded-2xl shadow-lg w-80 space-y-4">
          <div className="text-center">
            <Lock className="mx-auto text-indigo-600 mb-2" size={36}/>
            <h2 className="text-xl font-bold">Admin Access</h2>
          </div>

          <input
            type="text"
            placeholder="Admin Username"
            value={adminUser}
            onChange={(e)=>setAdminUser(e.target.value)}
            className="w-full p-2.5 border rounded-lg"
          />

          <input
            type="password"
            placeholder="Admin Password"
            value={adminPass}
            onChange={(e)=>setAdminPass(e.target.value)}
            className="w-full p-2.5 border rounded-lg"
          />

          <button className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold">
            Unlock Admin
          </button>
        </form>
      </div>
    );
  }

  /* 🔓 ADMIN DASHBOARD */
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-fadeIn pb-12">
      <header className="flex items-center gap-3 border-b pb-4">
        <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600">
          <ShieldCheck size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Portal</h1>
          <p className="text-gray-500">Manage Vignan University campus users</p>
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-8">

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Plus size={20} /> Create New Login
          </h2>

          <form onSubmit={handleAddUser} className="space-y-4">
            <input type="text" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Display Name" className="w-full p-2.5 rounded-lg border"/>
            
            <select value={role} onChange={(e)=>setRole(e.target.value as Role)} className="w-full p-2.5 rounded-lg border">
              <option value="FACULTY">Faculty</option>
              <option value="DRIVER">Driver</option>
            </select>

            <input type="text" value={userId} onChange={(e)=>setUserId(e.target.value)} placeholder="User ID" className="w-full p-2.5 rounded-lg border"/>

            <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" className="w-full p-2.5 rounded-lg border"/>

            <button disabled={loading} type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg">
              {loading ? 'Creating...' : 'Generate Credentials'}
            </button>
          </form>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Users size={20}/> Active Users
          </h2>

          <div className="space-y-3">
            {users.map((user)=>(
              <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border">
                <div>
                  <h3 className="font-semibold">{user.name}</h3>
                  <p className="text-xs text-gray-500">
                    ID: {user.id} • {user.role}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </section>

      </div>
    </div>
  );
};

export default AdminDashboard;