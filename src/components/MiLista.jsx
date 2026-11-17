import { useRef, useState } from 'react'
import { PIEZAS_POR_ID } from '../data/hornada.js'
import { enlaceWhatsApp, errorCorreo, errorNombre, mensajeWhatsApp, pesos } from '../lib/reglas.js'
import { simulacion } from '../lib/almacenamiento.js'
import Silueta from './Silueta.jsx'

function Encabezado({ titulo }) {
  return (
    <div className="flex flex-col gap-1 pt-6">
      <a
        href="#"
        className="inline-flex min-h-11 items-center self-start text-[15px] text-carbon underline underline-offset-2"
      >
        Volver a la hornada
      </a>
      <h1 className="font-serif text-[40px] leading-none font-light text-carbon">{titulo}</h1>
    </div>
  )
}

function Confirmacion({ confirmacion, nombreHornada, onCerrar }) {
  const { apartado, duplicado } = confirmacion
  const texto = mensajeWhatsApp(apartado, nombreHornada)
  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 px-5 pb-12">
      <Encabezado titulo={duplicado ? 'Ya estaba apartado' : 'Apartado'} />
      <div role="status" className="flex flex-col gap-2">
        <p className="text-[17px] leading-normal">
          {duplicado
            ? 'Ya habías apartado estas mismas piezas con este correo. No las apartamos otra vez.'
            : `Listo, ${apartado.nombre}. Estas piezas quedan guardadas para vos. El pago se arregla en el taller.`}
        </p>
      </div>

      <div className="papel flex flex-col gap-3 rounded-[3px] px-5 py-5 shadow-[0_1px_0_var(--color-arena),0_5px_12px_rgba(58,53,49,.12)]">
        <p className="text-[15px]">Tu código</p>
        <p className="font-serif text-4xl font-semibold tracking-wide text-barro">{apartado.codigo}</p>
        <ul className="flex flex-col gap-1 border-t border-arena pt-3">
          {apartado.items.map(({ piezaId, cantidad }) => {
            const p = PIEZAS_POR_ID[piezaId]
            return (
              <li key={piezaId} className="flex justify-between gap-3 text-[15px]">
                <span>
                  {p.nombre} × {cantidad}
                </span>
                <span>{pesos(p.precio * cantidad)}</span>
              </li>
            )
          })}
        </ul>
        <p className="flex justify-between border-t border-arena pt-3 font-bold">
          <span>Total estimado</span>
          <span className="font-serif text-xl">{pesos(apartado.total)}</span>
        </p>
      </div>

      <p className="text-[15px] leading-normal">
        Mandale tu lista al taller por WhatsApp. El mensaje ya va armado con las piezas, el total y tu código.
      </p>
      <div className="flex flex-col items-center gap-3">
        <a className="btn w-3/4" href={enlaceWhatsApp(texto)} target="_blank" rel="noopener noreferrer">
          Mandar por WhatsApp
        </a>
        <a className="btn w-3/4" href="#" onClick={onCerrar}>
          Seguir mirando la hornada
        </a>
      </div>
    </main>
  )
}

function Fila({ item, disponibles, onCantidad, onQuitar }) {
  const p = PIEZAS_POR_ID[item.piezaId]
  const agotada = disponibles === 0
  const excede = item.cantidad > disponibles
  const idCant = `cant-${p.id}`

  return (
    <li className="flex flex-col gap-3 border-b border-arena py-5">
      <div className="flex gap-4">
        <div
          className={`hormigon flex h-20 w-20 flex-none items-center justify-center rounded-[3px] text-crema ${agotada ? 'opacity-55' : ''}`}
        >
          <Silueta id={p.id} className="h-16 w-16" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h2 className="font-serif text-lg leading-tight font-medium">{p.nombre}</h2>
          {p.medida && <span className="text-sm">{p.medida}</span>}
          <span className="text-sm">{pesos(p.precio)} c/u</span>
        </div>
        <span className="font-serif text-lg font-semibold">{pesos(p.precio * item.cantidad)}</span>
      </div>

      {excede && (
        <p role="alert" className="text-[15px] font-bold text-barro">
          {agotada
            ? 'Esta pieza se terminó mientras armabas tu lista. Quitala para poder apartar.'
            : `Ahora ${disponibles === 1 ? 'queda una sola' : `quedan ${disponibles}`}. Bajá la cantidad para poder apartar.`}
        </p>
      )}

      <div className="flex items-center justify-between gap-3">
        {agotada ? (
          <span className="text-[15px] line-through">Se terminó</span>
        ) : (
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="btn h-11 min-h-11 w-11 px-0 text-xl"
              aria-label={`Restar una unidad de ${p.nombre}`}
              disabled={item.cantidad <= 1}
              onClick={() => onCantidad(p.id, item.cantidad - 1)}
            >
              −
            </button>
            <label htmlFor={idCant} className="sr-only">
              Cantidad de {p.nombre}
            </label>
            <input
              id={idCant}
              type="number"
              inputMode="numeric"
              min={1}
              max={disponibles}
              value={item.cantidad}
              onChange={(e) => onCantidad(p.id, e.target.value)}
              className="h-11 w-14 rounded-md border-2 border-carbon/60 bg-white text-center text-lg font-bold"
            />
            <button
              type="button"
              className="btn h-11 min-h-11 w-11 px-0 text-xl"
              aria-label={`Sumar una unidad de ${p.nombre}`}
              disabled={item.cantidad >= disponibles}
              onClick={() => onCantidad(p.id, item.cantidad + 1)}
            >
              +
            </button>
          </div>
        )}
        <button
          type="button"
          onClick={() => onQuitar(p.id)}
          className="min-h-11 cursor-pointer px-2 text-[15px] text-carbon underline underline-offset-2"
        >
          Quitar
        </button>
      </div>
      {!agotada && !excede && (
        <p className="text-sm">
          {disponibles === 1 ? 'Es la única de la hornada.' : `Hay ${disponibles} en la hornada.`}
        </p>
      )}
    </li>
  )
}

export default function MiLista({ vidriera, confirmacion, onConfirmar, onCerrarConfirmacion }) {
  const { lista, formulario, disponibles, total, hornada, almacenamientoOk } = vidriera
  const [errores, setErrores] = useState({ nombre: '', correo: '' })
  const [aviso, setAviso] = useState(null) // {tono: 'error'|'info', texto}
  const avisoRef = useRef(null)

  if (confirmacion) {
    return <Confirmacion confirmacion={confirmacion} nombreHornada={hornada.nombre} onCerrar={onCerrarConfirmacion} />
  }

  if (lista.length === 0) {
    return (
      <main className="mx-auto flex max-w-xl flex-col gap-6 px-5 pb-12">
        <Encabezado titulo="Mi lista" />
        <p className="text-[17px] leading-normal">Tu lista está vacía. Mirá la hornada y sumá lo que te guste.</p>
        <a href="#" className="btn w-3/4 self-center">
          Ver la hornada
        </a>
      </main>
    )
  }

  const hayProblemas = lista.some((i) => i.cantidad > disponibles[i.piezaId])

  const mostrarAviso = (a) => {
    setAviso(a)
    requestAnimationFrame(() => avisoRef.current?.focus())
  }

  const enviar = (e) => {
    e.preventDefault()
    const r = vidriera.apartar()
    if (r.tipo === 'invalido') {
      setErrores(r.errores)
      setAviso(null)
      document.getElementById(r.errores.nombre ? 'nombre' : 'correo')?.focus()
      return
    }
    setErrores({ nombre: '', correo: '' })
    if (r.tipo === 'stock') {
      mostrarAviso({
        tono: 'error',
        texto: 'Algunas piezas cambiaron mientras armabas tu lista. Revisalas antes de apartar.',
      })
    } else if (r.tipo === 'error-guardado') {
      mostrarAviso({ tono: 'error', texto: 'No pudimos guardar tu apartado. Tus datos siguen acá: probá de nuevo.' })
    } else if (r.tipo === 'duplicado') {
      onConfirmar({ apartado: r.apartado, duplicado: true })
    } else if (r.tipo === 'exito') {
      onConfirmar({ apartado: r.apartado, duplicado: false })
    }
  }

  const validarCampo = (campo) => {
    const v = formulario[campo]
    if (!v) return
    setErrores((prev) => ({ ...prev, [campo]: campo === 'nombre' ? errorNombre(v) : errorCorreo(v) }))
  }

  const campo = (id, etiqueta, props) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[15px] font-bold">
        {etiqueta}
      </label>
      <input
        id={id}
        value={formulario[id]}
        onChange={(e) => {
          vidriera.cambiarFormulario(id, e.target.value)
          if (errores[id]) setErrores((prev) => ({ ...prev, [id]: '' }))
        }}
        onBlur={() => validarCampo(id)}
        aria-invalid={errores[id] ? 'true' : undefined}
        aria-describedby={errores[id] ? `${id}-error` : undefined}
        className="h-12 rounded-md border-2 border-carbon/60 bg-white px-3 text-base aria-invalid:border-barro"
        {...props}
      />
      {errores[id] && (
        <p id={`${id}-error`} className="text-sm font-bold text-barro">
          {errores[id]}
        </p>
      )}
    </div>
  )

  return (
    <main className="mx-auto flex max-w-xl flex-col px-5 pb-12">
      <Encabezado titulo="Mi lista" />

      <ul className="mt-4 flex flex-col border-t border-arena">
        {lista.map((item) => (
          <Fila
            key={item.piezaId}
            item={item}
            disponibles={disponibles[item.piezaId]}
            onCantidad={vidriera.cambiarCantidad}
            onQuitar={vidriera.quitar}
          />
        ))}
      </ul>

      <div className="flex items-baseline justify-between py-5" aria-live="polite">
        <span className="text-[17px] font-bold">Total estimado</span>
        <span className="font-serif text-[28px] font-semibold">{pesos(total)}</span>
      </div>
      <p className="-mt-3 text-sm">Apartar no cobra nada: el pago se arregla en el taller.</p>

      <form onSubmit={enviar} noValidate className="mt-8 flex flex-col gap-4">
        <h2 className="font-serif text-2xl font-normal">Tus datos</h2>
        {campo('nombre', 'Nombre', { autoComplete: 'name', type: 'text' })}
        {campo('correo', 'Correo', { autoComplete: 'email', type: 'email', inputMode: 'email', spellCheck: false })}

        {!almacenamientoOk && (
          <p className="text-sm">
            Este navegador no está guardando los cambios. Tu lista sigue acá mientras no cierres la página.
          </p>
        )}
        {simulacion && <p className="text-sm">Modo de prueba activo: ?falla={simulacion}</p>}
        {aviso && (
          <p
            ref={avisoRef}
            tabIndex={-1}
            role="alert"
            className="rounded-md border-2 border-barro bg-white px-4 py-3 text-[15px] font-bold text-barro"
          >
            {aviso.texto}
          </p>
        )}

        <button type="submit" className="btn mt-2 w-3/4 self-center" disabled={hayProblemas}>
          Apartar
        </button>
        {hayProblemas && <p className="text-center text-sm">Ajustá las piezas marcadas para poder apartar.</p>}
      </form>
    </main>
  )
}
