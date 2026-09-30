'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/api-config';

function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ContactInquiriesPage() {
  const [expandedId, setExpandedId] = useState(null);

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['admin', 'contact-inquiries'],
    queryFn: async () => {
      const res = await axiosInstance.get('/api/v1/admin/contact-inquiries');
      return res.data;
    },
  });

  function toggleRow(id) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Contact Inquiries</h1>
      </div>

      {error && <p className="text-sm text-red-600">Failed to load: {error.message}</p>}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Message</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Source</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Received</th>
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
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">No inquiries yet</td>
              </tr>
            )}
            {items.map((item) => (
              <>
                <tr
                  key={item.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleRow(item.id)}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{item.name ?? '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{item.email ?? '-'}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs">
                    {item.message
                      ? item.message.length > 80
                        ? item.message.slice(0, 80) + '…'
                        : item.message
                      : '-'}
                  </td>
                  <td className="px-4 py-3">
                    {item.source ? (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                        {item.source}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {formatDate(item.createdAt)}
                  </td>
                </tr>
                {expandedId === item.id && (
                  <tr key={`expand-${item.id}`}>
                    <td colSpan={5} className="bg-gray-50 px-6 py-4">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.message ?? '-'}</p>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
