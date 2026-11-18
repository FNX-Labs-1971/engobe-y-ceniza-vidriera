# Informe de pruebas · Vidriera Engobe y Ceniza

Fecha: 17/11/2026 · Build de producción (`npm run build` + `vite preview`) · Chrome 1xx sin interfaz, vía Playwright.
Cada prueba se corrió dos veces: **celular 360 × 780 px** y **escritorio 1280 × 800 px**.
Resultado: **44/44 comprobaciones correctas** (22 por ancho). Script: `pruebas/criterios.py`.

Datos usados: los sintéticos de `src/data/hornada.js` y correos de `example.com`.

## Criterios de aceptación

| # | Criterio | Cómo se probó | Resultado |
|---|---|---|---|
| 1 | Al apartar, las unidades bajan en la cantidad elegida sin recargar | Se apartan Jarra ×1 y Taza ×2. Antes de tocar «Apartar» se deja una marca en `window`. Después se comprueba que la marca sigue (no hubo recarga) y que Jarra pasó de 2 a 1 y Taza de 8 a 6. | ✅ 360 · ✅ escritorio |
| 2 | 1–2 unidades → «Últimas piezas»; 0 → «Se terminó» con botón desactivado | Con la semilla: Jarra (2) y Mantequera (1) muestran «Últimas piezas»; Portasahumerio (0) muestra «Se terminó» y su botón tiene `disabled`; Plato hondo (3) muestra «En la hornada». | ✅ · ✅ |
| 3 | La cantidad en Mi lista nunca supera las disponibles | Jarra (2 disponibles): escribir 9 deja 2; el botón + queda desactivado en 2; escribir 0 deja 1. En la Hornada, con las 2 en la lista, «Sumar a mi lista» se desactiva («Ya sumaste todas»). | ✅ · ✅ |
| 4 | El total estimado se recalcula al cambiar una cantidad | Jarra ×1 + Taza ×2: $60.000 → + taza $74.500 → − taza $60.000 → escribir 4 $89.000 → escribir 2 $60.000. | ✅ · ✅ |
| 5 | WhatsApp abre el mensaje con piezas, cantidades, total y código | Se lee el enlace del botón (`https://wa.me/?text=…`) y se decodifica: incluye «Cucharita de cerámica × 3», «$14.400» y el código. Al tocar el botón se abre una pestaña nueva con esa URL (en la prueba wa.me se intercepta porque el entorno no tiene salida a internet). | ✅ · ✅ |
| 6 | «Restaurar hornada de prueba» pide confirmación y devuelve las unidades iniciales | Se abre el diálogo; «Cancelar» no cambia nada. «Restaurar» deja las 12 piezas en su valor inicial, solo los 2 apartados de la semilla y la lista vacía. | ✅ · ✅ |
| 7a | Los datos siguen ahí al recargar | Tras apartar y sumar un Florero, se recarga: siguen las unidades descontadas, la lista y lo escrito en el formulario. | ✅ · ✅ |
| 7b | Las dos pantallas se usan bien a 360 px | En Hornada y Mi lista: sin desborde horizontal (`scrollWidth` = ancho de pantalla) y todos los botones, enlaces y campos miden al menos 44 × 44 px. Revisión visual con capturas. | ✅ · ✅ |
| 7c | El caso resuelto se reproduce y da el resultado indicado | Ver «Caso resuelto» abajo. | ✅ · ✅ |
| 8 | Repositorio o Lovable compartido, README y URL de previsualización | Repositorio privado `FNX-Labs-1971/engobe-y-ceniza-vidriera` con README. URL publicada https://fnx-ec-vidriera.netlify.app comprobada el 17/11: carga sin errores, el caso resuelto da $60.000 y Jarra «Queda una sola», no hay desborde a 360 px y responde con `X-Robots-Tag: noindex, nofollow`. | ✅ Repositorio compartido con partners@kodarvia.com |

## Caso resuelto del briefing

1. Primera visita: se carga la semilla. Las 12 piezas muestran las unidades del briefing; los 2 apartados de prueba no se restan dos veces. ✅
2. Se suman Jarra y 2 Tazas: el contador dice 3 y las etiquetas no cambian (sumar no descuenta). ✅
3. Mi lista: total estimado **$60.000**. ✅
4. Nombre «Carla Méndez», correo «  Carla.Mendez@Example.com » (con espacios y mayúsculas). «Apartar» → confirmación con código `EC-XXXX`. ✅
5. Sin recargar, Jarra: **«Últimas piezas · Queda una sola»**; Taza: «En la hornada · 6». ✅
6. El botón de WhatsApp lleva piezas, cantidades, $60.000 y código. ✅

## Estados y reglas extra

| Comprobación | Cómo se probó | Resultado |
|---|---|---|
| Datos inválidos | Nombre «Al» y correo «carla@» muestran sus errores y no se aparta. | ✅ · ✅ |
| Guardado fallido | `?falla=guardado`: aparece el aviso, formulario y cantidades quedan igual y el contenido de localStorage no cambia. | ✅ · ✅ |
| localStorage bloqueado | `?falla=bloqueo`: la app funciona en memoria y avisa que no está guardando. | ✅ · ✅ |
| Pieza agotada antes de apartar | Otra pestaña aparta la última Mantequera: Mi lista marca la pieza y bloquea «Apartar» hasta quitarla. | ✅ · ✅ |
| Duplicados | Mismo correo (con espacios y mayúsculas) y mismas piezas: no se aparta otra vez y se muestra el código existente. | ✅ · ✅ |
| Lista vacía ≠ primera visita | Se vacía la lista y se recarga: no vuelve la semilla y se mantienen los apartados. | ✅ · ✅ |
| Claves ajenas | Se crea `otra-app:preferencias` antes de probar: al final sigue intacta y la app solo usa `engobe-ceniza:vidriera:v1`. | ✅ · ✅ |
| Teclado | Se recorre con Tab; el foco se ve (contorno verde esmalte de 3 px). | ✅ · ✅ |
| Consola | Sin errores durante todo el recorrido. | ✅ · ✅ |

## Accesibilidad: excepción aprobada

- Botón desactivado («Se terminó», «Ya sumaste todas», «−» en 1): texto #8A5A44 sobre relleno #8A5A44 al 20 %. Contraste **3,95:1** (el mínimo AA para texto normal es 4,5:1). Aprobado por Fer el 17/11 por decisión de diseño. El estado se comunica además con el atributo `disabled` y con la etiqueta «Se terminó» en carbón (10,8:1).

## Cómo repetir las pruebas

```bash
npm run build && npx vite preview --port 4173
pip install playwright && python -m playwright install chromium
python pruebas/criterios.py http://localhost:4173/
```
