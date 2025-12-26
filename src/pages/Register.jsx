import React, { useState } from 'react';
import { auth } from '../firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { initializeMerchant } from '../firebase/dataService';
import { useNavigate, Link } from 'react-router-dom';
import { Store, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    merchantName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Password tidak cocok!");
    }

    setLoading(true);
    try {
      // 1. Buat User di Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      // 2. Inisialisasi Profil di Firestore
      await initializeMerchant(userCredential.user.uid, formData.merchantName);
      
      toast.success("Registrasi Berhasil!");
      navigate('/');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-600 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-8 md:p-10">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600">
            <Store size={32} />
          </div>
          <h1 className="text-2xl font-black text-gray-800">Daftar Merchant</h1>
          <p className="text-gray-500 text-sm mt-1">Mulai kelola bisnis Anda hari ini</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {/* Input Nama Merchant */}
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700 ml-1">Nama Toko</label>
            <div className="relative">
              <Store className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="text"
                required
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="Contoh: Kopi Senja"
                value={formData.merchantName}
                onChange={(e) => setFormData({...formData, merchantName: e.target.value})}
              />
            </div>
          </div>

          {/* Input Email */}
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700 ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="email"
                required
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="email@bisnis.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          {/* Input Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <input
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 ml-1">Konfirmasi</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><ArrowRight size={20} /> Daftar Sekarang</>}
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-8">
          Sudah punya akun? <Link to="/login" className="text-blue-600 font-bold hover:underline">Login di sini</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;