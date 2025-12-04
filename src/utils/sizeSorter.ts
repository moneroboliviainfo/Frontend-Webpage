// Generic size sorter used across product and outfit pages
// - Numeric sizes ("28","30") sorted numerically ascending
// - Standard labels (XXS, XS, S, M, L, XL, XXL, 3XL...) sorted by a defined order
// - Mixed/unknown size types return original order

export type SizeLike = { size: string };

const STANDARD_ORDER = [
  'XXS',
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  '2XL',
  '3XL',
  '4XL',
  '5XL',
];

const normalize = (s: string) => String(s).trim().toUpperCase();

export default function sortSizes<T extends SizeLike>(
  sizes: T[] | undefined
): T[] {
  if (!Array.isArray(sizes) || sizes.length === 0) return sizes || [];

  const allNumeric = sizes.every((s) => /^\d+$/.test(String(s.size).trim()));
  const allStandard = sizes.every((s) =>
    STANDARD_ORDER.includes(normalize(s.size))
  );

  if (allNumeric) {
    return sizes.slice().sort((a, b) => Number(a.size) - Number(b.size));
  }

  if (allStandard) {
    const indexOf = (lbl: string) => STANDARD_ORDER.indexOf(normalize(lbl));
    return sizes.slice().sort((a, b) => indexOf(a.size) - indexOf(b.size));
  }

  return sizes.slice();
}
