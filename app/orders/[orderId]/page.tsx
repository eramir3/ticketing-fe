import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { buildServerFetchClient } from '../../api/build-server-client';
import { serverFetch } from '../../api/server-fetch';
import { ApiGateway } from '../../api/routes';
import FormErrors, { type FormError } from '../../components/form-errors';
import { HttpMethod } from '../../auth/signin/types';
import OrderCountdown from './order-countdown';
import type { PaymentState } from './types';

const CREATE_ORDER_MUTATION = `
  mutation CreateOrder($createOrderInput: CreateOrderInput!) {
    createOrder(createOrderInput: $createOrderInput) {
      id
    }
  }
`;

const ORDER_QUERY = `
  query Order($id: String!) {
    order(id: $id) {
      id
      status
      expiresAt
      ticket {
        id
        title
        price
      }
    }
  }
`;

type Ticket = {
  id?: string | null;
  title?: string | null;
  price?: number | null;
};

type Order = {
  id: string;
  status: string | null;
  expiresAt: string | null;
  ticket?: Ticket | null;
};

type OrderQueryResponse = {
  order: Order;
};

type CreateOrderMutationResponse = {
  createOrder: {
    id: string;
  };
};

type GraphqlResponse<T> = {
  data?: T;
  errors?: Array<{
    message?: string;
    extensions?: {
      errors?: FormError[];
    };
  }>;
};

async function createOrder(ticketId: string): Promise<
  | { ok: true; orderId: string }
  | { ok: false; errors: FormError[]; notFound: boolean }
> {
  try {
    const fetchClient = await buildServerFetchClient();
    const response = await fetchClient(ApiGateway.Graphql, {
      cache: 'no-store',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: CREATE_ORDER_MUTATION,
        variables: {
          createOrderInput: {
            ticketId,
          },
        },
      }),
    });

    const payload =
      (await response.json().catch(() => null)) as GraphqlResponse<CreateOrderMutationResponse> | null;

    if (
      !response.ok ||
      payload?.errors?.length ||
      !payload?.data?.createOrder?.id
    ) {
      const errors = extractGraphqlErrors(payload, 'Order creation failed');
      const isNotFound = errors.some(
        (error) => error.message === 'Not Found',
      );

      return {
        ok: false,
        errors,
        notFound: isNotFound,
      };
    }

    return {
      ok: true,
      orderId: payload.data.createOrder.id,
    };
  } catch {
    return {
      ok: false,
      errors: [{ message: 'Network error. Try again.' }],
      notFound: false,
    };
  }
}

async function fetchOrder(orderId: string): Promise<{
  order: Order | null;
  errors: FormError[] | null;
  notFound: boolean;
}> {
  try {
    const fetchClient = await buildServerFetchClient();
    const response = await fetchClient(ApiGateway.Graphql, {
      cache: 'no-store',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: ORDER_QUERY,
        variables: {
          id: orderId,
        },
      }),
    });

    const payload =
      (await response.json().catch(() => null)) as GraphqlResponse<OrderQueryResponse> | null;

    if (!response.ok || payload?.errors?.length || !payload?.data?.order) {
      const errors = extractGraphqlErrors(payload, 'Failed to load order.');
      const isNotFound = errors.some(
        (error) => error.message === 'Not Found',
      );

      return {
        order: null,
        errors: isNotFound ? null : errors,
        notFound: isNotFound,
      };
    }

    return {
      order: payload.data.order,
      errors: null,
      notFound: false,
    };
  } catch {
    return {
      order: null,
      errors: [{ message: 'Failed to load order.' }],
      notFound: false,
    };
  }
}

function extractGraphqlErrors<T>(
  payload: GraphqlResponse<T> | null,
  fallbackMessage: string,
): FormError[] {
  const nestedErrors =
    payload?.errors
      ?.flatMap((error) => error.extensions?.errors ?? [])
      .filter(
        (error): error is FormError =>
          typeof error?.message === 'string' &&
          (error.field === undefined || typeof error.field === 'string'),
      ) ?? [];

  if (nestedErrors.length > 0) {
    return nestedErrors;
  }

  const topLevelErrors =
    payload?.errors
      ?.map((error) =>
        typeof error.message === 'string'
          ? { message: error.message }
          : null,
      )
      .filter((error): error is FormError => error !== null) ?? [];

  return topLevelErrors.length > 0
    ? topLevelErrors
    : [{ message: fallbackMessage }];
}

function getSingleSearchParam(
  value: string | string[] | undefined,
): string | null {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value) && value.length > 0) {
    return value[0] ?? null;
  }

  return null;
}

async function createPayment(
  _prevState: PaymentState,
  formData: FormData,
): Promise<PaymentState> {
  'use server';

  const orderId = String(formData.get('orderId') ?? '').trim();

  if (!orderId) {
    return {
      errors: [{ field: 'orderId', message: 'Order ID is required.' }],
    };
  }

  const result = await serverFetch<{ id?: string; orderId?: string }>({
    url: ApiGateway.Payments,
    method: HttpMethod.Post,
    body: { orderId },
    fallbackMessage: 'Payment failed',
    onSuccess: async () => {
      redirect(`/orders/${orderId}?paid=1`);
    },
  });

  if (!result.ok) {
    return {
      errors: result.errors,
    };
  }

  return {
    errors: null,
  };
}

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{
    ticketId?: string | string[];
    paid?: string | string[];
  }>;
}) {
  const { orderId } = await params;
  const resolvedSearchParams = await searchParams;
  const paymentCreated = getSingleSearchParam(resolvedSearchParams.paid) === '1';

  if (orderId === 'new') {
    const ticketId = getSingleSearchParam(resolvedSearchParams.ticketId);

    if (!ticketId) {
      return (
        <main className="min-h-screen bg-gray-100 px-6 py-10">
          <div className="max-w-3xl mx-auto space-y-8">
            <Link
              href="/"
              className="inline-flex text-sm font-medium text-blue-700 hover:text-blue-900"
            >
              Back to tickets
            </Link>
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
              <FormErrors errors={[{ message: 'Ticket ID is required.' }]} />
            </div>
          </div>
        </main>
      );
    }

    const result = await createOrder(ticketId);

    if (result.ok) {
      redirect(`/orders/${result.orderId}`);
    }

    if (result.notFound) {
      notFound();
    }

    return (
      <main className="min-h-screen bg-gray-100 px-6 py-10">
        <div className="max-w-3xl mx-auto space-y-8">
          <Link
            href={`/tickets/${ticketId}`}
            className="inline-flex text-sm font-medium text-blue-700 hover:text-blue-900"
          >
            Back to ticket
          </Link>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-red-700">
              Could Not Create Order
            </p>
            <FormErrors
              errors={result.errors}
              className="mt-4 space-y-2 text-red-700"
            />
          </div>
        </div>
      </main>
    );
  }

  const result = await fetchOrder(orderId);

  if (result.notFound) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link
          href={result.order?.ticket?.id ? `/tickets/${result.order.ticket.id}` : '/'}
          className="inline-flex text-sm font-medium text-blue-700 hover:text-blue-900"
        >
          Back
        </Link>

        {result.errors || !result.order ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
            <FormErrors
              errors={result.errors ?? [{ message: 'Failed to load order.' }]}
              className="space-y-2 text-red-700"
            />
          </div>
        ) : (
          <article className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
              Order Details
            </p>
            {paymentCreated ? (
              <div className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-4 text-green-800">
                Payment created successfully.
              </div>
            ) : null}
            <h1 className="mt-4 text-4xl font-semibold text-gray-900">
              {result.order.ticket?.title ?? 'Untitled Ticket'}
            </h1>
            <div className="mt-8 rounded-xl bg-gray-50 p-6">
              <p className="text-sm uppercase tracking-wide text-gray-500">
                Order ID
              </p>
              <p className="mt-2 break-all text-base font-medium text-gray-900">
                {result.order.id}
              </p>
              <p className="mt-6 text-sm uppercase tracking-wide text-gray-500">
                Price
              </p>
              <p className="mt-2 text-4xl font-semibold text-gray-900">
                $
                {typeof result.order.ticket?.price === 'number'
                  ? result.order.ticket.price.toFixed(2)
                  : '--'}
              </p>
              <p className="mt-6 text-sm uppercase tracking-wide text-gray-500">
                Status
              </p>
              <p className="mt-2 text-lg font-medium text-gray-900">
                {result.order.status ?? 'Unknown'}
              </p>
            </div>

            <OrderCountdown
              expiresAt={result.order.expiresAt}
              status={result.order.status}
              price={result.order.ticket?.price ?? null}
              orderId={result.order.id}
              action={createPayment}
            />
          </article>
        )}
      </div>
    </main>
  );
}
