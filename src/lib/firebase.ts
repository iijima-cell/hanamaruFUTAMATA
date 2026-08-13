import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { ProductItem, RecordEntry } from '../types';
import { INITIAL_PRODUCTS, INITIAL_RECORDS } from '../data/initialData';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Firestore Database (with custom databaseId if configured)
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-in error:', error);
    throw error;
  }
};

// Sign out
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign-out error:', error);
    throw error;
  }
};

// Listen to auth state
export const subscribeToAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Firestore Collection References
const productsRef = collection(db, 'products');
const recordsRef = collection(db, 'records');

// Reset and set current product catalog
export const resetProductsInFirestore = async () => {
  try {
    const snapshot = await getDocs(productsRef);
    const deletePromises = snapshot.docs.map((d) => deleteDoc(doc(productsRef, d.id)));
    await Promise.all(deletePromises);

    for (const prod of INITIAL_PRODUCTS) {
      await setDoc(doc(productsRef, prod.id), prod);
    }
    console.log('Products collection reset successfully with initial 69 catalog items.');
  } catch (err) {
    console.error('Error resetting products:', err);
  }
};

let isSyncingProducts = false;

// Subscribe to Products
export const subscribeToProducts = (callback: (products: ProductItem[]) => void) => {
  return onSnapshot(
    productsRef,
    async (snapshot) => {
      if (snapshot.empty) {
        if (!isSyncingProducts) {
          isSyncingProducts = true;
          for (const prod of INITIAL_PRODUCTS) {
            await setDoc(doc(productsRef, prod.id), prod);
          }
          isSyncingProducts = false;
        }
        callback(INITIAL_PRODUCTS);
      } else {
        const prods: ProductItem[] = [];
        let hasOldIds = false;
        snapshot.forEach((d) => {
          if (d.id.startsWith('p')) {
            hasOldIds = true;
          }
          prods.push({ id: d.id, ...d.data() } as ProductItem);
        });

        // If old products with 'p' prefix exist or count < 69, reset products in Firestore
        if (hasOldIds || prods.length < 69) {
          if (!isSyncingProducts) {
            isSyncingProducts = true;
            await resetProductsInFirestore();
            isSyncingProducts = false;
          }
          callback(INITIAL_PRODUCTS);
          return;
        }

        callback(prods);
      }
    },
    (err) => {
      console.error('Error fetching products:', err);
      // Fallback to local catalog if Firestore fails
      callback(INITIAL_PRODUCTS);
    }
  );
};

// Subscribe to Records
export const subscribeToRecords = (callback: (records: RecordEntry[]) => void) => {
  const q = query(recordsRef, orderBy('date', 'desc'));
  return onSnapshot(
    q,
    async (snapshot) => {
      if (snapshot.empty) {
        // Seed initial records if empty
        for (const rec of INITIAL_RECORDS) {
          await setDoc(doc(recordsRef, rec.id), rec);
        }
      } else {
        const recs: RecordEntry[] = [];
        snapshot.forEach((d) => {
          recs.push({ id: d.id, ...d.data() } as RecordEntry);
        });
        callback(recs);
      }
    },
    (err) => {
      console.error('Error fetching records:', err);
    }
  );
};

// Add / Update Record in Firestore
export const saveRecordToFirestore = async (
  entry: Omit<RecordEntry, 'id' | 'createdAt'>,
  userId?: string
) => {
  const newDocRef = doc(recordsRef);
  const record: RecordEntry = {
    ...entry,
    id: newDocRef.id,
    createdAt: new Date().toISOString(),
  };
  await setDoc(newDocRef, {
    ...record,
    userId: userId || 'anonymous',
  });
  return record;
};

// Update Waste in Firestore
export const updateWasteInFirestore = async (
  recordId: string,
  wasteQty: number,
  wasteReason: string
) => {
  const recRef = doc(db, 'records', recordId);
  await updateDoc(recRef, {
    wasteQty,
    wasteReason,
  });
};

// Full Record Update in Firestore
export const updateRecordInFirestore = async (record: RecordEntry) => {
  const recRef = doc(db, 'records', record.id);
  await setDoc(recRef, record, { merge: true });
};

// Delete Record in Firestore
export const deleteRecordFromFirestore = async (recordId: string) => {
  const recRef = doc(db, 'records', recordId);
  await deleteDoc(recRef);
};

// Add Product to Firestore
export const addProductToFirestore = async (
  newProduct: Omit<ProductItem, 'id'>,
  userId?: string
) => {
  const newDocRef = doc(productsRef);
  const p: ProductItem = {
    ...newProduct,
    id: newDocRef.id,
  };
  await setDoc(newDocRef, {
    ...p,
    userId: userId || 'anonymous',
  });
  return p;
};

// Delete Product from Firestore
export const deleteProductFromFirestore = async (productId: string) => {
  const pRef = doc(db, 'products', productId);
  await deleteDoc(pRef);
};
