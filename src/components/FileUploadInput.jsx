'use client';

import { useRef, useState } from 'react';
import { axiosInstance } from '@/lib/api-config';

/**
 * Drop-in replacement for a plain URL text input.
 * Props:
 *   value      – current URL string (controlled)
 *   onChange   – called with the new URL string
 *   folder     – GCS folder, e.g. "faculty", "content"
 *   accept     – MIME types string, default "image/*"
 *   label      – field label
 *   previewImage – show img preview (default true when accept starts with "image")
 */
export default function FileUploadInput({
  value = '',
  onChange,
  folder = 'uploads',
  accept,
  label,
  previewImage,
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const acceptStr = accept ?? 'image/*,application/pdf,video/mp4,video/webm,audio/mpeg';
  const showPreview = previewImage ?? acceptStr.startsWith('image');

  async function handleFile(file) {
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await axiosInstance.post(`/api/v1/admin/upload?folder=${folder}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(res.data.url);
    } catch (e) {
      setError(e?.response?.data?.message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}

      {/* Current URL + manual override */}
      <input
        type="url"
        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        placeholder="https://… or upload below"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      {/* Upload row */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-60"
        >
          {uploading ? 'Uploading…' : '↑ Upload file'}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-xs text-red-500 hover:underline"
          >
            Clear
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={acceptStr}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>

      {/* Image preview */}
      {showPreview && value && (
        <img
          src={value}
          alt="preview"
          className="mt-1 h-20 w-20 rounded-md object-cover border border-gray-200"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      )}
    </div>
  );
}
