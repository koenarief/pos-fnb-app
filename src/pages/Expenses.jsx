import React, { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { addExpense, getExpenses } from '../firebase/dataService';
import { ArrowLeft, Plus, Receipt, Wallet, Loader2, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import { useUserClaims } from "../firebase/userClaims";
import UserHeader from '../components/UserHeader';

const Expenses = () => {
  const navigate = useNavigate();
  const userId = auth.currentUser?.uid;
  const claims = useUserClaims();

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [form, setForm] = useState({ title: '', amount: '', category: 'Bahan Baku' });

  useEffect(() => {
    fetchData();
  }, [claims?.merchantId]);

  const fetchData = async () => {
    const data = await getExpenses(claims?.merchantId);
    setExpenses(data);
    setIsFetching(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addExpense( claims?.merchantId, userId, form);
      setForm({ title: '', amount: '', category: 'Bahan Baku' });
      fetchData(); // Refresh list
    } catch (error) {
      toast("Gagal mencatat pengeluaran");
    } finally {
      setLoading(false);
    }
  };

  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      <UserHeader title="Pengeluaran Belanja"/>

      <main className="p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6">
        {/* Form Input */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Plus className="text-blue-500" size={20} /> Catat Pengeluaran Baru
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Nama Belanja (ex: Beli Susu)"
              className="p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              value={form.title}
              required
              onChange={(e) => setForm({...form, title: e.target.value})}
            />
            <input
              type="number"
              placeholder="Nominal (Rp)"
              className="p-3 bg-gray-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              value={form.amount}
              required
              onChange={(e) => setForm({...form, amount: e.target.value})}
            />
            <button 
              disabled={loading}
              className="bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 h-12 md:h-auto"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Simpan'}
            </button>
          </form>
        </div>

        {/* Ringkasan & List */}
        <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
          <div className="p-6 bg-gray-800 text-white flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-sm">Total Pengeluaran Bulan Ini</p>
              <h3 className="text-2xl font-black text-blue-400">Rp {totalExpense.toLocaleString()}</h3>
            </div>
            <Wallet size={40} className="opacity-20" />
          </div>

          <div className="p-4">
            <h3 className="font-bold text-gray-700 mb-4 px-2">Riwayat Belanja</h3>
            <div className="space-y-3">
              {isFetching ? (
                <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>
              ) : expenses.length > 0 ? (
                expenses.map((ex) => (
                  <div key={ex.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition">
                    <div className="flex items-center gap-4">
                      <div className="bg-white p-2 rounded-lg shadow-sm">
                        <Receipt size={20} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{ex.title}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar size={12} /> {ex.createdAt?.toDate().toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-red-500">- Rp {ex.amount.toLocaleString()}</p>
                  </div>
                ))
              ) : (
                <p className="text-center p-10 text-gray-400 italic">Belum ada catatan belanja.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Expenses;
