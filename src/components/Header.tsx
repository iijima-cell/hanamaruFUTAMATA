import React from 'react';
import { TabType } from '../types';
import { User } from 'firebase/auth';
import { ChefHat, Trash2, BarChart3, ClipboardList, PlusCircle, LogIn, LogOut, Package2 } from 'lucide-react';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenProductMaster: () => void;
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenProductMaster,
  user,
  onSignIn,
  onSignOut,
}) => {
  const tabs = [
    { id: 'production', label: '製造', icon: Package2 },
    { id: 'waste', label: '廃棄', icon: Trash2 },
    { id: 'analytics', label: '分析', icon: BarChart3 },
    { id: 'history', label: '履歴', icon: ClipboardList },
  ] as const;

  return (
    <header className="bg-[#FA5400] text-white shadow-md sticky top-0 z-40 py-3.5 px-3 sm:px-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
        {/* Left Title & Icon */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
            <ChefHat className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight leading-tight">
              はなまる厨房日誌
            </h1>
            {user && (
              <span className="hidden sm:inline-block text-[10px] font-bold text-orange-100 opacity-90">
                ☁️ クラウド同期中 ({user.displayName || user.email})
              </span>
            )}
          </div>
        </div>

        {/* Right Switch Control & Auth */}
        <div className="flex items-center space-x-2">
          {/* Main Switcher Capsule */}
          <div className="bg-[#D93D00] p-1.5 rounded-2xl flex items-center space-x-1 shadow-inner border border-orange-700/40">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center space-x-1 sm:space-x-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#FA5400] shadow-md scale-100'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-[#FA5400]' : 'text-white/90'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Master Management & Login buttons */}
          <button
            onClick={onOpenProductMaster}
            className="hidden lg:flex items-center space-x-1 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all border border-white/20 active:scale-95"
            title="商品マスター登録・追加"
          >
            <PlusCircle className="w-4 h-4" />
            <span>商品管理</span>
          </button>

          {user ? (
            <button
              onClick={onSignOut}
              className="hidden lg:flex items-center space-x-1 px-2.5 py-2 rounded-xl bg-black/20 hover:bg-black/40 text-white text-xs font-bold border border-white/10"
              title="ログアウト"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onSignIn}
              className="hidden lg:flex items-center space-x-1 px-3 py-2 rounded-xl bg-white text-[#FA5400] text-xs font-black shadow"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>ログイン</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

