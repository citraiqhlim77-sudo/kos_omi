export interface FAQItem {
  id: string;
  category: 'reservasi' | 'pembayaran' | 'aturan';
  question: string;
  answer: string;
}

export const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'reservasi',
    question: 'Berapa harga sewa kamar dan kapasitas per kamar di Kos Omi?',
    answer: 'Tarif sewa kamar di Kos Omi adalah Rp 5.000.000 / semester per kamar untuk Lantai 1 maupun Lantai 2 dengan kapasitas maksimal 2 orang (boleh diisi 1 orang sendiri seharga Rp 5.000.000, atau berdua dengan biaya Rp 2.500.000 per orang), tanpa biaya deposit. Setiap kamar sudah dilengkapi Kasur, Lemari, dan Kamar Mandi Dalam.',
  },
  {
    id: 'faq-2',
    category: 'reservasi',
    question: 'Apa saja fasilitas yang tersedia di Kos Omi?',
    answer: 'Fasilitas lengkap Kos Omi meliputi: (1) Kasur & Lemari, (2) Kamar Mandi Dalam di setiap kamar, (3) Ruang Belajar Umum, (4) Dapur dan Area Cuci Umum, (5) Dilengkapi CCTV, (6) Wi-Fi, TV, & Kulkas, (7) Alat Olahraga, (8) Parkir Motor Dalam, serta (9) Keamanan 24 Jam.',
  },
  {
    id: 'faq-3',
    category: 'pembayaran',
    question: 'Metode pembayaran apa saja yang diterima di Kos Omi?',
    answer: 'Kami menerima pembayaran melalui DANA Resmi (082246424353), Transfer Bank / Virtual Account (BCA, BRI, BNI, Mandiri, Permata), QRIS, serta E-Wallet (GoPay & ShopeePay) melalui Midtrans. Batas waktu pembayaran adalah 1x24 jam setelah pengajuan reservasi disetujui oleh Pengelola.',
  },
  {
    id: 'faq-4',
    category: 'pembayaran',
    question: 'Bagaimana cara menghubungi Pemilik Kos Omi (Ibu Yulastri) jika ada pertanyaan?',
    answer: 'Anda dapat menghubungi Ibu Yulastri secara langsung melalui WhatsApp Utama di nomor 0813-7432-9562 (atau kontak cadangan 0813-7432-9562), maupun datang langsung ke lokasi Kos Omi di Jalan Ekora, Sungai Bangek, Padang (dekat Kampus III UIN Imam Bonjol Padang).',
  },
  {
    id: 'faq-5',
    category: 'aturan',
    question: 'Bagaimana prosedur jika penghuni sudah selesai masa sewa atau keluar dari kos?',
    answer: 'Penghuni yang sudah selesai masa sewa semesternya dapat melakukan check-out melalui Pengelola Kos. Setelah kamar dikosongkan dan kunci diserahterimakan, status kamar otomatis kembali Tersedia.',
  },
  {
    id: 'faq-6',
    category: 'aturan',
    question: 'Apakah tersedia area parkir dan keamanan 24 jam?',
    answer: 'Ya, Kos Omi dilengkapi area Parkir Motor Dalam yang aman, sistem pengawasan kamera CCTV di area strategis, serta Keamanan 24 Jam untuk menjamin kenyamanan seluruh penghuni.',
  },
];
