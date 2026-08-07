import React, { useState } from 'react';
import { Reorder } from 'motion/react';
import {
  StickyNote,
  Plus,
  Pin,
  Trash2,
  Edit2,
  Search,
  X,
  GripVertical,
} from 'lucide-react';
import { MemoItem } from '../types';
import { LongPressReorderItem } from './LongPressReorderItem';
import { TrashModal } from './TrashModal';

interface MemoListProps {
  items: MemoItem[];
  partner1Name: string;
  partner2Name: string;
  trashItems?: MemoItem[];
  onAddMemo: (item: Partial<MemoItem>) => void;
  onUpdateMemo: (id: string, updated: Partial<MemoItem>) => void;
  onDeleteMemo: (id: string) => void;
  onTogglePin: (id: string) => void;
  onReorderMemos?: (reordered: MemoItem[]) => void;
  onRestoreItem?: (id: string) => void;
  onEmptyTrash?: () => void;
  onPurgeTrashItem?: (id: string) => void;
}

const COLOR_MAP: Record<
  string,
  { bg: string; border: string; text: string; label: string }
> = {
  amber: {
    bg: 'bg-amber-50/90',
    border: 'border-amber-200',
    text: 'text-amber-950',
    label: '노랑',
  },
  emerald: {
    bg: 'bg-emerald-50/90',
    border: 'border-emerald-200',
    text: 'text-emerald-950',
    label: '초록',
  },
  sky: {
    bg: 'bg-sky-50/90',
    border: 'border-sky-200',
    text: 'text-sky-950',
    label: '파랑',
  },
  purple: {
    bg: 'bg-purple-50/90',
    border: 'border-purple-200',
    text: 'text-purple-950',
    label: '보라',
  },
  slate: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-950',
    label: '회색',
  },
};

export const MemoList: React.FC<MemoListProps> = ({
  items,
  partner1Name,
  partner2Name,
  trashItems = [],
  onAddMemo,
  onUpdateMemo,
  onDeleteMemo,
  onTogglePin,
  onReorderMemos,
  onRestoreItem,
  onEmptyTrash,
  onPurgeTrashItem,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [editingMemo, setEditingMemo] = useState<MemoItem | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [colorTag, setColorTag] = useState<'slate' | 'amber' | 'emerald' | 'sky' | 'purple'>('amber');
  const [createdBy, setCreatedBy] = useState(partner1Name);
  const [isPinned, setIsPinned] = useState(false);

  // Filter & Sort
  const filteredMemos = items
    .filter((m) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          m.title.toLowerCase().includes(q) ||
          m.content.toLowerCase().includes(q) ||
          m.createdBy.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const handleOpenAdd = () => {
    setEditingMemo(null);
    setTitle('');
    setContent('');
    setColorTag('amber');
    setCreatedBy(partner1Name || '작성자');
    setIsPinned(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (memo: MemoItem) => {
    setEditingMemo(memo);
    setTitle(memo.title);
    setContent(memo.content);
    setColorTag((memo.colorTag as any) || 'amber');
    setCreatedBy(memo.createdBy);
    setIsPinned(memo.isPinned);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingMemo) {
      onUpdateMemo(editingMemo.id, {
        title: title.trim(),
        content: content.trim(),
        colorTag,
        createdBy,
        isPinned,
      });
    } else {
      onAddMemo({
        title: title.trim(),
        content: content.trim(),
        category: 'memo',
        colorTag,
        createdBy,
        isPinned,
      });
    }

    setIsModalOpen(false);
  };

  const handleReorder = (newFilteredOrder: MemoItem[]) => {
    if (!onReorderMemos) return;
    if (!searchQuery.trim()) {
      onReorderMemos(newFilteredOrder);
    } else {
      const visibleIds = new Set(newFilteredOrder.map((i) => i.id));
      const reorderedFull: MemoItem[] = [];
      let visibleIdx = 0;
      items.forEach((item) => {
        if (visibleIds.has(item.id)) {
          if (visibleIdx < newFilteredOrder.length) {
            reorderedFull.push(newFilteredOrder[visibleIdx]);
            visibleIdx++;
          }
        } else {
          reorderedFull.push(item);
        }
      });
      onReorderMemos(reorderedFull);
    }
  };

  return (
    <div className="space-y-4 pb-32 max-w-xl mx-auto px-4 pt-3">
      {/* Header Section */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-slate-800" />
            메모
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/80">
              전체 {items.length}
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
            placeholder="메모 제목, 내용 검색..."
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
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 bg-gradient-to-r from-[#EC4899] to-[#A855F7] text-white font-bold text-xs px-4 py-2.5 rounded-2xl hover:opacity-95 transition-all shadow-xs shrink-0 active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>메모 작성</span>
        </button>
      </div>

      {/* Memo List Grid */}
      {filteredMemos.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-slate-200">
          <p className="text-2xl mb-2">📝</p>
          <p className="font-bold text-slate-700 text-sm">등록된 메모가 없습니다</p>
          <p className="text-xs text-slate-400 mt-1">필요한 정보를 남겨보세요.</p>
          <button
            onClick={handleOpenAdd}
            className="mt-3 px-4 py-2 bg-gradient-to-r from-[#EC4899] to-[#A855F7] text-white text-xs font-semibold rounded-xl hover:opacity-95 transition-opacity"
          >
            새 메모 작성
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <Reorder.Group
            axis="y"
            values={filteredMemos}
            onReorder={handleReorder}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {filteredMemos.map((memo) => {
              const colors = COLOR_MAP[memo.colorTag] || COLOR_MAP.amber;

              return (
                <LongPressReorderItem
                  key={memo.id}
                  item={memo}
                  activeRingColor="ring-[#EC4899]"
                >
                  {(isDragging, dragControls) => (
                    <div
                      onClick={() => handleOpenEdit(memo)}
                      className={`relative rounded-2xl p-4 border transition-all duration-150 flex flex-col justify-between h-full cursor-pointer ${colors.bg} ${colors.border} shadow-2xs hover:shadow-xs ${
                        isDragging ? 'shadow-xl ring-2 ring-[#EC4899] scale-[1.02]' : ''
                      }`}
                    >
                      <div>
                        {/* Top Bar: Title, Grip & Pin */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <div 
                              className="text-slate-400 shrink-0 cursor-grab active:cursor-grabbing touch-none p-1"
                              onPointerDown={(e) => {
                                e.stopPropagation();
                                dragControls.start(e);
                              }}
                            >
                              <GripVertical className="w-4 h-4" />
                            </div>
                            <h3 className={`font-bold text-sm ${colors.text} leading-snug truncate`}>
                              {memo.title}
                            </h3>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onTogglePin(memo.id);
                            }}
                            className={`p-1 rounded-lg transition-colors shrink-0 ${
                              memo.isPinned
                                ? 'bg-slate-900 text-white shadow-2xs'
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                            title={memo.isPinned ? '고정 해제' : '상단 고정'}
                          >
                            <Pin className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {memo.content && (
                          <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed mb-3">
                            {memo.content}
                          </p>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[10px] text-slate-500 mt-2">
                        <span className="font-medium text-slate-600">{memo.createdBy} 작성</span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(memo);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-white/50 flex items-center gap-1 text-xs font-semibold"
                            title="수정"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>수정</span>
                          </button>
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">
                {editingMemo ? '메모 수정' : '새 메모 작성'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  제목 *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="메모 제목을 입력하세요"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  작성자
                </label>
                <select
                  value={createdBy}
                  onChange={(e) => setCreatedBy(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-800"
                >
                  <option value={partner1Name || '나'}>{partner1Name || '나'}</option>
                  {partner2Name && <option value={partner2Name}>{partner2Name}</option>}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  메모 내용
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="메모 내용을 작성하세요"
                  rows={4}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  메모 색상
                </label>
                <div className="flex items-center gap-2">
                  {(['amber', 'emerald', 'sky', 'purple', 'slate'] as const).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setColorTag(color)}
                      className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                        COLOR_MAP[color].bg
                      } ${
                        colorTag === color
                          ? 'border-slate-900 scale-110 shadow-xs'
                          : 'border-slate-200'
                      }`}
                      title={COLOR_MAP[color].label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pinMemo"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded text-slate-900 focus:ring-slate-800 cursor-pointer"
                />
                <label htmlFor="pinMemo" className="font-semibold text-slate-700 cursor-pointer select-none">
                  상단에 주요 메모로 고정하기
                </label>
              </div>

              <div className="pt-3 flex gap-2">
                {editingMemo && (
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteMemo(editingMemo.id);
                      setIsModalOpen(false);
                    }}
                    className="py-2.5 px-3.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold flex items-center justify-center gap-1 shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>삭제</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#EC4899] to-[#A855F7] hover:opacity-95 text-white font-semibold shadow-xs transition-opacity"
                >
                  {editingMemo ? '수정 완료' : '메모 저장'}
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
        title="메모 휴지통"
        items={trashItems}
        onRestore={(id) => onRestoreItem && onRestoreItem(id)}
        onEmptyTrash={() => onEmptyTrash && onEmptyTrash()}
        onPurgeItem={(id) => onPurgeTrashItem && onPurgeTrashItem(id)}
      />
    </div>
  );
};
