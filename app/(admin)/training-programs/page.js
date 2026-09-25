'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { axiosInstance } from '@/lib/api-config';
import MutationError from '@/components/MutationError';

const BATCH_STATUS_OPTIONS = ['OPEN', 'FULLY_BOOKED', 'COMPLETED', 'CANCELLED'];

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Program Form ─────────────────────────────────────────────────────────────
function ProgramForm({ defaultValues, onSubmit, onCancel, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            {...register('title', { required: 'Required' })}
          />
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
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
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          rows={2}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          {...register('description')}
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Therapy Area</label>
          <input
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            {...register('therapyArea')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Program Type</label>
          <input
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            {...register('programType')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Format</label>
          <input
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            {...register('format')}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Duration (days)</label>
          <input
            type="number"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            {...register('durationDays', { valueAsNumber: true })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Max Participants</label>
          <input
            type="number"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            {...register('maxParticipants', { valueAsNumber: true })}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          {...register('isActive')}
        />
        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Batch Form ───────────────────────────────────────────────────────────────
function BatchForm({ programId, defaultValues, onSubmit, onCancel, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: defaultValues ?? { programId },
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
      <input type="hidden" {...register('programId')} value={programId} />
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Batch #</label>
          <input
            type="number"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            {...register('batchNumber', { valueAsNumber: true, required: 'Required' })}
          />
          {errors.batchNumber && <p className="mt-1 text-xs text-red-600">{errors.batchNumber.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            {...register('startDate', { required: 'Required' })}
          />
          {errors.startDate && <p className="mt-1 text-xs text-red-600">{errors.startDate.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            type="date"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            {...register('endDate', { required: 'Required' })}
          />
          {errors.endDate && <p className="mt-1 text-xs text-red-600">{errors.endDate.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Venue</label>
          <input
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            {...register('venue')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">City</label>
          <input
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            {...register('city')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            {...register('status')}
          >
            {BATCH_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Seats Total</label>
          <input
            type="number"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            {...register('seatsTotal', { valueAsNumber: true })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Seats Available</label>
          <input
            type="number"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            {...register('seatsAvailable', { valueAsNumber: true })}
          />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? 'Saving…' : 'Save Batch'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ─── Program Card ─────────────────────────────────────────────────────────────
function ProgramCard({ program, onEdit, onDelete, queryClient }) {
  const [expanded, setExpanded] = useState(false);
  const [showAddBatch, setShowAddBatch] = useState(false);
  const [editBatch, setEditBatch] = useState(null);

  const createBatch = useMutation({
    mutationFn: (dto) => axiosInstance.post('/api/v1/admin/training-programs/batches', dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'training-programs'] });
      setShowAddBatch(false);
    },
  });

  const updateBatch = useMutation({
    mutationFn: ({ id, dto }) =>
      axiosInstance.patch(`/api/v1/admin/training-programs/batches/${id}`, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'training-programs'] });
      setEditBatch(null);
    },
  });

  const deleteBatch = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/api/v1/admin/training-programs/batches/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'training-programs'] }),
  });

  const batches = program.batches ?? [];

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-start justify-between p-5">
        <div className="flex items-start gap-3">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-0.5 text-gray-400 hover:text-gray-700"
          >
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{program.title}</span>
              {program.isActive ? (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Active</span>
              ) : (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">Inactive</span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-gray-500">
              {program.therapyArea && <span className="mr-3">{program.therapyArea}</span>}
              {program.durationDays && <span className="mr-3">{program.durationDays}d</span>}
              {program.maxParticipants && <span>Max {program.maxParticipants} participants</span>}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onEdit(program)} className="text-gray-400 hover:text-blue-600">
            <Pencil size={14} />
          </button>
          <button
            onClick={() => { if (confirm('Delete this program?')) onDelete(program.id); }}
            className="text-gray-400 hover:text-red-600"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-5">
          <MutationError errors={[createBatch.error, updateBatch.error, deleteBatch.error]} />
          {batches.length > 0 ? (
            <table className="w-full text-sm mt-3">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-2 text-left text-xs font-medium text-gray-500">Batch #</th>
                  <th className="pb-2 text-left text-xs font-medium text-gray-500">Dates</th>
                  <th className="pb-2 text-left text-xs font-medium text-gray-500">Venue</th>
                  <th className="pb-2 text-left text-xs font-medium text-gray-500">City</th>
                  <th className="pb-2 text-left text-xs font-medium text-gray-500">Seats</th>
                  <th className="pb-2 text-left text-xs font-medium text-gray-500">Status</th>
                  <th className="pb-2 text-left text-xs font-medium text-gray-500"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {batches.map((batch) => (
                  <>
                    <tr key={batch.id} className="hover:bg-gray-50">
                      <td className="py-2 pr-4 text-gray-700">{batch.batchNumber}</td>
                      <td className="py-2 pr-4 text-gray-600 whitespace-nowrap">
                        {formatDate(batch.startDate)} – {formatDate(batch.endDate)}
                      </td>
                      <td className="py-2 pr-4 text-gray-600">{batch.venue ?? '—'}</td>
                      <td className="py-2 pr-4 text-gray-600">{batch.city ?? '—'}</td>
                      <td className="py-2 pr-4 text-gray-600">
                        {batch.seatsAvailable ?? '—'}/{batch.seatsTotal ?? '—'}
                      </td>
                      <td className="py-2 pr-4 text-gray-600">{batch.status ?? '—'}</td>
                      <td className="py-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditBatch(batch)}
                            className="text-gray-400 hover:text-blue-600"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => { if (confirm('Delete this batch?')) deleteBatch.mutate(batch.id); }}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {editBatch?.id === batch.id && (
                      <tr key={`edit-batch-${batch.id}`}>
                        <td colSpan={7} className="py-3">
                          <BatchForm
                            programId={program.id}
                            defaultValues={{
                              programId: program.id,
                              batchNumber: batch.batchNumber,
                              startDate: batch.startDate?.slice(0, 10),
                              endDate: batch.endDate?.slice(0, 10),
                              venue: batch.venue,
                              city: batch.city,
                              seatsTotal: batch.seatsTotal,
                              seatsAvailable: batch.seatsAvailable,
                              status: batch.status,
                            }}
                            onSubmit={(dto) => updateBatch.mutate({ id: batch.id, dto })}
                            onCancel={() => setEditBatch(null)}
                            loading={updateBatch.isPending}
                          />
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="mt-3 text-sm text-gray-400">No batches yet.</p>
          )}

          {showAddBatch ? (
            <div className="mt-4">
              <BatchForm
                programId={program.id}
                onSubmit={(dto) => createBatch.mutate(dto)}
                onCancel={() => setShowAddBatch(false)}
                loading={createBatch.isPending}
              />
            </div>
          ) : (
            <button
              onClick={() => setShowAddBatch(true)}
              className="mt-4 flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800"
            >
              <Plus size={14} /> Add Batch
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TrainingProgramsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editProgram, setEditProgram] = useState(null);

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['admin', 'training-programs'],
    queryFn: async () => {
      const res = await axiosInstance.get('/api/v1/admin/training-programs');
      return res.data;
    },
  });

  const create = useMutation({
    mutationFn: (dto) => axiosInstance.post('/api/v1/admin/training-programs', dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'training-programs'] });
      setShowCreate(false);
    },
  });

  const update = useMutation({
    mutationFn: ({ id, dto }) =>
      axiosInstance.patch(`/api/v1/admin/training-programs/${id}`, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'training-programs'] });
      setEditProgram(null);
    },
  });

  const remove = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/api/v1/admin/training-programs/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'training-programs'] }),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Training Programs</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={14} /> Add Program
        </button>
      </div>

      {error && <p className="text-sm text-red-600">Failed to load: {error.message}</p>}

      <MutationError errors={[create.error, update.error, remove.error]} />
      {showCreate && (
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-800">New Training Program</h2>
          <ProgramForm
            onSubmit={(dto) => create.mutate(dto)}
            onCancel={() => setShowCreate(false)}
            loading={create.isPending}
          />
        </div>
      )}

      {isLoading && <p className="text-sm text-gray-400">Loading…</p>}

      {!isLoading && items.length === 0 && !showCreate && (
        <p className="text-sm text-gray-400">No training programs yet.</p>
      )}

      <div className="space-y-4">
        {items.map((program) => (
          editProgram?.id === program.id ? (
            <div key={program.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-gray-800">Edit Program</h2>
              <ProgramForm
                defaultValues={{
                  title: program.title,
                  slug: program.slug,
                  description: program.description,
                  therapyArea: program.therapyArea,
                  programType: program.programType,
                  durationDays: program.durationDays,
                  format: program.format,
                  maxParticipants: program.maxParticipants,
                  isActive: program.isActive,
                }}
                onSubmit={(dto) => update.mutate({ id: program.id, dto })}
                onCancel={() => setEditProgram(null)}
                loading={update.isPending}
              />
            </div>
          ) : (
            <ProgramCard
              key={program.id}
              program={program}
              onEdit={setEditProgram}
              onDelete={(id) => remove.mutate(id)}
              queryClient={queryClient}
            />
          )
        ))}
      </div>
    </div>
  );
}
