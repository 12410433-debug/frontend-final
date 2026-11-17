import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook dasar untuk fetch data asinkron
 * @param {Function} fetchFunction - Fungsi async pemanggil API
 */
export function useFetch(fetchFunction) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const executeFetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchFunction();
      setData(res?.data !== undefined ? res.data : res);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  useEffect(() => {
    let ignore = false;
    fetchFunction()
      .then((res) => {
        if (!ignore) {
          setData(res?.data !== undefined ? res.data : res);
          setError(null);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [fetchFunction]);

  return { data, loading, error, refetch: executeFetch };
}

export default useFetch;
