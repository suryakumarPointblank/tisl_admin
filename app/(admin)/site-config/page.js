'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Plus } from 'lucide-react';
import { axiosInstance } from '@/lib/api-config';

function SiteConfigForm({ defaultValues, onSubmit, onCancel, loading }) {
  const [key, setKey] = useState(defaultValues?.key ?? '');
  const [value, setValue] = useState(defaultValues?.value ?? '');
  const [description, setDescription] = useState(defaultValues?.description ?? '');

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ key, value, description: description || undefined });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700">Key</label>
        <input
          required
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="e.g. slide_deck_delivery_time"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Value</label>
        <textarea
          required
          rows={2}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={loading} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
          {loading ? 'Saving…' : 'Save'}
        </button>
        <button type="button" onClick={onCancel} className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function SiteConfigPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['admin', 'site-config'],
    queryFn: async () => {
      const res = await axiosInstance.get('/api/v1/admin/site-config');
      return res.data;
    },
  });

  const upsert = useMutation({
    mutationFn: (dto) => axiosInstance.put('/api/v1/admin/site-config', dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'site-config'] });
      setShowCreate(false);
      setEditItem(null);
    },
  });

  const remove = useMutation({
    mutationFn: (key) => axiosInstance.delete(`/api/v1/admin/site-config/${key}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'site-config'] }),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Site Config</h1>
        <button
          onClick={() => { setShowCreate(true); setEditItem(null); }}
          className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={14} /> Add
        </button>
      </div>

      {error && <p className="text-sm text-red-600">Failed to load: {error.message}</p>}

      {showCreate && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-800">New Config Entry</h2>
          <SiteConfigForm
            onSubmit={(dto) => upsert.mutate(dto)}
            onCancel={() => setShowCreate(false)}
            loading={upsert.isPending}
          />
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Key</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Value</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Description</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Loading…</td></tr>
            )}
            {!isLoading && items.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No config entries yet</td></tr>
            )}
            {items.map((item) => (
              <React.Fragment key={item.key}>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-900">{item.key}</td>
                  <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{item.value}</td>
                  <td className="px-4 py-3 text-gray-500">{item.description ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditItem(item); setShowCreate(false); }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => { if (confirm('Delete this config entry?')) remove.mutate(item.key); }}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
                {editItem?.key === item.key && (
                  <tr key={`edit-${item.key}`}>
                    <td colSpan={4} className="bg-blue-50 px-4 py-4">
                      <SiteConfigForm
                        defaultValues={{ key: item.key, value: item.value, description: item.description ?? '' }}
                        onSubmit={(dto) => upsert.mutate(dto)}
                        onCancel={() => setEditItem(null)}
                        loading={upsert.isPending}
                      />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
