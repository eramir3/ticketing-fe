import { buildFetchClient } from "./build-client";

export type AuthError = { message: string; field?: string };

export async function doRequest(
  url: string,
  method: string,
  body: unknown,
  onSuccess: (res: Response) => Promise<void>,
  fallbackMessage?: string,
): Promise<
  | { ok: true; res: Response }
  | { ok: false; errors: AuthError[] }
> {
  let res: Response;

  const fetchClient = await buildFetchClient();
  res = await fetchClient(url, {
    cache: 'no-store',
    method: method.toUpperCase(),
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
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
