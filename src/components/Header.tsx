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
                {profile.partner1Name || '커플 공간'}
                {profile.partner2Name ? ` & ${profile.partner2Name}` : ''}
              </h1>
            </div>
          </div>
        </div>

        {/* D-Day badge or clean header right */}
        {dDay !== null && (
          <div className="bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-xl text-slate-700 font-mono font-bold text-xs">
            {dDay > 0 ? `D+${dDay}` : dDay === 0 ? 'D-Day' : `D${dDay}`}
          </div>
        )}
      </div>
    </header>
  );
};
