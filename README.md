# WinBeach Web

Conversión de WinBeach (Windows) a aplicación web.

## Demo en vivo

**Configuración de la playa (Procedimiento 1):**  
https://falconisilvio.github.io/winbeach/

## Procedimiento 1 — Configuración de la playa

En el primer procedimiento se configura la playa:

1. Para cada cuadrado se define el **tipo de elemento** (alquilable o no).
2. Elementos **activos / alquilables**: sombrilla, hawaiana, cabaña, tienda de campaña.
3. Elementos **no activos**: pasarelas, papeleras, adornos, arbustos, plantas, mar, etc.
4. Para cada elemento activo se asigna la **tasa** (A, B, C, D, E…).
5. Para cada elemento activo se asigna el **número** (CELDA).
6. El resultado se guarda en un archivo de texto con columnas: `CELDA`, `X`, `Y`, `ELEMENTO`, `DESC`, `SETTORE`, `ATTIVO`.

## Archivos web

Los archivos de la demo están en la carpeta [`docs/`](docs/):

- `docs/index.html`
- `docs/styles.css`
- `docs/app.js`

## Activar GitHub Pages (una sola vez, propietario del repo)

1. Ir a **Settings → Pages** en el repositorio.
2. En **Build and deployment → Source**, elegir **Deploy from a branch**.
3. Branch: **main**, carpeta: **/docs**.
4. Guardar. En 1–2 minutos la app estará en:  
   https://falconisilvio.github.io/winbeach/
5. En la página principal del repo, clic en el engranaje **About** y pegar esa URL en **Website**.

## Repositorio

https://github.com/Falconisilvio/winbeach