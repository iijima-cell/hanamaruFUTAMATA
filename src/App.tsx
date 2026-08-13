import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Header } from './components/Header';
import { ProductionInputScreen } from './components/ProductionInputScreen';
import { WasteInputScreen } from './components/WasteInputScreen';
import { AnalyticsScreen } from './components/AnalyticsScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { ProductMasterModal } from './components/ProductMasterModal';
import { TabType, RecordEntry, ProductItem } from './types';
import { INITIAL_PRODUCTS, INITIAL_RECORDS } from './data/initialData';
import {
  subscribeToAuth,
  signInWithGoogle,
  logout,
  subscribeToProducts,
  subscribeToRecords,
  saveRecordToFirestore,
  updateWasteInFirestore,
  updateRecordInFirestore,
  deleteRecordFromFirestore,
  addProductToFirestore,
  deleteProductFromFirestore,
  resetProductsInFirestore,
} from './lib/firebase';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('production');
  const [user, setUser] = useState<User | null>(null);

  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [records, setRecords] = useState<RecordEntry[]>(INITIAL_RECORDS);

  const [isProductMasterOpen, setIsProductMasterOpen] = useState(false);

  // Subscribe to Firebase Auth
  useEffect(() => {
    const unsubscribe = subscribeToAuth((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to Firestore Realtime Data
  useEffect(() => {
    const unsubProducts = subscribeToProducts((prods) => {
      if (prods && prods.length > 0) {
        setProducts(prods);
      }
    });

    const unsubRecords = subscribeToRecords((recs) => {
      if (recs) {
        setRecords(recs);
      }
    });

    return () => {
      unsubProducts();
      unsubRecords();
    };
  }, []);

  // Auth Handlers
  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (e) {
      alert('Googleログインに失敗しました。');
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (e) {
      alert('ログアウトに失敗しました。');
    }
  };

  // Handler: Add new record
  const handleSaveRecord = async (newEntry: Omit<RecordEntry, 'id' | 'createdAt'>) => {
    try {
      await saveRecordToFirestore(newEntry, user?.uid);
    } catch (e) {
      console.error('Firestore save failed, fallback to local state:', e);
      const fullRecord: RecordEntry = {
        ...newEntry,
        id: `rec-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setRecords((prev) => [fullRecord, ...prev]);
    }
  };

  // Handler: Update waste for existing record
  const handleUpdateRecordWaste = async (id: string, wasteQty: number, wasteReason: string) => {
    try {
      await updateWasteInFirestore(id, wasteQty, wasteReason);
    } catch (e) {
      console.error(e);
      setRecords((prev) =>
        prev.map((r) => (r.id === id ? { ...r, wasteQty, wasteReason } : r))
      );
    }
  };

  // Handler: Full update
  const handleUpdateRecord = async (updated: RecordEntry) => {
    try {
      await updateRecordInFirestore(updated);
    } catch (e) {
      console.error(e);
      setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    }
  };

  // Handler: Delete record
  const handleDeleteRecord = async (id: string) => {
    try {
      await deleteRecordFromFirestore(id);
    } catch (e) {
      console.error(e);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    }
  };

  // Handler: Reset to sample data
  const handleResetData = () => {
    setRecords(INITIAL_RECORDS);
    setProducts(INITIAL_PRODUCTS);
  };

  // Handler: Master Product Add
  const handleAddProduct = async (newProduct: Omit<ProductItem, 'id'>) => {
    try {
      await addProductToFirestore(newProduct, user?.uid);
    } catch (e) {
      console.error(e);
      const p: ProductItem = {
        ...newProduct,
        id: `p-${Date.now()}`,
      };
      setProducts((prev) => [...prev, p]);
    }
  };

  // Handler: Master Product Delete
  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProductFromFirestore(id);
    } catch (e) {
      console.error(e);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-stone-800 flex flex-col font-sans selection:bg-orange-200">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenProductMaster={() => setIsProductMasterOpen(true)}
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 pb-24">
        {activeTab === 'production' && (
          <ProductionInputScreen
            products={products}
            onSaveRecord={handleSaveRecord}
            onOpenProductMaster={() => setIsProductMasterOpen(true)}
          />
        )}

        {activeTab === 'waste' && (
          <WasteInputScreen
            records={records}
            products={products}
            onSaveRecord={handleSaveRecord}
            onUpdateRecordWaste={handleUpdateRecordWaste}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsScreen records={records} products={products} />
        )}

        {activeTab === 'history' && (
          <HistoryScreen
            records={records}
            onDeleteRecord={handleDeleteRecord}
            onUpdateRecord={handleUpdateRecord}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Product Master Modal */}
      <ProductMasterModal
        products={products}
        isOpen={isProductMasterOpen}
        onClose={() => setIsProductMasterOpen(false)}
        onAddProduct={handleAddProduct}
        onDeleteProduct={handleDeleteProduct}
        onResetProducts={resetProductsInFirestore}
      />

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-6 text-center text-xs border-t border-stone-800 hidden md:block">
        <p className="font-bold text-stone-300">
          はなまるフードサービス 惣菜・お弁当 製造・廃棄管理システム
        </p>
        <p className="text-stone-500 mt-1">
          Firebase Firestore リアルタイムデータベース & Google認証 連携済み
        </p>
      </footer>
    </div>
  );
}
