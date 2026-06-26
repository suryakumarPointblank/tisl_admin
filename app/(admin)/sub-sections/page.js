'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/api-config';

function SubSectionForm({ defaultValues, onSubmit, onCancel, loading, therapyAreas }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700">Therapy Area</label>
        <select
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          {...register('therapyAreaId', { required: 'Required' })}
        >
          <option value="">Select therapy area…</option>
          {therapyAreas.map((ta) => (
            <option key={ta.id} value={ta.id}>{ta.name}</option>
          ))}
        </select>
        {errors.therapyAreaId && <p className="mt-1 text-xs text-red-600">{errors.therapyAreaId.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            {...register('name', { required: 'Required' })}
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Slug</label>
          <input
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            {...register('slug', { required: 'Required' })}
          />
          {errors.slug && <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <input
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            {...register('description')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Order Index</label>
          <input
            type="number"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            {...register('orderIndex', { valueAsNumber: true })}
          />
        </div>
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

export default function SubSectionsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['admin', 'sub-sections'],
    queryFn: async () => {
      const response = await api.adminSubSections.subSectionAdminControllerFindAllV1();
      return response.body;
    },
  });

  const { data: therapyAreas = [] } = useQuery({
    queryKey: ['admin', 'therapy-areas'],
    queryFn: async () => {
      const response = await api.adminTherapyAreas.therapyAreaAdminControllerFindAllV1();
      return response.body;
    },
  });

  const create = useMutation({
    mutationFn: (dto) => api.adminSubSections.subSectionAdminControllerCreateV1(dto),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'sub-sections'] }); setShowCreate(false); },
  });

  const update = useMutation({
    mutationFn: ({ id, dto }) => api.adminSubSections.subSectionAdminControllerUpdateV1(id, dto),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'sub-sections'] }); setEditItem(null); },
  });

  const remove = useMutation({
    mutationFn: (id) => api.adminSubSections.subSectionAdminControllerRemoveV1(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'sub-sections'] }),
  });

  const taMap = Object.fromEntries(therapyAreas.map((ta) => [ta.id, ta.name]));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Sub-sections</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={14} /> Add
        </button>
      </div>

      {error && <p className="text-sm text-red-600">Failed to load: {error.message}</p>}

      {showCreate && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-800">New Sub-section</h2>
          <SubSectionForm onSubmit={(dto) => create.mutate(dto)} onCancel={() => setShowCreate(false)} loading={create.isPending} therapyAreas={therapyAreas} />
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Slug</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Therapy Area</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Loading…</td></tr>}
            {!isLoading && items.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No sub-sections yet</td></tr>}
            {items.map((item) => (
              <React.Fragment key={item.id}>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{item.slug}</td>
                  <td className="px-4 py-3 text-gray-600">{taMap[item.therapyAreaId] ?? item.therapyAreaId}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setEditItem(item)} className="text-gray-400 hover:text-blue-600"><Pencil size={14} /></button>
                      <button onClick={() => { if (confirm('Delete this sub-section?')) remove.mutate(item.id); }} className="text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
                {editItem?.id === item.id && (
                  <tr key={`edit-${item.id}`}>
                    <td colSpan={4} className="bg-blue-50 px-4 py-4">
                      <SubSectionForm
                        defaultValues={{ therapyAreaId: item.therapyAreaId, name: item.name, slug: item.slug, description: item.description, orderIndex: item.orderIndex }}
                        onSubmit={(dto) => update.mutate({ id: item.id, dto })}
                        onCancel={() => setEditItem(null)}
                        loading={update.isPending}
                        therapyAreas={therapyAreas}
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
