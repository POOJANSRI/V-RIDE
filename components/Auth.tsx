
import React, { useState } from 'react';
import { User, Role } from '../types';
import { dbGetUsers } from '../services/db';
import { Smartphone, Lock, UserCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const FacultyDriverLogin: React.FC<LoginProps> = ({ onLogin }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const users = await dbGetUsers();
    const user = users.find(u => u.id === id && u.password === password);
    if (user) {
      onLogin(user);
    } else {
      setError('Invalid credentials.');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-500 mb-1">User ID</label>
        <div className="relative">
          <UserCircle className="absolute left-3 top-3 text-gray-400" size={20} />
          <input 
            type="text" 
            value={id} 
            onChange={e => setId(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none transition-all"
            placeholder="Enter ID"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-500 mb-1">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none transition-all"
            placeholder="••••••••"
          />
        </div>
      </div>
      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
      <button 
        disabled={loading}
        className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
      >
        {loading ? 'Logging in...' : 'Login Now'}
      </button>
    </form>
  );
};

export const ParentLogin: React.FC<LoginProps> = ({ onLogin }) => {
  const [mobile, setMobile] = useState('');
  const [step, setStep] = useState<'MOBILE' | 'OTP'>('MOBILE');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');

  const sendOtp = () => {
    if (mobile.length < 10) return;
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(code);
    setStep('OTP');
  };

  const verifyOtp = () => {
    if (otp === generatedOtp) {
      onLogin({
        id: `parent_${mobile}`,
        name: `Parent`,
        role: 'PARENT',
        mobile
      });
    } else {
      alert('Invalid OTP!');
    }
  };

  return (
    <div className="space-y-6">
      {step === 'MOBILE' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Mobile Number</label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-3 text-gray-400" size={20} />
              <input 
                type="tel" 
                value={mobile} 
                onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 outline-none transition-all text-lg tracking-widest"
                placeholder="9876543210"
              />
            </div>
          </div>
          <button onClick={sendOtp} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg">Get OTP</button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-indigo-50 p-4 rounded-2xl text-center border-2 border-indigo-100 border-dashed">
            <p className="text-indigo-600 font-bold text-sm">SIMULATED OTP: <span className="text-xl tracking-tighter">{generatedOtp}</span></p>
          </div>
          <input 
            type="text" 
            value={otp} 
            onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className="w-full text-center py-4 bg-gray-50 rounded-2xl border-2 border-indigo-500 outline-none text-2xl tracking-[1em] font-bold"
            placeholder="0000"
          />
          <button onClick={verifyOtp} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold">Verify & Login</button>
          <button onClick={() => setStep('MOBILE')} className="w-full text-gray-400 text-xs font-bold">Change Number</button>
        </div>
      )}
    </div>
  );
};
