import React from 'react';
import { ExternalLink, X } from 'lucide-react';
import { FlowStepId } from '../types/scheduler';

interface FlowchartModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeStep: FlowStepId;
  hasConflict: boolean;
}

const STEPS: { id: FlowStepId; label: string; detail: string }[] = [
  {
    id: 'input-engagement',
    label: '1. Masukkan Data Engagement Konten',
    detail: 'Input jam posting (00:00–23:00), jumlah like, komentar, dan share dari riwayat publikasi humas.',
  },
  {
    id: 'group-average',
    label: '2. Kelompokkan Data & Hitung Rata-Rata Tiap Jam',
    detail: 'Data dikelompokkan berdasarkan jam posting, lalu dihitung rata-rata (Like + Komentar + Share) / jumlah posting.',
  },
  {
    id: 'top-3',
    label: '3. Pilih 3 Jam dengan Engagement Tertinggi',
    detail: 'Mengurutkan jam berdasarkan rata-rata engagement tertinggi dan menampilkan Top 3 Jam Terbaik.',
  },
  {
    id: 'input-content',
    label: '4. Masukkan Konten yang Akan Diposting',
    detail: 'Admin mengisi judul, narasi/caption, platform media sosial, tanggal, serta jam posting terpilih.',
  },
  {
    id: 'conflict-check',
    label: '5. Cek: Jam Terpilih Bentrok dengan Jadwal Lain?',
    detail: 'Jika Ya (bentrok), tampilkan peringatan dan opsi geser ke jam terbaik berikutnya (loop cek ulang). Jika Tidak, lanjut simpan.',
  },
  {
    id: 'save-display',
    label: '6. Simpan & Tampilkan Jadwal Posting Optimal',
    detail: 'Jadwal tersimpan secara persisten dan ditampilkan pada tabel serta linimasa jadwal posting optimal.',
  },
];

export const FlowchartModal: React.FC<FlowchartModalProps> = ({
  isOpen,
  onClose,
  activeStep,
  hasConflict,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="flowchart-modal-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2
              id="flowchart-modal-title"
              className="text-lg font-semibold text-slate-900"
            >
              Alur Algoritma Penjadwalan Konten Optimal
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Referensi flowchart oleh Yoseva Chelsy, Rafa Zidan, dan Zidane Herlino
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup dialog flowchart"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {STEPS.map((step) => {
            const isCurrent = step.id === activeStep;
            const isConflictHighlight =
              step.id === 'conflict-check' && hasConflict;

            return (
              <div
                key={step.id}
                className={`p-4 rounded-lg border transition-colors ${
                  isConflictHighlight
                    ? 'border-amber-300 bg-amber-50/70'
                    : isCurrent
                    ? 'border-blue-600 bg-blue-50/50'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-slate-900">
                    {step.label}
                  </div>
                  {isConflictHighlight ? (
                    <span className="text-xs font-medium text-amber-800">
                      Cabang Ya · Bentrok Terdeteksi
                    </span>
                  ) : isCurrent ? (
                    <span className="text-xs font-medium text-blue-700">
                      Tahap Aktif
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {step.detail}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <a
            href="/assets/aistudio/Flowchart_Yoseva_Rafa_Zidane.drawio_dc045058.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800 hover:underline"
          >
            <span>Buka Dokumen Flowchart PDF</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
