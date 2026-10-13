export type MaquinaCatalogo = {
  Cod: number
  Apodo: string
}

export function parseMaquinaCod(value: unknown): number | null {
  if (value == null || value === "") return null
  const n = Number(value)
  return Number.isInteger(n) && n > 0 ? n : null
}

export function formatMaquinaLabel(
  maq: { Cod: number; Apodo?: string | null } | null | undefined
): string {
  if (!maq) return ""
  const apodo = String(maq.Apodo ?? "").trim()
  return apodo ? `${maq.Cod} · ${apodo}` : String(maq.Cod)
}

export function maquinaApodoOf(maquinas: MaquinaCatalogo[], id: unknown): string | null {
  const cod = parseMaquinaCod(id)
  if (cod == null) return null
  const found = maquinas.find((m) => Number(m.Cod) === cod)
  const apodo = String(found?.Apodo ?? "").trim()
  return apodo || null
}

/** Si solo hay una máquina, úsala; si el chip ya tiene una del catálogo, consérvala. */
export function defaultMaquinaForChip(
  maquinas: MaquinaCatalogo[],
  currentId: unknown
): number | null {
  const current = parseMaquinaCod(currentId)
  if (current != null && maquinas.some((m) => Number(m.Cod) === current)) return current
  if (maquinas.length === 1) return Number(maquinas[0].Cod)
  return null
}

export function toMaquinaCatalogo(row: Record<string, unknown>): MaquinaCatalogo | null {
  const cod = parseMaquinaCod(row.Cod)
  const apodo = String(row.Apodo ?? "").trim()
  if (cod == null || !apodo) return null
  return { Cod: cod, Apodo: apodo }
}
