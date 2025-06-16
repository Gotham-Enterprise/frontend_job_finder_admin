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
  /**
   * Handles API response errors in a consistent way
   */
  async handleApiError(
    response: Response, 
    options: ApiErrorOptions = {}
  ): Promise<never> {
    const { showToast: shouldShowToast = false, customMessage, silent = false } = options;
    
    let errorMessage = customMessage || `HTTP ${response.status}: ${response.statusText}`;
    
    // Try to extract error message from response
    if (!customMessage) {
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        try {
          const errorText = await response.text();
          if (errorText) errorMessage = errorText;
        } catch (textError) {
          // Use default error message
          if (!silent) {
            console.error('Could not parse error response:', textError);
          }
        }
      }
    }

    // Show toast if requested
    if (shouldShowToast) {
      showToast.error('API Error', errorMessage);
    }

    // Log error if not silent
    if (!silent) {
      console.error(`API Error [${response.status}]:`, errorMessage);
    }

    throw new ApiError(response.status, response.statusText, errorMessage);
  },

  /**
   * Simplified error handler for quick use
   */
  async throwApiError(response: Response, message?: string): Promise<never> {
    return this.handleApiError(response, { customMessage: message });
  },

  /**
   * Error handler with toast notification
   */
  async throwApiErrorWithToast(response: Response, message?: string): Promise<never> {
    return this.handleApiError(response, { 
      customMessage: message, 
      showToast: true 
    });
  },

  /**
   * Checks if error is a specific HTTP status
   */
  isHttpError(error: unknown, status: number): boolean {
    return error instanceof ApiError && error.status === status;
  },

  /**
   * Checks if error is an authentication error
   */
  isAuthError(error: unknown): boolean {
    return this.isHttpError(error, 401);
  },

  /**
   * Checks if error is a not found error
   */
  isNotFoundError(error: unknown): boolean {
    return this.isHttpError(error, 404);
  },

  /**
   * Generic error handler for catch blocks
   */
  handleGenericError(error: unknown, context: string = 'Operation', silent: boolean = false): never {
    if (error instanceof ApiError) {
      throw error; // Re-throw API errors as-is
    }

    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    
    if (!silent) {
      console.error(`${context} failed:`, error);
    }

    throw new Error(`${context} failed: ${message}`);
  }
};

export { ApiError };
