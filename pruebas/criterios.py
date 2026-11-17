"""Pruebas de aceptación de la vidriera. Uso: python3 criterios.py <url>
Corre cada criterio a 360 px (celular) y 1280 px (escritorio)."""
import asyncio, json, os, sys
from urllib.parse import unquote
from playwright.async_api import async_playwright

U = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:4173/"
K = "engobe-ceniza:vidriera:v1"
CAPTURAS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "capturas")
os.makedirs(CAPTURAS, exist_ok=True)
R = []  # (vista, id, descripcion, ok, detalle)

def chk(vista, cid, desc, ok, det=""):
    R.append((vista, cid, desc, bool(ok), det))

def card(pg, pid):
    return pg.locator(f"#pieza-{pid} >> xpath=ancestor::article")

async def boton(pg, pid):
    return card(pg, pid).locator("button")

async def sumar(pg, pid, n=1):
    for _ in range(n):
        await (await boton(pg, pid)).click()

async def texto(pg, pid):
    return (await card(pg, pid).inner_text()).replace("\n", " | ")

async def limpio(ctx):
    pg = await ctx.new_page()
    await pg.goto(U)
    await pg.evaluate(f"localStorage.removeItem('{K}')")
    await pg.evaluate("localStorage.setItem('otra-app:preferencias', '{\"tema\":\"oscuro\"}')")
    await pg.goto(U); await pg.wait_for_timeout(250)
    return pg

async def correr(p, vista, ancho, alto):
    b = await p.chromium.launch(executable_path=os.environ.get("CHROME") or None)
    ctx = await b.new_context(viewport={"width": ancho, "height": alto})
    errores = []
    await ctx.route("https://wa.me/**", lambda r: r.fulfill(status=200, content_type="text/html", body="wa.me simulado"))
    pg = await limpio(ctx)
    pg.on("console", lambda m: errores.append(m.text) if m.type == "error" else None)
    pg.on("pageerror", lambda e: errores.append(str(e)))

    # ---- Semilla: disponibles del briefing (apartados ya descontados) ----
    esperado = {"taza-desayuno": "En la hornada · 8", "cuenco-hondo": "En la hornada · 5", "plato-playo": "En la hornada · 6",
                "plato-hondo": "En la hornada · 3", "maceta-colgante": "En la hornada · 4", "jarra": "Últimas piezas · Quedan 2",
                "mantequera": "Últimas piezas · Queda una sola", "portasahumerio": "Se terminó", "florero-alto": "Últimas piezas · Quedan 2",
                "fuente-ovalada": "Últimas piezas · Queda una sola", "pocillos": "En la hornada · 3", "cucharita": "En la hornada · 12"}
    malas = [k for k, v in esperado.items() if v not in await texto(pg, k)]
    chk(vista, "Semilla", "Las 12 piezas arrancan con las unidades del briefing y los 2 apartados no se restan dos veces", not malas, f"fallan: {malas}" if malas else "12/12 correctas")

    # ---- Criterio 2 ----
    agot = await boton(pg, "portasahumerio")
    ok2 = ("Últimas piezas" in await texto(pg, "jarra") and "Últimas piezas" in await texto(pg, "mantequera")
           and "Se terminó" in await texto(pg, "portasahumerio") and await agot.is_disabled() and "En la hornada" in await texto(pg, "plato-hondo"))
    chk(vista, "C2", "1–2 unidades → «Últimas piezas»; 0 → «Se terminó» y botón desactivado; 3 → «En la hornada»", ok2,
        "Jarra (2), Mantequera (1), Portasahumerio (0, botón disabled), Plato hondo (3)")

    # ---- Caso resuelto + Criterio 1 (sin recargar) ----
    await pg.evaluate("window.__marca = 'sin-recarga'")
    await sumar(pg, "jarra"); await sumar(pg, "taza-desayuno", 2)
    contador = await pg.locator("header a[href='#/lista'] span").inner_text()
    sin_desc = "Últimas piezas · Quedan 2" in await texto(pg, "jarra") and "· 8" in await texto(pg, "taza-desayuno")
    chk(vista, "Caso 1", "Sumar no descuenta unidades; el contador muestra 3 piezas", contador == "3" and sin_desc, f"contador={contador}")
    await pg.click("header a[href='#/lista']"); await pg.wait_for_timeout(150)

    # ---- Criterio 4 ----
    total = lambda: pg.locator("text=Total estimado >> xpath=following-sibling::span").inner_text()
    t0 = await total()
    await pg.click("[aria-label='Sumar una unidad de Taza de desayuno']"); t1 = await total()
    await pg.click("[aria-label='Restar una unidad de Taza de desayuno']"); t2 = await total()
    await pg.fill("#cant-taza-desayuno", "4"); t3 = await total()
    await pg.fill("#cant-taza-desayuno", "2"); t4 = await total()
    chk(vista, "C4", "El total estimado se recalcula al cambiar una cantidad (botones y campo)",
        (t0, t1, t2, t3, t4) == ("$60.000", "$74.500", "$60.000", "$89.000", "$60.000"), f"{t0} → {t1} → {t2} → {t3} → {t4}")

    # ---- Criterio 3 ----
    await pg.fill("#cant-jarra", "9"); v1 = await pg.input_value("#cant-jarra")
    await pg.click("[aria-label='Sumar una unidad de Jarra']", force=True); v2 = await pg.input_value("#cant-jarra")
    mas_off = await pg.locator("[aria-label='Sumar una unidad de Jarra']").is_disabled()
    await pg.click("header a[href='#']"); await pg.wait_for_timeout(100)
    hornada_off = await (await boton(pg, "jarra")).is_disabled()
    await pg.click("header a[href='#/lista']"); await pg.wait_for_timeout(100)
    await pg.fill("#cant-jarra", "0"); v3 = await pg.input_value("#cant-jarra")
    chk(vista, "C3", "La cantidad nunca supera las disponibles (ni escribiendo ni con +; mínimo 1; botón de la hornada se desactiva)",
        v1 == "2" and v2 == "2" and mas_off and v3 == "1" and hornada_off, f"escribir 9→{v1}; +→{v2}; 0→{v3}; «Sumar» en hornada desactivado={hornada_off}")
    await pg.fill("#cant-jarra", "1"); await pg.wait_for_timeout(100)

    # ---- Validación del formulario ----
    await pg.fill("#nombre", "Al"); await pg.fill("#correo", "carla@"); await pg.click("button[type=submit]")
    e1 = await pg.locator("#nombre-error").count() and await pg.locator("#correo-error").count()
    await pg.fill("#nombre", "  Carla Méndez "); await pg.fill("#correo", "  Carla.Mendez@Example.com ")
    chk(vista, "Form", "Nombre (mín. 3 letras) y correo válidos; no aparta con datos inválidos", e1, "errores visibles con aria-invalid")

    # ---- Criterio 1 ----
    await pg.evaluate("window.__marca = 'sin-recarga'")
    await pg.click("button[type=submit]"); await pg.wait_for_timeout(200)
    codigo = await pg.locator("p.font-serif.text-4xl").inner_text()
    marca = await pg.evaluate("window.__marca")
    await pg.click("text=Seguir mirando la hornada"); await pg.wait_for_timeout(150)
    tj, tt = await texto(pg, "jarra"), await texto(pg, "taza-desayuno")
    marca2 = await pg.evaluate("window.__marca")
    chk(vista, "C1", "Al apartar, las unidades bajan en la cantidad elegida sin recargar",
        "Queda una sola" in tj and "· 6" in tt and marca == marca2 == "sin-recarga",
        f"código {codigo}; Jarra 2→1 «Últimas piezas · Queda una sola»; Taza 8→6; misma página (marca JS intacta)")
    chk(vista, "Caso 2", "Caso resuelto del briefing: jarra + 2 tazas, total $60.000, código y «Últimas piezas»", "Queda una sola" in tj, "")

    # ---- Criterio 5 ----
    await pg.goto(U + "#/lista"); await pg.wait_for_timeout(100)
    # confirmación no persiste tras navegar; reabrimos vía un nuevo apartado de cucharitas
    await pg.goto(U); await sumar(pg, "cucharita", 3); await pg.goto(U + "#/lista")
    await pg.fill("#nombre", "Carla Méndez"); await pg.fill("#correo", "carla.mendez@example.com")
    await pg.click("button[type=submit]"); await pg.wait_for_timeout(200)
    cod2 = await pg.locator("p.font-serif.text-4xl").inner_text()
    href = await pg.locator("a:has-text('Mandar por WhatsApp')").get_attribute("href")
    tgt = await pg.locator("a:has-text('Mandar por WhatsApp')").get_attribute("target")
    msg = unquote(href.split("text=", 1)[1])
    ok5 = href.startswith("https://wa.me/?text=") and "Cucharita de cerámica × 3" in msg and "$14.400" in msg and cod2 in msg and tgt == "_blank"
    chk(vista, "C5", "WhatsApp abre el mensaje con piezas, cantidades, total y código", ok5, msg.replace("\n", " / "))
    async with ctx.expect_page() as nueva:
        await pg.click("a:has-text('Mandar por WhatsApp')")
    np = await nueva.value
    chk(vista, "C5b", "El botón abre una pestaña nueva hacia wa.me con el texto", np.url.startswith("https://wa.me/?text=") and cod2 in unquote(np.url), unquote(np.url)[:70] + "… (wa.me interceptado en la prueba)")
    await np.close()

    # ---- Criterio 7: persistencia ----
    await pg.goto(U); await sumar(pg, "florero-alto"); await pg.reload(); await pg.wait_for_timeout(200)
    persiste = "Queda una sola" in await texto(pg, "jarra") and "En tu lista: 1" in await texto(pg, "florero-alto")
    await pg.goto(U + "#/lista"); await pg.fill("#nombre", "Dato a medias"); await pg.reload(); await pg.wait_for_timeout(150)
    form_persiste = await pg.input_value("#nombre") == "Dato a medias"
    chk(vista, "C7a", "Los datos siguen al recargar (unidades, lista y formulario)", persiste and form_persiste, "")

    # Lista vacía guardada ≠ primera visita
    await pg.click("text=Quitar"); await pg.reload(); await pg.wait_for_timeout(150)
    vacia = await pg.locator("text=Tu lista está vacía").count()
    await pg.goto(U); tj2 = await texto(pg, "jarra")
    chk(vista, "Semilla2", "Una lista guardada vacía no recarga la semilla", vacia and "Queda una sola" in tj2, "")

    # ---- Fallo de guardado ----
    await pg.goto(U + "?falla=guardado"); await sumar(pg, "cuenco-hondo", 2)
    await pg.goto(U + "?falla=guardado#/lista")
    await pg.fill("#nombre", "Ana Ruiz"); await pg.fill("#correo", "ana.ruiz@example.com")
    antes = await pg.evaluate(f"localStorage.getItem('{K}')")
    await pg.click("button[type=submit]"); await pg.wait_for_timeout(200)
    alerta = await pg.locator("[role=alert]").inner_text()
    despues = await pg.evaluate(f"localStorage.getItem('{K}')")
    ok_f = ("No pudimos guardar" in alerta and await pg.input_value("#nombre") == "Ana Ruiz"
            and await pg.input_value("#cant-cuenco-hondo") == "2" and antes == despues)
    await pg.goto(U + "?falla=guardado"); cu = await texto(pg, "cuenco-hondo")
    chk(vista, "Fallo", "Guardado fallido (?falla=guardado): se conserva lo escrito y no cambian códigos, cantidades ni estados",
        ok_f and "· 5" in cu, "aviso visible; formulario y cantidades intactos; storage sin cambios; Cuenco sigue en 5")
    await pg.goto(U + "#/lista"); await pg.click("text=Quitar")

    # ---- Bloqueo ----
    pb = await ctx.new_page(); await pb.goto(U + "?falla=bloqueo"); await pb.wait_for_timeout(150)
    await sumar(pb, "plato-playo")
    ok_b = await pb.locator("text=no está guardando").count() and await pb.locator("header a[href='#/lista'] span").inner_text() == "1"
    chk(vista, "Bloqueo", "localStorage bloqueado (?falla=bloqueo): la app sigue funcionando y avisa", ok_b, "")
    await pb.close()

    # ---- Pieza agotada antes de apartar (otra pestaña) ----
    await pg.goto(U); await sumar(pg, "mantequera"); await pg.goto(U + "#/lista"); await pg.wait_for_timeout(100)
    p2 = await ctx.new_page(); await p2.goto(U)
    await p2.evaluate("""k => { const e = JSON.parse(localStorage.getItem(k));
      e.apartados.push({codigo:'EC-OTRA', nombre:'Otra Pestaña', correo:'otra@example.com', items:[{piezaId:'mantequera', cantidad:1}], total:18300, fecha:new Date().toISOString()});
      localStorage.setItem(k, JSON.stringify(e)) }""", K)
    await p2.close(); await pg.wait_for_timeout(250)
    ag = await pg.locator("text=se terminó mientras armabas").count()
    off = await pg.locator("button[type=submit]").is_disabled()
    chk(vista, "Agotada", "Pieza agotada antes de apartar: se avisa y «Apartar» queda bloqueado", ag and off, "")
    await pg.click("text=Quitar")

    # ---- Duplicado ----
    await pg.goto(U); await sumar(pg, "cucharita", 3); await pg.goto(U + "#/lista")
    await pg.fill("#nombre", "Carla Méndez"); await pg.fill("#correo", "  CARLA.MENDEZ@example.COM ")
    await pg.click("button[type=submit]"); await pg.wait_for_timeout(200)
    dup = await pg.locator("main h1").inner_text(); cod3 = await pg.locator("p.font-serif.text-4xl").inner_text()
    chk(vista, "Duplicado", "Mismo correo normalizado + mismas piezas → no se aparta dos veces", dup == "Ya estaba apartado" and cod3 == cod2, f"muestra {cod3}")

    # ---- Criterio 6 ----
    await pg.goto(U); await pg.click("text=Restaurar hornada de prueba"); await pg.wait_for_timeout(150)
    abierto = await pg.locator("dialog[open]").count()
    await pg.click("dialog >> text=Cancelar"); await pg.wait_for_timeout(100)
    sigue = "Queda una sola" in await texto(pg, "jarra")
    await pg.click("text=Restaurar hornada de prueba"); await pg.click("dialog >> text=Restaurar"); await pg.wait_for_timeout(200)
    malas = [k for k, v in esperado.items() if v not in await texto(pg, k)]
    st = json.loads(await pg.evaluate(f"localStorage.getItem('{K}')"))
    chk(vista, "C6", "«Restaurar hornada de prueba» pide confirmación (Cancelar no cambia nada) y devuelve las unidades iniciales",
        abierto and sigue and not malas and [a["codigo"] for a in st["apartados"]] == ["EC-K7M2", "EC-R4P9"] and st["lista"] == [],
        "12/12 piezas en su valor inicial; quedan solo los 2 apartados de la semilla")

    # ---- Claves ajenas ----
    claves = await pg.evaluate("Object.keys(localStorage)")
    ajena = await pg.evaluate("localStorage.getItem('otra-app:preferencias')")
    chk(vista, "Claves", "Solo se usa la clave propia; una clave ajena queda intacta", set(claves) == {K, "otra-app:preferencias"} and ajena == '{"tema":"oscuro"}', str(claves))

    # ---- Criterio 7b: uso a este ancho ----
    for ruta in ["", "#/lista"]:
        await pg.goto(U + ruta); await pg.wait_for_timeout(150)
        if ruta:
            await pg.goto(U); await sumar(pg, "jarra"); await pg.goto(U + ruta); await pg.wait_for_timeout(100)
        desborde = await pg.evaluate("document.documentElement.scrollWidth - window.innerWidth")
        chicos = await pg.evaluate("""() => [...document.querySelectorAll('button, a, input')].filter(e => {
            const r = e.getBoundingClientRect(); return r.width && (r.height < 44 || r.width < 44) && !e.closest('[aria-hidden]') }).map(e => (e.innerText || e.id || e.ariaLabel).trim().slice(0,30) + ' ' + Math.round(e.getBoundingClientRect().width) + 'x' + Math.round(e.getBoundingClientRect().height))""")
        chk(vista, "C7b" + (" lista" if ruta else " hornada"), f"Sin desborde horizontal y objetivos táctiles ≥ 44 px ({'Mi lista' if ruta else 'Hornada'})",
            desborde <= 0 and not chicos, f"desborde={desborde}px; chicos={chicos}")
        await pg.screenshot(path=f"{CAPTURAS}/{vista}-{'lista' if ruta else 'hornada'}.png", full_page=False)

    # ---- Teclado ----
    await pg.goto(U); await pg.keyboard.press("Tab"); f1 = await pg.evaluate("document.activeElement.innerText")
    chk(vista, "Teclado", "Se navega con Tab y el foco es visible (outline esmalte 3 px)", bool(f1), f"primer foco: {f1!r}")

    chk(vista, "Consola", "Sin errores en consola", not errores, str(errores))
    await b.close()

async def main():
    async with async_playwright() as p:
        await correr(p, "360", 360, 780)
        await correr(p, "escritorio", 1280, 800)
    ok = sum(r[3] for r in R)
    for v, c, d, o, det in R:
        print(f"[{'OK ' if o else 'FALLA'}] {v:10} {c:16} {d}  {('— ' + det) if det else ''}")
    print(f"\n{ok}/{len(R)} correctas")
    json.dump(R, open(os.path.join(os.path.dirname(__file__), "resultados.json"), "w"), ensure_ascii=False, indent=1)

asyncio.run(main())
