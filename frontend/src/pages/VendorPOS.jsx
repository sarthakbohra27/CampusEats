import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import QRScanner from '../components/QRScanner';
import { LogOut, MapPin, Coffee, Utensils, Moon, Candy, Camera, CheckCircle, XCircle } from 'lucide-react';

const VendorPOS = () => {
  const [scanning, setScanning] = useState(false);
  const [venue, setVenue] = useState('Mess 1');
  const [mealType, setMealType] = useState('Lunch');
  const [mealCost, setMealCost] = useState(70);
  const [status, setStatus] = useState(null); 
  const navigate = useNavigate();

  const mealPresets = [
    { name: 'Breakfast', cost: 30, icon: <Coffee size={24} /> },
    { name: 'Lunch', cost: 70, icon: <Utensils size={24} /> },
    { name: 'Dinner', cost: 60, icon: <Moon size={24} /> },
    { name: 'Snack', cost: 20, icon: <Candy size={24} /> }
  ];

  const handleMealSelect = (m) => {
    setMealType(m.name);
    setMealCost(m.cost);
    setStatus(null);
  };

  const onScanSuccess = async (decodedText) => {
    setScanning(false);
    try {
      const qrPayload = JSON.parse(decodedText);
      const res = await api.post('/meal/deduct', {
        qr_payload: qrPayload,
        meal_cost: mealCost,
        description: mealType,
        venue: venue
      });
      setStatus({ type: 'success', msg: `Payment of ₹${mealCost.toLocaleString()} successful.`, id: res.data.user_id });
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.message || 'Transaction failed.' });
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
        </div>

        {/* Right: Interaction (3/5) */}
        <div className="lg:col-span-3 space-y-8">
          {!scanning ? (
            <div className="glass-premium h-full flex flex-col items-center justify-center min-h-[400px] border-dashed border-white/10 bg-gradient-to-br from-white/5 to-transparent relative group">
              <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mb-8 relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-25"></div>
                <div className="relative z-10 text-primary drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                  <Camera size={56} strokeWidth={1.5} />
                </div>
              </div>
              
              <h2 className="text-3xl font-black tracking-tighter mb-4 text-center">Ready to Accept Payment</h2>
              <p className="text-slate-500 text-sm mb-12 text-center max-w-xs">Ask the student to present the QR code from their Campus Wallet profile.</p>
              
              <button 
                onClick={() => { setStatus(null); setScanning(true); }}
                className="btn-premium-primary w-full max-w-sm"
              >
                Launch QR Scanner
              </button>
            </div>
          ) : (
            <div className="glass-premium p-4 relative h-full flex flex-col bg-black">
              <div className="flex-1 rounded-2xl overflow-hidden relative">
                <div className="laser-line"></div>
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

          {/* Transaction Status Overlay/Banner */}
          {status && (
            <div className={`p-8 rounded-3xl border-2 flex items-center justify-between animate-in slide-in-from-bottom duration-500 ${status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
              <div className="flex items-center space-x-6">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${status.type === 'success' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                  {status.type === 'success' ? <CheckCircle size={32} /> : <XCircle size={32} />}
                </div>
                <div>
                  <h4 className={`text-xl font-black tracking-tighter ${status.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {status.type === 'success' ? 'Verified & Paid' : 'Payment Rejected'}
                  </h4>
                  <p className="text-sm text-slate-400 font-medium">{status.msg} {status.id && `ID: #${status.id}`}</p>
                </div>
              </div>
              <button onClick={() => setStatus(null)} className="text-slate-500 hover:text-white transition-colors">✕</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorPOS;
