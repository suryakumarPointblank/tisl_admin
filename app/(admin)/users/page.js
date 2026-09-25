'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-config';
import MutationError from '@/components/MutationError';

const STATUS_LABELS = {
  ACTIVE: 'Active',
  PENDING: 'Pending',
  DISABLED: 'Disabled',
};

const STATUS_COLORS = {
  ACTIVE: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  DISABLED: 'bg-red-100 text-red-700',
};

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['admin', 'users', statusFilter],
    queryFn: async () => {
      const opts = statusFilter ? { status: statusFilter } : {};
      const response = await api.adminUsers.userAdminControllerFindAllV1(opts);
      return response.body;
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) =>
      api.adminUsers.userAdminControllerUpdateStatusV1(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Users</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="ACTIVE">Active</option>
          <option value="DISABLED">Disabled</option>
        </select>
      </div>

      {error && <p className="text-sm text-red-600">Failed to load users: {error.message}</p>}

      <MutationError errors={[updateStatus.error]} />
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Role</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Loading…
                </td>
              </tr>
            )}
            {!isLoading && users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No users found
                </td>
              </tr>
            )}
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </td>
                <td className="px-4 py-3 text-gray-600">{user.email}</td>
                <td className="px-4 py-3 text-gray-600">{user.role}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[user.status] ?? 'bg-gray-100 text-gray-600'}`}
                  >
                    {STATUS_LABELS[user.status] ?? user.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {user.status !== 'ACTIVE' && (
                      <button
                        onClick={() => updateStatus.mutate({ id: user.id, status: 'ACTIVE' })}
                        className="rounded px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-50"
                      >
                        Approve
                      </button>
                    )}
                    {user.status !== 'DISABLED' && (
                      <button
                        onClick={() => updateStatus.mutate({ id: user.id, status: 'DISABLED' })}
                        className="rounded px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                      >
                        Disable
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
