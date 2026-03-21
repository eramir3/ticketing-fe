'use client';

import { useActionState, useState } from 'react';
import FormErrors from '../../components/form-errors';
import type { CreateTicketState } from './types';

const initialState: CreateTicketState = { errors: null };

export default function TicketForm({
  action,
}: {
  action: (
    prevState: CreateTicketState,
    formData: FormData,
  ) => Promise<CreateTicketState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');

  const handlePriceBlur = () => {
    const parsedPrice = Number.parseFloat(price);

    if (Number.isNaN(parsedPrice)) {
      return;
    }

    setPrice(parsedPrice.toFixed(2));
  };

  return (
    <form action={formAction} className="space-y-8">
      <div>
        <label
          htmlFor="title"
          className="block text-lg font-medium text-gray-700 mb-2"
        >
          Title
        </label>
        <input
          id="title"
          name="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full border border-gray-300 rounded-md px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="price"
          className="block text-lg font-medium text-gray-700 mb-2"
        >
          Price
        </label>
        <input
          id="price"
          name="price"
          type="text"
          inputMode="decimal"
          value={price}
          onBlur={handlePriceBlur}
          onChange={(event) => setPrice(event.target.value)}
          className="w-full border border-gray-300 rounded-md px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <FormErrors errors={state.errors} />

      <button
        type="submit"
        disabled={pending}
        className="bg-blue-600 text-white text-lg px-6 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending ? 'Creating...' : 'Create Ticket'}
      </button>
    </form>
  );
}
