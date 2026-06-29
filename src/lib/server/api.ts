import { z, ZodError } from 'zod';
import pino from 'pino';
import type { ApiError, ApiResponse, ApiResult } from './types';

const logger = pino({ name: 'lantern-api' });

export interface ApiContext {
  user?: {
    id: string;
    role?: string;
  };
}

export interface ApiRequest extends Request {
  json(): Promise<unknown>;
}

export function createApiHandler<TInput, TData>(
  handler: (parsedBody: TInput, context?: ApiContext) => Promise<ApiResult<TData>> | ApiResult<TData>,
  schema?: z.ZodType<TInput>,
) {
  return async function wrappedHandler(request: ApiRequest, context?: ApiContext) {
    try {
      let parsedBody: TInput | undefined;

      if (request.method !== 'GET' && request.method !== 'DELETE') {
        const body = await request.json().catch(() => ({}));
        parsedBody = schema ? schema.parse(body) : (body as TInput);
      }

      const result = await handler(parsedBody as TInput, context);
      return Response.json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn({ error }, 'Input validation failed');
        const details = error.issues.reduce<Record<string, string>>((acc, issue) => {
          const path = issue.path.length ? issue.path.join('.') : 'body';
          acc[path] = issue.message;
          return acc;
        }, {});

        const response: ApiError = {
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Input validation failed.',
            details,
          },
        };
        return Response.json(response, { status: 400 });
      }

      logger.error({ error }, 'Unhandled API error');
      const response: ApiError = {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred.',
        },
      };
      return Response.json(response, { status: 500 });
    }
  };
}

export function jsonSuccess<T>(data: T, meta?: ApiResponse<T>['meta']): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(meta ? { meta } : {}),
  };
}

export function jsonError(code: string, message: string, details?: unknown): ApiError {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
}
