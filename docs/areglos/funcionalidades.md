# Mapa de funcionalidades y riesgo

**Fecha:** 2026-10-08 · **Commit base:** `d0f607e`

Inventario de todo lo que hace la página, clasificado por **qué pasa si lo rompés**.
Leer antes de tocar cualquier archivo listado acá.

| Nivel | Significado | Cantidad |
|---|---|---|
| 🔴 **Crítico** | Si se rompe, se pierde dinero, órdenes o se incumple normativa | 5 |
| 🟠 **Delicado** | Si se rompe, el usuario no puede comprar o se filtran datos | 5 |
| 🟡 **Moderado** | Degrada la experiencia, no bloquea la venta | 8 |
| 🟢 **Seguro** | Contenido y presentación, refactor libre | 6 |

---

## 🔴 CRÍTICO — Flujos de dinero

### 1. Pago con tarjeta (Cybersource / Linkser)

**Archivos:** `components/CardPaymentModal.tsx`, `utils/cybersourcePayment.ts`,
`services/cybersourceService.ts`, `constants/cybersource.ts`

**Cómo funciona:**
1. Backend firma los campos → `POST payments/card/checkout-params` (se le manda
   `orderId`, `cardFirst4`, `deviceFingerprintId`, `billing`)
2. El front arma un `<form>` oculto y lo postea **directo a Cybersource**
3. Se inyecta el script de device fingerprint de `online-metrix.net`

**Lo que está BIEN hecho (no romper):** el número de tarjeta completo **nunca pasa por
nuestro backend** — va directo a Cybersource en el form POST. Solo se envían los
primeros 4 dígitos (BIN) para la factura. Es el patrón Silent Order POST correcto y
es lo que mantiene el proyecto fuera del alcance PCI completo.

> ⚠️ **Trampas:**
> - Los nombres de campo `card_number`, `card_expiry_date`, `card_cvn`, `card_type` son
>   un **contrato con Cybersource**. Renombrarlos rompe los pagos **en silencio** (sin
>   error en consola).
> - `card_expiry_date` se arma como `MM-YYYY` con guion, no barra.
> - El `comercioMid` (Linkser) y el `metrixOrgId` están **hardcodeados** en
>   `utils/cybersourcePayment.ts` (dentro de `submitCardPaymentToCybersource`). El
>   `session_id` del fingerprint es la **concatenación** de ambos, en ese orden.
>   Deberían salir a variables de entorno; mientras tanto, no copiar sus valores a
>   otros archivos ni a documentación.
> - `detectCardType()` mapea a códigos numéricos (`001` Visa, `002` Mastercard...).
>   Aparece como "export sin uso" en escaneos automáticos pero **se usa en la línea 146
>   del mismo archivo**. No borrar.
> - Ventana de reserva de inventario de **10 minutos** (`QR_PAYMENT_DURATION_MINUTES`);
>   al expirar redirige fuera. Si se toca el contador, se desincroniza de la reserva
>   real del backend.
> - `getCybersourceCheckoutParams` **no envía token de auth**.

### 2. Pago con QR

**Archivos:** `components/QRPaymentModal.tsx`, `utils/orderService.ts` (`generateQR`)

- `POST payments/generate-qr` con `{ orderId }` → devuelve imagen base64
- **Polling** a `payments/verify/${orderId}` cada `PAYMENT_VERIFICATION_INTERVAL` (5s)
- Al confirmar el pago ejecuta `clearCart()`

> ⚠️ **Trampas:**
> - Si se rompe el polling, el usuario paga y **nunca ve la confirmación**.
> - `clearCart()` solo se llama en el callback de éxito del polling. Si se mueve o se
>   envuelve en un early-return, el carrito queda con items ya comprados.
> - `generateQR` tiene un bloqueo por feature flag: si `WOMEN_ENABLED` es `false`,
>   consulta el género de **cada producto del carrito** (N requests) y lanza error si
>   hay prendas de mujer. Ver punto 14.

### 3. Creación de orden — ⚠️ implementada DOS veces

**Archivos:** `utils/orderService.ts` (`createOrder`) → `POST orders/online`

Payload: `items` (cart token), `name`, `phone`, `shipment`, `address`,
`selectedServiceType`, `payment_type` (`'qr' | 'card_online'`), `email`, `billing`.

> 🔴 **Lo más importante de este documento:** el flujo de creación de orden y pago está
> **duplicado por viewport**:
>
> | | Desktop (`≥1024px`) | Mobile (`<1024px`) |
> |---|---|---|
> | Archivo | `app/w/checkout/page.tsx` | `app/w/checkout/OrderConfirmationModal.tsx` |
> | Handler | `handleConfirmOrder()` — 95 líneas | `handlePayOrder()` — 95 líneas |
> | Modales de pago | `showDesktopQRModal` / `showDesktopCardModal` | sus propios `<QRPaymentModal>` / `<CardPaymentModal>` |
>
> Ambos importan y usan `createOrder`, `generateQR`, `buildCybersourceBilling`,
> `saveGuestOrderAccess` y `checkForWomenItems`.
>
> **Cualquier cambio en el pago hay que aplicarlo en los dos archivos**, o queda roto
> en una de las dos pantallas. Al verificar un fix, probarlo en ambos anchos.
>
> Análisis y plan de unificación en
> [componentes-checkout.md](./componentes-checkout.md).

> ⚠️ **Trampa:** `items` es el **cart token (JWT)**, no un array de productos. El nombre
> engaña. Ver punto 9.

### 4. Reprice y validación de stock ← *el control de seguridad de precios*

**Archivos:** `utils/checkoutCart.ts` → `POST orders/reprice`

**Por qué es crítico:** los precios del carrito viven en `localStorage` en base64, y el
propio código lo documenta como *"not cryptographic security"*. **El reprice del backend
es lo único que impide que un usuario se manipule los precios.** Si alguien
"optimiza" este paso saltándolo cuando el carrito no cambió, se abre manipulación
de precios.

También parsea los variants sin stock desde el string del mensaje de error:

```ts
data.message.match(/\[(\d+(?:,\s*\d+)*)\]/)   // "Insufficient stock for variants: [643, 644]"
```

> ⚠️ **Trampa:** eso es **parsing de un mensaje de error en prosa**. Si el backend
> reformula el texto, la detección de stock falla en silencio y el usuario ve un error
> genérico sin saber qué producto quitar.

### 5. Facturación boliviana (SIN)

**Archivos:** `app/w/checkout/page.tsx` (campos `billingCI`, `billingName`,
`billingComplemento`)

- `CI/NIT` y nombre de factura son **obligatorios** (validados en el paso 2)
- `codigoTipoDocumentoIdentidad: 1` está **hardcodeado** en el payload

> ⚠️ Implicancia **legal/tributaria**. Cambiar la forma de estos campos puede generar
> facturas inválidas ante el SIN.

---

## 🟠 DELICADO — Bloquean la compra o filtran datos

### 6. FedEx — envío internacional

**Archivos:** `utils/shippingRates.ts`, `utils/fedexArrivalEstimate.ts`,
`app/w/checkout/DeliveryOptionsSection.tsx`, `app/w/checkout/FedexCustomsDisclaimer.tsx`

**Flujo:**
1. `POST shipping/rates` con `{ items: cartToken, recipient }` → devuelve
   `fedexShippingToken`, `services[]` y `debugMetadata` (cajas calculadas, peso total,
   dimensiones, **tipo de cambio USD→BOB**)
2. El usuario elige un servicio → se guarda `selectedFedexService`
3. El `selectedServiceType` elegido viaja en la creación de la orden

> ⚠️ **Trampas:**
> - `buildFedexPhoneNumber` concatena código de país + teléfono y **quita todo lo que no
>   sea dígito** (`replace(/[^\d]/g, '')`). FedEx rechaza el `+` y los espacios. Esta
>   función aparece como "export sin uso" en escaneos pero **se usa internamente**. No borrar.
> - `buildFedexRecipient` mapea al shape exacto que pide la API de FedEx
>   (`streetLines[]`, `stateOrProvinceCode`, `residential`...). Es un contrato externo.
> - `formatFedexArrivalEstimate` construye la fecha como `T12:00:00Z` **a propósito**,
>   para que ningún timezone la corra un día. No "simplificar" a medianoche.
> - El tipo de cambio USD→BOB viene del backend en `debugMetadata`. Si se cachea la
>   cotización, se cobran envíos a un cambio viejo.
> - `utils/shippingReprice.ts` (`shipping/reprice/:token`) **está muerto** — es el único
>   lugar que seguía mandando el token por URL. Se borra, no se migra.

### 7. Envío nacional (Bolivia)

**Archivos:** `GET places` → departamentos con `shipments[]` anidados

Todo el checkout se bifurca en `national` vs `international`
(`address.type`, `isBolivia`). Son **dos flujos de costo y validación distintos** que
comparten los mismos componentes.

> ⚠️ Al refactorizar el checkout hay que probar **ambas ramas**. La internacional pasa
> por FedEx y exige código postal; la nacional usa `shipment.id` y precio fijo.

### 8. Autenticación

**Archivos:** `services/googleAuth.ts`, `services/sessionService.ts`,
`hooks/useAuthInit.ts`, `app/auth/callback/page.tsx`, `utils/authStorage.ts`

- **Google OAuth:** redirect a `auth/google?callback=...` → vuelve con `code` en la
  query → `POST` del `code` en el body → devuelve token → `customers/me`
- **Invitado:** `POST auth/guest` (sin body) → devuelve token
- La URL de retorno se guarda en `localStorage` **antes** de redirigir

> ⚠️ **Trampa grande — magic string:** el usuario invitado se identifica comparando
> `client.email === 'guest@moneroget.com'`. Ese literal es **lógica de autorización**
> repetida en 4+ archivos (`checkout/page.tsx`, `order-confirmed/page.tsx`,
> `OrderConfirmationModal.tsx`, `NavBar`). No es una constante. Un typo al refactorizar
> convierte a un invitado en usuario registrado (o al revés).

### 9. Carrito

**Archivos:** `utils/cartStorage.ts` (clave `mng_cart_v1`, `CART_VERSION = 1`)

- Persistido en `localStorage`, serializado en base64 (ofuscación, **no seguridad**)
- `POST cart?type=online` devuelve el **cart token (JWT)** que luego identifica el
  carrito en reprice, FedEx y creación de orden

> ⚠️ **Trampas:**
> - `cartStorage.ts` y `store/cartSlice.ts` **exportan ambos `addToCart` y
>   `removeFromCart`**. El de Redux está muerto (0 consumidores). Un autoimport del IDE
>   puede traer el equivocado y el carrito deja de persistir sin error.
> - `CART_VERSION` existe pero no hay migración escrita: si cambia el shape de
>   `CartItem`, los carritos viejos en localStorage de usuarios reales pueden romper.

### 10. Acceso a órdenes de invitado — ⚠️ control solo del lado del cliente

**Archivos:** `utils/guestOrderAccess.ts`, `app/w/checkout/order-confirmed/page.tsx`

Cómo funciona hoy:

```ts
// order-confirmed/page.tsx
const response = await fetch(`${API_URL}customers/order/${orderId}`); // ← 1. ya trajo los datos
const data = await response.json();
if (isGuestOrder) {
  const localAllowed = hasGuestOrderAccess(orderId);                  // ← 2. recién acá valida
  if (!isLoggedInNonGuest && !localAllowed) { setError('No autorizado'); }
}
```

Y la validación es:

```ts
export function hasGuestOrderAccess(orderId) {
  return Boolean(map[orderId]);   // ¿existe la clave en MI localStorage?
}
```

> 🔴 **Problema real:** se genera una clave de 32 caracteres con `crypto.getRandomValues`
> pero **nunca se envía al backend ni se valida contra nada**. El `fetch` ocurre
> **antes** del chequeo, así que el backend ya devolvió nombre, teléfono y dirección de
> la orden. El "no autorizado" es solo cosmético: cualquiera que itere `orderId` obtiene
> los datos desde la red, y el gate se saltea escribiendo una clave en localStorage.
>
> **No es un problema del refactor — ya existe.** Se arregla en el backend (que la clave
> viaje y se valide). Anotado acá para no "limpiar" ese código creyendo que es
> redundante, y para que entre al backlog.

---

## 🟡 MODERADO

### 11. Catálogo
`web-page/products`, `web-page/categories`, `web-page/discounts`, `web-page/outfits`.
Páginas: `clothes`, `categories`, `new`, `discounts`, `results`, `outfits`.
Son las rutas que **sí** son server components con `generateMetadata` — mantenerlo así.

### 12. Búsqueda
`searchs/advanced?search=`, `searchs?type=` + términos más buscados y recomendaciones.

> ⚠️ `components/nav/SearchNavBarDialog.tsx:165` tiene la URL **hardcodeada**
> (`https://api.moneroget.com/api/...`) en lugar de usar `API_URL`. Si se cambia de
> entorno, ese endpoint sigue apuntando a producción.

### 13. Cálculo de precios y descuentos
`utils/price.ts` — `calculatePrice()` + `isDiscountActive()` (valida `startDate`/`endDate`).

> ⚠️ Solo **5 archivos** lo usan. El carrito y el checkout hacen su **propia aritmética**
> (ej. `parseFloat(repriceItem.totalPrice) / repriceItem.quantity`). Hay dos lógicas de
> precio en el proyecto: unificarlas es bueno, pero hay que hacerlo con cuidado porque
> una alimenta la vitrina y la otra el cobro.
>
> También: `DiscountsBody.tsx:103` tiene un `TODO` — filtro de fechas del lado cliente
> que debería hacer el backend.

### 14. Feature flag `WOMEN_ENABLED`
**Estado actual: `false`.** Un solo booleano en `config/features.ts` controla 8 lugares:
redirect del homepage, navbar, menú hamburguesa, checkout, `OrderConfirmationModal`,
`PageContainer` y el **bloqueo de generación de QR**.

> ⚠️ Cuando está en `false`, `generateQR` hace un `fetch` por **cada item del carrito**
> para averiguar su género antes de permitir el pago. Es el único feature flag que tiene
> efecto en un flujo de dinero.

### 15. Modales de descuento de temporada
`SeasonalDiscountModal` + `CompactSeasonalDiscountModal` (2 variantes) con sus 2 hooks,
2 gates y `utils/seasonalDiscountStorage.ts` (clave `seasonalDiscountState`).
Lógica de "no volver a mostrar" en localStorage.

### 16. Banners y publicidad
`GET banners` + `services/advertisementService.ts` (con caché propio).

> `store/adSlice.ts` está **muerto** (0 consumidores) aunque el endpoint sí se consume
> desde `clothingSlice`. Borrar el slice no apaga los banners.

### 17. Recomendaciones por interés
`hooks/useInterestRecommendations.ts` — cruza los términos más buscados con productos.

### 18. Newsletter
`components/SubscriptionSection.tsx` — un `POST` suelto.

---

## 🟢 SEGURO — Refactor libre

19. Páginas estáticas: `about_us`, `policies`, `privacy`, `information`, `contact`
20. `PrivacyPolicy.tsx` (514 líneas) y `TermsAndConditions.tsx` (417) — texto legal;
    no cambiar el **contenido**, pero el componente es inofensivo
21. Sliders y galerías: `ImageSlider`, `AccessoriesSlider`, `ClothesSlider`,
    `CategorySlider`, `OutfitsSection`, `VideoBanner`, `NewsRoulette`
22. `Footer`, `SocialMediaLinks`, `SectionHeader`, `GalleryTile`, `PillsList`
23. Skeletons y loaders: `SkeletonLoader`, `LoadingScreen`, `LoadingMore`
24. SEO estático: JSON-LD `ClothingStore`, `robots.txt`, `manifest.json`

**Observabilidad** (segura de mover, pero ojo con una cosa):
- Bugsnag — ⚠️ su `onError` hace `window.location.reload()` automático ante
  `ChunkLoadError`. Si un deploy deja chunks desincronizados, los usuarios entran en
  recarga en bucle. La API key está hardcodeada como fallback en el código.
- Microsoft Clarity — solo en producción, con un filtro de errores propio inyectado
  antes del script.

---

## Resumen: el orden seguro para refactorizar

1. **Primero** lo 🟢 y 🟡 — ahí se practica la estructura nueva sin riesgo.
2. **Después** lo 🟠, probando **las dos ramas** de envío (nacional y FedEx) y
   **los dos tipos de usuario** (registrado e invitado).
3. **Al final** lo 🔴, y de a un flujo por vez, verificando con una compra real de prueba.

### Checklist de regresión manual (no hay tests automáticos)

Tras tocar cualquier cosa 🔴 o 🟠, probar el camino completo:

- [ ] Compra nacional + QR, usuario registrado
- [ ] Compra nacional + tarjeta, usuario registrado
- [ ] Compra internacional (FedEx) + tarjeta
- [ ] Compra como invitado de punta a punta
- [ ] Carrito con un producto sin stock → debe listar el variant correcto
- [ ] Expirar los 10 minutos en el modal de pago → debe redirigir
- [ ] Ver la orden confirmada como invitado y como registrado
