import type { Role } from './types'

export const ROLES: readonly Role[] = ['admin', 'tel', 'user']

export const ADMIN_ONLY_OPTION_TABS = new Set([
  'variables',
  'estadisticas',
  'exportacion',
  'registro'
])

export function isRole(value: unknown): value is Role {
  return value === 'admin' || value === 'tel' || value === 'user'
}

/** Admin y TEL pueden crear/editar muestras, acciones, chips, lotes, etc. */
export function canEditData(role: unknown): boolean {
  return role === 'admin' || role === 'tel'
}

/** Solo admin: catálogos, estadísticas, exportación, registro y usuarios. */
export function canManageApp(role: unknown): boolean {
  return role === 'admin'
}

/** Admin y TEL entran en Opciones (TEL con pestañas recortadas). */
export function canOpenOptions(role: unknown): boolean {
  return role === 'admin' || role === 'tel'
}

export function canUseOptionsTab(role: unknown, tab: string): boolean {
  if (canManageApp(role)) return true
  if (!canOpenOptions(role)) return false
  return !ADMIN_ONLY_OPTION_TABS.has(tab)
}
