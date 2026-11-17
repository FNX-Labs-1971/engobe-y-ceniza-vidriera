// Única puerta de entrada a localStorage.
// - Usa SOLO la clave CLAVE. Nunca llama a localStorage.clear() ni toca otras claves.
// - La semilla se carga solo si la clave no existe (o si guarda otra versión u otra hornada).
//   Una lista guardada vacía NO es una primera visita.
//
// Simulación de fallos por URL (ver README):
//   ?falla=guardado → fallan las escrituras importantes (Apartar y Restaurar).
//   ?falla=bloqueo  → localStorage se comporta como bloqueado (lecturas y escrituras).

import { HORNADA, APARTADOS_INICIALES } from '../data/hornada.js'

export const CLAVE = 'engobe-ceniza:vidriera:v1'
const VERSION = 1

const modoFalla = (() => {
  try {
    return new URLSearchParams(window.location.search).get('falla')
  } catch {
    return null
  }
})()

export function estadoSemilla() {
  return {
    version: VERSION,
    hornadaId: HORNADA.id,
    apartados: structuredClone(APARTADOS_INICIALES),
    lista: [],
    formulario: { nombre: '', correo: '' },
  }
}

function esEstadoValido(e) {
  return (
    e &&
    e.version === VERSION &&
    e.hornadaId === HORNADA.id &&
    Array.isArray(e.apartados) &&
    Array.isArray(e.lista) &&
    e.formulario &&
    typeof e.formulario.nombre === 'string' &&
    typeof e.formulario.correo === 'string'
  )
}

function leerCrudo() {
  if (modoFalla === 'bloqueo') throw new Error('Almacenamiento bloqueado (simulado)')
  return window.localStorage.getItem(CLAVE)
}

/**
 * Guarda el estado completo bajo la clave propia.
 * @param {object} estado
 * @param {{critico?: boolean}} opciones critico = Apartar o Restaurar.
 * @returns {boolean} true si quedó guardado.
 */
export function guardar(estado, { critico = false } = {}) {
  try {
    if (modoFalla === 'bloqueo') throw new Error('Almacenamiento bloqueado (simulado)')
    if (modoFalla === 'guardado' && critico) throw new Error('Guardado fallido (simulado)')
    window.localStorage.setItem(CLAVE, JSON.stringify(estado))
    return true
  } catch (error) {
    console.warn('[vidriera] No se pudo guardar:', error.message)
    return false
  }
}

/**
 * Lee el estado guardado o carga la semilla si la clave no existe.
 * @returns {{estado: object, disponible: boolean}} disponible=false si localStorage no responde.
 */
export function cargar() {
  let crudo
  try {
    crudo = leerCrudo()
  } catch (error) {
    console.warn('[vidriera] localStorage no disponible:', error.message)
    return { estado: estadoSemilla(), disponible: false }
  }

  if (crudo !== null) {
    try {
      const estado = JSON.parse(crudo)
      if (esEstadoValido(estado)) return { estado, disponible: true }
    } catch {
      // JSON roto: se reemplaza por la semilla (la clave es nuestra).
    }
  }

  const estado = estadoSemilla()
  const disponible = guardar(estado)
  return { estado, disponible }
}

/** Relee solo los apartados guardados (pueden haber cambiado en otra pestaña). */
export function leerApartadosGuardados() {
  try {
    const crudo = leerCrudo()
    if (crudo === null) return null
    const estado = JSON.parse(crudo)
    return esEstadoValido(estado) ? estado.apartados : null
  } catch {
    return null
  }
}

export const simulacion = modoFalla
