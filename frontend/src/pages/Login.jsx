import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mail, Lock, LogIn, ShieldCheck, Zap } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.user, res.data.token);
      showToast('Authentication Successful', 'success');
      navigate(res.data.redirect);
    } catch (err) {
      showToast(err.response?.data?.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-slate-950">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[10%] left-[20%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[20%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md p-10 glass-premium border-white/5 relative">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mb-6 shadow-xl shadow-primary/10">
            <LogIn size={32} />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter">CampusEats</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Internal Wallet Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Email Terminal</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="email"
                className="w-full p-5 pl-14 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-primary focus:bg-white/10 transition-all font-bold text-slate-200"
                placeholder="terminal@campus.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Secure Key</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="password"
                className="w-full p-5 pl-14 bg-white/5 border border-white/10 rounded-2xl outline-none focus:border-primary focus:bg-white/10 transition-all font-bold text-slate-200"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>


          <button type="submit" className="w-full btn-premium-primary py-5 text-sm font-black uppercase tracking-[0.2em]">
            Sign In Now
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-white/5 text-center">
          <p className="text-sm text-slate-500 font-medium">
            New Entity? <Link to="/register" className="text-primary font-black hover:underline underline-offset-4 decoration-2">Request Access</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
