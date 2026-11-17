import { PIEZAS, PIEZAS_POR_ID } from '../data/hornada.js'

export function apartadasPorPieza(apartados) {
  const mapa = {}
  for (const a of apartados) {
    for (const { piezaId, cantidad } of a.items) {
      mapa[piezaId] = (mapa[piezaId] ?? 0) + cantidad
    }
  }
  return mapa
}

/** Disponibles de cada pieza = total − apartado. Nunca negativo. */
export function calcularDisponibles(apartados) {
  const apartadas = apartadasPorPieza(apartados)
  return Object.fromEntries(PIEZAS.map((p) => [p.id, Math.max(0, p.total - (apartadas[p.id] ?? 0))]))
}

export function etiquetaDe(disponibles) {
  if (disponibles >= 3) return 'En la hornada'
  if (disponibles >= 1) return 'Últimas piezas'
  return 'Se terminó'
}

export function detalleDe(disponibles) {
  if (disponibles === 1) return 'Queda una sola'
  if (disponibles === 2) return 'Quedan 2'
  if (disponibles >= 3) return `Quedan ${disponibles}`
  return ''
}

const formatoNumero = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 })
export const pesos = (n) => `$${formatoNumero.format(n)}`

export function totalDe(items) {
  return items.reduce((suma, { piezaId, cantidad }) => suma + PIEZAS_POR_ID[piezaId].precio * cantidad, 0)
}

export function cantidadDe(items) {
  return items.reduce((suma, { cantidad }) => suma + cantidad, 0)
}

// --- Formulario ---------------------------------------------------------

export const normalizarCorreo = (correo) => correo.trim().toLowerCase()

export function errorNombre(nombre) {
  const letras = (nombre.trim().match(/\p{L}/gu) ?? []).length
  if (!nombre.trim()) return 'Escribí tu nombre.'
  if (letras < 3) return 'El nombre tiene que tener al menos 3 letras.'
  return ''
}

export function errorCorreo(correo) {
  const c = normalizarCorreo(correo)
  if (!c) return 'Escribí tu correo.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c)) return 'Revisá el correo: falta algo, por ejemplo nombre@example.com.'
  return ''
}

// --- Apartados ----------------------------------------------------------

const firmaItems = (items) =>
  items
    .map(({ piezaId, cantidad }) => `${piezaId}:${cantidad}`)
    .sort()
    .join('|')

/**
 * Duplicado = mismo correo (sin espacios en los extremos, en minúsculas)
 * + mismas piezas con las mismas cantidades, en la misma hornada.
 */
export function buscarDuplicado(apartados, correo, items) {
  const c = normalizarCorreo(correo)
  const firma = firmaItems(items)
  return apartados.find((a) => normalizarCorreo(a.correo) === c && firmaItems(a.items) === firma) ?? null
}

const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // sin 0/O ni 1/I
export function generarCodigo(apartados) {
  const usados = new Set(apartados.map((a) => a.codigo))
  for (;;) {
    const bytes = crypto.getRandomValues(new Uint8Array(4))
    const codigo = 'EC-' + Array.from(bytes, (b) => ALFABETO[b % ALFABETO.length]).join('')
    if (!usados.has(codigo)) return codigo
  }
}

/** Piezas de la lista que ya no alcanzan. */
export function problemasDeStock(lista, disponibles) {
  return lista
    .filter(({ piezaId, cantidad }) => cantidad > disponibles[piezaId])
    .map(({ piezaId, cantidad }) => ({ piezaId, cantidad, disponibles: disponibles[piezaId] }))
}

export function mensajeWhatsApp(apartado, nombreHornada) {
  const lineas = apartado.items.map(({ piezaId, cantidad }) => {
    const p = PIEZAS_POR_ID[piezaId]
    const medida = p.medida ? ` (${p.medida})` : ''
    return `• ${p.nombre}${medida} × ${cantidad}: ${pesos(p.precio * cantidad)}`
  })
  return [
    `¡Hola, Engobe y Ceniza! Aparté estas piezas de la ${nombreHornada}:`,
    ...lineas,
    `Total estimado: ${pesos(apartado.total)}`,
    `Código: ${apartado.codigo}`,
    `Nombre: ${apartado.nombre}`,
  ].join('\n')
}

export const enlaceWhatsApp = (texto) => `https://wa.me/?text=${encodeURIComponent(texto)}`
