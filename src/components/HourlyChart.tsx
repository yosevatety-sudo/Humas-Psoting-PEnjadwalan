import React, { useState } from 'react';
import { HourlyEngagementStat } from '../types/scheduler';
import { formatHour, formatNumber } from '../utils/schedulerAlgorithm';

interface HourlyChartProps {
  hourlyStats: HourlyEngagementStat[];
  selectedHour: number;
  onSelectHour: (hour: number) => void;
}

export const HourlyChart: React.FC<HourlyChartProps> = ({
  hourlyStats,
  selectedHour,
  onSelectHour,
}) => {
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);

  const statByHour = new Map<number, HourlyEngagementStat>();
  for (const stat of hourlyStats) {
    statByHour.set(stat.hour, stat);
  }

  const maxAvg = Math.max(...hourlyStats.map((s) => s.avgEngagement), 10);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const activePreviewHour = hoveredHour ?? selectedHour;
  const activePreviewStat = statByHour.get(activePreviewHour);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Distribusi Rata-Rata Engagement per Jam (00:00 – 23:00)
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Klik batang jam untuk memilih slot posting. Jam berwarna biru menandakan 3 peringkat tertinggi.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-600 shrink-0">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-blue-700 inline-block" aria-hidden="true" />
            <span>Top 3 Jam Terbaik</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-slate-300 inline-block" aria-hidden="true" />
            <span>Jam Lainnya</span>
          </span>
        </div>
      </div>

      {/* Live readout strip */}
      <div className="mt-4 mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 min-h-[24px]">
        <div className="flex items-center gap-2 font-mono tabular-nums">
          <span className="font-semibold text-slate-900">
            Pukul {formatHour(activePreviewHour)}
          </span>
          <span aria-hidden="true">·</span>
          {activePreviewStat ? (
            <>
              <span>
                Rata-rata{' '}
                <strong className="text-slate-900">
                  {formatNumber(activePreviewStat.avgEngagement)}
                </strong>
              </span>
              <span aria-hidden="true">·</span>
              <span>Peringkat #{activePreviewStat.rank}</span>
              <span aria-hidden="true">·</span>
              <span>{activePreviewStat.postCount} data konten</span>
            </>
          ) : (
            <span className="text-slate-400">Belum ada data engagement pada jam ini</span>
          )}
        </div>
        <div className="text-slate-400 tabular-nums">
          Maksimum: {formatNumber(maxAvg)} engagement
        </div>
      </div>

      {/* Bar chart grid */}
      <div className="mt-3 pt-4">
        <div
          className="grid grid-cols-12 sm:grid-cols-24 gap-1.5 items-end h-44"
          role="list"
          aria-label="Grafik rata-rata engagement per jam"
        >
          {hours.map((hour) => {
            const stat = statByHour.get(hour);
            const isTop3 = stat !== undefined && stat.rank <= 3;
            const isSelected = selectedHour === hour;
            const heightPct = stat
              ? Math.max(10, Math.round((stat.avgEngagement / maxAvg) * 100))
              : 4;

            return (
              <div
                key={hour}
                role="listitem"
                className="flex flex-col items-center h-full justify-end group"
              >
                <button
                  type="button"
                  onClick={() => onSelectHour(hour)}
                  onMouseEnter={() => setHoveredHour(hour)}
                  onMouseLeave={() => setHoveredHour(null)}
                  onFocus={() => setHoveredHour(hour)}
                  onBlur={() => setHoveredHour(null)}
                  aria-label={`Jam ${formatHour(hour)}, ${
                    stat
                      ? `rata-rata engagement ${formatNumber(stat.avgEngagement)}, peringkat ${stat.rank}`
                      : 'belum ada data'
                  }`}
                  className="w-full h-full flex flex-col justify-end items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-sm cursor-pointer"
                >
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t-sm transition-colors duration-150 ${
                      !stat
                        ? 'bg-slate-100 group-hover:bg-slate-200'
                        : isTop3
                        ? isSelected
                          ? 'bg-blue-800 ring-2 ring-blue-300'
                          : 'bg-blue-700 group-hover:bg-blue-800'
                        : isSelected
                        ? 'bg-slate-700 ring-2 ring-slate-300'
                        : 'bg-slate-300 group-hover:bg-slate-400'
                    }`}
                  />
                </button>
                <span
                  className={`mt-2 text-[11px] font-mono tabular-nums ${
                    isSelected
                      ? 'font-semibold text-blue-700'
                      : isTop3
                      ? 'font-medium text-slate-800'
                      : 'text-slate-400'
                  }`}
                >
                  {String(hour).padStart(2, '0')}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
