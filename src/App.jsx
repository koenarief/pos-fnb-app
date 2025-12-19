import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';

import Login from './pages/Login';
import Home from './pages/Home';
import POS from './pages/POS';
import AddMenu from './pages/AddMenu';
import ManageMenu from './pages/ManageMenu';
import Reports from './pages/Reports';
import Expenses from './pages/Expenses';
import ProfitLoss from './pages/ProfitLoss';

// Komponen sederhana untuk halaman lain yang belum dibuat
const Placeholder = ({ title }) => (
  <div className="p-8">
    <h1 className="text-2xl font-bold">{title}</h1>
    <p>Halaman ini sedang dalam pengembangan.</p>
    <a href="/" className="text-blue-500 underline">Kembali ke Home</a>
  </div>
);

function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  if (initializing) return <div className="h-screen flex items-center justify-center">Memuat...</div>;
  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
        <Route path="/pos" element={user ? <POS /> : <Navigate to="/login" />} />
        <Route path="/kitchen" element={<Placeholder title="Dapur" />} />
		<Route path="/reports" element={user ? <Reports /> : <Navigate to="/login" />} />
		<Route path="/menu/add" element={user ? <AddMenu /> : <Navigate to="/login" />} />
		<Route path="/menu/manage" element={user ? <ManageMenu /> : <Navigate to="/login" />} />
        <Route path="/settings" element={<Placeholder title="Pengaturan" />} />
		<Route path="/expenses" element={user ? <Expenses /> : <Navigate to="/login" />} />
		<Route path="/profit-loss" element={user ? <ProfitLoss /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
