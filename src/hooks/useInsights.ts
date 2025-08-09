import { useState, useCallback, useEffect } from 'react';
import { GeminiService, GeminiInsight } from '../services/gemini';
import { FinancialData } from '../types/financial';
import { generateDataHash } from '../lib/crypto';

const INSIGHTS_CACHE_KEY = 'longevai_insights_cache';
const DB_VERSION_KEY = 'longevai_db_version';

interface CachedInsights {
  hash: string;
  insights: GeminiInsight[];
  timestamp: number;
}

export const useInsights = (data: FinancialData | null) => {
  const [insights, setInsights] = useState<GeminiInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);

  const generateAndCacheInsights = useCallback(async (forceRecalculate = false) => {
    if (!data || data.allTransactions.length === 0) {
      setLoading(false);
      setInsights([]);
      return;
    }

    setLoading(true);
    setError(null);
    setIsCached(false);

    try {
      // Use a DB version salt to invalidate cache when DB is re-imported
      const dbVersion = localStorage.getItem(DB_VERSION_KEY) || '0';
      const dataHash = await generateDataHash({ tx: data.allTransactions, v: dbVersion });

      if (!forceRecalculate) {
        const cachedItem = localStorage.getItem(INSIGHTS_CACHE_KEY);
        if (cachedItem) {
          const cached: CachedInsights = JSON.parse(cachedItem);
          if (cached.hash === dataHash) {
            setInsights(cached.insights);
            setIsCached(true);
            setLoading(false);
            return;
          }
        }
      }

      const geminiService = new GeminiService();
      const newInsights = await geminiService.generateInsights(data);
      setInsights(newInsights);

      const cacheToStore: CachedInsights = {
        hash: dataHash,
        insights: newInsights,
        timestamp: Date.now(),
      };
      localStorage.setItem(INSIGHTS_CACHE_KEY, JSON.stringify(cacheToStore));

    } catch (err) {
      setError('Failed to generate AI insights. Please check your API key.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [data]);

  useEffect(() => {
    generateAndCacheInsights();
  }, [generateAndCacheInsights]);

  return { insights, loading, error, isCached, recalculateInsights: () => generateAndCacheInsights(true) };
};