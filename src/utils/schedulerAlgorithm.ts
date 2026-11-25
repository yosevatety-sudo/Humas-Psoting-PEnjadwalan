import {
  EngagementRecord,
  HourlyEngagementStat,
  NextAvailableResult,
  ScheduledPost,
} from '../types/scheduler';

export function formatHour(hour: number): string {
  const normalized = ((Math.floor(hour) % 24) + 24) % 24;
  return `${String(normalized).padStart(2, '0')}:00`;
}

export function formatNumber(value: number, decimals = 1): string {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: Number.isInteger(value) ? 0 : decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatDateIndo(isoDate: string): string {
  if (!isoDate) return '-';
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) return isoDate;
  const dateObj = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(dateObj);
}

export function addDaysIso(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  dateObj.setDate(dateObj.getDate() + days);
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Langkah Flowchart 2 & 3:
 * Kelompokkan data berdasarkan jam posting & hitung rata-rata engagement tiap jam.
 * Engagement = Like + Komentar + Share.
 */
export function groupAndCalculateHourlyStats(
  records: EngagementRecord[]
): HourlyEngagementStat[] {
  const buckets = new Map<number, EngagementRecord[]>();

  for (const record of records) {
    const existing = buckets.get(record.hour) ?? [];
    existing.push(record);
    buckets.set(record.hour, existing);
  }

  const stats: Omit<HourlyEngagementStat, 'rank'>[] = [];

  for (const [hour, items] of buckets.entries()) {
    const postCount = items.length;
    const totalLikes = items.reduce((sum, item) => sum + item.likes, 0);
    const totalComments = items.reduce((sum, item) => sum + item.comments, 0);
    const totalShares = items.reduce((sum, item) => sum + item.shares, 0);
    const totalEngagement = totalLikes + totalComments + totalShares;

    stats.push({
      hour,
      postCount,
      totalLikes,
      totalComments,
      totalShares,
      totalEngagement,
      avgLikes: totalLikes / postCount,
      avgComments: totalComments / postCount,
      avgShares: totalShares / postCount,
      avgEngagement: totalEngagement / postCount,
    });
  }

  // Urutkan dari rata-rata engagement tertinggi; tie-breaker: total engagement, lalu jam lebih awal
  stats.sort((a, b) => {
    if (b.avgEngagement !== a.avgEngagement) {
      return b.avgEngagement - a.avgEngagement;
    }
    if (b.totalEngagement !== a.totalEngagement) {
      return b.totalEngagement - a.totalEngagement;
    }
    return a.hour - b.hour;
  });

  return stats.map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));
}

/**
 * Langkah Flowchart 4:
 * Pilih 3 jam dengan engagement tertinggi.
 */
export function getTop3Hours(
  hourlyStats: HourlyEngagementStat[]
): HourlyEngagementStat[] {
  return hourlyStats.slice(0, 3);
}

/**
 * Langkah Flowchart 6 (Decision Diamond):
 * Jam terpilih bentrok dengan jadwal lain?
 */
export function checkScheduleConflict(
  scheduledPosts: ScheduledPost[],
  date: string,
  hour: number,
  excludePostId?: string
): ScheduledPost | undefined {
  return scheduledPosts.find(
    (post) =>
      post.date === date &&
      post.hour === hour &&
      (excludePostId ? post.id !== excludePostId : true)
  );
}

/**
 * Langkah Flowchart 7 (Loop):
 * Geser ke jam terbaik berikutnya yang tidak bentrok dengan jadwal lain.
 */
export function findNextBestAvailableHour(
  rankedStats: HourlyEngagementStat[],
  scheduledPosts: ScheduledPost[],
  date: string,
  currentHour: number
): NextAvailableResult {
  const occupiedHours = new Set(
    scheduledPosts.filter((p) => p.date === date).map((p) => p.hour)
  );

  // Cari mulai dari peringkat berikutnya setelah currentHour (atau dari peringkat 1 jika currentHour tidak ada di daftar peringkat)
  const currentRankIdx = rankedStats.findIndex((s) => s.hour === currentHour);
  const orderedCandidates =
    currentRankIdx >= 0
      ? [
          ...rankedStats.slice(currentRankIdx + 1),
          ...rankedStats.slice(0, currentRankIdx),
        ]
      : rankedStats;

  for (const stat of orderedCandidates) {
    if (stat.hour !== currentHour && !occupiedHours.has(stat.hour)) {
      return {
        hour: stat.hour,
        date,
        rank: stat.rank,
        avgEngagement: stat.avgEngagement,
        source: 'ranked',
      };
    }
  }

  // Jika semua jam yang memiliki data engagement sudah terisi di tanggal tersebut, cari jam aktif humas (07:00 - 21:00) lalu 00:00 - 23:00 yang kosong
  const preferredHours = [
    8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 7, 22, 6, 23, 5, 4,
    3, 2, 1, 0,
  ];
  for (const h of preferredHours) {
    if (h !== currentHour && !occupiedHours.has(h)) {
      return {
        hour: h,
        date,
        rank: null,
        avgEngagement: null,
        source: 'fallback_same_day',
      };
    }
  }

  // Jika seluruh 24 jam pada tanggal tersebut penuh, sarankan hari berikutnya pada jam terbaik #1
  const nextDate = addDaysIso(date, 1);
  const topHour = rankedStats[0];
  return {
    hour: topHour ? topHour.hour : 9,
    date: nextDate,
    rank: topHour ? topHour.rank : null,
    avgEngagement: topHour ? topHour.avgEngagement : null,
    source: 'next_day',
  };
}

export function exportScheduleToCsv(posts: ScheduledPost[]): void {
  const sorted = [...posts].sort((a, b) =>
    a.date === b.date ? a.hour - b.hour : a.date.localeCompare(b.date)
  );

  const headers = [
    'Tanggal',
    'Jam Posting',
    'Peringkat Engagement',
    'Rata-rata Engagement',
    'Platform',
    'Kategori Humas',
    'Judul Konten',
    'Ringkasan Caption',
  ];

  const escapeCsv = (val: string) => `"${val.replace(/"/g, '""')}"`;

  const rows = sorted.map((p) => [
    p.date,
    formatHour(p.hour),
    p.engagementRank ? `#${p.engagementRank}` : 'Manual',
    p.expectedAvgEngagement !== null ? formatNumber(p.expectedAvgEngagement) : '-',
    p.platform,
    p.category,
    escapeCsv(p.title),
    escapeCsv(p.caption),
  ]);

  const csvContent =
    '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `jadwal-humas-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
