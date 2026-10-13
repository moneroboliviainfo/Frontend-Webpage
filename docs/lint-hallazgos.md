# Hallazgos del linter

**Fecha:** 2026-10-08 · Primera corrida real de ESLint en el proyecto.

Hasta el paso 7 del [protocolo](./protocolo-de-trabajo.md), ESLint **nunca había
corrido**: crasheaba con `TypeError: Converting circular structure to JSON`. Estos 118
problemas son todos **preexistentes** — ninguno lo introdujo el refactor.

---

## Por qué no corría

Dos cosas rotas a la vez:

1. **`eslint.config.mjs`** envolvía `next/core-web-vitals` y `next/typescript` en
   `FlatCompat`. Pero `eslint-config-next@16` ya exporta **flat configs nativas**
   (`Linter.Config[]`), y envolver un flat config en el adaptador de compatibilidad
   genera la referencia circular. Solución: importarlos directo y hacer spread.
2. **El script `pnpm run lint`** usaba `next lint`, que **fue eliminado en Next 16**.
   Next lo interpretaba como `next <directorio>` y fallaba con
   `no such directory: .../lint`. Solución: `eslint .`

> Nota: `core-web-vitals` ya incluye el config base (`index`), así que no hace falta
> importar los tres. Verificado: index = 3 entradas, core-web-vitals = 4.

---

## 🔴 Bug latente: hooks condicionales en el modal de pago QR — ✅ ARREGLADO 2026-10-08

> **Arreglado en el paso 8** del [protocolo](./protocolo-de-trabajo.md). El arreglo fue
> puro reordenamiento, **cero cambios de lógica**:
>
> - `const router = useRouter()` subió al tope del componente, junto a los `useState`.
> - El `useEffect` del redirect subió arriba del `if (!isOpen) return null`.
> - `formatTime` y el early return quedaron juntos al final.
>
> Se preserva el comportamiento exacto porque ese efecto **ya traía su propia guarda**
> `if (!isOpen) return;`, así que sigue siendo un no-op cuando el modal está cerrado.
>
> Resultado: `react-hooks/rules-of-hooks` pasó de **2 a 0**. El total del proyecto bajó
> de 118 a 116. `tsc` ✅ · build ✅.

### El problema original (para referencia)

**Archivo:** `src/components/QRPaymentModal.tsx:117-132`

```tsx
if (!isOpen) return null;        // ← línea 117: early return

const router = useRouter();      // ← línea 119: hook DESPUÉS del return

useEffect(() => {                // ← línea 122: otro hook DESPUÉS del return
  ...
}, [timeLeft, isOpen, router]);
```

Viola las Rules of Hooks: si el componente se monta con `isOpen = false` y luego pasa a
`true`, React llama 2 hooks más que en el render anterior y lanza
*"Rendered more hooks than during the previous render"*.

**Por qué no está estallando hoy:** los dos sitios que lo renderizan lo montan
condicionalmente, así que `isOpen` ya es `true` en el primer render:

```tsx
{showDesktopQRModal && createdOrderId && (<QRPaymentModal ... />)}   // page.tsx:3051
{showQRPayment && createdOrderId && (<QRPaymentModal ... />)}        // OrderConfirmationModal.tsx:884
```

Está protegido **por accidente**, no por diseño.

> ⚠️ **Esto es una mina para la Fase 2.** Al unificar el camino de pago en un solo
> modal, lo natural es renderizarlo sin condición y pasarle `isOpen` — y ahí revienta.
> **Hay que arreglarlo ANTES de tocar el flujo de pago.**
>
> El arreglo es mover las líneas 119-132 arriba del `return null` de la 117.
> `CardPaymentModal.tsx` ya lo hace bien (early return en la 106, cero hooks después):
> sirve de referencia.

---

## Inventario completo: 118 problemas en 45 archivos

> Estado actual: **116** (bajaron 2 al arreglar el bug de hooks).

### Errores (51)

| Cant. | Regla | Qué significa |
|---|---|---|
| 27 | `react-hooks/set-state-in-effect` | `setState` sincrónico dentro de un `useEffect` → renders en cascada |
| 13 | `@typescript-eslint/no-explicit-any` | Los 10 `any` ya detectados en el diagnóstico |
| 4 | `react-hooks/static-components` | Componentes definidos dentro de otro componente → remontan en cada render |
| 2 | `react/no-unescaped-entities` | Comillas o apóstrofos sin escapar en JSX |
| 2 | `react-hooks/immutability` | `ImageSlider.tsx:161,165` — mutación de variables después del render |
| ~~2~~ → **0** | ~~`react-hooks/rules-of-hooks`~~ | ✅ **Arreglado** — era `QRPaymentModal.tsx:119,122` |
| 1 | `@typescript-eslint/ban-ts-comment` | `BugsnagProvider.tsx:79` usa `@ts-ignore` en vez de `@ts-expect-error` |

### Warnings (67)

| Cant. | Regla | Qué significa |
|---|---|---|
| 45 | `@typescript-eslint/no-unused-vars` | Variables e imports sin usar — más código muerto que el inventariado |
| 8 | `react-hooks/exhaustive-deps` | Arrays de dependencias incompletos → bugs de estado desactualizado |
| 6 | `@next/next/no-location-assign-relative-destination` | `window.location.href` para navegación interna; debería ser `router.push()` |
| 5 | `@next/next/no-img-element` | `<img>` crudo en vez de `next/image` |
| 2 | *(directiva)* | `BugsnagProvider.tsx:55,61` — `eslint-disable` de `no-console` que ya no hace falta |
| 1 | `@typescript-eslint/no-unused-expressions` | Expresión sin efecto |

> Corrección al [diagnóstico](./diagnostico.md): ahí anoté "0 `<img>` crudos". Eran 0 en
> los archivos que revisé a mano, pero el linter encuentra **5**. El dato correcto es 5.

### Archivos con más problemas

| Cant. | Archivo |
|---|---|
| 16 | `src/app/w/checkout/page.tsx` |
| 10 | `src/components/BugsnagProvider.tsx` |
| 7 | `src/app/w/[product]/page.tsx` |
| 5 | `src/app/[gender]/discounts/DiscountsBody.tsx` |
| 4 | `src/app/PageContainer.tsx` |
| 4 | `src/app/w/checkout/OrderConfirmationModal.tsx` |
| 4 | `src/app/w/checkout/order-confirmed/page.tsx` |
| 4 | `src/components/CardPaymentModal.tsx` |
| 4 | `src/components/QRPaymentModal.tsx` *(eran 6, bajó con el paso 8)* |

---

## Orden sugerido para atacarlos

El paso 7 dejó el linter funcionando; el paso 8 arregló el único hallazgo con
consecuencia real. El resto sigue pendiente.

1. ✅ ~~**`QRPaymentModal` rules-of-hooks**~~ — **hecho** (paso 8). Ya no bloquea la Fase 2.
2. **Las 2 directivas `eslint-disable` sin uso** y el `@ts-ignore` → trivial.
3. **`--fix` automático** — solo 2 warnings son auto-corregibles, así que aporta poco.
4. **45 `no-unused-vars`** → mecánico, verificable con `tsc`, y descubre más código
   muerto del que el inventario manual encontró.
5. **27 `set-state-in-effect`** → requiere pensar cada caso. Varios caen dentro del
   checkout y se resuelven solos al extraer los hooks en la Fase 2. **No atacarlos
   sueltos**: esperar al refactor.
6. **8 `exhaustive-deps`** → cada uno puede esconder un bug de estado viejo. Caso por
   caso, con prueba manual.

> Hasta que el conteo baje, **no** agregar `lint` como gate de CI: fallaría siempre.
> Cuando se agregue, usar `--max-warnings` con el número actual e irlo bajando.
