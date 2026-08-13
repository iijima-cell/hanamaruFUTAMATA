import React, { useState, useMemo } from 'react';
import { RecordEntry, ProductItem } from '../types';
import { BarChart3, TrendingDown, DollarSign, Package, AlertCircle, Lightbulb, Filter, Calendar } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';

interface AnalyticsScreenProps {
  records: RecordEntry[];
  products: ProductItem[];
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ records, products }) => {
  const [dateRange, setDateRange] = useState<'all' | '7days' | '30days'>('all');

  // Filtered records based on range
  const filteredRecords = useMemo(() => {
    if (dateRange === 'all') return records;

    const days = dateRange === '7days' ? 7 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().split('T')[0];

    return records.filter((r) => r.date >= cutoffStr);
  }, [records, dateRange]);

  // Overall KPIs
  const totalProduction = useMemo(
    () => filteredRecords.reduce((sum, r) => sum + r.productionQty, 0),
    [filteredRecords]
  );

  const totalWaste = useMemo(
    () => filteredRecords.reduce((sum, r) => sum + r.wasteQty, 0),
    [filteredRecords]
  );

  const overallWasteRate = totalProduction > 0 ? ((totalWaste / totalProduction) * 100).toFixed(1) : '0.0';

  // Financial Loss Calculation
  const estimatedLossAmount = useMemo(() => {
    return filteredRecords.reduce((sum, r) => {
      const prod = products.find((p) => p.id === r.productId);
      const price = prod?.unitPrice || 500;
      return sum + r.wasteQty * price;
    }, 0);
  }, [filteredRecords, products]);

  // Chart 1: Item-wise Production vs Waste & Waste Rate
  const itemAnalyticsData = useMemo(() => {
    const map = new Map<string, { name: string; production: number; waste: number }>();

    filteredRecords.forEach((r) => {
      const name = r.productName;
      const current = map.get(name) || { name, production: 0, waste: 0 };
      map.set(name, {
        name,
        production: current.production + r.productionQty,
        waste: current.waste + r.wasteQty,
      });
    });

    return Array.from(map.values()).map((item) => {
      const rate = item.production > 0 ? parseFloat(((item.waste / item.production) * 100).toFixed(1)) : 0;
      return {
        ...item,
        wasteRate: rate,
      };
    }).sort((a, b) => b.waste - a.waste);
  }, [filteredRecords]);

  // Chart 2: Weather Impact Analysis
  const weatherAnalyticsData = useMemo(() => {
    const map = new Map<string, { weather: string; production: number; waste: number; count: number }>();

    filteredRecords.forEach((r) => {
      const w = r.weather || '晴れ';
      const current = map.get(w) || { weather: w, production: 0, waste: 0, count: 0 };
      map.set(w, {
        weather: w,
        production: current.production + r.productionQty,
        waste: current.waste + r.wasteQty,
        count: current.count + 1,
      });
    });

    return Array.from(map.values()).map((item) => {
      const wasteRate = item.production > 0 ? parseFloat(((item.waste / item.production) * 100).toFixed(1)) : 0;
      return {
        weather: item.weather,
        '製造数': item.production,
        '廃棄数': item.waste,
        '平均廃棄率(%)': wasteRate,
      };
    });
  }, [filteredRecords]);

  // Chart 3: Daily Trend Data
  const dailyTrendData = useMemo(() => {
    const map = new Map<string, { date: string; production: number; waste: number }>();

    filteredRecords.forEach((r) => {
      const current = map.get(r.date) || { date: r.date, production: 0, waste: 0 };
      map.set(r.date, {
        date: r.date,
        production: current.production + r.productionQty,
        waste: current.waste + r.wasteQty,
      });
    });

    return Array.from(map.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((d) => ({
        date: d.date.substring(5), // MM-DD
        '製造数': d.production,
        '廃棄数': d.waste,
        '廃棄率(%)': d.production > 0 ? parseFloat(((d.waste / d.production) * 100).toFixed(1)) : 0,
      }));
  }, [filteredRecords]);

  // Smart AI Recommendations / Hints
  const smartInsights = useMemo(() => {
    const hints: string[] = [];

    // Check rainy weather vs sunny weather
    const rainy = weatherAnalyticsData.find((w) => w.weather === '雨');
    const sunny = weatherAnalyticsData.find((w) => w.weather === '晴れ');

    if (rainy && sunny && rainy['平均廃棄率(%)'] > sunny['平均廃棄率(%)']) {
      hints.push(
        `🌧️ 雨の日は平均廃棄率が ${rainy['平均廃棄率(%)']}% と、晴れの日 (${sunny['平均廃棄率(%)']}%) より高くなっています。雨予報の日は仕込み量を10〜20%抑制するのが効果的です。`
      );
    }

    // High waste items (>12%)
    const highWasteItem = itemAnalyticsData.find((i) => i.wasteRate > 10 && i.production >= 20);
    if (highWasteItem) {
      hints.push(
        `⚠️ 「${highWasteItem.name}」の廃棄率が ${highWasteItem.wasteRate}% と高めです。製造頻度や数量の見直し、または夕方のタイムセール検討を推奨します。`
      );
    }

    // Low waste items (<3%)
    const lowWasteItem = itemAnalyticsData.find((i) => i.wasteRate <= 3 && i.production >= 15);
    if (lowWasteItem) {
      hints.push(
        `✨ 「${lowWasteItem.name}」は廃棄率 ${lowWasteItem.wasteRate}% と非常に人気で完売傾向です。製造数をわずかに増やせる余地があります。`
      );
    }

    if (hints.length === 0) {
      hints.push('💡 データの蓄積が進んでいます。毎日入力することで需要予測の精度が向上します！');
    }

    return hints;
  }, [weatherAnalyticsData, itemAnalyticsData]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* Top Banner & Filter */}
      <div className="bg-gradient-to-br from-orange-600 via-amber-600 to-orange-700 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur-md mb-1">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>データ集計 & ロス削減分析</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight">製造・廃棄 分析ダッシュボード</h2>
          <p className="text-orange-100 text-xs sm:text-sm">
            お弁当・お惣菜の製造傾向やロス(廃棄)の割合をビジュアル化し改善に役立てます。
          </p>
        </div>

        {/* Date Filter Buttons */}
        <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 flex space-x-1 shrink-0 self-start sm:self-center">
          {[
            { id: 'all', label: '全期間' },
            { id: '7days', label: '直近7日間' },
            { id: '30days', label: '直近30日' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setDateRange(f.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                dateRange === f.id
                  ? 'bg-white text-orange-600 shadow-md font-extrabold'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Production */}
        <div className="bg-white rounded-3xl p-5 border border-orange-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">総製造数</span>
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-800">
            {totalProduction.toLocaleString()} <span className="text-sm font-bold text-stone-500">個</span>
          </div>
          <div className="text-[11px] font-semibold text-stone-400">対象データ: {filteredRecords.length}件</div>
        </div>

        {/* Total Waste */}
        <div className="bg-white rounded-3xl p-5 border border-orange-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">総廃棄数</span>
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-red-600">
            {totalWaste.toLocaleString()} <span className="text-sm font-bold text-stone-500">個</span>
          </div>
          <div className="text-[11px] font-semibold text-stone-400">賞味期限切れ・売れ残り</div>
        </div>

        {/* Waste Rate */}
        <div className="bg-white rounded-3xl p-5 border border-orange-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">平均廃棄率</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
              %
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">
            {overallWasteRate}%
          </div>
          <div className="text-[11px] font-bold text-emerald-600">
            {parseFloat(overallWasteRate) < 5 ? '適正範囲 (5%以下)' : '見直し推奨 (>5%)'}
          </div>
        </div>

        {/* Financial Loss */}
        <div className="bg-white rounded-3xl p-5 border border-orange-100 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">推定廃棄金額(損失)</span>
            <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-600 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-stone-900">
            ¥{estimatedLossAmount.toLocaleString()}
          </div>
          <div className="text-[11px] font-semibold text-stone-400">販売単価換算</div>
        </div>
      </div>

      {/* AI Smart Insight Box */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-3xl p-5 shadow-xs space-y-3">
        <div className="flex items-center space-x-2 text-amber-900 font-extrabold text-base">
          <Lightbulb className="w-5 h-5 text-amber-600 fill-amber-300" />
          <span>はなまる 需要予測・ロス削減のアドバイス</span>
        </div>
        <div className="space-y-2">
          {smartInsights.map((hint, idx) => (
            <div key={idx} className="bg-white/90 rounded-2xl p-3 border border-amber-200/60 text-xs sm:text-sm font-bold text-stone-800 leading-relaxed shadow-2xs">
              {hint}
            </div>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Item Waste Comparison */}
        <div className="bg-white rounded-3xl p-6 border border-orange-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-stone-800 text-base flex items-center space-x-2">
            <Package className="w-4 h-4 text-orange-500" />
            <span>商品別の製造数・廃棄数</span>
          </h3>
          <div className="h-64 sm:h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={itemAnalyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" interval={0} angle={-25} textAnchor="end" height={50} tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `${value}個`,
                    name === 'production' ? '製造数' : '廃棄数',
                  ]}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend verticalAlign="top" wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="production" name="製造数" fill="#f97316" radius={[6, 6, 0, 0]} />
                <Bar dataKey="waste" name="廃棄数" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Weather vs Waste Rate */}
        <div className="bg-white rounded-3xl p-6 border border-orange-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-stone-800 text-base flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>天気別の平均廃棄率 (%)</span>
          </h3>
          <div className="h-64 sm:h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weatherAnalyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="weather" tick={{ fontSize: 12 }} />
                <YAxis unit="%" />
                <Tooltip
                  formatter={(value: any) => [`${value}%`, '平均廃棄率']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="平均廃棄率(%)" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Daily Trend Line */}
        <div className="bg-white rounded-3xl p-6 border border-orange-100 shadow-sm space-y-4 lg:col-span-2">
          <h3 className="font-extrabold text-stone-800 text-base flex items-center space-x-2">
            <TrendingDown className="w-4 h-4 text-amber-500" />
            <span>日別の製造数と廃棄数の推移</span>
          </h3>
          <div className="h-64 sm:h-80 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend verticalAlign="top" wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="製造数" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="廃棄数" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
