export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    total?: number;
    cursor?: string;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResult<T> = ApiResponse<T> | ApiError;
