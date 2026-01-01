import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config'; // Pastikan path config benar
import { signOut } from 'firebase/auth';
import { toast } from "react-toastify";
import ConfirmDialog from "../components/ConfirmDialog";

import { useUserClaims } from "../firebase/userClaims";
import { fetchMerchantProfile } from '../store/merchantSlice';
import { useSelector, useDispatch } from 'react-redux';

import { 
  Loader2,
  LogOut,
  ShoppingCart, 
  Receipt, 
  PieChart, 
  CalendarDays, 
  BarChart3, 
  UtensilsCrossed, 
  Scale, 
  Settings2 
} from 'lucide-react';

const menuItems = [
  { 
    title: 'Kasir / POS', 
    icon: <ShoppingCart size={40} />, 
    color: 'bg-indigo-600', // Indigo memberikan kesan profesional & terpercaya
    path: '/pos' 
  },
  { 
    title: 'Biaya', 
    icon: <Receipt size={40} />, // Receipt lebih spesifik untuk bukti pengeluaran
    color: 'bg-rose-500', // Merah/Rose identik dengan arus kas keluar (biaya)
    path: '/expenses' 
  },
  { 
    title: 'Laporan Penjualan', 
    icon: <PieChart size={40} />, // PieChart untuk ringkasan (overview)
    color: 'bg-cyan-500', 
    path: '/reports' 
  },
  { 
    title: 'Laporan Harian', 
    icon: <CalendarDays size={40} />, // Ikon kalender untuk pencatatan harian
    color: 'bg-emerald-500', 
    path: '/reports-by-date' 
  },
  { 
    title: 'Laporan Per Bulan', 
    icon: <BarChart3 size={40} />, // Grafik batang untuk tren bulanan
    color: 'bg-teal-600', 
    path: '/reports-by-month' 
  },
  { 
    title: 'Manajemen Menu', 
    icon: <UtensilsCrossed size={40} />, // Lebih spesifik untuk pengelolaan dapur/menu
    color: 'bg-amber-500', // Amber/Oranye cerah membangkitkan nafsu makan (FnB)
    path: '/menu/manage' 
  },
  { 
    title: 'Laba Rugi', 
    icon: <Scale size={40} />, // Timbangan melambangkan keseimbangan (Laba vs Rugi)
    color: 'bg-violet-600', 
    path: '/profit-loss' 
  },
  { 
    title: 'Setting', 
    icon: <Settings2 size={40} />, // Settings2 terlihat lebih modern
    color: 'bg-slate-500', 
    path: '/settings' 
  },
];

const Home = () => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [openLogout, setOpenLogout] = useState(false);
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
          <h1 className="text-2xl font-bold text-gray-800">{profile?.merchantName || 'DeKasir'}</h1>
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
