'use client';

import { useActionState, useEffect, useState } from 'react';
import FormErrors from '../../components/form-errors';
import type { PaymentState } from './types';

const initialState: PaymentState = {
  errors: null,
};

export default function OrderCountdown({
  expiresAt,
  status,
  price,
  orderId,
  action,
}: {
  expiresAt: string | null;
  status: string | null;
  price: number | null;
  orderId: string;
  action: (
    prevState: PaymentState,
    formData: FormData,
  ) => Promise<PaymentState>;
}) {
  const targetTime = expiresAt ? new Date(expiresAt).getTime() : Number.NaN;
  const hasValidExpiration = !Number.isNaN(targetTime);
  const [now, setNow] = useState(() => Date.now());
  const [state, formAction, pending] = useActionState(action, initialState);

  useEffect(() => {
    if (!hasValidExpiration) {
      return;
    }
    const timerId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [hasValidExpiration]);

  const timeLeft = hasValidExpiration
    ? Math.max(0, Math.ceil((targetTime - now) / 1000))
    : null;
  const canPay =
    status !== 'Complete' &&
    status !== 'Cancelled' &&
    timeLeft !== 0;

  if (status === 'Complete') {
    return (
      <div className="mt-8 space-y-4">
        <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-4 text-green-800">
          Order complete.
        </p>
      </div>
    );
  }

  if (status === 'Cancelled' || timeLeft === 0) {
    return (
      <div className="mt-8 space-y-4">
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-red-700">
          Order expired.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-4 text-blue-900">
        <p className="text-sm font-medium uppercase tracking-wide">
          Time Left To Pay
        </p>
        <p className="mt-2 text-3xl font-semibold">
          {timeLeft === null ? 'Unavailable' : formatTimeLeft(timeLeft)}
        </p>
      </div>

      {canPay ? (
        <form action={formAction} className="space-y-3">
          <input type="hidden" name="orderId" value={orderId} />
          <button
            type="submit"
            disabled={pending}
            className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-6 py-4 text-lg font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending
              ? 'Processing payment...'
              : `Pay ${formatPrice(price)}`}
          </button>
          <FormErrors errors={state.errors} />
        </form>
      ) : null}
    </div>
  );
}

function formatTimeLeft(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatPrice(price: number | null): string {
  if (typeof price !== 'number') {
    return '$--';
  }

  return `$${price.toFixed(2)}`;
}
