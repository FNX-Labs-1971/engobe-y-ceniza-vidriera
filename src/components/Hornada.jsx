import { LINEAS, PIEZAS } from '../data/hornada.js'
import TarjetaPieza from './TarjetaPieza.jsx'

const formatoFecha = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

// «Hornada de otoño» → ['Hornada', 'de otoño']
function partirTitulo(nombre) {
  const i = nombre.indexOf(' de ')
  return i > 0 ? [nombre.slice(0, i), nombre.slice(i + 1)] : [nombre]
}

export default function Hornada({ vidriera, onSumar, onRestaurar }) {
  const { hornada, disponibles, enLista } = vidriera

  return (
    <main className="mx-auto max-w-6xl">
      <div className="flex flex-col gap-3 px-5 pt-8 pb-6">
        <h1 className="font-serif text-5xl leading-[.98] font-light text-carbon">
          {partirTitulo(hornada.nombre).map((linea) => (
            <span key={linea} className="block">
              {linea}
            </span>
          ))}
        </h1>
        {hornada.fecha && (
          <p className="text-[15px] font-bold text-carbon">
            Horneada el {formatoFecha.format(new Date(`${hornada.fecha}T00:00:00Z`))}
          </p>
        )}
        <p className="max-w-xl text-[17px] leading-normal text-carbon">
          Lo que salió del horno, contado pieza por pieza. Sumá lo que te guste a tu lista y apartalo.
        </p>
        <nav aria-label="Líneas de la hornada" className="grid max-w-xl grid-cols-3 gap-2 pt-2">
          {LINEAS.map((l) => (
            <a key={l.id} href={`#${l.id}`} className="btn min-h-11 px-1.5 text-[15px]">
              {l.nombre}
            </a>
          ))}
        </nav>
      </div>

      {LINEAS.map((linea) => {
        const piezas = PIEZAS.filter((p) => p.linea === linea.id)
        return (
          <section
            key={linea.id}
            id={linea.id}
            aria-labelledby={`linea-${linea.id}`}
            className="flex scroll-mt-16 flex-col gap-10 px-5 pt-2 pb-6"
          >
            <div className="flex flex-col border-t border-arena pt-6">
              <h2 id={`linea-${linea.id}`} className="font-serif text-[28px] font-normal text-carbon">
                {linea.nombre}
              </h2>
              <span aria-hidden="true" className="my-[5px] block h-1 w-[50px] bg-arena" />
              <p className="text-[15px] text-carbon">{linea.descripcion}</p>
            </div>
            <div className="grid gap-10 md:grid-cols-2 md:gap-x-8 lg:grid-cols-3">
              {piezas.map((p, i) => (
                <TarjetaPieza
                  key={p.id}
                  pieza={p}
                  indice={i + LINEAS.indexOf(linea)}
                  disponibles={disponibles[p.id]}
                  enLista={enLista(p.id)}
                  onSumar={onSumar}
                />
              ))}
            </div>
          </section>
        )
      })}

      <footer className="flex flex-col items-center gap-2 px-5 pt-10 pb-12">
        <p className="text-sm text-carbon">Precios y unidades de prueba.</p>
        <button
          type="button"
          onClick={onRestaurar}
          className="min-h-11 cursor-pointer px-3 text-sm text-carbon underline underline-offset-2"
        >
          Restaurar hornada de prueba
        </button>
      </footer>
    </main>
  )
}
