import { buildFetchClient } from "./build-client";

export type AuthError = { message: string; field?: string };

export enum HttpMethod {
  Get = 'GET',
  Head = 'HEAD',
  Post = 'POST',
  Put = 'PUT',
  Patch = 'PATCH',
  Delete = 'DELETE',
}

export async function doRequest(
  url: string,
  method: HttpMethod,
  onSuccess: (res: Response) => Promise<void>,
  body?: unknown,
  fallbackMessage?: string,
): Promise<
  | { ok: true; res: Response }
  | { ok: false; errors: AuthError[] }
> {
  let res: Response;
  const hasBody =
    body !== undefined &&
    body !== null &&
    method !== HttpMethod.Get &&
    method !== HttpMethod.Head;

  const fetchClient = await buildFetchClient();
  res = await fetchClient(url, {
    cache: 'no-store',
    method,
    headers: hasBody ? { 'Content-Type': 'application/json' } : undefined,
    body: hasBody ? JSON.stringify(body) : undefined,
  });

  if (res.ok) {
    await onSuccess(res);
    return { ok: true, res };
  }

  const data = await res.json().catch(() => null);
  const errors = Array.isArray(data?.errors)
    ? (data.errors as AuthError[])
    : [{ message: fallbackMessage ?? 'An error occurred' }];

  return { ok: false, errors };
}
