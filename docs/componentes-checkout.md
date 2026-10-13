# Diagnóstico: los 13 componentes sueltos en `app/w/checkout/`

**Fecha:** 2026-10-08 · **Commit base:** `d0f607e`

Analiza los componentes que hoy viven dentro de la carpeta de ruta en lugar de una
carpeta de dominio. Complementa [arquitectura-objetivo.md](./arquitectura-objetivo.md)
(dónde va cada cosa) y [funcionalidades.md](./funcionalidades.md) (qué tan riesgoso es
tocarlo).

---

## Veredicto corto

Ninguno de los 13 pertenece a `src/app/`. Pero **mover 13 archivos de carpeta no
arregla el problema real**, y conviene saberlo antes de empezar:

> 🔴 **El flujo de pago está implementado dos veces, partido por tamaño de pantalla.**
> `page.tsx` atiende desktop y `OrderConfirmationModal.tsx` atiende mobile, cada uno con
> su propia copia de la creación de orden y el pago.

Por eso la carpeta "no se siente bien": no es desorden de ubicación, es **una
duplicación de dominio** que la estructura plana vuelve invisible.

---

## El hallazgo central: dos caminos de pago

### Evidencia

| Símbolo | `page.tsx` | `OrderConfirmationModal.tsx` |
|---|---|---|
| `createOrder` | ✅ | ✅ |
| `generateQR` | ✅ | ✅ |
| `buildCybersourceBilling` | ✅ | ✅ |
| `saveGuestOrderAccess` | ✅ | ✅ |
| `checkForWomenItems` | ✅ | ✅ |
| `handleCardPaymentBeforeRedirect` | ✅ | ✅ |
| `<QRPaymentModal>` | ✅ | ✅ |
| `<CardPaymentModal>` | ✅ | ✅ |

Y los dos handlers que crean la orden tienen **exactamente 95 líneas cada uno**:

- `page.tsx` → `handleConfirmOrder()` — 95 líneas
- `OrderConfirmationModal.tsx` → `handlePayOrder()` — 95 líneas

### Cómo se reparten

```
handlePaymentMethodSelect() en page.tsx:
  if (window.innerWidth < 1024) setShowOrderConfirmationModal(true);   // ← MOBILE
  // si no, el desktop sigue por currentStep dentro de page.tsx        // ← DESKTOP
```

`page.tsx` renderiza **los tres**: el `OrderConfirmationModal` (línea 3040) más su
propio `QRPaymentModal` (3052) y `CardPaymentModal` (3064), estos últimos detrás de
`showDesktopQRModal` / `showDesktopCardModal`.

### Por qué importa

- Un fix de pago aplicado en desktop **queda roto en mobile** (y al revés).
- Es código 🔴 crítico según [funcionalidades.md](./funcionalidades.md): duplicar el
  camino de creación de orden duplica la superficie donde se puede perder una venta.
- Explica por qué `page.tsx` tiene 44 `useState`: muchos son el espejo desktop de un
  estado que el modal ya maneja.

> ⚠️ **Bonus:** el checkout decide "mobile" con `window.innerWidth < 1024` **imperativo
> en 7 lugares**, mientras el resto del proyecto usa `useIsMobile()` con breakpoint
> **768**. Son dos definiciones distintas de "mobile" conviviendo. Entre 768px y 1024px
> el comportamiento es ambiguo.

---

## Tabla de destinos

Riesgo según [funcionalidades.md](./funcionalidades.md).

| Componente | Líneas | Riesgo | Destino | Acción |
|---|---|---|---|---|
| `OrderConfirmationModal.tsx` | 908 | 🔴 | `features/checkout/components/` | **Deduplicar primero** — ver abajo |
| `OrderReviewSection.tsx` | 653 | 🟠 | `features/checkout/components/` | Dividir en 3 |
| `OrderItemsList.tsx` | 261 | 🟡 | `features/checkout/components/` | Mover |
| `DeliveryOptionsSection.tsx` | 243 | 🟠 | `features/checkout/components/` | Mover (toca FedEx) |
| `DesktopCartSummary.tsx` | 226 | 🟡 | `features/checkout/components/` | Mover + renombrar |
| `CheckoutCostSummary.tsx` | 168 | 🟠 | `features/checkout/components/` | Mover |
| `DeliveryMethodDisplay.tsx` | 152 | 🟡 | `features/checkout/components/` | Mover |
| `PaymentMethodSelectionSection.tsx` | 145 | 🟠 | `features/checkout/components/` | Mover |
| `OrderProgressIndicator.tsx` | 121 | 🟢 | `features/checkout/components/` | Mover + usar `ORDER_STATUS` |
| `DeliveryAddressDisplay.tsx` | 90 | 🟡 | `features/checkout/components/` | Mover |
| `OrderTotalDisplay.tsx` | 74 | 🟡 | `features/checkout/components/` | Mover + extraer moneda |
| `FedexCustomsDisclaimer.tsx` | 61 | 🟢 | `features/checkout/components/` | Mover |
| `OrderStatusDisplay.tsx` | 43 | — | 🗑️ | **Borrar** (0 consumidores) |

**Ninguno va a `shared/ui/`.** Verifiqué los consumidores de los 13: todos están dentro
de checkout. No hay un solo componente genérico escondido acá.

---

## Sub-estructura propuesta

La carpeta plana oculta que hay **dos agrupaciones distintas**. Seis de estos
componentes se comparten entre el checkout y la página de orden confirmada
(`order-confirmed/`), y los otros son exclusivos del flujo de compra.

```
features/checkout/
  components/
    flow/                      # exclusivos del proceso de compra
      PaymentMethodSelectionSection.tsx
      DeliveryOptionsSection.tsx
      CheckoutCostSummary.tsx
      OrderConfirmationModal.tsx
      FedexCustomsDisclaimer.tsx
    order-summary/             # compartidos con order-confirmed/
      OrderItemsList.tsx
      OrderTotalDisplay.tsx
      OrderProgressIndicator.tsx
      DeliveryAddressDisplay.tsx
      DeliveryMethodDisplay.tsx
      OrderReviewSection.tsx
      DesktopCartSummary.tsx
  hooks/                       # salen de page.tsx + el modal (Fase 2)
  api/
  model/
```

Por qué `order-summary/` aparte: esos 7 los consume también
`order-confirmed/page.tsx`, que **no es parte del flujo de compra** sino de
post-compra. Marcar esa frontera evita que alguien les agregue dependencias del
checkout y rompa la pantalla de confirmación.

### Grafo de dependencias actual

```
page.tsx
 ├── CheckoutCostSummary ──────── FedexCustomsDisclaimer
 ├── DeliveryOptionsSection ───── FedexCustomsDisclaimer
 ├── PaymentMethodSelectionSection
 ├── DesktopCartSummary
 ├── OrderConfirmationModal ───── OrderReviewSection ──┐
 └── OrderReviewSection ─────────────────────────────── ┤
                                                        ├── OrderItemsList
order-confirmed/page.tsx                                ├── OrderTotalDisplay
 ├── OrderProgressIndicator                             ├── DeliveryAddressDisplay
 ├── DesktopCartSummary                                 └── DeliveryMethodDisplay
 └── (los 4 de la derecha, directo)
```

`OrderReviewSection` se renderiza tanto desde `page.tsx` como desde dentro de
`OrderConfirmationModal` — es el componente que ambos caminos comparten, y la pista
de que la duplicación es de *lógica*, no de *vista*.

---

## Lo que sí sube a `shared/`

No son componentes, son dos utilidades que están copiadas por todas partes:

### 1. Formato de moneda → `shared/lib/formatCurrency.ts`

- **37 ocurrencias** de `'Bs.'` hardcodeado en 17+ archivos
- **18 ocurrencias** de `.toFixed(2)` sueltas

Hoy el formato de precio se reescribe en cada componente. Un solo helper
(`formatBs(amount)`) elimina las 37.

### 2. Breakpoint único → `shared/lib/breakpoints.ts`

Resolver los dos valores en conflicto (768 de `useIsMobile` vs 1024 del checkout) con
una constante compartida, y reemplazar los 7 `window.innerWidth < 1024` imperativos.

---

## Deuda transversal de estos 13

### Estilos inline: 229 `style={{}}` solo en esta carpeta

| Archivo | `style={{` |
|---|---|
| `OrderConfirmationModal.tsx` | 53 |
| `page.tsx` | 46 |
| `OrderReviewSection.tsx` | 36 |
| `OrderItemsList.tsx` | 25 |
| `DesktopCartSummary.tsx` | 22 |
| resto | 47 |

Es una **cuarta estrategia de estilos** sobre las tres ya documentadas en el
[diagnóstico](./diagnostico.md#stack) (Tailwind + CSS plano + CSS modules). Varios
componentes mezclan `className="flex justify-between"` con `style={{ fontSize:
'0.875rem', color: '#6b7280' }}` en el mismo elemento, con colores hardcodeados que
ya existen como tokens en `styles/theme.css`.

### Otros detalles

- `OrderProgressIndicator` compara `status === 'paid'` / `'sent'` con **strings
  literales**, aunque `constants/orders.ts` ya exporta `ORDER_STATUS` con esos valores.
- `DesktopCartSummary` se llama "Desktop" pero `order-confirmed/page.tsx` también lo
  usa. El nombre miente sobre su alcance.
- `checkout.css` (601 líneas) es un único archivo para los 13 componentes: al moverlos
  hay que partirlo o dejarlo como hoja de ruta del feature.

---

## Orden recomendado

La secuencia importa: mover archivos **antes** de deduplicar deja dos copias en
carpetas nuevas y más difíciles de comparar.

1. **Borrar `OrderStatusDisplay.tsx`** — riesgo nulo, 1 archivo menos.
2. **Extraer `formatBs()` a `shared/lib/`** y migrar las 37 ocurrencias. Mecánico y
   verificable con `tsc`.
3. **🔴 Unificar el camino de pago.** El paso clave: extraer un único
   `useOrderSubmit()` que consuman desktop y mobile, y borrar la copia. Esto cae en la
   **Fase 2** del [plan](./plan-refactor.md#fase-2--descuartizar-el-checkout) y exige
   la regresión manual completa (los 7 caminos de
   [funcionalidades.md](./funcionalidades.md#checklist-de-regresión-manual-no-hay-tests-automáticos)).
4. **Unificar el breakpoint** y reemplazar los 7 `innerWidth` imperativos.
5. **Recién ahí mover** los 12 restantes a `features/checkout/components/{flow,order-summary}/`.
6. **Dividir `OrderReviewSection`** (653) y lo que quede de `OrderConfirmationModal`
   una vez que ya no contenga lógica de pago.

> Los pasos 1, 2 y 4 se pueden hacer ya, sin tocar nada 🔴. El paso 3 es el único que
> necesita prueba de compra real.
