# Diagnóstico del proyecto

**Fecha:** 2026-10-08 · **Commit base:** `d0f607e`

Análisis verificado con el compilador de TypeScript y cruzando imports reales
(no por inspección visual).

---

## 1. Stack

| Capa | Tecnología | Estado |
|---|---|---|
| Framework | Next.js **16.0.10** (App Router) + React **19.2.1** | Al día |
| Lenguaje | TypeScript 5, `strict: true` | Sano |
| Estado | Redux Toolkit 2.8 + react-redux 9 | Infrautilizado |
| Estilos | Tailwind **v4** + 23 `.css` planos + 2 `.module.css` + `style={{}}` inline | **4** estrategias mezcladas |
| UI libs | Swiper, framer-motion, headlessui, react-icons | 2 de uso único |
| Observabilidad | Bugsnag (browser + performance) | OK |
| Deploy | nixpacks → `pnpm install --frozen-lockfile` | ✅ Resuelto (paso 10) |

### Métricas

- **103** componentes `.tsx` (59 con `'use client'`)
- **5** slices Redux (2 muertos), **18** utils, **5** services, **6** hooks
- **48** llamadas `fetch` crudas repartidas en **35** archivos
- **62** `console.*` en el código
- **10** usos de `any`
- **0** tests, **0** CI, **0** prettier

### Archivos más grandes

```
3077  src/app/w/checkout/page.tsx
1077  src/app/w/[product]/ProductPageMobile.tsx
 981  src/app/w/[product]/ProductPageDesktop.tsx
 908  src/app/w/checkout/OrderConfirmationModal.tsx
 722  src/app/w/outfits/OutfitPageMobile.tsx
 719  src/app/w/checkout/order-confirmed/page.tsx
 653  src/app/w/checkout/OrderReviewSection.tsx
 601  src/app/w/checkout/checkout.css
```

---

## 2. Lo que está bien

Base sólida sobre la que se puede refactorizar con confianza:

- **`pnpm run typecheck` pasa con 0 errores** y `strict: true` activo. Es el activo más
  valioso del proyecto: permite mover archivos y renombrar con red de seguridad.
- Solo **10 usos de `any`** en ~200 archivos.
- Imágenes mayormente bien: 25 archivos usan `next/image`. *(Corrección: el linter
  encuentra **5** `<img>` crudos que la revisión manual no vio.)*
- JSON-LD (`ClothingStore`), `generateMetadata` en 10 rutas, `robots.txt`, `manifest.json`.
- El checkout ya tiene subcomponentes extraídos (`OrderReviewSection`,
  `CheckoutCostSummary`, `DeliveryOptionsSection`...) — el patrón existe, quedó a medias.
- Convención consistente: 47/47 componentes con `export default`.

---

## 3. Problemas por severidad

### P0 — Bloquean el mantenimiento

#### ⓪ El flujo de pago está implementado dos veces 🔴

*Detectado el 2026-10-08 al analizar los componentes de checkout.*

`page.tsx` (desktop) y `OrderConfirmationModal.tsx` (mobile) tienen **cada uno su propia
copia** de la creación de orden y el pago: `createOrder`, `generateQR`,
`buildCybersourceBilling`, `saveGuestOrderAccess`, `checkForWomenItems`,
`handleCardPaymentBeforeRedirect` y sus propios `<QRPaymentModal>` / `<CardPaymentModal>`.

Los dos handlers que crean la orden tienen **exactamente 95 líneas cada uno**
(`handleConfirmOrder` vs `handlePayOrder`). El reparto es por viewport:
`if (window.innerWidth < 1024) setShowOrderConfirmationModal(true)`.

**Un fix de pago aplicado en desktop queda roto en mobile.** Es el problema más grave
del proyecto, por encima del tamaño del archivo. Análisis completo en
[componentes-checkout.md](./componentes-checkout.md).

#### ① `checkout/page.tsx`: 3077 líneas

`44 useState`, 6 `useEffect`, 17 handlers, 10 selectores, 13 `dispatch`,
**97 bloques JSX comentados**. Es ~12% de todo el código del proyecto en un archivo.
Cualquier cambio ahí es de alto riesgo.

Parte de esos 44 `useState` son el **espejo desktop** de un estado que el modal mobile
ya maneja (ver ⓪).

#### ② No existe red de seguridad — y el lint está roto → ✅ **lint arreglado (paso 7)**

```
npx eslint src  →  TypeError: Converting circular structure to JSON
```

`FlatCompat` envolvía los flat configs nativos de `eslint-config-next@16`. Y el script
`npm run lint` usaba `next lint`, eliminado en Next 16.

**Resuelto en el paso 7.** El linter destapó 118 problemas preexistentes, incluido un bug
🔴 real en `QRPaymentModal` (arreglado en el paso 8) → ver
[lint-hallazgos.md](./lint-hallazgos.md).

**Sigue pendiente:** 0 tests, 0 CI, 0 prettier, 0 husky.

#### ③ Doble lockfile → ✅ **RESUELTO (paso 10)**

Había dos lockfiles con versiones distintas, y el deploy (`npm ci`) leía el de npm, que
estaba **6 meses atrasado** respecto al de pnpm. Producción corría Next 16.1.6 mientras
local corría 16.3.3.

Unificado en **pnpm**: ver el
[detalle del paso 10](./protocolo-de-trabajo.md#️-paso-10-el-único-cambio-que-toca-el-deploy).
⚠️ Falta validarlo con un deploy real.

---

### P1 — Deuda que ya está costando

#### ④ 48 `fetch` crudos sin cliente HTTP central

El boilerplate `Authorization: Bearer ${token}` está copiado en **10 lugares**:

```
src/app/w/checkout/order-confirmed/page.tsx    src/utils/addressService.ts
src/hooks/useAuthInit.ts                       src/utils/orderService.ts  (x2)
src/services/sessionService.ts                 src/utils/shippingRates.ts
src/store/clientSlice.ts  (x2)                 src/utils/shippingReprice.ts
```

Consecuencia concreta: el cambio de contrato del token (pasar de path param a `items`
en el body) hubo que aplicarlo archivo por archivo en lugar de en un solo punto.

#### ⑤ Carrito con doble fuente de verdad

| Módulo | Consumidores |
|---|---|
| `src/store/cartSlice.ts` (Redux) | **0** |
| `src/utils/cartStorage.ts` (localStorage) | 9 |

Y **ambos exportan `addToCart` y `removeFromCart` con el mismo nombre** — trampa de
import garantizada.

#### ⑥ 2 de 5 slices muertos pero registrados en el store

`cartSlice` y `adSlice` corren reducers y ocupan estado sin que nadie los lea.

| Slice | Consumidores |
|---|---|
| `clientSlice` | 10 |
| `checkoutSlice` | 9 |
| `clothingSlice` | 4 |
| `cartSlice` | **0** |
| `adSlice` | **0** |

#### ⑦ SEO: las páginas de producto no son indexables

- `w/[product]/page.tsx` y `w/outfits/page.tsx` son `'use client'` **sin
  `generateMetadata`**. Para un e-commerce, las fichas de producto son las URLs que
  más importan y Google las recibe vacías.
- `sitemap.ts` es 100% estático: 8 URLs, **cero productos**.
- El sitemap apunta a `https://moneroget.com`, que `next.config.ts` redirige con **301**
  a `www.moneroget.com` → cada URL del sitemap es un redirect.

#### ⑧ 4 familias de fuentes cargadas, 1 usada

| Fuente | Cargada | Aplicada |
|---|---|---|
| `@fontsource/poppins` (todos los pesos) | Sí | **Nunca** |
| `Geist` + `Geist_Mono` (vars en `<html>`) | Sí | **Nunca** en CSS |
| `@fontsource/space-grotesk` | Sí | Solo `.navbar-font` |

Y `globals.css` define `body { font-family: Arial, Helvetica, sans-serif; }`. Se pagan
megabytes de webfonts para renderizar en Arial.

---

### P2 — Inconsistencias estructurales

#### ⑨ La frontera `services/` vs `utils/` es arbitraria

5 módulos que llaman a la API viven en `utils/` (`orderService`, `addressService`,
`checkoutCart`, `shippingRates`, `shippingReprice`), mientras `services/` contiene
lógica de sesión. Y `utils/` mezcla 5 wrappers de localStorage con helpers puros
(`price`, `slugify`, `sizeSorter`).

#### ⑩ `tailwind.config.js` es config muerta

Tailwind v4 lo ignora salvo que se referencie con `@config` en el CSS. Sus colores
`primary`/`secondary` tienen **0 usos** — `bg-primary` nunca funcionó.

#### ⑪ `globals.css` con orden invertido

```css
@import 'tailwindcss';
@import '../styles/theme.css';
@import 'tailwindcss/preflight';   /* ← pisa el tema */
```

Preflight se importa *después* de `theme.css`. Además `--background`/`--foreground`
(incluido el bloque `prefers-color-scheme: dark`) tienen 0 usos.

#### ⑫ Duplicación Mobile/Desktop

`ProductPageMobile` (1077) + `ProductPageDesktop` (981) = **2058 líneas para una
pantalla**. Igual en outfits (722 + 443).

#### ⑬ `useIsMobile` devuelve `false` en SSR — y hay dos breakpoints en conflicto

El móvil renderiza el layout desktop un frame antes de corregir. **19 call sites** con
ese flash.

> ⚠️ **Corregido 2026-10-12.** Esta sección decía que los dos breakpoints (768 y 1024)
> eran "dos definiciones en conflicto" a unificar. **Era falso:** `checkout.css` tiene
> 3 media queries en `min-width: 1024px`, así que el 1024 del JS está emparejado con el
> CSS a propósito. Unificarlos habría partido la UI entre 768px y 1024px. Son dos
> breakpoints legítimos, como `md` y `lg` de Tailwind. Se **nombraron** en
> `shared/lib/breakpoints.ts` (paso 19), no se unificaron.

El problema real que queda es el flash de SSR: el móvil pinta desktop un frame antes de
corregirse, en 18 call sites. Se resuelve moviendo esas decisiones a CSS, no cambiando
los valores.

#### ⑭ Los 3 archivos de env son idénticos

`env.ts`, `env.qa.ts` y `env.prod.ts` apuntan los tres a `api.moneroget.com`. El script
usa `copy` (Windows) en `dev` y `cp` (Unix) en `build` — acoplado a plataforma. Y
`env.ts` está trackeado en git pero el build lo sobreescribe → diffs sucios. No se usa
`.env` ni `NEXT_PUBLIC_*`.

#### ⑮ Hooks de Redux inconsistentes

`useSelector` crudo en 8 archivos vs `useAppSelector` tipado en 6.

#### ⑯ 62 `console.*` en el código

36 `error`, 14 `debug`, 6 `warn`, 6 `log` — incluido un
`console.log('isProduction:', ...)` en el layout raíz, que corre en cada render.

---

## 4. Resumen ejecutivo

El proyecto tiene **buenos cimientos técnicos** (TS estricto sin errores, Next 16,
imágenes optimizadas, SEO parcial) pero sufre de **tres concentraciones de deuda**:

1. **Un god component** (`checkout/page.tsx`) que acumula el 12% del código.
2. **Ausencia total de capa de datos** — 48 `fetch` dispersos, token duplicado 10 veces.
3. ~~**Cero herramientas de calidad funcionando**~~ → el lint ya corre (paso 7); siguen
   faltando tests, CI y formatter.

Nada de esto requiere un rewrite. Ver [plan-refactor.md](./plan-refactor.md).
