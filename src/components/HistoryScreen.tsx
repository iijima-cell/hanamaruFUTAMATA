import React, { useState, useMemo } from 'react';
import { RecordEntry, WeatherType } from '../types';
import { Search, Filter, Download, Trash2, Edit2, Calendar, Sun, Cloud, CloudRain, Snowflake, Wind, Check, X, RefreshCw } from 'lucide-react';

interface HistoryScreenProps {
  records: RecordEntry[];
  onDeleteRecord: (id: string) => void;
  onUpdateRecord: (updated: RecordEntry) => void;
  onResetData: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  records,
  onDeleteRecord,
  onUpdateRecord,
  onResetData,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedWeather, setSelectedWeather] = useState<string>('all');
  const [editingRecord, setEditingRecord] = useState<RecordEntry | null>(null);

  // Search & Filter
  const filteredRecords = useMemo(() => {
    return records
      .filter((r) => {
        const matchesQuery =
          r.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.memo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.date.includes(searchQuery);

        const matchesWeather = selectedWeather === 'all' || r.weather === selectedWeather;

        return matchesQuery && matchesWeather;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [records, searchQuery, selectedWeather]);

  // CSV Export
  const handleExportCSV = () => {
    if (records.length === 0) {
      alert('出力するデータがありません。');
      return;
    }

    const headers = ['日付', '天気', '商品名', '製造数', '廃棄数', '廃棄率(%)', '廃棄理由', 'メモ'];
    const rows = records.map((r) => {
      const rate = r.productionQty > 0 ? ((r.wasteQty / r.productionQty) * 100).toFixed(1) : '0';
      return [
        r.date,
        r.weather,
        `"${r.productName.replace(/"/g, '""')}"`,
        r.productionQty,
        r.wasteQty,
        `${rate}%`,
        `"${(r.wasteReason || '').replace(/"/g, '""')}"`,
        `"${(r.memo || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `hanamaru_records_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEditSave = () => {
    if (editingRecord) {
      onUpdateRecord(editingRecord);
      setEditingRecord(null);
      alert('更新しました！');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight">入力履歴・データ管理</h2>
          <p className="text-orange-100 text-xs sm:text-sm">
            過去に入力した製造数・廃棄数のデータ確認、編集、CSVダウンロードが行えます。
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-2xl bg-white text-orange-600 font-extrabold text-xs sm:text-sm shadow-md hover:bg-orange-50 active:scale-95 transition-all flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4" />
            <span>CSV出力</span>
          </button>
          <button
            onClick={() => {
              if (confirm('サンプルデータを含めデータを初期状態にリセットしますか？')) {
                onResetData();
              }
            }}
            className="px-3 py-2.5 rounded-2xl bg-white/20 text-white font-bold text-xs hover:bg-white/30 backdrop-blur-md flex items-center space-x-1"
            title="サンプルデータにリセット"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">リセット</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-orange-100 shadow-sm space-y-3 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="商品名、メモ、日付で検索..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-2 border-stone-200 outline-none text-sm font-semibold text-stone-800 focus:border-orange-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-stone-400" />
          <select
            value={selectedWeather}
            onChange={(e) => setSelectedWeather(e.target.value)}
            className="px-3 py-2.5 rounded-2xl border-2 border-stone-200 outline-none text-xs font-bold text-stone-800 bg-stone-50"
          >
            <option value="all">天候: すべて</option>
            <option value="晴れ">晴れ ☀️</option>
            <option value="曇り">曇り ☁️</option>
            <option value="雨">雨 🌧️</option>
            <option value="雪">雪 ❄️</option>
          </select>
        </div>
      </div>

      {/* Record Cards / List */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 text-stone-400 space-y-2">
            <p className="font-bold text-base">条件に一致する記録がありません</p>
            <p className="text-xs">製造入力画面または廃棄入力画面からデータを保存してください。</p>
          </div>
        ) : (
          filteredRecords.map((r) => {
            const wastePercent = r.productionQty > 0 ? Math.round((r.wasteQty / r.productionQty) * 100) : 0;
            return (
              <div
                key={r.id}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200 hover:border-orange-300 shadow-xs transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-xl bg-orange-100 text-orange-800 font-extrabold text-xs">
                      {r.date}
                    </span>
                    <span className="px-2.5 py-1 rounded-xl bg-stone-100 text-stone-700 font-bold text-xs flex items-center space-x-1">
                      <span>{r.weather}</span>
                    </span>
                    <span className="font-black text-stone-900 text-base">{r.productName}</span>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-auto">
                    <button
                      onClick={() => setEditingRecord({ ...r })}
                      className="p-2 rounded-xl text-stone-500 hover:bg-stone-100 hover:text-orange-600 transition-colors"
                      title="編集"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`「${r.productName} (${r.date})」の記録を削除しますか？`)) {
                          onDeleteRecord(r.id);
                        }
                      }}
                      className="p-2 rounded-xl text-stone-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center py-1">
                  <div className="bg-orange-50/60 rounded-2xl p-2.5 border border-orange-100">
                    <div className="text-[11px] font-bold text-stone-500">製造数</div>
                    <div className="text-lg font-black text-orange-600">{r.productionQty}個</div>
                  </div>
                  <div className="bg-red-50/60 rounded-2xl p-2.5 border border-red-100">
                    <div className="text-[11px] font-bold text-stone-500">廃棄数</div>
                    <div className="text-lg font-black text-red-600">{r.wasteQty}個</div>
                  </div>
                  <div className="bg-amber-50/60 rounded-2xl p-2.5 border border-amber-100">
                    <div className="text-[11px] font-bold text-stone-500">廃棄率</div>
                    <div className="text-lg font-black text-amber-600">{wastePercent}%</div>
                  </div>
                </div>

                {(r.wasteReason || r.memo) && (
                  <div className="text-xs text-stone-600 bg-stone-50 rounded-xl p-2.5 space-y-1">
                    {r.wasteReason && (
                      <div className="font-bold text-stone-700">廃棄理由: {r.wasteReason}</div>
                    )}
                    {r.memo && <div className="text-stone-500">メモ: {r.memo}</div>}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Edit Modal */}
      {editingRecord && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-scale-up">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="font-extrabold text-stone-900 text-lg">記録データの編集</h3>
              <button
                onClick={() => setEditingRecord(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">商品名</label>
                <input
                  type="text"
                  value={editingRecord.productName}
                  onChange={(e) => setEditingRecord({ ...editingRecord, productName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border-2 border-stone-200 text-sm font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">製造数</label>
                  <input
                    type="number"
                    value={editingRecord.productionQty}
                    onChange={(e) => setEditingRecord({ ...editingRecord, productionQty: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border-2 border-stone-200 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-1">廃棄数</label>
                  <input
                    type="number"
                    value={editingRecord.wasteQty}
                    onChange={(e) => setEditingRecord({ ...editingRecord, wasteQty: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border-2 border-stone-200 text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">廃棄理由</label>
                <input
                  type="text"
                  value={editingRecord.wasteReason || ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, wasteReason: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border-2 border-stone-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">メモ</label>
                <input
                  type="text"
                  value={editingRecord.memo || ''}
                  onChange={(e) => setEditingRecord({ ...editingRecord, memo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border-2 border-stone-200 text-sm"
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setEditingRecord(null)}
                className="flex-1 py-3 rounded-2xl bg-stone-100 text-stone-700 font-bold text-sm"
              >
                キャンセル
              </button>
              <button
                onClick={handleEditSave}
                className="flex-1 py-3 rounded-2xl bg-orange-600 text-white font-bold text-sm shadow-md"
              >
                保存する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
