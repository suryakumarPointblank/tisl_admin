'use client';

import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/api-config';

function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function EngagementPage() {
  const { data: likeStats = [], isLoading: likesLoading, error: likesError } = useQuery({
    queryKey: ['admin', 'content-likes', 'stats'],
    queryFn: async () => {
      const res = await axiosInstance.get('/api/v1/admin/content-likes/stats');
      return res.data ?? [];
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Engagement Metrics</h1>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-widest text-gray-400">Total Liked Content</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">{likeStats.length}</div>
          <div className="mt-1 text-xs text-gray-400">content items with at least 1 like</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-widest text-gray-400">Total Likes</div>
          <div className="mt-2 text-3xl font-semibold text-gray-900">
            {likeStats.reduce((sum, r) => sum + (r.likeCount || 0), 0)}
          </div>
          <div className="mt-1 text-xs text-gray-400">across all content</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="text-xs font-medium uppercase tracking-widest text-gray-400">Most Liked</div>
          <div className="mt-2 text-sm font-semibold text-gray-900 truncate">
            {likeStats[0]?.title ?? '-'}
          </div>
          <div className="mt-1 text-xs text-gray-400">
            {likeStats[0] ? `${likeStats[0].likeCount} likes` : 'no data yet'}
          </div>
        </div>
      </div>

      {/* Likes per content item */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-700">Content Likes - ranked by popularity</h2>
        {likesError && <p className="text-sm text-red-600">Failed to load: {likesError.message}</p>}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">#</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Content Title</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Type</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Likes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {likesLoading && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400">Loading…</td>
                </tr>
              )}
              {!likesLoading && likeStats.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400">No likes recorded yet</td>
                </tr>
              )}
              {likeStats.map((row, i) => (
                <tr key={row.contentItemId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400 tabular-nums">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-sm truncate">{row.title}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs uppercase tracking-wide">{row.contentType?.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
                      ♥ {row.likeCount}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
