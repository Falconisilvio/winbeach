export const es = {
  meta: {
    lang: 'es',
    title: 'Guía — WinBeach Web',
    header: '<i class="fa-solid fa-circle-question" style="color:#0984e3"></i> Guía WinBeach Web',
    subtitle: 'Manual operativo completo — Beach Manager en GitHub Pages.',
  },
  html: `
    <nav class="guide-toc" aria-label="Tabla de contenidos">
      <h3><i class="fa-solid fa-list"></i> Tabla de contenidos</h3>
      <ol>
        <li><a href="#intro">Introducción</a></li>
        <li><a href="#accesso">Acceso y seguridad</a></li>
        <li><a href="#navigazione">Navegación</a></li>
        <li><a href="#multi-bd">Multi-establecimiento y almacenamiento de datos</a></li>
        <li><a href="#dashboard">Panel de control</a></li>
        <li><a href="#spiaggia">Playa</a></li>
        <li><a href="#booking">Reservas y booking</a></li>
        <li><a href="#planner">Planificador</a></li>
        <li><a href="#listini">Listas de precios y tarifas</a></li>
        <li><a href="#cassa">Caja y flujos</a></li>
        <li><a href="#clienti">Clientes</a></li>
        <li><a href="#qr">Escaneo QR</a></li>
        <li><a href="#statistiche">Estadísticas</a></li>
        <li><a href="#log">Registros y auditoría</a></li>
        <li><a href="#contatori">Contadores</a></li>
        <li><a href="#magazzino">Almacén</a></li>
        <li><a href="#impostazioni">Configuración</a></li>
        <li><a href="#cambia">Cambiar establecimiento</a></li>
        <li><a href="#utenti">Usuarios y roles</a></li>
        <li><a href="#stripe">Pagos Stripe</a></li>
        <li><a href="#mobile">Uso en móvil y tablet</a></li>
        <li><a href="#faq">FAQ y resolución de problemas</a></li>
        <li><a href="#tecnico">Apéndice técnico</a></li>
      </ol>
    </nav>

    <!-- 1. INTRODUCTION -->
    <section class="guide-section" id="intro">
      <h3><i class="fa-solid fa-umbrella-beach"></i> 1. Introducción</h3>
      <p><strong>WinBeach Web</strong> es la versión basada en navegador del sistema de gestión de playas WinBeach. Permite gestionar parcelas, reservas, clientes, ingresos y la configuración del establecimiento sin instalar software de escritorio.</p>
      <p>URL pública: <code>https://falconisilvio.github.io/winbeach/</code></p>
      <h4>Funciones principales</h4>
      <ul>
        <li>Panel operativo con KPI en tiempo real (llegadas, salidas, ocupación, ingresos)</li>
        <li>CRUD completo en más de 24 tablas mediante <strong>base de datos en la nube</strong></li>
        <li>Plano interactivo de la playa (editor de estructura)</li>
        <li>Multi-establecimiento: varios establecimientos de playa con bases de datos separadas</li>
        <li>Autenticación de usuarios con roles (solo lectura / escritura / administrador)</li>
        <li>Diseño responsive para smartphones, tablets y escritorio</li>
      </ul>
      <div class="info-box">
        <strong>Modo predeterminado</strong>
        <p style="margin:6px 0 0">Al iniciar, la aplicación está en modo <span class="guide-badge read">solo lectura</span>. Puede ver todos los datos; para crear, editar o eliminar registros debe <strong>iniciar sesión</strong> y configurar el <strong>token de GitHub</strong>.</p>
      </div>
    </section>

    <!-- 2. ACCESS -->
    <section class="guide-section" id="accesso">
      <h3><i class="fa-solid fa-right-to-bracket"></i> 2. Acceso y seguridad</h3>
      <h4>Inicio de sesión</h4>
      <ol>
        <li>Haga clic en <strong>Iniciar sesión</strong> en la barra superior (o vaya a <code>login.html</code>)</li>
        <li>Introduzca usuario y contraseña</li>
        <li>Tras el inicio de sesión, su nombre y rol aparecen en la barra superior</li>
      </ol>
      <div class="guide-table-wrap">
        <table class="guide-table">
          <thead><tr><th>Usuario demo</th><th>Contraseña</th><th>Rol</th><th>Permisos</th></tr></thead>
          <tbody>
            <tr><td><code>admin</code></td><td><code>admin</code></td><td>Administrador</td><td><span class="guide-badge admin">Admin</span> Escritura + usuarios + perfiles BD</td></tr>
            <tr><td><code>reception</code></td><td><code>reception</code></td><td>Operador</td><td><span class="guide-badge write">Escritura</span> Operaciones diarias</td></tr>
          </tbody>
        </table>
      </div>
      <h4>Token de GitHub (escrituras en la base de datos)</h4>
      <p>Los cambios se envían al repositorio de datos mediante GitHub Actions. Se requiere un <strong>Personal Access Token</strong> con permiso <code>repo</code> en el fork de la base de datos.</p>
      <ol>
        <li>Inicie sesión como <strong>admin</strong></li>
        <li>Vaya a <strong>Cambiar establecimiento</strong> → editar perfil → campo Token</li>
        <li>Pegue el token (formato <code>ghp_…</code>) y guarde</li>
      </ol>
      <div class="guide-warn">
        <strong>Importante:</strong> el token permanece en el almacenamiento local del navegador (localStorage). No comparta el PC con un token activo. La sesión de usuario dura 8 horas; el token persiste hasta que lo elimine.
      </div>
      <h4>Doble protección en las escrituras</h4>
      <ul>
        <li><strong>Nivel 1 — Usuario:</strong> sesión válida + rol Operador o Administrador</li>
        <li><strong>Nivel 2 — Base de datos:</strong> token de GitHub con acceso de escritura al repositorio de datos</li>
      </ul>
    </section>

    <!-- 3. NAVIGATION -->
    <section class="guide-section" id="navigazione">
      <h3><i class="fa-solid fa-compass"></i> 3. Navegación</h3>
      <h4>Barra lateral (iconos)</h4>
      <div class="guide-table-wrap">
        <table class="guide-table">
          <thead><tr><th>Icono</th><th>Módulo</th><th>Descripción</th></tr></thead>
          <tbody>
            <tr><td>☂ Playa</td><td>spiaggia</td><td>Mapa de ocupación de parcelas para hoy</td></tr>
            <tr><td>📅 Booking</td><td>booking</td><td>Gestión de reservas con tarifas</td></tr>
            <tr><td>📋 Planificador</td><td>planner</td><td>Vista de calendario / planificación</td></tr>
            <tr><td>📃 Listas de precios</td><td>listini</td><td>Listas de precios estacionales</td></tr>
            <tr><td>💰 Caja</td><td>cassa</td><td>Movimientos de caja diarios</td></tr>
            <tr><td>📊 Estadísticas</td><td>dashboard</td><td>Volver al panel de KPI</td></tr>
            <tr><td>👤 Clientes</td><td>clienti</td><td>Directorio de clientes</td></tr>
            <tr><td>QR</td><td>qr-scan</td><td>Buscar reserva por QR/texto</td></tr>
            <tr><td>⚙ Configuración</td><td>—</td><td>Abre el submenú de configuración</td></tr>
            <tr><td>⇄ Cambiar</td><td>cambia</td><td>Perfiles multi-establecimiento</td></tr>
            <tr><td>? Guía</td><td>guida</td><td>Este manual</td></tr>
          </tbody>
        </table>
      </div>
      <h4>Menú de texto (izquierda)</h4>
      <p>Agrupa los módulos operativos: <em>Llegadas y salidas</em>, <em>Estadísticas del establecimiento</em>, <em>Registros y flujos</em>, <em>Contadores</em>, <em>Almacén</em> y el submenú <em>Configuración</em>.</p>
      <h4>Selector de establecimiento (barra superior)</h4>
      <p>Desplegable con todos los perfiles configurados. Al cambiar de establecimiento se recargan los datos de la base de datos correspondiente.</p>
      <h4>Barra de estado de conexión</h4>
      <p>Cada módulo muestra <code>nombre del establecimiento · estado</code>: <em>idle</em>, <em>loading</em>, <em>ok</em>, <em>error</em>. Indica si la lectura/escritura en la base de datos tuvo éxito.</p>
    </section>

    <!-- 4. MULTI-BD -->
    <section class="guide-section" id="multi-bd">
      <h3><i class="fa-solid fa-database"></i> 4. Multi-establecimiento y almacenamiento de datos</h3>
      <p>Cada establecimiento corresponde a un archivo JSON en el repositorio de datos, p. ej. <code>data/winbeach.json</code>, <code>data/winbeach-lido-sud.json</code>.</p>
      <h4>Configuración del perfil</h4>
      <ul>
        <li><strong>Nombre del establecimiento</strong> — etiqueta mostrada en la aplicación</li>
        <li><strong>Owner / Repo</strong> — p. ej. <code>owner/repo-name</code></li>
        <li><strong>Branch</strong> — normalmente <code>main</code></li>
        <li><strong>Archivo BD</strong> — nombre sin <code>.json</code></li>
        <li><strong>Token</strong> — uno por perfil, almacenado en el navegador</li>
      </ul>
      <h4>Perfiles demo</h4>
      <p>En <strong>Cambiar establecimiento</strong> → <strong>Perfiles demo</strong>, se crean automáticamente tres establecimientos con datos de ejemplo distintos.</p>
      <h4>Lectura vs escritura</h4>
      <ul>
        <li><strong>Lectura:</strong> pública vía CDN de GitHub (<code>raw.githubusercontent.com</code>), no requiere token</li>
        <li><strong>Escritura:</strong> SQL enviado mediante <code>repository_dispatch</code>; GitHub Actions aplica el cambio en 10–30 segundos</li>
      </ul>
    </section>

    <!-- 5. DASHBOARD -->
    <section class="guide-section" id="dashboard">
      <h3><i class="fa-solid fa-house"></i> 5. Panel de control</h3>
      <p>Resumen diario del establecimiento activo. Las cifras se actualizan automáticamente desde la base de datos (<code>dashboard-stats.js</code>).</p>
      <h4>Tarjetas KPI</h4>
      <ul>
        <li><strong>Llegadas / Salidas</strong> — reservas con fecha de inicio/fin igual a hoy</li>
        <li><strong>Cancelaciones</strong> — reservas con estado <code>cancellata</code></li>
        <li><strong>Ocupación</strong> — % de parcelas ocupadas hoy</li>
        <li><strong>Ingresos</strong> — suma de importes de reservas activas</li>
        <li><strong>Afluencia</strong> — clientes en la playa hoy</li>
        <li><strong>Descuentos</strong> — enlace al registro de descuentos</li>
        <li><strong>Ticket medio</strong> — estadísticas de duración</li>
      </ul>
      <h4>Gráficos</h4>
      <ul>
        <li>Gráfico circular <em>Estado de pago</em> (pagado / parcial / pendiente)</li>
        <li>Gráfico circular <em>Canal de reserva</em> (offline / widget / portal)</li>
        <li>Gráficos de líneas <em>Afluencia</em> y <em>Llegadas/Salidas</em> (datos históricos de demostración)</li>
      </ul>
      <p>Los enlaces <em>Detalles →</em> abren el módulo relacionado en el panel central.</p>
    </section>

    <!-- 6. BEACH -->
    <section class="guide-section" id="spiaggia">
      <h3><i class="fa-solid fa-umbrella-beach"></i> 6. Playa</h3>
      <p>Vista de mapa de parcelas con estado de ocupación para la fecha de hoy. Los colores y la leyenda provienen de las reservas activas y la tabla <code>celle</code>.</p>
      <ul>
        <li>Verde / ocupada — parcela con una reserva válida hoy</li>
        <li>Libre — disponible para una nueva reserva</li>
        <li>Estadísticas superiores: total de parcelas, ocupadas, % de ocupación</li>
      </ul>
    </section>

    <!-- 7. BOOKING -->
    <section class="guide-section" id="booking">
      <h3><i class="fa-solid fa-calendar-days"></i> 7. Reservas y booking</h3>
      <h4>Booking (barra lateral)</h4>
      <p>Módulo principal de CRUD de reservas con cálculo automático de tarifas.</p>
      <ul>
        <li><strong>Nuevo</strong> — requiere al menos un cliente en el directorio</li>
        <li>Campos: cliente, parcela (cella), fechas, estado, importe, pagado, canal, pago</li>
        <li>El precio se calcula a partir del sector de la parcela + tarifas + fechas (puede editarse manualmente)</li>
        <li>Estados: <code>confermata</code>, <code>in_attesa</code>, <code>cancellata</code></li>
        <li>Pago: <code>saldato</code>, <code>parziale</code>, <code>da_saldare</code></li>
      </ul>
      <h4>Llegadas y salidas (menú izquierdo)</h4>
      <div class="guide-table-wrap">
        <table class="guide-table">
          <thead><tr><th>Página</th><th>Contenido</th><th>Acciones</th></tr></thead>
          <tbody>
            <tr><td>Llegadas hoy</td><td>Reservas con <code>data_inizio = hoy</code></td><td>Check-in rápido</td></tr>
            <tr><td>Salidas hoy</td><td><code>data_fine = hoy</code></td><td>Check-out</td></tr>
            <tr><td>Llegadas mañana</td><td>Llegadas previstas mañana</td><td>Solo lectura</td></tr>
            <tr><td>Salidas mañana</td><td>Salidas previstas mañana</td><td>Solo lectura</td></tr>
            <tr><td>Cambios de sombrilla</td><td>Registro de reubicación de parcelas</td><td>CRUD en <code>log_modifiche</code></td></tr>
            <tr><td>Todas las reservas</td><td>Lista completa filtrable</td><td>Mismas funciones que Booking</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 8. PLANNER -->
    <section class="guide-section" id="planner">
      <h3><i class="fa-solid fa-list"></i> 8. Planificador</h3>
      <p>Vista de planificación de actividades y tareas (<code>attivita</code>). Útil para organizar las tareas diarias del personal (apertura, limpieza, preparación de llegadas).</p>
    </section>

    <!-- 9. PRICE LISTS -->
    <section class="guide-section" id="listini">
      <h3><i class="fa-solid fa-tags"></i> 9. Listas de precios y tarifas</h3>
      <h4>Listas de precios</h4>
      <p>Definen períodos y sectores cubiertos (p. ej. «Verano 2026», sectores A/B/C).</p>
      <h4>Tarifas</h4>
      <p>Precios por franja (<code>tassa</code> = sector): diario, semanal, quincenal, mensual. Vinculados a <code>listino_id</code>.</p>
      <div class="guide-tip">
        Configure primero <strong>Sectores</strong> y <strong>Tarifas</strong>, luego <strong>Estructura</strong> (asignar sector a cada parcela) para un cálculo correcto del precio en Booking.
      </div>
    </section>

    <!-- 10. CASH REGISTER -->
    <section class="guide-section" id="cassa">
      <h3><i class="fa-solid fa-cash-register"></i> 10. Caja y flujos</h3>
      <h4>Caja</h4>
      <ul>
        <li>Registra ingresos/gastos en <code>movimenti_cassa</code></li>
        <li>Estadísticas: ingresos/gastos hoy, saldo</li>
        <li>Campos: tipo, importe, descripción, método (efectivo/tarjeta/transferencia), operador</li>
      </ul>
      <h4>Flujos de caja (menú)</h4>
      <p>Misma lógica que Caja, vista dedicada en el grupo «Registros y flujos» para análisis agregado de movimientos.</p>
    </section>

    <!-- 11. CUSTOMERS -->
    <section class="guide-section" id="clienti">
      <h3><i class="fa-solid fa-users"></i> 11. Clientes</h3>
      <p>Directorio en la tabla <code>clienti</code>: nombre, apellido, email, teléfono, notas.</p>
      <ul>
        <li>Búsqueda de texto en tiempo real</li>
        <li>Se requiere al menos el nombre para guardar</li>
        <li>Cada reserva requiere un <code>cliente_id</code> válido</li>
      </ul>
    </section>

    <!-- 12. QR -->
    <section class="guide-section" id="qr">
      <h3><i class="fa-solid fa-qrcode"></i> 12. Escaneo QR</h3>
      <p>Busque una reserva introduciendo código QR, ID de reserva o nombre del cliente. Muestra el detalle y el estado del check-in. Ideal para entrada rápida a la playa.</p>
    </section>

    <!-- 13. STATISTICS -->
    <section class="guide-section" id="statistiche">
      <h3><i class="fa-solid fa-chart-pie"></i> 13. Estadísticas</h3>
      <div class="guide-table-wrap">
        <table class="guide-table">
          <thead><tr><th>Módulo</th><th>Análisis</th></tr></thead>
          <tbody>
            <tr><td>Estadísticas por sombrilla</td><td>Uso e ingresos por número de parcela</td></tr>
            <tr><td>Estadísticas por sector</td><td>Comparación de franjas A / B / C</td></tr>
            <tr><td>Estadísticas por duración</td><td>Distribución de estancias (diaria, semanal, …)</td></tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 14. LOG -->
    <section class="guide-section" id="log">
      <h3><i class="fa-solid fa-file-lines"></i> 14. Registros y auditoría</h3>
      <ul>
        <li><strong>Registro de descuentos</strong> — descuentos aplicados: operador, cliente, %, importe, motivo</li>
        <li><strong>Registro de cancelaciones</strong> — reservas canceladas con penalización opcional</li>
        <li><strong>Flujos de caja</strong> — movimientos financieros (véase sección Caja)</li>
      </ul>
      <p>Todos los registros se persisten en la base de datos y pueden consultarse en solo lectura por cualquier usuario.</p>
    </section>

    <!-- 15. COUNTERS -->
    <section class="guide-section" id="contatori">
      <h3><i class="fa-solid fa-calculator"></i> 15. Contadores</h3>
      <h4>Contadores de hotel</h4>
      <p>Gestión de convenios hoteleros: código de convenio, parcelas totales asignadas, parcelas utilizadas.</p>
      <h4>Contadores de vouchers</h4>
      <p>Campañas de vouchers (código, emitidos, utilizados, caducidad) — tabla <code>voucher</code>.</p>
    </section>

    <!-- 16. WAREHOUSE -->
    <section class="guide-section" id="magazzino">
      <h3><i class="fa-solid fa-warehouse"></i> 16. Almacén</h3>
      <p>Stock de artículos (<code>articoli</code>) y movimientos (<code>movimenti_magazzino</code>): sombrillas, tumbonas, toallas, etc. Control de niveles mínimos de stock e historial de entradas/salidas.</p>
    </section>

    <!-- 17. SETTINGS -->
    <section class="guide-section" id="impostazioni">
      <h3><i class="fa-solid fa-gear"></i> 17. Configuración</h3>
      <p>Accesible desde el icono ⚙ en la barra lateral. Configuración estructural del establecimiento:</p>
      <div class="guide-table-wrap">
        <table class="guide-table">
          <thead><tr><th>Módulo</th><th>Tabla</th><th>Función</th></tr></thead>
          <tbody>
            <tr><td>Elementos</td><td><code>elementi</code></td><td>Tipos de objeto: sombrilla, cabina, cama hawaiana, pasarela…</td></tr>
            <tr><td>Servicios</td><td><code>servizi</code></td><td>Servicios extra (tumbona, aparcamiento…)</td></tr>
            <tr><td>Sectores</td><td><code>settori</code></td><td>Franjas de precio / zonas (A, B, C…)</td></tr>
            <tr><td>Estructura</td><td><code>celle</code>, <code>config</code></td><td>Editor del plano de la playa</td></tr>
            <tr><td>Listas de precios</td><td><code>listini</code></td><td>Catálogos de precios estacionales</td></tr>
            <tr><td>Tarifas</td><td><code>tariffe</code></td><td>Precios por sector y duración</td></tr>
            <tr><td>Capitanería</td><td><code>capitaneria</code></td><td>Arancel de concesión / impuestos</td></tr>
            <tr><td>Concesiones</td><td><code>esercizi</code></td><td>Bar, quiosco, alquiler en el establecimiento</td></tr>
            <tr><td>Empresa</td><td><code>azienda</code></td><td>Razón social, NIF/CIF, contactos</td></tr>
            <tr><td>Usuarios</td><td><code>utenti</code></td><td>Cuentas de acceso a la app (solo admin)</td></tr>
          </tbody>
        </table>
      </div>
      <h4>Editor de estructura (detalle)</h4>
      <ol>
        <li>Establezca filas/columnas y columna de pasarela</li>
        <li>Seleccione herramienta: elemento, tassa (sector), numeración</li>
        <li>Haga clic en las celdas para asignar tipo y sector</li>
        <li><strong>Cargar desde BD</strong> — lee <code>celle</code> de la base de datos</li>
        <li><strong>Guardar en BD</strong> — guarda el plano (requiere inicio de sesión + token)</li>
      </ol>
      <p>Elementos especiales: <em>Mar</em> (filas delanteras), <em>Pasarela</em> (columna central), sin numeración.</p>
    </section>

    <!-- 18. SWITCH FACILITY -->
    <section class="guide-section" id="cambia">
      <h3><i class="fa-solid fa-right-left"></i> 18. Cambiar establecimiento</h3>
      <p>Gestione perfiles locales (almacenados en <code>localStorage</code> del navegador).</p>
      <ul>
        <li><strong>Nuevo</strong> — añade un establecimiento con su propia BD</li>
        <li><strong>Activar</strong> — cambia el contexto de datos en toda la aplicación</li>
        <li><strong>Probar conexión</strong> — verifica el acceso de lectura a la base de datos</li>
        <li><strong>Perfiles demo</strong> — crea 3 establecimientos precargados</li>
      </ul>
      <p>Editar perfiles y tokens: solo <span class="guide-badge admin">Administrador</span>.</p>
    </section>

    <!-- 19. USERS -->
    <section class="guide-section" id="utenti">
      <h3><i class="fa-solid fa-user-gear"></i> 19. Usuarios y roles</h3>
      <div class="guide-table-wrap">
        <table class="guide-table">
          <thead><tr><th>Rol</th><th>Lectura</th><th>Escritura operativa</th><th>Admin</th></tr></thead>
          <tbody>
            <tr><td>Administrador</td><td>✓</td><td>✓</td><td>✓ usuarios, perfiles, token</td></tr>
            <tr><td>Operador</td><td>✓</td><td>✓</td><td>—</td></tr>
            <tr><td>Lector / otro</td><td>✓</td><td>—</td><td>—</td></tr>
            <tr><td>No autenticado</td><td>✓</td><td>—</td><td>—</td></tr>
          </tbody>
        </table>
      </div>
      <p>Las contraseñas se almacenan como hashes SHA-256 en el campo <code>password_hash</code>. La gestión de usuarios (CRUD) está reservada a los administradores.</p>
    </section>

    <!-- 20. STRIPE -->
    <section class="guide-section" id="stripe">
      <h3><i class="fa-solid fa-credit-card"></i> 20. Pagos Stripe</h3>
      <p>Módulos consultivos para la integración de pagos en línea:</p>
      <ul>
        <li><strong>Pagos Stripe</strong> — transacciones con tarjeta vinculadas a reservas (<code>pagamenti_stripe</code>)</li>
        <li><strong>Transferencias Stripe</strong> — pagos a cuenta bancaria (<code>trasferimenti_stripe</code>)</li>
      </ul>
      <div class="guide-tip">
        Los pagos reales con Stripe requieren un backend de servidor. En esta versión web, los módulos registran y muestran datos de demostración/históricos en la base de datos.
      </div>
    </section>

    <!-- 21. MOBILE -->
    <section class="guide-section" id="mobile">
      <h3><i class="fa-solid fa-mobile-screen"></i> 21. Uso en móvil y tablet</h3>
      <ul>
        <li><strong>≤1024px:</strong> menú hamburguesa ☰, barra lateral inferior con iconos desplazables</li>
        <li><strong>≤768px:</strong> panel de control en una columna, modales a pantalla completa (bottom sheet)</li>
        <li>Tablas: desplazamiento horizontal automático</li>
        <li>Botones e inputs: mínimo 44px para uso táctil</li>
        <li>Estructura: cuadrícula de playa desplazable, celdas redimensionadas</li>
      </ul>
      <p>Recomendado: añadir el sitio a la pantalla de inicio en iOS/Android para una experiencia similar a una app.</p>
    </section>

    <!-- 22. FAQ -->
    <section class="guide-section" id="faq">
      <h3><i class="fa-solid fa-life-ring"></i> 22. FAQ y resolución de problemas</h3>
      <h4>«Illegal invocation» o error de conexión de datos</h4>
      <p>Error corregido en el cliente: recargue con Ctrl+Shift+R. Si persiste, borre la caché del navegador.</p>
      <h4>No se puede guardar / botones ocultos</h4>
      <ol>
        <li>¿Ha <strong>iniciado sesión</strong>?</li>
        <li>¿Su rol es Operador o Administrador?</li>
        <li>¿Está configurado el <strong>token de GitHub</strong> en el perfil activo?</li>
      </ol>
      <h4>Guardado lento</h4>
      <p>Normal: la sincronización usa GitHub Actions (~10–30 s). Espere el mensaje de confirmación en la barra de estado.</p>
      <h4>Datos no actualizados tras la edición</h4>
      <p>La CDN de GitHub puede tardar 1–2 minutos. Use <strong>Recargar</strong> en el módulo o cambie de perfil y vuelva.</p>
      <h4>El panel muestra ceros</h4>
      <p>Verifique que el perfil apunta al archivo BD correcto y que existen reservas/clientes de ejemplo.</p>
      <h4>Multi-establecimiento no cambia los datos</h4>
      <p>Use el selector en la barra superior; los módulos abiertos se recargan automáticamente.</p>
    </section>

    <!-- 23. TECHNICAL -->
    <section class="guide-section" id="tecnico">
      <h3><i class="fa-solid fa-code"></i> 23. Apéndice técnico</h3>
      <h4>Stack</h4>
      <ul>
        <li>Frontend estático: HTML, CSS, JavaScript ES modules</li>
        <li>Hosting: GitHub Pages (rama <code>gh-pages</code>, carpeta <code>docs</code>)</li>
        <li>Base de datos: <a href="https://github.com/owner/repo-name">Repositorio de datos</a> — JSON + SQL vía Actions</li>
        <li>Repositorio de la app: <code>Falconisilvio/winbeach</code></li>
        <li>Repositorio de datos: <code>owner/repo-name</code></li>
      </ul>
      <h4>Tablas de la base de datos (winbeach)</h4>
      <p><code>config</code>, <code>celle</code>, <code>clienti</code>, <code>prenotazioni</code>, <code>elementi</code>, <code>settori</code>, <code>listini</code>, <code>tariffe</code>, <code>servizi</code>, <code>movimenti_cassa</code>, <code>log_sconti</code>, <code>log_cancellazioni</code>, <code>log_modifiche</code>, <code>contatori_albergo</code>, <code>voucher</code>, <code>articoli</code>, <code>movimenti_magazzino</code>, <code>utenti</code>, <code>azienda</code>, <code>capitaneria</code>, <code>esercizi</code>, <code>pagamenti_stripe</code>, <code>trasferimenti_stripe</code>, <code>attivita</code></p>
      <h4>Archivos clave</h4>
      <ul>
        <li><code>js/winbeach-db.js</code> — conexión a la base de datos, multi-perfil</li>
        <li><code>js/winbeach-auth.js</code> — inicio de sesión y permisos</li>
        <li><code>js/winbeach-module.js</code> — utilidades de módulo y solo lectura</li>
        <li><code>js/table-crud.js</code> — fábrica CRUD genérica</li>
        <li><code>js/dashboard-stats.js</code> — KPI del panel</li>
        <li><code>database/seed-demo.mjs</code> — generador de datos de ejemplo</li>
      </ul>
      <h4>Versión de la documentación</h4>
      <p>Manual actualizado para WinBeach Web con autenticación, multi-BD y 34 módulos operativos. Junio 2026.</p>
    </section>
  `,
};