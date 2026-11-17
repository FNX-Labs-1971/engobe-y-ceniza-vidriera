import { useEffect, useRef, useState } from 'react'
import { useVidriera } from './lib/useVidriera.js'
import BarraSuperior from './components/BarraSuperior.jsx'
import Hornada from './components/Hornada.jsx'
import MiLista from './components/MiLista.jsx'
import DialogoRestaurar from './components/DialogoRestaurar.jsx'

const pantallaDesdeHash = () => (window.location.hash === '#/lista' ? 'lista' : 'hornada')

export default function App() {
  const vidriera = useVidriera()
  const [pantalla, setPantalla] = useState(pantallaDesdeHash)
  const [confirmacion, setConfirmacion] = useState(null)
  const [restaurando, setRestaurando] = useState(false)
  const [nota, setNota] = useState('')
  const temporizador = useRef(null)

  useEffect(() => {
    const alCambiar = () => {
      const nueva = pantallaDesdeHash()
      setNota('')
      setPantalla((prev) => {
        if (prev !== nueva) window.scrollTo(0, 0)
        return nueva
      })
    }
    window.addEventListener('hashchange', alCambiar)
    return () => window.removeEventListener('hashchange', alCambiar)
  }, [])

  const avisar = (texto) => {
    setNota(texto)
    clearTimeout(temporizador.current)
    temporizador.current = setTimeout(() => setNota(''), 3500)
  }

  const sumar = (pieza) => {
    if (vidriera.sumar(pieza.id)) avisar(`Sumaste ${pieza.nombre} a tu lista.`)
  }

  const restaurar = () => {
    const ok = vidriera.restaurar()
    if (ok) {
      setConfirmacion(null)
      avisar('La hornada de prueba volvió a sus unidades iniciales.')
    }
    return ok
  }

  return (
    <>
      <BarraSuperior piezas={vidriera.piezasEnLista} pantalla={pantalla} />

      {!vidriera.almacenamientoOk && pantalla === 'hornada' && (
        <p className="bg-arena px-5 py-3 text-sm text-carbon">
          Este navegador no está guardando los cambios. Tu lista sigue acá mientras no cierres la página.
        </p>
      )}

      <div>
        {pantalla === 'lista' ? (
          <MiLista
            vidriera={vidriera}
            confirmacion={confirmacion}
            onConfirmar={(c) => {
              setConfirmacion(c)
              window.scrollTo(0, 0)
            }}
            onCerrarConfirmacion={() => setConfirmacion(null)}
          />
        ) : (
          <Hornada vidriera={vidriera} onSumar={sumar} onRestaurar={() => setRestaurando(true)} />
        )}
      </div>

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center px-4">
        {nota && (
          <p className="pointer-events-auto rounded-full bg-carbon px-5 py-3 text-[15px] font-bold text-crema shadow-lg">
            {nota}
          </p>
        )}
      </div>

      <DialogoRestaurar abierto={restaurando} onCerrar={() => setRestaurando(false)} onRestaurar={restaurar} />
    </>
  )
}
