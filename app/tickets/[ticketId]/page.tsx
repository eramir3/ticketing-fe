import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buildServerFetchClient } from '../../api/build-server-client';
import { ApiGateway } from '../../api/routes';
import type { FormError } from '../../components/form-errors';
import { rethrowNextErrors } from '../../lib/next-errors';
import PurchaseTicketForm, {
  type PurchaseTicketState,
} from './purchase-ticket-form';

const TICKET_QUERY = `
  query Ticket($id: String!) {
    ticket(id: $id) {
      id
      title
      price
    }
  }
`;

const CREATE_ORDER_MUTATION = `
  mutation CreateOrder($createOrderInput: CreateOrderInput!) {
    createOrder(createOrderInput: $createOrderInput) {
      id
      status
      expiresAt
    }
  }
`;

type Ticket = {
  id: string;
  title: string | null;
  price: number | null;
};

type TicketQueryResponse = {
  ticket: Ticket;
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

type CreateOrderMutationResponse = {
  createOrder: {
    id: string;
    status: string | null;
    expiresAt: string | null;
  };
};

async function fetchTicket(ticketId: string): Promise<{
  ticket: Ticket | null;
  error: string | null;
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
        query: TICKET_QUERY,
        variables: {
          id: ticketId,
        },
      }),
    });

    const payload =
      (await response.json().catch(() => null)) as GraphqlResponse<TicketQueryResponse> | null;
    const errorMessage =
      payload?.errors?.find((error) => typeof error.message === 'string')
        ?.message ?? null;

    if (!response.ok || !payload?.data?.ticket) {
      return {
        ticket: null,
        error: errorMessage === 'Not Found' ? null : errorMessage ?? 'Failed to load ticket.',
        notFound: errorMessage === 'Not Found',
      };
    }

    return {
      ticket: payload.data.ticket,
      error: null,
      notFound: false,
    };
  } catch {
    return {
      ticket: null,
      error: 'Failed to load ticket.',
      notFound: false,
    };
  }
}

async function createOrder(
  _prevState: PurchaseTicketState,
  formData: FormData,
): Promise<PurchaseTicketState> {
  'use server';

  const ticketId = String(formData.get('ticketId') ?? '').trim();

  if (!ticketId) {
    return {
      errors: [{ field: 'ticketId', message: 'Ticket ID is required' }],
      order: null,
    };
  }

  const result = await submitCreateOrder(ticketId);

  if (!result.ok) {
    return {
      errors: result.errors,
      order: null,
    };
  }

  return {
    errors: null,
    order: result.order,
  };
}

async function submitCreateOrder(
  ticketId: string,
): Promise<
  | {
      ok: true;
      order: {
        id: string;
        status: string | null;
        expiresAt: string | null;
      };
    }
  | { ok: false; errors: FormError[] }
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
      !payload?.data?.createOrder
    ) {
      return {
        ok: false,
        errors: extractGraphqlErrors(payload, 'Order creation failed'),
      };
    }

    return {
      ok: true,
      order: payload.data.createOrder,
    };
  } catch (error) {
    rethrowNextErrors(error);
    return {
      ok: false,
      errors: [{ message: 'Network error. Try again.' }],
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

export default async function TicketDetailsPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const { ticketId } = await params;
  const result = await fetchTicket(ticketId);

  if (result.notFound) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link
          href="/"
          className="inline-flex text-sm font-medium text-blue-700 hover:text-blue-900"
        >
          Back to tickets
        </Link>

        {result.error || !result.ticket ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {result.error ?? 'Failed to load ticket.'}
          </div>
        ) : (
          <article className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-gray-500">
              Ticket Details
            </p>
            <h1 className="mt-4 text-5xl font-semibold text-gray-900">
              {result.ticket.title ?? 'Untitled Ticket'}
            </h1>
            <div className="mt-10 rounded-xl bg-gray-50 p-6">
              <p className="text-sm uppercase tracking-wide text-gray-500">
                Price
              </p>
              <p className="mt-2 text-4xl font-semibold text-gray-900">
                $
                {typeof result.ticket.price === 'number'
                  ? result.ticket.price.toFixed(2)
                  : '--'}
              </p>
            </div>
            <PurchaseTicketForm
              action={createOrder}
              ticketId={result.ticket.id}
            />
          </article>
        )}
      </div>
    </main>
  );
}
