import { config } from '../config/env';
import { ApiResponse, ApiError } from '../types';

class ApiClient {
  private getBaseURL(): string {
    // If explicitly set, use it
    if (config.apiBaseUrl) {
      return config.apiBaseUrl.trim().replace(/\/+$/, '');
    }
    
    // Auto-detect from current location
    if (typeof window !== 'undefined') {
      const backendPort = import.meta.env.VITE_API_PORT || '8000';
      const currentPort = window.location.port;
      const isDefaultPort = !currentPort || currentPort === '' || 
                           (window.location.protocol === 'https:' && currentPort === '443') ||
                           (window.location.protocol === 'http:' && currentPort === '80');
      
      // Same port or default port - use relative URLs (works with proxy/reverse proxy)
      // This is the best approach as it works with reverse proxy and same-origin setups
      if (isDefaultPort || currentPort === backendPort) {
        return '';
      }
      
      // Different port - auto-detect and construct URL from current hostname
      // This automatically uses the server's IP/domain
      return `${window.location.protocol}//${window.location.hostname}:${backendPort}`;
    }
    
    return '';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Ensure endpoint starts with /
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    // Get base URL dynamically (auto-detects server IP/domain)
    const baseURL = this.getBaseURL();
    
    // If baseURL is empty, use relative URL (works with proxy/reverse proxy)
    // If baseURL is set, concatenate it with endpoint (removes double slashes)
    const url = baseURL 
      ? `${baseURL}${normalizedEndpoint}`.replace(/([^:]\/)\/+/g, '$1')
      : normalizedEndpoint;
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      let backendResponse: any;
      try {
        backendResponse = await response.json();
      } catch (parseError) {
        // Response is not JSON (unlikely but possible)
        if (!response.ok) {
          const error: ApiError = {
            message: `HTTP error! status: ${response.status}`,
            status: response.status,
          };
          return { success: false, error };
        }
        const error: ApiError = {
          message: 'Invalid response format from server',
          status: response.status,
        };
        return { success: false, error };
      }

      // Backend returns { success: true, data: T } or { success: false, error: {...} }
      if (backendResponse.success === true && backendResponse.data !== undefined) {
        return { success: true, data: backendResponse.data };
      }

      if (backendResponse.success === false && backendResponse.error) {
        const error: ApiError = {
          message: backendResponse.error.message || 'Unknown error',
          status: response.status,
          code: backendResponse.error.code,
        };
        return { success: false, error };
      }

      // Fallback for HTTP errors (response.ok is false but backend didn't return error structure)
      if (!response.ok) {
        const error: ApiError = {
          message: backendResponse.error?.message || `HTTP error! status: ${response.status}`,
          status: response.status,
        };
        return { success: false, error };
      }

      // Unexpected response structure
      const error: ApiError = {
        message: 'Invalid response structure from server',
        status: response.status,
      };
      return { success: false, error };
    } catch (error) {
      const apiError: ApiError = {
        message: error instanceof Error ? error.message : 'Network error occurred',
      };
      return { success: false, error: apiError };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
