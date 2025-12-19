import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config'; // Pastikan path config benar
import { signOut } from 'firebase/auth';
import { 
  ShoppingCart, 
  UtensilsCrossed, 
  LayoutDashboard, 
  ClipboardList, 
  Settings, 
  LogOut,
  Loader2 
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    // Konfirmasi sebelum logout (sangat penting untuk tablet agar tidak salah tekan)
    const confirmLogout = window.confirm("Apakah Anda yakin ingin keluar dari sistem?");
    if (!confirmLogout) return;

    setIsLoggingOut(true);
    try {
      await signOut(auth);
      // Setelah sign out, App.jsx akan mendeteksi perubahan state 
      // dan otomatis mengarahkan ke halaman /login
    } catch (error) {
      console.error("Error saat logout:", error);
      alert("Gagal keluar. Silakan coba lagi.");
    } finally {
      setIsLoggingOut(false);
    }
  };


  const menuItems = [
    { title: 'Kasir / POS', icon: <ShoppingCart size={40} />, color: 'bg-blue-500', path: '/pos' },
    { title: 'Dapur', icon: <UtensilsCrossed size={40} />, color: 'bg-orange-500', path: '/kitchen' },
    { title: 'Laporan', icon: <LayoutDashboard size={40} />, color: 'bg-emerald-500', path: '/reports' },
    { title: 'Manajemen Menu', icon: <ClipboardList size={40} />, color: 'bg-purple-500', path: '/menu/manage' },
    { title: 'Pengaturan', icon: <Settings size={40} />, color: 'bg-slate-600', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-8 py-6 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Caffè POS Terminal</h1>
          <p className="text-gray-500 text-sm italic">User: {auth.currentUser?.email}</p>
        </div>
        
        <button 
          onClick={handleLogout}
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
