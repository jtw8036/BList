import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { BucketList } from './components/BucketList';
import { MemoList } from './components/MemoList';
import { ChallengeList } from './components/ChallengeList';
import { ProfileView } from './components/ProfileView';
import { BucketItem, MemoItem, ChallengeItem, CoupleProfile } from './types';
import { Heart } from 'lucide-react';

export default function App() {
  const [coupleCode, setCoupleCode] = useState<string>(() => {
    return localStorage.getItem('couple_code') || 'LOVE-2026';
  });

  const [activeTab, setActiveTab] = useState<NavTab>('bucket');
  const [profile, setProfile] = useState<CoupleProfile>({
    coupleCode: 'LOVE-2026',
    partner1Name: '',
    partner2Name: '',
    anniversaryDate: '2025-05-20',
    statusMessage: '',
  });

  const [buckets, setBuckets] = useState<BucketItem[]>([]);
  const [memos, setMemos] = useState<MemoItem[]>([]);
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [loading, setLoading] = useState(true);

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
      }
    } catch (err) {
      console.error('Error fetching couple data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupleData(coupleCode);
    localStorage.setItem('couple_code', coupleCode);

    // Auto-polling for real-time couple sync every 4 seconds
    const interval = setInterval(() => {
      fetchCoupleData(coupleCode);
    }, 4000);

    return () => clearInterval(interval);
  }, [coupleCode]);

  // Profile update handler
  const handleUpdateProfile = async (updated: Partial<CoupleProfile>) => {
    try {
      const res = await fetch(`/api/couple/${coupleCode}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  // Challenge CRUD
  const handleAddChallenge = async (item: Partial<ChallengeItem>) => {
    try {
      const res = await fetch(`/api/couple/${coupleCode}/challenges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        const data = await res.json();
        setChallenges((prev) => [data.item, ...prev]);
      }
    } catch (err) {
      console.error('Error adding challenge:', err);
    }
  };

  const handleUpdateChallenge = async (id: string, updated: Partial<ChallengeItem>) => {
    try {
      const res = await fetch(`/api/couple/${coupleCode}/challenges/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const data = await res.json();
        setChallenges((prev) => prev.map((c) => (c.id === id ? data.item : c)));
      }
    } catch (err) {
      console.error('Error updating challenge:', err);
    }
  };

  const handleDeleteChallenge = async (id: string) => {
    try {
      const res = await fetch(`/api/couple/${coupleCode}/challenges/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setChallenges((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error('Error deleting challenge:', err);
    }
  };

  // Bucket CRUD
  const handleAddBucket = async (item: Partial<BucketItem>) => {
    try {
      const res = await fetch(`/api/couple/${coupleCode}/buckets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        const data = await res.json();
        setBuckets((prev) => [data.item, ...prev]);
      }
    } catch (err) {
      console.error('Error adding bucket:', err);
    }
  };

  const handleUpdateBucket = async (id: string, updated: Partial<BucketItem>) => {
    try {
      const res = await fetch(`/api/couple/${coupleCode}/buckets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const data = await res.json();
        setBuckets((prev) => prev.map((b) => (b.id === id ? data.item : b)));
      }
    } catch (err) {
      console.error('Error updating bucket:', err);
    }
  };

  const handleDeleteBucket = async (id: string) => {
    try {
      const res = await fetch(`/api/couple/${coupleCode}/buckets/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setBuckets((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (err) {
      console.error('Error deleting bucket:', err);
    }
  };

  const handleLikeBucket = async (id: string) => {
    try {
      const res = await fetch(`/api/couple/${coupleCode}/buckets/${id}/like`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setBuckets((prev) =>
          prev.map((b) => (b.id === id ? { ...b, likes: data.likes } : b))
        );
      }
    } catch (err) {
      console.error('Error liking bucket:', err);
    }
  };

  // Memo CRUD
  const handleAddMemo = async (item: Partial<MemoItem>) => {
    try {
      const res = await fetch(`/api/couple/${coupleCode}/memos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        const data = await res.json();
        setMemos((prev) => [data.item, ...prev]);
      }
    } catch (err) {
      console.error('Error adding memo:', err);
    }
  };

  const handleUpdateMemo = async (id: string, updated: Partial<MemoItem>) => {
    try {
      const res = await fetch(`/api/couple/${coupleCode}/memos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const data = await res.json();
        setMemos((prev) => prev.map((m) => (m.id === id ? data.item : m)));
      }
    } catch (err) {
      console.error('Error updating memo:', err);
    }
  };

  const handleDeleteMemo = async (id: string) => {
    try {
      const res = await fetch(`/api/couple/${coupleCode}/memos/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMemos((prev) => prev.filter((m) => m.id !== id));
      }
    } catch (err) {
      console.error('Error deleting memo:', err);
    }
  };

  const handleTogglePinMemo = (id: string) => {
    const memo = memos.find((m) => m.id === id);
    if (memo) {
      handleUpdateMemo(id, { isPinned: !memo.isPinned });
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
                onAddItem={handleAddBucket}
                onUpdateItem={handleUpdateBucket}
                onDeleteItem={handleDeleteBucket}
                onLikeItem={handleLikeBucket}
              />
            )}

            {activeTab === 'memo' && (
              <MemoList
                items={memos}
                partner1Name={profile.partner1Name}
                partner2Name={profile.partner2Name}
                onAddMemo={handleAddMemo}
                onUpdateMemo={handleUpdateMemo}
                onDeleteMemo={handleDeleteMemo}
                onTogglePin={handleTogglePinMemo}
              />
            )}

            {activeTab === 'challenge' && (
              <ChallengeList
                challenges={challenges}
                partner1Name={profile.partner1Name}
                partner2Name={profile.partner2Name}
                onAddChallenge={handleAddChallenge}
                onUpdateChallenge={handleUpdateChallenge}
                onDeleteChallenge={handleDeleteChallenge}
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
