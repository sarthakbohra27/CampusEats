import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import BottomNav from '../components/BottomNav';
import dayjs from 'dayjs';
import { ArrowLeft, Filter, Search, TrendingUp, TrendingDown, Activity } from 'lucide-react';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ venue: '', type: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const res = await api.get('/transactions', { params: filter });
        setTransactions(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [filter]);

  return (
    <div className="pt-16 px-6 pb-32 max-w-lg mx-auto bg-slate-950 min-h-screen text-white">
      <header className="flex flex-col space-y-8 mb-12">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
             <button onClick={() => navigate(-1)} className="glass-premium p-3 border-white/5 text-slate-400">
               <ArrowLeft size={18} />
             </button>
             <h1 className="text-3xl font-black tracking-tighter">Ledger</h1>
          </div>
          <div className="w-10 h-10 rounded-xl glass-premium flex items-center justify-center text-slate-500 border-white/5">
            <Search size={18} />
          </div>
        </div>
        
        <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400">
            <Filter size={12} className="text-primary" />
            <span>Filtering By:</span>
          </div>
          <select 
            className="bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest px-4 py-2 outline-none focus:border-primary transition-all text-white min-w-[120px]"
            value={filter.venue}
            onChange={(e) => setFilter({...filter, venue: e.target.value})}
          >
            <option value="">All Regions</option>
            <option value="Mess 1">Sector: Mess 1</option>
            <option value="Night Canteen">Sector: NC</option>
            <option value="Mess 2">Sector: Mess 2</option>
          </select>
        </div>
      </header>

      <div className="space-y-6">
        {loading ? [1,2,3,4,5].map(i => <div key={i} className="h-20 animate-pulse glass-premium"></div>) : 
         transactions.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-24 text-slate-700">
             <Activity size={48} className="mb-4 opacity-20" />
             <span className="font-black uppercase tracking-[0.3em] text-[10px]">Zero Transactions Logged</span>
           </div>
         ) :
         transactions.map((tx, idx) => {
           const isNewDate = idx === 0 || dayjs(tx.timestamp).format('DD MMM') !== dayjs(transactions[idx-1].timestamp).format('DD MMM');
           return (
             <React.Fragment key={tx.id}>
               {isNewDate && (
                 <h4 className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] mt-10 mb-4 flex items-center">
                   <span className="mr-4">{dayjs(tx.timestamp).format('DD MMMM YYYY')}</span>
                   <div className="flex-1 h-[1px] bg-slate-900"></div>
                 </h4>
               )}
               <div className="glass-premium p-5 flex justify-between items-center transition-all hover:glass-border-highlight group border-white/5">
                 <div className="flex items-center space-x-4">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.amount > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                     {tx.amount > 0 ? <TrendingUp size={20} strokeWidth={3} /> : <TrendingDown size={20} strokeWidth={3} />}
                   </div>
                   <div>
                     <h4 className="font-bold tracking-tight text-sm text-slate-200">{tx.description}</h4>
                     <p className="text-[10px] text-slate-600 font-black uppercase tracking-tighter">
                       {tx.venue || 'SYSTEM'} • {dayjs(tx.timestamp).format('hh:mm A')}
                     </p>
                   </div>
                 </div>
                 <div className="text-right">
                   <div className={`font-black tracking-tighter text-lg ${tx.amount > 0 ? 'text-emerald-400' : 'text-white'}`}>
                     {tx.amount > 0 ? `+₹${Math.abs(tx.amount).toLocaleString()}` : `-₹${Math.abs(tx.amount).toLocaleString()}`}
                   </div>
                   <p className="text-[8px] text-slate-700 font-extrabold uppercase tracking-widest mt-1">{tx.source || 'INTERNAL'}</p>
                 </div>
               </div>
             </React.Fragment>
           );
         })
        }
      </div>

      <BottomNav />
    </div>
  );
};

export default TransactionHistory;
