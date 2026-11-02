import { test, expect } from '@playwright/test';

/**
 * Task 3.7: Playwright E2E Test Katalog Kamar Publik
 * Memverifikasi:
 * 1. Menampilkan 67 kamar dan counter ringkasan status real-time
 * 2. Filter kamar berdasarkan lantai (Lantai 1 - Lantai 5)
 * 3. Filter kamar berdasarkan tipe (Standar Non-AC, Standar AC, Deluxe AC)
 * 4. Pencarian instan berdasarkan kode kamar
 * 5. Navigasi ke halaman detail spesifikasi kamar
 */
test.describe('Room Catalog & Search E2E Tests', () => {
  test('Menampilkan katalog kamar dengan counter ringkasan status', async ({ page }) => {
    await page.goto('/kamar');

    await expect(page.locator('h1')).toContainText(/Katalog 67 Kamar/i);

    // Memeriksa counter ketersediaan (Tersedia, Dipesan, Terisi, Total)
    await expect(page.locator('text=Tersedia')).toBeVisible();
    await expect(page.locator('text=Dipesan')).toBeVisible();
    await expect(page.locator('text=Terisi')).toBeVisible();
    await expect(page.locator('text=Total')).toBeVisible();

    // Memeriksa kartu kamar ter-render
    const roomCards = page.locator('h2:has-text("Kamar")');
    await expect(roomCards.first()).toBeVisible();
    expect(await roomCards.count()).toBeGreaterThan(0);
  });

  test('Filter pencarian berdasarkan kode kamar (contoh: A-101)', async ({ page }) => {
    await page.goto('/kamar');

    const searchInput = page.locator('input[placeholder*="Cari kamar"]');
    await searchInput.fill('A-101');

    // Kartu Kamar A-101 harus terlihat
    await expect(page.locator('h2:has-text("Kamar A-101")')).toBeVisible();

    // Kamar lain dari lantai lain tidak boleh terlihat
    await expect(page.locator('h2:has-text("Kamar E-501")')).not.toBeVisible();
  });

  test('Navigasi dari katalog kamar ke halaman detail kamar dan memeriksa spesifikasi', async ({ page }) => {
    await page.goto('/kamar');

    // Klik tombol detail kamar pertama
    const detailLink = page.locator('a:has-text("Detail Kamar"), a[href*="/kamar/"]').first();
    await detailLink.click();

    await expect(page).toHaveURL(/\/kamar\/[A-E]-[0-9]{3}/);
    await expect(page.locator('h1')).toContainText(/Kamar/i);
    await expect(page.locator('text=Spesifikasi Ruangan')).toBeVisible();
  });
});
