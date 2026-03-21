import { HttpMethod } from "../auth/signin/types";
import { rethrowNextErrors } from "../lib/next-errors";
import { buildServerFetchClient } from "./build-server-client";

export type AuthError = { message: string; field?: string };

export type QueryParamValue = string | number | boolean;
export type QueryParams = Record<
  string,
  QueryParamValue | QueryParamValue[] | null | undefined
>;

// Usage example (GET with query params)
// await doRequest({
//   url: '/api/users',
//   method: HttpMethod.Get,
//   query: { page: 1, search: 'test', tags: ['a', 'b'] },
// });

type DoRequestOptions = {
  url: string;
  method?: HttpMethod;
  onSuccess?: (res: Response) => Promise<void>;
  body?: unknown;
  fallbackMessage?: string;
  query?: QueryParams;
  forwardSession?: boolean;
};

type RequestSuccess<T> = {
  ok: true;
  res: Response;
  data: T | null;
};

type RequestFailure<E = AuthError[]> = {
  ok: false;
  errors: E;
};

type RequestResult<T, E = AuthError[]> =
  | RequestSuccess<T>
  | RequestFailure<E>;

export async function serverFetch<T>({
  url,
  method = HttpMethod.Get,
  onSuccess,
  body,
  fallbackMessage,
  query,
}: DoRequestOptions): Promise<RequestResult<T>> {
  try {
    const hasBody =
      body !== undefined &&
      body !== null &&
      method !== HttpMethod.Get &&
      method !== HttpMethod.Head;
    const resolvedUrl = query ? appendQueryParams(url, query) : url;

    const fetchClient = await buildServerFetchClient();
    const res = await fetchClient(resolvedUrl, {
      cache: 'no-store',
      method,
      headers: hasBody ? { 'Content-Type': 'application/json' } : undefined,
      body: hasBody ? JSON.stringify(body) : undefined,
    });

    if (res.ok) {
      if (onSuccess) {
        await onSuccess(res);
      }
      const data = (await res.json().catch(() => null)) as T | null;
      return { ok: true, res, data };
    }

    const data = await res.json().catch(() => null);
    const errors = Array.isArray(data?.errors)
      ? (data.errors as AuthError[])
      : [{ message: fallbackMessage ?? 'An error occurred' }];

    return { ok: false, errors };
  }
  catch (error) {
    rethrowNextErrors(error);
    return { ok: false, errors: [{ message: 'Network error. Try again.' }] };
  }
}

function appendQueryParams(url: string, query: QueryParams): string {
  const [base, existingQuery] = url.split('?');
  const params = new URLSearchParams(existingQuery ?? '');

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, String(item)));
      return;
    }
    params.append(key, String(value));
  });

  const queryString = params.toString();
  return queryString ? `${base}?${queryString}` : base;
}
