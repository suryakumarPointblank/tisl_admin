'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, UserCheck, Clock, XCircle } from 'lucide-react';
import { api } from '@/lib/api-config';

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">{value ?? '—'}</p>
        </div>
        <span className={`rounded-lg p-2 ${color}`}>
          <Icon size={20} />
        </span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin', 'user-stats'],
    queryFn: async () => {
      const response = await api.adminUsers.userAdminControllerStatsV1();
      return response.body;
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>

      {error && (
        <p className="text-sm text-red-600">Failed to load stats: {error.message}</p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Total Users"
          value={isLoading ? '…' : stats?.total}
          icon={Users}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Active"
          value={isLoading ? '…' : stats?.active}
          icon={UserCheck}
          color="bg-green-50 text-green-600"
        />
        <StatCard
          label="Pending Approval"
          value={isLoading ? '…' : stats?.pending}
          icon={Clock}
          color="bg-yellow-50 text-yellow-600"
        />
        <StatCard
          label="Disabled"
          value={isLoading ? '…' : stats?.disabled}
          icon={XCircle}
          color="bg-red-50 text-red-600"
        />
      </div>
    </div>
  );
}
