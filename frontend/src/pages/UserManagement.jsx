import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, UserCheck, ShieldCheck, IndianRupee, ArrowUpRight, Search, RefreshCcw } from 'lucide-react';

import { useToast } from '../context/ToastContext';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [refundAmount, setRefundAmount] = useState('');
  const navigate = useNavigate();
  const { showToast } = useToast();

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
      showToast(`Settlement of ₹${refundAmount} finalized`, 'success');
      setShowRefundModal(false);
      setRefundAmount('');
      fetchUsers();
    } catch (err) {
      showToast(err.response?.data?.message || 'Settlement Error', 'error');
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-12 font-inter max-w-[1400px] mx-auto text-white">
      <header className="flex items-center mb-12">
        <button 
          onClick={() => navigate('/admin/dashboard')} 
          className="mr-6 glass-premium p-4 border-white/5 hover:bg-white/10 transition-all text-slate-400"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex justify-between items-end flex-grow">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-white mb-2">Personnel Directory</h1>
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px]">Administrative Access Level 4</p>
          </div>
          <div className="relative group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Filter by email or name..." 
              className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-6 text-sm outline-none focus:border-primary transition-all w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div className="glass-premium overflow-hidden border-white/5 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-slate-500 text-[10px] uppercase font-black tracking-widest">
              <tr>
                <th className="px-8 py-6">Entity Identifier</th>
                <th className="px-8 py-6 text-right">Settled Balance</th>
                <th className="px-8 py-6 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="3" className="text-center py-20">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">Accessing Secure Records...</span>
                    </div>
                  </td>
                </tr>
              ) :
                filteredUsers.map(user => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                    <td className="p-6">
                      <div className="font-bold text-white">{user.email}</div>
                      <div className={`text-[8px] font-black uppercase tracking-widest w-fit px-2 py-0.5 rounded mt-1 ${
                        user.role === 'admin' ? 'bg-red-500/20 text-red-500' :
                        user.role === 'vendor' ? 'bg-blue-500/20 text-blue-500' :
                        'bg-emerald-500/20 text-emerald-500'
                      }`}>
                        {user.role}
                      </div>
                    <div className="text-[10px] text-slate-600 font-bold uppercase mt-0.5">Verified Liquidity</div>
                  </td>
                  <td className="px-8 py-7 text-right">
                    {user.role === 'student' && (
                      <button 
                        onClick={() => setSelectedUser(user)}
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
            <p className="text-sm text-slate-500 font-medium mb-8">Crediting student <strong className="text-white">#{selectedUser.id}</strong> ledger for administrative return.</p>
            
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
