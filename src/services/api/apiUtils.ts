import { authUtils } from '../utils/authUtils';
import { errorUtils } from '../utils/errorUtils';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  includeAuth?: boolean;
  credentials?: RequestCredentials;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    body,
    headers = {},
    includeAuth = true,
    credentials = 'include'
  } = options;

  const url = `${API_URL}${endpoint}`;

  const requestHeaders: Record<string, string> = {
    ...headers,
  };

  if (includeAuth) {
    Object.assign(requestHeaders, authUtils.getAuthHeaders());
  }

  if (body && !requestHeaders['Content-Type']) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  const requestConfig: RequestInit = {
    method,
    headers: requestHeaders,
    credentials,
  };

  if (body) {
    requestConfig.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, requestConfig);

    if (!response.ok) {
      await errorUtils.throwApiError(response);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }


    return response.text() as T;
  } catch (error) {
    console.error(`API request failed for ${method} ${url}:`, error);
    throw error;
  }
}

export const apiGet = <T = any>(endpoint: string, options?: Omit<ApiOptions, 'method'>) =>
  apiRequest<T>(endpoint, { ...options, method: 'GET' });

export const apiPost = <T = any>(endpoint: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
  apiRequest<T>(endpoint, { ...options, method: 'POST', body });

export const apiPut = <T = any>(endpoint: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
  apiRequest<T>(endpoint, { ...options, method: 'PUT', body });

export const apiDelete = <T = any>(endpoint: string, options?: Omit<ApiOptions, 'method'>) =>
  apiRequest<T>(endpoint, { ...options, method: 'DELETE' });

export const apiPatch = <T = any>(endpoint: string, body?: any, options?: Omit<ApiOptions, 'method' | 'body'>) =>
  apiRequest<T>(endpoint, { ...options, method: 'PATCH', body });
