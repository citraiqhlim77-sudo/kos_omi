import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock Next.js cache revalidation & dispatch
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

import { generateMonthlyBills } from '@/lib/billing/generate';

/**
 * Task 3.7: Unit Test Perhitungan & Generator Tagihan Bulanan
 * Memverifikasi logika bisnis penagihan bulanan sesuai PRD Bab 5.E & Bab 11 Task 2.8:
 * 1. Format nomor invoice resmi: INV-[YYYYMM]-[5 digit urut]
 * 2. Pencegahan tagihan ganda melalui unique index: tenancy_id + period_month
 * 3. Pembuatan tagihan pada jendela H-7 jatuh tempo
 * 4. Penandaan status TERLAMBAT setelah lewat 3 hari dari jatuh tempo
 */
describe('Billing Calculation & Generator Logic', () => {
  beforeEach(() => {
    // Reset global billing state untuk isolasi test
    if (global.__kosOmiBillingState) {
      global.__kosOmiBillingState = {
        bills: [],
        lastGeneratedMonth: null,
      };
    }
  });

  it('harus menghasilkan nomor invoice dengan format INV-[YYYYMM]-[5 digit urut]', async () => {
    const result = await generateMonthlyBills({
      forcePeriod: '2026-06',
    });

    expect(result.success).toBe(true);
    expect(result.periodMonth).toBe('2026-06');
    expect(result.generatedCount).toBeGreaterThan(0);

    const firstInvoice = result.generatedInvoices[0];
    expect(firstInvoice.invoiceCode).toMatch(/^INV-202606-\d{5}$/);
    expect(firstInvoice.amount).toBeGreaterThan(0);
  });

  it('harus mencegah duplikasi invoice untuk tenancy dan periode bulan yang sama (idempotensi)', async () => {
    // Jalankan eksekusi pertama
    const run1 = await generateMonthlyBills({
      forcePeriod: '2026-07',
    });
    const firstCount = run1.generatedCount;
    expect(firstCount).toBeGreaterThan(0);

    // Jalankan eksekusi kedua untuk periode yang sama persis
    const run2 = await generateMonthlyBills({
      forcePeriod: '2026-07',
    });

    // Harus 0 invoice baru yang digenerate karena sudah ada (unique index: tenancy_id + period_month)
    expect(run2.generatedCount).toBe(0);
    expect(run2.skippedCount).toBe(firstCount);
  });

  it('harus menghitung tanggal jatuh tempo pada tanggal 5 setiap bulan (default dueDay: 5)', async () => {
    const result = await generateMonthlyBills({
      forcePeriod: '2026-08',
    });

    expect(result.success).toBe(true);
    for (const inv of result.generatedInvoices) {
      expect(inv.dueDate).toBe('2026-08-05');
    }
  });

  it('harus menandai tagihan BELUM_BAYAR menjadi TERLAMBAT setelah lewat 3 hari dari jatuh tempo', async () => {
    // 1. Generate tagihan untuk periode Mei 2026 (jatuh tempo 5 Mei 2026)
    await generateMonthlyBills({
      forcePeriod: '2026-05',
    });

    // 2. Simulasikan tanggal sekarang sudah tanggal 9 Mei 2026 (> 5 Mei + 3 hari = 8 Mei)
    const overdueCheckDate = new Date(2026, 4, 9); // 9 Mei 2026
    const overdueResult = await generateMonthlyBills({
      targetDate: overdueCheckDate,
      forcePeriod: '2026-05',
    });

    expect(overdueResult.markedOverdueCount).toBeGreaterThan(0);
    for (const overdueInv of overdueResult.overdueInvoices) {
      expect(overdueInv.daysOverdue).toBeGreaterThanOrEqual(4);
    }
  });

  it('tidak boleh menandai tagihan sebagai TERLAMBAT jika belum melewati batas toleransi 3 hari', async () => {
    // Generate tagihan periode September 2026 (jatuh tempo 5 September 2026)
    await generateMonthlyBills({
      forcePeriod: '2026-09',
    });

    // Cek pada tanggal 7 September 2026 (baru 2 hari setelah jatuh tempo, batas toleransi 3 hari)
    const gracePeriodDate = new Date(2026, 8, 7);
    const result = await generateMonthlyBills({
      targetDate: gracePeriodDate,
      forcePeriod: '2026-09',
    });

    expect(result.markedOverdueCount).toBe(0);
  });
});
