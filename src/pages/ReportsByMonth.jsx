import React, { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { getTransactions } from '../firebase/dataService';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, ShoppingBag, Calendar, Loader2 } from 'lucide-react';
import { useUserClaims } from "../firebase/userClaims";

const ReportsByMonth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalRevenue: 0, totalSales: 0 });
  const [groupedTransactions, setGroupedTransactions] = useState({});
  const claims = useUserClaims();

  useEffect(() => {
    const fetchData = async () => {
      if (!claims?.merchantId) return;

      try {
        setLoading(true);
        const data = await getTransactions(claims?.merchantId);

        // 1. Hitung statistik Global
        const revenue = data.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
        setStats({
          totalRevenue: revenue,
          totalSales: data.length
        });

        // 2. Grouping berdasarkan BULAN (Januari 2024, Februari 2024, dst)
        const grouped = data.reduce((acc, transaction) => {
          const dateObj = transaction.date?.toDate ? transaction.date.toDate() : new Date(transaction.date);
          
          // Format: "Januari 2024"
          const monthKey = dateObj.toLocaleDateString('id-ID', {
            year: 'numeric', 
            month: 'long'
          });

          if (!acc[monthKey]) {
            acc[monthKey] = {
              monthlyTotal: 0,
              transactionCount: 0
            };
          }

          acc[monthKey].monthlyTotal += (transaction.totalAmount || 0);
          acc[monthKey].transactionCount += 1;
          return acc;
        }, {});

        setGroupedTransactions(grouped);
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
      <header className="bg-white border-b px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={() => navigate('/home')} className="p-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Laporan Bulanan</h1>
      </header>

      <main className="p-6 max-w-6xl mx-auto w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center mt-20">
            <Loader2 className="animate-spin text-blue-600 mb-2" size={40} />
            <p className="text-gray-500">Menyusun laporan bulanan...</p>
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
                  <p className="text-sm text-gray-500 font-medium">Total Omzet Keseluruhan</p>
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
                  <p className="text-sm text-gray-500 font-medium">Total Seluruh Pesanan</p>
                  <h2 className="text-2xl font-black text-gray-800">
                    {stats.totalSales} Transaksi
                  </h2>
                </div>
              </div>
            </div>

            {/* Tabel Riwayat Bulanan */}
            <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <Calendar size={18} className="text-blue-500" />
                  Rekapitulasi Per Bulan
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="p-4 text-sm font-semibold text-gray-600 uppercase">Bulan</th>
                      <th className="p-4 text-sm font-semibold text-gray-600 uppercase text-center">Jumlah Transaksi</th>
                      <th className="p-4 text-sm font-semibold text-gray-600 uppercase text-right">Total Pendapatan</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100 text-sm">
                    {Object.keys(groupedTransactions).length > 0 ? (
                      Object.keys(groupedTransactions).map((month) => (
                        <tr key={month} className="hover:bg-gray-50 transition">
                          <td className="p-4 font-bold text-gray-700 border-l-4 border-blue-500">
                            {month}
                          </td>
                          <td className="p-4 text-center text-gray-600">
                            {groupedTransactions[month].transactionCount} Pesanan
                          </td>
                          <td className="p-4 text-right font-bold text-blue-600 text-lg">
                            Rp {groupedTransactions[month].monthlyTotal.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="p-10 text-center text-gray-400 italic">
                          Belum ada data transaksi.
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

export default ReportsByMonth;