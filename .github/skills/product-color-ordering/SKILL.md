---
name: product-color-ordering
description: 'Reference for every place product colors are displayed and sorted in this codebase. Use when changing color display order, adding a custom sort flag, or auditing color-ordering logic. Covers ProductsGallery, category pages, discounts, new-arrivals, product detail page, and interest recommendations.'
---

# Product Color Ordering

## Overview

Every product has a `productColors` array. The **current rule** is:

> Sort `productColors` by `productColor.id` **ascending** (lowest `id` first).

This determines:

- Which color's image is shown as the **thumbnail**
- The **left-to-right order of color swatches**

---

## Files to Modify When Changing Sort Logic

Change all of the following files together to keep ordering consistent.

### 1. `src/components/ProductsGallery.tsx`

**Function:** `transformProductsToClothesItems`

**Where:** Inside the `.map((product) => { … })` block.

**Current code:**

```ts
const sortedColors = [...product.productColors].sort((a, b) => a.id - b.id);
```

Used for:

- `src` (thumbnail image) — `sortedColors[0]`
- `colors` (swatch list) — `sortedColors.map(pc => pc.color.code)`

---

### 2. `src/utils/categoryProducts.ts`

**Function:** `extractProductsFromCategory`

**Where:** Inside the `subcategory.products.forEach` loop, before the product is pushed.

**Current code:**

```ts
product.productColors.sort((a, b) => a.id - b.id);
```

> Note: mutates the array in-place. If switching to immutable sort, use spread first.

---

### 3. `src/hooks/useInterestRecommendations.ts`

**Where:** Inside the `for (const p of data)` loop, after eligibility checks.

**Current code:**

```ts
const sortedColors = [...p.productColors].sort((a, b) => a.id - b.id);
const img = sortedColors[0].multimedia?.[0] || …
```

Used for: recommendation card thumbnail image.

---

### 4. `src/app/w/[product]/page.tsx`

**Function:** `transformApiProduct`

**Where:** Near top of function, before any `productColors` access.

**Current code:**

```ts
const sortedProductColors = Array.isArray(api.productColors)
  ? [...api.productColors].sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
  : [];
```

`sortedProductColors` is then used for:

- Building `multimediaUrls` (gallery images, in color order)
- Finding `sizeGuidePdf` (first color with a PDF)
- Finding `sizeGuideVideo` (first color with a video)
- Building `colorsWithSizes` (color swatches + size selector)

> The `ApiProduct.productColors` type includes `id?: number` — keep it there.

---

### 5. `src/app/[gender]/new/NewProductsBody.tsx` and `src/app/[gender]/discounts/DiscountsBody.tsx`

These pages pass filtered `Product[]` arrays directly to `<ProductsGallery>`. Sorting happens inside `transformProductsToClothesItems` (file #1), so **no extra sort is needed here** unless you render `productColors` directly in these files.

---

## White Color Swatch Visibility Fix

All color circles must have a **light gray border** so white/near-white colors are visible on white backgrounds.

| File                                         | Element                                    | Border applied                               |
| -------------------------------------------- | ------------------------------------------ | -------------------------------------------- |
| `src/app/[gender]/clothes/GalleryItem.tsx`   | Small swatch in gallery listing            | `border: '1px solid #d1d5db'` (inline style) |
| `src/app/w/[product]/ProductPageMobile.tsx`  | Inner color circle                         | `border: '1px solid #d1d5db'` (inline style) |
| `src/app/w/[product]/ProductPageDesktop.tsx` | Inner color circle                         | `border: '1px solid #d1d5db'` (inline style) |
| `src/components/AccessoriesSlider.css`       | `.accessories-color-button:not(.selected)` | `border-color: #d1d5db` (CSS class)          |
| `src/components/BasketConfirmation.tsx`      | Cart item color dot                        | `border: '1px solid #e5e7eb'` (inline style) |
| `src/components/InsufficientStockModal.css`  | `.color-dot`                               | `border: 1px solid #9ca3af` (CSS class)      |

When adding new color circles anywhere, always include `border: '1px solid #d1d5db'` (or equivalent CSS).

---

## How to Add a Custom Order Flag

When a future `displayOrder` (or similar) field is added to `productColor`:

1. Update the `ProductColor` interface in `src/components/ProductsGallery.tsx`:

   ```ts
   export interface ProductColor {
     id: number;
     displayOrder?: number; // new field
     …
   }
   ```

2. Update the `ApiProduct.productColors` type in `src/app/w/[product]/page.tsx`:

   ```ts
   productColors?: Array<{
     id?: number;
     displayOrder?: number; // new field
     …
   }>
   ```

3. Replace the sort comparator in **all 4 active sort locations** (files #1–#4) with:
   ```ts
   // Use displayOrder when present, fall back to id
   .sort((a, b) => {
     const orderA = a.displayOrder ?? a.id;
     const orderB = b.displayOrder ?? b.id;
     return orderA - orderB;
   })
   ```

---

## Quick Audit Command

To find every place `productColors` is accessed in the codebase:

```
grep -r "productColors" src/ --include="*.ts" --include="*.tsx" -n
```
