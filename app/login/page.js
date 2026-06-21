'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { setCookie } from 'cookies-next';
import { api } from '@/lib/api-config';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    try {
      const response = await api.auth.authControllerLoginV1(data);
      const result = response.body;

      if (result.user?.role !== 'ADMIN') {
        setError('Access denied. Admin account required.');
        return;
      }

      const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
      setCookie('authToken', result.access_token, { maxAge: THIRTY_DAYS, path: '/', sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
      setCookie('refreshToken', result.refresh_token, { maxAge: THIRTY_DAYS, path: '/', sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
      router.replace('/dashboard');
    } catch (err) {
      setError(err?.response?.body?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">TISL Admin</h1>
          <p className="mt-1 text-sm text-gray-500">Sign in with your admin account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              autoComplete="email"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              autoComplete="current-password"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
