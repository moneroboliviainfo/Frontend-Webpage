import { MetadataRoute } from 'next';
import { API_URL } from '@/config/env';
import { SITE_URL } from '@/config/metadata';
import buildProductSlug from '@/utils/buildProductSlug';

type ProductListResponse = {
  data?: Array<{
    id: number;
    name?: string;
    createdAt?: string | null;
  }>;
  meta?: { hasNextPage?: boolean };
};

const PAGE_SIZE = 200;
const MAX_PAGES = 20;

/**
 * Product pages are only reachable through the sitemap: the galleries fetch and
 * render their links in the browser, so there are no `/w/...` hrefs in the
 * server HTML for a crawler to follow.
 */
async function fetchProductEntries(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const response = await fetch(
      `${API_URL}web-page/products?limit=${PAGE_SIZE}&page=${page}`,
      { next: { revalidate: 3600 } },
    );
    if (!response.ok) break;

    const { data = [], meta }: ProductListResponse = await response.json();

    for (const product of data) {
      const slug = buildProductSlug(product.name, product.id);
      if (!slug) continue;
      entries.push({
        url: `${SITE_URL}/w/${slug}`,
        lastModified: product.createdAt
          ? new Date(product.createdAt)
          : new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }

    if (!meta?.hasNextPage || data.length === 0) break;
  }

  return entries;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;
  const now = new Date();

  const staticPaths: Array<{
    path: string;
    priority: number;
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  }> = [
    { path: '', priority: 1, changeFrequency: 'daily' },
    { path: '/men', priority: 0.9, changeFrequency: 'daily' },
    { path: '/women', priority: 0.9, changeFrequency: 'daily' },
    { path: '/men/clothes', priority: 0.8, changeFrequency: 'daily' },
    { path: '/women/clothes', priority: 0.8, changeFrequency: 'daily' },
    { path: '/men/new', priority: 0.8, changeFrequency: 'daily' },
    { path: '/women/new', priority: 0.8, changeFrequency: 'daily' },
    { path: '/men/discounts', priority: 0.8, changeFrequency: 'daily' },
    { path: '/women/discounts', priority: 0.8, changeFrequency: 'daily' },
    { path: '/men/categories', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/women/categories', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/w/outfits/men', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/w/outfits/women', priority: 0.7, changeFrequency: 'weekly' },
    { path: '/contact', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/men/policies', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/men/privacy', priority: 0.3, changeFrequency: 'yearly' },
    // Left out on purpose: /about_us and /information are client components with
    // no metadata, so they would be submitted with the generic site title. Add
    // them once they get their own generateMetadata.
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map(
    ({ path, priority, changeFrequency }) => ({
      url: `${baseUrl}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
    }),
  );

  // A failing API must not take the whole sitemap down with it.
  let productEntries: MetadataRoute.Sitemap = [];
  try {
    productEntries = await fetchProductEntries();
  } catch (error) {
    console.error('sitemap: could not load products', error);
  }

  return [...staticEntries, ...productEntries];
}
