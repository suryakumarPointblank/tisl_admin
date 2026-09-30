'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/api-config';
import MutationError from '@/components/MutationError';

const STATUS_STYLES = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  SENT: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
};

const STATUS_OPTIONS = ['PENDING', 'SENT', 'FAILED'];

function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function SlideDeckRequestsPage() {
  const queryClient = useQueryClient();

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['admin', 'slide-deck-requests'],
    queryFn: async () => {
      const res = await axiosInstance.get('/api/v1/admin/slide-deck-requests');
      return res.data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) =>
      axiosInstance.patch(`/api/v1/admin/slide-deck-requests/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'slide-deck-requests'] }),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Slide Deck Requests</h1>
      </div>

      {error && <p className="text-sm text-red-600">Failed to load: {error.message}</p>}

      <MutationError errors={[updateStatus.error]} />
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Speciality</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Requested</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">Loading…</td>
              </tr>
            )}
            {!isLoading && items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">No requests yet</td>
              </tr>
            )}
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{[item.firstName, item.lastName].filter(Boolean).join(' ') || '-'}</td>
                <td className="px-4 py-3 text-gray-600">{item.email ?? '-'}</td>
                <td className="px-4 py-3 text-gray-600">{item.speciality ?? '-'}</td>
                <td className="px-4 py-3">
                  <select
                    value={item.status ?? ''}
                    onChange={(e) => updateStatus.mutate({ id: item.id, status: e.target.value })}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${STATUS_STYLES[item.status] ?? 'bg-gray-100 text-gray-700'}`}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {formatDate(item.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
