import React from 'react';
import { Metadata } from 'next';
import { AdminNav } from '@/components/admin/AdminNav';
import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient';
import {
  fetchAdminUsersAction,
  fetchAuditLogsAction,
  fetchNotificationLogsAction,
} from '@/actions/admin';
import { fetchRoomStatsAction } from '@/actions/rooms';
import { fetchFinanceDashboardStatsAction } from '@/actions/finance';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dasbor Administrator Utama | Kos Omi',
  description: 'Pusat kendali master data 67 kamar, manajemen staf, konfigurasi sistem, dan log audit Kos Omi.',
};

export default async function AdminDashboardPage() {
  const [users, auditLogs, notifLogs, roomStats, financeStats] = await Promise.all([
    fetchAdminUsersAction(),
    fetchAuditLogsAction(),
    fetchNotificationLogsAction(),
    fetchRoomStatsAction(),
    fetchFinanceDashboardStatsAction(),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-16">
      <AdminNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <AdminDashboardClient
          userCount={users.length}
          auditCount={auditLogs.length}
          notifCount={notifLogs.length}
          occupiedCount={roomStats.occupied}
          bookedCount={roomStats.booked}
          monthlyIncome={financeStats.currentMonthIncome}
        />
      </main>
    </div>
  );
}
