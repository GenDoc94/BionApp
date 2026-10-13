import os from 'os'
import type Database from 'better-sqlite3'
import type { DbFilter } from '../shared/types'

export type AuditActor = {
  username: string
  ip: string
  host: string
}

const DETALLE_MAX = 500
const SENSITIVE = /password|hash|token|secret|admin.?code/i
const ID_FIELDS = [
  'NumBN',
  'NumBN_L',
  'NumBN_M',
  'NumBN_LM',
  'NumBN_C',
  'NumBN_Tag',
  'NumBN_Preselect',
  'Petic',
  'Petic_Preselect',
  'Tag_Name',
  'Tag_Number',
  'Codigo_BIO',
  'LN',
  'LN_Caja',
  'Sales_Order',
  'Cod',
  'Dx',
  'TipoMuestra',
  'Muestra',
  'Id_LtE',
  'Id_LtM',
  'Id_LtMm',
  'Id_LtC',
  'Id_Maquina',
  'Apodo',
  'Id_Envio',
  'Id_EnvioCaja',
  'NumChip',
  'NumChip_D',
  'Nombre_Chip',
  'NumFiltro',
  'NumLectura',
  'NumLectura_M',
  'NumLectura_LM',
  'NumLectura_C',
  'NumLectMarc',
  'NumLectMarc_C',
  'Posic',
  'Ubicacion'
]

export function ensureRegistroSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS Registro (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      Fecha TEXT NOT NULL,
      Usuario TEXT NOT NULL DEFAULT '',
      Accion TEXT NOT NULL,
      Tabla TEXT NOT NULL,
      Detalle TEXT NOT NULL DEFAULT '',
      IP TEXT NOT NULL DEFAULT '',
      Equipo TEXT NOT NULL DEFAULT ''
    );
    CREATE INDEX IF NOT EXISTS Registro_id_idx ON Registro(id DESC);
    CREATE INDEX IF NOT EXISTS Registro_Fecha_idx ON Registro(Fecha DESC);
  `)
}

export function pickLanIPv4(
  nets: NodeJS.Dict<os.NetworkInterfaceInfo[]> | undefined
): string {
  const candidates: string[] = []
  for (const addrs of Object.values(nets ?? {})) {
    for (const a of addrs ?? []) {
      const family = a.family as string | number
      const isV4 = family === 'IPv4' || family === 4
      if (!isV4 || a.internal) continue
      if (a.address.startsWith('169.254.')) continue
      candidates.push(a.address)
    }
  }
  const privateIp = candidates.find(
    (ip) =>
      ip.startsWith('10.') ||
      ip.startsWith('192.168.') ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)
  )
  return privateIp ?? candidates[0] ?? ''
}

export function localActor(username?: string | null): AuditActor {
  return {
    username: String(username ?? '').trim(),
    ip: pickLanIPv4(os.networkInterfaces()),
    host: os.hostname()
  }
}

function fmtValue(value: unknown): string {
  if (value == null) return '∅'
  if (typeof value === 'string') {
    const s = value.replace(/\s+/g, ' ').trim()
    return s.length > 40 ? `${s.slice(0, 37)}…` : s
  }
  if (typeof value === 'boolean' || typeof value === 'number') return String(value)
  try {
    const s = JSON.stringify(value)
    return s.length > 40 ? `${s.slice(0, 37)}…` : s
  } catch {
    return String(value)
  }
}

function formatFilter(filter: DbFilter): string {
  switch (filter.type) {
    case 'eq':
      return `${filter.column}=${fmtValue(filter.value)}`
    case 'neq':
    case 'not_eq':
      return `${filter.column}≠${fmtValue(filter.value)}`
    case 'in':
      return `${filter.column}∈[${(filter.value ?? []).map(fmtValue).join(',')}]`
    case 'is':
      return `${filter.column} IS NULL`
    case 'not_is':
      return `${filter.column} IS NOT NULL`
    case 'ilike':
      return `${filter.column}~${fmtValue(filter.value)}`
    case 'lt':
      return `${filter.column}<${fmtValue(filter.value)}`
    case 'lte':
      return `${filter.column}≤${fmtValue(filter.value)}`
    case 'gt':
      return `${filter.column}>${fmtValue(filter.value)}`
    case 'gte':
      return `${filter.column}≥${fmtValue(filter.value)}`
    default:
      return ''
  }
}

function pickRowFields(row: Record<string, unknown>): string[] {
  const parts: string[] = []
  const used = new Set<string>()
  for (const key of ID_FIELDS) {
    if (row[key] == null || SENSITIVE.test(key)) continue
    parts.push(`${key}=${fmtValue(row[key])}`)
    used.add(key)
  }
  const extras = Object.keys(row).filter((k) => !used.has(k) && !SENSITIVE.test(k))
  if (extras.length && parts.length < 6) {
    parts.push(extras.slice(0, 8).join(','))
  }
  return parts
}

export function summarizeDbChange(opts: {
  data?: unknown
  filters?: DbFilter[]
}): string {
  const parts: string[] = []
  if (opts.filters?.length) {
    const f = opts.filters.map(formatFilter).filter(Boolean).join(', ')
    if (f) parts.push(f)
  }
  const rows = Array.isArray(opts.data) ? opts.data : opts.data ? [opts.data] : []
  const objects = rows.filter(
    (r): r is Record<string, unknown> => !!r && typeof r === 'object' && !Array.isArray(r)
  )
  if (objects.length) {
    parts.push(...pickRowFields(objects[0]))
    if (objects.length > 1) parts.push(`×${objects.length}`)
  }
  return parts.join(' · ').slice(0, DETALLE_MAX)
}

export function writeRegistro(
  db: Database.Database,
  row: {
    usuario?: string
    accion: string
    tabla: string
    detalle?: string
    ip?: string
    equipo?: string
  }
): void {
  if (row.tabla === 'Registro') return
  ensureRegistroSchema(db)
  db.prepare(
    `INSERT INTO Registro (Fecha, Usuario, Accion, Tabla, Detalle, IP, Equipo)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(
    new Date().toISOString(),
    String(row.usuario ?? '').trim(),
    String(row.accion ?? '').trim() || 'update',
    String(row.tabla ?? '').trim() || '?',
    String(row.detalle ?? '').slice(0, DETALLE_MAX),
    String(row.ip ?? ''),
    String(row.equipo ?? '')
  )
}

export function safeWriteRegistro(
  db: Database.Database,
  row: Parameters<typeof writeRegistro>[1]
): void {
  try {
    writeRegistro(db, row)
  } catch {
    /* el fallo del log no debe bloquear la operación */
  }
}
