import { redirect } from 'next/navigation';
import { doRequest, HttpMethod } from '../../api/request';
import { ApiUsers } from '../../api/routes';
import { setSessionCookieFromResponse } from '../../lib/cookies';
import SigninForm from './signin-form';
import type { SigninState } from './types';

async function signin(
  _prevState: SigninState,
  formData: FormData,
): Promise<SigninState> {
  'use server';

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const result = await doRequest<{ email: string; id: string }>({
    url: ApiUsers.Signin,
    method: HttpMethod.Post,
    body: { email, password },
    fallbackMessage: 'Signin failed',
    onSuccess: async (res) => {
      // 🔥 Extract cookie from auth service response
      await setSessionCookieFromResponse(res);
      redirect('/');
    },
  });
  return { errors: result.errors };
}

export default function SigninPage() {
  return (
    <div className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="max-w-3xl">
        <h1 className="text-5xl font-semibold text-gray-900 mb-10">
          Sign In
        </h1>

        <SigninForm action={signin} />
      </div>
    </div>
  );
}
