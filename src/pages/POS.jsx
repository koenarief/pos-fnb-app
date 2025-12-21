import React, { useState, useEffect } from "react";
import { auth } from "../firebase/config"; // Import auth
import { getProducts, saveTransaction } from "../firebase/dataService";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
// import { printReceipt } from "../utils/printer";
import { useUserClaims } from "../firebase/userClaims";
import { useSelector, useDispatch } from 'react-redux';
import { addToCart, removeFromCart, clearCart } from '../store/cartSlice';
import { fetchProducts } from '../store/productSlice';

const POS = () => {
  const navigate = useNavigate();

  const dispatch = useDispatch();
  // Ambil data dari Redux Store
  const { items: products, loading } = useSelector((state) => state.products);
  const cartItems = useSelector((state) => state.cart.items);
  const totalAmount = useSelector((state) => state.cart.totalAmount);
  const { profile } = useSelector((state) => state.merchant);

  // Ambil ID User yang sedang login
  const userId = auth.currentUser?.uid;
  const claims = useUserClaims();

  useEffect(() => {
    // Hanya fetch jika data produk masih kosong
    if (products.length === 0 && claims?.merchantId) {
      dispatch(fetchProducts(claims?.merchantId));
    }
  }, [claims?.merchantId, dispatch, products.length]);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return toast("Keranjang kosong!");

    try {
      await saveTransaction(claims?.merchantId, userId, {
        items: cartItems,
        totalAmount: totalAmount,
        cashierEmail: auth.currentUser.email,
      });
      toast("Transaksi Tersimpan di Database Anda!");
      dispatch(clearCart());

      // const isSuccess = await printReceipt(profile?.merchantName, cart, total);

      // if (isSuccess) {
      // toast("Transaksi Selesai & Struk Dicetak!");
      // setCart([]);
      // }
    } catch (error) {
      console.error("Gagal simpan transaksi:", error);
      toast("Gagal simpan transaksi");
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );
  
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header POS - Tetap di atas */}
      <div className="bg-white p-4 flex items-center gap-4 border-b shrink-0">
        <button
          onClick={() => navigate("/")}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft />
        </button>
        <h2 className="text-xl font-bold">Transaksi {profile?.merchantName}</h2>
      </div>

      {/* Container Utama: flex-col (HP), flex-row (Desktop) */}
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
        {/* SISI ATAS (HP) / SISI KIRI (Desktop): Daftar Produk */}
        <div className="flex-1 p-4 overflow-y-auto grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => dispatch(addToCart(product))}
              className="bg-white p-3 sm:p-0 rounded-xl shadow-sm border border-transparent active:border-blue-500 cursor-pointer hover:shadow-md transition flex flex-col md:max-h-48 xl:max-h-72 overflow-hidden"
            >
              {product.image && (
                <div className="bg-gray-200 mb-2 overflow-hidden">
                  <img
                    src={product.image}
                    className="w-full h-full object-cover"
                    alt={product.name}
                  />
                </div>
              )}
              <h3 className="font-semibold text-gray-700 text-sm md:text-base px-2">
                {product.name}
              </h3>
              <p className="text-blue-600 font-bold text-sm md:text-lg px-2">
                Rp {product.price.toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* SISI BAWAH (HP) / SISI KANAN (Desktop): Detail Pesanan */}
        {/* h-[40vh] memberikan tinggi tetap di HP agar scrollable aktif */}
        <div className="w-full md:w-80 bg-white border-t md:border-t-0 md:border-l flex flex-col shrink-0 h-[45vh] md:h-full shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)] md:shadow-none">
          <div className="p-4 border-b shrink-0 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">Detail Pesanan</h3>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500 italic">
              Tap item untuk hapus
            </span>
          </div>

          {/* Area Item Pesanan - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center group active:bg-red-50 p-1 rounded transition"
                  onClick={() => dispatch(removeFromCart(item))}
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-800">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-400">x{item.qty}</p>
                  </div>
                  <p className="font-bold text-sm text-gray-700 ml-2">
                    Rp {(item.price * item.qty).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                Keranjang kosong
              </div>
            )}
          </div>

          {/* Ringkasan Total & Tombol Bayar - Sticky di paling bawah */}
          <div className="p-4 bg-gray-50 border-t mt-auto shrink-0">
            <div className="flex justify-between mb-4">
              <span className="text-gray-500 font-medium">Total</span>
              <span className="text-2xl font-black text-blue-600">
                Rp {totalAmount.toLocaleString()}
              </span>
            </div>
            {totalAmount > 0 && (
              <button
                onClick={handleCheckout}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-transform"
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
