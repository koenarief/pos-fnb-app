import { db } from './config';
import { doc, updateDoc, deleteDoc, collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

// Fungsi untuk mendapatkan referensi koleksi produk milik user tertentu
const getProductCol = (userId) => collection(db, 'users', userId, 'products');

// Ambil semua produk milik user yang login
export const getProducts = async (userId) => {
  if (!userId) return [];
  const snapshot = await getDocs(getProductCol(userId));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Tambah produk baru ke folder user tersebut
export const addProduct = async (userId, productData) => {
  if (!userId) throw new Error("User ID tidak ditemukan");
  const productCol = collection(db, 'users', userId, 'products');
  return await addDoc(productCol, {
    ...productData,
    price: Number(productData.price), // Pastikan harga adalah angka
    createdAt: serverTimestamp()
  });
};
// Fungsi untuk menyimpan transaksi (juga di folder user)
export const saveTransaction = async (userId, transactionData) => {
  const transCol = collection(db, 'users', userId, 'transactions');
  return await addDoc(transCol, {
    ...transactionData,
    timestamp: serverTimestamp()
  });
};

// Update Produk
export const updateProduct = async (userId, productId, updatedData) => {
  const productRef = doc(db, 'users', userId, 'products', productId);
  return await updateDoc(productRef, {
    ...updatedData,
    price: Number(updatedData.price)
  });
};

// Hapus Produk
export const deleteProduct = async (userId, productId) => {
  const productRef = doc(db, 'users', userId, 'products', productId);
  return await deleteDoc(productRef);
};
