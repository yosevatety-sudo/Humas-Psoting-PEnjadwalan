export type Platform = 'Instagram' | 'X / Twitter' | 'TikTok' | 'Facebook' | 'LinkedIn';

export type ContentCategory =
  | 'Siaran Pers'
  | 'Infografis'
  | 'Agenda Pimpinan'
  | 'Layanan Publik'
  | 'Klarifikasi';

export interface EngagementRecord {
  id: string;
  hour: number; // 0 - 23
  likes: number;
  comments: number;
  shares: number;
  platform: Platform;
  topic: string;
}

export interface HourlyEngagementStat {
  hour: number;
  postCount: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalEngagement: number;
  avgLikes: number;
  avgComments: number;
  avgShares: number;
  avgEngagement: number;
  rank: number; // 1 = highest average engagement
}

export interface ScheduledPost {
  id: string;
  title: string;
  caption: string;
  platform: Platform;
  category: ContentCategory;
  date: string; // YYYY-MM-DD
  hour: number; // 0 - 23
  engagementRank: number | null;
  expectedAvgEngagement: number | null;
  shiftedFromHour?: number | null;
  createdAt: string;
}

export type FlowStepId =
  | 'input-engagement'
  | 'group-average'
  | 'top-3'
  | 'input-content'
  | 'conflict-check'
  | 'save-display';

export interface NextAvailableResult {
  hour: number | null;
  date: string;
  rank: number | null;
  avgEngagement: number | null;
  source: 'ranked' | 'fallback_same_day' | 'next_day';
}
