import { beforeEach, describe, expect, it, vi } from 'vitest'
import type Database from 'better-sqlite3'

const { metaStore } = vi.hoisted(() => ({
  metaStore: new Map<string, string>()
}))

vi.mock('./db', async () => {
  const crypto = await import('node:crypto')
  return {
    getMeta: (_db: unknown, key: string) => metaStore.get(key) ?? null,
    setMeta: (_db: unknown, key: string, value: string) => {
      metaStore.set(key, value)
    },
    sha256: (value: string) =>
      crypto.createHash('sha256').update(value, 'utf8').digest('hex')
  }
})

vi.mock('./dbActivity', () => ({
  touchLastWrite: vi.fn()
}))

import { changeAdminCode, hasAdminCode, setAdminCode, verifyAdminCode } from './auth'

const db = {} as Database.Database

describe('changeAdminCode', () => {
  beforeEach(() => {
    metaStore.clear()
  })

  it('rejects when there is no master code yet', () => {
    expect(changeAdminCode(db, 'abcd', 'efgh')).toEqual({
      ok: false,
      error: 'No hay código maestro en esta carpeta. Configúralo en el setup inicial.'
    })
  })

  it('rejects a wrong current code', () => {
    expect(setAdminCode(db, 'abcd')).toEqual({ ok: true })
    expect(changeAdminCode(db, 'wrong', 'efgh')).toEqual({
      ok: false,
      error: 'Código maestro incorrecto'
    })
    expect(verifyAdminCode(db, 'abcd')).toBe(true)
  })

  it('rejects a short new code', () => {
    expect(setAdminCode(db, 'abcd')).toEqual({ ok: true })
    expect(changeAdminCode(db, 'abcd', 'abc')).toEqual({
      ok: false,
      error: 'El código maestro debe tener al menos 4 caracteres'
    })
  })

  it('rejects an unchanged code', () => {
    expect(setAdminCode(db, 'abcd')).toEqual({ ok: true })
    expect(changeAdminCode(db, 'abcd', 'abcd')).toEqual({
      ok: false,
      error: 'El código maestro nuevo tiene que ser distinto'
    })
  })

  it('replaces the stored hash when current code matches', () => {
    expect(setAdminCode(db, 'abcd')).toEqual({ ok: true })
    expect(hasAdminCode(db)).toBe(true)
    expect(changeAdminCode(db, 'abcd', 'nuevo')).toEqual({ ok: true })
    expect(verifyAdminCode(db, 'abcd')).toBe(false)
    expect(verifyAdminCode(db, 'nuevo')).toBe(true)
  })
})
