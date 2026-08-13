import React, { useState } from 'react';
import { ProductItem, ProductCategory } from '../types';
import { X, Plus, Trash2, Tag, Utensils, RotateCcw } from 'lucide-react';

interface ProductMasterModalProps {
  products: ProductItem[];
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: Omit<ProductItem, 'id'>) => void;
  onDeleteProduct: (id: string) => void;
  onResetProducts?: () => void;
}

export const ProductMasterModal: React.FC<ProductMasterModalProps> = ({
  products,
  isOpen,
  onClose,
  onAddProduct,
  onDeleteProduct,
  onResetProducts,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('bento');
  const [unitPrice, setUnitPrice] = useState<number>(580);
  const [costPrice, setCostPrice] = useState<number>(280);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddProduct({
      name: name.trim(),
      category,
      unitPrice,
      costPrice,
    });

    setName('');
    alert(`新しい商品「${name}」を追加しました！`);
  };

  const handleReset = () => {
    if (window.confirm('登録されている商品をすべて削除し、最新の標準商品カタログ（全69品）へ一括で置き換えます。宜しいですか？')) {
      if (onResetProducts) {
        onResetProducts();
        alert('商品を最新の標準カタログ（全69品）に更新しました！');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-stone-100 pb-3">
          <div className="flex items-center space-x-2">
            <Utensils className="w-5 h-5 text-orange-600" />
            <h3 className="font-extrabold text-stone-900 text-lg">商品マスター（登録・管理）</h3>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Add New Form */}
        <form onSubmit={handleSubmit} className="bg-orange-50/70 p-4 rounded-2xl border border-orange-200 space-y-3">
          <h4 className="font-black text-orange-950 text-sm flex items-center space-x-1.5">
            <Plus className="w-4 h-4 text-orange-600" />
            <span>新規商品の追加</span>
          </h4>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">商品名</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 特製ロースカツ弁当"
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm font-bold bg-white"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">カテゴリ</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white cursor-pointer"
              >
                <option value="souzai">惣菜 🍲</option>
                <option value="salad">サラダ 🥗</option>
                <option value="bento">お弁当 🍱</option>
                <option value="agemono">揚げ物 🍗</option>
                <option value="other">その他</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">販売価格 (円)</label>
              <input
                type="number"
                value={unitPrice}
                onChange={(e) => setUnitPrice(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-orange-600 text-white font-extrabold text-xs shadow-md hover:bg-orange-700 cursor-pointer"
          >
            追加保存する
          </button>
        </form>

        {/* Existing Products List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-stone-800 text-sm">登録済み商品一覧 ({products.length}件)</h4>
            {onResetProducts && (
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center space-x-1 text-xs font-bold text-orange-700 bg-orange-100 hover:bg-orange-200 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>標準全69品に初期化</span>
              </button>
            )}
          </div>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {products.map((p) => (
              <div
                key={p.id}
                className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-stone-900 text-sm">{p.name}</div>
                  <div className="text-xs text-stone-500">
                    ¥{p.unitPrice?.toLocaleString()} ({
                      p.category === 'souzai' ? '惣菜 🍲' :
                      p.category === 'salad' ? 'サラダ 🥗' :
                      p.category === 'bento' ? 'お弁当 🍱' :
                      p.category === 'agemono' ? '揚げ物 🍗' : 'その他'
                    })
                  </div>
                </div>

                {!p.isDefault && (
                  <button
                    onClick={() => onDeleteProduct(p.id)}
                    className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-stone-200"
                    title="削除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
