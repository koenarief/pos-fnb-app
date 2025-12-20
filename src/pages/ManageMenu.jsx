import React, { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { getProducts, updateProduct, deleteProduct } from '../firebase/dataService';
import { ArrowLeft, Edit3, Trash2, Save, X, Loader2, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import { useUserClaims } from "../firebase/userClaims";

const ManageMenu = () => {
  const navigate = useNavigate();
  const userId = auth.currentUser?.uid;
  const claims = useUserClaims();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', price: '', category: '' });

  useEffect(() => {
    fetchData();
  }, [claims?.merchantId]);

  const fetchData = async () => {
    setLoading(true);
    const data = await getProducts(claims?.merchantId);
    setProducts(data);
    setLoading(false);
  };

  const handleEditClick = (product) => {
    setEditingId(product.id);
    setEditForm({ name: product.name, price: product.price, category: product.category });
  };

  const handleUpdate = async (id) => {
    try {
      await updateProduct(claims?.merchantId, id, editForm);
      setEditingId(null);
      fetchData(); // Refresh data
    } catch (error) {
	  console.error(error);
      toast("Gagal mengupdate produk");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus produk ini secara permanen?")) {
      try {
        await deleteProduct(claims?.merchantId, id);
        fetchData();
      } catch (error) {
        toast("Gagal menghapus produk");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft /></button>
          <h1 className="text-xl font-bold">Manajemen Menu</h1>
        </div>
        <button 
          onClick={() => navigate('/menu/add')}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm"
        >
          + Tambah Baru
        </button>
      </header>

      <main className="p-6  max-w-6xl mx-auto w-full">
        <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 font-semibold text-gray-600">Produk</th>
                  <th className="p-4 font-semibold text-gray-600">Kategori</th>
                  <th className="p-4 font-semibold text-gray-600">Harga</th>
                  <th className="p-4 font-semibold text-gray-600 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition">
                    <td className="p-4">
                      {editingId === product.id ? (
                        <input 
                          className="border rounded px-2 py-1 w-full outline-none focus:ring-2 focus:ring-blue-500"
                          value={editForm.name}
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        />
                      ) : (
                        <span className="font-medium text-gray-800">{product.name}</span>
                      )}
                    </td>
                    <td className="p-4 text-gray-500">
                      {editingId === product.id ? (
                        <select 
                          className="border rounded px-2 py-1 outline-none"
                          value={editForm.category}
                          onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                        >
                          <option value="Minuman">Minuman</option>
                          <option value="Makanan">Makanan</option>
                        </select>
                      ) : (
                        product.category
                      )}
                    </td>
                    <td className="p-4 font-bold text-blue-600">
                      {editingId === product.id ? (
                        <input 
                          type="number"
                          className="border rounded px-2 py-1 w-24 outline-none"
                          value={editForm.price}
                          onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                        />
                      ) : (
                        `Rp ${product.price.toLocaleString()}`
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        {editingId === product.id ? (
                          <>
                            <button onClick={() => handleUpdate(product.id)} className="p-2 bg-green-100 text-green-600 rounded-lg"><Save size={18} /></button>
                            <button onClick={() => setEditingId(null)} className="p-2 bg-gray-100 text-gray-600 rounded-lg"><X size={18} /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEditClick(product)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Edit3 size={18} /></button>
                            <button onClick={() => handleDelete(product.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash2 size={18} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};

export default ManageMenu;
