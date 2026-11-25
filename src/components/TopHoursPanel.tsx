import React from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { HourlyEngagementStat, ScheduledPost } from '../types/scheduler';
import {
  checkScheduleConflict,
  formatDateIndo,
  formatHour,
  formatNumber,
} from '../utils/schedulerAlgorithm';

interface TopHoursPanelProps {
  top3Hours: HourlyEngagementStat[];
  scheduledPosts: ScheduledPost[];
  targetDate: string;
  selectedHour: number;
  onSelectHourForSchedule: (hour: number) => void;
  onGoToEngagementInput: () => void;
}

export const TopHoursPanel: React.FC<TopHoursPanelProps> = ({
  top3Hours,
  scheduledPosts,
  targetDate,
  selectedHour,
  onSelectHourForSchedule,
  onGoToEngagementInput,
}) => {
  if (top3Hours.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
        <div className="mx-auto w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 mb-3">
          <Clock className="w-5 h-5" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">
          Belum Ada Rekomendasi 3 Jam Terbaik
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
          Masukkan data engagement konten (jam posting, like, komentar, share) terlebih dahulu agar sistem dapat mengelompokkan dan menghitung 3 jam terbaik.
        </p>
        <button
          type="button"
          onClick={onGoToEngagementInput}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap"
        >
          <span>Input Data Engagement</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {top3Hours.map((stat) => {
        const conflict = checkScheduleConflict(
          scheduledPosts,
          targetDate,
          stat.hour
        );
        const isSelected = selectedHour === stat.hour;

        return (
          <div
            key={stat.hour}
            className={`bg-white rounded-xl p-5 border transition-colors flex flex-col justify-between ${
              isSelected
                ? 'border-blue-700 ring-1 ring-blue-700/20'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              {/* Quiet unboxed text kicker (zero-pill rule) */}
              <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                <span className="font-semibold text-blue-700">
                  Peringkat {stat.rank} · Jam Terbaik
                </span>
                <span className="tabular-nums">{stat.postCount} sampel</span>
              </div>

              <div className="mt-3 flex items-baseline justify-between gap-3">
                <div className="text-3xl font-semibold font-mono tabular-nums text-slate-900 tracking-tight">
                  {formatHour(stat.hour)}
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold font-mono tabular-nums text-slate-900">
                    {formatNumber(stat.avgEngagement)}
                  </div>
                  <div className="text-xs text-slate-500">
                    rata-rata engagement
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600 tabular-nums">
                <span>Like {formatNumber(stat.avgLikes)}</span>
                <span aria-hidden="true">·</span>
                <span>Komentar {formatNumber(stat.avgComments)}</span>
                <span aria-hidden="true">·</span>
                <span>Share {formatNumber(stat.avgShares)}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <div className="min-w-0">
                {conflict ? (
                  <div className="flex items-center gap-1.5 text-xs text-amber-700 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      Bentrok ({formatDateIndo(targetDate)})
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      Tersedia ({formatDateIndo(targetDate)})
                    </span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => onSelectHourForSchedule(stat.hour)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-700 text-white'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                }`}
              >
                {isSelected ? 'Terpilih' : 'Pilih Jam'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
