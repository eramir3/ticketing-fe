'use client';

import { useActionState } from 'react';
import FormErrors, { type FormError } from '../../components/form-errors';

export type PurchaseTicketState = {
  errors: FormError[] | null;
  order: {
    id: string;
    expiresAt: string | null;
    status: string | null;
  } | null;
};

const initialState: PurchaseTicketState = {
  errors: null,
  order: null,
};

export default function PurchaseTicketForm({
  action,
  ticketId,
}: {
  action: (
    prevState: PurchaseTicketState,
    formData: FormData,
  ) => Promise<PurchaseTicketState>;
  ticketId: string;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const hasOrder = Boolean(state.order?.id);
  const expirationLabel = formatExpiration(state.order?.expiresAt ?? null);

  return (
    <form action={formAction} className="mt-10 space-y-4">
      <input type="hidden" name="ticketId" value={ticketId} />

      {state.order ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-4 text-green-800">
          <p className="text-sm font-medium uppercase tracking-wide">
            Order Created
          </p>
          <p className="mt-2 text-sm">
            Order ID: <span className="font-medium">{state.order.id}</span>
          </p>
          {expirationLabel ? (
            <p className="mt-1 text-sm">
              Expires: <span className="font-medium">{expirationLabel}</span>
            </p>
          ) : null}
        </div>
      ) : null}

      <FormErrors errors={state.errors} />

      <button
        type="submit"
        disabled={pending || hasOrder}
        className="w-full rounded-xl bg-blue-600 px-6 py-4 text-lg font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending
          ? 'Purchasing...'
          : hasOrder
            ? 'Order Created'
            : 'Purchase Ticket'}
      </button>
    </form>
  );
}

function formatExpiration(expiresAt: string | null): string | null {
  if (!expiresAt) {
    return null;
  }

  const date = new Date(expiresAt);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}
