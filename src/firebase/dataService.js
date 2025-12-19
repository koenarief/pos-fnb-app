import { db } from './config';
import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { query, orderBy, limit } from 'firebase/firestore';

// Ambil semua transaksi milik user
export const getTransactions = async (userId) => {
  if (!userId) return [];
  const transCol = collection(db, 'users', userId, 'transactions');
  // Urutkan berdasarkan waktu terbaru
  const q = query(transCol, orderBy('timestamp', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data(),
    // Konversi timestamp Firebase ke JS Date agar mudah dibaca
    date: doc.data().timestamp?.toDate() 
  }));
};

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

// Tambah Pengeluaran
export const addExpense = async (userId, expenseData) => {
  const colRef = collection(db, 'users', userId, 'expenses');
  return await addDoc(colRef, {
    ...expenseData,
    amount: Number(expenseData.amount),
    date: serverTimestamp()
  });
};

// Ambil List Pengeluaran
export const getExpenses = async (userId) => {
  const colRef = collection(db, 'users', userId, 'expenses');
  const q = query(colRef, orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Helper untuk ambil data koleksi apapun milik user
const getDataByUserId = async (userId, collectionName) => {
  const colRef = collection(db, 'users', userId, collectionName);
  const q = query(colRef, orderBy(collectionName === 'transactions' ? 'timestamp' : 'date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data(),
    amount: doc.data().totalAmount || doc.data().amount || 0 
  }));
};

export const getFinancialData = async (userId) => {
  const [transactions, expenses] = await Promise.all([
    getDataByUserId(userId, 'transactions'),
    getDataByUserId(userId, 'expenses')
  ]);
  return { transactions, expenses };
};

// Mendapatkan data profil merchant
export const getMerchantProfile = async (userId) => {
  if (!userId) return null;
  const docRef = doc(db, 'users', userId, 'settings', 'merchantProfile');
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

// Menyimpan atau mengupdate profil merchant
export const saveMerchantProfile = async (userId, profileData) => {
  const docRef = doc(db, 'users', userId, 'settings', 'merchantProfile');
  return await setDoc(docRef, profileData, { merge: true });
};
