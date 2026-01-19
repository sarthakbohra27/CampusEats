import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { UserPlus, Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';

const Register = () => {
  const [form, setForm] = useState({ email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-slate-950">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-30">
        <div className="absolute top-[20%] right-[10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[150px]"></div>
      </div>

      <div className="w-full max-w-md p-10 glass-premium border-white/5">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-500 mb-6 shadow-xl shadow-blue-500/10">
            <UserPlus size={32} />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter">Registration</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Initialize Account Node</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Email Interface</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="email"
                className="w-full p-5 pl-14 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-secondary focus:bg-white/10 transition-all font-bold text-slate-200"
                placeholder="user@campus.net"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Secure Key</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="password"
                className="w-full p-5 pl-14 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-secondary focus:bg-white/10 transition-all font-bold text-slate-200"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">System Entity Role</label>
            <div className="relative">
              <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <select
                className="w-full p-5 pl-14 bg-slate-900 border border-white/10 rounded-2xl outline-none focus:border-secondary transition-all font-black uppercase text-xs tracking-widest appearance-none text-blue-500"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="student">Student Account</option>
                <option value="vendor">Merchant Node</option>
                <option value="admin">System Controller</option>
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                <ArrowRight size={16} className="rotate-90" />
              </div>
            </div>
          </div>

          {error && <p className="text-red-400 text-xs font-bold text-center bg-red-500/10 p-4 rounded-xl border border-red-500/20">{error}</p>}

          <button type="submit" className="w-full btn-premium-secondary py-5 text-sm font-black uppercase tracking-[0.2em] mt-4">
            Activate Account
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-white/5 text-center">
          <p className="text-sm text-slate-500 font-medium">
            Active Entity? <Link to="/login" className="text-secondary font-black hover:underline underline-offset-4 decoration-2">Authenticate Now</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
