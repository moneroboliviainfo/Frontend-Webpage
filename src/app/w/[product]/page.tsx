import type { Metadata } from 'next';
import { API_URL } from '@/config/env';
import { createPageMetadata, SITE_URL } from '@/config/metadata';
import { calculatePrice, type DiscountShape } from '@/utils/price';
import ProductPageClient from './ProductPageClient';

type Props = {
  params: Promise<{ product: string }>;
};

type ProductResponse = {
  id?: number;
  name?: string;
  description?: string;
  price?: string | number;
  discount?: DiscountShape;
  productColors?: Array<{
    multimedia?: string[];
    variants?: Array<{ availableStock?: number }>;
  }>;
};

/** The route segment is a slug ending in the product id: "camisa-azul-123". */
const productIdFromSlug = (slug: string): string | null =>
  slug.match(/-(\d+)$/)?.[1] ?? null;

const FALLBACK = { title: 'Producto', description: undefined };

/**
 * Shared by generateMetadata and the page itself. Next dedupes identical fetches
 * within a request, so this runs once per render despite the two call sites.
 */
async function getProduct(slug: string): Promise<ProductResponse | null> {
  const id = productIdFromSlug(slug);
  if (!id) return null;

  try {
    const response = await fetch(`${API_URL}web-page/products/${id}`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

const firstImage = (api: ProductResponse): string | undefined =>
  api.productColors?.find((c) => c.multimedia?.length)?.multimedia?.[0];

const buildDescription = (api: ProductResponse, name: string): string => {
  const summary = api.description?.trim().replace(/\s+/g, ' ');
  if (summary) return summary.slice(0, 160);
  const { finalPrice } = calculatePrice(api.price ?? 0, api.discount);
  return `${name} en Monero. Bs. ${finalPrice}. Envíos en Sucre, Bolivia y al exterior.`;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { product: slug } = await params;
  const api = await getProduct(slug);
  const name = api?.name?.trim();

  if (!api || !name) return createPageMetadata(FALLBACK);

  const description = buildDescription(api, name);
  const image = firstImage(api);
  // Relative paths resolve against metadataBase, so each product gets its own
  // canonical instead of inheriting the site-wide one.
  const path = `/w/${slug}`;

  return createPageMetadata({
    title: name,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: name,
      description,
      url: path,
      ...(image && { images: [{ url: image, alt: name }] }),
    },
    twitter: {
      title: name,
      description,
      ...(image && { images: [image] }),
    },
  });
}

/**
 * Structured data so search results can show price and availability instead of
 * just a blue link. The price must match what the page renders, so it goes
 * through the same calculatePrice the UI uses.
 */
function buildProductJsonLd(api: ProductResponse, slug: string, name: string) {
  const { finalPrice } = calculatePrice(api.price ?? 0, api.discount);

  const inStock = (api.productColors ?? []).some((color) =>
    (color.variants ?? []).some((variant) => (variant.availableStock ?? 0) > 0),
  );

  const images = (api.productColors ?? []).flatMap(
    (color) => color.multimedia ?? [],
  );

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    ...(api.description && { description: api.description.trim() }),
    ...(images.length && { image: images.slice(0, 6) }),
    ...(api.id && { sku: String(api.id) }),
    brand: { '@type': 'Brand', name: 'Monero' },
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/w/${slug}`,
      priceCurrency: 'BOB',
      price: finalPrice,
      itemCondition: 'https://schema.org/NewCondition',
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'Monero' },
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { product: slug } = await params;
  const api = await getProduct(slug);
  const name = api?.name?.trim();

  return (
    <>
      {api && name && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildProductJsonLd(api, slug, name)),
          }}
        />
      )}
      <ProductPageClient />
    </>
  );
}
