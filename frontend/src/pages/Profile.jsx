import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import BottomNav from '../components/BottomNav';
import { Shield, Share2, LogOut, ChevronRight, User as UserIcon, QrCode } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  const [qrBase64, setQrBase64] = useState('');
  const [shareLink, setShareLink] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchQR = async () => {
      try {
        const res = await api.get('/qr/generate');
        setQrBase64(res.data.qr_image);
      } catch (err) {
        console.error(err);
      }
    };
    if (user.role === 'student') fetchQR();
  }, [user.role]);

  const handleShare = async () => {
    setLoading(true);
    try {
      const res = await api.get('/wallet/share');
      setShareLink(res.data.share_url);
    } catch (err) {
      alert('Link generation sequence failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen pt-16 px-6 pb-32 max-w-lg mx-auto overflow-hidden">
      <div className="flex flex-col items-center mb-12">
        <div className="w-28 h-28 rounded-[40px] bg-gradient-to-tr from-primary to-secondary p-1.5 shadow-2xl shadow-primary/20 mb-6">
          <div className="w-full h-full rounded-[36px] bg-slate-950 flex items-center justify-center text-5xl font-black tracking-tighter text-white uppercase italic">
            {user.email[0]}
          </div>
        </div>
        
        <h1 className="text-3xl font-black tracking-tighter text-white mb-2">{user.email.split('@')[0]}</h1>
        <div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-5 py-2 rounded-2xl">
          <Shield size={14} className="text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{user.role} Privilege</span>
        </div>
      </div>

      {user.role === 'student' && (
        <div className="glass-premium p-8 mb-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-50"></div>
          
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
              <QrCode size={18} className="text-primary" />
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Payment Token</h3>
            </div>
            <span className="text-[8px] font-black text-emerald-500 animate-pulse bg-emerald-500/10 px-2 py-1 rounded-md">LIVE</span>
          </div>

          <div className="flex flex-col items-center">
            {qrBase64 ? (
              <div className="p-5 bg-white rounded-[32px] shadow-2xl shadow-black/50 mb-6 group-hover:scale-105 transition-transform duration-500">
                <img src={qrBase64} alt="QR Code" className="w-48 h-48 mix-blend-multiply" />
              </div>
            ) : (
              <div className="w-56 h-56 bg-white/5 rounded-[40px] mb-6 animate-pulse border border-white/10"></div>
            )}
            <p className="text-[10px] text-slate-500 font-bold tracking-tight text-center mb-8 uppercase">Dynamic Refresh: 5 Minutes</p>
            
            <button 
              onClick={handleShare}
              disabled={loading}
              className="w-full btn-premium-secondary flex items-center justify-center space-x-3 py-5"
            >
              <Share2 size={18} />
              <span className="font-black uppercase tracking-widest text-xs">
                {loading ? 'Initializing Pipeline...' : (shareLink ? 'Link Buffered to Clipboard' : 'Share Proxy Link')}
              </span>
            </button>
            
            {shareLink && (
              <div className="mt-6 p-5 bg-white/5 rounded-2xl border border-white/10 text-[9px] text-slate-500 font-mono break-all w-full text-center leading-relaxed">
                <span className="text-primary font-bold">SHA-256:</span> {shareLink}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <button className="w-full p-6 glass-premium border-white/5 flex justify-between items-center group hover:glass-border-highlight transition-all">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
              <Shield size={20} />
            </div>
            <span className="font-bold text-slate-200 tracking-tight">Security Protocols</span>
          </div>
          <ChevronRight size={18} className="text-slate-700 group-hover:text-white transition-all transform group-hover:translate-x-1" />
        </button>

        <button className="w-full p-6 glass-premium border-white/5 flex justify-between items-center group hover:glass-border-highlight transition-all">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
              <UserIcon size={20} />
            </div>
            <span className="font-bold text-slate-200 tracking-tight">System Information</span>
          </div>
          <ChevronRight size={18} className="text-slate-700 group-hover:text-white transition-all transform group-hover:translate-x-1" />
        </button>

        <button 
          onClick={logout}
          className="w-full p-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-3xl font-black uppercase tracking-[0.2em] text-xs mt-10 hover:bg-red-500 transition-all hover:text-white active:scale-[0.98]"
        >
          Deactivate Session
        </button>
      </div>

      {user.role === 'student' && <BottomNav />}
    </div>
  );
};

export default Profile;
