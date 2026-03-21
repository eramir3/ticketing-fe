import { buildServerFetchClient } from './api/build-server-client';
import { ApiGateway } from './api/routes';

const TICKETS_QUERY = `
  query Tickets {
    tickets {
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

type TicketsQueryResponse = {
  tickets: Ticket[];
};

type GraphqlResponse<T> = {
  data?: T;
  errors?: Array<{
    message?: string;
  }>;
};

async function fetchTickets(): Promise<{
  tickets: Ticket[];
  error: string | null;
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
        query: TICKETS_QUERY,
      }),
    });

    const payload =
      (await response.json().catch(() => null)) as GraphqlResponse<TicketsQueryResponse> | null;

    if (!response.ok || !payload?.data?.tickets) {
      return {
        tickets: [],
        error:
          payload?.errors?.find(
            (error) => typeof error.message === 'string',
          )?.message ?? 'Failed to load tickets.',
      };
    }

    return {
      tickets: payload.data.tickets,
      error: null,
    };
  } catch {
    return {
      tickets: [],
      error: 'Failed to load tickets.',
    };
  }
}

export default async function LandingPage() {
  const { tickets, error } = await fetchTickets();

  return (
    <main className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="space-y-3">
          <h1 className="text-5xl font-semibold text-gray-900">
            Tickets
          </h1>
          <p className="text-lg text-gray-600">
            Browse the latest tickets published in the marketplace.
          </p>
        </div>

        {error ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        ) : null}

        {!error && tickets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-gray-600">
            No tickets have been published yet.
          </div>
        ) : null}

        {tickets.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tickets.map((ticket) => (
              <article
                key={ticket.id}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <h2 className="text-2xl font-semibold text-gray-900">
                  {ticket.title ?? 'Untitled Ticket'}
                </h2>
                <p className="mt-3 text-sm uppercase tracking-wide text-gray-500">
                  Price
                </p>
                <p className="mt-1 text-3xl font-semibold text-gray-900">
                  $
                  {typeof ticket.price === 'number'
                    ? ticket.price.toFixed(2)
                    : '--'}
                </p>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}
