import slugify from './slugify';

export default function buildProductSlug(
  name: string | undefined | null,
  id: string | number | undefined | null
) {
  const base = slugify(name) || '';
  if (id === undefined || id === null || String(id) === '') return base;
  return `${base}-${id}`;
}
