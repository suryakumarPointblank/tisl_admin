'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { api } from '@/lib/api-config';
import FileUploadInput from '@/components/FileUploadInput';
import MutationError from '@/components/MutationError';

function FacultyForm({ defaultValues, onSubmit, onCancel, loading }) {
  const { register, handleSubmit, control, formState: { errors } } = useForm({ defaultValues });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
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
          <label className="block text-sm font-medium text-gray-700">Designation</label>
          <input
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            {...register('designation')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Hospital</label>
          <input
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            {...register('hospital')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">City</label>
          <input
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            {...register('city')}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Bio</label>
        <textarea
          rows={2}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          {...register('bio')}
        />
      </div>
      <div>
        <Controller
          name="photoUrl"
          control={control}
          defaultValue={defaultValues?.photoUrl ?? ''}
          render={({ field }) => (
            <FileUploadInput
              label="Photo"
              value={field.value}
              onChange={field.onChange}
              folder="faculty"
              accept="image/*"
              previewImage
            />
          )}
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

export default function FacultyPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['admin', 'faculty'],
    queryFn: async () => {
      const response = await api.adminFaculty.facultyAdminControllerFindAllV1();
      return response.body;
    },
  });

  const create = useMutation({
    mutationFn: (dto) => api.adminFaculty.facultyAdminControllerCreateV1(dto),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'faculty'] }); setShowCreate(false); },
  });

  const update = useMutation({
    mutationFn: ({ id, dto }) => api.adminFaculty.facultyAdminControllerUpdateV1(id, dto),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'faculty'] }); setEditItem(null); },
  });

  const remove = useMutation({
    mutationFn: (id) => api.adminFaculty.facultyAdminControllerRemoveV1(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'faculty'] }),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Faculty</h1>
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
          <h2 className="mb-3 text-sm font-semibold text-gray-800">New Faculty Member</h2>
          <FacultyForm onSubmit={(dto) => create.mutate(dto)} onCancel={() => setShowCreate(false)} loading={create.isPending} />
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Designation</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Hospital</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">City</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Loading…</td></tr>}
            {!isLoading && items.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No faculty yet</td></tr>}
            {items.map((item) => (
              <>
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 text-gray-600">{item.designation ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{item.hospital ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{item.city ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setEditItem(item)} className="text-gray-400 hover:text-blue-600"><Pencil size={14} /></button>
                      <button onClick={() => { if (confirm('Delete this faculty member?')) remove.mutate(item.id); }} className="text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
                {editItem?.id === item.id && (
                  <tr key={`edit-${item.id}`}>
                    <td colSpan={5} className="bg-blue-50 px-4 py-4">
                      <FacultyForm
                        defaultValues={{ name: item.name, designation: item.designation, hospital: item.hospital, city: item.city, bio: item.bio, photoUrl: item.photoUrl }}
                        onSubmit={(dto) => update.mutate({ id: item.id, dto })}
                        onCancel={() => setEditItem(null)}
                        loading={update.isPending}
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
