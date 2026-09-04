/**
 * HTTP error with a status code, thrown by services/middleware and rendered
 * by the unified error handler (task 1.8).
 */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export function badRequest(message: string): HttpError {
  return new HttpError(400, message, 'bad_request');
}

export function notFound(message: string): HttpError {
  return new HttpError(404, message, 'not_found');
}

export function unauthorized(message: string): HttpError {
  return new HttpError(401, message, 'unauthorized');
}

export function forbidden(message: string): HttpError {
  return new HttpError(403, message, 'forbidden');
}

export function tooManyRequests(message: string): HttpError {
  return new HttpError(429, message, 'too_many_requests');
}