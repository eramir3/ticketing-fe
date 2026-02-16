import { redirect } from 'next/navigation';
import { doRequest, HttpMethod } from '../../api/request';
import { ApiUsers } from '../../api/routes';
import { setSessionCookieFromResponse } from '../../lib/cookies';
import { rethrowNextErrors } from '../../lib/next-errors';
import SignupForm from './signup-form';

type SignupState = {
  errors: { message: string; field?: string }[] | null;
};

async function signup(
  _prevState: SignupState,
  formData: FormData,
): Promise<SignupState> {
  'use server';

  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const result = await doRequest({
      url: ApiUsers.Signup,
      method: HttpMethod.Post,
      body: { email, password },
      fallbackMessage: 'Signup failed',
      onSuccess: async (res) => {
        // 🔥 Extract cookie from auth service response
        await setSessionCookieFromResponse(res);
      },
    });

    if (!result.ok) {
      return { errors: result.errors };
    }
    redirect('/');
  } catch (error) {
    rethrowNextErrors(error);
    console.error('Signup failed', error);
    return { errors: [{ message: 'Network error. Try again.!!!' }] };
  }
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
