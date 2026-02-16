import { redirect } from 'next/navigation';
import { doRequest, HttpMethod } from '../../api/request';
import { ApiUsers } from '../../api/routes';
import { setSessionCookieFromResponse } from '../../lib/cookies';
import SignupForm from './signup-form';
import type { SignupState } from './types';

async function signup(
  _prevState: SignupState,
  formData: FormData,
): Promise<SignupState> {
  'use server';

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const result = await doRequest<{ email: string; id: string }>({
    url: ApiUsers.Signup,
    method: HttpMethod.Post,
    body: { email, password },
    fallbackMessage: 'Signup failed',
    onSuccess: async (res) => {
      // 🔥 Extract cookie from auth service response
      await setSessionCookieFromResponse(res);
      redirect('/');
    },
  });

  if (!result.ok) {
    return { errors: result.errors };
  }
  return { errors: null };
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="max-w-3xl">
        <h1 className="text-5xl font-semibold text-gray-900 mb-10">
          Sign Up
        </h1>

        <SignupForm action={signup} />
      </div>
    </div>
  );
}
