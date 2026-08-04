import React from 'react';
import { CheckSquare, StickyNote, Trophy, User } from 'lucide-react';

export type NavTab = 'bucket' | 'memo' | 'challenge' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
}) => {
  const tabs = [
    {
      id: 'bucket' as NavTab,
      label: '버킷리스트',
      icon: CheckSquare,
      gradId: 'tab-grad-bucket',
      textColor: 'from-[#FF2E93] to-[#F43F5E]',
      indicatorBg: 'bg-gradient-to-r from-[#FF2E93] to-[#F43F5E]',
      activeGlow: 'shadow-[0_0_12px_rgba(255,46,147,0.35)]',
    },
    {
      id: 'memo' as NavTab,
      label: '메모',
      icon: StickyNote,
      gradId: 'tab-grad-memo',
      textColor: 'from-[#EC4899] to-[#A855F7]',
      indicatorBg: 'bg-gradient-to-r from-[#EC4899] to-[#A855F7]',
      activeGlow: 'shadow-[0_0_12px_rgba(217,38,255,0.35)]',
    },
    {
      id: 'challenge' as NavTab,
      label: '챌린지',
      icon: Trophy,
      gradId: 'tab-grad-challenge',
      textColor: 'from-[#9333EA] to-[#4F46E5]',
      indicatorBg: 'bg-gradient-to-r from-[#9333EA] to-[#4F46E5]',
      activeGlow: 'shadow-[0_0_12px_rgba(107,56,255,0.35)]',
    },
    {
      id: 'profile' as NavTab,
      label: '프로필 설정',
      icon: User,
      gradId: 'tab-grad-profile',
      textColor: 'from-[#3B82F6] to-[#0284C7]',
      indicatorBg: 'bg-gradient-to-r from-[#3B82F6] to-[#0284C7]',
      activeGlow: 'shadow-[0_0_12px_rgba(0,136,255,0.35)]',
    },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 z-30 shadow-lg" 
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 20px) + 12px)' }}
    >
      {/* Hidden SVG Definitions for Horizontal Gradient Sync */}
      <svg className="absolute w-0 h-0 overflow-hidden" aria-hidden="true">
        <defs>
          {/* Tab 1: Pink */}
          <linearGradient id="tab-grad-bucket" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF2E93" />
            <stop offset="100%" stopColor="#F43F5E" />
          </linearGradient>

          {/* Tab 2: Pink-Purple */}
          <linearGradient id="tab-grad-memo" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>

          {/* Tab 3: Purple-Blue */}
          <linearGradient id="tab-grad-challenge" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9333EA" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>

          {/* Tab 4: Blue-Sky */}
          <linearGradient id="tab-grad-profile" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
        </defs>
      </svg>

      <div className="max-w-xl mx-auto flex items-center justify-around px-4 py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className="relative flex flex-col items-center justify-center py-1 px-4 rounded-2xl transition-all duration-200 group"
            >
              {/* Active Top Bar Indicator */}
              {isActive && (
                <span
                  className={`absolute -top-2 w-8 h-1 rounded-full animate-in fade-in zoom-in-95 duration-200 ${tab.indicatorBg} ${tab.activeGlow}`}
                />
              )}

              {/* Icon with Gradient Stroke */}
              <div
                className={`transition-all duration-200 ${
                  isActive ? 'scale-110 opacity-100' : 'opacity-50 group-hover:opacity-80'
                }`}
              >
                <Icon
                  className="w-5 h-5"
                  stroke={`url(#${tab.gradId})`}
                  strokeWidth={isActive ? 2.3 : 1.8}
                />
              </div>

              {/* Label */}
              <span
                className={`text-[11px] mt-1 tracking-tight transition-all duration-200 ${
                  isActive
                    ? `bg-gradient-to-r ${tab.textColor} bg-clip-text text-transparent font-bold`
                    : 'text-slate-400 font-medium group-hover:text-slate-600'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

