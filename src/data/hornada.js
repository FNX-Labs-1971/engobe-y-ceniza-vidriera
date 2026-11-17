// Hornada de prueba. TODOS los datos de este archivo son sintéticos.
//
// Para cargar una hornada nueva: cambiá `id`, `nombre`, `fecha`, las piezas y
// `apartadosIniciales`. Al cambiar `id`, la app trata los datos guardados de la
// hornada anterior como viejos y carga esta semilla (ver README).
//
// `total` = unidades físicas que salieron del horno.
// Las unidades disponibles NO se guardan: se calculan como
// total − suma de lo apartado (incluidos los apartados de la semilla).

export const HORNADA = {
  id: 'otono-2026',
  nombre: 'Hornada de otoño',
  // Fecha de horneado: pendiente de confirmar por Kodarvia. Formato 'AAAA-MM-DD' o null.
  fecha: null,
}

export const LINEAS = [
  { id: 'ceniza', nombre: 'Ceniza', descripcion: 'Gres con esmalte de ceniza' },
  { id: 'engobe', nombre: 'Engobe', descripcion: 'Terracota con engobe blanco' },
  { id: 'torno-libre', nombre: 'Torno libre', descripcion: 'Formas sacadas a mano en el torno' },
]

// precio en pesos argentinos, sin decimales. medida: '' si no se informa.
export const PIEZAS = [
  { id: 'taza-desayuno', linea: 'ceniza', nombre: 'Taza de desayuno', medida: '300 ml', precio: 14500, total: 10 },
  { id: 'cuenco-hondo', linea: 'ceniza', nombre: 'Cuenco hondo', medida: '900 ml', precio: 22000, total: 5 },
  { id: 'plato-playo', linea: 'ceniza', nombre: 'Plato playo', medida: '26 cm', precio: 19800, total: 6 },
  { id: 'plato-hondo', linea: 'ceniza', nombre: 'Plato hondo', medida: '20 cm', precio: 17500, total: 4 },
  { id: 'maceta-colgante', linea: 'engobe', nombre: 'Maceta colgante', medida: '14 cm', precio: 16900, total: 4 },
  { id: 'jarra', linea: 'engobe', nombre: 'Jarra', medida: '1 litro', precio: 31000, total: 2 },
  { id: 'mantequera', linea: 'engobe', nombre: 'Mantequera con tapa', medida: '', precio: 18300, total: 1 },
  { id: 'portasahumerio', linea: 'engobe', nombre: 'Portasahumerio', medida: '', precio: 9200, total: 2 },
  { id: 'florero-alto', linea: 'torno-libre', nombre: 'Florero alto', medida: '28 cm', precio: 38500, total: 2 },
  { id: 'fuente-ovalada', linea: 'torno-libre', nombre: 'Fuente ovalada', medida: '34 cm', precio: 42000, total: 2 },
  { id: 'pocillos', linea: 'torno-libre', nombre: 'Juego de 4 pocillos', medida: '', precio: 36000, total: 3 },
  { id: 'cucharita', linea: 'torno-libre', nombre: 'Cucharita de cerámica', medida: '', precio: 4800, total: 12 },
]

// Dos apartados sintéticos. Con ellos, las disponibles quedan exactamente
// como indica el briefing (Taza 8, Plato hondo 3, Portasahumerio 0, Fuente 1…).
export const APARTADOS_INICIALES = [
  {
    codigo: 'EC-K7M2',
    nombre: 'Lucía Ferrante',
    correo: 'lucia.ferrante@example.com',
    items: [
      { piezaId: 'portasahumerio', cantidad: 2 },
      { piezaId: 'taza-desayuno', cantidad: 2 },
    ],
    total: 47400,
    fecha: '2026-11-10T11:20:00.000Z',
  },
  {
    codigo: 'EC-R4P9',
    nombre: 'Tomás Arévalo',
    correo: 'tomas.arevalo@example.com',
    items: [
      { piezaId: 'fuente-ovalada', cantidad: 1 },
      { piezaId: 'plato-hondo', cantidad: 1 },
    ],
    total: 59500,
    fecha: '2026-11-12T18:05:00.000Z',
  },
]

export const PIEZAS_POR_ID = Object.fromEntries(PIEZAS.map((p) => [p.id, p]))
