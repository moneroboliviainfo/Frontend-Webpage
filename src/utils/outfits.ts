// Lightweight helpers for outfits filtering/mapping
export type Gender = 'male' | 'female';

export function filterOutfitsByGender(
  outfits: unknown[],
  gender?: string | Gender
) {
  // Accept frontend page genders ('men'|'women') as well as API genders ('male'|'female')
  const normalize = (g?: string) => {
    if (!g) return undefined;
    const s = String(g).toLowerCase();
    if (s === 'men') return 'male' as Gender;
    if (s === 'women') return 'female' as Gender;
    if (s === 'male' || s === 'female') return s as Gender;
    return undefined;
  };

  const target = normalize(String(gender ?? ''));
  if (!target) return outfits;

  return outfits.filter((o) => {
    const og = (o as unknown as { gender?: string }).gender;
    return normalize(og) === target;
  });
}

const outfitsUtils = { filterOutfitsByGender };

export default outfitsUtils;
