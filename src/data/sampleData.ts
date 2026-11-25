import { EngagementRecord, ScheduledPost } from '../types/scheduler';

export function getTodayIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const SAMPLE_ENGAGEMENT_RECORDS: EngagementRecord[] = [
  {
    id: 'eng-1',
    hour: 19,
    likes: 410,
    comments: 48,
    shares: 72,
    platform: 'Instagram',
    topic: 'Siaran Pers Layanan Digital Terpadu',
  },
  {
    id: 'eng-2',
    hour: 19,
    likes: 385,
    comments: 54,
    shares: 65,
    platform: 'TikTok',
    topic: 'Reels Edukasi Alur Pengaduan Publik',
  },
  {
    id: 'eng-3',
    hour: 19,
    likes: 342,
    comments: 39,
    shares: 58,
    platform: 'Instagram',
    topic: 'Infografis Capaian Kinerja Triwulan',
  },
  {
    id: 'eng-4',
    hour: 12,
    likes: 320,
    comments: 42,
    shares: 51,
    platform: 'Instagram',
    topic: 'Update Jadwal Pelayanan Akhir Pekan',
  },
  {
    id: 'eng-5',
    hour: 12,
    likes: 295,
    comments: 36,
    shares: 44,
    platform: 'X / Twitter',
    topic: 'Utas Klarifikasi Hoaks Bantuan Sosial',
  },
  {
    id: 'eng-6',
    hour: 12,
    likes: 310,
    comments: 29,
    shares: 48,
    platform: 'Facebook',
    topic: 'Pengumuman Beasiswa Daerah',
  },
  {
    id: 'eng-7',
    hour: 8,
    likes: 268,
    comments: 25,
    shares: 42,
    platform: 'LinkedIn',
    topic: 'Agenda Pimpinan: Forum Tata Kelola Publik',
  },
  {
    id: 'eng-8',
    hour: 8,
    likes: 245,
    comments: 21,
    shares: 39,
    platform: 'Instagram',
    topic: 'Selamat Pagi & Info Cuaca Pelayanan',
  },
  {
    id: 'eng-9',
    hour: 16,
    likes: 215,
    comments: 19,
    shares: 33,
    platform: 'Instagram',
    topic: 'Rekap Kegiatan Kunjungan Lapangan',
  },
  {
    id: 'eng-10',
    hour: 16,
    likes: 198,
    comments: 24,
    shares: 29,
    platform: 'X / Twitter',
    topic: 'Tautan Unduh Laporan Tahunan',
  },
  {
    id: 'eng-11',
    hour: 21,
    likes: 175,
    comments: 18,
    shares: 22,
    platform: 'TikTok',
    topic: 'Cuplikan Tanya Jawab Humas',
  },
  {
    id: 'eng-12',
    hour: 10,
    likes: 142,
    comments: 14,
    shares: 19,
    platform: 'Facebook',
    topic: 'Berita Kemitraan Komunitas Lokal',
  },
  {
    id: 'eng-13',
    hour: 14,
    likes: 118,
    comments: 11,
    shares: 15,
    platform: 'LinkedIn',
    topic: 'Publikasi Artikel Opini Pimpinan',
  },
];

export function createInitialScheduledPosts(): ScheduledPost[] {
  const today = getTodayIsoDate();
  return [
    {
      id: 'sched-1',
      title: 'Siaran Pers: Peresmian Posko Layanan Terpadu',
      caption:
        'Kabar baik bagi masyarakat! Mulai hari ini Posko Layanan Terpadu beroperasi lebih cepat dengan sistem antrean daring.',
      platform: 'Instagram',
      category: 'Siaran Pers',
      date: today,
      hour: 19,
      engagementRank: 1,
      expectedAvgEngagement: 491,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sched-2',
      title: 'Infografis Panduan Pengajuan Dokumen Daring',
      caption:
        'Simak 4 langkah mudah pengajuan dokumen resmi langsung dari rumah tanpa perlu antre di loket.',
      platform: 'X / Twitter',
      category: 'Layanan Publik',
      date: today,
      hour: 8,
      engagementRank: 3,
      expectedAvgEngagement: 320,
      createdAt: new Date().toISOString(),
    },
  ];
}
