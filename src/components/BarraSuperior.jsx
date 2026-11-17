export default function BarraSuperior({ piezas, pantalla }) {
  const etiqueta = piezas === 1 ? '1 pieza' : `${piezas} piezas`
  return (
    <header className="sticky top-0 z-20 bg-barro">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 py-2.5 pr-4 pl-5">
        <a href="#" className="inline-flex min-h-11 items-center font-serif text-[19px] text-crema no-underline">
          Engobe y Ceniza
        </a>
        <a
          href="#/lista"
          aria-current={pantalla === 'lista' ? 'page' : undefined}
          aria-label={`Mi lista, ${etiqueta}`}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-crema py-0 pr-2 pl-4 text-[15px] font-bold text-crema no-underline aria-[current=page]:bg-crema/15"
        >
          Mi lista
          <span
            aria-live="polite"
            className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-crema px-1.5 text-sm text-barro"
          >
            {piezas}
          </span>
        </a>
      </div>
    </header>
  )
}
