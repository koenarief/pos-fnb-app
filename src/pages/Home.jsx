import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config'; // Pastikan path config benar
import { signOut } from 'firebase/auth';
import { 
  Loader2,
  ShoppingCart, 
  Wallet, 
  BarChart3, 
  Utensils, 
  Calculator, 
  LogOut, Settings
} from 'lucide-react';
import { toast } from "react-toastify";
import ConfirmDialog from "../components/ConfirmDialog";

import { useUserClaims } from "../firebase/userClaims";
import { fetchMerchantProfile } from '../store/merchantSlice';
import { useSelector, useDispatch } from 'react-redux';

const menuItems = [
  { 
    title: 'Kasir / POS', 
    icon: <ShoppingCart size={40} />, 
    color: 'bg-blue-600', 
    path: '/pos' 
  },
  { 
    title: 'Biaya', 
    icon: <Wallet size={40} />, // Wallet lebih cocok untuk pengeluaran/biaya
    color: 'bg-orange-500', 
    path: '/expenses' 
  },
  { 
    title: 'Laporan', 
    icon: <BarChart3 size={40} />, // BarChart3 mencerminkan grafik data penjualan
    color: 'bg-emerald-500', 
    path: '/reports' 
  },
  { 
    title: 'Manajemen Menu', 
    icon: <Utensils size={40} />, // Utensils langsung merujuk pada makanan/minuman (FnB)
    color: 'bg-purple-500', 
    path: '/menu/manage' 
  },
  { 
    title: 'Laba Rugi', 
    icon: <Calculator size={40} />, // Calculator melambangkan perhitungan profit bersih
    color: 'bg-slate-700', 
    path: '/profit-loss' 
  },
  { 
    title: 'Setting', 
    icon: <Settings size={40} />, // Calculator melambangkan perhitungan profit bersih
    color: 'bg-slate-700', 
    path: '/settings' 
  },
];

const Home = () => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [openLogout, setOpenLogout] = React.useState(false);
  const claims = useUserClaims();
  const dispatch = useDispatch();
  const { profile, loading } = useSelector((state) => state.merchant);

  useEffect(() => {
    if (claims?.merchantId) {
      dispatch(fetchMerchantProfile(claims?.merchantId));
    }
  }, [claims?.merchantId, dispatch]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      // Setelah sign out, App.jsx akan mendeteksi perubahan state 
      // dan otomatis mengarahkan ke halaman /login
    } catch (error) {
      console.error("Error saat logout:", error);
      toast("Gagal keluar. Silakan coba lagi.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-8 py-6 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{profile?.merchantName || 'Caffè POS'}</h1>
          <p className="text-gray-500 text-sm italic">User: {auth.currentUser?.email}</p>
        </div>
        
        <button 
          onClick={() => setOpenLogout(true)}
          disabled={isLoggingOut}
          className="flex items-center gap-2 px-4 py-2 text-red-600 font-bold border-2 border-red-100 rounded-xl hover:bg-red-50 active:scale-95 transition-all disabled:opacity-50"
        >
          {isLoggingOut ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              <LogOut size={20} />
              Keluar
            </>
          )}
        </button>
		<ConfirmDialog
			text="Apakah Anda yakin ingin keluar dari sistem?"
			isOpen={openLogout}
			onCancel={() => setOpenLogout(false)} 
			onConfirm={() => handleLogout()}
		/>
      </header>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)} // NAVIGASI DI SINI
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-xl hover:-translate-y-1 transition-all text-left"
            >
              <div className={`${item.color} p-4 rounded-xl text-white`}>
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800">{item.title}</h3>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;
