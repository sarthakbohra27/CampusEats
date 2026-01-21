import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import BottomNav from '../components/BottomNav';
import dayjs from 'dayjs';
import { Plus, CreditCard, ArrowRight, Wallet, User, TrendingUp, TrendingDown, Zap, CalendarX } from 'lucide-react';

const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let start = displayValue;
    let end = value;
    if (start === end) return;

    let startTime = null;
    const duration = 500; // 0.5s

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const current = Math.floor(progress * (end - start) + start);
      setDisplayValue(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  return <span>{displayValue.toLocaleString()}</span>;
};

const StudentDashboard = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mealSlot, setMealSlot] = useState('');
  const [projection, setProjection] = useState(null);
  const [showSmartTopUp, setShowSmartTopUp] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (projection) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [projection]);

  useEffect(() => {
    const detectMealSlot = () => {
      const hour = new Date().getHours();
      if (hour >= 7 && hour < 11) setMealSlot('BREAKFAST');
      else if (hour >= 11 && hour < 15) setMealSlot('LUNCH');
      else if (hour >= 18 && hour < 22) setMealSlot('DINNER');
      else setMealSlot('N/A');
    };

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
        const txRes = await api.get(`/transactions?t=${Date.now()}`);
        const latestTx = txRes.data.slice(0, 5);
        setTransactions(latestTx);
        return txRes.data;
      } catch (err) {
        console.error('Transactions fetch failed:', err);
        return [];
      }
    };

    const fetchProjection = async (txHistory) => {
      try {
        const projRes = await api.get('/wallet/projection');
        const projData = projRes.data;
        setProjection(projData);

        // Smart Top-Up Logic
        const now = new Date();
        const hour = now.getHours();
        const isNearEnd = (hour === 10 || hour === 14 || hour === 21);
        const last24hCount = txHistory.filter(t => dayjs().diff(dayjs(t.timestamp), 'hour') <= 24).length;
        
        setShowSmartTopUp(projData.projected_balance < 50 && isNearEnd && last24hCount >= 3);
      } catch (err) {
        console.error('Projection fetch failed:', err);
      }
    };

    const fetchData = async () => {
      setLoading(true);
      detectMealSlot();
      const [ , txHistory] = await Promise.all([fetchBalance(), fetchTransactions()]);
      await fetchProjection(txHistory || []);
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
          <div className="flex justify-between items-start mb-1">
            <div className="flex items-center space-x-2">
              <Wallet size={14} className="text-primary" />
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-tighter">Current Balance</h3>
            </div>
            {balance < 100 && (
              <div className="bg-red-500/20 text-red-500 text-[8px] font-black px-2 py-1 rounded-md border border-red-500/30 animate-pulse tracking-widest">
                LOW FUNDS
              </div>
            )}
          </div>
          <div className={`text-5xl font-black text-white tracking-tighter mb-6 flex items-baseline transition-colors duration-500 ${isPulsing ? 'animate-pulse text-primary' : ''}`}>
            <span className="text-2xl font-light opacity-50 mr-1">₹</span>
            <AnimatedNumber value={balance} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-[10px] font-bold text-primary bg-emerald-500/10 w-fit px-3 py-1 rounded-full border border-primary/20">
              ● SYSTEM SECURED
            </div>
            <div className="text-[10px] font-black text-slate-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
              SLOT: <span className="text-white">{mealSlot}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Projection Intelligence Panel */}
      {projection && (
        <div className="w-[85%] mx-auto -mt-6 mb-10 glass-premium p-4 backdrop-blur-md border-white/5 flex items-center justify-between relative overflow-hidden group shadow-2xl shadow-black/20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
          <div className="flex items-center space-x-3 relative z-10">
            {projection.projected_balance >= balance ? (
              <TrendingUp size={16} className="text-emerald-500" />
            ) : (
              <TrendingDown size={16} className="text-amber-500" />
            )}
            <div>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Projected After {mealSlot !== 'N/A' ? mealSlot : 'Meal'}</p>
              <p className={`text-sm font-black tracking-tighter ${
                projection.projected_balance >= 200 ? 'text-emerald-500' : 
                projection.projected_balance >= 100 ? 'text-amber-500' : 'text-red-500'
              }`}>
                ₹{projection.projected_balance.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="text-[8px] font-black text-slate-500 bg-white/5 px-2 py-1 rounded border border-white/5 uppercase">
            Acc: {Math.round(projection.confidence_score * 100)}%
          </div>
        </div>
      )}

      {/* Smart Top-up Action */}
      {showSmartTopUp && projection?.suggestion_amount && (
        <button 
          onClick={() => navigate('/student/topup', { state: { preset: projection.suggestion_amount } })}
          className="w-full mb-8 glass-premium py-4 border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center space-x-3 hover:bg-primary/10 transition-all border animate-pulse group"
        >
          <Zap size={14} fill="currentColor" className="group-hover:scale-125 transition-transform" />
          <span>Smart Inject: ₹{projection.suggestion_amount}</span>
        </button>
      )}

      {/* Quick Top-up Logic Inject - Best Version Enhancement */}
      <div className="flex space-x-3 mb-8">
        {[100, 500].map(amt => (
          <button 
            key={amt}
            onClick={() => navigate('/student/topup', { state: { preset: amt } })}
            className="flex-1 glass-premium py-2 border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/10 hover:text-primary transition-all flex items-center justify-center space-x-2"
          >
            <Plus size={12} />
            <span>Top Up ₹{amt}</span>
          </button>
        ))}
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

        <div 
          onClick={() => navigate('/student/meal-skip')} 
          className="glass-premium p-6 flex flex-col justify-between h-40 cursor-pointer hover:bg-white/10 transition-all border-white/5 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
            <CalendarX size={24} strokeWidth={3} />
          </div>
          <div>
            <span className="font-extrabold text-lg block">Skip Meal</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase">Reduce Waste</span>
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
