import React, { useState } from 'react';
import { Calendar, Download, Search, Trash2 } from 'lucide-react';
import {
  HourlyEngagementStat,
  Platform,
  ScheduledPost,
} from '../types/scheduler';
import {
  exportScheduleToCsv,
  formatDateIndo,
  formatHour,
  formatNumber,
} from '../utils/schedulerAlgorithm';

interface ScheduleListPanelProps {
  scheduledPosts: ScheduledPost[];
  hourlyStats: HourlyEngagementStat[];
  filterDate: string;
  onChangeFilterDate: (date: string) => void;
  onDeletePost: (id: string) => void;
  onFocusComposer: () => void;
}

const PLATFORMS: ('Semua' | Platform)[] = [
  'Semua',
  'Instagram',
  'X / Twitter',
  'TikTok',
  'Facebook',
  'LinkedIn',
];

export const ScheduleListPanel: React.FC<ScheduleListPanelProps> = ({
  scheduledPosts,
  hourlyStats,
  filterDate,
  onChangeFilterDate,
  onDeletePost,
  onFocusComposer,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<'Semua' | Platform>(
    'Semua'
  );
  const [showAllDates, setShowAllDates] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');

  const filteredPosts = scheduledPosts
    .filter((post) => {
      if (!showAllDates && post.date !== filterDate) return false;
      if (platformFilter !== 'Semua' && post.platform !== platformFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          post.title.toLowerCase().includes(q) ||
          post.caption.toLowerCase().includes(q) ||
          post.category.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) =>
      a.date === b.date ? a.hour - b.hour : a.date.localeCompare(b.date)
    );

  // Active hours for timeline view on selected filterDate
  const timelinePosts = scheduledPosts.filter((p) => p.date === filterDate);
  const postByHour = new Map<number, ScheduledPost>();
  for (const p of timelinePosts) {
    postByHour.set(p.hour, p);
  }
  const statByHour = new Map<number, HourlyEngagementStat>();
  for (const s of hourlyStats) {
    statByHour.set(s.hour, s);
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Jadwal Posting Optimal Humas
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
            Menampilkan {filteredPosts.length} dari {scheduledPosts.length}{' '}
            konten terjadwal tanpa bentrok
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            className="inline-flex items-center p-1 bg-slate-100 rounded-lg"
            role="tablist"
            aria-label="Mode tampilan jadwal"
          >
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'table'}
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tabel Jadwal
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'timeline'}
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Linimasa Harian
            </button>
          </div>

          <button
            type="button"
            disabled={scheduledPosts.length === 0}
            onClick={() => exportScheduleToCsv(filteredPosts)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-40 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="px-6 py-3 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul konten, caption, atau kategori..."
            aria-label="Cari jadwal posting"
            className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <select
          value={platformFilter}
          onChange={(e) =>
            setPlatformFilter(e.target.value as 'Semua' | Platform)
          }
          aria-label="Filter platform"
          className="h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              Platform: {p}
            </option>
          ))}
        </select>

        {viewMode === 'table' && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAllDates((prev) => !prev)}
              className={`h-9 px-3 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap cursor-pointer ${
                showAllDates
                  ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                  : 'bg-blue-700 border-blue-700 text-white'
              }`}
            >
              {showAllDates ? 'Semua Tanggal' : 'Filter 1 Tanggal'}
            </button>
            {!showAllDates && (
              <input
                type="date"
                value={filterDate}
                onChange={(e) => onChangeFilterDate(e.target.value)}
                aria-label="Pilih tanggal filter"
                className="h-9 px-3 text-xs font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            )}
          </div>
        )}

        {viewMode === 'timeline' && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => onChangeFilterDate(e.target.value)}
              aria-label="Tanggal linimasa"
              className="h-9 px-3 text-xs font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        )}
      </div>

      {viewMode === 'table' ? (
        filteredPosts.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-slate-800">
              Tidak ada jadwal posting yang sesuai filter.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Tambahkan konten baru pada formulir penjadwalan atau ubah filter pencarian.
            </p>
            <button
              type="button"
              onClick={onFocusComposer}
              className="mt-4 px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
            >
              Buat Jadwal Baru
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[12px] font-medium text-slate-500">
                  <th className="py-2.5 pl-6 pr-3 whitespace-nowrap">
                    Tanggal & Jam
                  </th>
                  <th className="py-2.5 px-3 whitespace-nowrap">
                    Konten Publikasi
                  </th>
                  <th className="py-2.5 px-3 whitespace-nowrap">
                    Platform · Kategori
                  </th>
                  <th className="py-2.5 px-3 whitespace-nowrap">
                    Status Optimal
                  </th>
                  <th className="py-2.5 pl-3 pr-6 text-right whitespace-nowrap">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50/80">
                    <td className="py-3 pl-6 pr-3 whitespace-nowrap align-top">
                      <div className="font-mono font-semibold text-slate-900 tabular-nums">
                        {formatHour(post.hour)}
                      </div>
                      <div className="text-xs text-slate-500 tabular-nums mt-0.5">
                        {formatDateIndo(post.date)}
                      </div>
                    </td>
                    <td className="py-3 px-3 align-top max-w-md">
                      <div className="font-semibold text-slate-900">
                        {post.title}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                        {post.caption}
                      </p>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap align-top">
                      <div className="text-xs text-slate-700 font-medium">
                        {post.platform}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {post.category}
                      </div>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap align-top">
                      <div className="text-xs font-medium text-emerald-700 tabular-nums">
                        {post.engagementRank
                          ? `Jam Terbaik #${post.engagementRank}`
                          : 'Slot Terjadwal'}
                        {post.expectedAvgEngagement !== null &&
                          ` · Rata-rata ${formatNumber(
                            post.expectedAvgEngagement
                          )}`}
                      </div>
                      {post.shiftedFromHour !== undefined &&
                        post.shiftedFromHour !== null && (
                          <div className="text-[11px] text-amber-700 font-mono tabular-nums mt-0.5">
                            Digeser dari {formatHour(post.shiftedFromHour)}
                          </div>
                        )}
                    </td>
                    <td className="py-3 pl-3 pr-6 text-right align-top">
                      <button
                        type="button"
                        onClick={() => onDeletePost(post.id)}
                        aria-label={`Hapus jadwal ${post.title}`}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        /* Linimasa Harian 06:00 - 22:00 */
        <div className="p-6">
          <div className="text-xs text-slate-500 mb-4">
            Linimasa slot per jam untuk{' '}
            <strong className="text-slate-900">
              {formatDateIndo(filterDate)}
            </strong>{' '}
            (menampilkan jam operasional 06:00 – 22:00 serta jam terbaik).
          </div>
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
            {Array.from({ length: 17 }, (_, idx) => idx + 6).map((hour) => {
              const post = postByHour.get(hour);
              const stat = statByHour.get(hour);
              const isTop3 = stat !== undefined && stat.rank <= 3;

              return (
                <div
                  key={hour}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2.5 text-sm ${
                    post
                      ? 'bg-blue-50/40'
                      : isTop3
                      ? 'bg-emerald-50/30'
                      : 'bg-white'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="font-mono font-semibold text-slate-900 tabular-nums w-14 shrink-0">
                      {formatHour(hour)}
                    </span>
                    {post ? (
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate">
                          {post.title}
                        </div>
                        <div className="text-xs text-slate-500">
                          {post.platform} · {post.category}
                          {stat ? ` · Peringkat #${stat.rank}` : ''}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500">
                        {isTop3
                          ? `Slot kosong · Rekomendasi Jam Terbaik #${stat.rank} (rata-rata ${formatNumber(
                              stat.avgEngagement
                            )})`
                          : stat
                          ? `Slot kosong · Rata-rata ${formatNumber(
                              stat.avgEngagement
                            )} engagement`
                          : 'Slot kosong'}
                      </span>
                    )}
                  </div>

                  {post && (
                    <button
                      type="button"
                      onClick={() => onDeletePost(post.id)}
                      aria-label={`Hapus jadwal ${post.title}`}
                      className="text-xs font-medium text-red-600 hover:underline self-start sm:self-center shrink-0 cursor-pointer"
                    >
                      Batalkan Slot
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
