import { redirect } from 'next/navigation';
import { ApiGateway } from '../../api/routes';
import { buildServerFetchClient } from '../../api/build-server-client';
import type { FormError } from '../../components/form-errors';
import { rethrowNextErrors } from '../../lib/next-errors';
import TicketForm from './ticket-form';
import type { CreateTicketState } from './types';

const CREATE_TICKET_MUTATION = `
  mutation CreateTicket($createTicketInput: CreateTicketInput!) {
    createTicket(createTicketInput: $createTicketInput) {
      id
    }
  }
`;

type CreateTicketMutationResponse = {
  createTicket: {
    id: string;
  };
};

type GraphqlError = {
  message?: string;
  extensions?: {
    errors?: FormError[];
  };
};

type GraphqlResponse<T> = {
  data?: T;
  errors?: GraphqlError[];
};

async function createTicket(
  _prevState: CreateTicketState,
  formData: FormData,
): Promise<CreateTicketState> {
  'use server';

  const title = String(formData.get('title') ?? '').trim();
  const rawPrice = String(formData.get('price') ?? '').trim();
  const errors = validateTicketForm(title, rawPrice);

  if (errors.length > 0) {
    return { errors };
  }

  const result = await submitCreateTicket({
    title,
    price: Number(rawPrice),
  });

  if (!result.ok) {
    return { errors: result.errors };
  }

  redirect('/');
}

async function submitCreateTicket({
  title,
  price,
}: {
  title: string;
  price: number;
}): Promise<{ ok: true } | { ok: false; errors: FormError[] }> {
  try {
    const fetchClient = await buildServerFetchClient();
    const response = await fetchClient(ApiGateway.Graphql, {
      cache: 'no-store',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: CREATE_TICKET_MUTATION,
        variables: {
          createTicketInput: {
            title,
            price,
          },
        },
      }),
    });

    const payload =
      (await response.json().catch(() => null)) as GraphqlResponse<CreateTicketMutationResponse> | null;

    if (
      !response.ok ||
      payload?.errors?.length ||
      !payload?.data?.createTicket
    ) {
      return {
        ok: false,
        errors: extractGraphqlErrors(payload, 'Ticket creation failed'),
      };
    }

    return { ok: true };
  } catch (error) {
    rethrowNextErrors(error);
    return {
      ok: false,
      errors: [{ message: 'Network error. Try again.' }],
    };
  }
}

function validateTicketForm(title: string, rawPrice: string): FormError[] {
  const errors: FormError[] = [];

  if (!title) {
    errors.push({ field: 'title', message: 'Title is required' });
  }

  if (!rawPrice) {
    errors.push({ field: 'price', message: 'Price is required' });
    return errors;
  }

  const price = Number(rawPrice);

  if (Number.isNaN(price)) {
    errors.push({ field: 'price', message: 'Price must be a number' });
  } else if (price <= 0) {
    errors.push({
      field: 'price',
      message: 'Price must be greater than 0',
    });
  }

  return errors;
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

export default function NewTicketPage() {
  return (
    <div className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="max-w-3xl">
        <h1 className="text-5xl font-semibold text-gray-900 mb-10">
          Create a Ticket
        </h1>

        <TicketForm action={createTicket} />
      </div>
    </div>
  );
}
