# Protocolo de trabajo

**Acordado:** 2026-10-08

Reglas de cómo se ejecuta el refactor. **La web está en producción y funcionando** —
este protocolo existe para que siga así.

---

## Regla central

> **Un cambio por vez. Verificado por Claude. Probado manualmente por el usuario.
> Recién entonces el siguiente.**

Nunca agrupar varios cambios en un mismo paso, aunque parezcan triviales. Si algo se
rompe, el objetivo es saber **exactamente** qué lo rompió.

## 🚫 Regla de git (acordada 2026-10-08)

> **Todo el trabajo es LOCAL. No se hace `git push` nunca sin que el usuario lo pida
> explícitamente.**

- El remoto `origin/main` se queda donde está hasta que el usuario decida subir.
- Los commits locales son opcionales: sirven como punto de retorno, pero no se crean
  sin avisar.
- Claude **no** commitea ni pushea por iniciativa propia. Si un paso queda verificado,
  lo informa y espera.
- Si el usuario pide volver atrás: `git checkout -- <archivo>` para un cambio sin
  commitear, o `git reset --soft HEAD~1` para deshacer un commit local sin perder nada.

---

## Ciclo de cada paso

```
1. Claude lee los .md relevantes        → confirma destino y nivel de riesgo
2. Claude verifica el estado previo     → git status limpio, tsc sin errores
3. Claude hace UN cambio
4. Claude verifica técnicamente         → pnpm run typecheck (y build si aplica)
5. Claude indica QUÉ PROBAR             → lista concreta y corta
6. El usuario prueba manualmente        → confirma OK o reporta el problema
7. Se marca el checkbox en el .md       → siguiente paso
```

El commit es **opcional y a pedido** del usuario (ver regla de git abajo). El avance se
registra en la bitácora de este documento, no en el historial de git.

**Si el paso 6 falla:** se revierte ese cambio (`git checkout -- <archivo>` o
`git revert`), no se intenta parchear sobre la marcha.

---

## Orden de dificultad (de lo más fácil a lo más difícil)

| Nivel | Tipo de cambio | ¿Requiere prueba manual? |
|---|---|---|
| **N1** | Borrar archivos/exports con 0 referencias | No — `tsc` lo prueba |
| **N2** | Herramientas (ESLint, Prettier, scripts) | No — no toca runtime |
| **N3** | Quitar dependencias y fuentes sin usar | Sí — revisión visual |
| **N4** | Extraer helpers puros (`formatBs`, breakpoints) | Sí — revisión visual |
| **N5** | Mover archivos de carpeta | Sí — navegación general |
| **N6** | Unificar lógica duplicada (pago, carrito) | Sí — **compra real de prueba** |

Nunca saltar a un nivel superior si quedan pasos pendientes en uno inferior.

---

## Qué verifica Claude en cada cambio

```bash
pnpm run typecheck          # obligatorio siempre, debe dar 0 errores
git status --short        # confirmar que solo cambió lo esperado
git diff                  # revisar el cambio antes de pedir la prueba
```

`tsc` está **limpio** en el commit base `d0f607e`. Cualquier error nuevo significa que
el cambio tocó algo vivo.

`pnpm run lint` **ya funciona** desde el paso 7. Reporta 118 problemas preexistentes
(ver [lint-hallazgos.md](./lint-hallazgos.md)), así que todavía no sirve como gate: lo
útil es comparar que el número **no suba** después de un cambio.

---

## Antes de tocar cualquier archivo

Consultar en este orden:

1. [funcionalidades.md](./funcionalidades.md) — ¿qué nivel de riesgo tiene?
   🔴 crítico → no se toca hasta el final, y con compra de prueba
2. [codigo-muerto.md](./codigo-muerto.md) — ¿está en el Grupo A (borrable) o en el
   Grupo B (vivo internamente, solo quitar `export`)?
3. [componentes-checkout.md](./componentes-checkout.md) — si es del checkout
4. [arquitectura-objetivo.md](./arquitectura-objetivo.md) — ¿a dónde va?

---

## Bitácora de avance

Se registra cada paso completado **y verificado por el usuario**.

| # | Nivel | Cambio | `tsc` | Build | Probado |
|---|---|---|---|---|---|
| 1 | N1 | Borrar `OrderStatusDisplay.tsx` | ✅ | ✅ | ✅ |
| 2 | N1 | Borrar `utils/shippingReprice.ts` | ✅ | — | ✅ |
| 3 | N1 | Borrar `store/adSlice.ts` + quitar de `store.ts` | ✅ | ✅ | ✅ |
| 4 | N1 | Borrar `store/cartSlice.ts` + quitar de `store.ts` | ✅ | ✅ | ✅ |
| 5 | N1 | Borrar los 10 exports restantes del Grupo A | ✅ | ✅ | ✅ |
| 6 | N1 | Grupo B: 7 privatizados + 5 borrados (archivo por archivo) | ✅ | ✅ | ✅ |
| 7 | N2 | Arreglar ESLint (config plana) + script `lint` | ✅ | ✅ | n/a |
| 8 | 🔴 | Arreglar hooks condicionales en `QRPaymentModal` | ✅ | ✅ | ✅ |
| 9 | N2 | Agregar script `typecheck` | ✅ | n/a | n/a |
| 10 | N2 | Unificar en pnpm: borrar `package-lock.json` + `nixpacks.toml` | ✅ | ✅ | ⚠️ **falta deploy** |
| 11 | N3 | Quitar `console.log('isProduction')` de `layout.tsx` | ✅ | ✅ | ✅ |
| 12 | N3 | Borrar `tailwind.config.js` | ✅ | ✅ | ✅ |
| 13 | N3 | Quitar dependencia `autoprefixer` | ✅ | ✅ | ✅ |
| 14 | N3 | Limpiar `globals.css` (preflight duplicado + vars muertas) | ✅ | ✅ | ✅ |
| 15 | N3 | Quitar `@fontsource/poppins` (nunca aplicada) | ✅ | ✅ | ✅ |
| 16 | N3 | Quitar `Geist` / `Geist_Mono` de `layout.tsx` | ✅ | ✅ | ✅ |
| 17 | N4 | `shared/lib/formatCurrency.ts` + migrar 29 sitios en 15 archivos | ✅ | ✅ | ✅ |
| 18 | N1 | Borrar el `switch` muerto de `DeliveryMethodDisplay` (el `27.99 €`) | ✅ | ✅ | ✅ |
| 19 | N4 | `shared/lib/breakpoints.ts` + nombrar los 7 `innerWidth < 1024` | ✅ | ✅ | ✅ |
| 20 | N2 | Prettier: config + scripts (**sin** reformatear) | ✅ | n/a | n/a |

**Leyenda:** ✅ ok · ⏳ pendiente · ❌ falló y se revirtió · n/a no aplica

> Pasos 1-6 probados y aprobados por el usuario el 2026-10-08. Verificado en runtime:
> home, catálogo, carrito con persistencia tras recarga (F5), búsqueda, navegación,
> detección de tarjeta, cotización FedEx y facturación.
>
> El paso 7 no toca runtime (solo config de tooling), por eso no requiere prueba manual.

**Total del nivel N1 (COMPLETO):** 4 archivos borrados, **585 líneas eliminadas**,
17 archivos tocados. `tsc` ✅ y `pnpm run build` ✅ (22 rutas) después de cada paso.

### Lección aprendida en el paso 6

El paso 6 se ejecutó archivo por archivo con verificación intermedia, y eso destapó
**dos errores de clasificación** que un cambio en bloque habría enterrado:

- El escaneo original nunca revisó `export type` → los tipos `PaymentMethod` y
  `OrderStatus` estaban muertos sin que figurara en ningún inventario.
- "Referenciado internamente" **no** equivale a "vivo": `PAYMENT_METHOD` solo lo usaba
  un tipo muerto, y `getGuestOrderKey`/`removeGuestOrderAccess` solo aparecían dentro
  de un `export default` que nadie importa.

> **Regla nueva:** antes de clasificar un símbolo como vivo, seguir la cadena de
> referencias hasta algo que el runtime realmente ejecute. Una referencia circular
> entre dos símbolos muertos parece uso real en un `grep`.

**Efectos secundarios positivos confirmados:**
- Paso 2 → ya **no queda ningún token embebido en URLs** en todo el proyecto
  (`grep -rnE '/\$\{[a-zA-Z]*[Tt]oken\}' src` sin resultados). La migración al contrato
  de body quedó completa.
- Paso 4 → resuelta la **colisión de nombres** `addToCart` / `removeFromCart`. Ahora
  existe una sola definición, en `utils/cartStorage.ts`. Ya no es posible autoimportar
  la equivocada.
- El store pasó de **5 reducers a 3** (`client`, `clothing`, `checkout`).

**Línea base establecida el 2026-10-08:** en el commit `d0f607e`, `pnpm run typecheck`
da 0 errores y `pnpm run build` compila las 22 rutas correctamente. Ese es el estado al
que hay que volver si algo falla.

> Advertencia preexistente del build (no la causó ningún paso del refactor):
> `Bugsnag.getPlugin() was called before Bugsnag.start()`. Anotada para revisar más
> adelante, no bloquea.

### ⚠️ Paso 10: el único cambio que toca el deploy

**Qué se encontró.** Había dos lockfiles y apuntaban a versiones distintas. `node_modules`
estaba instalado con **pnpm**, el `pnpm-lock.yaml` se actualizó en 2026-08, pero
`nixpacks.toml` corría `npm ci`, que lee el `package-lock.json` **de 2026-03**.
O sea: producción venía corriendo dependencias distintas de las de desarrollo.

| Paquete | Deploy (`npm ci`) | Local (pnpm) |
|---|---|---|
| next | 16.1.6 | **16.3.3** |
| tailwindcss | 4.1.11 | **4.3.3** |
| typescript | 5.8.3 | **5.9.3** |
| framer-motion | 12.23.7 | **12.43.0** |
| eslint-config-next | 16.0.10 | **16.3.3** |

**Qué se hizo** (decisión del usuario: unificar en pnpm, para que el deploy corra lo
mismo que se prueba en local):

- Borrado `package-lock.json`
- `packageManager: "pnpm@10.17.0"` en `package.json`
- `engines.npm` → `engines.pnpm`
- `nixpacks.toml`: `npm ci` → `pnpm install --frozen-lockfile`, con `pnpm` agregado a
  `nixPkgs`

**Verificado localmente:** `pnpm install --frozen-lockfile` ✅ · `pnpm run typecheck` ✅ ·
`pnpm run build` ✅ (22 rutas) · Next resuelve a **16.3.3** en dev (antes el deploy usaba
16.1.6, prueba de que la unificación tuvo efecto).

### ⚠️ Lo que NO se pudo verificar desde local

El entorno de build vive en el VPS (Dokploy sobre Hostinger), así que estas dos cosas
solo se confirman con un deploy real:

**1. Que el paquete `pnpm` exista en el nixpkgs que usa Nixpacks.** Es la línea de la que
menos certeza hay. Si falla, el log del build lo dice en la fase de *setup* con algo como
`undefined variable 'pnpm'`.

- *Fallback A:* quitar `[phases.setup]` y `[phases.install]` del `nixpacks.toml` por
  completo. Nixpacks detecta `pnpm-lock.yaml` solo y provisiona la versión de pnpm que
  le corresponda — es el camino para el que está diseñado, y evita adivinar nombres de
  paquetes de Nix.
- *Fallback B:* `nixPkgs = ["nodejs_20", "nodePackages.pnpm"]` (nombre antiguo del
  atributo).

**2. Que la versión de pnpm del VPS sea compatible con `packageManager`.** El lockfile es
`lockfileVersion: '9.0'`, que leen pnpm 9 y 10. Si el nixpkgs trae pnpm 9 y
`packageManager` pide 10.17.0, puede aparecer un warning. Si molesta, se quita el campo
`packageManager` — el lockfile por sí solo ya fija las versiones de las dependencias.

**Qué mirar en el log de Dokploy para confirmar que salió bien:**

```
Lockfile is up to date, resolution step is skipped
Done in Xs using pnpm v10.x
```

**Un intento descartado:** la primera versión usaba `corepack enable`. Se descartó porque
corepack escribe shims en el directorio de Node, que en Nix está en `/nix/store` y es de
**solo lectura** → falla con `EROFS`.

> 🚨 **Importante: los dos cambios están acoplados.** No se puede revertir solo el
> `nixpacks.toml`, porque `package-lock.json` ya no existe y `npm ci` lo necesita. Para
> volver al estado original hay que revertir ambos:
> ```
> git checkout -- nixpacks.toml package.json
> git checkout HEAD -- package-lock.json
> ```

> **Nota sobre el Build Type de Dokploy:** que el código se jale de GitHub no evita el
> paso de build — Dokploy igual compila en el VPS. Si el Build Type de la app está en
> **Nixpacks** (el default), este archivo se usa. Si estuviera en Dockerfile, se ignora
> (y el repo no tiene Dockerfile, así que no es el caso).

### Hallazgos del nivel N3

**`ring-primary` nunca funcionó.** `SearchNavBarDialog.tsx:343` usa
`focus:ring-2 focus:ring-primary` en el input de búsqueda. Verificado contra el CSS de
producción: `ring-2` **sí** se genera, `ring-primary` **no**. El color `primary` solo
estaba declarado en `tailwind.config.js`, que Tailwind v4 ignoraba — y `theme.css` lo
define en un `:root` plano en vez de un bloque `@theme`, que es lo que v4 necesita para
registrar un color.

> Resultado: el buscador tiene focus ring, pero con el **color por defecto de Tailwind**
> en lugar del verde de marca (`#16302b`). Es un bug cosmético **preexistente** — borrar
> el config no lo causó. Para arreglarlo hay que mover los colores a un bloque `@theme`
> en `theme.css`. Pendiente, no urgente.

**El preflight duplicado era redundancia real, no un conflicto de cascada.** Quitarlo
bajó el CSS compilado de **88.937 a 85.132 bytes** (−3.8 KB) y los resets
`box-sizing:border-box` de 13 a 11. Se verificó que el CSS compilado **no contiene
`@layer`** (Turbopack los aplana), y que entre los dos imports solo había variables CSS
de `theme.css`, que preflight no toca. Por eso no debería haber cambio visual.

**Resultado de las fuentes (pasos 15-16).** Se pasó de **4 familias cargadas / 1 usada**
a **1 cargada / 1 usada**:

| Fuente | Antes | Ahora |
|---|---|---|
| `@fontsource/poppins` | cargada, nunca aplicada | ❌ desinstalada |
| `Geist` + `Geist_Mono` | cargadas, vars en `<body>` nunca usadas en CSS | ❌ quitadas de `layout.tsx` |
| `@fontsource/space-grotesk` | cargada, usada en `.navbar-font` | ✅ se mantiene |

El `<body>` quedó con `className="antialiased"` (se conservó el suavizado). Verificado:
el build ya no empaqueta ningún archivo de Geist ni Poppins, y quedan 6 archivos de
fuente (84 KB) correspondientes a Space Grotesk.

> **Optimización pendiente, no urgente:** `import '@fontsource/space-grotesk'` sin
> subruta carga *todos* los pesos. Si solo se usan 1-2, conviene
> `import '@fontsource/space-grotesk/400.css'` (y el peso que haga falta).

> **Nota:** el `body` sigue renderizando en **Arial** (`globals.css` línea 5). Quitar
> estas fuentes no cambió eso — nunca se aplicaban. Si se quiere una tipografía de marca
> en el texto general, es una decisión de diseño aparte.

### Paso 17: dos formatos de moneda, no uno

El inventario original decía "37 ocurrencias de `'Bs.'`" como si fuera un solo patrón.
Al revisarlas una por una, resultaron ser **dos formatos distintos**:

| Grupo | Formato | Dónde |
|---|---|---|
| Catálogo | `Bs. 469` (sin decimales) | `ProductPage*`, `OutfitPage*`, `GalleryItem`, `BasketConfirmation` |
| Checkout | `Bs. 469.00` (2 decimales) | `OrderTotalDisplay`, `OrderItemsList`, `DesktopCartSummary`, `AccessoriesSlider` |

El split tiene sentido: `calculatePrice` ya redondea a entero, así que el catálogo no
tiene centavos que mostrar; el checkout sí los necesita porque los montos de FedEx
vienen con decimales reales.

**Decisión del usuario: preservar ambos exactamente.** El helper recibe los decimales
como parámetro opcional, así que el refactor es puro — **cero cambio visual**.

> ⚠️ **Detalle que importa:** para el grupo sin decimales **no** se puede usar
> `toFixed(0)`. Hoy `Bs. {469.5}` renderiza `Bs. 469.5`, y `toFixed(0)` daría
> `Bs. 470`. Por eso el helper interpola el valor tal cual cuando se omite `decimals`.

**Migrado:** 29 llamadas en 15 archivos. `tsc` ✅ · build ✅ · lint **116 → 116**
(sin problemas nuevos).

**Deliberadamente NO migrado:**

- `OrderConfirmationModal.tsx:581` — el monto está dentro de un IIFE anidado, y ese
  archivo **se reescribe en la Fase 2b** (es uno de los dos del pago duplicado). Pulirlo
  ahora es trabajo que se tira.
- Los precios literales `'Bs. 30'`, `'Bs. 50'`, `'Bs. 60'` — no son formato, son una
  **tabla de precios hardcodeada y duplicada** en `DeliveryMethodDisplay` y
  `DeliveryOptionsSection`. Convertirlos a `formatBs(50)` sería cosmético y no arregla
  el problema real. Ver el hallazgo de abajo.

### 🐛 Hallazgo del paso 17 — **CORREGIDO 2026-10-12**

> ⚠️ **La versión original de este hallazgo era incorrecta.** Decía que si la API
> fallaba, el usuario vería `Bs. 30` en el selector y `27.99 €` en el resumen. Al
> trazar los call sites con el compilador, resultó que **el `27.99 €` es inalcanzable**.
> Fue una inferencia mía sin verificar. Esto es lo que realmente pasa.

Hay dos listas de precios de envío nacional hardcodeadas, y **solo una es alcanzable**.

**1. `DeliveryOptionsSection` — ALCANZABLE ✅**

```ts
const deliveryOptions = isBolivia && shipments.length > 0
  ? shipments.map(...)                 // datos reales de la API
  : isBolivia ? [ 'Bs. 30', 'Bs. 50', 'Bs. 50', 'Bs. 60' ]   // ← fallback
```

El checkout lo llama con `shipments={selectedPlace?.shipments || []}`. Si
`selectedPlace` es `null` (el usuario todavía no eligió departamento, o `GET places`
falló), `shipments` queda en `[]` y **se muestra la lista hardcodeada**.

**2. `DeliveryMethodDisplay` — INALCANZABLE ❌**

```ts
const getPriceDisplay = () => {
  if (price !== undefined) return formatBs(price, 2);   // ← siempre entra acá
  switch (deliveryMethod) {
    case 'Envío a terminal': return '27.99 €';          // ← código muerto
    ...
```

**Prueba con el compilador:** se cambió `price?: number` a `price: number` y
`pnpm run typecheck` pasó sin errores. Si algún call site omitiera `price`, `tsc` habría
fallado. Los 3 sitios lo pasan siempre:

| Call site | Qué pasa | ¿Puede ser `undefined`? |
|---|---|---|
| `OrderReviewSection:143` | `finalDeliveryCost` = `deliveryCostFromRedux \|\| deliveryCost`, y `deliveryCost = 0` por defecto | No, mínimo `0` |
| `order-confirmed:450` | `orderData.deliveryCost`, tipado `number` | No |
| `order-confirmed:653` | `orderData.deliveryCost`, tipado `number` | No |

**Conclusión:** el `27.99 €` **nunca aparece en pantalla**. La contradicción entre las
dos listas no puede manifestarse: el selector puede mostrar el fallback, pero el resumen
siempre muestra el `price` real formateado.

**Qué queda por hacer:**

- [x] **Hecho (paso 18).** Borrado el `switch` completo de `getPriceDisplay()` y
      `price` pasó a obligatorio (`price: number`). La función desapareció: el JSX ahora
      llama `{formatBs(price, 2)}` directo. **-23 líneas.** Ya no queda ninguna
      referencia a `€` en todo `src/`.
      > El `else` con el mensaje *"Costo calculado por FedEx..."* **también** estaba en
      > la rama muerta, así que se fue con el resto. Para envíos internacionales el
      > resumen siempre mostró el monto real (`selectedFedexService.amountBOB`), nunca
      > ese texto.
- [ ] Decidir si la lista de fallback de `DeliveryOptionsSection` debe existir. Hoy
      muestra precios que podrían estar desactualizados respecto a la tabla real del
      backend, y **sí se ve** cuando `places` no cargó.
      > **Cómo reproducirlo:** DevTools → Network → bloquear
      > `api.moneroget.com/api/places` → recargar el checkout con Bolivia elegida.

> **Lección de método:** al reportar un hallazgo, distinguir entre "este código está
> mal escrito" y "el usuario ve algo mal". Lo primero se prueba leyendo el archivo; lo
> segundo exige trazar quién lo llama y con qué. Yo reporté lo segundo habiendo
> verificado solo lo primero.

### Paso 19 — **el diagnóstico original estaba equivocado**

> ⚠️ El [diagnóstico](./diagnostico.md) punto ⑬ decía: *"dos definiciones distintas de
> 'mobile' conviviendo... entre 768px y 1024px el comportamiento es ambiguo"*, y el plan
> era **unificarlas**. Eso habría roto la UI.

**Lo que se encontró:** `checkout.css` tiene **3 media queries en `min-width: 1024px`**
(líneas 54, 101, 451). El `window.innerWidth < 1024` del JS está **emparejado a propósito
con el CSS**: el CSS cambia a layout desktop en 1024px, y el JS usa el mismo número para
decidir si muestra los pasos como modal o inline.

Si se hubiera unificado a 768, entre 768px y 1024px el JS habría mostrado los pasos
inline mientras el CSS seguía renderizando el layout mobile → **UI partida**.

**Conclusión:** no son dos definiciones en conflicto, son **dos breakpoints legítimos**
con propósitos distintos — igual que `md` (768) y `lg` (1024) de Tailwind:

| Valor | Para qué | Dónde |
|---|---|---|
| **768** | ¿Es un teléfono? Cambia componentes mobile/desktop | `useIsMobile`, 18 call sites |
| **1024** | ¿El checkout usa modales o pasos inline? | 7 chequeos imperativos + 3 media queries de `checkout.css` |

**Qué se hizo en su lugar:** nombrarlos, no unificarlos.

- `BREAKPOINTS.mobile` (768) → ahora es el default de `useIsMobile`
- `BREAKPOINTS.checkoutDesktop` (1024) + `isBelowCheckoutDesktop()` → reemplaza los
  7 `window.innerWidth < 1024` sueltos de `page.tsx`
- El acoplamiento con `checkout.css` quedó **documentado en el código**, para que nadie
  cambie un número sin el otro

Ya no queda ningún número mágico de breakpoint en TS/TSX. **Cero cambio de
comportamiento.** `tsc` ✅ · build ✅ · lint 116 → 116.

> Los 7 chequeos están dentro de *event handlers*, donde no se puede llamar un hook.
> Por eso `isBelowCheckoutDesktop()` es una función común y no un hook.

**Pendiente real (distinto del que creía):** `useIsMobile` devuelve `false` en SSR y en
el primer render del cliente, así que el móvil pinta el layout desktop un frame antes de
corregirse. Eso **sí** es un problema, en 18 call sites, y se resuelve con CSS
(`md:`/`lg:`) en vez de JS — no tocando los valores de los breakpoints.

### Paso 20: Prettier — por qué NO se reformateó todo

Se instaló `prettier@3.9.10`, se creó `.prettierrc.json` y se agregaron los scripts
`format` y `format:check`. **No se corrió `--write` sobre el repo.** El motivo salió de
medir antes de actuar:

| Config | Archivos que Prettier cambiaría |
|---|---|
| Default (`endOfLine: "lf"`) | **162** de 179 |
| Con `endOfLine: "auto"` | **37** de 179 |

Los primeros 162 eran **puro ruido de finales de línea**: el working tree está en CRLF
(Windows) y Prettier por defecto fuerza LF. El contenido de las líneas era idéntico.
Con `endOfLine: "auto"` Prettier respeta lo que ya tiene el archivo y git sigue
normalizando al commitear.

Los 37 restantes son diferencias reales, y son **solo comas finales**
(`trailingComma: "all"`, default de Prettier 3). Ejemplo:

```diff
-        typeof window !== 'undefined' && window.innerWidth < breakpoint
+        typeof window !== 'undefined' && window.innerWidth < breakpoint,
```

Cosmético y de riesgo cero, pero **sumar 37 archivos de reformateo al changeset actual
(ya de ~40 archivos) lo volvería imposible de revisar**. Por eso queda como paso
independiente:

- [ ] Correr `pnpm run format` como **cambio aislado**, idealmente con el trabajo actual
      ya commiteado, para que el diff sea "solo formato" y se pueda aprobar de un vistazo.

> Mientras tanto el editor ya respeta la config, así que los archivos que se vayan
> tocando salen bien formateados y la deuda no crece.

**Deriva pendiente, no resuelta:** `nixpacks.toml` usa `nodejs_20` pero local corre
**Node 22.22.3**. Ambos cumplen `engines` (>=20.9.0), así que se dejó como está para no
ampliar el alcance. Anotado como riesgo abierto.

---

## Secuencia acordada

Los primeros pasos, en orden. Cada uno se cierra antes de abrir el siguiente.

### N1 — Borrados sin riesgo (`tsc` es la única prueba necesaria)
1. [x] Borrar `src/app/w/checkout/OrderStatusDisplay.tsx`
2. [x] Borrar `src/utils/shippingReprice.ts`
3. [x] Borrar `src/store/adSlice.ts` + quitarlo de `store.ts`
4. [x] Borrar `src/store/cartSlice.ts` + quitarlo de `store.ts`
5. [x] Borrar los 13 exports del Grupo A de [codigo-muerto.md](./codigo-muerto.md#grupo-a--muertos-de-verdad-borrar-13)
6. [x] Grupo B → resultó ser **7 privatizados + 5 borrados**, no 10 privatizados
      (ver la [segunda corrección](./codigo-muerto.md#grupo-b--vivos-internamente--completado-2026-10-08))

### N2 — Herramientas (no toca runtime)
7. [x] Arreglar `eslint.config.mjs` (crasheaba) + `lint` script → ver [lint-hallazgos.md](./lint-hallazgos.md)

### Fuera de nivel — bug real destapado por el linter
8. [x] 🔴 Arreglar hooks condicionales en `QRPaymentModal.tsx` (bloqueaba la Fase 2)

### N2 (continuación)
9. [x] Agregar script `typecheck` a `package.json`
10. [x] Resolver el doble lockfile → **se eligió pnpm** (ver abajo)
11. [x] Agregar Prettier → config + scripts (ver nota del paso 20)

### N3 — Peso muerto (revisión visual)  ✅ COMPLETO
11. [x] Quitar `@fontsource/poppins` (nunca aplicada)
12. [x] Quitar `Geist` / `Geist_Mono` de `layout.tsx`
13. [x] Quitar `autoprefixer`
14. [x] Borrar `tailwind.config.js`
15. [x] Limpiar `globals.css` (preflight duplicado + vars muertas)
16. [x] Quitar `console.log` del layout raíz

### N4 — Helpers compartidos
17. [x] `shared/lib/formatCurrency.ts` + migrar 29 sitios (ver nota abajo)
19. [x] `shared/lib/breakpoints.ts` → se **nombraron**, no se unificaron (ver abajo)

### N5 y N6
Recién después. Ver [plan-refactor.md](./plan-refactor.md).

> **Importante:** el paso 2 (borrar `shippingReprice.ts`) elimina el último lugar que
> mandaba el token por URL. Ya está confirmado como muerto — no hay que migrarlo.
