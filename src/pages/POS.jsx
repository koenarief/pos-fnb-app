import React, { useState, useEffect } from "react";
import { db } from "../firebase/config"; // Pastikan config firebase sudah ada
import { collection, getDocs, addDoc } from "firebase/firestore";
import { auth } from '../firebase/config'; // Import auth
import { getProducts, saveTransaction } from '../firebase/dataService';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';

const sampleProducts = [
  { id: 1, name: "tempe", price: 1000 },
  { id: 2, name: "tahu", price: 2000 },
  { id: 3, name: "sego", price: 3000 },
  { id: 4, name: "tahu", price: 2000 },
  { id: 5, name: "sego", price: 3000 },
  { id: 6, name: "tahu", price: 2000 },
  { id: 7, name: "sego", price: 3000 },
];

const POS = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

// Ambil ID User yang sedang login
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchMenu = async () => {
      if (!userId) return; // Pastikan user ada
      try {
        const data = await getProducts(userId); // Ambil data spesifik user ini
        setProducts(data);
      } catch (error) {
        console.error("Gagal ambil menu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [userId]);


  // Hitung total setiap kali cart berubah
  useEffect(() => {
    const sum = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
    setTotal(sum);
  }, [cart]);

  const addToCart = (product) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
        ),
      );
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const removeFromCart = (product) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      setCart(
        cart
          .map((item) =>
            item.id === product.id ? { ...item, qty: item.qty - 1 } : item,
          )
          .filter((item) => item.qty > 0),
      );
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Keranjang kosong!");
    
    try {
      const total = cart.reduce((a, b) => a + (b.price * b.qty), 0);
      await saveTransaction(userId, {
        items: cart,
        totalAmount: total,
        cashierEmail: auth.currentUser.email
      });
      alert("Transaksi Tersimpan di Database Anda!");
      setCart([]);
    } catch (error) {
      alert("Gagal simpan transaksi");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header POS */}
      <div className="bg-white p-4 flex items-center gap-4 border-b">
        <button
          onClick={() => navigate("/")}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft />
        </button>
        <h2 className="text-xl font-bold">Menu Transaksi</h2>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sisi Kiri: Menu (Daftar Produk) */}
        <div className="flex-1 p-4 overflow-y-auto grid grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white p-4 rounded-xl shadow-sm border border-transparent active:border-blue-500 cursor-pointer hover:shadow-md transition"
            >
              <div className="h-24 bg-gray-200 rounded-lg mb-2"></div>{" "}
              {/* Placeholder Foto */}
              <h3 className="font-semibold text-gray-700">{product.name}</h3>
              <p className="text-blue-600 font-bold">
                Rp {product.price.toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* Sisi Kanan: Cart */}
        <div className="w-80 bg-white border-l p-4 flex flex-col">
          {cart.length > 0 && (
            <div className="border-b">
              <h3 className="font-bold border-b pb-2 mb-4">Pesanan</h3>
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between mb-4 items-center"
                  onClick={() => removeFromCart(item)}
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">x{item.qty}</p>
                  </div>
                  <p className="font-semibold">
                    Rp {(item.price * item.qty).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
          <div className="p-4 bg-gray-50">
            <div className="flex justify-between mb-4">
              <span className="text-lg">Total</span>
              <span className="text-2xl font-bold text-blue-600">
                Rp {total.toLocaleString()}
              </span>
            </div>
            {total > 0 && (
              <button
                onClick={handleCheckout}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg active:bg-blue-700"
              >
                BAYAR
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default POS;
