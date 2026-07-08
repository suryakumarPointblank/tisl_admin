'use client';

import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/api-config';

const STATUS_STYLES = {
  REGISTERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  ATTENDED: 'bg-blue-100 text-blue-800',
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function WebinarRegistrationsPage() {
  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['admin', 'webinar-registrations'],
    queryFn: async () => {
      const res = await axiosInstance.get('/api/v1/admin/webinar-registrations');
      return res.data;
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Webinar Registrations</h1>
      </div>

      {error && <p className="text-sm text-red-600">Failed to load: {error.message}</p>}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Hospital</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Webinar</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Attend Pref</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Registered</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading…</td>
              </tr>
            )}
            {!isLoading && items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">No registrations yet</td>
              </tr>
            )}
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{item.name ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{item.email ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{item.hospital ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                  {item.webinar?.title ?? '—'}
                </td>
                <td className="px-4 py-3 text-gray-600">{item.attendancePreference ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[item.status] ?? 'bg-gray-100 text-gray-700'}`}>
                    {item.status ?? '—'}
                  </span>
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
