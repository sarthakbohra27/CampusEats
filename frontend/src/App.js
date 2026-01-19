import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import VendorPOS from './pages/VendorPOS';
import AdminDashboard from './pages/AdminDashboard';
import TopUpWallet from './pages/TopUpWallet';
import TransactionHistory from './pages/TransactionHistory';
import Profile from './pages/Profile';
import UserManagement from './pages/UserManagement';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token } = useAuth();
  
  if (!token) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" />;
  }
  
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Student Routes */}
      <Route path="/student/dashboard" element={
        <ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>
      } />
      <Route path="/student/topup" element={
        <ProtectedRoute allowedRoles={['student']}><TopUpWallet /></ProtectedRoute>
      } />
      <Route path="/student/transactions" element={
        <ProtectedRoute allowedRoles={['student']}><TransactionHistory /></ProtectedRoute>
      } />
      
      {/* Vendor Routes */}
      <Route path="/vendor/pos" element={
        <ProtectedRoute allowedRoles={['vendor']}><VendorPOS /></ProtectedRoute>
      } />
      
      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute><Profile /></ProtectedRoute>
      } />
      
      {/* Root Redirect */}
      <Route path="/" element={
        !user ? <Navigate to="/login" /> : 
        user.role === 'student' ? <Navigate to="/student/dashboard" /> :
        user.role === 'vendor' ? <Navigate to="/vendor/pos" /> :
        <Navigate to="/admin/dashboard" />
      } />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
