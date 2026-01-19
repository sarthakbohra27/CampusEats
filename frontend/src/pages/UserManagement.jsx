import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, UserCheck, ShieldCheck, IndianRupee, ArrowUpRight } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refundAmount, setRefundAmount] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRefund = async () => {
    if (!selectedUser || !refundAmount || refundAmount <= 0) return;
    try {
      await api.post('/admin/refund', { user_id: selectedUser.id, amount: parseFloat(refundAmount) });
      setSelectedUser(null);
      setRefundAmount('');
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Refund processing error.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-12 font-inter max-w-[1400px] mx-auto text-white">
      <header className="flex items-center mb-12">
        <button 
          onClick={() => navigate('/admin/dashboard')} 
          className="mr-6 glass-premium p-4 border-white/5 hover:bg-white/10 transition-all text-slate-400"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black tracking-tighter">Personnel Directory</h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Access Control & Balance Settlement</p>
        </div>
      </header>

      <div className="glass-premium overflow-hidden border-white/5 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-slate-500 text-[10px] uppercase font-black tracking-widest">
              <tr>
                <th className="px-8 py-6">Entity Identifier</th>
                <th className="px-8 py-6 text-center">Security Role</th>
                <th className="px-8 py-6 text-right">Settled Balance</th>
                <th className="px-8 py-6 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-20">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Accessing Secure Records...</span>
                    </div>
                  </td>
                </tr>
              ) :
               users.map(u => (
                <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-7">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary font-black uppercase shadow-inner text-sm">
                        {u.email[0]}
                      </div>
                      <span className="font-bold text-slate-200">{u.email}</span>
                    </div>
                  </td>
                  <td className="px-8 py-7 text-center">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${u.role === 'admin' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-blue-500/10 border-blue-500/20 text-blue-500'}`}>
                      {u.role === 'admin' ? <ShieldCheck size={12} className="mr-1.5" /> : <UserCheck size={12} className="mr-1.5" />}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-8 py-7 text-right">
                    <div className="font-black tracking-tighter text-xl text-white">₹{u.balance.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-600 font-bold uppercase mt-0.5">Verified Liquidity</div>
                  </td>
                  <td className="px-8 py-7 text-right">
                    {u.role === 'student' && (
                      <button 
                        onClick={() => setSelectedUser(u)}
                        className="btn-premium-secondary py-2 px-5 text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white"
                      >
                        Initiate Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Premium Refund Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[100] px-4 animate-in fade-in duration-300">
          <div className="glass-premium p-10 w-full max-w-md border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
            
            <h2 className="text-3xl font-black tracking-tighter mb-2">Process Settlement</h2>
            <p className="text-sm text-slate-500 font-medium mb-8">Debiting student <strong className="text-white">#{selectedUser.id}</strong> ledger for administrative return.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Settlement Amount (₹)</label>
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-primary">
                    <IndianRupee size={20} />
                  </div>
                  <input 
                    type="number"
                    className="w-full bg-white/5 border border-white/10 p-6 pl-12 rounded-2xl text-3xl font-black tracking-tighter outline-none focus:border-primary transition-all text-white placeholder:text-slate-800"
                    placeholder="0"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setSelectedUser(null)} 
                  className="flex-1 py-4 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:text-white transition-all"
                >
                  Cancel Operation
                </button>
                <button 
                  onClick={handleRefund} 
                  className="flex-1 btn-premium-primary text-[10px] uppercase font-black tracking-widest flex items-center justify-center"
                >
                  <span>Authorize Refund</span>
                  <ArrowUpRight size={14} className="ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
