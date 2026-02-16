import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
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
    const body = JSON.stringify({ email, password })

    const res = await fetch('http://auth-srv:3000/api/users/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
      cache: 'no-store',
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      const errors = Array.isArray(data?.errors)
        ? data.errors
        : [{ message: 'Signup failed' }];
      return {
        errors,
      };
    }

    // 🔥 Extract cookie from auth service response
    const setCookie = res.headers.get('set-cookie');

    if (setCookie) {
      const cookieStore = await cookies();
      const sessionValue = setCookie
        .split('session=')[1]
        .split(';')[0];

      cookieStore.set({
        name: 'session',
        value: sessionValue,
        httpOnly: true,
        path: '/',
      });
    }

    redirect('/');
  } catch (error) {
    console.error('Signup failed', error);
    return { errors: [{ message: 'Network error. Try again.' }] };
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
