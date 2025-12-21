import { db } from './config';
import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { query, orderBy, limit } from 'firebase/firestore';

// Ambil semua transaksi milik user
export const getTransactions = async (merchantId) => {
  if (!merchantId) return [];
  const transCol = collection(db, 'merchants', merchantId, 'transactions');
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
const getProductCol = (merchantId) => {
	return collection(db, 'merchants', merchantId, 'products');
}

// Ambil semua produk milik user yang login
export const getProducts = async (merchantId) => {
  if (!merchantId) return [];
  const snapshot = await getDocs(getProductCol(merchantId));
  const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  return products.sort((a, b) => {
    if (a.category < b.category) return -1;
    if (a.category > b.category) return 1;
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  });
};

// Tambah produk baru ke folder user tersebut
export const addProduct = async (merchantId, userId, productData) => {
  if (!userId) throw new Error("User ID tidak ditemukan");
  const productCol = getProductCol(merchantId);

  return await addDoc(productCol, {
    ...productData,
    userId: userId,
    price: Number(productData.price), // Pastikan harga adalah angka
    createdAt: serverTimestamp()
  });
};
// Fungsi untuk menyimpan transaksi (juga di folder user)
export const saveTransaction = async (merchantId, userId, transactionData) => {
  const transCol = collection(db, 'merchants', merchantId, 'transactions');
  return await addDoc(transCol, {
    ...transactionData,
    userId: userId,
    timestamp: serverTimestamp()
  });
};

// Update Produk
export const updateProduct = async (merchantId, productId, updatedData) => {
  const productRef = doc(db, 'merchants', merchantId, 'products', productId);
  return await updateDoc(productRef, {
    ...updatedData,
    price: Number(updatedData.price)
  });
};

// Hapus Produk
export const deleteProduct = async (merchantId, productId) => {
  const productRef = doc(db, 'merchants', merchantId, 'products', productId);
  return await deleteDoc(productRef);
};

// Copy Produk
export const copyProduct = async (merchantId, productId) => {
  const productRef = doc(db, 'merchants', merchantId, 'products', productId);
  const productDoc = await getDoc(productRef);

  if (productDoc.exists()) {
    const updatedData = productDoc.data();
    delete updatedData.id; // hapus id asli untuk membuat dokumen baru
    
    const colRef = collection(db, 'merchants', merchantId, 'products');
    return await addDoc(colRef, {
      ...updatedData,
      price: Number(updatedData.price)
    });
  } else {
    throw new Error('Produk tidak ditemukan');
  }

};

// Tambah Pengeluaran
export const addExpense = async (merchantId, userId, expenseData) => {
  const colRef = collection(db, 'merchants', merchantId, 'expenses');
  return await addDoc(colRef, {
    ...expenseData,
    userId: userId,
    amount: Number(expenseData.amount),
    date: serverTimestamp()
  });
};

// Ambil List Pengeluaran
export const getExpenses = async (merchantId, userId) => {
  const colRef = collection(db, 'merchants', merchantId, 'expenses');
  const q = query(colRef, orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Helper untuk ambil data koleksi apapun milik user
const getDataByMerchantId = async (merchantId, collectionName) => {
  const colRef = collection(db, 'merchants', merchantId, collectionName);
  const q = query(colRef, orderBy(collectionName === 'transactions' ? 'timestamp' : 'date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data(),
    amount: doc.data().totalAmount || doc.data().amount || 0 
  }));
};

export const getFinancialData = async (merchantId) => {
  const [transactions, expenses] = await Promise.all([
    getDataByMerchantId(merchantId, 'transactions'),
    getDataByMerchantId(merchantId, 'expenses')
  ]);
  return { transactions, expenses };
};

// Mendapatkan data profil merchant
export const getMerchantProfile = async (merchantId) => {
  if (!merchantId) return null;
  const docRef = doc(db, 'merchants', merchantId, 'settings', 'merchantProfile');
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

// Menyimpan atau mengupdate profil merchant
export const saveMerchantProfile = async (merchantId, profileData) => {
  const docRef = doc(db, 'merchants', merchantId , 'settings', 'merchantProfile');
  return await setDoc(docRef, profileData, { merge: true });
};

// Mendapatkan data profil user
export const getUserProfile = async (userId) => {
  if (!userId) return null;
  const docRef = doc(db, 'users', userId, 'settings', 'profile');
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

// Menyimpan atau mengupdate profil user
export const saveUserProfile = async (userId, profileData) => {
  const docRef = doc(db, 'users', userId, 'settings', 'rofile');
  return await setDoc(docRef, profileData, { merge: true });
};

