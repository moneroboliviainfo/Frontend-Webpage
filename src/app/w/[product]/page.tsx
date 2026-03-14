'use client';
import NavBar from '@/components/nav/NavBar';
import useIsMobile from '@/hooks/useIsMobile';
import React, { Suspense, useState, useEffect } from 'react';
import { calculatePrice, DiscountShape } from '@/utils/price';
import buildProductSlug from '@/utils/buildProductSlug';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import ProductPageMobile from './ProductPageMobile';
import ProductPageDesktop from './ProductPageDesktop';
import LoadingScreen from '@/components/LoadingScreen/LoadingScreen';
import { API_URL } from '@/config/env';
import sortSizes from '@/utils/sizeSorter';

// Local product details shape used by the page components
type ProductDetails = {
  multimedia: { image: string; label: string }[];
  productId: number;
  name: string;
  price: number;
  colorsWithSizes: {
    color: string;
    colorName?: string;
    sizes: {
      size: string;
      availability: number;
      id?: number | null;
      variantId?: number | null;
    }[];
    // optional index in the product multimedia array where this color's media starts
    firstMultimediaIndex?: number;
  }[];
  isNew: boolean;
  discount: number;
  finalPrice: number;
  description: string;
  sizeGuidePdf?: string | null;
  sizeGuideVideo?: string | null;
  slug: string;
  gender?: 'male' | 'female';
};

// Minimal demo products kept for navigation when API data not available
const allProductsData: ProductDetails[] = [
  {
    // multimedia placeholders removed - show skeleton while loading
    multimedia: [],
    productId: 101,
    name: 'Chaqueta Derby',
    price: 129,
    colorsWithSizes: [],
    isNew: true,
    discount: 10,
    finalPrice: 116,
    description: 'Model height: 178 cm - Size S',
    slug: 'chaqueta-derby-101',
  },
  {
    multimedia: [],
    productId: 102,
    name: 'Blusa Elegante',
    price: 89,
    finalPrice: 79,
    discount: 11,
    colorsWithSizes: [],
    isNew: false,
    description: 'Model height: 175 cm - Size M',
    slug: 'blusa-elegante-102',
  },
  {
    multimedia: [],
    productId: 103,
    name: 'Vestido Casual',
    price: 159,
    finalPrice: 139,
    discount: 13,
    colorsWithSizes: [],
    isNew: false,
    description: 'Model height: 180 cm - Size L',
    slug: 'vestido-casual-103',
  },
];

// API product shape (partial)
type ApiProduct = {
  id: number;
  name?: string;
  price?: string | number;
  discount?: number | { percentage?: number };
  isNew?: boolean;
  description?: string;
  productColors?: Array<{
    multimedia?: string[];
    pdfs?: string[];
    videos?: string[];
    color?: { code?: string; name?: string };
    variants?: Array<{
      id?: number;
      size?: { id?: number; name?: string } | string | number;
      availableStock?: number;
    }>;
  }>;
  subcategory?: {
    videos?: string[];
    category?: {
      gender?: 'male' | 'female';
    };
  } | null;
};

function transformApiProduct(
  api: ApiProduct | null,
  slugFromUrl = '',
): ProductDetails | null {
  if (!api) return null;

  const productId = api.id;
  const name = api.name || '';
  const price = Number.parseFloat(String(api.price || 0)) || 0;

  // Use shared pricing logic to compute rounded price, discount percent and final price
  const {
    price: roundedPrice,
    discountPercent,
    finalPrice,
  } = calculatePrice(price, api.discount as unknown as DiscountShape);
  const discount = discountPercent;

  // multimedia from all colors
  const multimediaUrls: string[] = [];
  // track start index for each productColor's multimedia
  const colorStartIndexes: number[] = [];
  if (Array.isArray(api.productColors)) {
    api.productColors.forEach((pc) => {
      // record start index before adding this color's media
      colorStartIndexes.push(multimediaUrls.length);
      if (Array.isArray(pc.multimedia)) {
        pc.multimedia.forEach((m) => {
          if (m && !multimediaUrls.includes(m)) multimediaUrls.push(m);
        });
      }
    });
  }
  const multimedia = multimediaUrls.map((u) => ({ image: u, label: '' }));

  // size guide pdf: first pdf from first productColor that has pdfs
  let sizeGuidePdf: string | null = null;
  if (Array.isArray(api.productColors)) {
    const withPdfs = api.productColors.find(
      (pc) => Array.isArray(pc.pdfs) && pc.pdfs.length > 0,
    );
    if (withPdfs && withPdfs.pdfs && withPdfs.pdfs.length > 0)
      sizeGuidePdf = withPdfs.pdfs[0] ?? null;
  }

  // size guide video: prefer subcategory.videos[0], otherwise first productColor with videos
  let sizeGuideVideo: string | null = null;
  if (
    api.subcategory &&
    Array.isArray(api.subcategory.videos) &&
    api.subcategory.videos.length > 0
  ) {
    sizeGuideVideo = api.subcategory.videos[0] ?? null;
  }
  if (!sizeGuideVideo && Array.isArray(api.productColors)) {
    const withVideos = api.productColors.find(
      (pc) => Array.isArray(pc.videos) && pc.videos.length > 0,
    );
    if (withVideos && withVideos.videos && withVideos.videos.length > 0)
      sizeGuideVideo = withVideos.videos[0] ?? null;
  }

  // colors with sizes
  const colorsWithSizes = Array.isArray(api.productColors)
    ? api.productColors.map((pc, idx) => ({
        color: pc.color?.code || pc.color?.name || '#000000',
        colorName: pc.color?.name || 'Color',
        sizes: (() => {
          const rawSizes = Array.isArray(pc.variants)
            ? pc.variants.map((v) => ({
                size: String(
                  (v.size &&
                    (typeof v.size === 'object' ? v.size.name : v.size)) ||
                    '',
                ),
                availability: Number(v.availableStock ?? 0),
                id: (v.size && typeof v.size === 'object'
                  ? (v.size.id ?? null)
                  : null) as number | null,
                variantId: v.id ?? null,
              }))
            : [];

          return sortSizes(rawSizes);
        })(),
        // attach firstMultimediaIndex from earlier pass
        firstMultimediaIndex: colorStartIndexes[idx] ?? 0,
      }))
    : [];

  const description = api.description || '';
  const slug = slugFromUrl || buildProductSlug(name, productId);
  const gender = api.subcategory?.category?.gender;

  return {
    multimedia,
    productId,
    name,
    price: roundedPrice,
    colorsWithSizes,
    isNew: Boolean(api.isNew),
    discount,
    finalPrice,
    description,
    sizeGuidePdf,
    sizeGuideVideo,
    slug,
    gender,
  };
}

// Extract the main logic into a child component that uses `useSearchParams()`
// and wrap it with Suspense in the default export to satisfy Next.js
// App Router requirement.
const ProductPageContent = () => {
  const isMobile = useIsMobile();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const currentSlug = Array.isArray(params?.product)
    ? params.product[0]
    : params?.product || '';

  // Get colorCode from query parameters
  const colorCode = searchParams.get('colorCode') || undefined;
  const getCurrentProductIndex = () => {
    const index = allProductsData.findIndex(
      (product) =>
        currentSlug.includes(product.productId.toString()) ||
        product.slug === currentSlug,
    );
    return index >= 0 ? index : 0;
  };

  const [currentProductIndex, setCurrentProductIndex] = useState(() =>
    getCurrentProductIndex(),
  );
  const [fetchedProduct, setFetchedProduct] = useState<ProductDetails | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(false);

  let currentProduct: ProductDetails = allProductsData[currentProductIndex];
  if (fetchedProduct) {
    const matches =
      currentSlug.includes(String(fetchedProduct.productId)) ||
      fetchedProduct.slug === currentSlug;
    if (matches) currentProduct = fetchedProduct;
  }

  const handleProductChange = (newIndex: number) => {
    const newProduct = allProductsData[newIndex];
    if (newProduct) {
      setCurrentProductIndex(newIndex);
      const newSlug =
        newProduct.slug ||
        buildProductSlug(newProduct.name, newProduct.productId);
      router.replace(`/w/${newSlug}`, { scroll: false });
    }
  };

  useEffect(() => {
    const index = allProductsData.findIndex(
      (product) =>
        currentSlug.includes(product.productId.toString()) ||
        product.slug === currentSlug,
    );
    const newIndex = index >= 0 ? index : 0;
    setCurrentProductIndex(newIndex);
  }, [currentSlug]);

  useEffect(() => {
    const match = currentSlug.match(/-(\d+)$/);
    if (!match) {
      setFetchedProduct(null);
      setLoading(false);
      return;
    }

    const id = match[1];
    let mounted = true;
    // show loader while fetching
    setLoading(true);

    fetch(`${API_URL}products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('network');
        return res.json();
      })
      .then((data: ApiProduct) => {
        if (!mounted) return;

        // Sort productColors by createdAt ascending (oldest first) if timestamps present
        try {
          if (Array.isArray((data as any).productColors)) {
            (data as any).productColors.sort((a: any, b: any) => {
              const ta = Date.parse(a?.createdAt || '') || 0;
              const tb = Date.parse(b?.createdAt || '') || 0;
              return ta - tb;
            });
          }
        } catch (e) {
          // ignore sorting errors
        }

        const transformed = transformApiProduct(data, currentSlug);
        setFetchedProduct(transformed);
      })
      .catch(() => {
        if (mounted) setFetchedProduct(null);
      })
      .finally(() => {
        // keep loader visible for an extra 1s after completion
        if (!mounted) return;
        const t = setTimeout(() => {
          if (mounted) setLoading(false);
        }, 1000);
        // cleanup timeout on unmount
        return () => clearTimeout(t);
      });
    return () => {
      mounted = false;
    };
  }, [currentSlug]);

  return (
    <>
      {loading ? (
        <LoadingScreen message="Cargando producto..." />
      ) : (
        <>
          <NavBar dynamicTransparent={isMobile} />
          {isMobile ? (
            <ProductPageMobile
              productDetails={currentProduct}
              allProducts={allProductsData}
              currentProductIndex={currentProductIndex}
              onProductChange={handleProductChange}
              enableSwipeNavigation={false}
              initialColorCode={colorCode}
            />
          ) : (
            <ProductPageDesktop
              productDetails={currentProduct}
              initialColorCode={colorCode}
            />
          )}
        </>
      )}
    </>
  );
};

const ProductPage = () => {
  return (
    <Suspense fallback={<LoadingScreen message="Cargando producto..." />}>
      <ProductPageContent />
    </Suspense>
  );
};

export default ProductPage;
