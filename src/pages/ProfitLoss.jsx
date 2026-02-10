import React, { useState, useEffect } from 'react';
import { auth } from '../firebase/config';
import { getFinancialData } from '../firebase/dataService';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Loader2, PieChart } from 'lucide-react';
import { useUserClaims } from "../firebase/userClaims";

const ProfitLoss = () => {
  const navigate = useNavigate();
  const userId = auth.currentUser?.uid;
  const claims = useUserClaims();

  const [data, setData] = useState({ income: 0, expense: 0, profit: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinancials = async () => {
      try {
        const { transactions, expenses } = await getFinancialData(claims?.merchantId);
        
        const totalIncome = transactions.reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
        
        setData({
          income: totalIncome,
          expense: totalExpense,
          profit: totalIncome - totalExpense
        });
      } catch (error) {
        console.error("Error fetching financials:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFinancials();
  }, [claims?.merchantId]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/home')} className="p-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Laporan Laba Rugi</h1>
      </header>

      <main className="p-6 max-w-4xl mx-auto w-full space-y-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-600 mb-2" size={40} />
            <p className="text-gray-500">Menganalisis data finansial...</p>
          </div>
        ) : (
          <>
            {/* Ringkasan Profit Bersih */}
            <div className={`p-8 rounded-[2rem] shadow-xl text-white ${data.profit >= 0 ? 'bg-emerald-600' : 'bg-red-600'} transition-colors duration-500`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="opacity-80 font-medium uppercase tracking-wider text-sm">Profit Bersih (Net Profit)</p>
                  <h2 className="text-4xl md:text-5xl font-black mt-2">
                    Rp {data.profit.toLocaleString()}
                  </h2>
                </div>
                <div className="bg-white/20 p-3 rounded-2xl">
                  <PieChart size={32} />
                </div>
              </div>
              <p className="mt-4 text-sm opacity-90 italic">
                {data.profit >= 0 ? "Bagus! Bisnis Anda sedang berkembang." : "Perhatian! Pengeluaran Anda melebihi pemasukan."}
              </p>
            </div>

            {/* Perbandingan Income vs Expense */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="bg-blue-50 p-4 rounded-2xl text-blue-600">
                  <TrendingUp size={28} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Pemasukan</p>
                  <p className="text-xl font-bold text-gray-800">Rp {data.income.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                <div className="bg-orange-50 p-4 rounded-2xl text-orange-600">
                  <TrendingDown size={28} />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Pengeluaran</p>
                  <p className="text-xl font-bold text-gray-800">Rp {data.expense.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Analisis Persentase */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-700 mb-4">Analisis Penggunaan Modal</h3>
              <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden flex">
                <div 
                  className="bg-blue-500 h-full" 
                  style={{ width: `${(data.income / (data.income + data.expense)) * 100 || 0}%` }}
                ></div>
                <div 
                  className="bg-orange-500 h-full" 
                  style={{ width: `${(data.expense / (data.income + data.expense)) * 100 || 0}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-4 text-xs font-bold uppercase tracking-tighter">
                <span className="text-blue-600">● Pemasukan</span>
                <span className="text-orange-600">● Pengeluaran</span>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ProfitLoss;
