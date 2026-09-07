import { useState, useEffect, useCallback } from 'react';

/**
 * Custom React hook for fetching and refreshing Firestore collection queries
 */
export const useFirestoreQuery = (queryFn, deps = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await queryFn();
      setData(results || []);
    } catch (err) {
      console.warn("Firestore query hook error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch: execute };
};

export default useFirestoreQuery;
