import React, { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { getTransactions } from '../firebase/dataService';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, ShoppingBag, Calendar, Loader2 } from 'lucide-react';
import { useUserClaims } from "../firebase/userClaims";

const Reports = () => {
  const navigate = useNavigate();
  const userId = auth.currentUser?.uid;
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalRevenue: 0, totalSales: 0 });
  const claims = useUserClaims();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTransactions(claims?.merchantId);
        setTransactions(data);
        
        // Hitung statistik sederhana
        const revenue = data.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
        setStats({
          totalRevenue: revenue,
          totalSales: data.length
        });
      } catch (error) {
        console.error("Gagal memuat laporan:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [claims?.merchantId]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Laporan Penjualan</h1>
      </header>

      <main className="p-6 max-w-6xl mx-auto w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center mt-20">
            <Loader2 className="animate-spin text-blue-600 mb-2" size={40} />
            <p className="text-gray-500">Menyusun laporan...</p>
          </div>
        ) : (
          <>
            {/* Kartu Statistik */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-100 flex items-center gap-5">
                <div className="bg-blue-100 p-4 rounded-2xl text-blue-600">
                  <TrendingUp size={32} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Omzet</p>
                  <h2 className="text-2xl font-black text-gray-800">
                    Rp {stats.totalRevenue.toLocaleString()}
                  </h2>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-100 flex items-center gap-5">
                <div className="bg-emerald-100 p-4 rounded-2xl text-emerald-600">
                  <ShoppingBag size={32} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Total Transaksi</p>
                  <h2 className="text-2xl font-black text-gray-800">
                    {stats.totalSales} Pesanan
                  </h2>
                </div>
              </div>
            </div>

            {/* Tabel Riwayat Transaksi */}
            <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Calendar size={18} className="text-blue-500" />
                  Riwayat Transaksi Terakhir
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="p-4 text-sm font-semibold text-gray-600 uppercase">Waktu</th>
                      <th className="p-4 text-sm font-semibold text-gray-600 uppercase">Item</th>
                      <th className="p-4 text-sm font-semibold text-gray-600 uppercase text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {transactions.length > 0 ? (
                      transactions.map((t) => (
                        <tr key={t.id} className="hover:bg-blue-50/30 transition">
                          <td className="p-4 text-gray-600">
                            {t.date ? t.date.toLocaleString('id-ID', { 
                              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                            }) : '-'}
                          </td>
                          <td className="p-4">
                            <p className="font-medium text-gray-800 truncate max-w-[200px]">
                              {t.items?.map(item => item.name).join(", ")}
                            </p>
                            <p className="text-xs text-gray-400">{t.items?.length} jenis barang</p>
                          </td>
                          <td className="p-4 text-right font-bold text-gray-800">
                            Rp {t.totalAmount?.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="p-10 text-center text-gray-400 italic">
                          Belum ada transaksi terekam.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Reports;
