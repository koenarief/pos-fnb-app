import { useEffect, useState } from "react";
import { auth } from "../firebase/config";
import { saveTransaction } from "../firebase/dataService";
import { useNavigate, useParams } from "react-router-dom"; // Tambah useParams
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from 'react-redux';
import { addToCart, removeFromCart, clearCart } from '../store/cartSlice';
import { fetchProducts } from '../store/productSlice';
import { fetchMerchantProfile } from '../store/merchantSlice';

const Toko = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Ambil merchantId dari URL
  const { merchantId: urlMerchantId } = useParams();
  
  // Tentukan DEFAULT ID di sini (Ganti dengan ID merchant asli dari Firebase Anda)
  const DEFAULT_MERCHANT_ID = "MERC-001"; 
  
  // Gunakan ID dari URL, jika tidak ada (undefined), gunakan DEFAULT
  const merchantId = urlMerchantId || DEFAULT_MERCHANT_ID;


  // Ambil data dari Redux Store
  const { items: products, loading } = useSelector((state) => state.products);
  const cartItems = useSelector((state) => state.cart.items);
  const totalAmount = useSelector((state) => state.cart.totalAmount);
  const { profile } = useSelector((state) => state.merchant);

  // User ID opsional (null jika tidak login)
  const userId = auth.currentUser?.uid || "guest-user";

  const categories = ['Semua', 'Makanan', 'Minuman', 'Snack', 'Lainnya'];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerData, setCustomerData] = useState({
    nama: "",
    alamat: "",
    nomorWA: ""
  });

  // Load data dari localStorage saat pertama kali render
  useEffect(() => {
    const savedData = localStorage.getItem("customer_info");
    if (savedData) {
      setCustomerData(JSON.parse(savedData));
    }
  }, []);


  useEffect(() => {
    // 2. Gunakan merchantId dari URL untuk fetch data
    if (merchantId) {
      dispatch(fetchProducts(merchantId));
      dispatch(fetchMerchantProfile(merchantId));
    }
  }, [merchantId, dispatch]);

  const groupedProducts = categories.reduce((acc, category) => {
    const filtered = products.filter(p => 
      category === 'Lainnya' 
        ? (!p.category || p.category === 'Lainnya')
        : p.category === category
    );
    
    if (filtered.length > 0 && category !== 'Semua') {
      acc.push({ category, items: filtered });
    }
    return acc;
  }, []);


  const startCheckout = () => {
    if (cartItems.length === 0) return toast.error("Keranjang kosong!");
    setIsModalOpen(true); // Buka dialog input data
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    
    // Simpan ke localStorage sebagai default untuk pembelian berikutnya
    localStorage.setItem("customer_info", JSON.stringify(customerData));

    try {
      await saveTransaction(merchantId, userId, {
        items: cartItems,
        totalAmount: totalAmount,
        customer: customerData, // Tambahkan data user ke transaksi
        cashierEmail: auth.currentUser?.email || "Guest/Customer"
      });

      const merchantPhone = profile?.phoneNumber || "62818278205";
      sendWhatsAppNotification(merchantPhone, customerData, cartItems, totalAmount);

      toast.success("Pesanan berhasil dikirim!");
      dispatch(clearCart());
      setIsModalOpen(false);
    } catch (error) {
      toast.error(`Gagal: ${error.message}`);
    }
  };

  const sendWhatsAppNotification = (merchantPhone, customer, items, total) => {
    // Format daftar item
    const itemDetails = items
      .map((item) => `- ${item.name} (x${item.qty}): Rp ${(item.price * item.qty).toLocaleString()}`)
      .join("\n");

    const message = `Halo ${profile?.merchantName || "Admin"},\n\n` +
      `Ada pesanan baru!\n\n` +
      `*Detail Pembeli:* \n` +
      `- Nama: ${customer.nama}\n` +
      `- Alamat: ${customer.alamat}\n` +
      `- WA: ${customer.nomorWA}\n\n` +
      `*Daftar Pesanan:* \n` +
      `${itemDetails}\n\n` +
      `*Total Bayar: Rp ${total.toLocaleString()}*\n\n` +
      `Mohon segera diproses ya, terima kasih!`;

    // Encode pesan untuk URL
    const encodedMessage = encodeURIComponent(message);
    
    // Bersihkan nomor telepon (hilangkan karakter non-digit)
    const cleanPhone = merchantPhone.replace(/\D/g, "");
    
    // Pastikan format nomor diawali 62 atau format internasional lainnya
    const finalPhone = cleanPhone.startsWith("0") ? "62" + cleanPhone.slice(1) : cleanPhone;

    // Buka WhatsApp di tab baru
    window.open(`https://wa.me/${finalPhone}?text=${encodedMessage}`, "_blank");
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );
  
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white p-4 flex items-center gap-4 border-b shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ArrowLeft />
        </button>
        <div>
            <h2 className="text-xl font-bold">{profile?.merchantName || "Loading Toko..."}</h2>
            <p className="text-xs text-gray-500">{profile?.address}</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
        {/* Daftar Produk */}
        <div className="flex-1 p-4 overflow-y-auto space-y-8 custom-scrollbar">
          {groupedProducts.length > 0 ? (
            groupedProducts.map(({ category, items }) => (
              <div key={category} className="space-y-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-lg font-bold text-gray-400 sticky top-0 bg-gray-100 py-1 z-10">
                    {category}
                  </h3>
                  <div className="h-[2px] flex-1 bg-gray-200"></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {items.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => dispatch(addToCart(product))}
                      className="bg-white rounded-xl shadow-sm border border-transparent active:border-blue-500 cursor-pointer hover:shadow-md transition flex flex-col overflow-hidden"
                    >
                      {product.image && (
                        <div className="h-32 bg-gray-200">
                          <img
                            src={product.image}
                            className="w-full h-full object-cover"
                            alt={product.name}
                          />
                        </div>
                      )}
                      <div className="p-3">
                        <h4 className="font-semibold text-gray-700 text-sm truncate">
                          {product.name}
                        </h4>
                        <p className="text-blue-600 font-bold text-sm">
                          Rp {product.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 text-gray-400">Toko ini belum memiliki produk.</div>
          )}
          
          {/* Tombol Tambah Menu hanya muncul jika yang melihat adalah pemilik toko (opsional) */}
          {auth.currentUser?.uid === merchantId && (
              <div className="pt-6">
                <button
                  onClick={() => navigate("/menu/add")}
                  className="cursor-pointer mb-8 min-w-48 py-4 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2 text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-all bg-white/50"
                >
                  <Plus size={20} />
                  <span className="font-medium">Tambah Produk</span>
                </button>
              </div>
          )}
        </div>

        {/* Detail Pesanan (Cart) */}
        {(cartItems.length > 0) && (
          <div className="w-full md:w-80 bg-white border-t md:border-t-0 md:border-l flex flex-col shrink-0 h-[45vh] md:h-full shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)] md:shadow-none">
            <div className="p-4 border-b shrink-0 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Keranjang</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center group active:bg-red-50 p-1 rounded transition"
                  onClick={() => dispatch(removeFromCart(item))}
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-400">x{item.qty}</p>
                  </div>
                  <p className="font-bold text-sm text-gray-700 ml-2">
                    Rp {(item.price * item.qty).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gray-50 border-t mt-auto shrink-0">
              <div className="flex justify-between mb-4">
                <span className="text-gray-500 font-medium">Total</span>
                <span className="text-2xl font-black text-blue-600">
                  Rp {totalAmount.toLocaleString()}
                </span>
              </div>
              <button
                onClick={startCheckout}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-transform"
              >
                PESAN SEKARANG
              </button>
            </div>
          </div>
        )}
      </div>


      {/* Modal Dialog Data User */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Data Pengiriman</h3>
            <form onSubmit={handleFinalSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama</label>
                <input
                  required
                  type="text"
                  className="w-full p-3 border rounded-xl mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={customerData.nama}
                  onChange={(e) => setCustomerData({...customerData, nama: e.target.value})}
                  placeholder="Masukkan nama Anda"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Alamat Lengkap</label>
                <textarea
                  required
                  className="w-full p-3 border rounded-xl mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={customerData.alamat}
                  onChange={(e) => setCustomerData({...customerData, alamat: e.target.value})}
                  placeholder="Alamat pengiriman"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nomor WhatsApp</label>
                <input
                  required
                  type="tel"
                  className="w-full p-3 border rounded-xl mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={customerData.nomorWA}
                  onChange={(e) => setCustomerData({...customerData, nomorWA: e.target.value})}
                  placeholder="0812xxxx"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200"
                >
                  Konfirmasi & Bayar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Toko;
