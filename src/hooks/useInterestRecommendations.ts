import { useEffect, useState } from 'react';
import { API_URL } from '@/config/env';
import { calculatePrice } from '@/utils/price';
import { Product } from '@/components/ProductsGallery';

type SearchsResult = Array<{
  id: number;
  name: string;
  count?: number;
  gender?: string;
}>;

export type InterestItem = {
  id: number;
  name: string;
  price: string; // formatted final price like 'Bs. 469'
  discountPercent: number; // 0 if no discount
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

            // Filter by product category gender when provided
            const productGender = p.subcategory?.category?.gender;
            if (gender && productGender && productGender !== gender) continue;

            // Ensure product is enabled and has at least one color with multimedia
            if (!p.enabled) continue;
            if (!p.productColors || p.productColors.length === 0) continue;

            seen.add(p.id);

            const img =
              p.productColors && p.productColors.length > 0
                ? p.productColors[0].multimedia?.[0] ||
                  p.subcategory?.category?.image ||
                  ''
                : p.subcategory?.category?.image || '';
            const priceCalc = calculatePrice(p.price ?? '0', p.discount);
            const price = `Bs. ${priceCalc.finalPrice}`;
            accumulated.push({
              id: p.id,
              name: p.name,
              price,
              discountPercent: priceCalc.discountPercent || 0,
              image: img,
            });
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
