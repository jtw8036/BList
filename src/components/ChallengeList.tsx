import React, { useState } from 'react';
import { Reorder } from 'motion/react';
import { ChallengeItem, ChallengeSubGoal, ChallengeBonusLog } from '../types';
import {
  Trophy,
  Plus,
  CheckCircle2,
  Trash2,
  Edit2,
  X,
  Search,
  RotateCcw,
  Sparkles,
  Target,
  ShieldAlert,
  GripVertical,
} from 'lucide-react';
import { LongPressReorderItem } from './LongPressReorderItem';
import { TrashModal } from './TrashModal';

interface ChallengeListProps {
  challenges: ChallengeItem[];
  partner1Name: string;
  partner2Name: string;
  trashItems?: ChallengeItem[];
  onAddChallenge: (item: Partial<ChallengeItem>) => Promise<void>;
  onUpdateChallenge: (id: string, updated: Partial<ChallengeItem>) => Promise<void>;
  onDeleteChallenge: (id: string) => Promise<void>;
  onReorderChallenges?: (reordered: ChallengeItem[]) => void;
  onRestoreItem?: (id: string) => void;
  onEmptyTrash?: () => void;
  onPurgeTrashItem?: (id: string) => void;
}

export const ChallengeList: React.FC<ChallengeListProps> = ({
  challenges,
  partner1Name,
  partner2Name,
  trashItems = [],
  onAddChallenge,
  onUpdateChallenge,
  onDeleteChallenge,
  onReorderChallenges,
  onRestoreItem,
  onEmptyTrash,
  onPurgeTrashItem,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<ChallengeItem | null>(null);

  // Additional completion item modal state
  const [bonusModalChallengeId, setBonusModalChallengeId] = useState<string | null>(null);
  const [bonusNote, setBonusNote] = useState('');

  // New/Edit Challenge Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [periodType, setPeriodType] = useState<'monthly' | 'weekly' | 'custom'>('monthly');
  const [challengeType, setChallengeType] = useState<'achievement' | 'restriction'>('achievement');
  const [category, setCategory] = useState<'drink' | 'exercise' | 'hobby' | 'saving' | 'habit'>('habit');
  const [subGoals, setSubGoals] = useState<{ title: string; targetCount: number; unit: string }[]>([
    { title: '', targetCount: 1, unit: '회' },
  ]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPeriodType('monthly');
    setChallengeType('achievement');
    setCategory('habit');
    setSubGoals([{ title: '', targetCount: 1, unit: '회' }]);
    setEditingChallenge(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: ChallengeItem) => {
    setEditingChallenge(item);
    setTitle(item.title);
    setDescription(item.description || '');
    setPeriodType(item.periodType);
    setChallengeType(item.challengeType || 'achievement');
    setCategory(item.category);
    setSubGoals(
      item.subGoals && item.subGoals.length > 0
        ? item.subGoals.map((sg) => ({
            title: sg.title,
            targetCount: sg.targetCount,
            unit: sg.unit || '회',
          }))
        : [{ title: '', targetCount: 1, unit: '회' }]
    );
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const formattedSubGoals: ChallengeSubGoal[] = subGoals
      .filter((sg) => sg.title.trim())
      .map((sg, index) => {
        const existingSg = editingChallenge?.subGoals?.[index];
        return {
          id: existingSg?.id || `sg_${Date.now()}_${index}`,
          title: sg.title.trim(),
          targetCount: sg.targetCount || 1,
          currentCount: existingSg?.currentCount || 0,
          unit: sg.unit || '회',
        };
      });

    if (editingChallenge) {
      await onUpdateChallenge(editingChallenge.id, {
        title: title.trim(),
        description: description.trim(),
        periodType,
        challengeType,
        category,
        subGoals: formattedSubGoals,
      });
    } else {
      await onAddChallenge({
        title: title.trim(),
        description: description.trim(),
        periodType,
        challengeType,
        category,
        createdBy: partner1Name || '나',
        status: 'active',
        subGoals: formattedSubGoals,
        bonusLogs: [],
      });
    }

    setIsModalOpen(false);
    resetForm();
  };

  // SubGoal Counter Increment/Decrement
  const handleUpdateSubGoalCount = async (
    challenge: ChallengeItem,
    subGoalId: string,
    delta: number
  ) => {
    const updatedSubGoals = challenge.subGoals.map((sg) => {
      if (sg.id === subGoalId) {
        const nextCount = Math.max(0, sg.currentCount + delta);
        return { ...sg, currentCount: nextCount };
      }
      return sg;
    });

    const isAllCompleted = updatedSubGoals.every(
      (sg) => sg.currentCount >= sg.targetCount
    );

    await onUpdateChallenge(challenge.id, {
      subGoals: updatedSubGoals,
      status: isAllCompleted ? 'completed' : 'active',
    });
  };

  // Reset counters for a new period
  const handleResetCounters = async (challenge: ChallengeItem) => {
    if (!confirm('이 챌린지의 달성 횟수를 0으로 리셋하시겠습니까?')) return;
    const resetSubGoals = challenge.subGoals.map((sg) => ({
      ...sg,
      currentCount: 0,
    }));
    await onUpdateChallenge(challenge.id, {
      subGoals: resetSubGoals,
      status: 'active',
    });
  };

  // Add Additional Completion Item (Bonus Log) Handler - does NOT affect subGoal progress
  const handleAddBonusLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bonusModalChallengeId || !bonusNote.trim()) return;

    const challenge = challenges.find((c) => c.id === bonusModalChallengeId);
    if (!challenge) return;

    const newLog: ChallengeBonusLog = {
      id: `bl_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      note: bonusNote.trim(),
      createdBy: partner1Name || '나',
    };

    const updatedBonusLogs = [newLog, ...(challenge.bonusLogs || [])];

    await onUpdateChallenge(challenge.id, {
      bonusLogs: updatedBonusLogs,
    });

    setBonusModalChallengeId(null);
    setBonusNote('');
  };

  const handleDeleteBonusLog = async (challenge: ChallengeItem, logId: string) => {
    const updatedBonusLogs = (challenge.bonusLogs || []).filter((l) => l.id !== logId);
    await onUpdateChallenge(challenge.id, {
      bonusLogs: updatedBonusLogs,
    });
  };

  const filteredChallenges = challenges.filter((c) => {
    const matchesFilter = filterStatus === 'all' ? true : c.status === filterStatus;
    const matchesSearch =
      searchQuery.trim() === ''
        ? true
        : c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleReorder = (newFilteredOrder: ChallengeItem[]) => {
    if (!onReorderChallenges) return;
    if (filterStatus === 'all' && !searchQuery.trim()) {
      onReorderChallenges(newFilteredOrder);
    } else {
      const visibleIds = new Set(newFilteredOrder.map((i) => i.id));
      const reorderedFull: ChallengeItem[] = [];
      let visibleIdx = 0;
      challenges.forEach((item) => {
        if (visibleIds.has(item.id)) {
          if (visibleIdx < newFilteredOrder.length) {
            reorderedFull.push(newFilteredOrder[visibleIdx]);
            visibleIdx++;
          }
        } else {
          reorderedFull.push(item);
        }
      });
      onReorderChallenges(reorderedFull);
    }
  };

  return (
    <div className="space-y-4 pb-24 max-w-xl mx-auto px-4 pt-3">
      {/* Header Section */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-slate-800" />
            챌린지
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/80">
              종료 {challenges.filter((c) => c.status === 'completed').length} / {challenges.length}
            </span>
          </h2>
        </div>

        <button
          onClick={() => setIsTrashOpen(true)}
          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all shrink-0 relative"
          title="휴지통"
        >
          <Trash2 className="w-4 h-4 text-slate-500" />
          {trashItems && trashItems.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[18px] text-center shadow-2xs">
              {trashItems.length}
            </span>
          )}
        </button>
      </div>

      {/* Action Bar: Search & Add Button */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="챌린지 검색..."
            className="w-full pl-9 pr-8 py-2.5 bg-white rounded-2xl border border-slate-200/80 text-xs focus:outline-none focus:border-slate-800 shadow-2xs font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center gap-1.5 bg-gradient-to-r from-[#9333EA] to-[#4F46E5] text-white font-bold text-xs px-4 py-2.5 rounded-2xl hover:opacity-95 transition-all shadow-xs shrink-0 active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>챌린지 추가</span>
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex bg-white p-1 rounded-2xl border border-slate-200/80 shadow-2xs">
        {(['all', 'active', 'completed'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              filterStatus === st
                ? 'bg-gradient-to-r from-[#9333EA] to-[#4F46E5] text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {st === 'all'
              ? `전체 (${challenges.length})`
              : st === 'active'
              ? `진행중 (${challenges.filter((c) => c.status === 'active').length})`
              : `종료 (${challenges.filter((c) => c.status === 'completed').length})`}
          </button>
        ))}
      </div>

      {/* Challenge Cards Grid */}
      {filteredChallenges.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200 p-8 shadow-2xs">
          <Trophy className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">등록된 챌린지가 없습니다</h3>
          <p className="text-slate-500 text-xs mt-1 max-w-xs mx-auto">
            함께 달성할 챌린지를 만들어보세요.
          </p>
          <button
            onClick={handleOpenCreateModal}
            className="mt-4 inline-flex items-center gap-1.5 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-2xs hover:bg-slate-800"
          >
            <Plus className="w-4 h-4" />
            <span>첫 챌린지 만들기</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <Reorder.Group
            axis="y"
            values={filteredChallenges}
            onReorder={handleReorder}
            className="grid grid-cols-1 gap-4"
          >
            {filteredChallenges.map((item) => {
              const isCompleted = item.status === 'completed';
              const totalTarget = item.subGoals ? item.subGoals.reduce((acc, sg) => acc + sg.targetCount, 0) : 0;
              const totalCurrent = item.subGoals ? item.subGoals.reduce((acc, sg) => acc + sg.currentCount, 0) : 0;
              const progressPercent = totalTarget > 0 ? Math.min(100, Math.round((totalCurrent / totalTarget) * 100)) : 0;

              return (
                <LongPressReorderItem
                  key={item.id}
                  item={item}
                  activeRingColor="ring-[#9333EA]"
                >
                  {(isDragging) => (
                    <div
                      className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-2xs ${
                        isCompleted ? 'border-emerald-200/80 bg-emerald-50/10' : 'border-slate-200/80'
                      } ${isDragging ? 'shadow-xl ring-2 ring-[#9333EA] scale-[1.01]' : ''}`}
                    >
                      {/* Card Header */}
                      <div className="p-4 border-b border-slate-100 flex items-start justify-between gap-3 bg-slate-50/70">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <div className="text-slate-400 shrink-0 cursor-grab active:cursor-grabbing p-0.5">
                              <GripVertical className="w-4 h-4" />
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-200/60 text-slate-800 border border-slate-300/50">
                              {item.periodType === 'monthly' ? '월간' : item.periodType === 'weekly' ? '주간' : '상시'}
                            </span>
                            {item.challengeType === 'restriction' ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200/80 flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3 text-rose-600" />
                                <span>제한 챌린지</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200/80 flex items-center gap-1">
                                <Target className="w-3 h-3 text-emerald-600" />
                                <span>달성 챌린지</span>
                              </span>
                            )}
                            {isCompleted && (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-white flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>종료됨</span>
                              </span>
                            )}
                          </div>

                          {/* Challenge Title */}
                          <h3 className="text-base font-bold text-slate-900 tracking-tight pt-0.5">
                            {item.title}
                          </h3>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResetCounters(item);
                            }}
                            title="달성 횟수 리셋"
                            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditModal(item);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1 text-xs font-semibold"
                            title="수정 / 상세"
                          >
                            <Edit2 className="w-4 h-4" />
                            <span>수정</span>
                          </button>
                        </div>
                      </div>

                {/* Main Body */}
                <div className="p-4 space-y-3.5">
                  {/* Description / Rule */}
                  {item.description && (
                    <div className="bg-slate-900 text-slate-100 p-3.5 rounded-xl text-xs font-medium leading-relaxed">
                      <p className="whitespace-pre-wrap leading-relaxed">{item.description}</p>
                    </div>
                  )}

                  {/* Sub Goals & Counter */}
                  {item.subGoals && item.subGoals.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-0.5">
                        <span>{item.challengeType === 'restriction' ? '제한/누적 현황' : '달성 현황'}</span>
                        <span>{totalCurrent} / {totalTarget} 회 ({progressPercent}%)</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            item.challengeType === 'restriction'
                              ? progressPercent === 0
                                ? 'bg-slate-300'
                                : progressPercent < 70
                                ? 'bg-amber-500'
                                : 'bg-rose-600'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {item.subGoals.map((sg) => {
                          const isRestriction = item.challengeType === 'restriction';

                          // Style based on challengeType and count
                          let cardBgClass = 'bg-slate-50/80 border-slate-200/80';
                          let countTextClass = 'text-slate-900';
                          let btnClass = 'bg-slate-900 hover:bg-slate-800 text-white';

                          if (isRestriction) {
                            if (sg.currentCount === 0) {
                              cardBgClass = 'bg-slate-50/80 border-slate-200/80';
                              countTextClass = 'text-slate-900';
                              btnClass = 'bg-slate-900 hover:bg-slate-800 text-white';
                            } else if (sg.currentCount < sg.targetCount) {
                              cardBgClass = 'bg-amber-50/90 border-amber-300/80 text-amber-950';
                              countTextClass = 'text-amber-800 font-bold';
                              btnClass = 'bg-rose-500 hover:bg-rose-600 text-white';
                            } else {
                              cardBgClass = 'bg-rose-100 border-rose-300/90 text-rose-950 font-bold';
                              countTextClass = 'text-rose-700 font-black';
                              btnClass = 'bg-rose-600 hover:bg-rose-700 text-white';
                            }
                          } else {
                            if (sg.currentCount === 0) {
                              cardBgClass = 'bg-slate-50/80 border-slate-200/80';
                              countTextClass = 'text-slate-900';
                              btnClass = 'bg-slate-900 hover:bg-slate-800 text-white';
                            } else if (sg.currentCount < sg.targetCount) {
                              cardBgClass = 'bg-emerald-50/70 border-emerald-200/80 text-emerald-950';
                              countTextClass = 'text-emerald-700 font-bold';
                              btnClass = 'bg-emerald-600 hover:bg-emerald-700 text-white';
                            } else {
                              cardBgClass = 'bg-emerald-100 border-emerald-300/90 text-emerald-950 font-bold';
                              countTextClass = 'text-emerald-800 font-black';
                              btnClass = 'bg-emerald-700 hover:bg-emerald-800 text-white';
                            }
                          }

                          return (
                            <div
                              key={sg.id}
                              className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${cardBgClass}`}
                            >
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate">
                                  {sg.title}
                                </p>
                                <span className="text-[11px] text-slate-500">
                                  {isRestriction ? '누적: ' : '달성: '}
                                  <strong className={countTextClass}>{sg.currentCount}</strong> / {sg.targetCount} {sg.unit || '회'}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 shrink-0 bg-slate-200/70 rounded-lg p-0.5">
                                <button
                                  onClick={() => handleUpdateSubGoalCount(item, sg.id, -1)}
                                  className="w-6 h-6 rounded-md bg-white text-slate-700 font-bold text-xs hover:bg-slate-100 flex items-center justify-center shadow-2xs"
                                >
                                  -
                                </button>
                                <span className="w-5 text-center text-xs font-bold text-slate-800">
                                  {sg.currentCount}
                                </span>
                                <button
                                  onClick={() => handleUpdateSubGoalCount(item, sg.id, 1)}
                                  className={`w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center shadow-2xs transition-colors ${btnClass}`}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Additional Completion Items Section (Does not affect progress) */}
                  <div className="border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <Sparkles className="w-3.5 h-3.5 text-slate-700" />
                        <span>추가 달성 항목</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          (달성 현황 미반영)
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setBonusModalChallengeId(item.id);
                          setBonusNote('');
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>추가 달성</span>
                      </button>
                    </div>

                    {item.bonusLogs && item.bonusLogs.length > 0 ? (
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
                        {item.bonusLogs.map((log) => (
                          <div
                            key={log.id}
                            className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 flex items-center justify-between gap-2"
                          >
                            <div className="space-y-0.5 min-w-0 flex-1">
                              <p className="font-semibold text-slate-800 truncate">{log.note}</p>
                              <span className="text-[10px] text-slate-400 block">{log.date}</span>
                            </div>
                            <button
                              onClick={() => handleDeleteBonusLog(item, log.id)}
                              className="text-slate-300 hover:text-red-500 p-1 shrink-0"
                              title="삭제"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 py-1">
                        등록된 추가 달성 항목이 없습니다.
                      </p>
                    )}
                  </div>
                </div>
                    </div>
                  )}
                </LongPressReorderItem>
              );
            })}
          </Reorder.Group>
        </div>
      )}

      {/* Add / Edit Challenge Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingChallenge ? '챌린지 수정' : '새 챌린지 만들기'}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  챌린지 제목 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="챌린지 제목을 입력하세요 (예: 매일 운동하기, 음주 횟수 줄이기)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  챌린지 성격 (달성 vs 제한) *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setChallengeType('achievement')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      challengeType === 'achievement'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Target className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>달성 챌린지</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChallengeType('restriction')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      challengeType === 'restriction'
                        ? 'bg-rose-50 border-rose-500 text-rose-950 ring-1 ring-rose-500 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>제한 챌린지</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  설명 / 규칙
                </label>
                <textarea
                  rows={2}
                  placeholder="챌린지 규칙이나 설명을 입력하세요"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  주기
                </label>
                <select
                  value={periodType}
                  onChange={(e) => setPeriodType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-slate-800"
                >
                  <option value="monthly">월간</option>
                  <option value="weekly">주간</option>
                  <option value="custom">상시</option>
                </select>
              </div>

              {/* Subgoals Builder */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    세부 목표 카운터 항목
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setSubGoals((prev) => [
                        ...prev,
                        { title: '', targetCount: 1, unit: '회' },
                      ])
                    }
                    className="text-xs text-slate-800 font-bold hover:underline flex items-center gap-0.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>목표 추가</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {subGoals.map((sg, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="항목명"
                        value={sg.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSubGoals((prev) =>
                            prev.map((item, i) => (i === idx ? { ...item, title: val } : item))
                          );
                        }}
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-slate-800"
                      />
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={sg.targetCount}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          setSubGoals((prev) =>
                            prev.map((item, i) =>
                              i === idx ? { ...item, targetCount: val } : item
                            )
                          );
                        }}
                        className="w-16 px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-center"
                      />
                      <span className="text-xs text-slate-500 font-medium">회</span>
                      {subGoals.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setSubGoals((prev) => prev.filter((_, i) => i !== idx))
                          }
                          className="p-1.5 text-slate-400 hover:text-rose-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                {editingChallenge && (
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteChallenge(editingChallenge.id);
                      setIsModalOpen(false);
                    }}
                    className="px-3.5 py-2.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center justify-center gap-1 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>삭제</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#9333EA] to-[#4F46E5] text-white rounded-xl text-xs font-bold shadow-xs hover:opacity-95 transition-opacity"
                >
                  {editingChallenge ? '수정 완료' : '챌린지 저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Additional Item Input Modal */}
      {bonusModalChallengeId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-slate-800" />
                <span>추가 달성 항목</span>
              </h3>
              <button
                onClick={() => setBonusModalChallengeId(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBonusLog} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  내용 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="추가 달성한 내용을 입력하세요"
                  value={bonusNote}
                  onChange={(e) => setBonusNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-slate-800"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setBonusModalChallengeId(null)}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-[#9333EA] to-[#4F46E5] text-white rounded-xl text-xs font-bold hover:opacity-95 shadow-xs transition-opacity"
                >
                  등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trash Modal */}
      <TrashModal
        isOpen={isTrashOpen}
        onClose={() => setIsTrashOpen(false)}
        title="챌린지 휴지통"
        items={trashItems}
        onRestore={(id) => onRestoreItem && onRestoreItem(id)}
        onEmptyTrash={() => onEmptyTrash && onEmptyTrash()}
        onPurgeItem={(id) => onPurgeTrashItem && onPurgeTrashItem(id)}
      />
    </div>
  );
};
