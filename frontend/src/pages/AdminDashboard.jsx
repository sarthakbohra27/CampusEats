import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Label } from 'recharts';
import { Download, Users, Activity, Leaf, LogOut, TrendingUp, Zap, Shield, Radio } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const AdminDashboard = () => {
  const [reports, setReports] = useState(null);
  const [liveFeed, setLiveFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [systemPing, setSystemPing] = useState(12);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/admin/reports');
        setReports(res.data);
        
        // Fetch raw transactions for live feed
        const txRes = await api.get('/transactions');
        setLiveFeed(txRes.data.slice(0, 8));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();

    // Simulated Real-time latency fluctuations
    const pingInterval = setInterval(() => {
      setSystemPing(Math.floor(Math.random() * (45 - 8 + 1)) + 8);
    }, 5000);

    return () => clearInterval(pingInterval);
  }, []);

  const handleExportData = async () => {
    try {
      showToast('Preparing audit report...', 'info');
      const res = await api.get('/transactions');
      const data = res.data;

      const headers = ['ID', 'User ID', 'Amount', 'Type', 'Description', 'Venue', 'Timestamp'];
      const csvContent = [
        headers.join(','),
        ...data.map(t => [
          t.id,
          t.user_id,
          t.amount,
          t.transaction_type,
          `"${t.description}"`,
          `"${t.venue || ''}"`,
          t.timestamp
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `campuseats_audit_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Audit report downloaded', 'success');
    } catch (err) {
      showToast('Export failed', 'error');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Synchronizing Ecosystem Data...</p>
    </div>
  );

  if (!reports) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-6">
      <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500">
        <Shield size={48} />
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-black text-white mb-2">Sync Interrupted</h2>
        <p className="text-slate-500 text-sm max-w-xs mx-auto">Unable to establish a secure connection to the Intelligence Core. Please verify your administrative credentials.</p>
      </div>
      <button 
        onClick={() => window.location.reload()}
        className="btn-premium-primary px-8"
      >
        Retry Connection
      </button>
    </div>
  );

  const barData = Object.entries(reports.venue_report || {}).map(([name, count]) => ({ name, count }));
  const pieData = Object.entries(reports.source_report || {}).map(([name, value]) => ({ name, value }));
  const growthData = reports.growth_trend || [];
  const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-950 p-6 lg:p-12 font-inter max-w-[1600px] mx-auto"
    >
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 space-y-6 lg:space-y-0">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-4xl font-black tracking-tighter text-white">Intel Core</h1>
            <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">System Live: {systemPing}ms</span>
            </div>
          </div>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Real-time Ecosystem Intelligence</p>
        </div>
        <div className="flex space-x-4 w-full lg:w-auto">
          <button
            onClick={handleExportData}
            className="glass-premium flex-1 lg:flex-none px-6 py-3 border-white/5 flex items-center justify-center space-x-3 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all group"
          >
            <Download size={16} className="text-primary group-hover:bounce" />
            <span>Generate Audit</span>
          </button>
          <button
            onClick={() => navigate('/admin/users')}
            className="btn-premium-primary flex-1 lg:flex-none px-6 py-3 text-xs flex items-center justify-center space-x-3"
          >
            <Users size={16} />
            <span>User Matrix</span>
          </button>
          <button
            onClick={() => navigate('/login')}
            className="glass-premium p-3 border-white/5 hover:bg-white/10 transition-all text-slate-400"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Primary KPI Mesh Cards */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 text-white"
      >
        <div className="glass-premium p-8 relative overflow-hidden group border-emerald-500/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
          <div className="flex justify-between items-start mb-6">
            <TrendingUp className="text-emerald-500" size={32} />
            <div className="h-4 w-16 bg-emerald-500/10 rounded-full border border-emerald-500/20 px-2 py-0.5 flex items-center justify-center text-[8px] font-black text-emerald-500">↑ 12.4%</div>
          </div>
          <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Total volume</h3>
          <p className="text-3xl font-black tracking-tighter">₹{(reports.total_volume || 0).toLocaleString()}</p>
        </div>
        <div className="glass-premium p-8 relative overflow-hidden group border-blue-500/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
          <div className="flex justify-between items-start mb-6">
            <Activity className="text-blue-500" size={32} />
            <div className="bg-blue-500/10 h-3 w-12 rounded-full overflow-hidden flex items-center">
              <motion.div 
                animate={{ x: [-20, 20] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="h-full w-4 bg-blue-500 shadow-[0_0_10px_#3B82F6]"
              />
            </div>
          </div>
          <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">In-Flight tx</h3>
          <p className="text-3xl font-black tracking-tighter">{reports.total_transactions || 0}</p>
        </div>
        <div className="glass-premium p-8 relative overflow-hidden group border-amber-500/20 bg-emerald-500/5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
          <Leaf className="text-emerald-500 mb-6" size={32} />
          <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Waste reduction</h3>
          <p className="text-3xl font-black tracking-tighter text-emerald-400">{reports.waste_reduction_pct || 0}%</p>
        </div>
        <div className="glass-premium p-8 relative overflow-hidden group border-indigo-500/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
          <Users className="text-indigo-500 mb-6" size={32} />
          <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Entity Load</h3>
          <p className="text-3xl font-black tracking-tighter">{reports.active_users || 0}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 text-white">
        {/* Growth Trend Area Chart */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-premium p-8 lg:p-10 border-white/5 relative overflow-hidden"
        >
          <div className="flex justify-between items-center mb-10 relative z-10">
            <div>
              <h3 className="text-xl font-black tracking-tight">Transaction Growth</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">7-Day Volume Trend</p>
            </div>
            <Zap size={16} className="text-amber-500 animate-pulse" />
          </div>
          <div className="h-[300px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#10B981', fontWeight: 900 }}
                />
                <Area type="monotone" dataKey="volume" stroke="#10B981" strokeWidth={4} fillOpacity={1} fill="url(#colorVolume)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Dynamic Source Donut */}
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="glass-premium p-8 lg:p-10 border-white/5 flex flex-col items-center justify-center relative overflow-hidden"
        >
          <div className="flex justify-between w-full items-center mb-8 relative z-10">
            <h3 className="text-xl font-black tracking-tight">Capital Pipeline</h3>
            <span className="text-[10px] text-primary font-black uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Active Inflow</span>
          </div>
          <div className="h-[300px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={10}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                  <Label 
                    value="SOURCES" 
                    position="center" 
                    fill="#475569" 
                    style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.2em' }} 
                  />
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Live Event Terminal */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass-premium p-8 border-white/5 relative overflow-hidden min-h-[400px]"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-500">
                <Radio size={16} className="animate-pulse" />
              </div>
              <h3 className="text-xl font-black tracking-tight text-white">Live Transaction Stream</h3>
            </div>
            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest animate-pulse">● Connecting to Ledger...</div>
          </div>
          
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {liveFeed.map((tx, idx) => (
                <motion.div 
                  key={tx.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-4 glass-premium bg-white/[0.02] border-white/5 group hover:bg-white/[0.05] transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${tx.amount > 0 ? 'bg-emerald-500 shadow-[0_0_8px_#10B981]' : 'bg-blue-500 shadow-[0_0_8px_#3B82F6]'}`}></div>
                    <div>
                      <p className="text-xs font-black text-white">{tx.description}</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase">{tx.venue || 'Global Registry'} • {new Date(tx.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <div className={`text-sm font-black tracking-tighter ${tx.amount > 0 ? 'text-emerald-500' : 'text-slate-300'}`}>
                    {tx.amount > 0 ? `+₹${tx.amount.toLocaleString()}` : `-₹${Math.abs(tx.amount).toLocaleString()}`}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Venue Performance Bar Chart - Repurposed */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="glass-premium p-8 border-white/5"
        >
          <h3 className="text-lg font-black tracking-tight text-white mb-8">Venue Traffic</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 900 }} width={80} />
                <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
      {/* High-Impact Sustainability Info */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="glass-premium p-10 bg-gradient-to-r from-emerald-500/10 to-transparent border-emerald-500/20 overflow-hidden relative"
      >
        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="flex flex-col lg:flex-row items-center justify-between relative z-10 text-white">
          <div className="mb-8 lg:mb-0 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start space-x-2 text-emerald-400 font-black tracking-[0.2em] text-[10px] uppercase mb-4">
              <Leaf size={14} />
              <span>ESG Compliance Metric</span>
            </div>
            <h3 className="text-3xl font-black tracking-tighter mb-4 leading-none">Sustainability Index</h3>
            <p className="text-slate-400 max-w-2xl font-medium">
              Ecosystem consumption patterns indicate a significant reduction in surplus production. We are tracking a <strong className="text-white">{reports.waste_reduction_pct}% improvement</strong> in food optimization since system deployment.
            </p>
          </div>
          <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 text-center w-full lg:w-fit min-w-[200px] backdrop-blur-xl group">
            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">Impact Growth</div>
            <motion.div 
              initial={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
              className="text-5xl font-black text-emerald-400 tracking-tighter mb-1"
            >
              ↑ 12%
            </motion.div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Incremental Lift</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminDashboard;
