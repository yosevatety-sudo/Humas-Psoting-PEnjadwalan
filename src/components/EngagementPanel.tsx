import React, { useState } from 'react';
import { Plus, RotateCcw, Trash2 } from 'lucide-react';
import {
  EngagementRecord,
  HourlyEngagementStat,
  Platform,
} from '../types/scheduler';
import { formatHour, formatNumber } from '../utils/schedulerAlgorithm';

interface EngagementPanelProps {
  records: EngagementRecord[];
  hourlyStats: HourlyEngagementStat[];
  onAddRecord: (record: Omit<EngagementRecord, 'id'>) => void;
  onDeleteRecord: (id: string) => void;
  onLoadSampleData: () => void;
  onClearAllRecords: () => void;
  onSelectHourForSchedule: (hour: number) => void;
}

const PLATFORMS: Platform[] = [
  'Instagram',
  'X / Twitter',
  'TikTok',
  'Facebook',
  'LinkedIn',
];

export const EngagementPanel: React.FC<EngagementPanelProps> = ({
  records,
  hourlyStats,
  onAddRecord,
  onDeleteRecord,
  onLoadSampleData,
  onClearAllRecords,
  onSelectHourForSchedule,
}) => {
  const [hour, setHour] = useState<number>(12);
  const [likes, setLikes] = useState<string>('250');
  const [comments, setComments] = useState<string>('30');
  const [shares, setShares] = useState<string>('45');
  const [platform, setPlatform] = useState<Platform>('Instagram');
  const [topic, setTopic] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [viewTab, setViewTab] = useState<'grouped' | 'raw'>('grouped');
  const [confirmClear, setConfirmClear] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLikes = Number(likes);
    const parsedComments = Number(comments);
    const parsedShares = Number(shares);

    if (
      Number.isNaN(parsedLikes) ||
      Number.isNaN(parsedComments) ||
      Number.isNaN(parsedShares) ||
      parsedLikes < 0 ||
      parsedComments < 0 ||
      parsedShares < 0
    ) {
      setErrorMsg('Nilai like, komentar, dan share harus berupa angka 0 atau lebih.');
      return;
    }

    setErrorMsg('');
    onAddRecord({
      hour,
      likes: Math.round(parsedLikes),
      comments: Math.round(parsedComments),
      shares: Math.round(parsedShares),
      platform,
      topic: topic.trim() || `Publikasi ${platform} (${formatHour(hour)})`,
    });
    setTopic('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Input Form */}
      <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6">
        <div className="pb-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">
            Input Data Engagement
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Masukkan riwayat performa konten humas untuk dikelompokkan per jam posting.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="eng-hour"
                className="block text-xs font-medium text-slate-700 mb-1.5"
              >
                Jam Posting
              </label>
              <select
                id="eng-hour"
                value={hour}
                onChange={(e) => setHour(Number(e.target.value))}
                className="w-full h-10 px-3 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {formatHour(i)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="eng-platform"
                className="block text-xs font-medium text-slate-700 mb-1.5"
              >
                Platform
              </label>
              <select
                id="eng-platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label
                htmlFor="eng-likes"
                className="block text-xs font-medium text-slate-700 mb-1.5"
              >
                Like
              </label>
              <input
                id="eng-likes"
                type="number"
                min={0}
                required
                value={likes}
                onChange={(e) => setLikes(e.target.value)}
                className="w-full h-10 px-3 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            <div>
              <label
                htmlFor="eng-comments"
                className="block text-xs font-medium text-slate-700 mb-1.5"
              >
                Komentar
              </label>
              <input
                id="eng-comments"
                type="number"
                min={0}
                required
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full h-10 px-3 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            <div>
              <label
                htmlFor="eng-shares"
                className="block text-xs font-medium text-slate-700 mb-1.5"
              >
                Share
              </label>
              <input
                id="eng-shares"
                type="number"
                min={0}
                required
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                className="w-full h-10 px-3 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="eng-topic"
              className="block text-xs font-medium text-slate-700 mb-1.5"
            >
              Topik / Catatan Konten (Opsional)
            </label>
            <input
              id="eng-topic"
              type="text"
              placeholder="Contoh: Siaran Pers Layanan Terpadu"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          <div className="pt-1 flex items-center justify-between text-xs text-slate-500 tabular-nums">
            <span>Total engagement entri ini</span>
            <span className="font-mono font-semibold text-slate-900">
              {formatNumber(
                Math.max(0, Number(likes) || 0) +
                  Math.max(0, Number(comments) || 0) +
                  Math.max(0, Number(shares) || 0)
              )}
            </span>
          </div>

          {errorMsg && (
            <p className="text-xs text-red-600 font-medium" role="alert">
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            className="w-full h-10 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Data Engagement</span>
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              setConfirmClear(false);
              onLoadSampleData();
            }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-blue-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Muat Contoh Humas</span>
          </button>

          {!confirmClear ? (
            <button
              type="button"
              disabled={records.length === 0}
              onClick={() => setConfirmClear(true)}
              className="text-xs font-medium text-slate-500 hover:text-red-600 disabled:opacity-40 transition-colors cursor-pointer whitespace-nowrap"
            >
              Kosongkan Data
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  onClearAllRecords();
                  setConfirmClear(false);
                }}
                className="font-semibold text-red-600 hover:underline cursor-pointer"
              >
                Ya, Hapus Semua
              </button>
              <span className="text-slate-300">/</span>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="text-slate-600 hover:underline cursor-pointer"
              >
                Batal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Grouped Hourly Table & Raw Log */}
      <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {viewTab === 'grouped'
                ? 'Pengelompokan & Rata-Rata Engagement per Jam'
                : 'Log Data Engagement Mentah'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
              {records.length} data konten dikelompokkan ke dalam{' '}
              {hourlyStats.length} slot jam posting
            </p>
          </div>

          <div
            className="inline-flex items-center p-1 bg-slate-100 rounded-lg self-start sm:self-auto"
            role="tablist"
            aria-label="Tampilan tabel engagement"
          >
            <button
              type="button"
              role="tab"
              aria-selected={viewTab === 'grouped'}
              onClick={() => setViewTab('grouped')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                viewTab === 'grouped'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rata-Rata Per Jam ({hourlyStats.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewTab === 'raw'}
              onClick={() => setViewTab('raw')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                viewTab === 'raw'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Data Mentah ({records.length})
            </button>
          </div>
        </div>

        {records.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-slate-800">
              Belum ada data engagement yang tersimpan.
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Tambahkan data di formulir sebelah kiri atau muat contoh data humas untuk memulai perhitungan.
            </p>
            <button
              type="button"
              onClick={onLoadSampleData}
              className="mt-4 px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
            >
              Muat Data Contoh Humas
            </button>
          </div>
        ) : viewTab === 'grouped' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[12px] font-medium text-slate-500">
                  <th className="py-2.5 pl-6 pr-3 whitespace-nowrap">Peringkat</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">Jam Posting</th>
                  <th className="py-2.5 px-3 text-right whitespace-nowrap">
                    Jumlah Konten
                  </th>
                  <th className="py-2.5 px-3 text-right whitespace-nowrap">
                    Rata-rata Like
                  </th>
                  <th className="py-2.5 px-3 text-right whitespace-nowrap">
                    Rata-rata Komentar
                  </th>
                  <th className="py-2.5 px-3 text-right whitespace-nowrap">
                    Rata-rata Share
                  </th>
                  <th className="py-2.5 px-3 text-right whitespace-nowrap">
                    Rata-rata Engagement
                  </th>
                  <th className="py-2.5 pl-3 pr-6 text-right whitespace-nowrap">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {hourlyStats.map((stat) => {
                  const isTop3 = stat.rank <= 3;
                  return (
                    <tr
                      key={stat.hour}
                      className={`h-11 transition-colors ${
                        isTop3
                          ? 'bg-blue-50/35 hover:bg-blue-50/60'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-2.5 pl-6 pr-3 font-mono tabular-nums whitespace-nowrap">
                        <span
                          className={
                            isTop3
                              ? 'font-semibold text-blue-700'
                              : 'text-slate-500'
                          }
                        >
                          #{stat.rank}
                        </span>
                        {isTop3 && (
                          <span className="ml-1.5 text-xs font-sans text-blue-700 font-medium">
                            · Top 3
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                        {formatHour(stat.hour)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600 tabular-nums">
                        {stat.postCount}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600 tabular-nums">
                        {formatNumber(stat.avgLikes)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600 tabular-nums">
                        {formatNumber(stat.avgComments)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600 tabular-nums">
                        {formatNumber(stat.avgShares)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                        {formatNumber(stat.avgEngagement)}
                      </td>
                      <td className="py-2.5 pl-3 pr-6 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onSelectHourForSchedule(stat.hour)}
                          className="text-xs font-medium text-blue-700 hover:text-blue-800 hover:underline cursor-pointer"
                        >
                          Pakai Jam
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-[12px] font-medium text-slate-500">
                <tr>
                  <th className="py-2.5 pl-6 pr-3 whitespace-nowrap">Jam</th>
                  <th className="py-2.5 px-3 whitespace-nowrap">
                    Topik & Platform
                  </th>
                  <th className="py-2.5 px-3 text-right whitespace-nowrap">
                    Like
                  </th>
                  <th className="py-2.5 px-3 text-right whitespace-nowrap">
                    Komentar
                  </th>
                  <th className="py-2.5 px-3 text-right whitespace-nowrap">
                    Share
                  </th>
                  <th className="py-2.5 px-3 text-right whitespace-nowrap">
                    Total
                  </th>
                  <th className="py-2.5 pl-3 pr-6 text-right whitespace-nowrap">
                    Hapus
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {records.map((rec) => (
                  <tr key={rec.id} className="h-11 hover:bg-slate-50">
                    <td className="py-2.5 pl-6 pr-3 font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                      {formatHour(rec.hour)}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-900 truncate max-w-[260px]">
                        {rec.topic}
                      </div>
                      <div className="text-xs text-slate-500">{rec.platform}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600 tabular-nums">
                      {formatNumber(rec.likes, 0)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600 tabular-nums">
                      {formatNumber(rec.comments, 0)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600 tabular-nums">
                      {formatNumber(rec.shares, 0)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                      {formatNumber(rec.likes + rec.comments + rec.shares, 0)}
                    </td>
                    <td className="py-2.5 pl-3 pr-6 text-right">
                      <button
                        type="button"
                        onClick={() => onDeleteRecord(rec.id)}
                        aria-label={`Hapus data ${rec.topic}`}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
