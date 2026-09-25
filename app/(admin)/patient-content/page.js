'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/api-config';
import MutationError from '@/components/MutationError';

const JOURNEY_STAGES = ['AWARENESS', 'DIAGNOSIS', 'TREATMENT', 'MANAGEMENT', 'SUPPORT'];
const CONTENT_TYPES = ['VIDEO', 'ARTICLE', 'INFOGRAPHIC', 'GUIDE', 'FAQ'];

function PatientContentForm({ defaultValues, onSubmit, onCancel, loading, conditions }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Condition</label>
          <select
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            {...register('conditionId', { required: 'Required' })}
          >
            <option value="">Select condition…</option>
            {conditions.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.conditionId && <p className="mt-1 text-xs text-red-600">{errors.conditionId.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Journey Stage</label>
          <select
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            {...register('journeyStage', { required: 'Required' })}
          >
            <option value="">Select stage…</option>
            {JOURNEY_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.journeyStage && <p className="mt-1 text-xs text-red-600">{errors.journeyStage.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Content Type</label>
          <select
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            {...register('contentType', { required: 'Required' })}
          >
            <option value="">Select type…</option>
            {CONTENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          {errors.contentType && <p className="mt-1 text-xs text-red-600">{errors.contentType.message}</p>}
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
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          {...register('title', { required: 'Required' })}
        />
        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          rows={2}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          {...register('description')}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">File URL</label>
          <input
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            {...register('fileUrl')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Thumbnail URL</label>
          <input
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            {...register('thumbnailUrl')}
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

export default function PatientContentPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['admin', 'patient-content'],
    queryFn: async () => {
      const response = await api.adminPatientContent.patientContentAdminControllerFindAllV1();
      return response.body;
    },
  });

  const { data: conditions = [] } = useQuery({
    queryKey: ['admin', 'conditions'],
    queryFn: async () => {
      const response = await api.adminConditions.conditionAdminControllerFindAllV1();
      return response.body;
    },
  });

  const create = useMutation({
    mutationFn: (dto) => api.adminPatientContent.patientContentAdminControllerCreateV1(dto),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'patient-content'] }); setShowCreate(false); },
  });

  const update = useMutation({
    mutationFn: ({ id, dto }) => api.adminPatientContent.patientContentAdminControllerUpdateV1(id, dto),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'patient-content'] }); setEditItem(null); },
  });

  const remove = useMutation({
    mutationFn: (id) => api.adminPatientContent.patientContentAdminControllerRemoveV1(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'patient-content'] }),
  });

  const conditionMap = Object.fromEntries(conditions.map((c) => [c.id, c.name]));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Patient Content</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={14} /> Add
        </button>
      </div>

      {error && <p className="text-sm text-red-600">Failed to load: {error.message}</p>}

      <MutationError errors={[create.error, update.error, remove.error]} />
      {showCreate && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-800">New Patient Content</h2>
          <PatientContentForm onSubmit={(dto) => create.mutate(dto)} onCancel={() => setShowCreate(false)} loading={create.isPending} conditions={conditions} />
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Title</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Condition</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Stage</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Type</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Loading…</td></tr>}
            {!isLoading && items.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No patient content yet</td></tr>}
            {items.map((item) => (
              <>
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{item.title}</td>
                  <td className="px-4 py-3 text-gray-600">{conditionMap[item.conditionId] ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{item.journeyStage}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">{item.contentType}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setEditItem(item)} className="text-gray-400 hover:text-blue-600"><Pencil size={14} /></button>
                      <button onClick={() => { if (confirm('Delete this patient content?')) remove.mutate(item.id); }} className="text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
                {editItem?.id === item.id && (
                  <tr key={`edit-${item.id}`}>
                    <td colSpan={5} className="bg-blue-50 px-4 py-4">
                      <PatientContentForm
                        defaultValues={{ conditionId: item.conditionId, journeyStage: item.journeyStage, contentType: item.contentType, title: item.title, description: item.description, fileUrl: item.fileUrl, thumbnailUrl: item.thumbnailUrl, orderIndex: item.orderIndex }}
                        onSubmit={(dto) => update.mutate({ id: item.id, dto })}
                        onCancel={() => setEditItem(null)}
                        loading={update.isPending}
                        conditions={conditions}
                      />
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
