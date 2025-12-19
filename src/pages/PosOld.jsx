



import React, { useState, useEffect } from 'react';
import { db } from './firebase/config'; // Pastikan config firebase sudah ada
import { collection, getDocs, addDoc } from 'firebase/firestore';

const sampleProducts = [
	{id: 1, name: 'tempe', price: 1000},
	{id: 2, name: 'tahu', price: 2000},
	{id: 3, name: 'sego', price: 3000},
];

const App = () => {
  const [products, setProducts] = useState(sampleProducts);
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  // Ambil data menu dari Firebase
  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(data);
    };
    fetchProducts();
  }, []);

  // Hitung total setiap kali cart berubah
  useEffect(() => {
    const sum = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    setTotal(sum);
  }, [cart]);

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const removeFromCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty - 1 } : item).filter(item => item.qty > 0));
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Keranjang kosong");
    
    try {
      await addDoc(collection(db, "transactions"), {
        items: cart,
        total: total,
        timestamp: new Date()
      });
      alert("Transaksi Berhasil!");
      setCart([]);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* KIRI: Daftar Menu */}
      <div className="w-2/3 p-4 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Menu Kasir FnB</h1>
        <div className="grid grid-cols-3 gap-4">
          {products.map(product => (
            <div 
              key={product.id} 
              onClick={() => addToCart(product)}
              className="bg-white p-4 rounded-xl shadow-sm border border-transparent active:border-blue-500 cursor-pointer hover:shadow-md transition"
            >
              <div className="h-24 bg-gray-200 rounded-lg mb-2"></div> {/* Placeholder Foto */}
              <h3 className="font-semibold text-gray-700">{product.name}</h3>
              <p className="text-blue-600 font-bold">Rp {product.price.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* KANAN: Keranjang & Pembayaran */}
      <div className="w-1/3 bg-white border-l flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Pesanan</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {cart.map(item => (
            <div key={item.id} className="flex justify-between mb-4 items-center" onClick={() => removeFromCart(item)}>
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-500">x{item.qty}</p>
              </div>
              <p className="font-semibold">Rp {(item.price * item.qty).toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div className="p-4 bg-gray-50 border-t">
          <div className="flex justify-between mb-4">
            <span className="text-lg">Total</span>
            <span className="text-2xl font-bold text-blue-600">Rp {total.toLocaleString()}</span>
          </div>
          <button 
            onClick={handleCheckout}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg active:bg-blue-700"
          >
            BAYAR SEKARANG
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;

