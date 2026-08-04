import React, { useState } from 'react';
import { Sparkles, Plus, Check, Compass, Heart, ArrowRight, Loader2 } from 'lucide-react';
import { AIBucketIdea, BucketCategory } from '../types';

interface AIAssistantProps {
  onAddIdeaToBucket: (idea: AIBucketIdea) => void;
}

const THEME_OPTIONS = [
  { id: 'romantic', label: '소소하지만 로맨틱한 동네 데이트', icon: '💕' },
  { id: 'anniversary', label: '100일/1주년 특별한 기념일', icon: '💍' },
  { id: 'travel', label: '주말 1박 2일 감성 커플 여행', icon: '✈️' },
  { id: 'indoor', label: '비 오는 날 실내 감성 데이트', icon: '☔️' },
  { id: 'activity', label: '짜릿한 이색 액티비티 & 원데이클래스', icon: '🎨' },
];

export const AIAssistant: React.FC<AIAssistantProps> = ({ onAddIdeaToBucket }) => {
  const [selectedTheme, setSelectedTheme] = useState(THEME_OPTIONS[0].label);
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<AIBucketIdea[]>([]);
  const [addedIds, setAddedIds] = useState<Record<number, boolean>>({});

  const fetchIdeas = async (themeName?: string) => {
    setLoading(true);
    setAddedIds({});
    try {
      const res = await fetch('/api/ai/bucket-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: themeName || selectedTheme,
          category: selectedCategory,
          season: '사계절',
        }),
      });
      const data = await res.json();
      if (data.ideas && Array.isArray(data.ideas)) {
        setIdeas(data.ideas);
      }
    } catch (err) {
      console.error('Error fetching AI ideas:', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchIdeas(THEME_OPTIONS[0].label);
  }, []);

  const handleAdd = (idea: AIBucketIdea, index: number) => {
    onAddIdeaToBucket(idea);
    setAddedIds((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <div className="space-y-4 pb-32 max-w-xl mx-auto px-4 pt-3">
      {/* Hero Header */}
      <div className="bg-gradient-to-tr from-purple-600 via-pink-600 to-rose-500 rounded-3xl p-5 text-white shadow-lg shadow-purple-200 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-yellow-300 animate-bounce" />
          <span className="text-xs font-bold uppercase tracking-wider text-purple-100">
            Gemini Couple AI Assistant
          </span>
        </div>
        <h2 className="text-xl font-bold">커플 맞춤 버킷리스트 AI 추천</h2>
        <p className="text-xs text-purple-100/90 mt-1 font-light">
          "이번 주말엔 뭐 하지?" 고민하지 마세요! AI가 소중한 추억이 될 데이트 아이디어를 선별해드려요.
        </p>
      </div>

      {/* Theme Presets */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700">
          원하는 데이트 테마 선택
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {THEME_OPTIONS.map((theme) => {
            const isSel = selectedTheme === theme.label;
            return (
              <button
                key={theme.id}
                onClick={() => {
                  setSelectedTheme(theme.label);
                  fetchIdeas(theme.label);
                }}
                className={`p-3 rounded-2xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                  isSel
                    ? 'bg-rose-50 border-rose-400 text-rose-700 shadow-2xs ring-2 ring-rose-100'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">{theme.icon}</span>
                  <span>{theme.label}</span>
                </span>
                {isSel && <Check className="w-4 h-4 text-rose-500" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={() => fetchIdeas()}
          disabled={loading}
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-xs transition-all disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          )}
          <span>새로운 추천 받기</span>
        </button>
      </div>

      {/* Recommendation Results */}
      {loading ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 shadow-xs space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-rose-500 mx-auto" />
          <p className="font-semibold text-slate-700 text-sm">
            AI가 두 분을 위한 설레는 데이트 아이디어를 고르고 있어요...
          </p>
          <p className="text-xs text-slate-400">잠시만 기다려주세요 ✨</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ideas.map((idea, idx) => {
            const isAdded = !!addedIds[idx];

            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-4 border border-purple-100 shadow-2xs hover:shadow-xs transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                      추천 아이디어
                    </span>
                    {idea.season && (
                      <span className="text-[10px] text-slate-500">
                        {idea.season}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleAdd(idea, idx)}
                    disabled={isAdded}
                    className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-2xs shrink-0 ${
                      isAdded
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:opacity-95'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>버킷리스트에 추가됨</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>내 버킷에 담기</span>
                      </>
                    )}
                  </button>
                </div>

                <h3 className="font-bold text-slate-800 text-sm mb-1">
                  {idea.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {idea.description}
                </p>

                {idea.estimatedCost && (
                  <div className="mt-2.5 text-[11px] text-slate-500 flex items-center gap-1 bg-slate-50 p-2 rounded-xl">
                    <span className="font-semibold text-slate-700">예상 예산:</span>
                    <span>{idea.estimatedCost}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
