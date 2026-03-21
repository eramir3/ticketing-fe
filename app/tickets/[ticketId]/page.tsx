import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buildServerFetchClient } from '../../api/build-server-client';
import { ApiGateway } from '../../api/routes';

const TICKET_QUERY = `
  query Ticket($id: String!) {
    ticket(id: $id) {
      id
      title
      price
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
  }>;
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
            <Link
              href={`/orders/new?ticketId=${result.ticket.id}`}
              className="mt-10 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-6 py-4 text-lg font-medium text-white transition-colors hover:bg-blue-700"
            >
              Purchase Ticket
            </Link>
          </article>
        )}
      </div>
    </main>
  );
}
