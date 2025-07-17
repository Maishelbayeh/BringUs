// API utility functions for handling rate limiting and retries

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
}

/**
 * Retry function with exponential backoff
 * @param fn - Function to retry
 * @param options - Retry configuration
 * @returns Promise with the result
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 10000 } = options;
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // If we've exceeded max retries, throw immediately
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      //CONSOLE.log(`Request failed. Retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};

/**
 * Fetch wrapper with rate limiting and retry logic
 * @param url - API endpoint
 * @param options - Fetch options
 * @param retryOptions - Retry configuration
 * @returns Promise with the response
 */
export const fetchWithRetry = async (
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> => {
  return retryWithBackoff(async () => {
    const response = await fetch(url, options);
    
    // If it's a 429 error, throw to trigger retry
    if (response.status === 429) {
      throw new Error('Rate limit exceeded');
    }
    
    return response;
  }, retryOptions);
};

/**
 * Get authentication headers
 * @returns Headers object with auth token
 */
export const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

/**
 * Build query string from parameters
 * @param params - Parameters object
 * @returns Query string
 */
export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });
  return searchParams.toString();
};

/**
 * Handle API response and extract data
 * @param response - Fetch response
 * @returns Parsed response data
 */
export const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.');
    }
    if (response.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    }
    if (response.status === 403) {
      throw new Error('Access denied. You do not have permission to perform this action.');
    }
    if (response.status === 404) {
      throw new Error('Resource not found.');
    }
    if (response.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  try {
    return await response.json();
  } catch (error) {
    throw new Error('Failed to parse response data');
  }
}; 