import type Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { getMeta, setMeta, sha256 } from './db'
import { touchLastWrite } from './dbActivity'
import type { AuthUser, Role, UserSession } from '../shared/types'
import { isRole } from '../shared/roles'

const ADMIN_CODE_META = 'admin_code_hash'

export function hasUsers(db: Database.Database): boolean {
  const row = db.prepare('SELECT 1 AS ok FROM users LIMIT 1').get() as { ok: number } | undefined
  return !!row
}

export function hasAdminCode(db: Database.Database): boolean {
  return !!getMeta(db, ADMIN_CODE_META)
}

export function verifyAdminCode(db: Database.Database, adminCode: string): boolean {
  const storedHash = getMeta(db, ADMIN_CODE_META)
  if (!storedHash) return false
  return storedHash === sha256(String(adminCode ?? '').trim())
}

function toSession(row: { id: string; username: string; role: Role }): UserSession {
  return {
    id: row.id,
    email: row.username,
    username: row.username,
    role: row.role
  }
}

export function toAuthUser(session: UserSession): AuthUser {
  return { id: session.id, email: session.email }
}

export function login(
  db: Database.Database,
  email: string,
  password: string
): UserSession | null {
  const row = db
    .prepare('SELECT id, username, password_hash, role FROM users WHERE username = ? COLLATE NOCASE')
    .get(email.trim()) as
    | { id: string; username: string; password_hash: string; role: Role }
    | undefined
  if (!row) return null
  if (!bcrypt.compareSync(password, row.password_hash)) return null
  return toSession(row)
}

export function setAdminCode(db: Database.Database, adminCode: string): { ok: true } | { ok: false; error: string } {
  const code = adminCode.trim()
  if (code.length < 4) {
    return { ok: false, error: 'El código maestro debe tener al menos 4 caracteres' }
  }
  if (hasAdminCode(db)) {
    return { ok: false, error: 'Esta carpeta ya tiene un código maestro configurado' }
  }
  setMeta(db, ADMIN_CODE_META, sha256(code))
  return { ok: true }
}

export function changeAdminCode(
  db: Database.Database,
  currentCode: string,
  nextCode: string
): { ok: true } | { ok: false; error: string } {
  const current = String(currentCode ?? '').trim()
  const next = String(nextCode ?? '').trim()
  if (!hasAdminCode(db)) {
    return {
      ok: false,
      error: 'No hay código maestro en esta carpeta. Configúralo en el setup inicial.'
    }
  }
  if (!verifyAdminCode(db, current)) {
    return { ok: false, error: 'Código maestro incorrecto' }
  }
  if (next.length < 4) {
    return { ok: false, error: 'El código maestro debe tener al menos 4 caracteres' }
  }
  if (sha256(next) === sha256(current)) {
    return { ok: false, error: 'El código maestro nuevo tiene que ser distinto' }
  }
  setMeta(db, ADMIN_CODE_META, sha256(next))
  try {
    touchLastWrite(db)
  } catch {
    /* ignore */
  }
  return { ok: true }
}

export function createUser(
  db: Database.Database,
  payload: { email: string; password: string; role: Role; adminCode: string }
): { user?: { id: string; email: string; role: Role }; error?: string; status?: number } {
  const email = payload.email.trim()
  const password = payload.password
  const role = payload.role
  const adminCode = payload.adminCode

  if (!email || !password || !adminCode) {
    return { error: 'Completa correo, contraseña y código maestro', status: 400 }
  }
  if (!isRole(role)) {
    return { error: 'Rol no válido', status: 400 }
  }
  if (password.length < 4) {
    return { error: 'La contraseña es demasiado corta', status: 400 }
  }

  const storedHash = getMeta(db, ADMIN_CODE_META)
  if (!storedHash) {
    return {
      error: 'No hay código maestro en esta carpeta. Configúralo en el setup inicial.',
      status: 500
    }
  }
  if (storedHash !== sha256(adminCode)) {
    return { error: 'Código maestro incorrecto', status: 403 }
  }

  const existing = db
    .prepare('SELECT id FROM users WHERE username = ? COLLATE NOCASE')
    .get(email) as { id: string } | undefined
  if (existing) {
    return { error: 'Ya existe un usuario con ese correo', status: 409 }
  }

  const id = crypto.randomUUID()
  const password_hash = bcrypt.hashSync(password, 10)
  db.prepare(
    'INSERT INTO users (id, username, password_hash, role) VALUES (?, ?, ?, ?)'
  ).run(id, email, password_hash, role)
  try {
    touchLastWrite(db)
  } catch {
    /* ignore */
  }

  return { user: { id, email, role } }
}

export function getProfileRole(
  db: Database.Database,
  username: string
): Role | null {
  const row = db
    .prepare('SELECT role FROM users WHERE username = ? COLLATE NOCASE')
    .get(username.trim()) as { role: Role } | undefined
  return row?.role ?? null
}

export type UserRoleRow = {
  id: string
  email: string
  role: Role
}

export function listUsers(db: Database.Database): UserRoleRow[] {
  const rows = db
    .prepare(
      `SELECT id, username, role FROM users ORDER BY username COLLATE NOCASE`
    )
    .all() as Array<{ id: string; username: string; role: Role }>
  return rows.map((row) => ({ id: row.id, email: row.username, role: row.role }))
}

export function setUserRole(
  db: Database.Database,
  id: string,
  role: Role
): { ok: true } | { ok: false; error: string } {
  if (!isRole(role)) {
    return { ok: false, error: 'Rol no válido' }
  }
  const existing = db
    .prepare('SELECT id, role FROM users WHERE id = ?')
    .get(id) as { id: string; role: Role } | undefined
  if (!existing) {
    return { ok: false, error: 'Usuario no encontrado' }
  }
  if (existing.role === 'admin' && role !== 'admin') {
    const count = db
      .prepare(`SELECT COUNT(*) AS n FROM users WHERE role = 'admin'`)
      .get() as { n: number }
    if (Number(count.n) <= 1) {
      return { ok: false, error: 'Tiene que quedar al menos un administrador' }
    }
  }
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id)
  try {
    touchLastWrite(db)
  } catch {
    /* ignore */
  }
  return { ok: true }
}
