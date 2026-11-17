import Silueta from './Silueta.jsx'
import { detalleDe, etiquetaDe, pesos } from '../lib/reglas.js'

const GIROS = ['-rotate-2', 'rotate-[1.5deg]', '-rotate-1']

export default function TarjetaPieza({ pieza, disponibles, enLista, indice, onSumar }) {
  const agotada = disponibles === 0
  const etiqueta = etiquetaDe(disponibles)
  const completa = !agotada && enLista >= disponibles

  let estado
  if (agotada) {
    estado = <span className="text-[13px] font-bold text-carbon line-through">Se terminó</span>
  } else if (disponibles <= 2) {
    estado = (
      <span className="text-[13px] font-bold text-barro">
        {etiqueta} · {detalleDe(disponibles)}
      </span>
    )
  } else {
    estado = (
      <span className="text-[13px] font-bold text-carbon">
        {etiqueta} · {disponibles}
      </span>
    )
  }

  let textoBoton = 'Sumar a mi lista'
  if (agotada) textoBoton = 'Se terminó'
  else if (completa) textoBoton = disponibles === 1 ? 'Ya está en tu lista' : 'Ya sumaste todas'

  return (
    <article className="flex flex-col" aria-labelledby={`pieza-${pieza.id}`}>
      <div
        className={`hormigon -mx-5 flex h-60 items-center justify-center text-crema md:mx-0 md:rounded-[3px] ${agotada ? 'opacity-55' : ''}`}
      >
        <Silueta id={pieza.id} className="h-40 w-40" />
      </div>

      <div
        className={`papel relative -mt-[30px] flex w-[216px] flex-col gap-1 self-center rounded-[3px] px-4 pt-5 pb-3.5 shadow-[0_1px_0_var(--color-arena),0_5px_12px_rgba(58,53,49,.12)] ${GIROS[indice % 3]}`}
      >
        <span
          aria-hidden="true"
          className={`absolute top-2 left-1/2 -ml-1 h-2 w-2 rounded-full ${agotada ? 'bg-arena' : 'bg-barro'}`}
        />
        <h3 id={`pieza-${pieza.id}`} className="mt-1.5 font-serif text-[19px] leading-tight font-medium text-carbon">
          {pieza.nombre}
        </h3>
        <div className="flex items-baseline justify-between">
          {pieza.medida && <span className="text-sm text-carbon">{pieza.medida}</span>}
          <span className="ml-auto font-serif text-lg font-semibold text-carbon">{pesos(pieza.precio)}</span>
        </div>
        {estado}
      </div>

      <div className="flex flex-col items-center gap-2 pt-[18px]">
        <button type="button" className="btn w-3/4" disabled={agotada || completa} onClick={() => onSumar(pieza)}>
          {textoBoton}
        </button>
        {enLista > 0 && (
          <a
            href="#/lista"
            className="inline-flex min-h-11 items-center text-sm text-carbon underline underline-offset-2"
          >
            En tu lista: {enLista}
          </a>
        )}
      </div>
    </article>
  )
}
