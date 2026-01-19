import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Clock, User } from 'lucide-react';

const BottomNav = () => {
  return (
    <nav className="floating-nav">
      <NavLink to="/student/dashboard" className={({isActive}) => `flex flex-col items-center transition-all ${isActive ? 'text-primary scale-110' : 'text-slate-500 hover:text-slate-300'}`}>
        <Home size={24} strokeWidth={2.5} />
        <span className="text-[10px] mt-1 font-bold uppercase tracking-wider">Home</span>
      </NavLink>
      <NavLink to="/student/transactions" className={({isActive}) => `flex flex-col items-center transition-all ${isActive ? 'text-primary scale-110' : 'text-slate-500 hover:text-slate-300'}`}>
        <Clock size={24} strokeWidth={2.5} />
        <span className="text-[10px] mt-1 font-bold uppercase tracking-wider">History</span>
      </NavLink>
      <NavLink to="/profile" className={({isActive}) => `flex flex-col items-center transition-all ${isActive ? 'text-primary scale-110' : 'text-slate-500 hover:text-slate-300'}`}>
        <User size={24} strokeWidth={2.5} />
        <span className="text-[10px] mt-1 font-bold uppercase tracking-wider">Profile</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
