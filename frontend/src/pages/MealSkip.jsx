import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import dayjs from 'dayjs';
import { CalendarX, ArrowLeft, Trash2, Info, Leaf, Utensils, Coffee, Moon } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const MealSkip = () => {
  const [skips, setSkips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mealSlot, setMealSlot] = useState('LUNCH');
  const [skipDate, setSkipDate] = useState(dayjs().add(1, 'day').format('YYYY-MM-DD'));
  const [reason, setReason] = useState('');
  const navigate = useNavigate();
  const { showToast } = useToast();

  const minDate = dayjs().add(1, 'day').format('YYYY-MM-DD');

  useEffect(() => {
    fetchSkips();
  }, []);

  const fetchSkips = async () => {
    try {
      const res = await api.get('/meal/skips?upcoming=true');
      setSkips(res.data);
    } catch (err) {
      console.error('Failed to fetch skips:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/meal/skip', {
        meal_slot: mealSlot,
        skip_date: skipDate,
        reason: reason
      });
      showToast('Meal skip scheduled successfully', 'success');
      setReason('');
      fetchSkips();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to schedule skip', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (skipId) => {
    try {
      await api.delete(`/meal/skip/${skipId}`);
      showToast('Meal skip cancelled', 'success');
      fetchSkips();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel', 'error');
    }
  };

  const getSlotIcon = (slot) => {
    switch (slot) {
      case 'BREAKFAST': return <Coffee size={14} />;
      case 'LUNCH': return <Utensils size={14} />;
      case 'DINNER': return <Moon size={14} />;
      default: return <Utensils size={14} />;
    }
  };

  return (
    <div className="pb-32 pt-12 px-6 max-w-lg mx-auto min-h-screen bg-slate-950 text-white font-inter">
      <header className="flex items-center mb-10">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl glass-premium flex items-center justify-center mr-4 hover:bg-white/10 transition-all">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Sustainability Portal</h2>
          <h1 className="text-2xl font-extrabold tracking-tight">Meal Skip Manager</h1>
        </div>
      </header>

      {/* Impact Card */}
      <div className="glass-premium bg-emerald-500/5 border-emerald-500/20 p-6 mb-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
        <div className="flex items-center space-x-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
            <Leaf size={24} />
          </div>
          <div>
            <h3 className="font-bold text-sm">Waste Reduction Impact</h3>
            <p className="text-xs text-slate-400">By skipping meals you won't eat, you help us save ~400g of food and reduce carbon footprint.</p>
          </div>
        </div>
      </div>

      {/* Schedule Form */}
      <section className="mb-10">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4 ml-1">Schedule New Skip</h3>
        <form onSubmit={handleSubmit} className="glass-premium p-6 space-y-6">
          <div className="space-y-4">
            <label className="block">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Meal Slot</span>
              <div className="grid grid-cols-3 gap-3">
                {['BREAKFAST', 'LUNCH', 'DINNER'].map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setMealSlot(slot)}
                    className={`py-3 px-2 rounded-xl text-[10px] font-black border transition-all flex flex-col items-center space-y-2 ${mealSlot === slot ? 'bg-primary/20 border-primary text-primary shadow-lg shadow-primary/10' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}
                  >
                    {getSlotIcon(slot)}
                    <span>{slot}</span>
                  </button>
                ))}
              </div>
            </label>

            <label className="block">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Select Date</span>
              <input
                type="date"
                min={minDate}
                value={skipDate}
                onChange={(e) => setSkipDate(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-sm font-bold outline-none focus:border-primary transition-all text-white"
                required
              />
            </label>

            <label className="block">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Reason (Optional)</span>
              <input
                type="text"
                placeholder="Going home, event elsewhere..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-xl p-4 text-sm font-bold outline-none focus:border-primary transition-all text-white placeholder:text-slate-600"
              />
            </label>
          </div>

          <div className="flex items-start space-x-2 text-[8px] font-bold text-slate-500 bg-white/5 p-3 rounded-lg border border-white/5">
            <Info size={12} className="shrink-0 mt-0.5" />
            <p className="leading-relaxed">Skips must be scheduled at least 24 hours in advance. You can cancel requests up to 12 hours before the meal.</p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-2 ${submitting ? 'bg-slate-800 text-slate-500' : 'btn-premium-primary'}`}
          >
            {submitting ? 'Scheduling...' : (
              <>
                <CalendarX size={14} />
                <span>Confirm Meal Skip</span>
              </>
            )}
          </button>
        </form>
      </section>

      {/* Upcoming Skips */}
      <section>
        <div className="flex justify-between items-end mb-6 ml-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Scheduled Skips</h3>
          <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded uppercase">{skips.length} Active</span>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="h-20 glass-premium animate-pulse"></div>
          ) : skips.length === 0 ? (
            <div className="glass-premium p-8 text-center text-slate-500 text-sm italic">
              No upcoming skips scheduled.
            </div>
          ) : (
            skips.map(skip => (
              <div key={skip.id} className="glass-premium p-5 flex justify-between items-center group">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
                    {getSlotIcon(skip.meal_slot)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm tracking-tight">{dayjs(skip.skip_date).format('DD MMM YYYY')}</h4>
                    <div className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                      <span className="text-primary">{skip.meal_slot}</span>
                      {skip.reason && <span className="mx-2">•</span>}
                      {skip.reason && <span className="opacity-60 truncate max-w-[100px]">{skip.reason}</span>}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleCancel(skip.id)}
                  className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default MealSkip;
