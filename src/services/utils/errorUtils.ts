import { showToast } from './toast';

export interface ApiErrorOptions {
  showToast?: boolean;
  customMessage?: string;
  silent?: boolean;
}

class ApiError extends Error {
  status: number;
  statusText: string;
  originalMessage: string;

  constructor(status: number, statusText: string, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.originalMessage = message;
  }
}

export const errorUtils = {
  async apiError(
    response: Response, 
    options: ApiErrorOptions = {}
  ): Promise<never> {
    const { showToast: shouldShowToast = false, customMessage, silent = false } = options;
    
    let errorMessage = customMessage || `HTTP ${response.status}: ${response.statusText}`;
    
    if (!customMessage) {
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (parseError) {
        try {
          const errorText = await response.text();
          if (errorText) errorMessage = errorText;
        } catch (textError) {
          if (!silent) {
            console.error('Could not parse error response:', textError);
          }
        }
      }
    }

    if (shouldShowToast) {
      showToast.error('API Error', errorMessage);
    }

    if (!silent) {
      console.error(`API Error [${response.status}]:`, errorMessage);
    }

    throw new ApiError(response.status, response.statusText, errorMessage);
  },

  async throwApiError(response: Response, message?: string): Promise<never> {
    return this.apiError(response, { customMessage: message });
  },

  async throwApiErrorWithToast(response: Response, message?: string): Promise<never> {
    return this.apiError(response, { 
      customMessage: message, 
      showToast: true 
    });
  },

  isHttpError(error: unknown, status: number): boolean {
    return error instanceof ApiError && error.status === status;
  },

  isAuthError(error: unknown): boolean {
    return this.isHttpError(error, 401);
  },


  isNotFoundError(error: unknown): boolean {
    return this.isHttpError(error, 404);
  },

  genericError(error: unknown, context: string = 'Operation', silent: boolean = false): never {
    if (error instanceof ApiError) {
      throw error; 
    }

    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    
    if (!silent) {
      console.error(`${context} failed:`, error);
    }

    throw new Error(`${context} failed: ${message}`);
  }
};

export { ApiError };
