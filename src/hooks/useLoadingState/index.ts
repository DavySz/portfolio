import { useState, useEffect, useCallback } from "react";

interface UseLoadingStateOptions {
  initialDelay?: number;
  minLoadingTime?: number;
  initialState?: boolean;
}

interface UseLoadingStateReturn {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
  withLoading: <T>(asyncFn: () => Promise<T>) => Promise<T>;
}

export const useLoadingState = (
  options: UseLoadingStateOptions = {}
): UseLoadingStateReturn => {
  const {
    initialDelay = 0,
    minLoadingTime = 1000,
    initialState = true,
  } = options;

  const [isLoading, setIsLoading] = useState(initialState);

  useEffect(() => {
    if (initialState) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, initialDelay + minLoadingTime);

      return () => clearTimeout(timer);
    }
  }, [initialDelay, minLoadingTime, initialState]);

  const startLoading = useCallback(() => {
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const withLoading = useCallback(
    async <T>(asyncFn: () => Promise<T>): Promise<T> => {
      try {
        setIsLoading(true);
        const result = await asyncFn();
        return result;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    isLoading,
    startLoading,
    stopLoading,
    withLoading,
  };
};
