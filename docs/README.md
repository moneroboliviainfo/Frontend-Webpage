# Documentación técnica — Frontend-Webpage

Documentos de diagnóstico y plan de reorganización del proyecto.

## Índice

| Documento | Qué contiene | Cómo usarlo |
|---|---|---|
| [protocolo-de-trabajo.md](./protocolo-de-trabajo.md) | **Cómo se ejecuta el refactor:** un cambio por vez, qué verificar, bitácora de avance | **Empezar acá en cada sesión** |
| [funcionalidades.md](./funcionalidades.md) | **Mapa de riesgo:** todo lo que hace la página, clasificado por qué pasa si se rompe | **Leer ANTES de tocar código** |
| [diagnostico.md](./diagnostico.md) | Análisis completo: stack, problemas detectados por severidad, métricas | Referencia. Se actualiza solo si se re-audita |
| [plan-refactor.md](./plan-refactor.md) | Plan por fases con checkboxes | **Documento vivo.** Marcar avances aquí |
| [codigo-muerto.md](./codigo-muerto.md) | Inventario de archivos y exports sin uso | **Documento vivo.** Marcar lo borrado |
| [arquitectura-objetivo.md](./arquitectura-objetivo.md) | Estructura modular a la que apuntamos y sus reglas | Referencia al mover archivos |
| [componentes-checkout.md](./componentes-checkout.md) | Diagnóstico de los 13 componentes sueltos en `app/w/checkout/` y su destino | Referencia para la Fase 2 |
| [lint-hallazgos.md](./lint-hallazgos.md) | Los 118 problemas que destapó ESLint al correr por primera vez, incluido un bug 🔴 latente | Referencia y backlog |

> ⚠️ **Regla de oro:** `funcionalidades.md` manda sobre `codigo-muerto.md`. Si un
> símbolo aparece como borrable pero toca pagos, FedEx o facturación, no se borra.

## Contexto

- **Auditoría inicial:** 2026-10-08
- **Commit base:** `d0f607e`
- **Enfoque acordado:** modularización *intermedia* — feature-first, sin DDD ni capas
  de abstracción ceremoniales. Cambios incrementales, cada fase entregable por separado.

## Cómo trabajar con esto

1. Abrir [protocolo-de-trabajo.md](./protocolo-de-trabajo.md) y mirar la **bitácora**:
   ahí está el último paso completado y cuál sigue.
2. Antes de tocar un archivo, chequear su riesgo en
   [funcionalidades.md](./funcionalidades.md).
3. Hacer **un** cambio, verificar con `pnpm run typecheck`, probarlo manualmente,
   commitear, marcar el checkbox.
4. Si se descubre algo nuevo, anotarlo en `diagnostico.md`.

> 🚨 **La web está en producción y funcionando.** Un cambio por vez, verificado y
> probado antes de pasar al siguiente. El protocolo no es burocracia: es lo que permite
> saber qué rompió algo si algo se rompe.

El orden de las fases no es arbitrario: la Fase 0 no puede romper nada y la Fase 1
(cliente HTTP central) es la que evita que cada cambio de contrato de la API se
multiplique por 10 archivos.
