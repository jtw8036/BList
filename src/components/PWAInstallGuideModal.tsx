import React, { useState } from 'react';
import { Smartphone, Download, Share2, PlusSquare, MoreVertical, X, CheckCircle, Heart } from 'lucide-react';

interface PWAInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallGuideModal: React.FC<PWAInstallGuideModalProps> = ({ isOpen, onClose }) => {
  const [platform, setPlatform] = useState<'ios' | 'android'>('ios');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">스마트폰에 앱으로 설치하기</h3>
              <p className="text-[11px] text-slate-500">앱스토어 설치 없이 홈 화면에 바로 추가!</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Platform Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-4">
          <button
            onClick={() => setPlatform('ios')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              platform === 'ios'
                ? 'bg-white text-rose-600 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            🍎 아이폰 (iOS Safari)
          </button>
          <button
            onClick={() => setPlatform('android')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              platform === 'android'
                ? 'bg-white text-rose-600 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            🤖 안드로이드 (Galaxy Chrome)
          </button>
        </div>

        {/* Steps */}
        {platform === 'ios' ? (
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3 bg-rose-50/60 p-3 rounded-2xl border border-rose-100">
              <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                1
              </div>
              <div>
                <p className="font-bold text-slate-800">사파리 브라우저(Safari) 하단 메뉴 터치</p>
                <p className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-1">
                  하단 중앙의 <Share2 className="w-3.5 h-3.5 text-blue-500 inline" /> <b>공유 버튼</b>을 누릅니다.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-rose-50/60 p-3 rounded-2xl border border-rose-100">
              <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                2
              </div>
              <div>
                <p className="font-bold text-slate-800">'홈 화면에 추가' 항목 선택</p>
                <p className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-1">
                  공유 메뉴를 아래로 내려 <PlusSquare className="w-3.5 h-3.5 text-slate-700 inline" /> <b>홈 화면에 추가</b> 아이콘을 터치하세요.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-rose-50/60 p-3 rounded-2xl border border-rose-100">
              <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                3
              </div>
              <div>
                <p className="font-bold text-slate-800">우측 상단 '추가' 완료!</p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  홈 화면에 예쁜 버킷리스트 앱 아이콘이 생성되어 진짜 앱처럼 언제든 접속할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3 bg-rose-50/60 p-3 rounded-2xl border border-rose-100">
              <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                1
              </div>
              <div>
                <p className="font-bold text-slate-800">크롬 브라우저(Chrome) 우측 상단 메뉴</p>
                <p className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-1">
                  우측 상단의 점 3개 <MoreVertical className="w-3.5 h-3.5 inline" /> 버튼을 누릅니다.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-rose-50/60 p-3 rounded-2xl border border-rose-100">
              <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                2
              </div>
              <div>
                <p className="font-bold text-slate-800">'앱 설치' 또는 '홈 화면에 추가' 선택</p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  메뉴에서 <b>앱 설치</b> 또는 <b>홈 화면에 추가</b>를 누릅니다.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-rose-50/60 p-3 rounded-2xl border border-rose-100">
              <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                3
              </div>
              <div>
                <p className="font-bold text-slate-800">설치 확인 후 바로 실행!</p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  바탕화면에 앱 아이콘이 생기고 풀스크린 모드로 빠르게 작동합니다.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            확인했습니다!
          </button>
        </div>
      </div>
    </div>
  );
};
