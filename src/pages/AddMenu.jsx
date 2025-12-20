import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';
import { addProduct } from '../firebase/dataService';
import { ArrowLeft, Save, Package, Tag, Layers, Image as ImageIcon, Loader2 } from 'lucide-react';
import ImageUploader from "../components/ImageUploader";
import { toast } from "react-toastify";
import { useUserClaims } from "../firebase/userClaims";

const AddMenu = () => {
  const navigate = useNavigate();
  const userId = auth.currentUser?.uid;
  const claims = useUserClaims();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Minuman',
    image: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addProduct(claims?.merchantId, userId, formData);
      toast("Produk berhasil ditambahkan!");
      navigate('/pos'); // Kembali ke POS setelah berhasil
    } catch (error) {
      console.error(error);
      toast("Gagal menambahkan produk.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Tambah Menu Baru</h1>
      </header>

      <main className="flex-1 p-6 flex justify-center">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-sm border p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Input Nama Produk */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Produk</label>
              <div className="relative">
                <Package className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: Es Kopi Susu"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Input Harga */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Harga (Rp)</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="number"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="20000"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>
              </div>

              {/* Input Kategori */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kategori</label>
                <div className="relative">
                  <Layers className="absolute left-3 top-3 text-gray-400" size={20} />
                  <select
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="Minuman">Minuman</option>
                    <option value="Makanan">Makanan</option>
                    <option value="Snack">Snack</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Input URL Gambar */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">URL Gambar (Opsional)</label>
              <div className="relative">
                <ImageUploader
                  setImageUrl={(image) => setFormData({...formData, image: image})}
                />
              </div>
            </div>

            {/* Preview Box */}
            <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-xs font-bold text-blue-600 uppercase mb-2">Preview Tampilan POS</p>
              <div className="bg-white p-3 rounded-xl shadow-sm w-40">
                <div className="h-20 bg-gray-100 rounded-lg mb-2 overflow-hidden">
                  {formData.image && <img src={formData.image} className="w-full h-full object-cover" alt="preview" />}
                </div>
                <p className="text-sm font-bold truncate">{formData.name || 'Nama Produk'}</p>
                <p className="text-blue-600 text-xs font-bold">Rp {Number(formData.price).toLocaleString()}</p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Simpan Menu</>}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddMenu;
