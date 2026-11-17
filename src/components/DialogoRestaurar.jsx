import { useEffect, useRef, useState } from 'react'

export default function DialogoRestaurar({ abierto, onCerrar, onRestaurar }) {
  const ref = useRef(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (abierto && !d.open) {
      setError(false)
      d.showModal()
    }
    if (!abierto && d.open) d.close()
  }, [abierto])

  const confirmar = () => {
    if (onRestaurar()) onCerrar()
    else setError(true)
  }

  return (
    <dialog
      ref={ref}
      onClose={onCerrar}
      aria-labelledby="restaurar-titulo"
      aria-describedby="restaurar-texto"
      className="m-auto w-[min(100%-2.5rem,26rem)] rounded-md bg-crema p-6 text-carbon backdrop:bg-carbon/50"
    >
      <h2 id="restaurar-titulo" className="font-serif text-2xl leading-tight font-normal">
        ¿Volver a la hornada de prueba?
      </h2>
      <p id="restaurar-texto" className="mt-3 text-base leading-relaxed">
        Las piezas vuelven a sus unidades iniciales y se vacía tu lista. Se pierden los apartados que hiciste.
      </p>
      {error && (
        <p role="alert" className="mt-3 text-base font-bold text-barro">
          No pudimos restaurar la hornada. Probá de nuevo.
        </p>
      )}
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button type="button" className="btn" onClick={onCerrar} autoFocus>
          Cancelar
        </button>
        <button type="button" className="btn bg-barro text-white hover:bg-barro/90!" onClick={confirmar}>
          Restaurar
        </button>
      </div>
    </dialog>
  )
}
