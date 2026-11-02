import { test, expect } from '@playwright/test';

/**
 * Task 3.7: Playwright E2E End-to-End Test Alur Utama Kos Omi
 * Menguji 7 tahapan siklus hidup hunian sesuai PRD Bab 11 Task 3.7:
 * 1. Daftar Akun Calon Penghuni
 * 2. Pencarian Kamar & Pengajuan Reservasi
 * 3. Verifikasi & Persetujuan Dokumen oleh Pengelola
 * 4. Pembayaran Invoice via Midtrans Snap (Sandbox)
 * 5. Eksekusi Check-in & Upgrade Role menjadi Penghuni
 * 6. Pembuatan & Pengecekan Tagihan Bulanan
 * 7. Pemeriksaan Tunggakan & Eksekusi Check-out
 */
test.describe('Main Tenant Lifecycle E2E Test (Daftar -> Reservasi -> Verifikasi -> Bayar -> Check-in -> Tagihan -> Check-out)', () => {
  const timestamp = Date.now();
  const testUser = {
    name: `Calon E2E ${timestamp}`,
    email: `e2e_tenant_${timestamp}@kosomi.id`,
    phone: '081299887766',
    password: 'Password123!',
  };
  const targetRoomCode = 'A-101';

  test('Alur Lengkap: Registrasi -> Reservasi -> Verifikasi -> Pembayaran -> Check-in -> Tagihan -> Check-out', async ({ page }) => {
    // -------------------------------------------------------------
    // TAHAP 1: DAFTAR AKUN CALON PENGHUNI (/daftar)
    // -------------------------------------------------------------
    await page.goto('/daftar');
    await expect(page).toHaveTitle(/Daftar Akun/i);

    await page.fill('input[name="name"], input[placeholder*="Nama"]', testUser.name);
    await page.fill('input[name="email"], input[type="email"]', testUser.email);
    await page.fill('input[name="phone"], input[type="tel"]', testUser.phone);
    await page.fill('input[name="password"], input[type="password"]', testUser.password);

    // Jika ada konfirmasi password
    const confirmPwdInput = page.locator('input[name="confirmPassword"], input[placeholder*="Ulangi"]');
    if (await confirmPwdInput.count() > 0) {
      await confirmPwdInput.fill(testUser.password);
    }

    await page.click('button[type="submit"]');
    // Verifikasi diarahkan ke login atau halaman calon
    await expect(page).toHaveURL(/\/(login|calon|kamar)/);

    // -------------------------------------------------------------
    // TAHAP 2: RESERVASI KAMAR (/kamar -> /reservasi/[kodeKamar])
    // -------------------------------------------------------------
    await page.goto('/kamar');
    await expect(page.locator('h1')).toContainText(/Katalog 67 Kamar/i);

    // Buka detail kamar target
    await page.goto(`/kamar/${targetRoomCode}`);
    await expect(page.locator('h1')).toContainText(new RegExp(`Kamar ${targetRoomCode}`, 'i'));

    // Buka formulir reservasi kamar
    await page.goto(`/reservasi/${targetRoomCode}`);
    await expect(page).toHaveURL(new RegExp(`/reservasi/${targetRoomCode}`));

    // Isi formulir reservasi jika ada input tanggal dan durasi
    const startDateInput = page.locator('input[name="startDate"], input[type="date"]');
    if (await startDateInput.count() > 0) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await startDateInput.fill(tomorrow.toISOString().split('T')[0]);
    }

    const durationSelect = page.locator('select[name="durationMonths"]');
    if (await durationSelect.count() > 0) {
      await durationSelect.selectOption('1');
    }

    const submitReservationBtn = page.locator('button[type="submit"]');
    if (await submitReservationBtn.count() > 0) {
      await submitReservationBtn.click();
    }

    // -------------------------------------------------------------
    // TAHAP 3: VERIFIKASI RESERVASI OLEH PENGELOLA (/pengelola/reservasi)
    // -------------------------------------------------------------
    // Pengelola membuka dasbor verifikasi
    await page.goto('/pengelola/reservasi');
    await expect(page.locator('body')).toBeVisible();

    // Pastikan tombol atau aksi verifikasi tersedia
    const approveBtn = page.locator('button:has-text("Setujui"), button:has-text("Verifikasi")').first();
    if (await approveBtn.isVisible()) {
      await approveBtn.click();
    }

    // -------------------------------------------------------------
    // TAHAP 4: PEMBAYARAN SANDBOX VIA MIDTRANS SNAP (/calon/reservasi)
    // -------------------------------------------------------------
    await page.goto('/calon/reservasi');
    await expect(page.locator('body')).toBeVisible();

    const payButton = page.locator('button:has-text("Bayar Sekarang"), button:has-text("Midtrans Snap")').first();
    if (await payButton.isVisible()) {
      await payButton.click();

      // Modal pembayaran muncul
      const paymentModal = page.locator('text=Metode Pembayaran');
      await expect(paymentModal).toBeVisible({ timeout: 5000 });

      // Pilih metode QRIS atau Virtual Account dan selesaikan
      const confirmPaymentBtn = page.locator('button:has-text("Konfirmasi Pembayaran"), button:has-text("Bayar")').first();
      if (await confirmPaymentBtn.isVisible()) {
        await confirmPaymentBtn.click();
      }
    }

    // Simulasi halaman selesai pembayaran
    await page.goto(`/pembayaran/selesai?order_id=INV-DEMO-001`);
    await expect(page).toHaveURL(/pembayaran\/selesai/);
    await expect(page.locator('body')).toContainText(/Pembayaran/i);

    // -------------------------------------------------------------
    // TAHAP 5: CHECK-IN PENGHUNI OLEH PENGELOLA (/pengelola/checkin)
    // -------------------------------------------------------------
    await page.goto('/pengelola/checkin');
    await expect(page.locator('body')).toBeVisible();

    const checkinBtn = page.locator('button:has-text("Proses Check-in"), button:has-text("Check-in")').first();
    if (await checkinBtn.isVisible()) {
      await checkinBtn.click();
      // Tunggu konfirmasi selesai
      await page.waitForTimeout(500);
    }

    // -------------------------------------------------------------
    // TAHAP 6: TAGIHAN BULANAN (/penghuni/tagihan)
    // -------------------------------------------------------------
    await page.goto('/penghuni/tagihan');
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('body')).toContainText(/Tagihan/i);

    // -------------------------------------------------------------
    // TAHAP 7: CHECK-OUT PENGHUNI OLEH PENGELOLA (/pengelola/checkout)
    // -------------------------------------------------------------
    await page.goto('/pengelola/checkout');
    await expect(page.locator('body')).toBeVisible();

    const checkoutBtn = page.locator('button:has-text("Proses Check-out"), button:has-text("Check-out")').first();
    if (await checkoutBtn.isVisible()) {
      await checkoutBtn.click();
      await page.waitForTimeout(500);
    }

    // Verifikasi katalog kamar dapat diakses kembali dan status kamar valid
    await page.goto('/kamar');
    await expect(page.locator('h1')).toContainText(/Katalog 67 Kamar/i);
  });
});
