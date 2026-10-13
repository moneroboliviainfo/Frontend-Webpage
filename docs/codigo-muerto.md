# Inventario de código muerto

**Detectado:** 2026-10-08 · **Commit base:** `d0f607e`

Documento vivo: marcar cada item al eliminarlo.

Método de detección: cruce de imports reales con `grep` sobre todo `src/`, más
verificación de uso en JSX (descartando código comentado). `tsc --noEmit` confirma
cada borrado.

> ⚠️ **Antes de borrar cualquier símbolo de este documento**, revisar
> [funcionalidades.md](./funcionalidades.md). Varios módulos que parecen inertes
> participan en los flujos de pago y de FedEx.

---

## 1. Archivos borrables completos

- [x] `src/app/w/checkout/OrderStatusDisplay.tsx` — nunca importado por nadie
      *(borrado 2026-10-08 · `tsc` ✅ · build ✅)*
- [x] `src/utils/shippingReprice.ts` — `getShippingReprice` nunca se llama
      *(borrado 2026-10-08 · `tsc` ✅)*
- [x] `src/store/cartSlice.ts` — 0 consumidores (ver nota abajo)
      *(borrado 2026-10-08 · `tsc` ✅ · build ✅ · quitado de `store.ts`)*
- [x] `src/store/adSlice.ts` — 0 consumidores
      *(borrado 2026-10-08 · `tsc` ✅ · build ✅ · quitado de `store.ts`)*
- [ ] `tailwind.config.js` — Tailwind v4 lo ignora sin `@config`; sus colores tienen 0 usos
- [ ] `src/config/env.qa.ts` — idéntico a `env.ts`
- [ ] `src/config/env.prod.ts` — idéntico a `env.ts`

> **Nota sobre `cartSlice` / `adSlice`:** al borrarlos hay que quitarlos también del
> `reducer` de [`src/store/store.ts`](../src/store/store.ts).

> **Nota sobre `shippingReprice.ts`:** es el único módulo que quedó usando el token en
> la URL (`shipping/reprice/${fedexShippingToken}`). No hace falta migrarlo al nuevo
> contrato de body — está muerto, se borra.

> **Nota sobre los env:** antes de borrarlos hay que resolver el punto ⑭ del
> diagnóstico (migrar a `.env` + `NEXT_PUBLIC_*`) y limpiar los scripts de
> `package.json` que hacen `copy`/`cp`.

---

## 2. Exports sin consumidores externos (28)

> ⚠️ **Corrección del 2026-10-08:** el escaneo inicial listó estos 28 como "muertos",
> pero solo mide referencias **desde otros archivos**. Al re-verificar el uso *interno*,
> **15 de los 28 están vivos** dentro de su propio archivo. Borrar `detectCardType` o
> `buildFedexPhoneNumber` habría roto el pago con tarjeta y la cotización de FedEx.
>
> Quedan divididos en tres grupos. **Solo el grupo A se borra.**

### Grupo A — Muertos de verdad: borrar (13) ✅ COMPLETADO 2026-10-08

Cero referencias, ni internas ni externas.

- [x] `CYBERSOURCE_PAYMENT_TYPE` — `constants/cybersource.ts`
- [x] `useCategoriesData` — `hooks/useGenderPageData.ts`
- [x] `clearAdvertisementCache` — `services/advertisementService.ts`
- [x] `ClothingDataUtils` — `services/clothingService.ts`
- [x] `createCybersourceOrder` — `services/cybersourceService.ts`
- [x] `selectCartQuantity` — `store/cartSlice.ts` *(se fue con el archivo)*
- [x] `selectCartItems` — `store/cartSlice.ts` *(se fue con el archivo)*
- [x] `selectCheckoutFormData` — `store/checkoutSlice.ts`
- [x] `getRawEncodedCart` — `utils/cartStorage.ts`
- [x] `restoreEncodedCart` — `utils/cartStorage.ts`
- [x] `clearSeasonalDiscountDismissal` — `utils/seasonalDiscountStorage.ts`
- [x] `clearAllSeasonalDiscountDismissals` — `utils/seasonalDiscountStorage.ts`
- [x] `getShippingReprice` — `utils/shippingReprice.ts` *(se fue con el archivo)*

> `getRawEncodedCart` / `restoreEncodedCart` estaban pensados para *"preservar el
> carrito durante el flujo OAuth"*, pero nunca se cablearon. No hacen falta: el carrito
> vive en `localStorage` del mismo origen y sobrevive el redirect por sí solo.

### Grupo B — Vivos internamente ✅ COMPLETADO 2026-10-08

> ⚠️ **Segunda corrección (2026-10-08).** Al ejecutar este grupo con verificación
> archivo por archivo aparecieron **dos errores más** en la clasificación original:
>
> 1. El escaneo nunca revisó `export type`. Los tipos `PaymentMethod` y `OrderStatus`
>    tienen **cero referencias** en todo el proyecto.
> 2. `PAYMENT_METHOD` solo era referenciado por el tipo `PaymentMethod`, también
>    muerto → era un **bucle cerrado muerto**, no un símbolo vivo.
> 3. `getGuestOrderKey` y `removeGuestOrderAccess` solo aparecían dentro de un
>    `export default {...}` que **nadie importa** → muertos, no vivos.
>
> Moraleja: "referenciado internamente" no equivale a "vivo". Hay que verificar que
> la cadena de referencias llegue a algo que el runtime realmente ejecute.

**B.1 — Privatizados (se quitó `export`, la función sigue en uso) — 7**

- [x] `ORDER_STATUS` — `constants/orders.ts` *(lo consume `INVALID_CONFIRMATION_STATUSES`)*
- [x] 🔴 `detectCardType` — `utils/cybersourcePayment.ts` *(lo usa `submitCardPaymentToCybersource`)*
- [x] 🔴 `resolveCountryIsoCode` — `utils/cybersourcePayment.ts` *(lo usa `buildCybersourceBilling`)*
- [x] 🔴 `resolveBoliviaStateCode` — `utils/cybersourcePayment.ts` *(lo usa `buildCybersourceBilling`)*
- [x] 🟠 `buildFedexPhoneNumber` — `utils/shippingRates.ts` *(lo usa `buildFedexRecipient`)*
- [x] `generateGuestOrderKey` — `utils/guestOrderAccess.ts` *(lo usa `saveGuestOrderAccess`)*
- [x] `getSeasonalDiscountDismissal` — `utils/seasonalDiscountStorage.ts` *(lo usa `shouldShowSeasonalModal`)*

**B.2 — Resultaron muertos de verdad y se borraron — 5**

- [x] `PAYMENT_METHOD` — `constants/cybersource.ts` *(bucle cerrado con su propio tipo)*
- [x] `PaymentMethod` (tipo) — `constants/cybersource.ts` *(0 referencias)*
- [x] `OrderStatus` (tipo) — `constants/orders.ts` *(0 referencias)*
- [x] `getGuestOrderKey` — `utils/guestOrderAccess.ts` *(solo en el `export default` muerto)*
- [x] `removeGuestOrderAccess` — `utils/guestOrderAccess.ts` *(solo en el `export default` muerto)*
- [x] El `export default {...}` de `guestOrderAccess.ts` *(ningún import default en todo el proyecto)*

> **Lo que se mantuvo exportado e intacto en los archivos 🔴/🟠** (verificado con diff:
> solo cambió la palabra `export`, ni una línea de lógica):
> `extractCardFirst4`, `parseCardExpiry`, `buildCybersourceBilling`,
> `generateDeviceFingerprintId`, `submitCardPaymentToCybersource`,
> `getCybersourceCheckoutParams`, `buildFedexRecipient`, `getFedexRates`,
> `CYBERSOURCE_PAY_URL`, `BOLIVIA_STATE_CODES`, `COUNTRY_ISO_CODES`,
> `saveGuestOrderAccess`, `hasGuestOrderAccess`.

**Pendiente menor detectado:** en `utils/shippingRates.ts` las interfaces
`FedexRecipient`, `FedexRecipientAddress` y `FedexRatesResponse` tampoco se usan fuera
del archivo. Son tipos (no existen en runtime), así que privatizarlas es cosmético y de
riesgo cero — se dejó para no ampliar el alcance de este paso.

### Grupo C — Thunks auto-referenciales nunca despachados (5)

Están referenciados dentro de su slice (en `extraReducers`/`addCase`) pero **ningún
componente los despacha**, así que no corren nunca. Para borrarlos hay que quitar
también sus `addCase` y el estado asociado — por eso van aparte del Grupo A.

- [ ] `getClient` — `store/clientSlice.ts`
- [ ] `updateClient` — `store/clientSlice.ts`
- [ ] `createClient` — `store/clientSlice.ts`
- [x] `fetchAdsAndSliders` — `store/adSlice.ts` *(se fue con el archivo)*
- [ ] `fetchCategoriesAndSubcategories` — `store/clothingSlice.ts`

> `getClient` / `updateClient` / `createClient` apuntan a `/api/client` (route interna
> de Next que **no existe**) y usan un `CLIENT_TOKEN_KEY` separado del `AuthStorage`
> real. Son restos de una implementación de auth anterior.
>
> ⚠️ `fetchCategoriesAndSubcategories` vive en `clothingSlice`, que **sí está vivo**
> (4 consumidores). Borrar el thunk no es borrar el slice. Los que sí se despachan son
> `fetchCategories`, `fetchOutfits`, `fetchSliders`, `fetchSearchRecommendations` y
> `fetchMostSearched`.

---

## 3. Dependencias de más

- [ ] `autoprefixer` — 0 usos; Tailwind v4 ya lo aplica internamente
- [ ] `@fontsource/poppins` — cargada en `layout.tsx`, **nunca aplicada** en ningún CSS
- [ ] `Geist` / `Geist_Mono` (`next/font/google`) — variables inyectadas en `<html>`
      pero `var(--font-geist-sans)` no se referencia en ningún estilo

> `@fontsource/space-grotesk` **sí se usa** (clase `.navbar-font`) — no borrar.
> Si se decide aplicar una fuente real al `body`, revisar primero
> `globals.css` línea 18.

---

## 4. CSS muerto

- [ ] `--background` / `--foreground` en `globals.css` — 0 usos, incluido todo el bloque
      `@media (prefers-color-scheme: dark)`
- [ ] `theme.extend.colors.primary` / `.secondary` en `tailwind.config.js` — 0 usos
- [ ] `@import 'tailwindcss/preflight'` duplicado en `globals.css` línea 3 — ya viene
      incluido en `@import 'tailwindcss'` de la línea 1, y al estar después de
      `theme.css` lo pisa

---

## 5. Bloques JSX comentados

Candidatos a limpieza (conteo de ocurrencias de `{/*` por archivo):

| Archivo | Bloques |
|---|---|
| `src/app/w/checkout/page.tsx` | **97** |
| `src/app/w/checkout/order-confirmed/page.tsx` | 27 |
| `src/app/w/checkout/OrderConfirmationModal.tsx` | 25 |
| `src/app/w/[product]/ProductPageDesktop.tsx` | 19 |
| `src/components/nav/CartNavBarDialog.tsx` | 17 |
| `src/app/w/checkout/OrderReviewSection.tsx` | 17 |
| `src/app/w/[product]/ProductPageMobile.tsx` | 16 |
| `src/app/PageContainer.tsx` | 15 |

No todos son código muerto (algunos son comentarios descriptivos legítimos), pero el
checkout con 97 necesita una pasada manual.

---

## Procedimiento de borrado seguro

```bash
# 1. Borrar el item
# 2. Verificar que nada se rompió:
pnpm run typecheck
# 3. Si tocó el store, los providers o el layout, correr también:
pnpm run build
# 4. Marcar el checkbox y registrar en la bitácora del protocolo
```

> Sin commits: ver la [regla de git](./protocolo-de-trabajo.md#-regla-de-git-acordada-2026-10-08).

`tsc` está limpio en el commit base, así que cualquier error nuevo tras un borrado
significa que el símbolo **sí** se usaba.
