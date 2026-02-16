import { cookies } from 'next/headers';

type CookieOptions = {
  name: string;
  value: string;
  httpOnly?: boolean;
  path?: string;
};

function extractCookieValue(
  setCookieHeader: string,
  cookieName: string,
): string | null {
  const match = setCookieHeader.match(new RegExp(`${cookieName}=([^;]+)`));
  return match?.[1] ?? null;
}

async function setCookie(options: CookieOptions) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: options.name,
    value: options.value,
    httpOnly: options.httpOnly ?? true,
    path: options.path ?? '/',
  });
}

export async function setSessionCookieFromResponse(
  res: Response,
): Promise<boolean> {
  const setCookieHeader = res.headers.get('set-cookie');
  if (!setCookieHeader) return false;

  const sessionValue = extractCookieValue(setCookieHeader, 'session');
  if (!sessionValue) return false;

  await setCookie({
    name: 'session',
    value: sessionValue,
    httpOnly: true,
    path: '/',
  });

  return true;
}
