'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/api-config';

const CONTENT_TYPES = [
  'WEBINAR_VIDEO', 'PROCEDURE_DEMO', 'CASE_STUDY', 'INFOGRAPHIC',
  'SLIDE_PRESENTATION', 'EXPERT_OPINION', 'ARTICLE_SUMMARY', 'PODCAST',
  'SHORT_VIDEO', 'LATEST_UPDATE', 'SLIDESHOW',
];

function ContentItemForm({ defaultValues, onSubmit, onCancel, loading, topics, faculty }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ defaultValues });
  const contentType = watch('contentType');
  const isArticle = contentType === 'ARTICLE_SUMMARY';

  function handleFormSubmit(raw) {
    const dto = { ...raw };
    if (isArticle) {
      dto.contentData = {
        ...(defaultValues?.contentData ?? {}),
        imageUrl: raw.articleImageUrl || undefined,
        articleUrl: raw.articleUrl || undefined,
      };
    }
    delete dto.articleImageUrl;
    delete dto.articleUrl;
    onSubmit(dto);
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Topic</label>
          <select
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            {...register('topicId', { required: 'Required' })}
          >
            <option value="">Select topic…</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          {errors.topicId && <p className="mt-1 text-xs text-red-600">{errors.topicId.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Faculty (optional)</label>
          <select
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            {...register('facultyId')}
          >
            <option value="">None</option>
            {faculty.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
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
          <label className="block text-sm font-medium text-gray-700">Duration (min)</label>
          <input
            type="number"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            {...register('durationMinutes', { valueAsNumber: true })}
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
      {isArticle && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Cover Image URL</label>
            <input
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="https://…"
              defaultValue={defaultValues?.contentData?.imageUrl ?? ''}
              {...register('articleImageUrl')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Article Link</label>
            <input
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="https://…"
              defaultValue={defaultValues?.contentData?.articleUrl ?? ''}
              {...register('articleUrl')}
            />
          </div>
        </div>
      )}
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

export default function ContentItemsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['admin', 'content-items'],
    queryFn: async () => {
      const response = await api.adminContentItems.contentItemAdminControllerFindAllV1();
      return response.body;
    },
  });

  const { data: topics = [] } = useQuery({
    queryKey: ['admin', 'topics'],
    queryFn: async () => {
      const response = await api.adminTopics.topicAdminControllerFindAllV1();
      return response.body;
    },
  });

  const { data: faculty = [] } = useQuery({
    queryKey: ['admin', 'faculty'],
    queryFn: async () => {
      const response = await api.adminFaculty.facultyAdminControllerFindAllV1();
      return response.body;
    },
  });

  const create = useMutation({
    mutationFn: (dto) => api.adminContentItems.contentItemAdminControllerCreateV1(dto),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'content-items'] }); setShowCreate(false); },
  });

  const update = useMutation({
    mutationFn: ({ id, dto }) => api.adminContentItems.contentItemAdminControllerUpdateV1(id, dto),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'content-items'] }); setEditItem(null); },
  });

  const remove = useMutation({
    mutationFn: (id) => api.adminContentItems.contentItemAdminControllerRemoveV1(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'content-items'] }),
  });

  const topicMap = Object.fromEntries(topics.map((t) => [t.id, t.name]));
  const facultyMap = Object.fromEntries(faculty.map((f) => [f.id, f.name]));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Content Items</h1>
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
          <h2 className="mb-3 text-sm font-semibold text-gray-800">New Content Item</h2>
          <ContentItemForm onSubmit={(dto) => create.mutate(dto)} onCancel={() => setShowCreate(false)} loading={create.isPending} topics={topics} faculty={faculty} />
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Title</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Type</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Topic</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Faculty</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Loading…</td></tr>}
            {!isLoading && items.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No content items yet</td></tr>}
            {items.map((item) => (
              <>
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{item.title}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">{item.contentType}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{topicMap[item.topicId] ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{item.facultyId ? (facultyMap[item.facultyId] ?? '—') : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setEditItem(item)} className="text-gray-400 hover:text-blue-600"><Pencil size={14} /></button>
                      <button onClick={() => { if (confirm('Delete this content item?')) remove.mutate(item.id); }} className="text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
                {editItem?.id === item.id && (
                  <tr key={`edit-${item.id}`}>
                    <td colSpan={5} className="bg-blue-50 px-4 py-4">
                      <ContentItemForm
                        defaultValues={{ topicId: item.topicId, facultyId: item.facultyId, contentType: item.contentType, title: item.title, description: item.description, durationMinutes: item.durationMinutes, fileUrl: item.fileUrl, thumbnailUrl: item.thumbnailUrl, contentData: item.contentData, articleImageUrl: item.contentData?.imageUrl ?? '', articleUrl: item.contentData?.articleUrl ?? '' }}
                        onSubmit={(dto) => update.mutate({ id: item.id, dto })}
                        onCancel={() => setEditItem(null)}
                        loading={update.isPending}
                        topics={topics}
                        faculty={faculty}
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
