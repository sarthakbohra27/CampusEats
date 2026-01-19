import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import BottomNav from '../components/BottomNav';
import dayjs from 'dayjs';
import { Plus, CreditCard, ArrowRight, Wallet, User } from 'lucide-react';

const StudentDashboard = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const balRes = await api.get(`/wallet/balance?t=${Date.now()}`);
        setBalance(balRes.data.balance);
      } catch (err) {
        console.error('Balance fetch failed:', err);
      }
    };

    const fetchTransactions = async () => {
      try {
        // Calling /transactions without the trailing slash matches the new backend route
        const txRes = await api.get(`/transactions?t=${Date.now()}`);
        setTransactions(txRes.data.slice(0, 5));
      } catch (err) {
        console.error('Transactions fetch failed:', err);
      }
    };

    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchBalance(), fetchTransactions()]);
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <div className="pb-32 pt-12 px-6 max-w-lg mx-auto overflow-hidden">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-slate-500 text-xs font-bold uppercase tracking-widest">Global Campus Card</h2>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Active Session</h1>
        </div>
        <div className="w-12 h-12 rounded-2xl glass-premium flex items-center justify-center border-white/20 shadow-primary/10">
          <User size={20} className="text-primary" />
        </div>
      </header>

      {/* Premium Balance Card */}
      <div className="glass-premium mesh-gradient-balance p-8 mb-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full -translate-y-24 translate-x-24 blur-[80px]"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-1">
            <Wallet size={14} className="text-primary" />
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-tighter">Current Balance</h3>
          </div>
          <div className="text-5xl font-black text-white tracking-tighter mb-6">
            <span className="text-2xl font-light opacity-50 mr-1">₹</span>
            {balance.toLocaleString()}
          </div>
          <div className="flex items-center text-[10px] font-bold text-primary bg-emerald-500/10 w-fit px-3 py-1 rounded-full border border-primary/20">
            ● SYSTEM SECURED
          </div>
        </div>
      </div>

      {/* Bento Grid Actions */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div 
          onClick={() => navigate('/student/topup')} 
          className="glass-premium p-6 flex flex-col justify-between h-40 cursor-pointer hover:bg-white/10 transition-all border-white/5 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <Plus size={24} strokeWidth={3} />
          </div>
          <div>
            <span className="font-extrabold text-lg block">Top Up</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase">Add Funds</span>
          </div>
        </div>
        
        <div 
          onClick={() => navigate('/profile')} 
          className="glass-premium p-6 flex flex-col justify-between h-40 cursor-pointer bg-blue-500/5 border-blue-500/20 group overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -translate-y-12 translate-x-12 blur-2xl"></div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-500 group-hover:rotate-12 transition-transform relative z-10">
            <CreditCard size={24} strokeWidth={2.5} />
          </div>
          <div className="relative z-10">
            <span className="font-extrabold text-lg block">Pay via QR</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase">Instant Scan</span>
          </div>
        </div>
      </div>

      {/* Recent History Section */}
      <section className="mb-10">
        <div className="flex justify-between items-end mb-6">
          <h3 className="text-lg font-black tracking-tight">Recent Activity</h3>
          <button onClick={() => navigate('/student/transactions')} className="text-primary text-[10px] font-black uppercase tracking-widest flex items-center space-x-1 hover:opacity-70 transition-opacity">
            <span>View All</span>
            <ArrowRight size={12} />
          </button>
        </div>
        
        <div className="space-y-3">
          {loading ? [1,2,3].map(i => <div key={i} className="h-20 animate-pulse glass-premium"></div>) : 
           transactions.length === 0 ? (
             <div className="glass-premium p-10 text-center text-slate-500 italic text-sm">
               Your digital ledger is empty.
             </div>
           ) :
           transactions.map(tx => (
            <div key={tx.id} className="glass-premium p-4 flex justify-between items-center transition-all hover:glass-border-highlight">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.amount > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                  {tx.amount > 0 ? <Plus size={20} strokeWidth={3} /> : <div className="text-lg font-black tracking-tighter">MEAL</div>}
                </div>
                <div>
                  <h4 className="font-bold text-sm tracking-tight">{tx.description}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">{dayjs(tx.timestamp).format('hh:mm A')} • {tx.venue || 'Wallet'}</p>
                </div>
              </div>
              <div className={`font-black tracking-tighter text-lg ${tx.amount > 0 ? 'text-emerald-400' : 'text-white'}`}>
                {tx.amount > 0 ? `+₹${Math.abs(tx.amount).toLocaleString()}` : `-₹${Math.abs(tx.amount).toLocaleString()}`}
              </div>
            </div>
           ))}
        </div>
      </section>

      <BottomNav />
    </div>
  );
};

export default StudentDashboard;
