import { headers } from 'next/headers';
import { API_BASE_URL } from '../lib/config';

export async function buildServerFetchClient() {
  const incomingHeaders = await headers();
  const cookie = decodeSessionCookieHeader(
    incomingHeaders.get('cookie') ?? '',
  );
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

function decodeSessionCookieHeader(cookieHeader: string): string {
  if (!cookieHeader) return cookieHeader;
  const parts = cookieHeader.split(';').map((part) => part.trim());
  let updated = false;

  const decodedParts = parts.map((part) => {
    if (!part.startsWith('session=')) return part;
    const value = part.slice('session='.length);
    try {
      const decoded = decodeURIComponent(value);
      updated = true;
      return `session=${decoded}`;
    } catch {
      return part;
    }
  });

  return updated ? decodedParts.join('; ') : cookieHeader;
}
