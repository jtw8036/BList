import React, { useState } from 'react';
import { Trash2, RotateCcw, X, AlertCircle } from 'lucide-react';

interface TrashModalProps<T extends { id: string; title: string }> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: T[];
  onRestore: (id: string) => void;
  onRestoreAll?: () => void;
  onEmptyTrash: () => void;
  onPurgeItem?: (id: string) => void;
  renderItemContent?: (item: T) => React.ReactNode;
}

export function TrashModal<T extends { id: string; title: string }>({
  isOpen,
  onClose,
  title,
  items,
  onRestore,
  onRestoreAll,
  onEmptyTrash,
  onPurgeItem,
  renderItemContent,
}: TrashModalProps<T>) {
  const [showConfirmEmpty, setShowConfirmEmpty] = useState(false);

  if (!isOpen) return null;

  const handleEmpty = () => {
    onEmptyTrash();
    setShowConfirmEmpty(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">{title}</h3>
              <p className="text-[11px] font-medium text-slate-400">
                삭제된 항목 {items.length}개
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Confirm Empty Trash Banner */}
        {showConfirmEmpty && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 space-y-2 shrink-0 animate-in fade-in duration-150">
            <div className="flex items-start gap-2 text-rose-800 text-xs font-bold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>휴지통을 비우시겠습니까? 삭제된 모든 항목이 영구히 삭제됩니다.</span>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setShowConfirmEmpty(false)}
                className="px-3 py-1.5 bg-white border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold rounded-xl"
              >
                취소
              </button>
              <button
                onClick={handleEmpty}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-2xs"
              >
                비우기 확인
              </button>
            </div>
          </div>
        )}

        {/* Body Item List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[200px]">
          {items.length === 0 ? (
            <div className="h-full min-h-[180px] flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <Trash2 className="w-10 h-10 text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-600">휴지통이 비어 있습니다.</p>
              <p className="text-[11px] text-slate-400 mt-1">삭제된 항목이 없습니다.</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl p-3.5 flex items-center justify-between gap-3 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 truncate">
                    {item.title}
                  </h4>
                  {renderItemContent && renderItemContent(item)}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onRestore(item.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200/90 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 text-xs font-bold rounded-xl shadow-2xs transition-colors"
                    title="복구"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                    <span>복구</span>
                  </button>

                  {onPurgeItem && (
                    <button
                      onClick={() => onPurgeItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="영구 삭제"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        {items.length > 0 && !showConfirmEmpty && (
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0 gap-2">
            {onRestoreAll && (
              <button
                onClick={onRestoreAll}
                className="px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                <span>전체 복구</span>
              </button>
            )}

            <button
              onClick={() => setShowConfirmEmpty(true)}
              className="ml-auto px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>휴지통 비우기</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
