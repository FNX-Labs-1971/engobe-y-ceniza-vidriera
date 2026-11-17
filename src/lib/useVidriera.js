import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { HORNADA } from '../data/hornada.js'
import { CLAVE, cargar, estadoSemilla, guardar, leerApartadosGuardados } from './almacenamiento.js'
import {
  buscarDuplicado,
  calcularDisponibles,
  cantidadDe,
  errorCorreo,
  errorNombre,
  generarCodigo,
  normalizarCorreo,
  problemasDeStock,
  totalDe,
} from './reglas.js'

/**
 * Estado de la vidriera. Todo cambio pasa por acá.
 * - Borradores (lista y formulario): se guardan al momento; si falla, se avisa y se sigue en memoria.
 * - Apartar y Restaurar: primero se guarda y recién después se cambia la pantalla.
 *   Si el guardado falla, nada cambia (ni códigos, ni cantidades, ni estados).
 */
export function useVidriera() {
  const [inicial] = useState(cargar)
  const [estado, setEstado] = useState(inicial.estado)
  const [almacenamientoOk, setAlmacenamientoOk] = useState(inicial.disponible)
  // Copia del último estado para los manejadores (evita cierres con datos viejos).
  const estadoRef = useRef(estado)
  useEffect(() => {
    estadoRef.current = estado
  }, [estado])

  const disponibles = useMemo(() => calcularDisponibles(estado.apartados), [estado.apartados])

  // Cambios de borrador: se aplican siempre; el guardado es "mejor esfuerzo".
  const actualizarBorrador = useCallback((cambio) => {
    const nuevo = cambio(estadoRef.current)
    estadoRef.current = nuevo
    setEstado(nuevo)
    setAlmacenamientoOk(guardar(nuevo))
  }, [])

  // Otra pestaña apartó o restauró: sincronizamos los apartados.
  useEffect(() => {
    const alCambiar = (e) => {
      if (e.key !== CLAVE || e.newValue === null) return
      const apartados = leerApartadosGuardados()
      if (apartados) setEstado((prev) => ({ ...prev, apartados }))
    }
    window.addEventListener('storage', alCambiar)
    return () => window.removeEventListener('storage', alCambiar)
  }, [])

  const enLista = useCallback(
    (piezaId) => estado.lista.find((i) => i.piezaId === piezaId)?.cantidad ?? 0,
    [estado.lista],
  )

  const sumar = useCallback(
    (piezaId) => {
      const ya = estadoRef.current.lista.find((i) => i.piezaId === piezaId)?.cantidad ?? 0
      if (ya >= disponibles[piezaId]) return false
      actualizarBorrador((e) => ({
        ...e,
        lista: ya
          ? e.lista.map((i) => (i.piezaId === piezaId ? { ...i, cantidad: i.cantidad + 1 } : i))
          : [...e.lista, { piezaId, cantidad: 1 }],
      }))
      return true
    },
    [actualizarBorrador, disponibles],
  )

  const cambiarCantidad = useCallback(
    (piezaId, cantidad) => {
      const max = Math.max(1, disponibles[piezaId])
      const n = Math.min(max, Math.max(1, Math.round(Number(cantidad) || 1)))
      actualizarBorrador((e) => ({
        ...e,
        lista: e.lista.map((i) => (i.piezaId === piezaId ? { ...i, cantidad: n } : i)),
      }))
    },
    [actualizarBorrador, disponibles],
  )

  const quitar = useCallback(
    (piezaId) => actualizarBorrador((e) => ({ ...e, lista: e.lista.filter((i) => i.piezaId !== piezaId) })),
    [actualizarBorrador],
  )

  const cambiarFormulario = useCallback(
    (campo, valor) => actualizarBorrador((e) => ({ ...e, formulario: { ...e.formulario, [campo]: valor } })),
    [actualizarBorrador],
  )

  /** @returns {{tipo: 'exito'|'invalido'|'stock'|'duplicado'|'error-guardado'|'vacia', apartado?, problemas?, errores?}} */
  const apartar = useCallback(() => {
    const e = estadoRef.current
    if (e.lista.length === 0) return { tipo: 'vacia' }

    const errores = { nombre: errorNombre(e.formulario.nombre), correo: errorCorreo(e.formulario.correo) }
    if (errores.nombre || errores.correo) return { tipo: 'invalido', errores }

    // Releer lo guardado: otra pestaña pudo apartar piezas mientras tanto.
    const apartadosActuales = leerApartadosGuardados() ?? e.apartados
    if (apartadosActuales !== e.apartados) setEstado((prev) => ({ ...prev, apartados: apartadosActuales }))

    const problemas = problemasDeStock(e.lista, calcularDisponibles(apartadosActuales))
    if (problemas.length) return { tipo: 'stock', problemas }

    const duplicado = buscarDuplicado(apartadosActuales, e.formulario.correo, e.lista)
    if (duplicado) return { tipo: 'duplicado', apartado: duplicado }

    const apartado = {
      codigo: generarCodigo(apartadosActuales),
      nombre: e.formulario.nombre.trim(),
      correo: normalizarCorreo(e.formulario.correo),
      items: e.lista.map(({ piezaId, cantidad }) => ({ piezaId, cantidad })),
      total: totalDe(e.lista),
      fecha: new Date().toISOString(),
    }
    const nuevo = { ...e, apartados: [...apartadosActuales, apartado], lista: [] }

    if (!guardar(nuevo, { critico: true })) return { tipo: 'error-guardado' }

    estadoRef.current = nuevo
    setEstado(nuevo)
    setAlmacenamientoOk(true)
    return { tipo: 'exito', apartado }
  }, [])

  const restaurar = useCallback(() => {
    const nuevo = { ...estadoSemilla(), formulario: estadoRef.current.formulario }
    if (!guardar(nuevo, { critico: true })) return false
    estadoRef.current = nuevo
    setEstado(nuevo)
    setAlmacenamientoOk(true)
    return true
  }, [])

  return {
    hornada: HORNADA,
    lista: estado.lista,
    formulario: estado.formulario,
    disponibles,
    almacenamientoOk,
    piezasEnLista: cantidadDe(estado.lista),
    total: totalDe(estado.lista),
    enLista,
    sumar,
    cambiarCantidad,
    quitar,
    cambiarFormulario,
    apartar,
    restaurar,
  }
}
