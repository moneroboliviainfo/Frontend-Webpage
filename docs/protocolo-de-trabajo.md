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
| 21 | 2a | `OrderProgressIndicator` usa `ORDER_STATUS` en vez de literales | ✅ | ✅ | ✅ |
| 22 | 1a | Crear `shared/api/client.ts` (nadie lo importa aún) | ✅ | ✅ | n/a |
| 23 | 1b | Migrar al cliente los 5 sitios con auth | ✅ | ✅ | 🚫 **no verificable** |
| 24 | 4 | Sitemap: `baseUrl` al host `www` + `SITE_URL` compartido | ✅ | ✅ | ✅ |
| 25 | 4 | `metadataBase` + `openGraph.url` al host `www` | ✅ | ✅ | ✅ |
| 26 | 4 | Producto: wrapper servidor + `generateMetadata` | ✅ | ✅ | ✅ |
| 27 | 4 | Sitemap dinámico: 8 → **135** URLs (119 productos) | ✅ | ✅ | ✅ |
| 28 | 4 | JSON-LD `Product` con precio y disponibilidad | ✅ | ✅ | ✅ |
| 29 | 4 | Canonical en `policies`/`privacy` (contenido duplicado) | ✅ | ✅ | ✅ |
| 30 | 4 | Sitemap: se evaluó filtrar por `WOMEN_ENABLED` → **revertido a pedido** | ✅ | ✅ | ✅ |
| 31 | 4 | `robots.txt` → `app/robots.ts` con `SITE_URL` | ✅ | ✅ | ✅ |

**Leyenda:** ✅ ok · ⏳ pendiente · ❌ falló y se revirtió · n/a no aplica ·
🚫 no verificable en el entorno actual

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

### Fase 2a: un ítem cancelado y un hallazgo mayor

**❌ CANCELADO: "borrar los 97 bloques JSX comentados".** El ítem partía de una premisa
falsa mía. Conté `grep -c '{/*'` y asumí que eran código comentado **sin leerlos**. Al
imprimir los 97, resultaron ser **etiquetas descriptivas de una línea**, cero multilínea,
cero con código:

```jsx
{/* Loading Screen */}
{/* Step 1: Detalles del destinatario */}
{/* Desktop QR Payment Modal */}
```

En un archivo de 3077 líneas son la **única estructura de navegación que existe**.
Borrarlas lo empeoraría. **No se toca.**

### 🔴 Hallazgo: el formulario también está duplicado, no solo el pago

Al listar las etiquetas quedó a la vista el mapa real del archivo:

| Sección | Desde | Líneas |
|---|---|---|
| Desktop Layout | L1421 | 795 |
| Mobile Layout | L2216 | 548 |
| Modals (compartidos) | L2764 | 313 |

Y **11 secciones del formulario están escritas dos veces**, una por layout:

| Sección | Desktop | Mobile |
|---|---|---|
| Recipient Details Section | L1525 | L2265 |
| Name Input | L1530 | L2269 |
| Email Input | L1548 | L2285 |
| Phone Number Input with Country Code | L1572 | L2305 |
| Country Selection | L1636 | L2364 |
| Address Selection Dropdown | L1613 | L2343 |
| City/Province for Bolivia | L1717 | L2438 |
| Detailed Address for Bolivia | L1744 | L2463 |
| City for Other Countries | L1831 | L2551 |
| State/Province for Other Countries | L1858 | L2599 |
| Continue Button | L2009 | L2725 |

**Son ~1.343 líneas = 44% del archivo: el mismo formulario, dos veces.**

> ⚠️ **Esto amplía el alcance de la Fase 2b.** No es solo deduplicar el pago
> (`handleConfirmOrder` vs `handlePayOrder`, 95 líneas cada uno): es deduplicar **el
> formulario completo**. Y explica de verdad los 44 `useState` — muchos alimentan dos
> árboles de inputs distintos.
>
> También refuerza por qué el breakpoint de 1024 no se podía tocar (paso 19): el CSS y
> el JS coordinan **cuál de los dos formularios se muestra**.

### Fase 1: alcance acotado respecto al plan original

El plan decía *"migrar los 48 `fetch`"*. Son **43** reales, y al revisarlos uno por uno
quedó claro que no todos valen lo mismo. Se migraron **5**, no 43:

**Migrados (donde estaba la duplicación que dolía):**

| Archivo | Qué era | Ahora |
|---|---|---|
| `hooks/useAuthInit.ts` | `fetch` + header + `if (ok)/else` | `apiFetch(..., { auth: true })` |
| `services/sessionService.ts` | `fetch` + header + `if (!ok)` | `apiFetch(..., { token })` |
| `utils/addressService.ts` | 27 líneas | 9 líneas |
| `utils/shippingRates.ts` 🟠 | 29 líneas | 12 líneas |
| `utils/orderService.ts` 🔴 | 2 bloques de header + error | 2 llamadas de 6 líneas |

**Resultado:** de 9 `Bearer` a 1 (el del cliente) + 3 que quedan a propósito.
**-131 líneas, +63.**

**NO migrados, con motivo:**

- **`store/clientSlice.ts`** (2 `Bearer`) — sus thunks `getClient`/`updateClient` están
  **muertos** (Grupo C: nunca se despachan, apuntan a `/api/client` que no existe) y se
  borran en la Fase 3. Migrar código muerto es churn.
- **`app/w/checkout/order-confirmed/page.tsx`** (1 `Bearer`) — su respuesta se usa
  **sin tipo** en 18 campos, y el tipo de la respuesta de la API no existe (solo el
  transformado). Además lanza un mensaje en español que **se le muestra al usuario**
  (`setError(error.message)` → línea 257); con el cliente vería el mensaje del servidor.
  Migrarlo exige un ejercicio de tipado que no corresponde a un paso de auth.
- **Los 3 que tratan el error como valor** — `repriceCart` (parsea el cuerpo del error
  para detectar stock agotado 🔴), `advertisementService` (devuelve `null`),
  `QRPaymentModal` (loguea y sigue el polling). Un cliente que lanza los obligaría a
  `try/catch` y cambiaría el flujo de control de código crítico. **Documentado dentro
  del propio `client.ts`** para que nadie los "unifique" sin entender.
- **~30 `GET` triviales** — `fetch(\`${API_URL}places\`)` y similares. Migrarlos agrega
  un import y no ahorra nada.

### Decisión de diseño: `errorMessage` es un prefijo, no un reemplazo

Al migrar `addressService` noté que su error **llega al usuario**
(`setErrorMessage(error.message)` en el checkout). El patrón original era
`errorData.message || \`Failed to create address: ${statusText}\``, y 4 de los 5 sitios
usan esa misma forma `"prefijo: statusText"`.

Si `errorMessage` hubiera sido un reemplazo simple, se habría perdido el `statusText`.
Se cambió el cliente para que componga `"<errorMessage>: <statusText>"`, reproduciendo
el mensaje **exacto** de antes. Cero diferencias visibles.

> También: el cliente resuelve `data.message || data.error`, cubriendo los dos estilos
> que existían (4 sitios usaban `.message`, `cybersourceService` usa `.error`).

### 🚨 BLOQUEANTE: no hay entorno de desarrollo real

*Descubierto el 2026-10-13, al intentar verificar el paso 23.*

**`pnpm run dev` habla con la API de PRODUCCIÓN.**

```
dev: copy env.qa.ts → env.ts && next dev
env.ts  ==  env.qa.ts  ==  env.prod.ts  →  https://api.moneroget.com/api/
```

Los tres archivos de env son idénticos: **no existe entorno de QA**, `env.qa.ts` es
decorativo. Esto convierte el punto ⑭ del diagnóstico (que parecía cosmético) en un
bloqueante serio.

**Consecuencia 1 — riesgo de datos.** Cualquier prueba local escribe en producción:

| Acción | Qué crea | Riesgo |
|---|---|---|
| `createAddress` | fila de dirección en la cuenta propia | Bajo, reversible |
| `getFedexRates` | nada, solo consulta | Nulo |
| `createOrder` | **orden real** | 🔴 Alto |
| `generateQR` | **QR de pago real** | 🔴 Alto |

**Consecuencia 2 — el login no funciona en local.** El frontend manda bien el callback
(`generateCallbackUrl()` usa `window.location.origin` → `http://localhost:3000/auth/callback`),
pero el backend de producción **ignora ese parámetro** y redirige al dominio productivo.
El token queda en el `localStorage` de producción, no de localhost.

Por eso **todo lo que está detrás del login es inalcanzable en local**: checkout,
direcciones, órdenes, QR. El paso 23 migró justamente esos flujos, así que queda
verificado por `tsc` y build, pero **sin prueba de runtime**.

**Opciones para desbloquear** (en orden de costo):

1. **Whitelist de `http://localhost:3000/auth/callback` en el backend.** Lo más barato y
   desbloquea todo el desarrollo local.
2. **Backend de QA con su propia base**, y que `env.qa.ts` apunte ahí de verdad.
3. **Segunda app en Dokploy** (`staging.moneroget.com`) contra ese backend de QA.

> Hasta que exista alguna, los pasos que toquen flujos autenticados sólo se pueden
> validar con `tsc` + build, y la prueba real queda para después del deploy.
> **Marcarlos 🚫, no ✅.**

### Fase 4 (SEO de producto): pasos 24-26

**Verificado contra el HTML realmente servido** (`pnpm run build && pnpm run start` +
`curl`), no solo con `tsc`. Esta fase sí se puede validar sin login — es la ventaja de
haberla elegido mientras el entorno de desarrollo sigue bloqueado.

**Paso 24 — sitemap.** `baseUrl` era `https://moneroget.com`, que `next.config.ts`
redirige con **301** al host `www`. O sea: las 8 URLs del sitemap eran redirects. Además
no coincidía con el JSON-LD del layout, que ya usaba `www`. Se centralizó en
`SITE_URL` (exportado desde `config/metadata.ts`) para que no vuelvan a divergir.

**Paso 25 — `metadataBase`.** No estaba definido. Era la causa del warning que aparecía
en `dev`:

```
⚠ metadataBase property in metadata export is not set for resolving social open
  graph or twitter images, using "http://localhost:3000"
```

Sin él, las rutas relativas de imágenes OG se resolvían contra localhost y las
previsualizaciones en redes se rompían en producción.

**Paso 26 — la página de producto ya es indexable.**

Se dividió en dos, con `git mv` para preservar el historial:

| Archivo | Rol |
|---|---|
| `page.tsx` (nuevo, servidor) | `generateMetadata` + renderiza al cliente |
| `ProductPageClient.tsx` (el de antes) | toda la lógica interactiva, intacta |

> **Por qué así y no una conversión completa a server component:** el cliente sigue
> haciendo su propio fetch, así que **el comportamiento para el usuario no cambia en
> nada**. El servidor solo agrega el `<head>`. Mover también los datos al servidor
> (y eliminar el estado de carga) es una mejora posterior, no un requisito del SEO.

El id sale del slug (`/w/camisa-azul-123` → `123`) con `match(/-(\d+)$/)`, igual que ya
hacía el cliente.

**Resultado medido en el HTML servido:**

```html
<title>Pantalón MONERO Mom Jeans | MoneroGet</title>
<meta name="description" content="Mom jeans confeccionado en 100% algodón...">
<link rel="canonical" href="https://www.moneroget.com/w/pantal-n-monero-mom-jeans-66">
<meta property="og:image" content="https://api.moneroget.com/api/multimedia/upload/c7cb...webp">
```

Antes el `<head>` traía solo el metadata genérico del sitio para **todos** los productos.

**Detalles que valen:**

- Se usa `fetch(..., { next: { revalidate: 300 } })` — la primera vez que el proyecto
  aprovecha las extensiones de `fetch` de Next. Cachea 5 minutos para que los hits de
  crawlers no golpeen la API en cada request. Es exactamente el argumento de la
  [decisión contra axios](./arquitectura-objetivo.md#decisión-fetch-y-no-axios-2026-10-13).
- `alternates.canonical` y `openGraph.url` son **por producto**. Antes `og:url` apuntaba
  a la home para todas las fichas.
- Caminos de fallback probados: slug sin id → `200` con título "Producto"; id inexistente
  → `200`. No rompe.
- **Falso positivo descartado:** el HTML trae dos `<title>`, pero el segundo está dentro
  de un `<svg role="img">` como etiqueta de accesibilidad. Dentro del `<head>` hay
  exactamente uno.

### 🔴 Paso 27: Google no podía descubrir NINGÚN producto

Antes de hacer el sitemap dinámico verifiqué algo que cambia la urgencia de todo lo
anterior:

```
curl localhost:3000/men/clothes | grep 'href="/w/'   →  0 resultados
curl localhost:3000/men         | grep 'href="/w/'   →  0 resultados
```

**Cero enlaces a fichas de producto en el HTML servido.** Las galerías traen los
productos por `fetch` y renderizan los links en el navegador, así que un crawler no
tiene nada que seguir.

Combinado con que el sitemap tenía 8 URLs fijas y ningún producto, el resultado era:
**Google no tenía ningún canal para llegar a las 119 fichas.** El `generateMetadata` del
paso 26 solo sirve para URLs que Google ya conoce — y no conocía ninguna.

Por eso el sitemap dinámico no era un "nice to have": era **el único canal posible**.

**Resultado:** de **8 a 137 URLs** (119 productos + 18 rutas estáticas).

- La API pagina de 10 en 10 por defecto, pero acepta `?limit=`; se recorre con
  `hasNextPage` y un tope de seguridad de 20 páginas
- `revalidate: 3600` para no golpear la API en cada request del sitemap
- Si la API falla, se devuelven las rutas estáticas en vez de romper el sitemap entero
- Se agregaron 10 rutas estáticas que faltaban (`/men/clothes`, `/women/categories`,
  `/w/outfits/men`...). Se dejó fuera `/men/results` a propósito: son resultados de
  búsqueda, no deben indexarse
- **Validado:** 5 URLs de producto al azar del sitemap devuelven `200` con su título
  propio

### ⚠️ Hallazgo: hay 2 productos de prueba en el catálogo

El sitemap los mandaría a indexar:

| id | nombre |
|---|---|
| 169 | Producto de prueba |
| 174 | Producto de prueba 2 |

La API pública (`web-page/products`) los devuelve y ninguno viene con `enabled: false`,
así que entran al sitemap como cualquier otro.

> **No es un problema del código.** Hay que **deshabilitarlos o borrarlos desde el
> panel de administración** antes de enviar el sitemap a Google Search Console. Si no,
> vas a tener dos fichas "Producto de prueba" indexadas.

### Paso 28: JSON-LD `Product`

Lo que habilita que Google muestre **precio y disponibilidad** en el resultado, no solo
un link azul. Se emite desde el `page.tsx` servidor de la ficha.

El fetch se extrajo a `getProduct(slug)`, compartido por `generateMetadata` y la página.
Next deduplica fetches idénticos dentro de un request, así que **no golpea la API dos
veces** — otra vez el beneficio concreto de `fetch` sobre axios.

**Verificado en el HTML servido** (producto 66):

```json
"offers": {
  "priceCurrency": "BOB",
  "price": 429,
  "availability": "https://schema.org/InStock",
  "itemCondition": "https://schema.org/NewCondition"
}
```

- `price: 429` coincide con el `429.00` de la API, y pasa por el **mismo
  `calculatePrice`** que usa la UI. Si el dato estructurado no coincide con lo que
  muestra la página, Google lo penaliza
- `availability` se calcula sumando `availableStock` de todas las variantes
- **Probado el caso negativo:** el producto 174 tiene stock 0 y emite `OutOfStock`
  correctamente. No se verificó solo el camino feliz

### Paso 29: contenido duplicado entre `/men` y `/women`

Al revisar canonicals apareció que **solo la ficha de producto tenía uno** — ninguna otra
página del sitio emitía `<link rel="canonical">`.

Y hay duplicación real. Comparando el **texto visible** (no el HTML, que difiere por el
`data-gender` y los links del navbar):

| Ruta | `/men` vs `/women` |
|---|---|
| `/policies` | **texto byte-idéntico** (3.613 chars) |
| `/privacy` | **texto byte-idéntico** (4.831 chars) |
| `/about_us` | **texto byte-idéntico** (1.252 chars) |
| `/information` | **texto byte-idéntico** (4.871 chars) |

El mismo texto legal servido en dos URLs. Sin canonical, Google elige una por su cuenta
y reparte las señales entre ambas.

**Hecho:** `policies` y `privacy` usan `metadata` estático, así que alcanzó con agregar
`alternates: { canonical: '/men/...' }`. Ahora `/women/policies` declara
`/men/policies` como canónica. Verificado en el HTML servido.

**Corrección al paso 27:** había metido `/men/about_us` y `/men/information` en el
sitemap. Los **saqué**: son client components **sin metadata**, así que se enviarían a
indexar con el título genérico del sitio. El sitemap quedó en **135** URLs.

### Paso 30: la sección mujer en el sitemap — decisión del usuario

Al revisar el sitemap apareció que incluía 6 URLs de la sección mujer y 3 productos de
mujer, mientras `FEATURE_FLAGS.WOMEN_ENABLED` está en `false`.

**Lo que el flag bloquea hoy:**

- Los links de la sección en navbar y menú (verificado: **0 `href="/women"`** en el HTML)
- La home `/` hace `router.replace('/men')` y devuelve `null`
- 🔴 **La creación de orden y el QR** para prendas de mujer
  (`orderService.ts:93`, `checkout/page.tsx:1241`, `OrderConfirmationModal.tsx:107`)

**Lo que el flag NO bloquea:** las rutas siguen devolviendo `200` con metadata propio
(`/women` → "Mujeres | MoneroGet"). Son alcanzables escribiendo la URL.

Se implementó un filtro por flag (135 → 126 URLs) y se probó en los dos sentidos. **El
usuario pidió revertirlo**: la sección se habilita pronto y prefiere que Google empiece a
conocer esas URLs desde ya. Es una decisión razonable — indexar una categoría antes del
lanzamiento le da tiempo a Google de rastrearla.

**Estado final: 135 URLs**, con las 6 rutas de mujer y los 119 productos.

> ⚠️ **Consecuencia asumida:** los 3 productos de mujer son `Producto de prueba`,
> `Producto de prueba 2` y `top 1`. Entran al sitemap, así que Google puede indexar dos
> fichas llamadas "Producto de prueba". Y si alguien llega a una prenda de mujer desde el
> buscador, al pagar recibe *"La generación de código QR está temporalmente deshabilitada
> para prendas de categoría mujeres"*.
>
> **Mitigación recomendada:** deshabilitar los productos 169 y 174 desde el panel de
> administración. No es código — la API pública los devuelve con `enabled: true`.

> **Si se quisiera volver al filtro:** era ~8 líneas en `sitemap.ts` (un
> `staticPaths.filter` por `path.includes('women')` y un `continue` cuando
> `gender === 'female'`). Queda registrado acá por si cambia el criterio.

### Paso 31: `robots.txt` apuntaba al dominio equivocado

Lo encontró el usuario al abrir el archivo. El `public/robots.txt` estático declaraba:

```
Sitemap: https://moneroget.com/sitemap.xml
```

El **dominio pelado**, el mismo que `next.config.ts` redirige con 301 — la misma
inconsistencia ya corregida en el sitemap (paso 24) y el metadata (paso 25). Dejarla acá
hardcodeada anulaba el sentido de haber centralizado `SITE_URL`.

**Convertido a `src/app/robots.ts`**, que lo genera desde `SITE_URL`. Se borró el
estático: si convivieran, `public/` tendría precedencia y el nuevo nunca se usaría.

Se agregó `Disallow: /*/results` — las páginas de búsqueda son contenido fino,
infinito y duplicado del catálogo. Es coherente con haberlas dejado fuera del sitemap
en el paso 27.

**Coherencia de dominio verificada en los 3 lugares:**

```
robots sitemap:   https://www.moneroget.com/sitemap.xml
sitemap 1a URL:   https://www.moneroget.com
canonical ficha:  https://www.moneroget.com/w/pantal-n-monero-mom-jeans-66
```

> `Disallow: /w/checkout` cubre también `/w/checkout/order-confirmed`: en robots.txt
> las reglas son por prefijo.

**Pendiente de la Fase 4:**

- [ ] `about_us` e `information`: necesitan el mismo split servidor/cliente que la ficha
      de producto para tener metadata propio. Recién entonces entran al sitemap
- [ ] Canonical en el resto de las páginas (`/`, `/men`, `/men/clothes`...) — ninguna
      tiene hoy
- [ ] `/w/outfits` (el visor de detalle) sigue con metadata genérico. `/w/outfits/men`
      y `/women` ya tienen el propio, y son las que están en el sitemap
- [ ] `opengraph-image` propio (hoy cae al logo cuando el producto no trae imagen)
- [ ] **Considerar renderizar los links de producto en el servidor.** Hoy el sitemap es
      el único canal; que las galerías emitieran `<a href="/w/...">` en el HTML daría
      señales de enlazado interno, que es lo que Google usa para entender jerarquía

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
