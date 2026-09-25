'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/api-config';
import MutationError from '@/components/MutationError';

const STATUS_STYLES = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  UNDER_REVIEW: 'bg-blue-100 text-blue-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

const STATUS_OPTIONS = ['PENDING', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED'];

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function CaseSubmissionsPage() {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState(null);

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['admin', 'case-submissions'],
    queryFn: async () => {
      const res = await axiosInstance.get('/api/v1/admin/case-submissions');
      return res.data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) =>
      axiosInstance.patch(`/api/v1/admin/case-submissions/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'case-submissions'] }),
  });

  function toggleRow(id) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Case Submissions</h1>
      </div>

      {error && <p className="text-sm text-red-600">Failed to load: {error.message}</p>}

      <MutationError errors={[updateStatus.error]} />
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Submitter</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Title</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Therapy Area</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading…</td>
              </tr>
            )}
            {!isLoading && items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">No submissions yet</td>
              </tr>
            )}
            {items.map((item) => (
              <>
                <tr
                  key={item.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleRow(item.id)}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{item.submitterName ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{item.submitterEmail ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{item.title ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{item.therapyArea ?? '—'}</td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={item.status ?? ''}
                      onChange={(e) => updateStatus.mutate({ id: item.id, status: e.target.value })}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${STATUS_STYLES[item.status] ?? 'bg-gray-100 text-gray-700'}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {formatDate(item.createdAt)}
                  </td>
                </tr>
                {expandedId === item.id && (
                  <tr key={`expand-${item.id}`}>
                    <td colSpan={6} className="bg-gray-50 px-6 py-4">
                      <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <div>
                          <dt className="font-medium text-gray-600">Patient Age</dt>
                          <dd className="text-gray-900">{item.patientAge ?? '—'}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-gray-600">Patient Sex</dt>
                          <dd className="text-gray-900">{item.patientSex ?? '—'}</dd>
                        </div>
                        <div className="col-span-2">
                          <dt className="font-medium text-gray-600">Comorbidities</dt>
                          <dd className="text-gray-900">{item.comorbidities ?? '—'}</dd>
                        </div>
                        <div className="col-span-2">
                          <dt className="font-medium text-gray-600">Clinical Challenge</dt>
                          <dd className="text-gray-900 whitespace-pre-wrap">{item.clinicalChallenge ?? '—'}</dd>
                        </div>
                        <div className="col-span-2">
                          <dt className="font-medium text-gray-600">Learning Point</dt>
                          <dd className="text-gray-900 whitespace-pre-wrap">{item.learningPoint ?? '—'}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-gray-600">Institution</dt>
                          <dd className="text-gray-900">{item.submitterInstitution ?? '—'}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-gray-600">City</dt>
                          <dd className="text-gray-900">{item.submitterCity ?? '—'}</dd>
                        </div>
                        <div>
                          <dt className="font-medium text-gray-600">Attribution</dt>
                          <dd className="text-gray-900">{item.attribution ?? '—'}</dd>
                        </div>
                      </dl>
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
