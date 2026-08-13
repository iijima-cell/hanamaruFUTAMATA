import React, { useState } from 'react';
import { ProductItem, RecordEntry, WeatherType, ProductCategory } from '../types';
import { Trash2, Calendar, Sun, UtensilsCrossed, Package, Plus, Minus, Check, Save } from 'lucide-react';

interface WasteInputScreenProps {
  records: RecordEntry[];
  products: ProductItem[];
  onSaveRecord: (record: Omit<RecordEntry, 'id' | 'createdAt'>) => void;
  onUpdateRecordWaste: (recordId: string, wasteQty: number, wasteReason: string) => void;
}

const WEATHERS: WeatherType[] = ['晴れ', '曇り', '雨', '雪', '台風'];

const CATEGORIES: { id: ProductCategory; label: string }[] = [
  { id: 'salad', label: 'サラダ' },
  { id: 'souzai', label: '惣菜' },
  { id: 'agemono', label: '揚げ物' },
  { id: 'bento', label: '弁当' },
];

const WASTE_REASONS = ['売れ残り', '賞味期限切れ', '調理ミス・形崩れ', 'パック破損', 'その他'];

export const WasteInputScreen: React.FC<WasteInputScreenProps> = ({
  products,
  onSaveRecord,
}) => {
  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [date, setDate] = useState<string>(getTodayStr());
  const [weather, setWeather] = useState<WeatherType>('晴れ');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('salad');
  const [wasteReason, setWasteReason] = useState<string>('売れ残り');
  
  // State to store waste quantity for each product
  const [wasteQuantities, setWasteQuantities] = useState<Record<string, number>>({});
  const [savedStatus, setSavedStatus] = useState<boolean>(false);

  const categoryProducts = products.filter((p) => p.category === selectedCategory);

  const handleQtyChange = (productId: string, delta: number) => {
    setWasteQuantities((prev) => {
      const current = prev[productId] || 0;
      const nextVal = Math.max(0, current + delta);
      return { ...prev, [productId]: nextVal };
    });
  };

  const handleQtyInput = (productId: string, value: string) => {
    const parsed = parseInt(value, 10);
    const nextVal = isNaN(parsed) ? 0 : Math.max(0, parsed);
    setWasteQuantities((prev) => ({ ...prev, [productId]: nextVal }));
  };

  const handleSaveAll = () => {
    const itemsToSave = Object.entries(wasteQuantities).filter(([_, qty]) => Number(qty) > 0);
    
    if (itemsToSave.length === 0) {
      alert('保存する商品の廃棄数を1つ以上入力してください。');
      return;
    }

    let savedCount = 0;
    itemsToSave.forEach(([pId, qty]) => {
      const numQty = Number(qty);
      const prod = products.find((p) => p.id === pId);
      if (prod && numQty > 0) {
        onSaveRecord({
          date,
          weather,
          productId: prod.id,
          productName: prod.name,
          productionQty: 0,
          wasteQty: numQty,
          wasteReason: wasteReason,
          memo: '',
        });
        savedCount++;
      }
    });

    setSavedStatus(true);
    alert(`合計 ${savedCount} 件の廃棄記録を保存しました！`);
    setTimeout(() => setSavedStatus(false), 3000);
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Outer Cream Container */}
      <div className="bg-[#FFF9EE] rounded-3xl p-4 sm:p-6 border border-orange-200/60 shadow-sm space-y-5">
        
        {/* Top Title Section */}
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Trash2 className="w-5 h-5 text-[#D93D00]" />
            <h2 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight">
              廃棄記録の入力
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-bold text-[#E04F00] pl-7">
            本日の廃棄数・ロス理由を商品ごとに入力してください
          </p>
        </div>

        {/* Inner White Form Card */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/80 shadow-xs space-y-5">
          
          {/* Date, Weather, Reason */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Date */}
            <div>
              <label className="block text-stone-700 font-bold text-xs mb-1.5 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-orange-500" />
                <span>日付</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl border border-stone-200 focus:border-orange-500 outline-none text-xs sm:text-sm font-bold text-stone-800 bg-stone-50/50"
              />
            </div>

            {/* Weather Select */}
            <div>
              <label className="block text-stone-700 font-bold text-xs mb-1.5 flex items-center space-x-1">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>天気</span>
              </label>
              <select
                value={weather}
                onChange={(e) => setWeather(e.target.value as WeatherType)}
                className="w-full px-3 py-2.5 rounded-2xl border border-stone-200 focus:border-orange-500 outline-none text-xs sm:text-sm font-bold text-stone-800 bg-stone-50/50 cursor-pointer"
              >
                {WEATHERS.map((w) => (
                  <option key={w} value={w}>
                    {w === '晴れ' && '☀️ '}
                    {w === '曇り' && '☁️ '}
                    {w === '雨' && '☔ '}
                    {w === '雪' && '❄️ '}
                    {w === '台風' && '🌀 '}
                    {w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Waste Reason */}
          <div>
            <label className="block text-stone-700 font-bold text-xs mb-1.5">
              廃棄・ロス理由（共通）
            </label>
            <div className="flex flex-wrap gap-1.5">
              {WASTE_REASONS.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setWasteReason(r)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    wasteReason === r
                      ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Section Heading & Category Switcher */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-stone-800 font-black text-sm sm:text-base flex items-center space-x-1.5">
                <UtensilsCrossed className="w-4 h-4 text-rose-600" />
                <span>商品別入力 (廃棄数)</span>
              </label>
            </div>

            {/* Category Switcher Pills */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-1">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-[#FA5400] text-white shadow-sm ring-2 ring-orange-400/30'
                        : 'bg-[#FFEED9] text-[#C2410C] hover:bg-[#FFE6C7]'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Items List */}
          <div className="space-y-3 pt-1">
            {categoryProducts.length === 0 ? (
              <div className="text-center py-8 text-stone-400 text-xs font-bold bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                このカテゴリの商品がまだ登録されていません
              </div>
            ) : (
              categoryProducts.map((p) => {
                const qty = wasteQuantities[p.id] || 0;
                return (
                  <div
                    key={p.id}
                    className="bg-[#FFF5F5] border border-rose-200/80 rounded-2xl p-4 shadow-2xs space-y-2.5 transition-all hover:border-rose-300"
                  >
                    {/* Item Title Row */}
                    <div className="flex items-center space-x-2">
                      <span className="w-1.5 h-4 bg-rose-500 rounded-full" />
                      <h3 className="font-extrabold text-stone-900 text-base sm:text-lg">
                        {p.name}
                      </h3>
                    </div>

                    {/* Unit Label */}
                    <div className="flex items-center space-x-2 text-stone-600 text-xs font-bold pl-3.5">
                      <Package className="w-3.5 h-3.5 text-rose-600" />
                      <span>廃棄数</span>
                      <span className="text-stone-500">
                        ({p.unitLabel || '1単位'})
                      </span>
                    </div>

                    {/* Stepper Input Row */}
                    <div className="flex items-center space-x-2 pt-1">
                      {/* Minus button */}
                      <button
                        type="button"
                        onClick={() => handleQtyChange(p.id, -1)}
                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-black text-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-2xs"
                      >
                        <Minus className="w-5 h-5 stroke-[3]" />
                      </button>

                      {/* Input Box */}
                      <input
                        type="number"
                        min="0"
                        value={qty}
                        onChange={(e) => handleQtyInput(p.id, e.target.value)}
                        className="flex-1 h-11 sm:h-12 bg-white border border-rose-300 rounded-xl text-center text-xl sm:text-2xl font-black text-rose-950 outline-none focus:ring-2 focus:ring-rose-400 shadow-inner"
                      />

                      {/* Plus button */}
                      <button
                        type="button"
                        onClick={() => handleQtyChange(p.id, 1)}
                        className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-black text-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-5 h-5 stroke-[3]" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Submit/Save All Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSaveAll}
              className={`w-full py-3.5 sm:py-4 rounded-2xl font-black text-base sm:text-lg text-white transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center space-x-2 ${
                savedStatus
                  ? 'bg-emerald-600'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {savedStatus ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>保存完了しました！</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>廃棄数を保存する</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
