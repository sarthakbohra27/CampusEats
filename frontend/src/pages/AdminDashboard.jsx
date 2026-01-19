import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { TrendingUp, Users, Activity, Leaf, LogOut, ChevronRight } from 'lucide-react';

const AdminDashboard = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/admin/reports');
        setReports(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Synchronizing Ecosystem Data...</p>
    </div>
  );

  const barData = Object.entries(reports.venue_report).map(([name, count]) => ({ name, count }));
  const pieData = Object.entries(reports.source_report).map(([name, value]) => ({ name, value }));
  const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B'];

  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-12 font-inter max-w-[1600px] mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 space-y-6 md:space-y-0 text-white">
        <div>
          <div className="flex items-center space-x-2 text-primary font-black tracking-[0.3em] uppercase text-xs mb-2">
            <Activity size={14} />
            <span>Infrastructure Core</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter">System Analytics</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/admin/users')} 
            className="btn-premium-secondary flex items-center space-x-2 py-3 px-6 text-sm"
          >
            <Users size={18} />
            <span>Personnel Mgmt</span>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 text-white">
        <div className="glass-premium p-8 relative overflow-hidden group border-emerald-500/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
          <TrendingUp className="text-emerald-500 mb-6" size={32} />
          <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Volume</h3>
          <p className="text-3xl font-black tracking-tighter">₹{reports.total_volume.toLocaleString()}</p>
        </div>
        <div className="glass-premium p-8 relative overflow-hidden group border-blue-500/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
          <Activity className="text-blue-500 mb-6" size={32} />
          <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Transaction Load</h3>
          <p className="text-3xl font-black tracking-tighter">{reports.total_transactions}</p>
        </div>
        <div className="glass-premium p-8 relative overflow-hidden group border-amber-500/20 bg-emerald-500/5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
          <Leaf className="text-emerald-500 mb-6" size={32} />
          <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Waste Reduction</h3>
          <p className="text-3xl font-black tracking-tighter text-emerald-400">{reports.waste_reduction_pct}%</p>
        </div>
        <div className="glass-premium p-8 relative overflow-hidden group border-indigo-500/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
          <Users className="text-indigo-500 mb-6" size={32} />
          <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Ecosystem Entities</h3>
          <p className="text-3xl font-black tracking-tighter">{reports.active_users}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 text-white">
        {/* Venue Distribution Bar Chart */}
        <div className="glass-premium p-8 lg:p-10 border-white/5">
          <div className="flex justify-between items-center mb-10 text-white">
            <h3 className="text-xl font-black tracking-tight">Venue Performance</h3>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Real-time Traffic</span>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <XAxis dataKey="name" stroke="#475569" fontSize={11} fontWeight={700} tickLine={false} axisLine={false} dy={10} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }}
                  itemStyle={{ color: '#10B981', fontWeight: 900 }}
                />
                <Bar dataKey="count" fill="url(#colorBar)" radius={[8, 8, 0, 0]}>
                  <defs>
                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top-up Source Pie Chart */}
        <div className="glass-premium p-8 lg:p-10 border-white/5">
          <div className="flex justify-between items-center mb-10 text-white">
            <h3 className="text-xl font-black tracking-tight">Financial Inflow Sources</h3>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Capital Pipeline</span>
          </div>
          <div className="h-[350px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* High-Impact Sustainability Info */}
      <div className="glass-premium p-10 bg-gradient-to-r from-emerald-500/10 to-transparent border-emerald-500/20 overflow-hidden relative">
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
          <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 text-center w-full lg:w-fit min-w-[200px] backdrop-blur-xl">
            <div className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">Impact Growth</div>
            <div className="text-5xl font-black text-emerald-400 tracking-tighter mb-1">↑ 12%</div>
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Incremental Lift</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
