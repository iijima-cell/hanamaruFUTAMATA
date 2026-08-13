export type WeatherType = '晴れ' | '曇り' | '雨' | '雪' | '台風';

export type ProductCategory = 'souzai' | 'salad' | 'bento' | 'agemono' | 'side' | 'other';

export interface ProductItem {
  id: string;
  name: string;
  category: ProductCategory;
  unitPrice: number; // 販売価格 (円)
  costPrice: number; // 原価 (円)
  unitLabel?: string; // 例: 1単位: 4116g
  isDefault?: boolean;
}

export interface RecordEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weather: WeatherType;
  productId: string;
  productName: string;
  productionQty: number; // 製造数
  wasteQty: number; // 廃棄数
  wasteReason?: string; // 廃棄理由 (賞味期限切れ, 売れ残り, 調理ミス等)
  memo: string;
  createdAt: string;
}

export type TabType = 'production' | 'waste' | 'analytics' | 'history';
