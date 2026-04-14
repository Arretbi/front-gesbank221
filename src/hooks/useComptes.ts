import { useState, useEffect, useCallback } from 'react';
import type { Compte } from '@/types/compte';
import { banqueApi } from '@/api/banque';

export function useComptes() {
  const [comptes, setComptes] = useState<Compte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await banqueApi.getComptes();
      setComptes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { comptes, loading, error, refresh };
}
