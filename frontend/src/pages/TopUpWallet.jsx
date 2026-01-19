import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, CheckCircle2, CreditCard, UserCheck, ShieldCheck } from 'lucide-react';

const TopUpWallet = () => {
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('self');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleTopUp = async () => {
    if (!amount || amount <= 0) return;
    setLoading(true);
    try {
      await api.post('/wallet/topup', { amount: parseFloat(amount), source });
      setSuccess(true);
      setTimeout(() => navigate('/student/dashboard'), 2500);
    } catch (err) {
      alert('Transaction rejected by bank gateway.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-slate-950">
        <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-[40px] flex items-center justify-center text-5xl mb-8 animate-bounce shadow-2xl shadow-emerald-500/20">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Liquidity Settled</h1>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">₹{parseFloat(amount || 0).toLocaleString()} Secured in Wallet</p>
      </div>
    );
  }

  return (
    <div className="pt-16 px-6 pb-32 max-w-lg mx-auto bg-slate-950 min-h-screen">
      <header className="flex items-center mb-12">
        <button onClick={() => navigate(-1)} className="mr-6 glass-premium p-4 border-white/5 text-slate-400 hover:text-white transition-all">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-black tracking-tighter text-white">Deposit Capital</h1>
      </header>

      <div className="glass-premium p-10 mb-8 border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[60px] opacity-30"></div>
        
        <label className="block text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6">Enter Transaction Amount</label>
        <div className="relative mb-10">
          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-4xl font-light text-slate-700 tracking-tighter italic">₹</span>
          <input
            type="number"
            className="w-full bg-white/5 border border-white/10 rounded-[32px] p-8 pl-14 text-5xl font-black tracking-tighter outline-none focus:border-primary transition-all text-white placeholder:text-slate-900"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
          />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-10">
          {[100, 500, 1000].map(val => (
            <button 
              key={val} 
              onClick={() => setAmount(val.toString())} 
              className="glass-premium py-4 border-white/5 hover:bg-white/10 active:scale-95 transition-all text-sm font-black tracking-tight"
            >
              +₹{val}
            </button>
          ))}
        </div>

        <div className="mb-12">
          <label className="block text-slate-500 text-[10px] font-black uppercase tracking-widest mb-4">Funding Source</label>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => setSource('self')} 
              className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center space-y-2 ${source === 'self' ? 'border-primary bg-primary/10 text-primary' : 'border-white/5 bg-white/5 text-slate-500'}`}
            >
              <UserCheck size={20} />
              <span className="font-black text-[10px] uppercase tracking-widest">Self Funded</span>
            </button>
            <button 
              onClick={() => setSource('parent')} 
              className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center space-y-2 ${source === 'parent' ? 'border-secondary bg-secondary/10 text-secondary' : 'border-white/5 bg-white/5 text-slate-500'}`}
            >
              <ShieldCheck size={20} />
              <span className="font-black text-[10px] uppercase tracking-widest">Parental Node</span>
            </button>
          </div>
        </div>

        <button 
          onClick={handleTopUp} 
          disabled={loading} 
          className="w-full btn-premium-primary py-6 flex items-center justify-center space-x-3"
        >
          <CreditCard size={20} />
          <span className="font-black text-sm uppercase tracking-[0.2em]">{loading ? 'Processing Gateway...' : 'Authorize Deposit'}</span>
        </button>
      </div>

      <div className="text-slate-700 text-center text-[10px] font-bold uppercase tracking-tighter">
        * Secure Encryption Active • Layer 2 Tunneling Protocol
      </div>
    </div>
  );
};

export default TopUpWallet;
