import { useEffect, useState } from 'react';
import { API_URL } from '@/config/env';

type Product = {
  id: number;
  name: string;
  description?: string;
  price?: string;
  enabled?: boolean;
  createdAt?: string;
  subcategory?: { category?: { image?: string } } | null;
};

type SearchsResult = Array<{
  id: number;
  name: string;
  count?: number;
  gender?: string;
}>;

export type InterestItem = {
  id: number;
  name: string;
  price: string;
  image: string;
};

export default function useInterestRecommendations(gender?: string, limit = 8) {
  const [items, setItems] = useState<InterestItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!gender) {
      setItems([]);
      setLoading(false);
      return;
    }

    let mounted = true;
    const accumulated: InterestItem[] = [];
    const seen = new Set<number>();

    async function load() {
      setLoading(true);
      try {
        // first call to get category-like search hints
        const resp = await fetch(
          `${API_URL}searchs?type=${encodeURIComponent(String(gender))}`
        );
        if (!resp.ok) throw new Error('searchs failed');
        const searchs: SearchsResult = await resp.json();

        for (const s of searchs) {
          if (!mounted) break;
          if (accumulated.length >= limit) break;

          const name = s.name;
          if (!name) continue;

          const adv = await fetch(
            `${API_URL}searchs/advanced?search=${encodeURIComponent(name)}`
          );
          if (!adv.ok) continue;
          const advJson = await adv.json();
          const data: Product[] = advJson?.data ?? [];

          for (const p of data) {
            if (!mounted) break;
            if (accumulated.length >= limit) break;

            // skip duplicates by product id
            if (seen.has(p.id)) continue;
            seen.add(p.id);

            const img = p.subcategory?.category?.image || '';
            const priceNum = Number(p.price ?? 0);
            const price = `Bs. ${Math.round(priceNum)}`;

            accumulated.push({ id: p.id, name: p.name, price, image: img });
          }
        }
      } catch (e) {
        void e;
        // ignore and return whatever we have
      } finally {
        if (mounted) {
          setItems(accumulated.slice(0, limit));
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [gender, limit]);

  return { items, loading };
}
