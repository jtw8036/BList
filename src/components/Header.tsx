import React from 'react';
import { Heart } from 'lucide-react';
import { CoupleProfile } from '../types';

interface HeaderProps {
  profile: CoupleProfile;
  onOpenProfileTab: () => void;
}

export const Header: React.FC<HeaderProps> = ({ profile, onOpenProfileTab }) => {
  // Calculate D-Day
  const getDDay = (startDateStr: string) => {
    if (!startDateStr) return null;
    const start = new Date(startDateStr);
    const today = new Date();
    start.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = today.getTime() - start.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const dDay = getDDay(profile.anniversaryDate);

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-4 py-3 transition-all">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Couple Names & D-Day */}
        <div className="flex items-center gap-2.5">
          <div
            onClick={onOpenProfileTab}
            className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-2xs overflow-hidden border border-slate-200 cursor-pointer hover:opacity-90 transition-opacity"
          >
            {profile.avatarUrl || profile.coverImage ? (
              <img
                src={profile.avatarUrl || profile.coverImage}
                alt="프로필"
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src="/icon.svg"
                alt="앱 아이콘"
                className="w-full h-full object-cover p-1"
              />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-slate-900 text-base leading-snug">
                T♡S
              </h1>
            </div>
            {(profile.partner1Name || profile.partner2Name) && (
              <p className="text-[11px] text-slate-500 font-medium">
                {profile.partner1Name} ❤️ {profile.partner2Name}
              </p>
            )}
          </div>
        </div>

        {/* D-Day badge with brand gradient border */}
        {dDay !== null && (
          <div className="p-[1.5px] rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 shadow-2xs">
            <div className="bg-white px-2.5 py-1 rounded-[10.5px] text-slate-800 font-mono font-bold text-xs flex items-center gap-1">
              <Heart className="w-3 h-3 text-rose-500 fill-rose-500 shrink-0" />
              <span>{dDay > 0 ? `D+${dDay}` : dDay === 0 ? 'D-Day' : `D${dDay}`}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
