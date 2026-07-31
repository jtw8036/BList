import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { BucketList } from './components/BucketList';
import { MemoList } from './components/MemoList';
import { ChallengeList } from './components/ChallengeList';
import { ProfileView } from './components/ProfileView';
import { BucketItem, MemoItem, ChallengeItem, CoupleProfile } from './types';
import { Heart } from 'lucide-react';

// Helper for local storage persistence (GitHub Pages / Offline compatibility)
const getLocalStorageData = (code: string) => {
  try {
    const raw = localStorage.getItem(`couple_data_${code}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading localStorage data', e);
  }
  return null;
};

const saveLocalStorageData = (code: string, data: any) => {
  try {
    localStorage.setItem(`couple_data_${code}`, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving localStorage data', e);
  }
};

const createDefaultLocalData = (code: string) => {
  return {
    profile: {
      coupleCode: code,
      partner1Name: '태웅',
      partner2Name: '서주',
      anniversaryDate: '2025-05-20',
      statusMessage: '너랑 나랑 둘만의 소중한 기록 ❤️',
      avatarUrl: '',
      coverImage: '',
    },
    buckets: [
      {
        id: 'b_sample_1',
        coupleCode: code,
        title: '제주도 스쿠터 여행하기 🛵',
        category: 'travel',
        status: 'planned',
        targetDate: '2026-09-15',
        createdBy: '태웅',
        location: '제주특별자치도',
        note: '해안도로 따라서 라이딩하고 오션뷰 카페 가기',
        tags: ['여행', '제주도', '스쿠터'],
        likes: 1,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'b_sample_2',
        coupleCode: code,
        title: '커플 요리 클래스 수강하기 🍳',
        category: 'date',
        status: 'completed',
        completedDate: '2026-02-14',
        completedBy: '서주',
        createdBy: '서주',
        note: '파스타랑 파이 만들기 성공!',
        tags: ['데이트', '요리'],
        likes: 2,
        createdAt: new Date().toISOString(),
      },
    ],
    memos: [
      {
        id: 'm_sample_1',
        coupleCode: code,
        title: '서주가 좋아하는 디저트 리스트 🍰',
        content: '1. 딸기 생크림 케이크\n2. 피스타치오 마카롱\n3. 아이스 바닐라 라떼 (샷 추가)',
        category: 'memo',
        colorTag: 'rose',
        isPinned: true,
        createdBy: '태웅',
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'm_sample_2',
        coupleCode: code,
        title: '다음 커플 여행 후보지 ✈️',
        content: '- 1순위: 오키나와\n- 2순위: 삿포로 겨울 여행\n- 3순위: 다낭 리조트 휴양',
        category: 'wishlist',
        colorTag: 'sky',
        isPinned: false,
        createdBy: '서주',
        updatedAt: new Date().toISOString(),
      },
    ],
    challenges: [
      {
        id: 'c_sample_1',
        coupleCode: code,
        title: '주 3회 함께 산책하기 👟',
        description: '퇴근 후 저녁 공원에서 30분씩 걷기',
        periodType: 'monthly',
        category: 'habit',
        status: 'active',
        subGoals: [
          {
            id: 'sg_1',
            title: '월간 목표 달성',
            targetCount: 12,
            currentCount: 5,
            unit: '회',
          },
        ],
        bonusLogs: [],
        createdBy: '태웅',
        createdAt: new Date().toISOString(),
      },
    ],
    trash: { buckets: [], memos: [], challenges: [] },
  };
};

export default function App() {
  const [coupleCode, setCoupleCode] = useState<string>(() => {
    return localStorage.getItem('couple_code') || 'LOVE-2026';
  });

  const [activeTab, setActiveTab] = useState<NavTab>('bucket');
  const [profile, setProfile] = useState<CoupleProfile>({
    coupleCode: 'LOVE-2026',
    partner1Name: '태웅',
    partner2Name: '서주',
    anniversaryDate: '2025-05-20',
    statusMessage: '너랑 나랑 둘만의 소중한 기록 ❤️',
  });

  const [buckets, setBuckets] = useState<BucketItem[]>([]);
  const [memos, setMemos] = useState<MemoItem[]>([]);
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [trash, setTrash] = useState<{
    buckets: BucketItem[];
    memos: MemoItem[];
    challenges: ChallengeItem[];
  }>({ buckets: [], memos: [], challenges: [] });
  const [loading, setLoading] = useState(true);

  // Sync current state to local storage helper
  const syncToLocal = (code: string, updatedState: Partial<{ profile: CoupleProfile; buckets: BucketItem[]; memos: MemoItem[]; challenges: ChallengeItem[]; trash: any }>) => {
    const current = getLocalStorageData(code) || createDefaultLocalData(code);
    const merged = {
      profile: updatedState.profile ?? current.profile ?? profile,
      buckets: updatedState.buckets ?? current.buckets ?? buckets,
      memos: updatedState.memos ?? current.memos ?? memos,
      challenges: updatedState.challenges ?? current.challenges ?? challenges,
      trash: updatedState.trash ?? current.trash ?? trash,
    };
    saveLocalStorageData(code, merged);
  };

  // Load Data for Couple Space
  const fetchCoupleData = async (code: string) => {
    try {
      const res = await fetch(`/api/couple/${code}`);
      if (res.ok) {
        const data = await res.json();
        if (data.profile) setProfile(data.profile);
        if (data.buckets) setBuckets(data.buckets);
        if (data.memos) setMemos(data.memos);
        if (data.challenges) setChallenges(data.challenges);
        if (data.trash) setTrash(data.trash);
        saveLocalStorageData(code, data);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('API unavailable, using client storage:', err);
    }

    // Fallback to local storage or create default data
    let localData = getLocalStorageData(code);
    if (!localData) {
      localData = createDefaultLocalData(code);
      saveLocalStorageData(code, localData);
    }
    if (localData.profile) setProfile(localData.profile);
    if (localData.buckets) setBuckets(localData.buckets);
    if (localData.memos) setMemos(localData.memos);
    if (localData.challenges) setChallenges(localData.challenges);
    if (localData.trash) setTrash(localData.trash);
    setLoading(false);
  };

  useEffect(() => {
    fetchCoupleData(coupleCode);
    localStorage.setItem('couple_code', coupleCode);

    const handleFocus = () => {
      fetchCoupleData(coupleCode);
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [coupleCode]);

  // Profile update handler
  const handleUpdateProfile = async (updated: Partial<CoupleProfile>) => {
    const newProfile = { ...profile, ...updated };
    setProfile(newProfile);
    syncToLocal(coupleCode, { profile: newProfile });

    try {
      await fetch(`/api/couple/${coupleCode}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.warn('Server sync skipped:', err);
    }
  };

  // Challenge CRUD
  const handleAddChallenge = async (item: Partial<ChallengeItem>) => {
    const newItem: ChallengeItem = {
      id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      coupleCode: coupleCode,
      title: item.title || '새 챌린지',
      description: item.description || '',
      periodType: item.periodType || 'monthly',
      category: item.category || 'habit',
      status: item.status || 'active',
      subGoals: item.subGoals || [],
      bonusLogs: item.bonusLogs || [],
      createdBy: item.createdBy || '태웅',
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`/api/couple/${coupleCode}/challenges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        const data = await res.json();
        setChallenges((prev) => {
          const next = [data.item, ...prev];
          syncToLocal(coupleCode, { challenges: next });
          return next;
        });
        return;
      }
    } catch (err) {
      console.warn('Server sync skipped:', err);
    }

    setChallenges((prev) => {
      const next = [newItem, ...prev];
      syncToLocal(coupleCode, { challenges: next });
      return next;
    });
  };

  const handleUpdateChallenge = async (id: string, updated: Partial<ChallengeItem>) => {
    setChallenges((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, ...updated } : c));
      syncToLocal(coupleCode, { challenges: next });
      return next;
    });

    try {
      await fetch(`/api/couple/${coupleCode}/challenges/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.warn('Server sync skipped:', err);
    }
  };

  const handleDeleteChallenge = async (id: string) => {
    let deletedItem: ChallengeItem | undefined;
    setChallenges((prev) => {
      deletedItem = prev.find((c) => c.id === id);
      const next = prev.filter((c) => c.id !== id);
      return next;
    });

    setTrash((prev) => {
      const nextTrash = deletedItem
        ? { ...prev, challenges: [deletedItem, ...prev.challenges] }
        : prev;
      syncToLocal(coupleCode, { challenges: challenges.filter((c) => c.id !== id), trash: nextTrash });
      return nextTrash;
    });

    try {
      await fetch(`/api/couple/${coupleCode}/challenges/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('Server sync skipped:', err);
    }
  };

  // Bucket CRUD
  const handleAddBucket = async (item: Partial<BucketItem>) => {
    const newItem: BucketItem = {
      id: `b_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      coupleCode: coupleCode,
      title: item.title || '새로운 버킷리스트',
      category: item.category || 'daily',
      status: item.status || 'planned',
      targetDate: item.targetDate || '',
      completedDate: item.completedDate || '',
      completedBy: item.completedBy || '',
      createdBy: item.createdBy || '나',
      location: item.location || '',
      note: item.note || '',
      photoUrl: item.photoUrl || '',
      tags: Array.isArray(item.tags) ? item.tags : [],
      likes: 0,
      createdAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`/api/couple/${coupleCode}/buckets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        const data = await res.json();
        setBuckets((prev) => {
          const next = [data.item, ...prev];
          syncToLocal(coupleCode, { buckets: next });
          return next;
        });
        return;
      }
    } catch (err) {
      console.warn('Server sync skipped:', err);
    }

    setBuckets((prev) => {
      const next = [newItem, ...prev];
      syncToLocal(coupleCode, { buckets: next });
      return next;
    });
  };

  const handleUpdateBucket = async (id: string, updated: Partial<BucketItem>) => {
    setBuckets((prev) => {
      const next = prev.map((b) => (b.id === id ? { ...b, ...updated } : b));
      syncToLocal(coupleCode, { buckets: next });
      return next;
    });

    try {
      await fetch(`/api/couple/${coupleCode}/buckets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.warn('Server sync skipped:', err);
    }
  };

  const handleDeleteBucket = async (id: string) => {
    let deletedItem: BucketItem | undefined;
    setBuckets((prev) => {
      deletedItem = prev.find((b) => b.id === id);
      const next = prev.filter((b) => b.id !== id);
      return next;
    });

    setTrash((prev) => {
      const nextTrash = deletedItem
        ? { ...prev, buckets: [deletedItem, ...prev.buckets] }
        : prev;
      syncToLocal(coupleCode, { buckets: buckets.filter((b) => b.id !== id), trash: nextTrash });
      return nextTrash;
    });

    try {
      await fetch(`/api/couple/${coupleCode}/buckets/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('Server sync skipped:', err);
    }
  };

  const handleLikeBucket = async (id: string) => {
    setBuckets((prev) => {
      const next = prev.map((b) => (b.id === id ? { ...b, likes: (b.likes || 0) + 1 } : b));
      syncToLocal(coupleCode, { buckets: next });
      return next;
    });

    try {
      await fetch(`/api/couple/${coupleCode}/buckets/${id}/like`, {
        method: 'POST',
      });
    } catch (err) {
      console.warn('Server sync skipped:', err);
    }
  };

  // Memo CRUD
  const handleAddMemo = async (item: Partial<MemoItem>) => {
    const newItem: MemoItem = {
      id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      coupleCode: coupleCode,
      title: item.title || '새 비밀 메모',
      content: item.content || '',
      category: item.category || 'memo',
      colorTag: item.colorTag || 'rose',
      isPinned: !!item.isPinned,
      createdBy: item.createdBy || '나',
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`/api/couple/${coupleCode}/memos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        const data = await res.json();
        setMemos((prev) => {
          const next = [data.item, ...prev];
          syncToLocal(coupleCode, { memos: next });
          return next;
        });
        return;
      }
    } catch (err) {
      console.warn('Server sync skipped:', err);
    }

    setMemos((prev) => {
      const next = [newItem, ...prev];
      syncToLocal(coupleCode, { memos: next });
      return next;
    });
  };

  const handleUpdateMemo = async (id: string, updated: Partial<MemoItem>) => {
    setMemos((prev) => {
      const next = prev.map((m) =>
        m.id === id ? { ...m, ...updated, updatedAt: new Date().toISOString() } : m
      );
      syncToLocal(coupleCode, { memos: next });
      return next;
    });

    try {
      await fetch(`/api/couple/${coupleCode}/memos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.warn('Server sync skipped:', err);
    }
  };

  const handleDeleteMemo = async (id: string) => {
    let deletedItem: MemoItem | undefined;
    setMemos((prev) => {
      deletedItem = prev.find((m) => m.id === id);
      const next = prev.filter((m) => m.id !== id);
      return next;
    });

    setTrash((prev) => {
      const nextTrash = deletedItem
        ? { ...prev, memos: [deletedItem, ...prev.memos] }
        : prev;
      syncToLocal(coupleCode, { memos: memos.filter((m) => m.id !== id), trash: nextTrash });
      return nextTrash;
    });

    try {
      await fetch(`/api/couple/${coupleCode}/memos/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('Server sync skipped:', err);
    }
  };

  // Trash Operations
  const handleRestoreItem = async (type: 'buckets' | 'memos' | 'challenges', id: string) => {
    const itemToRestore = trash[type].find((item) => item.id === id);
    const newTrash = {
      ...trash,
      [type]: trash[type].filter((item) => item.id !== id),
    };
    setTrash(newTrash);

    if (itemToRestore) {
      if (type === 'buckets') {
        const nextBuckets = [itemToRestore as BucketItem, ...buckets];
        setBuckets(nextBuckets);
        syncToLocal(coupleCode, { buckets: nextBuckets, trash: newTrash });
      } else if (type === 'memos') {
        const nextMemos = [itemToRestore as MemoItem, ...memos];
        setMemos(nextMemos);
        syncToLocal(coupleCode, { memos: nextMemos, trash: newTrash });
      } else if (type === 'challenges') {
        const nextChallenges = [itemToRestore as ChallengeItem, ...challenges];
        setChallenges(nextChallenges);
        syncToLocal(coupleCode, { challenges: nextChallenges, trash: newTrash });
      }
    }

    try {
      await fetch(`/api/couple/${coupleCode}/trash/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id }),
      });
    } catch (err) {
      console.warn('Server sync skipped:', err);
    }
  };

  const handleEmptyTrash = async (type: 'buckets' | 'memos' | 'challenges' | 'all') => {
    let newTrash = { ...trash };
    if (type === 'all') {
      newTrash = { buckets: [], memos: [], challenges: [] };
    } else {
      newTrash[type] = [];
    }
    setTrash(newTrash);
    syncToLocal(coupleCode, { trash: newTrash });

    try {
      await fetch(`/api/couple/${coupleCode}/trash/empty`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
    } catch (err) {
      console.warn('Server sync skipped:', err);
    }
  };

  const handlePurgeTrashItem = async (type: 'buckets' | 'memos' | 'challenges', id: string) => {
    const newTrash = {
      ...trash,
      [type]: trash[type].filter((item) => item.id !== id),
    };
    setTrash(newTrash);
    syncToLocal(coupleCode, { trash: newTrash });

    try {
      await fetch(`/api/couple/${coupleCode}/trash/purge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id }),
      });
    } catch (err) {
      console.warn('Server sync skipped:', err);
    }
  };

  const handleTogglePinMemo = (id: string) => {
    const memo = memos.find((m) => m.id === id);
    if (memo) {
      handleUpdateMemo(id, { isPinned: !memo.isPinned });
    }
  };

  const handleReorderBuckets = async (reordered: BucketItem[]) => {
    setBuckets(reordered);
    syncToLocal(coupleCode, { buckets: reordered });
    try {
      await fetch(`/api/couple/${coupleCode}/reorder/buckets`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds: reordered.map((i) => i.id) }),
      });
    } catch (err) {
      console.warn('Server sync skipped:', err);
    }
  };

  const handleReorderMemos = async (reordered: MemoItem[]) => {
    setMemos(reordered);
    syncToLocal(coupleCode, { memos: reordered });
    try {
      await fetch(`/api/couple/${coupleCode}/reorder/memos`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds: reordered.map((i) => i.id) }),
      });
    } catch (err) {
      console.warn('Server sync skipped:', err);
    }
  };

  const handleReorderChallenges = async (reordered: ChallengeItem[]) => {
    setChallenges(reordered);
    syncToLocal(coupleCode, { challenges: reordered });
    try {
      await fetch(`/api/couple/${coupleCode}/reorder/challenges`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds: reordered.map((i) => i.id) }),
      });
    } catch (err) {
      console.warn('Server sync skipped:', err);
    }
  };

  const handleSwitchCode = (newCode: string) => {
    setCoupleCode(newCode);
    fetchCoupleData(newCode);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans select-none antialiased">
      {/* Header */}
      <Header
        profile={profile}
        onOpenProfileTab={() => setActiveTab('profile')}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Heart className="w-8 h-8 text-slate-400 animate-pulse mb-2" />
            <p className="text-xs font-semibold">데이터를 불러오는 중...</p>
          </div>
        ) : (
          <>
            {activeTab === 'bucket' && (
              <BucketList
                items={buckets}
                partner1Name={profile.partner1Name}
                partner2Name={profile.partner2Name}
                trashItems={trash.buckets}
                onAddItem={handleAddBucket}
                onUpdateItem={handleUpdateBucket}
                onDeleteItem={handleDeleteBucket}
                onLikeItem={handleLikeBucket}
                onReorderItems={handleReorderBuckets}
                onRestoreItem={(id) => handleRestoreItem('buckets', id)}
                onEmptyTrash={() => handleEmptyTrash('buckets')}
                onPurgeTrashItem={(id) => handlePurgeTrashItem('buckets', id)}
              />
            )}

            {activeTab === 'memo' && (
              <MemoList
                items={memos}
                partner1Name={profile.partner1Name}
                partner2Name={profile.partner2Name}
                trashItems={trash.memos}
                onAddMemo={handleAddMemo}
                onUpdateMemo={handleUpdateMemo}
                onDeleteMemo={handleDeleteMemo}
                onTogglePin={handleTogglePinMemo}
                onReorderMemos={handleReorderMemos}
                onRestoreItem={(id) => handleRestoreItem('memos', id)}
                onEmptyTrash={() => handleEmptyTrash('memos')}
                onPurgeTrashItem={(id) => handlePurgeTrashItem('memos', id)}
              />
            )}

            {activeTab === 'challenge' && (
              <ChallengeList
                challenges={challenges}
                partner1Name={profile.partner1Name}
                partner2Name={profile.partner2Name}
                trashItems={trash.challenges}
                onAddChallenge={handleAddChallenge}
                onUpdateChallenge={handleUpdateChallenge}
                onDeleteChallenge={handleDeleteChallenge}
                onReorderChallenges={handleReorderChallenges}
                onRestoreItem={(id) => handleRestoreItem('challenges', id)}
                onEmptyTrash={() => handleEmptyTrash('challenges')}
                onPurgeTrashItem={(id) => handlePurgeTrashItem('challenges', id)}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                profile={profile}
                onUpdateProfile={handleUpdateProfile}
                onSwitchCode={handleSwitchCode}
              />
            )}
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
      />
    </div>
  );
}
