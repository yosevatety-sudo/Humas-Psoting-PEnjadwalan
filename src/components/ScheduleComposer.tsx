import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRightLeft,
  CalendarCheck,
  CheckCircle2,
  GitBranch,
} from 'lucide-react';
import {
  ContentCategory,
  HourlyEngagementStat,
  Platform,
  ScheduledPost,
} from '../types/scheduler';
import {
  checkScheduleConflict,
  findNextBestAvailableHour,
  formatDateIndo,
  formatHour,
  formatNumber,
} from '../utils/schedulerAlgorithm';

interface ScheduleComposerProps {
  hourlyStats: HourlyEngagementStat[];
  top3Hours: HourlyEngagementStat[];
  scheduledPosts: ScheduledPost[];
  targetDate: string;
  onChangeTargetDate: (date: string) => void;
  selectedHour: number;
  onChangeSelectedHour: (hour: number) => void;
  onSavePost: (
    post: Omit<ScheduledPost, 'id' | 'createdAt'>
  ) => void;
}

const PLATFORMS: Platform[] = [
  'Instagram',
  'X / Twitter',
  'TikTok',
  'Facebook',
  'LinkedIn',
];

const CATEGORIES: ContentCategory[] = [
  'Siaran Pers',
  'Infografis',
  'Agenda Pimpinan',
  'Layanan Publik',
  'Klarifikasi',
];

export const ScheduleComposer: React.FC<ScheduleComposerProps> = ({
  hourlyStats,
  top3Hours,
  scheduledPosts,
  targetDate,
  onChangeTargetDate,
  selectedHour,
  onChangeSelectedHour,
  onSavePost,
}) => {
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [platform, setPlatform] = useState<Platform>('Instagram');
  const [category, setCategory] = useState<ContentCategory>('Siaran Pers');
  const [shiftTrail, setShiftTrail] = useState<number[]>([]);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Reset shift trail if user picks a date manually
  useEffect(() => {
    setShiftTrail([]);
  }, [targetDate]);

  const selectedStat = hourlyStats.find((s) => s.hour === selectedHour);
  const conflictingPost = checkScheduleConflict(
    scheduledPosts,
    targetDate,
    selectedHour
  );

  const nextBestOption = conflictingPost
    ? findNextBestAvailableHour(
        hourlyStats,
        scheduledPosts,
        targetDate,
        selectedHour
      )
    : null;

  const handleShiftToNextBest = () => {
    if (!nextBestOption || nextBestOption.hour === null) return;
    setShiftTrail((prev) =>
      prev.includes(selectedHour) ? prev : [...prev, selectedHour]
    );
    if (nextBestOption.date !== targetDate) {
      onChangeTargetDate(nextBestOption.date);
    }
    onChangeSelectedHour(nextBestOption.hour);
    setFormError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!title.trim()) {
      setFormError('Judul konten humas wajib diisi sebelum menjadwalkan.');
      return;
    }

    if (conflictingPost) {
      setFormError(
        `Jam ${formatHour(
          selectedHour
        )} bentrok dengan jadwal lain. Klik "Geser ke Jam Terbaik Berikutnya" terlebih dahulu.`
      );
      return;
    }

    setFormError('');
    onSavePost({
      title: title.trim(),
      caption:
        caption.trim() ||
        `Publikasi resmi ${category} untuk kanal ${platform}.`,
      platform,
      category,
      date: targetDate,
      hour: selectedHour,
      engagementRank: selectedStat ? selectedStat.rank : null,
      expectedAvgEngagement: selectedStat ? selectedStat.avgEngagement : null,
      shiftedFromHour: shiftTrail.length > 0 ? shiftTrail[0] : null,
    });

    setSuccessMessage(
      `Jadwal "${title.trim()}" berhasil disimpan untuk ${formatDateIndo(
        targetDate
      )} pukul ${formatHour(selectedHour)}.`
    );
    setTitle('');
    setCaption('');
    setShiftTrail([]);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Input Konten & Deteksi Bentrok Jadwal
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Pilih salah satu dari 3 jam terbaik, masukkan konten humas, dan sistem akan memeriksa bentrok jadwal secara otomatis.
          </p>
        </div>
        <div className="text-xs font-mono tabular-nums text-slate-500 shrink-0">
          Slot aktif: <strong className="text-slate-900">{formatHour(selectedHour)}</strong>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column: Content Details */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <label
                htmlFor="post-title"
                className="block text-xs font-medium text-slate-700 mb-1.5"
              >
                Judul Konten / Agenda Humas
              </label>
              <input
                id="post-title"
                type="text"
                placeholder="Contoh: Rilis Pers Pembukaan Beasiswa Daerah 2026"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setFormError('');
                }}
                className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="post-platform"
                  className="block text-xs font-medium text-slate-700 mb-1.5"
                >
                  Platform Media Sosial
                </label>
                <select
                  id="post-platform"
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

              <div>
                <label
                  htmlFor="post-category"
                  className="block text-xs font-medium text-slate-700 mb-1.5"
                >
                  Kategori Konten Humas
                </label>
                <select
                  id="post-category"
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as ContentCategory)
                  }
                  className="w-full h-10 px-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="post-caption"
                className="block text-xs font-medium text-slate-700 mb-1.5"
              >
                Isi / Draf Caption Konten
              </label>
              <textarea
                id="post-caption"
                rows={4}
                placeholder="Tuliskan pesan utama atau draf caption yang akan dipublikasikan oleh tim humas..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full p-3 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 resize-y"
              />
            </div>
          </div>

          {/* Right column: Time Selection + Flowchart Decision Check */}
          <div className="lg:col-span-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="post-date"
                  className="block text-xs font-medium text-slate-700 mb-1.5"
                >
                  Tanggal Posting
                </label>
                <input
                  id="post-date"
                  type="date"
                  value={targetDate}
                  onChange={(e) => onChangeTargetDate(e.target.value)}
                  className="w-full h-10 px-3 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                />
              </div>

              <div>
                <label
                  htmlFor="post-hour"
                  className="block text-xs font-medium text-slate-700 mb-1.5"
                >
                  Jam Posting Terpilih
                </label>
                <select
                  id="post-hour"
                  value={selectedHour}
                  onChange={(e) => {
                    setShiftTrail([]);
                    onChangeSelectedHour(Number(e.target.value));
                  }}
                  className="w-full h-10 px-3 text-sm font-mono tabular-nums bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                >
                  {Array.from({ length: 24 }, (_, h) => {
                    const stat = hourlyStats.find((s) => s.hour === h);
                    const hasConflict = Boolean(
                      checkScheduleConflict(scheduledPosts, targetDate, h)
                    );
                    return (
                      <option key={h} value={h}>
                        {formatHour(h)}
                        {stat ? ` (Rank #${stat.rank})` : ''}
                        {hasConflict ? ' — Bentrok' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Quick Top 3 selector buttons */}
            {top3Hours.length > 0 && (
              <div>
                <div className="text-xs font-medium text-slate-600 mb-1.5">
                  Pilih Cepat dari 3 Jam Terbaik:
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {top3Hours.map((stat) => {
                    const isActive = selectedHour === stat.hour;
                    const isBusy = Boolean(
                      checkScheduleConflict(
                        scheduledPosts,
                        targetDate,
                        stat.hour
                      )
                    );
                    return (
                      <button
                        key={stat.hour}
                        type="button"
                        onClick={() => {
                          setShiftTrail([]);
                          onChangeSelectedHour(stat.hour);
                        }}
                        className={`px-2.5 py-2 text-left rounded-lg border transition-colors cursor-pointer ${
                          isActive
                            ? 'border-blue-700 bg-blue-50/70 text-blue-900'
                            : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 text-xs font-mono font-semibold tabular-nums">
                          <span>{formatHour(stat.hour)}</span>
                          <span className="text-[11px] font-sans font-medium text-slate-500">
                            #{stat.rank}
                          </span>
                        </div>
                        <div
                          className={`text-[11px] mt-0.5 truncate ${
                            isBusy ? 'text-amber-700' : 'text-emerald-700'
                          }`}
                        >
                          {isBusy ? 'Bentrok' : 'Kosong'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Decision Diamond Evaluation Box */}
            {conflictingPost ? (
              <div
                role="alert"
                className="p-4 rounded-xl border border-amber-300 bg-amber-50/70 space-y-3"
              >
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                      <GitBranch className="w-3.5 h-3.5 shrink-0" />
                      <span>Peringatan Bentrok Jadwal (Cabang Ya)</span>
                    </div>
                    <p className="text-xs text-amber-900/90 mt-1 leading-relaxed">
                      Jam terpilih{' '}
                      <strong className="font-mono tabular-nums">
                        {formatHour(selectedHour)}
                      </strong>{' '}
                      pada{' '}
                      <strong>{formatDateIndo(targetDate)}</strong> bentrok
                      dengan jadwal:{' '}
                      <span className="underline decoration-amber-400">
                        {conflictingPost.title}
                      </span>{' '}
                      ({conflictingPost.platform}).
                    </p>
                  </div>
                </div>

                {nextBestOption && nextBestOption.hour !== null && (
                  <button
                    type="button"
                    onClick={handleShiftToNextBest}
                    className="w-full py-2.5 px-3 inline-flex items-center justify-center gap-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <ArrowRightLeft className="w-4 h-4 shrink-0" />
                    <span className="truncate">
                      {nextBestOption.source === 'ranked'
                        ? `Geser ke Jam Terbaik Berikutnya (${formatHour(
                            nextBestOption.hour
                          )} · Peringkat #${nextBestOption.rank})`
                        : nextBestOption.source === 'fallback_same_day'
                        ? `Geser ke Jam Kosong Terdekat (${formatHour(
                            nextBestOption.hour
                          )})`
                        : `Geser ke ${formatDateIndo(
                            nextBestOption.date
                          )} (${formatHour(nextBestOption.hour)})`}
                    </span>
                  </button>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 space-y-1.5">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-emerald-900">
                      Slot Aman & Tidak Bentrok (Cabang Tidak)
                    </div>
                    <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                      Pukul{' '}
                      <strong className="font-mono tabular-nums">
                        {formatHour(selectedHour)}
                      </strong>{' '}
                      pada <strong>{formatDateIndo(targetDate)}</strong>{' '}
                      tersedia untuk dijadwalkan
                      {selectedStat
                        ? ` (Peringkat #${selectedStat.rank} · rata-rata ${formatNumber(
                            selectedStat.avgEngagement
                          )} engagement)`
                        : ''}
                      .
                    </p>
                    {shiftTrail.length > 0 && (
                      <p className="text-[11px] text-emerald-700 font-mono tabular-nums mt-1">
                        Jejak geser: {shiftTrail.map(formatHour).join(' → ')} →{' '}
                        {formatHour(selectedHour)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {formError && (
              <p className="text-xs font-medium text-red-600" role="alert">
                {formError}
              </p>
            )}

            {successMessage && (
              <p
                className="text-xs font-medium text-emerald-700"
                role="status"
              >
                {successMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={Boolean(conflictingPost)}
              className="w-full h-11 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Simpan Jadwal Posting Optimal</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
