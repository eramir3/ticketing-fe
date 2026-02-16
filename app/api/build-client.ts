import { headers } from 'next/headers';

export async function buildFetchClient() {
  if (typeof window === 'undefined') {
    const incomingHeaders = await headers();
    const cookie = incomingHeaders.get('cookie') ?? '';
    const authorization = incomingHeaders.get('authorization') ?? '';

    return async (path: string, options: RequestInit = {}) => {
      return fetch(`http://ingress-nginx-controller.ingress-nginx.svc.cluster.local${path}`, {
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
