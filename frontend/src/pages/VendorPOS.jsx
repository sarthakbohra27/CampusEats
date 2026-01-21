import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import QRScanner from '../components/QRScanner';
import { LogOut, MapPin, Coffee, Utensils, Moon, Candy, Camera, History, ShoppingBag, Leaf } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import dayjs from 'dayjs';

const VendorPOS = () => {
  const [scanning, setScanning] = useState(false);
  const [venue, setVenue] = useState('Mess 1');
  const [mealType, setMealType] = useState('Lunch');
  const [mealCost, setMealCost] = useState(70);
  const [sessionStats, setSessionStats] = useState({ count: 0, total: 0 });
  const [skipStats, setSkipStats] = useState({ summary: { BREAKFAST: 0, LUNCH: 0, DINNER: 0 } });
  
  const navigate = useNavigate();
  const { showToast } = useToast();

  React.useEffect(() => {
    fetchSkipStats();
  }, []);

  const fetchSkipStats = async () => {
    try {
      const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
      const res = await api.get(`/meal/skips/upcoming?date=${tomorrow}`);
      setSkipStats(res.data);
    } catch (err) {
      console.error('Failed to fetch skip stats:', err);
    }
  };

  const mealPresets = [
    { name: 'Breakfast', cost: 30, icon: <Coffee size={24} /> },
    { name: 'Lunch', cost: 70, icon: <Utensils size={24} /> },
    { name: 'Dinner', cost: 60, icon: <Moon size={24} /> },
    { name: 'Snack', cost: 20, icon: <Candy size={24} /> }
  ];

  const handleMealSelect = (m) => {
    setMealType(m.name);
    setMealCost(m.cost);
  };

  const onScanSuccess = async (decodedText) => {
    setScanning(false);
    try {
      const qrPayload = JSON.parse(decodedText);
      await api.post('/meal/deduct', {
        qr_payload: qrPayload,
        meal_cost: mealCost,
        description: `Meal: ${mealType}`,
        venue: venue
      });
      setSessionStats(prev => ({
        count: prev.count + 1,
        total: prev.total + mealCost
      }));
      showToast(`${mealType} authorized for student`, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Transaction Void', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col p-6 lg:p-12 font-inter">
      {/* Header */}
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary font-black italic shadow-lg shadow-primary/10">CE</div>
          <div>
            <h1 className="text-xl font-black tracking-tight">Canteen Merchant</h1>
            <div className="flex items-center text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">
              <MapPin size={10} className="mr-1" />
              {venue} • TERMINAL #42
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <select
            className="bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold transition-all focus:border-primary outline-none cursor-pointer"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
          >
            <option>Mess 1</option>
            <option>Mess 2</option>
            <option>Night Canteen</option>
            <option>Canteen A</option>
          </select>
          <button onClick={() => navigate('/login')} className="text-slate-500 hover:text-white transition-colors p-2">
            <LogOut size={24} />
          </button>
        </div>
      </header>

      {/* Main Split Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-10">

        {/* Left: Configuration (2/5) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-premium p-8">
            <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8">Meal Selection</h3>
            <div className="grid grid-cols-2 gap-4">
              {mealPresets.map(m => (
                <button
                  key={m.name}
                  onClick={() => handleMealSelect(m)}
                  className={`p-8 rounded-3xl border-2 transition-all flex flex-col items-center justify-center space-y-3 ${mealType === m.name ? 'border-primary bg-primary/10 text-primary shadow-xl shadow-primary/10' : 'border-white/5 bg-white/5 hover:bg-white/10 text-slate-400'}`}
                >
                  <div className={`p-3 rounded-2xl ${mealType === m.name ? 'bg-primary/20' : 'bg-white/5'}`}>
                    {m.icon}
                  </div>
                  <span className="font-black text-sm uppercase tracking-tight">{m.name}</span>
                  <span className="text-xs font-medium opacity-60">₹{m.cost}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-premium p-8">
            <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6">Price Adjustment</h3>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-light text-slate-500 tracking-tighter">₹</span>
              <input
                type="number"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 pl-12 text-4xl font-black tracking-tighter outline-none focus:border-primary transition-all"
                value={mealCost}
                onChange={(e) => setMealCost(parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div className="glass-premium p-8 bg-emerald-500/5 border-emerald-500/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
            <div className="flex items-center space-x-3 mb-6 relative z-10">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-500">
                <Leaf size={16} />
              </div>
              <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Waste Intelligence</h3>
            </div>
            
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">Skips scheduled for tomorrow:</p>
            
            <div className="grid grid-cols-3 gap-2">
              {['BREAKFAST', 'LUNCH', 'DINNER'].map(slot => (
                <div key={slot} className="bg-white/5 border border-white/5 p-3 rounded-xl flex flex-col items-center">
                  <span className="text-[8px] font-black text-slate-500 mb-1">{slot}</span>
                  <span className="text-xl font-black text-emerald-500">{skipStats.summary[slot] || 0}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
              <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Planned Savings</div>
              <div className="text-[10px] font-black text-white bg-white/5 px-2 py-1 rounded">
                ~{(Object.values(skipStats.summary).reduce((a, b) => a + b, 0) * 0.4).toFixed(1)}kg Saved
              </div>
            </div>
          </div>
        </div>

        {/* Right: Interaction (3/5) */}
        <div className="lg:col-span-3 space-y-8">
          {!scanning ? (
            <div className="glass-premium h-full flex flex-col items-center justify-center min-h-[400px] border-dashed border-white/10 bg-gradient-to-br from-white/5 to-transparent relative group">
              {/* Session Intelligence - Best Version Enhancement */}
              <div className="grid grid-cols-2 gap-4 mb-8 w-full max-w-sm">
                <div className="glass-premium p-6 border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl"></div>
                  <div className="flex items-center space-x-3 mb-2">
                    <History size={14} className="text-primary" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Served Today</span>
                  </div>
                  <div className="text-3xl font-black text-white">{sessionStats.count}</div>
                </div>
                <div className="glass-premium p-6 border-white/5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full blur-xl"></div>
                  <div className="flex items-center space-x-3 mb-2">
                    <ShoppingBag size={14} className="text-blue-400" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Credit</span>
                  </div>
                  <div className="text-3xl font-black text-white">₹{sessionStats.total.toLocaleString()}</div>
                </div>
              </div>

              <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mb-8 relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-25"></div>
                <div className="relative z-10 text-primary drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                  <Camera size={56} strokeWidth={1.5} />
                </div>
              </div>

              <h2 className="text-3xl font-black tracking-tighter mb-4 text-center">Ready to Accept Payment</h2>
              <p className="text-slate-500 text-sm mb-12 text-center max-w-xs">Ask the student to present the QR code from their Campus Wallet profile.</p>
              
              <button 
                onClick={() => setScanning(true)}
                className="btn-premium-primary w-full max-w-sm"
              >
                Launch QR Scanner
              </button>
            </div>
          ) : (
            <div className="glass-premium p-0 relative h-full flex flex-col bg-black overflow-hidden">
              <div className="flex-1 relative">
                <QRScanner onScanSuccess={onScanSuccess} onScanError={(err) => console.log(err)} />
              </div>
              <button 
                onClick={() => setScanning(false)} 
                className="mt-6 w-full py-4 text-slate-500 font-bold uppercase text-xs tracking-widest hover:text-white transition-all"
              >
                Cancel Scanning
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default VendorPOS;
