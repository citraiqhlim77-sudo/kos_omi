import { renderBaseEmailLayout } from './base';

export interface ReservationEmailData {
  userName: string;
  userEmail: string;
  reservationCode: string;
  roomCode: string;
  roomType?: string;
  checkInDate: string;
  durationMonths: number;
  monthlyPrice: number;
  depositAmount: number;
  totalInitialPayment: number;
  portalUrl?: string;
}

export interface ReservationApprovedEmailData extends ReservationEmailData {
  paymentDeadline: string; // contoh: 24 jam dari persetujuan
  snapRedirectUrl?: string;
  invoiceCode: string;
}

export interface ReservationRejectedEmailData {
  userName: string;
  reservationCode: string;
  roomCode: string;
  rejectionReason: string;
  portalUrl?: string;
}

export interface PaymentSuccessEmailData {
  userName: string;
  invoiceCode: string;
  orderId: string;
  roomCode: string;
  category: string;
  grossAmount: number;
  paymentType: string;
  settlementTime: string;
  portalUrl?: string;
}

export interface BillingReminderEmailData {
  userName: string;
  invoiceCode: string;
  roomCode: string;
  periodMonth: string;
  amount: number;
  dueDate: string;
  daysRemaining?: number;
  daysOverdue?: number;
  portalUrl?: string;
}

export interface CheckinEmailData {
  userName: string;
  roomCode: string;
  checkInDate: string;
  durationMonths: number;
  tenancyEndDate: string;
  meterNumber?: string;
  wifiSsid?: string;
  wifiPassword?: string;
  portalUrl?: string;
}

export interface CheckoutEmailData {
  userName: string;
  roomCode: string;
  checkOutDate: string;
  depositStatus: string;
  depositRefundAmount?: number;
  notes?: string;
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// 1. Template: Reservasi Dibuat (Menunggu Verifikasi KTP)
export function renderReservationCreatedEmail(data: ReservationEmailData): { subject: string; html: string } {
  const subject = `[Kos Omi] Pengajuan Reservasi Kamar ${data.roomCode} Berhasil Diterima (${data.reservationCode})`;

  const contentHtml = `
    <p>Terima kasih telah mengajukan reservasi kamar di <strong>Kos Omi Sungai Bangek, Padang</strong>. Berkas identitas KTP dan data Anda telah kami terima di sistem dan saat ini sedang dalam proses verifikasi oleh tim Pengelola kami.</p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin: 20px 0;">
      <table role="presentation" border="0" cellpadding="4" cellspacing="0" width="100%" style="font-size: 13px;">
        <tr>
          <td style="color: #64748b; width: 40%;">Kode Reservasi:</td>
          <td style="font-weight: 700; color: #0f172a; font-family: monospace;">${data.reservationCode}</td>
        </tr>
        <tr>
          <td style="color: #64748b;">Kamar Diajukan:</td>
          <td style="font-weight: 700; color: #0b57d0;">Kamar ${data.roomCode}</td>
        </tr>
        <tr>
          <td style="color: #64748b;">Rencana Masuk:</td>
          <td style="font-weight: 600; color: #0f172a;">${data.checkInDate}</td>
        </tr>
        <tr>
          <td style="color: #64748b;">Durasi Sewa:</td>
          <td style="font-weight: 600; color: #0f172a;">${data.durationMonths} Bulan</td>
        </tr>
        <tr>
          <td style="color: #64748b;">Estimasi Biaya Awal:</td>
          <td style="font-weight: 700; color: #0b57d0;">${formatRupiah(data.totalInitialPayment)} (Termasuk Deposit)</td>
        </tr>
      </table>
    </div>

    <p style="margin-bottom: 0;">Tim pengelola akan memeriksa kecocokan data Anda dalam waktu maksimal 1x24 jam kerja. Setelah disetujui, Anda akan menerima email lanjutan beserta instruksi pembayaran tagihan booking.</p>
  `;

  const html = renderBaseEmailLayout({
    title: 'Pengajuan Reservasi Kamar Diterima',
    previewText: `Reservasi Kamar ${data.roomCode} (${data.reservationCode}) sedang dalam tahap verifikasi berkas KTP.`,
    userName: data.userName,
    contentHtml,
    ctaButton: {
      label: 'Pantau Status Pengajuan',
      url: data.portalUrl || 'https://kosomi.id/calon/reservasi',
    },
    noteHtml: '<strong>SOP Verifikasi:</strong> Pastikan nomor WhatsApp yang Anda daftarkan aktif untuk mempermudah konfirmasi serah terima kunci kamar.',
  });

  return { subject, html };
}

// 2. Template: Reservasi Disetujui (Invoice Booking Terbit - 24 Jam)
export function renderReservationApprovedEmail(data: ReservationApprovedEmailData): { subject: string; html: string } {
  const subject = `[Kos Omi] Selamat! Reservasi Kamar ${data.roomCode} Disetujui - Selesaikan Pembayaran 24 Jam`;

  const contentHtml = `
    <p>Kabar gembira! Berkas KTP dan pengajuan reservasi Anda untuk <strong>Kamar ${data.roomCode}</strong> telah <strong>disetujui oleh pengelola</strong>. Kamar telah kami kunci sementara (status: <strong>DIPESAN</strong>).</p>

    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 18px 20px; margin: 20px 0;">
      <table role="presentation" border="0" cellpadding="4" cellspacing="0" width="100%" style="font-size: 13px;">
        <tr>
          <td style="color: #166534; width: 40%;">Nomor Invoice:</td>
          <td style="font-weight: 700; color: #14532d; font-family: monospace;">${data.invoiceCode}</td>
        </tr>
        <tr>
          <td style="color: #166534;">Kamar:</td>
          <td style="font-weight: 700; color: #15803d;">Kamar ${data.roomCode}</td>
        </tr>
        <tr>
          <td style="color: #166534;">Sewa Bulan Pertama:</td>
          <td style="font-weight: 600; color: #14532d;">${formatRupiah(data.monthlyPrice)}</td>
        </tr>
        <tr>
          <td style="color: #166534;">Deposit Jaminan (Dikembalikan):</td>
          <td style="font-weight: 600; color: #14532d;">${formatRupiah(data.depositAmount)}</td>
        </tr>
        <tr style="border-top: 1px dashed #86efac;">
          <td style="color: #14532d; font-weight: 700; padding-top: 8px;">Total Tagihan Booking:</td>
          <td style="font-weight: 800; color: #0b57d0; font-size: 15px; padding-top: 8px;">${formatRupiah(data.totalInitialPayment)}</td>
        </tr>
        <tr>
          <td style="color: #b91c1c; font-weight: 700;">Batas Waktu Bayar:</td>
          <td style="font-weight: 800; color: #b91c1c;">${data.paymentDeadline} (24 Jam)</td>
        </tr>
      </table>
    </div>

    <p style="margin-bottom: 0;">Pembayaran dapat dilakukan dengan cepat dan aman via <strong>QRIS, Virtual Account BCA/Mandiri, atau GoPay</strong> melalui tautan Midtrans di bawah ini.</p>
  `;

  const html = renderBaseEmailLayout({
    title: 'Reservasi Disetujui — Selesaikan Pembayaran',
    previewText: `Reservasi Kamar ${data.roomCode} disetujui. Selesaikan pembayaran sebelum ${data.paymentDeadline}.`,
    userName: data.userName,
    contentHtml,
    ctaButton: {
      label: 'Bayar Sekarang via Midtrans',
      url: data.snapRedirectUrl || data.portalUrl || 'https://kosomi.id/calon/reservasi',
    },
    noteHtml: '<strong>PENTING:</strong> Sesuai SOP Kos Omi Bab 5.C, jika pembayaran tidak diselesaikan dalam 24 jam, kamar akan otomatis dibuka kembali untuk calon penghuni lainnya.',
  });

  return { subject, html };
}

// 3. Template: Reservasi Ditolak
export function renderReservationRejectedEmail(data: ReservationRejectedEmailData): { subject: string; html: string } {
  const subject = `[Kos Omi] Pemberitahuan Status Pengajuan Reservasi Kamar ${data.roomCode} (${data.reservationCode})`;

  const contentHtml = `
    <p>Terima kasih atas ketertarikan Anda untuk tinggal di Kos Omi Sungai Bangek. Setelah dilakukan pemeriksaan identitas dan ketentuan hunian, kami memberitahukan bahwa pengajuan reservasi untuk <strong>Kamar ${data.roomCode}</strong> belum dapat kami setujui saat ini.</p>

    <div style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; padding: 18px 20px; margin: 20px 0;">
      <div style="font-size: 12px; font-weight: 700; color: #9f1239; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
        Alasan Penolakan Resmi dari Pengelola:
      </div>
      <div style="font-size: 13px; color: #881337; line-height: 1.5; font-style: italic;">
        &ldquo;${data.rejectionReason}&rdquo;
      </div>
    </div>

    <p style="margin-bottom: 0;">Apabila Anda ingin mengajukan kembali dengan berkas foto KTP yang lebih jelas atau memilih tipe kamar lainnya, silakan kunjungi kembali portal Kos Omi.</p>
  `;

  const html = renderBaseEmailLayout({
    title: 'Status Pengajuan Reservasi Kamar',
    previewText: `Pemberitahuan pengajuan reservasi Kamar ${data.roomCode}: Belum dapat disetujui.`,
    userName: data.userName,
    contentHtml,
    ctaButton: {
      label: 'Lihat Kamar Lainnya di Katalog',
      url: data.portalUrl || 'https://kosomi.id/kamar',
    },
    noteHtml: 'Jika ada kekeliruan atau Anda membutuhkan klarifikasi lebih lanjut, silakan hubungi tim administrasi Kos Omi melalui WhatsApp resmi.',
  });

  return { subject, html };
}

// 4. Template: Pembayaran Lunas (Kuitansi Resmi)
export function renderPaymentSuccessEmail(data: PaymentSuccessEmailData): { subject: string; html: string } {
  const subject = `[Kos Omi] Kuitansi Pembayaran Lunas - Invoice ${data.invoiceCode}`;

  const contentHtml = `
    <p>Pembayaran Anda telah <strong>berhasil kami terima dan terverifikasi lunas</strong> melalui gateway pembayaran resmi Midtrans. Berikut adalah kuitansi digital transaksi Anda:</p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin: 20px 0;">
      <table role="presentation" border="0" cellpadding="4" cellspacing="0" width="100%" style="font-size: 13px;">
        <tr>
          <td style="color: #64748b; width: 40%;">Nomor Kuitansi / Invoice:</td>
          <td style="font-weight: 700; color: #0f172a; font-family: monospace;">${data.invoiceCode}</td>
        </tr>
        <tr>
          <td style="color: #64748b;">Order ID Gateway:</td>
          <td style="font-weight: 600; color: #334155; font-family: monospace;">${data.orderId}</td>
        </tr>
        <tr>
          <td style="color: #64748b;">Kamar:</td>
          <td style="font-weight: 700; color: #0b57d0;">Kamar ${data.roomCode}</td>
        </tr>
        <tr>
          <td style="color: #64748b;">Kategori:</td>
          <td style="font-weight: 600; color: #334155;">${data.category.replace('_', ' ')}</td>
        </tr>
        <tr>
          <td style="color: #64748b;">Metode Pembayaran:</td>
          <td style="font-weight: 600; color: #334155; text-transform: uppercase;">${data.paymentType}</td>
        </tr>
        <tr>
          <td style="color: #64748b;">Waktu Pelunasan:</td>
          <td style="font-weight: 600; color: #334155;">${data.settlementTime}</td>
        </tr>
        <tr style="border-top: 1px dashed #cbd5e1;">
          <td style="color: #0f172a; font-weight: 700; padding-top: 8px;">Total Lunas:</td>
          <td style="font-weight: 800; color: #16a34a; font-size: 16px; padding-top: 8px;">${formatRupiah(data.grossAmount)}</td>
        </tr>
      </table>
    </div>

    <p style="margin-bottom: 0;">Kuitansi resmi ini sah dan dapat diunduh dalam format PDF kapan saja melalui portal akun Anda.</p>
  `;

  const html = renderBaseEmailLayout({
    title: 'Pembayaran Lunas Terverifikasi',
    previewText: `Pembayaran ${data.invoiceCode} senilai ${formatRupiah(data.grossAmount)} berhasil dilunasi.`,
    userName: data.userName,
    contentHtml,
    ctaButton: {
      label: 'Buka Portal & Unduh Kuitansi PDF',
      url: data.portalUrl || 'https://kosomi.id/penghuni/tagihan',
    },
    noteHtml: 'Simpan email ini sebagai bukti transaksi resmi yang sah antara Anda dan manajemen Kos Omi Sungai Bangek, Padang.',
  });

  return { subject, html };
}

// 5. Template: Pengingat Tagihan H-3 (Jatuh Tempo Tanggal 5)
export function renderBillingReminderH3Email(data: BillingReminderEmailData): { subject: string; html: string } {
  const subject = `[Kos Omi] Pengingat Tagihan Sewa Kamar ${data.roomCode} (${data.periodMonth}) - Jatuh Tempo 3 Hari Lagi`;

  const contentHtml = `
    <p>Kami menginformasikan bahwa tagihan sewa bulanan Anda untuk <strong>Kamar ${data.roomCode}</strong> periode <strong>${data.periodMonth}</strong> akan jatuh tempo pada <strong>${data.dueDate} (3 hari lagi)</strong>.</p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin: 20px 0;">
      <table role="presentation" border="0" cellpadding="4" cellspacing="0" width="100%" style="font-size: 13px;">
        <tr>
          <td style="color: #64748b; width: 40%;">Nomor Tagihan:</td>
          <td style="font-weight: 700; color: #0f172a; font-family: monospace;">${data.invoiceCode}</td>
        </tr>
        <tr>
          <td style="color: #64748b;">Kamar:</td>
          <td style="font-weight: 700; color: #0b57d0;">Kamar ${data.roomCode}</td>
        </tr>
        <tr>
          <td style="color: #64748b;">Periode Sewa:</td>
          <td style="font-weight: 600; color: #334155;">${data.periodMonth}</td>
        </tr>
        <tr>
          <td style="color: #64748b;">Tanggal Jatuh Tempo:</td>
          <td style="font-weight: 700; color: #b45309;">${data.dueDate}</td>
        </tr>
        <tr style="border-top: 1px dashed #cbd5e1;">
          <td style="color: #0f172a; font-weight: 700; padding-top: 8px;">Nominal Tagihan:</td>
          <td style="font-weight: 800; color: #0b57d0; font-size: 16px; padding-top: 8px;">${formatRupiah(data.amount)}</td>
        </tr>
      </table>
    </div>

    <p style="margin-bottom: 0;">Lakukan pembayaran tepat waktu untuk kenyamanan fasilitas tempat tinggal Anda di Kos Omi Sungai Bangek, Padang.</p>
  `;

  const html = renderBaseEmailLayout({
    title: 'Pengingat Tagihan Sewa (H-3)',
    previewText: `Tagihan sewa Kamar ${data.roomCode} periode ${data.periodMonth} jatuh tempo pada ${data.dueDate}.`,
    userName: data.userName,
    contentHtml,
    ctaButton: {
      label: 'Bayar Tagihan Sekarang',
      url: data.portalUrl || 'https://kosomi.id/penghuni/tagihan',
    },
    noteHtml: 'Pembayaran dapat diselesaikan langsung melalui Virtual Account Bank atau QRIS pada portal penghuni.',
  });

  return { subject, html };
}

// 6. Template: Pengingat Tagihan H-0 (Jatuh Tempo Hari Ini)
export function renderBillingReminderH0Email(data: BillingReminderEmailData): { subject: string; html: string } {
  const subject = `[Kos Omi] PENTING: Tagihan Sewa Kamar ${data.roomCode} Jatuh Tempo Hari Ini (${data.dueDate})`;

  const contentHtml = `
    <p>Ini adalah pengingat bahwa tagihan sewa bulanan <strong>Kamar ${data.roomCode}</strong> periode <strong>${data.periodMonth}</strong> jatuh tempo pada <strong>HARI INI (${data.dueDate})</strong>.</p>

    <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 18px 20px; margin: 20px 0;">
      <table role="presentation" border="0" cellpadding="4" cellspacing="0" width="100%" style="font-size: 13px;">
        <tr>
          <td style="color: #92400e; width: 40%;">Nomor Tagihan:</td>
          <td style="font-weight: 700; color: #78350f; font-family: monospace;">${data.invoiceCode}</td>
        </tr>
        <tr>
          <td style="color: #92400e;">Kamar:</td>
          <td style="font-weight: 700; color: #b45309;">Kamar ${data.roomCode}</td>
        </tr>
        <tr>
          <td style="color: #92400e;">Status:</td>
          <td style="font-weight: 800; color: #b45309;">Jatuh Tempo Hari Ini</td>
        </tr>
        <tr style="border-top: 1px dashed #fcd34d;">
          <td style="color: #78350f; font-weight: 700; padding-top: 8px;">Total Wajib Dibayar:</td>
          <td style="font-weight: 800; color: #0b57d0; font-size: 16px; padding-top: 8px;">${formatRupiah(data.amount)}</td>
        </tr>
      </table>
    </div>

    <p style="margin-bottom: 0;">Silakan selesaikan pembayaran sebelum pukul 23:59 WIB malam ini untuk menghindari status keterlambatan pada akun sewa Anda.</p>
  `;

  const html = renderBaseEmailLayout({
    title: 'Tagihan Sewa Jatuh Tempo Hari Ini',
    previewText: `Pemberitahuan jatuh tempo hari ini: Tagihan Kamar ${data.roomCode} senilai ${formatRupiah(data.amount)}.`,
    userName: data.userName,
    contentHtml,
    ctaButton: {
      label: 'Bayar Langsung Sekarang',
      url: data.portalUrl || 'https://kosomi.id/penghuni/tagihan',
    },
    noteHtml: '<strong>Kenyamanan Anda:</strong> Sistem pelunasan terhubung langsung 24 jam dengan gateway perbankan sehingga status tagihan akan langsung lunas secara seketika.',
  });

  return { subject, html };
}

// 7. Template: Tagihan Terlambat (Status Overdue)
export function renderOverdueBillingEmail(data: BillingReminderEmailData): { subject: string; html: string } {
  const subject = `[Kos Omi] Peringatan: Tagihan Sewa Kamar ${data.roomCode} Telah Melewati Jatuh Tempo (${data.daysOverdue || 3} Hari Terlambat)`;

  const contentHtml = `
    <p>Kami memberitahukan bahwa tagihan sewa bulanan Anda untuk <strong>Kamar ${data.roomCode}</strong> telah <strong>melewati batas jatuh tempo (${data.dueDate})</strong> dan saat ini berstatus <strong style="color: #dc2626;">TERLAMBAT</strong>.</p>

    <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 18px 20px; margin: 20px 0;">
      <table role="presentation" border="0" cellpadding="4" cellspacing="0" width="100%" style="font-size: 13px;">
        <tr>
          <td style="color: #991b1b; width: 40%;">Nomor Tagihan:</td>
          <td style="font-weight: 700; color: #7f1d1d; font-family: monospace;">${data.invoiceCode}</td>
        </tr>
        <tr>
          <td style="color: #991b1b;">Kamar:</td>
          <td style="font-weight: 700; color: #dc2626;">Kamar ${data.roomCode}</td>
        </tr>
        <tr>
          <td style="color: #991b1b;">Keterlambatan:</td>
          <td style="font-weight: 800; color: #dc2626;">${data.daysOverdue || 3} Hari Lewat Jatuh Tempo</td>
        </tr>
        <tr style="border-top: 1px dashed #fca5a5;">
          <td style="color: #7f1d1d; font-weight: 700; padding-top: 8px;">Total Tunggakan:</td>
          <td style="font-weight: 800; color: #b91c1c; font-size: 16px; padding-top: 8px;">${formatRupiah(data.amount)}</td>
        </tr>
      </table>
    </div>

    <p style="margin-bottom: 0;">Mohon untuk segera menyelesaikan pembayaran Anda hari ini. Jika Anda menghadapi kendala finansial darurat, harap segera berkoordinasi langsung dengan Pengelola Kos Omi.</p>
  `;

  const html = renderBaseEmailLayout({
    title: 'Tagihan Sewa Melewati Jatuh Tempo',
    previewText: `Peringatan tagihan sewa Kamar ${data.roomCode} terlambat ${data.daysOverdue || 3} hari. Mohon segera lunasi.`,
    userName: data.userName,
    contentHtml,
    ctaButton: {
      label: 'Selesaikan Tagihan Tertunggak',
      url: data.portalUrl || 'https://kosomi.id/penghuni/tagihan',
    },
    noteHtml: '<strong>Ketertiban Hunian:</strong> Sesuai tata tertib Kos Omi Bab 5.E, keterlambatan pembayaran berkepanjangan tanpa konfirmasi dapat mengakibatkan peninjauan perpanjangan kontrak sewa.',
  });

  return { subject, html };
}

// 8. Template: Check-in Berhasil (Penyambutan Penghuni)
export function renderCheckinSuccessEmail(data: CheckinEmailData): { subject: string; html: string } {
  const subject = `[Kos Omi] Selamat Datang di Kos Omi! Check-in Kamar ${data.roomCode} Selesai`;

  const contentHtml = `
    <p>Selamat datang di <strong>Kos Omi Sungai Bangek, Padang</strong>! Proses check-in Anda telah selesai diproses oleh pengelola kos. Mulai hari ini, Anda resmi menjadi penghuni <strong>Kamar ${data.roomCode}</strong>.</p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin: 20px 0;">
      <table role="presentation" border="0" cellpadding="4" cellspacing="0" width="100%" style="font-size: 13px;">
        <tr>
          <td style="color: #64748b; width: 40%;">Kamar Resmi:</td>
          <td style="font-weight: 700; color: #0b57d0; font-size: 15px;">Kamar ${data.roomCode}</td>
        </tr>
        <tr>
          <td style="color: #64748b;">Tanggal Masuk (Check-in):</td>
          <td style="font-weight: 600; color: #0f172a;">${data.checkInDate}</td>
        </tr>
        <tr>
          <td style="color: #64748b;">Durasi Kontrak:</td>
          <td style="font-weight: 600; color: #0f172a;">${data.durationMonths} Bulan (Berakhir ${data.tenancyEndDate})</td>
        </tr>
        <tr>
          <td style="color: #64748b;">No. Meteran Listrik Mandiri:</td>
          <td style="font-weight: 700; color: #0f172a; font-family: monospace;">${data.meterNumber || '1423-8890-4101'}</td>
        </tr>
        <tr>
          <td style="color: #64748b;">Wi-Fi Gedung (100 Mbps):</td>
          <td style="font-weight: 600; color: #0f172a;">SSID: <strong>${data.wifiSsid || 'KOS_OMI_LT1'}</strong> / Pass: <code style="background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${data.wifiPassword || 'kosomisungaibangek2026'}</code></td>
        </tr>
      </table>
    </div>

    <p style="margin-bottom: 0;">Kartu akses gerbang RFID dan kunci fisik kamar telah diserahterimakan. Harap jaga kebersihan fasilitas bersama dan patuhi jam tenang gedung (22:00 – 06:00 WIB).</p>
  `;

  const html = renderBaseEmailLayout({
    title: 'Check-in Berhasil — Selamat Datang!',
    previewText: `Selamat datang di Kos Omi Sungai Bangek. Kamar ${data.roomCode} kini aktif sebagai tempat tinggal Anda.`,
    userName: data.userName,
    contentHtml,
    ctaButton: {
      label: 'Buka Dasbor Penghuni',
      url: data.portalUrl || 'https://kosomi.id/penghuni/dashboard',
    },
    noteHtml: '<strong>Fasilitas Gedung:</strong> Dapur bersama dan dispenser air minum RO gratis tersedia di lantai 1. Jangan ragu menghubungi pengelola jika ada kendala di kamar.',
  });

  return { subject, html };
}

// 9. Template: Check-out Berhasil (Pelepasan Sewa)
export function renderCheckoutSuccessEmail(data: CheckoutEmailData): { subject: string; html: string } {
  const subject = `[Kos Omi] Konfirmasi Check-out Selesai - Kamar ${data.roomCode}`;

  const contentHtml = `
    <p>Kami mengonfirmasi bahwa proses <strong>check-out</strong> untuk <strong>Kamar ${data.roomCode}</strong> telah selesai diproses oleh tim pengelola pada tanggal <strong>${data.checkOutDate}</strong>.</p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin: 20px 0;">
      <table role="presentation" border="0" cellpadding="4" cellspacing="0" width="100%" style="font-size: 13px;">
        <tr>
          <td style="color: #64748b; width: 40%;">Kamar yang Dikosongkan:</td>
          <td style="font-weight: 700; color: #0f172a;">Kamar ${data.roomCode}</td>
        </tr>
        <tr>
          <td style="color: #64748b;">Tanggal Resmi Check-out:</td>
          <td style="font-weight: 600; color: #0f172a;">${data.checkOutDate}</td>
        </tr>
        <tr>
          <td style="color: #64748b;">Status Deposit Jaminan:</td>
          <td style="font-weight: 700; color: #16a34a;">${data.depositStatus} ${data.depositRefundAmount ? `(${formatRupiah(data.depositRefundAmount)})` : ''}</td>
        </tr>
        ${
          data.notes
            ? `
        <tr>
          <td style="color: #64748b;">Catatan Pengelola:</td>
          <td style="font-weight: 600; color: #334155;">${data.notes}</td>
        </tr>
        `
            : ''
        }
      </table>
    </div>

    <p style="margin-bottom: 0;">Terima kasih banyak telah menjadi bagian dari keluarga besar Kos Omi Sungai Bangek, Padang. Kami mendoakan kelancaran aktivitas, studi, dan karier Anda ke depan!</p>
  `;

  const html = renderBaseEmailLayout({
    title: 'Konfirmasi Check-out Berhasil',
    previewText: `Proses check-out Kamar ${data.roomCode} telah selesai. Terima kasih telah tinggal di Kos Omi.`,
    userName: data.userName,
    contentHtml,
    noteHtml: 'Kuitansi dan seluruh riwayat sewa Anda tetap dapat diakses di portal Kos Omi untuk keperluan administrasi.',
  });

  return { subject, html };
}
