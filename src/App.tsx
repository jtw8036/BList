import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { BucketList } from './components/BucketList';
import { MemoList } from './components/MemoList';
import { ChallengeList } from './components/ChallengeList';
import { ProfileView } from './components/ProfileView';
import { BucketItem, MemoItem, ChallengeItem, CoupleProfile } from './types';
import { Heart } from 'lucide-react';
import { getDefaultCoupleData } from './data/initialData';

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

export default function App() {
  const [coupleCode, setCoupleCode] = useState<string>(() => {
    let code = localStorage.getItem('couple_code');
    if (!code || code === '20240831') code = '20240831';
    return code;
  });

  const [currentUser, setCurrentUser] = useState<'partner1' | 'partner2'>(() => {
    return (localStorage.getItem('current_user') as 'partner1' | 'partner2') || 'partner1';
  });

  useEffect(() => {
    localStorage.setItem('current_user', currentUser);
  }, [currentUser]);

  const [activeTab, setActiveTab] = useState<NavTab>('bucket');
  const [profile, setProfile] = useState<CoupleProfile>(() => getDefaultCoupleData('20240831').profile);
  const [buckets, setBuckets] = useState<BucketItem[]>(() => getDefaultCoupleData('20240831').buckets);
  const [memos, setMemos] = useState<MemoItem[]>(() => getDefaultCoupleData('20240831').memos);
  const [challenges, setChallenges] = useState<ChallengeItem[]>(() => getDefaultCoupleData('20240831').challenges);
  const [trash, setTrash] = useState<{
    buckets: BucketItem[];
    memos: MemoItem[];
    challenges: ChallengeItem[];
  }>({ buckets: [], memos: [], challenges: [] });
  const [loading, setLoading] = useState(true);

  // Sync current state to local storage helper
  const syncToLocal = (code: string, updatedState: Partial<{ profile: CoupleProfile; buckets: BucketItem[]; memos: MemoItem[]; challenges: ChallengeItem[]; trash: any }>) => {
    const current = getLocalStorageData(code) || getDefaultCoupleData(code);
    const merged = {
      profile: updatedState.profile ?? current.profile ?? profile,
      buckets: updatedState.buckets ?? current.buckets ?? buckets,
      memos: updatedState.memos ?? current.memos ?? memos,
      challenges: updatedState.challenges ?? current.challenges ?? challenges,
      trash: updatedState.trash ?? current.trash ?? trash,
    };
    saveLocalStorageData(code, merged);

    // Sync to Firebase directly
    import('./firebase').then(({ db, doc, setDoc }) => {
      setDoc(doc(db, "couples", code), merged).catch(e => console.error("Firebase sync error", e));
    });
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

    // Fallback to local storage ONLY if API fails
    const localData = getLocalStorageData(code);
    if (localData) {
      if (localData.profile) setProfile(localData.profile);
      if (localData.buckets) setBuckets(localData.buckets);
      if (localData.memos) setMemos(localData.memos);
      if (localData.challenges) setChallenges(localData.challenges);
      if (localData.trash) setTrash(localData.trash);
    } else {
      const defaultData = getDefaultCoupleData(code);
      setProfile(defaultData.profile);
      setBuckets(defaultData.buckets);
      setMemos(defaultData.memos);
      setChallenges(defaultData.challenges);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCoupleData(coupleCode);
    localStorage.setItem('couple_code', coupleCode);

    // Setup Firebase realtime listener
    let unsubscribe = () => {};
    import('./firebase').then(({ db, doc, onSnapshot, setDoc }) => {
      unsubscribe = onSnapshot(doc(db, "couples", coupleCode), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.profile) setProfile(data.profile);
          if (data.buckets) setBuckets(data.buckets);
          if (data.memos) setMemos(data.memos);
          if (data.challenges) setChallenges(data.challenges);
          if (data.trash) setTrash(data.trash);
          saveLocalStorageData(coupleCode, data as any);
        } else {
          // Firebase is empty, push our local state to heal the database
          const localData = getLocalStorageData(coupleCode);
          if (localData) {
            setDoc(doc(db, "couples", coupleCode), localData).catch(console.error);
          } else {
            const defaultData = getDefaultCoupleData(coupleCode);
            setDoc(doc(db, "couples", coupleCode), defaultData).catch(console.error);
          }
        }
      }, (err) => {
        console.error("Firebase listen error:", err);
      });
    });

    return () => unsubscribe();
  }, [coupleCode]);

  // Profile update handler
  const handleUpdateProfile = async (updated: Partial<CoupleProfile>) => {
    const newProfile = { ...profile, ...updated };
    setProfile(newProfile);
    syncToLocal(coupleCode, { profile: newProfile });

  };

  // Challenge CRUD
  const handleAddChallenge = async (item: Partial<ChallengeItem>) => {
    const authorName = currentUser === 'partner1' ? profile.partner1Name : profile.partner2Name;

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
      createdBy: item.createdBy || authorName || '작성자',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };


    setChallenges((prev) => {
      const next = [newItem, ...prev];
      syncToLocal(coupleCode, { challenges: next });
      return next;
    });
  };

  const handleUpdateChallenge = async (id: string, updated: Partial<ChallengeItem>) => {
    setChallenges((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, ...updated, updatedAt: new Date().toISOString() } : c));
      syncToLocal(coupleCode, { challenges: next });
      return next;
    });
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

  };

  // Bucket CRUD
  const handleAddBucket = async (item: Partial<BucketItem>) => {
    const authorName = currentUser === 'partner1' ? profile.partner1Name : profile.partner2Name;

    const newItem: BucketItem = {
      id: `b_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      coupleCode: coupleCode,
      title: item.title || '새로운 버킷리스트',
      category: item.category || 'daily',
      status: item.status || 'planned',
      targetDate: item.targetDate || '',
      completedDate: item.completedDate || '',
      completedBy: item.completedBy || '',
      createdBy: item.createdBy || authorName || '작성자',
      location: item.location || '',
      note: item.note || '',
      photoUrl: item.photoUrl || '',
      tags: Array.isArray(item.tags) ? item.tags : [],
      likes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };


    setBuckets((prev) => {
      const next = [newItem, ...prev];
      syncToLocal(coupleCode, { buckets: next });
      return next;
    });
  };

  const handleUpdateBucket = async (id: string, updated: Partial<BucketItem>) => {
    setBuckets((prev) => {
      const next = prev.map((b) => (b.id === id ? { ...b, ...updated, updatedAt: new Date().toISOString() } : b));
      syncToLocal(coupleCode, { buckets: next });
      return next;
    });
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

  };

  const handleLikeBucket = async (id: string) => {
    setBuckets((prev) => {
      const next = prev.map((b) => (b.id === id ? { ...b, likes: (b.likes || 0) + 1 } : b));
      syncToLocal(coupleCode, { buckets: next });
      return next;
    });

  };

  // Memo CRUD
  const handleAddMemo = async (item: Partial<MemoItem>) => {
    const authorName = currentUser === 'partner1' ? profile.partner1Name : profile.partner2Name;

    const newItem: MemoItem = {
      id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      coupleCode: coupleCode,
      title: item.title || '새 비밀 메모',
      content: item.content || '',
      category: item.category || 'memo',
      colorTag: item.colorTag || 'rose',
      isPinned: !!item.isPinned,
      createdBy: item.createdBy || authorName || '작성자',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };


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

  };

  const handlePurgeTrashItem = async (type: 'buckets' | 'memos' | 'challenges', id: string) => {
    const newTrash = {
      ...trash,
      [type]: trash[type].filter((item) => item.id !== id),
    };
    setTrash(newTrash);
    syncToLocal(coupleCode, { trash: newTrash });

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
  };

  const handleReorderMemos = async (reordered: MemoItem[]) => {
    setMemos(reordered);
    syncToLocal(coupleCode, { memos: reordered });
  };

  const handleReorderChallenges = async (reordered: ChallengeItem[]) => {
    setChallenges(reordered);
    syncToLocal(coupleCode, { challenges: reordered });
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
                currentUser={currentUser}
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
                currentUser={currentUser}
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
                currentUser={currentUser}
                onSetCurrentUser={setCurrentUser}
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
