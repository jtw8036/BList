import React, { useState } from 'react';
import { Share2, Copy, Check, Heart, ArrowRight, X, KeyRound } from 'lucide-react';

interface CoupleCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCode: string;
  onSwitchCode: (newCode: string) => void;
}

export const CoupleCodeModal: React.FC<CoupleCodeModalProps> = ({
  isOpen,
  onClose,
  currentCode,
  onSwitchCode,
}) => {
  const [copied, setCopied] = useState(false);
  const [inputCode, setInputCode] = useState('');

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinSpace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    onSwitchCode(inputCode.trim().toUpperCase());
    setInputCode('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-100" />
            <h3 className="font-bold text-slate-800 text-base">커플 연동 공간 코드</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Code Box */}
        <div className="bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl p-4 text-white text-center shadow-md mb-5">
          <p className="text-xs text-rose-100 font-medium mb-1">우리 둘만의 공간 코드</p>
          <div className="text-2xl font-black tracking-wider font-mono my-1">
            {currentCode}
          </div>
          <p className="text-[11px] text-rose-100/90 mb-3">
            여자친구 스마트폰에서 이 코드를 입력하면 실시간 연동됩니다!
          </p>

          <button
            onClick={handleCopy}
            className="w-full py-2 bg-white text-rose-600 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs hover:bg-rose-50 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>클립보드에 복사 완료!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>코드 복사하여 카톡 전달</span>
              </>
            )}
          </button>
        </div>

        {/* Join Other Space */}
        <form onSubmit={handleJoinSpace} className="space-y-3 pt-2 border-t border-slate-100 text-xs">
          <label className="block font-bold text-slate-700">
            기존 커플 코드로 이동하기
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="예: LOVE-2026"
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 uppercase font-mono font-bold text-slate-800 focus:outline-none focus:border-rose-400"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shrink-0"
            >
              연동
            </button>
          </div>
          <p className="text-[10px] text-slate-400">
            상대방이 먼저 생성한 코드나 원하는 코드를 입력하여 연결할 수 있습니다.
          </p>
        </form>
      </div>
    </div>
  );
};
