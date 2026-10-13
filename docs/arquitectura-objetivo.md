# Arquitectura objetivo

**Enfoque:** modularización *intermedia* — feature-first, sin DDD, sin capas de
abstracción ceremoniales.

---

## Estructura

```
src/
  app/                    # SOLO rutas: page / layout / loading / error
    [gender]/
    w/
    auth/

  features/               # el corazón del cambio
    checkout/
      components/         # los ~12 que ya existen en app/w/checkout/
      hooks/              # useCheckoutForm, useFedexRates, useOrderSubmit...
      api/                # endpoints de checkout
      model/              # slice + tipos
    catalog/              # clothes, categories, discounts, new, results
    product/
    outfits/
    cart/
    auth/

  shared/
    api/                  # ← cliente HTTP central (el token en UN solo lugar)
    ui/                   # Modal, Button, Skeleton, LoadingScreen, BottomSheet
    hooks/                # useIsMobile...
    lib/                  # helpers puros: price, slugify, sizeSorter
    storage/              # wrappers de localStorage
    config/               # env, features, metadata

  styles/
```

---

## Las dos únicas reglas

Esto es lo que mantiene el diseño "intermedio" y evita la sobre-ingeniería:

### 1. `features/*` importa de `shared/*`. Nunca al revés.

```ts
// ✅ features/checkout/hooks/useOrderSubmit.ts
import { apiClient } from '@/shared/api/client';

// ❌ shared/api/client.ts
import { selectCartToken } from '@/features/checkout/model';
```

### 2. Un feature no importa otro feature.

Si dos features necesitan lo mismo, eso sube a `shared/`.

```ts
// ❌ features/checkout/... importando de features/cart/...
// ✅ ambos importan de shared/storage/cart.ts
```

### Lo que NO vamos a hacer

- Sin barrel files (`index.ts`) por capa — generan imports circulares y rompen el
  tree-shaking.
- Sin inyección de dependencias ni contenedores.
- Sin patrón repositorio ni mappers entre capas.
- Sin tests obligatorios por archivo (sí para el cliente HTTP y los cálculos de precio).

---

## Mapeo desde la estructura actual

| Hoy | Destino |
|---|---|
| `src/app/w/checkout/*.tsx` (componentes) | `src/features/checkout/components/` |
| `src/utils/checkoutCart.ts` | `src/features/checkout/api/` |
| `src/utils/shippingRates.ts` | `src/features/checkout/api/` |
| `src/utils/orderService.ts` | `src/features/checkout/api/` |
| `src/utils/addressService.ts` | `src/features/checkout/api/` |
| `src/utils/cybersourcePayment.ts` | `src/features/checkout/lib/` |
| `src/utils/fedexArrivalEstimate.ts` | `src/features/checkout/lib/` |
| `src/store/checkoutSlice.ts` | `src/features/checkout/model/` |
| `src/services/clothingService.ts` | `src/features/catalog/api/` |
| `src/store/clothingSlice.ts` | `src/features/catalog/model/` |
| `src/utils/categoryProducts.ts` | `src/features/catalog/lib/` |
| `src/services/googleAuth.ts` | `src/features/auth/api/` |
| `src/services/sessionService.ts` | `src/features/auth/api/` |
| `src/store/clientSlice.ts` | `src/features/auth/model/` |
| `src/hooks/useAuthInit.ts` | `src/features/auth/hooks/` |
| `src/utils/cartStorage.ts` | `src/shared/storage/cart.ts` |
| `src/utils/authStorage.ts` | `src/shared/storage/auth.ts` |
| `src/utils/genderStorage.ts` | `src/shared/storage/gender.ts` |
| `src/utils/guestOrderAccess.ts` | `src/shared/storage/guestOrder.ts` |
| `src/utils/seasonalDiscountStorage.ts` | `src/shared/storage/seasonalDiscount.ts` |
| `src/utils/price.ts` | `src/shared/lib/price.ts` |
| `src/utils/slugify.ts` | `src/shared/lib/slugify.ts` |
| `src/utils/sizeSorter.ts` | `src/shared/lib/sizeSorter.ts` |
| `src/utils/buildProductSlug.ts` | `src/shared/lib/buildProductSlug.ts` |
| `src/utils/outfits.ts` | `src/features/outfits/lib/` |
| `src/hooks/useIsMobile.ts` | `src/shared/hooks/` |
| `src/components/{Modal,Skeleton,Loading*}` | `src/shared/ui/` |
| `src/components/nav/*` | `src/shared/ui/nav/` |
| `src/config/*` | `src/shared/config/` |

Los componentes de `src/components/` que son específicos de un dominio
(`QRPaymentModal`, `CardPaymentModal`, `InsufficientStockModal`,
`BasketConfirmation`) van a `features/checkout/components/`, no a `shared/ui/`.

---

## El cliente HTTP central (`shared/api/client.ts`)

La pieza clave de la Fase 1. Hoy hay 48 `fetch` crudos y el header
`Authorization: Bearer` duplicado en 10 archivos.

Lo que debe resolver en un solo lugar:

- `API_URL` base
- Header `Authorization` cuando hay token en `AuthStorage`
- `Content-Type: application/json`
- Parseo de errores (hoy el patrón `errorData.message || response.statusText` está
  repetido ~10 veces)
- Tipado de respuesta

Beneficio inmediato y medible: cuando el backend cambie un contrato — como pasó al
mover el token de path param a `items` en el body — es **un cambio en un archivo**,
no una búsqueda manual archivo por archivo.

### Decisión: `fetch` y no axios (2026-10-13)

Se evaluó migrar a axios. **Se descartó**, por razones propias de este proyecto:

1. **Next.js extiende `fetch`, no axios.** Deduplicación de requests en un render,
   caché e invalidación opt-in (`cache: 'force-cache'`, `next: { revalidate, tags }`) y
   la integración con server components solo existen sobre `fetch`. Hoy el proyecto usa
   **cero** de esas extensiones, pero la **Fase 4** (SEO de producto) exige mover las
   fichas a server components, que es exactamente donde valen. Adoptar axios cerraría
   esa puerta antes de abrirla.
2. **Lo que axios aporta, `client.ts` ya lo cubre:** parseo de JSON, lanzar en 4xx/5xx,
   `baseURL` y headers centralizados. La cancelación la da `AbortController` nativo.
3. **Costo medido:** el JS actual pesa ~1.409 KB sin comprimir; axios suma ~13 KB gzip
   más una dependencia, a cambio de features ya resueltas, y obliga a migrar 43 sitios.

**Cuándo reconsiderarlo:** si aparece necesidad de interceptores de refresh-token
automático, progreso de subida de archivos, o branchear por código de estado en muchos
lugares. Hoy solo 3 sitios miran el cuerpo del error, y esos conservan su `fetch` propio.

> Si ese día llega, `client.ts` es el único archivo a tocar — que es el objetivo de
> tener un cliente central.

---

## Convenciones a unificar en el camino

| Tema | Hoy | Objetivo |
|---|---|---|
| Hooks de Redux | `useSelector` crudo en 8 archivos, `useAppSelector` en 6 | Solo `useAppSelector` / `useAppDispatch` |
| Estilos | Tailwind + 23 `.css` planos + 2 `.module.css` | Tailwind primero; CSS solo para animaciones y overrides de libs |
| Estado del carrito | Redux (muerto) + localStorage (vivo) | Una sola fuente |
| Env | 3 archivos idénticos copiados por script | `.env` + `NEXT_PUBLIC_*` |
| Exports | 47/47 `export default` | Mantener |
