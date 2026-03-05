
import React, { useState, useEffect } from 'react';
import { User, Role } from './types';
import AdminDashboard from './pages/AdminDashboard';
import DriverDashboard from './pages/DriverDashboard';
import UserDashboard from './pages/UserDashboard';
import { FacultyDriverLogin, ParentLogin } from './components/Auth';
// Fixed missing Smartphone import
import { GraduationCap, Car, Shield, Smartphone } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('vignan_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAdminMode, setIsAdminMode] = useState(false);
  const [loginTab, setLoginTab] = useState<'FACULTY_DRIVER' | 'PARENT'>('FACULTY_DRIVER');

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('vignan_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('vignan_current_user');
    }
  }, [currentUser]);

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (isAdminMode) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
              <Shield size={20} />
            </div>
            <span className="font-black text-xl tracking-tight">VIGNAN ADMIN</span>
          </div>
          <button 
            onClick={() => setIsAdminMode(false)}
            className="text-indigo-600 font-bold text-sm hover:bg-indigo-50 px-4 py-2 rounded-xl transition-colors"
          >
            Back to User Site
          </button>
        </nav>
        <AdminDashboard />
      </div>
    );
  }

  if (currentUser) {
    if (currentUser.role === 'DRIVER') {
      return (
        <div className="min-h-screen bg-gray-50">
          <DriverDashboard user={currentUser} onLogout={handleLogout} />
        </div>
      );
    }
    // Faculty and Parent share UserDashboard
    return (
      <div className="min-h-screen bg-gray-50">
        <UserDashboard user={currentUser} onLogout={handleLogout} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative BG Elements */}
      <div className="absolute top-[-100px] left-[-100px] w-80 h-80 bg-indigo-500 rounded-full blur-[120px] opacity-20" />
      <div className="absolute bottom-[-100px] right-[-100px] w-80 h-80 bg-pink-500 rounded-full blur-[120px] opacity-10" />

      <div className="w-full max-w-md space-y-8 animate-fadeIn">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2.5rem] bg-indigo-600 text-white shadow-2xl shadow-indigo-200 mb-4 rotate-3">
            <Car size={40} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">VIGNAN RIDE</h1>
          <p className="text-gray-500 font-medium">Campus Transit Ecosystem</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-100 border-2 border-white">
          <div className="flex p-1.5 bg-gray-100 rounded-2xl mb-8">
            <button 
              onClick={() => setLoginTab('FACULTY_DRIVER')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                loginTab === 'FACULTY_DRIVER' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400'
              }`}
            >
              <GraduationCap size={16} /> FACULTY / DRIVER
            </button>
            <button 
              onClick={() => setLoginTab('PARENT')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                loginTab === 'PARENT' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400'
              }`}
            >
              <Smartphone size={16} /> PARENT
            </button>
          </div>

          {loginTab === 'FACULTY_DRIVER' ? (
            <FacultyDriverLogin onLogin={setCurrentUser} />
          ) : (
            <ParentLogin onLogin={setCurrentUser} />
          )}
        </div>

        <div className="flex justify-center gap-4">
          <button 
            onClick={() => setIsAdminMode(true)}
            className="text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors"
          >
            Admin Panel
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
