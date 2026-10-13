import { describe, expect, it } from "vitest"
import {
  defaultMaquinaForChip,
  formatMaquinaLabel,
  maquinaApodoOf,
  parseMaquinaCod,
} from "./maquinas"

const saphyr1 = { Cod: 1, Apodo: "Saphyr1" }
const saphyr2 = { Cod: 2, Apodo: "Saphyr2" }

describe("maquinas", () => {
  it("formats numbered nickname", () => {
    expect(formatMaquinaLabel(saphyr1)).toBe("1 · Saphyr1")
    expect(formatMaquinaLabel({ Cod: 2, Apodo: "  " })).toBe("2")
    expect(formatMaquinaLabel(null)).toBe("")
  })

  it("parses positive integer codes", () => {
    expect(parseMaquinaCod(1)).toBe(1)
    expect(parseMaquinaCod("2")).toBe(2)
    expect(parseMaquinaCod("")).toBeNull()
    expect(parseMaquinaCod(0)).toBeNull()
  })

  it("defaults to the only machine, or keeps the chip assignment", () => {
    expect(defaultMaquinaForChip([saphyr1], null)).toBe(1)
    expect(defaultMaquinaForChip([saphyr1, saphyr2], 2)).toBe(2)
    expect(defaultMaquinaForChip([saphyr1, saphyr2], null)).toBeNull()
    expect(defaultMaquinaForChip([saphyr1, saphyr2], 9)).toBeNull()
  })

  it("looks up nickname by Cod", () => {
    expect(maquinaApodoOf([saphyr1, saphyr2], 2)).toBe("Saphyr2")
    expect(maquinaApodoOf([saphyr1], 3)).toBeNull()
  })
})
