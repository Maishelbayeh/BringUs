import { useState, useEffect, useCallback } from 'react';

interface RateLimitState {
  isLimited: boolean;
  remainingRequests: number;
  resetTime: Date | null;
  retryAfter: number | null;
}

const useRateLimit = () => {
  const [rateLimitState, setRateLimitState] = useState<RateLimitState>({
    isLimited: false,
    remainingRequests: 100, // Default limit from backend
    resetTime: null,
    retryAfter: null,
  });

  const updateRateLimitFromHeaders = useCallback((headers: Headers) => {
    const remaining = headers.get('X-RateLimit-Remaining');
    const reset = headers.get('X-RateLimit-Reset');
    const retryAfter = headers.get('Retry-After');

    if (remaining !== null) {
      const remainingCount = parseInt(remaining, 10);
      setRateLimitState(prev => ({
        ...prev,
        remainingRequests: remainingCount,
        isLimited: remainingCount <= 0,
      }));
    }

    if (reset !== null) {
      const resetTime = new Date(parseInt(reset, 10) * 1000);
      setRateLimitState(prev => ({
        ...prev,
        resetTime,
      }));
    }

    if (retryAfter !== null) {
      const retryAfterSeconds = parseInt(retryAfter, 10);
      setRateLimitState(prev => ({
        ...prev,
        retryAfter: retryAfterSeconds,
        isLimited: true,
      }));
    }
  }, []);

  const handleRateLimitError = useCallback((response: Response) => {
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const retryAfterSeconds = retryAfter ? parseInt(retryAfter, 10) : 60; // Default 1 minute

      setRateLimitState({
        isLimited: true,
        remainingRequests: 0,
        resetTime: new Date(Date.now() + retryAfterSeconds * 1000),
        retryAfter: retryAfterSeconds,
      });

      return retryAfterSeconds;
    }
    return 0;
  }, []);

  const resetRateLimit = useCallback(() => {
    setRateLimitState({
      isLimited: false,
      remainingRequests: 100,
      resetTime: null,
      retryAfter: null,
    });
  }, []);

  // Auto-reset when reset time is reached
  useEffect(() => {
    if (rateLimitState.resetTime) {
      const now = new Date();
      const timeUntilReset = rateLimitState.resetTime.getTime() - now.getTime();

      if (timeUntilReset > 0) {
        const timer = setTimeout(() => {
          resetRateLimit();
        }, timeUntilReset);

        return () => clearTimeout(timer);
      } else {
        resetRateLimit();
      }
    }
  }, [rateLimitState.resetTime, resetRateLimit]);

  return {
    ...rateLimitState,
    updateRateLimitFromHeaders,
    handleRateLimitError,
    resetRateLimit,
  };
};

export default useRateLimit; 