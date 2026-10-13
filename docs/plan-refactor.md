# Plan de refactor

**Documento vivo.** Marcar los checkboxes al avanzar y commitear junto al código.

Cada fase es entregable por separado y está ordenada por relación valor/riesgo.
No hace falta completar una fase para empezar la siguiente, pero el orden recomendado
es el numérico.

| Fase | Qué | Riesgo | Valor | Estado |
|---|---|---|---|---|
| 0 | Limpieza y herramientas | Nulo | Inmediato | ⬜ Pendiente |
| 1 | Cliente HTTP central | Bajo | **El más alto** | ⬜ Pendiente |
| 2 | Descuartizar el checkout | Medio | Alto | ⬜ Pendiente |
| 3 | Mover a `features/` + `shared/` | Bajo | Estructural | ⬜ Pendiente |
| 4 | SEO de producto | Medio | Comercial | ⬜ Pendiente |
| 5 | Unificar carrito y Mobile/Desktop | Medio | Mantenimiento | ⬜ Pendiente |

---

## Fase 0 — Limpieza y herramientas

**Riesgo nulo.** Nada de esto puede romper funcionalidad. Hacer primero para trabajar
sobre un árbol limpio.

### Código muerto
- [ ] Borrar los 7 archivos muertos → ver [codigo-muerto.md](./codigo-muerto.md#1-archivos-borrables-completos)
- [ ] Quitar `cartSlice` y `adSlice` del reducer en `src/store/store.ts`
- [ ] Borrar los **13 exports del Grupo A** → ver [codigo-muerto.md](./codigo-muerto.md#grupo-a--muertos-de-verdad-borrar-13)
- [ ] Quitar la palabra `export` (sin borrar) de los **10 del Grupo B** — participan en
      pagos y FedEx
- [ ] Verificar con `pnpm run typecheck` después de cada tanda

> ⚠️ Los thunks del **Grupo C** se dejan para la Fase 3: borrarlos exige tocar
> `extraReducers`, no es una limpieza de riesgo nulo.

### Herramientas
- [ ] **Arreglar ESLint** — hoy crashea con `Converting circular structure to JSON`.
      Migrar `eslint.config.mjs` a flat config nativa, sin `FlatCompat`
- [ ] Elegir **un** gestor de paquetes y borrar el otro lockfile
      (`node_modules` real está en `.pnpm/`, pero `nixpacks.toml` usa `npm ci` → decidir y alinear)
- [ ] Agregar Prettier + `.prettierrc`
- [ ] Agregar script `typecheck: tsc --noEmit` a `package.json`

### Peso y estilos
- [ ] Quitar `autoprefixer` de `dependencies`
- [ ] Quitar `@fontsource/poppins` (nunca se aplica)
- [ ] Quitar `Geist` / `Geist_Mono` de `layout.tsx` (vars nunca referenciadas)
- [ ] Borrar `tailwind.config.js` (Tailwind v4 lo ignora)
- [ ] Arreglar `globals.css`: quitar el `@import 'tailwindcss/preflight'` duplicado de
      la línea 3 y los `--background`/`--foreground` muertos
- [ ] Decidir la fuente real del `body` (hoy es Arial con 4 webfonts cargadas)

### Ruido
- [ ] Quitar `console.log('isProduction:', ...)` de `src/app/layout.tsx`
- [ ] Revisar los 62 `console.*` — dejar los `console.error` útiles, quitar los
      14 `console.debug` y 6 `console.log`

---

## Fase 1 — Cliente HTTP central

**La fase de mayor retorno.** Ver diseño en
[arquitectura-objetivo.md](./arquitectura-objetivo.md#el-cliente-http-central-sharedapiclientts).

- [ ] Crear `src/shared/api/client.ts` que centralice: base URL, header
      `Authorization`, `Content-Type`, parseo de errores y tipado
- [ ] Migrar los 10 sitios que duplican `Authorization: Bearer ${token}`
- [ ] Migrar los `fetch` de `utils/` y `services/` (los 5 módulos de API)
- [ ] Migrar los `fetch` embebidos en componentes (los que están dentro de
      `ProductPage*`, `OutfitsGallery`, `SearchNavBarDialog`, `SubscriptionSection`,
      `AccessoriesSlider`, `VideoBanner`, `*Body.tsx`)
- [ ] Centralizar las rutas de endpoints en un solo módulo (hoy hay ~28 URLs
      construidas con template strings dispersos)

> **Por qué importa:** el cambio de contrato del token (de path param a `items` en el
> body) requirió editar 2 archivos buscándolos a mano. Con el cliente central habría
> sido una línea.

---

## Fase 2 — Descuartizar el checkout

`src/app/w/checkout/page.tsx` tiene 3077 líneas, 44 `useState` y 97 bloques comentados.
Diagnóstico detallado de la carpeta en
[componentes-checkout.md](./componentes-checkout.md).

### 2a — Preparación (riesgo nulo, se puede hacer ya)
- [ ] Borrar `OrderStatusDisplay.tsx` (0 consumidores)
- [x] ~~Borrar los 97 bloques JSX comentados~~ → **CANCELADO**: son etiquetas de
      sección, no código muerto. Ver el protocolo.
- [ ] Extraer `formatBs()` a `shared/lib/formatCurrency.ts` y migrar las **37**
      ocurrencias de `'Bs.'` + **18** de `.toFixed(2)`
- [ ] Unificar el breakpoint: hoy el checkout usa `innerWidth < 1024` imperativo en
      7 lugares y `useIsMobile` usa 768. Llevar ambos a `shared/lib/breakpoints.ts`
- [x] `OrderProgressIndicator`: usa `ORDER_STATUS` en vez de los literales

### 2b — 🔴 Unificar lo duplicado (el paso crítico)

> **Alcance ampliado.** Hay **dos** duplicaciones, no una:
> 1. La lógica de pago (`handleConfirmOrder` vs `handlePayOrder`, 95 líneas cada uno)
> 2. **El formulario entero**: 11 secciones repetidas entre el Desktop Layout (L1421) y
>    el Mobile Layout (L2216) de `page.tsx`, ~1.343 líneas = 44% del archivo
>
> Atacar solo la 1 deja la mitad del problema. Ver el detalle en el protocolo.

- [ ] Extraer los campos del formulario a componentes compartidos que ambos layouts
      consuman (el estado ya es común; lo que está duplicado es el JSX)
- [ ] Extraer **un solo** `useOrderSubmit()` que consuman desktop y mobile, y borrar la
      copia duplicada (`handleConfirmOrder` en `page.tsx` y `handlePayOrder` en
      `OrderConfirmationModal.tsx`, 95 líneas idénticas cada una)
- [ ] Dejar un único `<QRPaymentModal>` y un único `<CardPaymentModal>` en el árbol
- [ ] **Correr la regresión manual completa** (los 7 caminos de
      [funcionalidades.md](./funcionalidades.md#checklist-de-regresión-manual-no-hay-tests-automáticos))

### 2c — Resto de la extracción
- [ ] Extraer `useCheckoutForm` — el formulario y su validación
- [ ] Extraer `useFedexRates` — cotización de envío
- [ ] Extraer `useCheckoutCart` — carrito, reprice y validación de stock
- [ ] Extraer `useGuestLogin` — flujo de invitado
- [ ] Dejar `page.tsx` como composición de secciones (objetivo: < 300 líneas)
- [ ] Unificar los dos imports separados de `cartStorage` (`getCart` y `clearCart`)
- [ ] Dividir `OrderReviewSection` (653) y lo que quede de `OrderConfirmationModal`

> Hacer esto **después** de la Fase 1: muchos de los `useState` existen solo para
> manejar loading/error de `fetch` manuales.
>
> ⚠️ **No mover los componentes de carpeta antes de 2b.** Mover primero deja las dos
> copias del pago en carpetas distintas y más difíciles de comparar.

---

## Fase 3 — Mover a `features/` + `shared/`

Mecánico y de bajo riesgo: `tsc` cubre cada movimiento. Ver tabla completa de mapeo en
[arquitectura-objetivo.md](./arquitectura-objetivo.md#mapeo-desde-la-estructura-actual).

- [ ] Crear `src/shared/` y mover: `storage/`, `lib/`, `hooks/`, `config/`, `ui/`
- [ ] Crear `src/features/checkout/` y mover sus componentes, api, hooks y slice
      — con la sub-estructura `components/{flow,order-summary}/` de
      [componentes-checkout.md](./componentes-checkout.md#sub-estructura-propuesta)
- [ ] Crear `src/features/catalog/`
- [ ] Crear `src/features/product/`
- [ ] Crear `src/features/outfits/`
- [ ] Crear `src/features/auth/`
- [ ] Crear `src/features/cart/`
- [ ] Dejar `src/app/` con solo rutas (mover `PageContainer.tsx` y
      `CompactSeasonalDiscountModalGate.tsx` fuera de la raíz de `app/`)
- [ ] Eliminar `src/utils/` y `src/services/` (frontera arbitraria)
- [ ] Unificar `useSelector` crudo → `useAppSelector` en los 8 archivos pendientes

---

## Fase 4 — SEO de producto

Hoy las fichas de producto no son indexables. Impacto comercial directo.

- [ ] Convertir `w/[product]/page.tsx` a server component con `generateMetadata`
      (mover lo interactivo a un componente cliente hijo)
- [ ] Ídem para `w/outfits/page.tsx`
- [ ] Hacer `sitemap.ts` dinámico: traer productos y outfits de la API
- [ ] Corregir el `baseUrl` del sitemap a `https://www.moneroget.com` — hoy apunta a
      `moneroget.com` y `next.config.ts` lo redirige con 301
- [ ] Agregar JSON-LD `Product` en las fichas (hoy solo hay `ClothingStore` global)
- [ ] Agregar `opengraph-image` para que los productos se vean al compartirse

---

## Fase 5 — Unificar duplicaciones

- [ ] Elegir una sola fuente de verdad para el carrito (hoy `cartSlice` muerto +
      `cartStorage` vivo, ambos con `addToCart`/`removeFromCart` homónimos)
- [ ] Arreglar `useIsMobile`: devuelve `false` en SSR → flash de layout desktop en
      móvil en 19 call sites. Resolver con CSS (`md:`) o con detección antes de pintar
- [ ] Unificar `ProductPageMobile` (1077) + `ProductPageDesktop` (981): extraer la
      lógica común a un hook y dejar solo las diferencias de presentación
- [ ] Ídem `OutfitPageMobile` (722) + `OutfitPageDesktop` (443)
- [ ] Migrar los 3 env idénticos a `.env` + `NEXT_PUBLIC_*` y quitar los scripts
      `copy`/`cp` de `package.json` (hoy acoplados a plataforma: `copy` en Windows,
      `cp` en el build)
- [ ] Destrackear `src/config/env.ts` de git (el build lo sobreescribe)

---

## Backlog aparte — hallazgos que no son refactor

Detectados al mapear funcionalidades (ver [funcionalidades.md](./funcionalidades.md)).
No son deuda estructural: son bugs o riesgos que ya existen en producción.

### Seguridad / privacidad
- [ ] 🔴 **Acceso a órdenes de invitado sin validación real.** La clave de 32 chars se
      genera pero nunca se envía al backend, y el `fetch` de la orden ocurre *antes* del
      chequeo local → los datos ya viajaron. Iterando `orderId` se obtienen nombre,
      teléfono y dirección. **Requiere cambio de backend.**
- [ ] Extraer el magic string `'guest@moneroget.com'` a una constante — hoy es lógica de
      autorización repetida en 4+ archivos
- [ ] Mover la API key de Bugsnag hardcodeada en `BugsnagProvider.tsx` a env
- [ ] Mover el `comercioMid` y `metrixOrgId` de Cybersource/Linkser, hoy hardcodeados
      en `utils/cybersourcePayment.ts`, a variables de entorno

### Bugs latentes
- [ ] `components/nav/SearchNavBarDialog.tsx:165` — URL hardcodeada a producción en
      lugar de `API_URL`
- [ ] La detección de stock agotado parsea el **texto** del mensaje de error del backend
      (`/\[(\d+(?:,\s*\d+)*)\]/`). Pedir al backend un campo estructurado
- [ ] Bugsnag hace `window.location.reload()` automático ante `ChunkLoadError` → riesgo
      de bucle de recarga si un deploy deja chunks desincronizados
- [ ] `CART_VERSION` existe pero no hay migración: cambiar el shape de `CartItem` puede
      romper carritos ya guardados en navegadores de usuarios reales
- [ ] `DiscountsBody.tsx:103` — `TODO` ya anotado: filtro de fechas de descuento del
      lado cliente que debería resolver el backend

### Unificación de lógica de precios
- [ ] Hay dos aritméticas de precio: `utils/price.ts` (`calculatePrice`, 5 consumidores,
      alimenta la vitrina) y cálculos manuales en el checkout/carrito (alimentan el
      cobro). Unificar, pero con pruebas de compra real — ver nota en
      [funcionalidades.md](./funcionalidades.md#13-cálculo-de-precios-y-descuentos)

---

## Fase 6 — Red de seguridad (opcional, cuando el resto esté estable)

- [ ] Tests unitarios de `shared/lib/price.ts` (cálculo de descuentos)
- [ ] Tests del cliente HTTP (`shared/api/client.ts`)
- [ ] Test del flujo de checkout (el camino feliz)
- [ ] GitHub Action: `typecheck` + `lint` + `test` en cada PR
