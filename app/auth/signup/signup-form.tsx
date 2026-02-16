'use client';

import { useActionState } from 'react';
import FormErrors from '../../components/form-errors';
import { SignupState } from './page';

const initialState: SignupState = { errors: undefined };

export default function SignupForm({
  action,
}: {
  action: (
    prevState: SignupState,
    formData: FormData,
  ) => Promise<SignupState>;
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-8">
      <div>
        <label className="block text-lg font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <input
          name="email"
          type="email"
          className="w-full border border-gray-300 rounded-md px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-lg font-medium text-gray-700 mb-2">
          Password
        </label>
        <input
          name="password"
          type="password"
          className="w-full border border-gray-300 rounded-md px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <FormErrors errors={state.errors} />

      <button
        type="submit"
        className="bg-blue-600 text-white text-lg px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
      >
        Sign Up
      </button>
    </form>
  );
}
