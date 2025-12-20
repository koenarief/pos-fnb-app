import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';
import { getMerchantProfile, saveMerchantProfile } from '../firebase/dataService';
import { ArrowLeft, Store, MapPin, Phone, Save, Loader2, CheckCircle } from 'lucide-react';
import { useUserClaims } from "../firebase/userClaims";

const Settings = () => {
  const navigate = useNavigate();
  const claims = useUserClaims();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const userId = auth.currentUser?.uid;

  const [formData, setFormData] = useState({
    merchantName: '',
    address: '',
    phone: '',
    footerMessage: 'Terima kasih telah berkunjung!'
  });

  useEffect(() => {
    const loadProfile = async () => {
      const profile = await getMerchantProfile(claims?.merchantId);
      if (profile) setFormData(profile);
      setFetching(false);
    };
    loadProfile();
  }, [claims?.merchantId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await saveMerchantProfile(claims?.merchantId, formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert("Gagal menyimpan pengaturan");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Pengaturan Toko</h1>
      </header>

      <main className="p-6 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-4">
              <Store size={20} className="text-blue-500" /> Profil Identitas
            </h3>

            {/* Nama Merchant */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Nama Toko / Merchant</label>
              <div className="relative">
                <Store className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Nama Coffee Shop Anda"
                  value={formData.merchantName}
                  onChange={(e) => setFormData({...formData, merchantName: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Alamat */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Alamat Lengkap</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                <textarea
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Jl. Raya No. 123..."
                  rows="3"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Nomor Telepon</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="tel"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="08123456789"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Tombol Simpan */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 
              ${success ? 'bg-emerald-500' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
          >
            {loading ? <Loader2 className="animate-spin" /> : success ? <><CheckCircle size={20}/> Berhasil Disimpan</> : <><Save size={20}/> Simpan Perubahan</>}
          </button>
        </form>

        {/* Preview Struk Sederhana */}
        <div className="mt-10">
          <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Preview Header Struk</p>
          <div className="bg-white p-6 border-dashed border-2 border-gray-200 rounded-lg max-w-[300px] mx-auto text-center font-mono text-sm">
            <p className="font-bold text-lg uppercase">{formData.merchantName || 'NAMA TOKO'}</p>
            <p className="mt-1">{formData.address || 'Alamat Toko'}</p>
            <p>Telp: {formData.phone || '-'}</p>
            <p className="mt-4 border-t border-dashed pt-2 italic text-gray-400"># Transaksi Baru #</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
