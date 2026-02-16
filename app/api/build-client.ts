import { headers } from 'next/headers';
import { API_BASE_URL } from '../lib/config';

export async function buildFetchClient() {
  if (typeof window === 'undefined') {
    const incomingHeaders = await headers();
    const cookie = incomingHeaders.get('cookie') ?? '';
    const authorization = incomingHeaders.get('authorization') ?? '';

    return async (path: string, options: RequestInit = {}) => {
      return fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
          ...(cookie ? { cookie } : {}),
          ...(authorization ? { authorization } : {}),
          ...(options.headers || {}),
        },
      });
    };

  }

  // Browser
  return async (path: string, options: RequestInit = {}) => {
    return fetch(path, options);
  };
}
