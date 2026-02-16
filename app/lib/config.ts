const AUTH_BASE_URL = process.env.AUTH_BASE_URL;
if (!AUTH_BASE_URL) {
  throw new Error('AUTH_BASE_URL is not set');
}

const API_BASE_URL = process.env.API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error('API_BASE_URL is not set');
}

const NODE_ENV = process.env.NODE_ENV ?? 'development';

export { AUTH_BASE_URL, API_BASE_URL, NODE_ENV };
