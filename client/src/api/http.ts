const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export type FieldError = { field: string; message: string };

export class ApiError extends Error {
  status: number;
  errors?: FieldError[];

  constructor(message: string, status: number, errors?: FieldError[]) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

// The app registers a function here, to be told when the login has expired
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

// One place that talks to the API and turns failures into readable errors
export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
      credentials: 'include',
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection and try again.', 0);
  }

  const body = await response.json().catch(() => null);

        // A 401 on any other request means the login has expired
      if (response.status === 401 && !path.startsWith('/api/auth/login')) {
        onUnauthorized?.();
      }
      
  if (!response.ok) {
    throw new ApiError(body?.message ?? 'Something went wrong', response.status, body?.errors);
  }

  return body as T;
}