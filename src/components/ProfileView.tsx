import React, { useState, useRef } from 'react';
import {
  User,
  Share2,
  Copy,
  Check,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Camera,
  X,
  Upload,
} from 'lucide-react';
import { CoupleProfile } from '../types';

interface ProfileViewProps {
  profile: CoupleProfile;
  onUpdateProfile: (updated: Partial<CoupleProfile>) => void;
  onSwitchCode: (newCode: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onUpdateProfile,
  onSwitchCode,
}) => {
  const [partner1Name, setPartner1Name] = useState(profile.partner1Name);
  const [anniversaryDate, setAnniversaryDate] = useState(profile.anniversaryDate);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [inputCode, setInputCode] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // PWA accordion state
  const [isPwaGuideOpen, setIsPwaGuideOpen] = useState(false);
  const [pwaPlatform, setPwaPlatform] = useState<'ios' | 'android'>('ios');

  const photoUrl = profile.avatarUrl || profile.coverImage || '';

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

  const handleCopyCode = () => {
    navigator.clipboard.writeText(profile.coupleCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      partner1Name: partner1Name.trim(),
      anniversaryDate,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleJoinSpace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    onSwitchCode(inputCode.trim().toUpperCase());
    setInputCode('');
  };

  const handleTriggerPhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        onUpdateProfile({
          avatarUrl: base64,
          coverImage: base64,
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleDeletePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateProfile({
      avatarUrl: '',
      coverImage: '',
    });
  };

  return (
    <div className="space-y-4 pb-32 max-w-xl mx-auto px-4 pt-3">
      {/* Overview Card with Photo on Upper Left */}
      <div className="bg-gradient-to-r from-[#3B82F6] to-[#0284C7] rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {/* Upper Left Profile Photo Container */}
            <div className="relative group shrink-0">
              <button
                type="button"
                onClick={handleTriggerPhotoUpload}
                className="relative w-14 h-14 rounded-2xl bg-white/20 border-2 border-white/30 hover:border-white/60 overflow-hidden flex items-center justify-center transition-all group-hover:scale-105 shadow-md backdrop-blur-xs"
                title="커플 공통 사진 등록 / 변경"
              >
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="커플 공통 사진"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="w-6 h-6 text-white/80" />
                )}

                {/* Hover overlay indicator */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </button>

              {/* Photo delete button if photo exists */}
              {photoUrl && (
                <button
                  type="button"
                  onClick={handleDeletePhoto}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-xs transition-colors"
                  title="사진 삭제"
                >
                  <X className="w-3 h-3" />
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">
                {profile.partner1Name || '커플 공간'}
                {profile.partner2Name ? ` & ${profile.partner2Name}` : ''}
              </h2>
              <p className="text-xs text-blue-100">
                시작일: {profile.anniversaryDate || '미설정'}
              </p>
            </div>
          </div>

          {dDay !== null && (
            <div className="bg-white/20 border border-white/30 backdrop-blur-xs px-3.5 py-1.5 rounded-2xl text-center shrink-0">
              <span className="block text-[10px] text-blue-100 uppercase tracking-wider font-semibold">
                D-Day
              </span>
              <span className="text-sm font-extrabold text-white font-mono">
                {dDay > 0 ? `D+${dDay}일` : dDay === 0 ? 'D-Day' : `D${dDay}일`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Profile Settings Form */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <User className="w-4 h-4 text-slate-700" />
            프로필 설정
          </h3>
          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
              <Check className="w-3.5 h-3.5" />
              저장되었습니다
            </span>
          )}
        </div>

        {/* Photo Upload Row */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              onClick={handleTriggerPhotoUpload}
              className="w-10 h-10 rounded-xl bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center cursor-pointer shrink-0"
            >
              {photoUrl ? (
                <img src={photoUrl} alt="대표 사진" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-4 h-4 text-slate-500" />
              )}
            </div>
            <span className="font-bold text-slate-800 text-xs">대표 사진</span>
          </div>

          <button
            type="button"
            onClick={handleTriggerPhotoUpload}
            className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-800 font-bold text-xs rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span>{photoUrl ? '사진 변경' : '사진 등록'}</span>
          </button>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
            <label className="block font-bold text-slate-800 mb-1.5">
              내 이름
            </label>
            <input
              type="text"
              value={partner1Name}
              onChange={(e) => setPartner1Name(e.target.value)}
              placeholder="내 이름 입력"
              className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-slate-800"
              required
            />
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
            <label className="block font-bold text-slate-800 mb-1.5">
              처음 만난 날 / 기념일 *
            </label>
            <input
              type="date"
              value={anniversaryDate}
              onChange={(e) => setAnniversaryDate(e.target.value)}
              className="w-full max-w-full box-border px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 focus:outline-none focus:border-slate-800 appearance-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-[#3B82F6] to-[#0284C7] hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-xs transition-opacity"
          >
            프로필 정보 저장
          </button>
        </form>
      </div>

      {/* Couple Code Sharing & Joining */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <Share2 className="w-4 h-4 text-slate-700" />
          공간 연동 코드 관리
        </h3>

        {/* Current Code Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
          <p className="text-xs text-slate-500 font-medium mb-1">현재 연결된 커플 공간 코드</p>
          <div className="text-xl font-bold font-mono text-slate-900 tracking-wider my-1">
            {profile.coupleCode}
          </div>
          <p className="text-[11px] text-slate-500 mb-3">
            상대방 기기에서 동일한 코드를 입력하면 실시간 동기화됩니다.
          </p>

          <button
            type="button"
            onClick={handleCopyCode}
            className="w-full py-2 bg-white border border-slate-300 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs hover:bg-slate-100 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>복사되었습니다!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-600" />
                <span>연동 코드 복사하기</span>
              </>
            )}
          </button>
        </div>

        {/* Switch / Join Code */}
        <form onSubmit={handleJoinSpace} className="space-y-2 pt-2 border-t border-slate-100 text-xs">
          <label className="block font-bold text-slate-700">
            기존 코드로 공간 변경하기
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="예: LOVE-2026"
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 uppercase font-mono font-bold text-slate-800 focus:outline-none focus:border-slate-800"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-gradient-to-r from-[#3B82F6] to-[#0284C7] text-white font-bold rounded-xl hover:opacity-95 transition-opacity shrink-0"
            >
              연동 변경
            </button>
          </div>
        </form>
      </div>

      {/* PWA App Install Guide */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <button
          type="button"
          onClick={() => setIsPwaGuideOpen(!isPwaGuideOpen)}
          className="w-full p-5 flex items-center justify-between text-left font-bold text-slate-800 text-sm hover:bg-slate-50/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-slate-700" />
            <span>스마트폰 홈 화면에 앱으로 설치 안내</span>
          </div>
          {isPwaGuideOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {isPwaGuideOpen && (
          <div className="p-5 pt-0 border-t border-slate-100 space-y-4 text-xs">
            {/* Platform Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-2xl mt-3">
              <button
                type="button"
                onClick={() => setPwaPlatform('ios')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  pwaPlatform === 'ios'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                아이폰 (Safari)
              </button>
              <button
                type="button"
                onClick={() => setPwaPlatform('android')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  pwaPlatform === 'android'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                안드로이드 (Chrome)
              </button>
            </div>

            {pwaPlatform === 'ios' ? (
              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                    1
                  </span>
                  <div>
                    <p className="font-bold text-slate-800">사파리(Safari) 하단 공유 버튼 터치</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      하단 중앙의 공유 아이콘을 선택합니다.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                    2
                  </span>
                  <div>
                    <p className="font-bold text-slate-800">'홈 화면에 추가' 선택</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      메뉴를 내려 '홈 화면에 추가'를 터치합니다.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                    3
                  </span>
                  <div>
                    <p className="font-bold text-slate-800">우측 상단 '추가' 클릭</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      바탕화면에 전용 아이콘이 생성되어 브라우저 주소창 없이 앱처럼 실행됩니다.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                    1
                  </span>
                  <div>
                    <p className="font-bold text-slate-800">크롬(Chrome) 우측 상단 메뉴</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      점 3개 메뉴 버튼을 터치합니다.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                    2
                  </span>
                  <div>
                    <p className="font-bold text-slate-800">'앱 설치' 또는 '홈 화면에 추가'</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      메뉴 목록에서 '앱 설치'를 눌러 화면에 바로 등록합니다.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
