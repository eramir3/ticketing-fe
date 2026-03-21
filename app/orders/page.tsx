import Link from 'next/link';
import { ApiGateway } from '../api/routes';
import { buildServerFetchClient } from '../api/build-server-client';
import FormErrors, { type FormError } from '../components/form-errors';

const ORDERS_QUERY = `
  query Orders {
    orders {
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

type OrderTicket = {
  id?: string | null;
  title?: string | null;
  price?: number | null;
};

type Order = {
  id: string;
  status?: string | null;
  expiresAt?: string | null;
  ticket?: OrderTicket | null;
};

type OrdersQueryResponse = {
  orders: Order[];
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

async function fetchOrders(): Promise<{
  orders: Order[];
  errors: FormError[] | null;
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
        query: ORDERS_QUERY,
      }),
    });

    const payload =
      (await response.json().catch(() => null)) as GraphqlResponse<OrdersQueryResponse> | null;

    if (!response.ok || payload?.errors?.length || !payload?.data?.orders) {
      return {
        orders: [],
        errors: extractGraphqlErrors(payload, 'Failed to load orders.'),
      };
    }

    return {
      orders: payload.data.orders,
      errors: null,
    };
  } catch {
    return {
      orders: [],
      errors: [{ message: 'Failed to load orders.' }],
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

function formatPrice(price: number | null | undefined): string {
  if (typeof price !== 'number') {
    return '$--';
  }

  return `$${price.toFixed(2)}`;
}

function formatExpiration(expiresAt: string | null | undefined): string | null {
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

export default async function OrdersPage() {
  const { orders, errors } = await fetchOrders();

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="space-y-3">
          <h1 className="text-5xl font-semibold text-gray-900">
            My Orders
          </h1>
          <p className="text-lg text-gray-600">
            Review your active reservations and completed purchases.
          </p>
        </div>

        {errors ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <FormErrors errors={errors} className="space-y-2 text-red-700" />
          </div>
        ) : null}

        {!errors && orders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-gray-600">
            You do not have any orders yet.
          </div>
        ) : null}

        {orders.length > 0 ? (
          <div className="grid gap-4">
            {orders.map((order) => {
              const expiration = formatExpiration(order.expiresAt);

              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-3">
                      <h2 className="text-2xl font-semibold text-gray-900">
                        {order.ticket?.title ?? 'Untitled Ticket'}
                      </h2>
                      <p className="text-sm uppercase tracking-wide text-gray-500">
                        Order ID
                      </p>
                      <p className="break-all text-sm text-gray-700">
                        {order.id}
                      </p>
                      {expiration ? (
                        <p className="text-sm text-gray-600">
                          Expires {expiration}
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-3 sm:text-right">
                      <p className="text-sm uppercase tracking-wide text-gray-500">
                        Status
                      </p>
                      <p className="text-lg font-medium text-gray-900">
                        {order.status ?? 'Unknown'}
                      </p>
                      <p className="text-3xl font-semibold text-gray-900">
                        {formatPrice(order.ticket?.price)}
                      </p>
                      <p className="text-sm font-medium text-blue-700">
                        View order
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    </main>
  );
}
