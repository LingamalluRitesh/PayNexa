export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
  };
  meta?: {
    page?: number;
    limit?: number;
    totalCount?: number;
    hasMore?: boolean;
    timestamp: string;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  startingAfter?: string;
  endingBefore?: string;
}

export interface IdempotencyRecord {
  key: string;
  merchantId: string;
  path: string;
  requestHash: string;
  responseStatus: number;
  responseBody: string;
  createdAt: string;
  expiresAt: string;
}
