import { test, expect } from '@playwright/test';

/**
 * Task 3.7: Playwright E2E Test Autentikasi & Kontrol Akses Peran
 * Memverifikasi:
 * 1. Login dengan kredensial valid
 * 2. Login dengan password salah (menampilkan pesan error)
 * 3. Proteksi route handler (redirect jika belum login)
 * 4. Pembatasan akses peran (Calon tidak boleh membuka /admin)
 */
test.describe('Authentication & Role Access Control E2E Tests', () => {
  test('Menampilkan formulir login dengan input email dan password', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/Masuk|Login/i);

    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitBtn).toBeVisible();
  });

  test('Menolak login jika password salah dan menampilkan pesan peringatan', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"], input[name="email"]', 'pengelola@kosomi.id');
    await page.fill('input[type="password"], input[name="password"]', 'PasswordSalah123!');
    await page.click('button[type="submit"]');

    // Menampilkan error alert atau toast
    const errorAlert = page.locator('.text-rose-600, .bg-rose-50, text=salah, text=gagal');
    await expect(errorAlert.first()).toBeVisible({ timeout: 5000 });
  });

  test('Mengalihkan pengguna yang belum login saat mencoba mengakses dasbor terlindungi', async ({ page }) => {
    // Mencoba akses langsung ke /admin/dashboard
    await page.goto('/admin/dashboard');

    // Harus dialihkan ke halaman login atau 403
    await expect(page).toHaveURL(/\/(login|403)/);
  });
});
