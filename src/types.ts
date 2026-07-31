export type BucketCategory = 'travel' | 'food' | 'activity' | 'purchase' | 'anniversary' | 'daily' | 'date' | 'sports' | 'culture' | 'goal';
export type BucketStatus = 'planned' | 'in_progress' | 'completed';

export interface BucketItem {
  id: string;
  coupleCode: string;
  title: string;
  category: BucketCategory;
  status: BucketStatus;
  targetDate?: string;
  completedDate?: string;
  completedBy?: string; // Author name or partner key
  createdBy: string;    // '나' or '여자친구' / partner name
  location?: string;
  note?: string;
  photoUrl?: string;
  tags: string[];
  likes?: number;
  createdAt: string;
}

export type MemoCategory = 'memo' | 'dday' | 'anniversary' | 'photo_log' | 'wishlist' | 'event' | 'travel' | 'idea';

export interface ChallengeSubGoal {
  id: string;
  title: string;
  targetCount: number;
  currentCount: number;
  unit?: string;
}

export interface ChallengeBonusLog {
  id: string;
  date: string;
  note: string;
  createdBy: string;
}

export interface ChallengeItem {
  id: string;
  coupleCode: string;
  title: string;
  description: string;
  upgradeRule?: string;
  periodType: 'monthly' | 'weekly' | 'custom';
  challengeType?: 'achievement' | 'restriction';
  subGoals: ChallengeSubGoal[];
  bonusLogs: ChallengeBonusLog[];
  createdBy: string;
  createdAt: string;
  category: 'drink' | 'exercise' | 'hobby' | 'saving' | 'habit';
  status: 'active' | 'completed' | 'paused';
}

export interface MemoChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface MemoItem {
  id: string;
  coupleCode: string;
  title: string;
  content: string;
  memoType?: 'text' | 'checklist';
  checklistItems?: MemoChecklistItem[];
  category: MemoCategory;
  dDate?: string;
  isPinned: boolean;
  colorTag: 'rose' | 'amber' | 'emerald' | 'sky' | 'purple' | 'slate' | 'stone';
  createdBy: string;
  photoUrl?: string;
  createdAt?: string;
  updatedAt: string;
}

export interface CoupleProfile {
  coupleCode: string;
  partner1Name: string; // e.g., "지훈"
  partner2Name: string; // e.g., "민지"
  anniversaryDate: string; // e.g., "2025-05-20"
  statusMessage?: string;
  coverImage?: string;
  avatarUrl?: string;
}

export interface AIBucketIdea {
  id?: string;
  title: string;
  category: BucketCategory;
  description: string;
  season?: string;
  estimatedCost?: string;
  recommendedFor?: string;
}
