<p align="center">
  <a href="https://falconisilvio.github.io/winbeach/">
    <img src="https://img.shields.io/badge/🌐_DEMO_EN_VIVO-falconisilvio.github.io%2Fwinbeach-2563eb?style=for-the-badge" alt="Demo en vivo">
  </a>
</p>

# WinBeach Web

**https://falconisilvio.github.io/winbeach/**

Conversión de WinBeach (Windows) a aplicación web.

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

- `docs/index.html` — Dashboard (entrada)
- `docs/css/` — Estilos (dashboard, struttura)
- `docs/js/` — Lógica (dashboard, configuración playa)
- `docs/struttura.html` — Configuración playa (procedimiento 1)
- `docs/pages/` — Otros módulos (clienti, servizi…)

## Repositorio

https://github.com/Falconisilvio/winbeach