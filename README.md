# Engobe y Ceniza · Vidriera de piezas por hornada

App de dos pantallas para el taller de cerámica Engobe y Ceniza (Güemes, Córdoba).

- **Hornada**: muestra las piezas de la hornada y cuántas unidades quedan de cada una.
- **Mi lista**: la persona arma su lista y la aparta. Al apartar se descuentan las unidades, se genera un código y se puede mandar el pedido por WhatsApp.

No tiene backend ni cuentas: todo se guarda en el `localStorage` del navegador.

Stack: React 19 + Vite + Tailwind CSS 4. Las fuentes (Fraunces y Karla) van incluidas en el proyecto, así que no se cargan de servicios externos.

---

## Cómo correrlo en local

Requisito: Node 20 o superior.

```bash
npm install
npm run dev        # http://localhost:5173
```

Otros comandos:

```bash
npm run build      # genera dist/ para producción
npm run preview    # sirve dist/ en http://localhost:4173
npm run lint       # oxlint
npm run format     # prettier
```

La primera vez que se abre, la app carga la **hornada de prueba**. No hace falta configurar nada.

## Qué está simulado

| Qué | Cómo funciona en esta versión | Qué falta para producción |
|---|---|---|
| Datos | Hornada, piezas, precios, unidades y apartados de prueba en `src/data/hornada.js`. Todos son sintéticos y los correos son de `example.com`. | Cargarlos desde el backend |
| Persistencia | `localStorage`, en el navegador de cada persona | Backend compartido: hoy cada navegador tiene su propio stock |
| Apartar | Guarda el apartado en el navegador y genera un código `EC-XXXX` | Registrar el apartado en el backend |
| WhatsApp | Abre `https://wa.me/?text=…` con el mensaje armado. No lleva número de destino: la persona elige el contacto. | Poner el número del taller en `enlaceWhatsApp()` (`src/lib/reglas.js`) |
| Pagos y correos | No hay | — |

## Datos sintéticos y cómo cargar una hornada nueva

Todo está en **`src/data/hornada.js`**:

- `HORNADA`: `id`, `nombre` y `fecha` de horneado (`'AAAA-MM-DD'` o `null`). Si la fecha es `null`, no se muestra.
- `LINEAS`: las secciones (Ceniza, Engobe, Torno libre) con su descripción.
- `PIEZAS`: cada pieza con `id`, `linea`, `nombre`, `medida` (`''` si no tiene), `precio` en pesos sin decimales y `total` de unidades físicas.
- `APARTADOS_INICIALES`: los apartados de prueba.

**Las unidades disponibles no se guardan, se calculan**: `disponibles = total − suma de las unidades apartadas`.
Por eso `total` incluye lo que ya está apartado en la semilla. Por ejemplo, la Taza tiene `total: 10` y 2 apartadas en la semilla, así que muestra 8, como pide el briefing. Esto evita restar dos veces los apartados de la semilla.

Para cargar una hornada nueva:

1. Cambiá `HORNADA.id`, por ejemplo `'primavera-2027'`, y completá `nombre` y `fecha`.
2. Reemplazá `PIEZAS` con las nuevas: precios, medidas y `total`.
3. Si la hornada arranca sin apartados, dejá `APARTADOS_INICIALES = []`.
4. Si agregás una pieza con un `id` nuevo, sumá su silueta en `src/components/Silueta.jsx`, en el objeto `FORMAS`. El dibujo usa un `viewBox` de 120×120.

Al cambiar `HORNADA.id`, cada navegador detecta que los datos guardados son de otra hornada y carga la nueva semilla.
Si solo cambiás precios o unidades sin cambiar el `id`, los navegadores que ya tenían datos guardados conservan sus apartados. Las disponibles se recalculan con los nuevos `total`.

## Almacenamiento

- **Clave**: `engobe-ceniza:vidriera:v1`. Es la única que usa la app. El sufijo `v1` es la versión del formato.
- **Contenido**: `{ version, hornadaId, apartados, lista, formulario }`.
- La semilla se carga **solo si la clave no existe** (o si guarda otra versión u otra hornada). Una lista guardada vacía no cuenta como primera visita.
- **No se tocan claves ajenas**: el código nunca llama a `localStorage.clear()` ni a `removeItem`, y solo escribe con `setItem` sobre su propia clave. Todo el acceso está en `src/lib/almacenamiento.js`.
- Si otra pestaña aparta piezas, la app se entera por el evento `storage` y vuelve a comprobar el stock antes de apartar.

### Reiniciar los datos de ejemplo

- **Desde la app**: botón «Restaurar hornada de prueba», al pie de la Hornada. Pide confirmación, devuelve las unidades iniciales con los 2 apartados de prueba y vacía Mi lista. Lo escrito en el formulario se conserva.
- **A mano**: en las herramientas del navegador, borrá solo la clave `engobe-ceniza:vidriera:v1` y recargá.

## Guardado fallido: cómo comprobarlo

La app primero guarda y recién después muestra el éxito. Si el guardado falla, se conserva lo escrito y no cambian los códigos, las cantidades ni los estados.

Hay dos parámetros de URL para simular fallos:

| URL | Qué simula |
|---|---|
| `/?falla=guardado` | Fallan las escrituras importantes: Apartar y Restaurar |
| `/?falla=bloqueo` | `localStorage` bloqueado, como en algunos modos privados |

Para probar el guardado fallido:

1. Abrí `/?falla=guardado`, sumá piezas y andá a Mi lista (`/?falla=guardado#/lista`).
2. Completá nombre y correo y tocá «Apartar».
3. Aparece «No pudimos guardar tu apartado. Tus datos siguen acá: probá de nuevo.». El formulario y las cantidades siguen iguales, no se genera código y las unidades no bajan.

Con `?falla=bloqueo` aparece un aviso de que el navegador no está guardando, y la app funciona igual mientras la página siga abierta.

## Reglas implementadas

- **Etiqueta de cada pieza**:
  - 3 o más unidades: «En la hornada».
  - 1 o 2: «Últimas piezas».
  - 0: «Se terminó», con el botón desactivado.
- Sumar a la lista **no** descuenta. Las unidades bajan recién al apartar.
- **Cantidad en Mi lista**: mínimo 1 y máximo las disponibles.
- **Nombre**: al menos 3 letras.
- **Correo**: se quitan los espacios de los extremos y se pasa a minúsculas.
- **Duplicados**: mismo correo normalizado + mismas piezas con las mismas cantidades. En ese caso no se aparta otra vez y se muestra el código existente.
- **Pieza agotada antes de apartar** (por ejemplo, porque se apartó desde otra pestaña): se marca la pieza y «Apartar» queda bloqueado hasta ajustar la lista.
- **Código**: `EC-` + 4 caracteres, sin 0/O ni 1/I para que no se confundan.

## Estructura

```
src/
  data/hornada.js          datos de la hornada (sintéticos)
  lib/almacenamiento.js    acceso a localStorage, semilla y simulación de fallos
  lib/reglas.js            unidades, etiquetas, validación, duplicados, WhatsApp
  lib/useVidriera.js       estado de la app y acciones (sumar, apartar, restaurar…)
  components/              BarraSuperior, Hornada, TarjetaPieza, MiLista, DialogoRestaurar, Silueta
public/texturas/           texturas de papel y hormigón (webp)
pruebas/                   informe de pruebas, script de aceptación y capturas
```

Las dos pantallas usan el hash de la URL: `#/lista` es Mi lista y cualquier otro valor es la Hornada. No hace falta configurar redirecciones en el servidor.

## Pruebas

En `pruebas/INFORME.md` está el resultado criterio por criterio, a 360 px y en escritorio. Para repetirlas:

```bash
npm run build && npm run preview
pip install playwright && python -m playwright install chromium
python pruebas/criterios.py http://localhost:4173/
```

## Despliegue (Netlify)

`netlify.toml` ya está configurado: comando `npm run build` y carpeta `dist`.
El sitio incluye `noindex` para que los buscadores no indexen la previsualización.

## Pendientes

- Fecha de horneado: no figura en el briefing (`HORNADA.fecha = null`).
- Medidas de Mantequera, Portasahumerio, Juego de 4 pocillos y Cucharita: no figuran en el briefing, así que se muestran sin medida.

## Accesibilidad

- Todos los objetivos táctiles miden al menos 44 px y el foco es visible al navegar con teclado.
- Se respeta `prefers-reduced-motion`.
- Excepción aprobada en diseño: el texto del botón desactivado (#8A5A44 sobre #8A5A44 al 20 %) tiene un contraste de 3,95:1.

## Créditos

Texturas de papel y hormigón: [Texturelabs](https://texturelabs.org) (Paper 361, Concrete 133).
