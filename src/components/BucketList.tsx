import React, { useState } from 'react';
import { Reorder } from 'motion/react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Search,
  X,
  Trash2,
  Edit2,
  CheckSquare,
  ChevronRight,
  FileText,
  GripVertical,
} from 'lucide-react';
import { BucketItem } from '../types';
import { LongPressReorderItem } from './LongPressReorderItem';
import { TrashModal } from './TrashModal';

interface BucketListProps {
  items: BucketItem[];
  partner1Name: string;
  partner2Name: string;
  trashItems?: BucketItem[];
  onAddItem: (item: Partial<BucketItem>) => void;
  onUpdateItem: (id: string, updated: Partial<BucketItem>) => void;
  onDeleteItem: (id: string) => void;
  onLikeItem?: (id: string) => void;
  onReorderItems?: (reordered: BucketItem[]) => void;
  onRestoreItem?: (id: string) => void;
  onEmptyTrash?: () => void;
  onPurgeTrashItem?: (id: string) => void;
}

export const BucketList: React.FC<BucketListProps> = ({
  items,
  partner1Name,
  partner2Name,
  trashItems = [],
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onLikeItem,
  onReorderItems,
  onRestoreItem,
  onEmptyTrash,
  onPurgeTrashItem,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'planned' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTrashOpen, setIsTrashOpen] = useState(false);

  // Detail Modal state
  const [selectedDetailItem, setSelectedDetailItem] = useState<BucketItem | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BucketItem | null>(null);

  // Form states (Only title and note)
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');

  // Safe items array
  const safeItems = Array.isArray(items) ? items : [];

  // Calculate stats
  const totalCount = safeItems.length;
  const completedCount = safeItems.filter((i) => i.status === 'completed').length;

  // Filtered & sorted items (Completed items at the bottom)
  const filteredItems = safeItems
    .filter((item) => {
      if (statusFilter === 'planned' && item.status === 'completed') return false;
      if (statusFilter === 'completed' && item.status !== 'completed') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchNote = (item.note || '').toLowerCase().includes(q);
        return matchTitle || matchNote;
      }
      return true;
    })
    .sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      return 0;
    });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setTitle('');
    setNote('');
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (item: BucketItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setNote(item.note || '');
    setSelectedDetailItem(null);
    setIsFormModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingItem) {
      onUpdateItem(editingItem.id, {
        title: title.trim(),
        note: note.trim(),
      });
    } else {
      onAddItem({
        title: title.trim(),
        note: note.trim(),
        status: 'planned',
      });
    }

    setIsFormModalOpen(false);
  };

  const handleToggleComplete = (item: BucketItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isComp = item.status === 'completed';
    const updatedStatus = isComp ? 'planned' : 'completed';

    onUpdateItem(item.id, {
      status: updatedStatus,
    });

    if (selectedDetailItem && selectedDetailItem.id === item.id) {
      setSelectedDetailItem((prev) =>
        prev
          ? {
              ...prev,
              status: updatedStatus,
            }
          : null
      );
    }
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onDeleteItem(id);
    if (selectedDetailItem?.id === id) {
      setSelectedDetailItem(null);
    }
  };

  const handleReorder = (newFilteredOrder: BucketItem[]) => {
    if (!onReorderItems) return;
    if (statusFilter === 'all' && !searchQuery.trim()) {
      onReorderItems(newFilteredOrder);
    } else {
      const visibleIds = new Set(newFilteredOrder.map((i) => i.id));
      const reorderedFull: BucketItem[] = [];
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
      onReorderItems(reorderedFull);
    }
  };

  return (
    <div className="space-y-4 pb-32 max-w-xl mx-auto px-4 pt-3">
      {/* Header Section */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-slate-800" />
            버킷리스트
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/80">
              달성 {completedCount} / {totalCount}
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
            placeholder="버킷 목표, 메모 검색..."
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
          className="flex items-center gap-1.5 bg-gradient-to-r from-[#FF2E93] to-[#F43F5E] text-white font-bold text-xs px-4 py-2.5 rounded-2xl hover:opacity-95 transition-all shadow-xs shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          버킷 추가
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex bg-white p-1 rounded-2xl border border-slate-200/80 shadow-2xs">
        {(['all', 'planned', 'completed'] as const).map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              statusFilter === st
                ? 'bg-gradient-to-r from-[#FF2E93] to-[#F43F5E] text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {st === 'all' ? '전체' : st === 'planned' ? '진행중' : '달성완료'}
          </button>
        ))}
      </div>

      {/* Single Line Row Items */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-slate-200">
          <p className="text-2xl mb-2">📋</p>
          <p className="font-bold text-slate-700 text-sm">등록된 버킷리스트가 없습니다</p>
          <p className="text-xs text-slate-400 mt-1">새로운 목표를 추가해 보세요.</p>
          <button
            onClick={handleOpenAdd}
            className="mt-3 px-4 py-2 bg-gradient-to-r from-[#FF2E93] to-[#F43F5E] text-white text-xs font-semibold rounded-xl hover:opacity-95 transition-opacity"
          >
            새 버킷 작성하기
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <Reorder.Group
            axis="y"
            values={filteredItems}
            onReorder={handleReorder}
            className="space-y-2"
          >
            {filteredItems.map((item) => {
              const isCompleted = item.status === 'completed';

              return (
                <LongPressReorderItem
                  key={item.id}
                  item={item}
                  activeRingColor="ring-[#FF2E93]"
                  onItemClick={() => setSelectedDetailItem(item)}
                >
                  {(isDragging, dragControls) => (
                    <div
                      className={`group bg-white rounded-2xl px-3.5 py-3 border transition-all duration-150 flex items-center justify-between gap-2.5 cursor-pointer hover:border-slate-400 hover:shadow-xs ${
                        isCompleted
                          ? 'border-slate-200 bg-slate-50/70 opacity-75'
                          : 'border-slate-200/80 shadow-2xs'
                      } ${isDragging ? 'border-pink-300 shadow-xl scale-[1.01]' : ''}`}
                    >
                      {/* Drag Grip Icon */}
                      <div 
                        className="text-slate-300 group-hover:text-slate-500 shrink-0 cursor-grab active:cursor-grabbing p-1 touch-none"
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          dragControls.start(e);
                        }}
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>

                      {/* Checkbox */}
                      <button
                        onClick={(e) => handleToggleComplete(item, e)}
                        className="text-slate-300 hover:text-slate-800 transition-colors shrink-0 p-0.5"
                        title={isCompleted ? '미완료로 변경' : '달성 완료'}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 hover:text-slate-500" />
                        )}
                      </button>

                      {/* Title */}
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <span
                          className={`font-bold text-slate-900 text-xs sm:text-sm truncate ${
                            isCompleted ? 'line-through text-slate-400 font-medium' : ''
                          }`}
                        >
                          {item.title}
                        </span>
                      </div>

                      {/* Arrow */}
                      <div className="flex items-center gap-1 shrink-0 text-slate-300 group-hover:text-slate-600 transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </LongPressReorderItem>
              );
            })}
          </Reorder.Group>
        </div>
      )}

      {/* Clean Detail Popup (자세히보기 팝업) */}
      {selectedDetailItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Header with Bucket Title directly */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 gap-3">
              <h3 className="text-base font-black text-slate-900 leading-snug truncate">
                {selectedDetailItem.title}
              </h3>

              <button
                onClick={() => setSelectedDetailItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notes Section */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                세부 메모
              </span>
              {selectedDetailItem.note ? (
                <div className="bg-slate-50 rounded-2xl p-4 text-xs font-medium text-slate-800 leading-relaxed border border-slate-100 whitespace-pre-wrap max-h-56 overflow-y-auto">
                  {selectedDetailItem.note}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic bg-slate-50 p-3.5 rounded-2xl border border-dashed border-slate-200 text-center">
                  작성된 세부 메모가 없습니다.
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                onClick={() => handleOpenEdit(selectedDetailItem)}
                className="flex-1 py-2.5 px-3.5 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl flex items-center justify-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>수정</span>
              </button>

              <button
                onClick={(e) => handleDelete(selectedDetailItem.id, e)}
                className="flex-1 py-2.5 px-3 border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs rounded-xl flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>삭제</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base">
                {editingItem ? '버킷리스트 수정' : '새 버킷리스트 추가'}
              </h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  목표 제목 *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="예: 일본가서 하트랜드 맥주 마시기 ❤️"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  메모 / 세부 내용 (선택)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="자세한 내용이나 장소 등을 적어보세요"
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs font-medium"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#FF2E93] to-[#F43F5E] hover:opacity-95 text-white font-bold shadow-xs transition-opacity"
                >
                  {editingItem ? '수정 완료' : '버킷 저장'}
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
        title="버킷리스트 휴지통"
        items={trashItems}
        onRestore={(id) => onRestoreItem && onRestoreItem(id)}
        onEmptyTrash={() => onEmptyTrash && onEmptyTrash()}
        onPurgeItem={(id) => onPurgeTrashItem && onPurgeTrashItem(id)}
      />
    </div>
  );
};
