import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GitBranch } from 'lucide-react';
import { EngagementPanel } from './components/EngagementPanel';
import { FlowchartModal } from './components/FlowchartModal';
import { HourlyChart } from './components/HourlyChart';
import { ScheduleComposer } from './components/ScheduleComposer';
import { ScheduleListPanel } from './components/ScheduleListPanel';
import { TopHoursPanel } from './components/TopHoursPanel';
import {
  createInitialScheduledPosts,
  getTodayIsoDate,
  SAMPLE_ENGAGEMENT_RECORDS,
} from './data/sampleData';
import {
  EngagementRecord,
  FlowStepId,
  ScheduledPost,
} from './types/scheduler';
import {
  checkScheduleConflict,
  formatHour,
  formatNumber,
  getTop3Hours,
  groupAndCalculateHourlyStats,
} from './utils/schedulerAlgorithm';

const ENGAGEMENT_STORAGE_KEY = 'jadwalhumas_engagement_v1';
const SCHEDULE_STORAGE_KEY = 'jadwalhumas_schedules_v1';

function loadInitialEngagement(): EngagementRecord[] {
  try {
    const raw = localStorage.getItem(ENGAGEMENT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Fallback to sample data if localStorage is unavailable or malformed
  }
  return SAMPLE_ENGAGEMENT_RECORDS;
}

function loadInitialSchedules(): ScheduledPost[] {
  try {
    const raw = localStorage.getItem(SCHEDULE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Fallback to sample schedules
  }
  return createInitialScheduledPosts();
}

export default function App() {
  const [engagementRecords, setEngagementRecords] = useState<
    EngagementRecord[]
  >(loadInitialEngagement);
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>(
    loadInitialSchedules
  );

  const [targetDate, setTargetDate] = useState<string>(getTodayIsoDate);
  const [selectedHour, setSelectedHour] = useState<number>(19);
  const [isFlowchartOpen, setIsFlowchartOpen] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<FlowStepId>('top-3');

  const engagementRef = useRef<HTMLElement | null>(null);
  const composerRef = useRef<HTMLElement | null>(null);
  const scheduleListRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(
        ENGAGEMENT_STORAGE_KEY,
        JSON.stringify(engagementRecords)
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [engagementRecords]);

  useEffect(() => {
    try {
      localStorage.setItem(
        SCHEDULE_STORAGE_KEY,
        JSON.stringify(scheduledPosts)
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [scheduledPosts]);

  // Langkah 2 & 3 Flowchart: Kelompokkan data & hitung rata-rata tiap jam
  const hourlyStats = useMemo(
    () => groupAndCalculateHourlyStats(engagementRecords),
    [engagementRecords]
  );

  // Langkah 4 Flowchart: Pilih 3 jam dengan engagement tertinggi
  const top3Hours = useMemo(() => getTop3Hours(hourlyStats), [hourlyStats]);

  // Keep selectedHour aligned to Top #1 when dataset changes from empty to populated
  useEffect(() => {
    if (top3Hours.length > 0 && !hourlyStats.some((s) => s.hour === selectedHour)) {
      setSelectedHour(top3Hours[0].hour);
    }
  }, [top3Hours, hourlyStats, selectedHour]);

  const activeConflict = useMemo(
    () => checkScheduleConflict(scheduledPosts, targetDate, selectedHour),
    [scheduledPosts, targetDate, selectedHour]
  );

  const scrollToSection = (
    ref: React.RefObject<HTMLElement | null>,
    step: FlowStepId
  ) => {
    setActiveStep(step);
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSelectHourForSchedule = (hour: number) => {
    setSelectedHour(hour);
    scrollToSection(composerRef, activeConflict ? 'conflict-check' : 'input-content');
  };

  const handleAddEngagement = (record: Omit<EngagementRecord, 'id'>) => {
    const newRecord: EngagementRecord = {
      ...record,
      id: `eng-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    };
    setEngagementRecords((prev) => [newRecord, ...prev]);
    setActiveStep('group-average');
  };

  const handleDeleteEngagement = (id: string) => {
    setEngagementRecords((prev) => prev.filter((item) => item.id !== id));
  };

  const handleLoadSampleData = () => {
    setEngagementRecords(SAMPLE_ENGAGEMENT_RECORDS);
    setActiveStep('top-3');
  };

  const handleClearAllEngagement = () => {
    setEngagementRecords([]);
    setActiveStep('input-engagement');
  };

  const handleSaveScheduledPost = (
    postData: Omit<ScheduledPost, 'id' | 'createdAt'>
  ) => {
    const newPost: ScheduledPost = {
      ...postData,
      id: `sched-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    setScheduledPosts((prev) => [...prev, newPost]);
    setActiveStep('save-display');
  };

  const handleDeleteScheduledPost = (id: string) => {
    setScheduledPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const bestHour = top3Hours[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#ringkasan"
            onClick={() => setActiveStep('top-3')}
            className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            JadwalHumas
          </a>

          {/* Zone 2: 4 single-line nav links */}
          <nav
            className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
            aria-label="Navigasi utama"
          >
            <a
              href="#ringkasan"
              onClick={() => setActiveStep('top-3')}
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Ringkasan
            </a>
            <a
              href="#engagement"
              onClick={() => setActiveStep('input-engagement')}
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Data Engagement
            </a>
            <a
              href="#penjadwalan"
              onClick={() => setActiveStep('input-content')}
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Buat Jadwal
            </a>
            <a
              href="#jadwal-optimal"
              onClick={() => setActiveStep('save-display')}
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Jadwal Optimal
            </a>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={() => scrollToSection(composerRef, 'input-content')}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Buat Jadwal Baru
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Hero / Workspace Header + Workflow Strip */}
        <section id="ringkasan" className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="text-xs font-medium text-blue-700">
                Meja Kerja Admin Media Sosial Humas
              </div>
              <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
                Penjadwalan Konten Optimal Berbasis Rata-Rata Engagement
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
                Kelompokkan riwayat performa publikasi per jam, identifikasi 3 jam posting terbaik, dan hindari bentrok antar jadwal secara otomatis.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsFlowchartOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                <GitBranch className="w-4 h-4 text-blue-700" />
                <span>Lihat Alur Flowchart</span>
              </button>
            </div>
          </div>

          {/* 4-Column Summary Strip (flat single-elevation grid) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 bg-white border border-slate-200 rounded-xl divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
            <div className="p-4 sm:p-5">
              <div className="text-xs text-slate-500">Total Data Engagement</div>
              <div className="mt-1 text-2xl font-semibold font-mono tabular-nums text-slate-900">
                {engagementRecords.length}
              </div>
              <div className="mt-0.5 text-xs text-slate-500">
                sampel publikasi dianalisis
              </div>
            </div>

            <div className="p-4 sm:p-5">
              <div className="text-xs text-slate-500">Slot Jam Terkelompok</div>
              <div className="mt-1 text-2xl font-semibold font-mono tabular-nums text-slate-900">
                {hourlyStats.length}
              </div>
              <div className="mt-0.5 text-xs text-slate-500">
                dari 24 jam operasional
              </div>
            </div>

            <div className="p-4 sm:p-5">
              <div className="text-xs text-slate-500">Jam Terbaik Peringkat #1</div>
              <div className="mt-1 text-2xl font-semibold font-mono tabular-nums text-blue-700">
                {bestHour ? formatHour(bestHour.hour) : '—'}
              </div>
              <div className="mt-0.5 text-xs text-slate-500 tabular-nums">
                {bestHour
                  ? `rata-rata ${formatNumber(bestHour.avgEngagement)} engagement`
                  : 'belum ada data'}
              </div>
            </div>

            <div className="p-4 sm:p-5">
              <div className="text-xs text-slate-500">Jadwal Optimal Tersimpan</div>
              <div className="mt-1 text-2xl font-semibold font-mono tabular-nums text-slate-900">
                {scheduledPosts.length}
              </div>
              <div className="mt-0.5 text-xs text-slate-500">
                bebas bentrok slot
              </div>
            </div>
          </div>

          {/* Top 3 Jam Terbaik */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  01. Rekomendasi 3 Jam Terbaik
                </h2>
                <p className="text-sm text-slate-500">
                  Tiga jam posting dengan nilai rata-rata engagement (Like + Komentar + Share) tertinggi.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                Tanggal acuan: {targetDate}
              </span>
            </div>

            <TopHoursPanel
              top3Hours={top3Hours}
              scheduledPosts={scheduledPosts}
              targetDate={targetDate}
              selectedHour={selectedHour}
              onSelectHourForSchedule={handleSelectHourForSchedule}
              onGoToEngagementInput={() =>
                scrollToSection(engagementRef, 'input-engagement')
              }
            />
          </div>

          {/* 24-Hour Distribution Chart */}
          <HourlyChart
            hourlyStats={hourlyStats}
            selectedHour={selectedHour}
            onSelectHour={handleSelectHourForSchedule}
          />
        </section>

        {/* Section 2: Input Engagement & Hourly Grouping */}
        <section
          id="engagement"
          ref={engagementRef}
          className="space-y-4 scroll-mt-20"
        >
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              02. Data Engagement & Pengelompokan Per Jam
            </h2>
            <p className="text-sm text-slate-500">
              Masukkan data jam posting, like, komentar, dan share untuk memperbarui peringkat rata-rata engagement tiap jam.
            </p>
          </div>

          <EngagementPanel
            records={engagementRecords}
            hourlyStats={hourlyStats}
            onAddRecord={handleAddEngagement}
            onDeleteRecord={handleDeleteEngagement}
            onLoadSampleData={handleLoadSampleData}
            onClearAllRecords={handleClearAllEngagement}
            onSelectHourForSchedule={handleSelectHourForSchedule}
          />
        </section>

        {/* Section 3: Content Input & Conflict Check Loop */}
        <section
          id="penjadwalan"
          ref={composerRef}
          className="space-y-4 scroll-mt-20"
        >
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              03. Penjadwalan Konten & Cek Bentrok
            </h2>
            <p className="text-sm text-slate-500">
              Masukkan konten yang akan diposting. Jika jam terpilih bentrok dengan jadwal lain, gunakan opsi geser ke jam terbaik berikutnya.
            </p>
          </div>

          <ScheduleComposer
            hourlyStats={hourlyStats}
            top3Hours={top3Hours}
            scheduledPosts={scheduledPosts}
            targetDate={targetDate}
            onChangeTargetDate={setTargetDate}
            selectedHour={selectedHour}
            onChangeSelectedHour={setSelectedHour}
            onSavePost={handleSaveScheduledPost}
          />
        </section>

        {/* Section 4: Optimal Schedule Output */}
        <section
          id="jadwal-optimal"
          ref={scheduleListRef}
          className="space-y-4 scroll-mt-20"
        >
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              04. Daftar & Linimasa Jadwal Optimal
            </h2>
            <p className="text-sm text-slate-500">
              Seluruh jadwal publikasi humas yang telah lolos validasi tanpa bentrok dan siap diekspor.
            </p>
          </div>

          <ScheduleListPanel
            scheduledPosts={scheduledPosts}
            hourlyStats={hourlyStats}
            filterDate={targetDate}
            onChangeFilterDate={setTargetDate}
            onDeletePost={handleDeleteScheduledPost}
            onFocusComposer={() =>
              scrollToSection(composerRef, 'input-content')
            }
          />
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            <span className="font-semibold text-slate-800">JadwalHumas</span>
            <span className="mx-2" aria-hidden="true">
              ·
            </span>
            <span>
              Algoritma Penjadwalan Konten Optimal Media Sosial Humas (Yoseva Chelsy, Rafa Zidan, Zidane Herlino)
            </span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={() => setIsFlowchartOpen(true)}
              className="hover:text-slate-900 hover:underline cursor-pointer"
            >
              Alur Algoritma
            </button>
            <a
              href="/assets/aistudio/Flowchart_Yoseva_Rafa_Zidane.drawio_dc045058.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 hover:underline"
            >
              Flowchart PDF
            </a>
          </div>
        </div>
      </footer>

      <FlowchartModal
        isOpen={isFlowchartOpen}
        onClose={() => setIsFlowchartOpen(false)}
        activeStep={activeStep}
        hasConflict={Boolean(activeConflict)}
      />
    </div>
  );
}
