# Plan del frontend — qué resolvimos y qué falta

Este archivo es el **tablero de trabajo**. Los demás `docs/update/*` son el mapa
del backend (no se editan); acá anotamos qué se hizo, qué falta y en qué orden.

Última revisión: **31/10/2026**.

## Alcance: este repo es solo el storefront

El changelog de octubre mezcla tres frentes. **De los checklists, la mayoría de
los ítems son del panel/POS y no se tocan acá**: traslados, reposiciones, caja
diaria, despacho, conteo físico, ingreso por Excel, SIAT de bajo nivel y el CRUD
admin. Si un ítem habla de `ADMIN`, `SUPERVISOR`, "bodega", "despacho" o
"kardex", no es de este proyecto.

Lo que sí es nuestro: los ítems de storefront de las actualizaciones del
**30/10** y **31/10** de [14-changelog-2026-10.md](14-changelog-2026-10.md).

## Dos avisos que cuestan tiempo si se olvidan

**1. El changelog miente sobre lo desplegado.** La sección del 31/10 dice
"Todavía no está desplegado", pero el Swagger en vivo
(`api.moneroget.com/api/docs-json`) ya exige `branchId`:

```
POST /shipping/rates          required: [items, branchId, recipient]
POST /web-page/orders/online  required: [items, name, phone, address, branchId, billing]
POST /orders/reprice          branchId: "Obligatoria con type online"
```

Con `whitelist: true` + `forbidNonWhitelisted: true`, un campo de más **o de
menos** tira `400`. Antes de dar por cierto un "no desplegado", conviene mirar
el Swagger — es la fuente de verdad, los md son el mapa.

**2. Casi nada de esto se puede probar en local.** `pnpm run dev` apunta a la
**API de producción** y el backend rechaza `localhost` como callback de OAuth.
Todo lo que pase de la pantalla de pago (orden, QR, tarjeta, FedEx, invitado)
solo se ve contra el backend real. **No completar una compra de prueba: crea
datos reales.** Por eso varios ítems abajo dicen 🚫 no verificable en local.

## Protocolo

El de siempre ([../areglos/protocolo-de-trabajo.md](../areglos/protocolo-de-trabajo.md)):
un cambio a la vez, de lo fácil a lo difícil, verificación manual entre cada
uno, y **todo local — no se commitea ni se pushea sin pedido explícito**.
Verificación mínima de cada paso: `pnpm run typecheck` (debe dar 0) y
`pnpm run lint` (no debe subir sobre la base: **116 problemas**). Sin `build`.

---

## ✅ Resuelto

| # | Ítem | Dónde quedó |
|---|---|---|
| 336 | Selector de sucursal al entrar (`GET /web-page/branches`), por defecto la primera | [`branchSlice.ts`](../../src/store/branchSlice.ts), [`BranchSelector.tsx`](../../src/components/nav/BranchSelector.tsx), [`BranchProvider.tsx`](../../src/components/BranchProvider.tsx) |
| 337 | `branchId` en el reprice y en la orden; re-reprice al cambiar de sucursal | [`checkoutCart.ts`](../../src/utils/checkoutCart.ts), [`orderService.ts`](../../src/utils/orderService.ts), efecto de validación en [`checkout/page.tsx`](../../src/app/w/checkout/page.tsx) |
| 343, 375 | `?branchId=` en el detalle de producto y de outfit, y re-pedido al cambiar | [`ProductPageClient.tsx`](../../src/app/w/[product]/ProductPageClient.tsx), [`outfits/page.tsx`](../../src/app/w/outfits/page.tsx), [`AccessoriesSlider.tsx`](../../src/components/AccessoriesSlider.tsx) |
| 375 | `branchId` en la cotización FedEx | [`shippingRates.ts`](../../src/utils/shippingRates.ts) |
| 338 | Los ids sin stock se leen del **texto** del `400`, no de `errorsStock` | ya estaba en [`checkoutCart.ts`](../../src/utils/checkoutCart.ts) |
| 340 | `order-confirmed` lee `paymentStatus` (`confirmed`/`rejected`/`review`) | [`PaymentIssueNotice.tsx`](../../src/app/w/checkout/order-confirmed/PaymentIssueNotice.tsx) |
| 341, 344 | QR: cortar el polling con `404` y dejar de mostrar el QR | [`QRPaymentModal.tsx`](../../src/components/QRPaymentModal.tsx) |
| 380 | Tarjeta: `checkout-params` al hacer clic y manejo del `409`/`404` | [`cybersourceService.ts`](../../src/services/cybersourceService.ts) |
| 339 | `400 Insufficient stock` al crear la orden: nombra las prendas que fallaron | [`insufficientStock.ts`](../../src/utils/insufficientStock.ts) |
| 342 | FedEx: `400` de peso/empaque legible, y `commit: null` tolerado | ya cubierto (ver nota) |
| 346 | Envío que no corresponde al lugar: `400` legible | ya cubierto (ver nota) |
| 347a | "Mis órdenes": una `pending` con `expiresAt` pasado se muestra vencida | [`orderStatus.ts`](../../src/utils/orderStatus.ts) |
| 376 | Invalidar la cotización FedEx al cambiar de sucursal | `clearFedexRates` en [`checkoutSlice.ts`](../../src/store/checkoutSlice.ts) |
| — | **El storefront llamaba 4 endpoints del panel admin** (401): `categories`, `outfits`, `places`, `products` → ahora `web-page/*` | [`clothingService.ts`](../../src/services/clothingService.ts), [`checkout/page.tsx`](../../src/app/w/checkout/page.tsx), [`NewProductsBody.tsx`](../../src/app/[gender]/new/NewProductsBody.tsx) |
| C8 | Flujo de pago deduplicado: los guards, el payload y el parseo de errores viven una sola vez | [`confirmOrder.ts`](../../src/utils/confirmOrder.ts) |
| — | Imágenes: `minimumCacheTTL` 31 días + `imageSizes` recortado (mitigación, ver pedido al backend) | [`next.config.ts`](../../next.config.ts) |
| B0 | **Las dos rutas de cliente**: `web-page/customers/me` y `web-page/customers/order/:id`. La ruta mala además borraba el token en cada carga | [`customerProfile.ts`](../../src/services/customerProfile.ts), [`order-confirmed/page.tsx`](../../src/app/w/checkout/order-confirmed/page.tsx) |
| — | **`ApiError` con `status`**: el token solo se borra con un `401`, no ante cualquier fallo (antes una caída de red deslogueaba) | [`client.ts`](../../src/shared/api/client.ts), [`useAuthInit.ts`](../../src/hooks/useAuthInit.ts) |
| 345 | **C7 — invitado `401 Guest session expired`**: sesión nueva, dirección descartada y vuelta al paso 1, con aviso | [`guestSession.ts`](../../src/shared/auth/guestSession.ts), `handleSessionExpired` en [`checkout/page.tsx`](../../src/app/w/checkout/page.tsx) |
| 92 | Storefront sin `warehouseStock`/`inTransitStock` | nunca se usaron |
| — | Listados públicos: `categories` como array directo | se lee bien; `sizes`/`subcategories`/`first-discount` no se consumen |

Dos de estos no eran mejoras, eran **reparaciones**: sin `branchId`,
`POST /web-page/orders/online` y `POST /shipping/rates` respondían `400`, así
que ninguna compra online podía completarse.

**Nota sobre 342 y 346** (los dos resultaron ya resueltos al verificarlos):
`apiFetch` arma el error como `data.message || data.error || fallback`
([`client.ts:51`](../../src/shared/api/client.ts#L51)), y el backend siempre
manda `message`. Así que los textos en español del back —
`El envío <nombre> no corresponde al lugar de la dirección`,
`El producto "<nombre>" no tiene configurado weightGrams|unitsPerBox` — **ya
llegan tal cual a la pantalla**. Y `commit` no se muestra en ninguna vista (solo
está tipado en el slice), así que `null` nunca fue un problema. Lo único que
había de verdad eran los *fallbacks* en inglés, ahora en español.

---

## 🔜 Pendiente, en orden de ataque

Orden = primero lo que más daño hace, y dentro de eso lo más fácil.

### Grupo B — medios

**B6. Cancelar una orden** (ítem 347, segunda parte)
No existe: no hay ninguna llamada a `POST /web-page/customers/cancel/order/:id`.
No es un arreglo, es funcionalidad nueva — y el doc pide mostrar el resultado
con la respuesta del `POST`, porque después la orden desaparece de `orders[]` y
su detalle da `404`.
Complejidad: **media**. Decidir antes si entra en el alcance.

### Pedido al backend — imágenes (bloquea el rendimiento, no se arregla del lado del front)

Síntoma: abrir un producto o un outfit tarda muchísimo y el log del dev server
llena de `GET /_next/image?... 500 in 7.2s` con `TimeoutError`.

Medido el 02/11 contra `api.moneroget.com`:

| Qué | Valor |
|---|---|
| Peso de los originales | **420 KB de promedio, hasta 1.2 MB** (10 muestras) |
| `Cache-Control` | **`public, max-age=0`** en todas |
| Throughput del origen | **23–28 KB/s** en los peores casos, 462 KB/s en el mejor |
| Servidor | `X-Powered-By: Express`, sin CDN |
| Timeout del optimizador de Next | **7 s, hardcodeado** (`AbortSignal.timeout(7000)`, no configurable) |

La cuenta: 1.2 MB a 23 KB/s son ~52 s, muy por encima de los 7 s. Next aborta,
responde `500`, y **un `500` no se cachea**, así que reintenta en cada recarga.

Lo que hace falta del backend, por impacto:

1. **Comprimir/redimensionar al subir.** Una foto de producto de ~1200 px al 80 %
   de calidad pesa 80–200 KB, no 420 KB–1.2 MB. Es lo único que arregla la
   primera carga.
2. **`Cache-Control: public, max-age=31536000, immutable`** en vez de
   `max-age=0`. Los nombres son UUID: nunca cambian, así que son inmutables por
   construcción. Hoy el navegador re-descarga todo en cada visita.
3. (Ideal) **Un CDN** delante del Express que sirve los estáticos.

Mitigado del lado del front en [`next.config.ts`](../../next.config.ts):
`minimumCacheTTL` a 31 días (el default es 4 h) y `imageSizes` recortado a los
cuatro buckets que la app realmente alcanza. Eso hace que **cada imagen golpee
el origen lento una vez en lugar de cada pocas horas**, pero no acelera la
primera carga.

### Grupo C — difíciles

**C9. Deduplicar el formulario del checkout** (resto de la Fase 2b)
El **flujo de pago** ya está unificado en
[`confirmOrder.ts`](../../src/utils/confirmOrder.ts) (C8). Lo que sigue
duplicado es el **formulario de dirección y facturación**, escrito dos veces en
[`checkout/page.tsx`](../../src/app/w/checkout/page.tsx) (layout de escritorio y
layout móvil, ~3100 líneas en total).
Complejidad: **alta**. Es refactor puro de UI, sin cambio de comportamiento.
Ver [../areglos/plan-refactor.md](../areglos/plan-refactor.md).

---

## Sugerencia de orden

1. ~~**Grupo A**~~ — hecho.
2. ~~**B5**~~ — hecho.
3. ~~**B4**~~ — hecho.
4. Decidir si **B6** entra en el alcance.
5. ~~**C8**~~ — hecho (el flujo de pago ya no está duplicado).
6. ~~**B0**~~ — hecho. Ahora sí hay `client` real para verificar.
7. Decidir si **B6** entra en el alcance.
8. ~~**C7**~~ — hecho.
9. **C9** (deduplicar el formulario) — refactor puro, sin apuro. Es lo único
   que queda del lado del front, además del pedido de imágenes al backend.

El cuello de botella real no es ninguno de estos ítems: es que **no hay dónde
probar un pago**. Mientras siga así, todo el Grupo C se hace a ciegas.

---

## 🧪 Pruebas manuales — se hacen todas al final

Se acumulan acá a medida que se cierra cada ítem, y se corren **de una sola vez
al terminar**. Marcá cada una al pasarla.

> **Estado al 03/11/2026**: navegando en local **a simple vista todo funciona**
> — catálogo, selector de sucursal, producto, outfits y checkout cargan. Eso es
> una observación, **no** una verificación: ninguna casilla de abajo está
> tildada todavía. Las que importan son las que distinguen "carga" de "hace lo
> correcto" (los `branchId` en Network, los caminos de error, los totales).

**Antes de empezar**: `pnpm run dev`. Recordá que apunta a la **API de
producción**: podés navegar, cotizar y mirar el Network sin problema, pero
**no completes un pago** salvo en el bloque C, que es a conciencia.

### Cómo tener sesión en local (hace falta para A-19 a A-21 y A-40 a A-49)

El login con Google **no se puede completar en local**: el backend ignora el
`callback` que le manda el front y siempre le pide a Google que vuelva a
`https://moneroget.com/auth/callback` (verificado el 02/11). Pero lo que esas
pruebas ejercitan no es el login, es lo que pasa con el token ya emitido — y el
token es un simple bearer en `localStorage`:

1. Entrá a **www.moneroget.com** y logueate con Google.
2. DevTools → **Application** → Local Storage → copiá el valor de `authToken`.
3. En `localhost:3000`, en la Console:
   `localStorage.setItem('authToken', 'PEGA_EL_TOKEN')`
4. Recargá.

Es una **sesión real contra producción**: mirá órdenes y direcciones, pero no
completes una compra. No compartas ese token. Si deja de andar (volviste a
loguearte en producción), copiá el nuevo.

### Las 5 de mayor riesgo acumulado

Si hay poco tiempo, estas primero — son las que más superficie cubren:

- [ ] **A-40** la sesión sobrevive a recargas (B0 arregló que se borrara el token)
- [ ] **A-45** el checkout con sesión sigue usable (camino dormido por meses)
- [ ] **A-38** el desplegable de departamentos se llena (venía de un 401)
- [ ] **A-31** la hoja móvil del checkout a 900 px (C8 reescribió los dos layouts)
- [ ] **A-33** los totales no cambiaron (se borró un cálculo muerto)

### Bloque A — se prueban en local, sin gastar plata

Selector de sucursal:

- [ ] A-1. En `/men`, al lado de "BUSCA AQUÍ" aparece el pin con el nombre de la tienda.
- [ ] A-2. Al hacer scroll la navbar cambia a fondo sólido y el pin sigue legible (hereda el color).
- [ ] A-3. Click en el pin abre la lista; la tienda actual tiene tilde; click afuera cierra.
- [ ] A-4. Angostando a ~900 px queda solo el pin, sin empujar el carrito ni romper la fila.
- [ ] A-5. El pin también está en un producto (`/w/...`), en `/w/outfits` y en las páginas de categorías.
- [ ] A-6. En Network, filtrando `branches`: **una sola** llamada por carga de la web, no una por página.
- [ ] A-7. Recargando, el pin sigue mostrando la misma tienda (`localStorage` → `selected_branch_id`).

`branchId` en las peticiones (Network → pestaña Payload/Headers):

- [ ] A-8. Abrir un producto: `web-page/products/<id>?branchId=<N>`.
- [ ] A-9. Abrir un outfit: `web-page/outfits/<id>?branchId=<N>`.
- [ ] A-10. Click en un accesorio del slider: también lleva `?branchId=`.
- [ ] A-11. Entrar al checkout: el body de `orders/reprice` trae `type: "online"` **y** `branchId`.
- [ ] A-12. La petición al servidor del producto (la del HTML, no la del cliente) va **sin** `branchId` — es a propósito, para el SEO.

Si falla el catálogo de sucursales (DevTools → Network → clic derecho sobre la
petición → **Block request URL**, patrón `*web-page/branches*`, y recargar):

- [ ] A-13. El catálogo **sigue navegable** y los productos se ven (con stock sumado de todas las tiendas).
- [ ] A-14. El pin **no aparece** (no muestra un selector vacío).
- [ ] A-15. En el checkout, al confirmar, sale *"No pudimos conectar con la tienda…"* y **no** se crea ninguna orden.

Retorno de la tarjeta — se prueba **escribiendo la URL a mano**, porque el
parámetro solo elige el mensaje:

- [ ] A-16. `/w/checkout/order-confirmed?orderId=123&paymentStatus=rejected` → "No se pudo procesar tu pago", botón **Volver a intentar**. **No** redirige al home.
- [ ] A-17. `...&paymentStatus=review` → "Recibimos tu pago, pero falta confirmar tu compra" con el N° de orden y botón **Contactanos**.
- [ ] A-18. `...&paymentStatus=cualquiercosa` y sin el parámetro → se comporta como siempre (intenta cargar la orden).

Mis compras (hace falta una cuenta con órdenes):

- [ ] A-19. Una orden `pending` con `expiresAt` pasado dice **"Cancelado por falta de pago"** en rojo y **no** responde al click.
- [ ] A-20. Las `paid` y `sent` siguen en azul/verde, clickeables, y abren `order-confirmed`.
- [ ] A-21. ⚠️ **El fallo grave de este cambio sería el inverso**: que una orden válida aparezca como vencida. Revisar que no pase.

Nada roto (regresión rápida):

- [ ] A-22. Home, `/men`, `/women`, categorías, prendas, descuentos, novedades, resultados de búsqueda y "sobre nosotros" cargan sin error en consola.
- [ ] A-23. Buscador abre, busca y lleva a un producto.
- [ ] A-24. Agregar y quitar del carrito actualiza el contador de la navbar.
- [ ] A-25. Login con Google entra y el nombre sale en el ícono de usuario.
- [ ] A-26. Ningún texto en inglés visible en el checkout ante un error.

Cambio de sucursal con cotización FedEx viva — **solo se puede probar cuando
exista una segunda sucursal**:

- [ ] A-27. Con dirección internacional, cotizar FedEx, llegar al paso 2 y cambiar de tienda en el pin. Debe volver al paso 1 con el aviso ámbar *"Cambiaste de tienda…"*.
- [ ] A-28. Al re-cotizar, el aviso desaparece solo y el `branchId` del nuevo `shipping/rates` es el de la tienda nueva.
- [ ] A-29. Con **una** sucursal, elegir la misma del pin **no** debe disparar nada: ni aviso, ni salto de paso, ni perder la cotización.

Flujo de pago unificado (C8) — el cambio de mayor superficie, toca los **dos**
layouts. El checkout cambia de layout en **1024 px** (`BREAKPOINTS.checkoutDesktop`):

- [ ] A-30. A **1200 px**: el checkout carga, se llega al paso 3 y el botón de confirmar responde (sin completar el pago).
- [ ] A-31. A **900 px**: se abre la hoja móvil de confirmación y su botón responde igual.
- [ ] A-32. En los dos, al apretar confirmar el botón pasa a estado "cargando" **y vuelve** si algo falla — no debe quedarse trabado.
- [ ] A-33. El total que muestra el resumen no cambió respecto de antes (el cálculo muerto que borré no alimentaba ninguna pantalla; si algún total se ve en 0, es un fallo mío).

Endpoints del catálogo corregidos (los que daban 401) — **en Network no debe
quedar ningún 401 ni 404 navegando el catálogo**:

- [ ] A-34. `/men` y `/women`: `web-page/categories` responde **200** y las categorías se ven. Las de hombre no deben aparecer en `/women` ni al revés.
- [ ] A-35. Cambiar de `/men` a `/women`: las categorías cambian (una sola petición cubre los dos géneros, no debería repetirse).
- [ ] A-36. Novedades (`/[gender]/new`): `web-page/products?days=...` responde **200** y lista productos; el "cargar más" sigue funcionando.
- [ ] A-37. `/w/outfits`: `web-page/outfits` responde **200** y los outfits se filtran por género.
- [ ] A-38. Checkout, paso de dirección: `web-page/places` responde **200** y el desplegable de departamentos se llena. ⚠️ Si queda vacío, no se puede elegir envío nacional.
- [ ] A-39. Sliders del home: siguen mostrando solo los del género de la página.

Rutas de cliente (B0) — **esto es lo que destraba A-19/A-20/A-21**:

- [ ] A-40. Login con Google y **recargar**: la sesión tiene que **sobrevivir**. Antes la ruta mala borraba el token en cada carga.
- [ ] A-41. En Network: `web-page/customers/me` responde **200** (no 404).
- [ ] A-42. Ícono de usuario: sale tu nombre real, no "Usuario".
- [ ] A-43. "Mis compras" lista órdenes reales (si tenés). "Datos personales" y direcciones guardadas se llenan.
- [ ] A-44. `order-confirmed?orderId=<una orden tuya real>` carga el detalle: `web-page/customers/order/:id` responde **200**.
- [ ] A-45. ⚠️ Checkout con sesión: ahora pueden aparecer **direcciones guardadas** y campos en `readOnly` que antes no salían. Revisar que el formulario siga usable y se pueda completar.

Token y errores (`ApiError`) — se prueba **bloqueando peticiones**, sin pagos:

- [ ] A-46. Con sesión activa, bloquear `*web-page/customers/me*` (DevTools → Block request URL) y recargar: el `authToken` **debe seguir** en `localStorage`. Antes se borraba.
- [ ] A-47. Quitar el bloqueo y recargar: la sesión vuelve sola, sin volver a loguearse.
- [ ] A-48. Poner un token basura (`localStorage.setItem('authToken','xxx')`) y recargar: ahí **sí** debe borrarse (el backend responde `401`).
- [ ] A-49. Modo avión / red cortada y recargar: el token **no** debe borrarse.

Sesión vencida a mitad del checkout (C7) — se provoca **ensuciando el token**:

- [ ] A-50. Entrar como invitado, llegar al paso de dirección, y antes de continuar poner `localStorage.setItem('authToken','xxx')`. Al apretar continuar: aviso ámbar *"Tu sesión expiró y abrimos una nueva…"*, vuelta al **paso 1**, y el **carrito intacto**.
- [ ] A-51. Tras eso, completar la dirección de nuevo y seguir: debe funcionar hasta la pantalla de pago (cortar ahí).
- [ ] A-52. El aviso desaparece solo al crear la dirección nueva.
- [ ] A-53. Lo mismo con sesión **registrada** (token de Google ensuciado): debe decir *"Volvé a iniciar sesión"* y mostrar la pantalla de login, **no** abrir una sesión de invitado.
- [ ] A-54. Invitado/registrado: el ícono de usuario y el menú hamburguesa siguen distinguiendo bien invitado de cuenta real (se centralizó esa comprobación en 6 archivos).

### Bloque B — necesitan el backend real, sin completar el pago

- [ ] B-1. Checkout con dirección **internacional**: el body de `shipping/rates` trae `branchId`, y vuelven servicios con precio en Bs.
- [ ] B-2. Un producto sin peso/empaque cargado da el mensaje del backend nombrando el producto, no "No hay opciones de envío disponibles".
- [ ] B-3. Al confirmar la orden, el body de `web-page/orders/online` trae `branchId`. (Cortar antes de pagar.)

### Bloque C — requieren pagar de verdad 💸

Son los que no se pueden verificar de otra forma. Hacerlos juntos, una sola vez,
con montos mínimos y avisando a quien mira las ventas.

- [ ] C-1. **QR vencido**: generar un QR y dejarlo morir. Al vencer, el polling **para** (en Network dejan de salir llamadas a `payments/verify`) y aparece *"La orden venció — si ya pagaste, contactanos"*.
- [ ] C-2. **Tarjeta rechazada**: con una tarjeta de prueba que rechace, el retorno cae en `paymentStatus=rejected` y muestra la pantalla de A-16.
- [ ] C-3. **Tarjeta con tiempo agotado** (`409` en `checkout-params`): sale *"Se agotó el tiempo para pagar esta orden"*.
- [ ] C-4. **Compra completa**: QR pagado → orden `paid` y `order-confirmed` muestra el detalle.
- [ ] C-5. **Sin stock al crear la orden**: difícil de provocar a mano (hace falta que otro se lleve la última unidad entre el reprice y la confirmación). Si se puede simular, en escritorio reabre el modal de stock y en móvil nombra las prendas.

