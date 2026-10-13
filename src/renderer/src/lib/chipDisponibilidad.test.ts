import { describe, expect, it } from "vitest";
import {
  autoFillChipAssignments,
  chipTieneHuecoDisponible,
  collectChipAsignacionesFromMuestras,
  collectFreeChipSlots,
  fcLibresParaChip,
  fcYaOcupado,
} from "./chipDisponibilidad";

const muestrasFixture = [
  {
    lecturas: [
      {
        marcado: {
          lecturasMarcado: [
            {
              chips: [
                { NumChip: 25, FC: 1, NumBN_C: 10, NumLectura_C: 1, NumLectMarc_C: 1 },
                { NumChip: 25, FC: 2, NumBN_C: 11, NumLectura_C: 1, NumLectMarc_C: 1 },
              ],
            },
          ],
        },
      },
    ],
  },
];

describe("chipDisponibilidad", () => {
  it("detecta FC libres en un chip", () => {
    const asig = collectChipAsignacionesFromMuestras(muestrasFixture);
    expect(fcLibresParaChip(25, asig)).toEqual([3]);
    expect(chipTieneHuecoDisponible(25, asig)).toBe(true);
    expect(chipTieneHuecoDisponible(99, asig)).toBe(true);
  });

  it("excluye la fila actual al editar FC", () => {
    const asig = collectChipAsignacionesFromMuestras(muestrasFixture);
    const actual = asig[0];
    expect(fcLibresParaChip(25, asig, actual)).toEqual([1, 3]);
    expect(fcYaOcupado(25, 1, asig, actual)).toBe(false);
    expect(fcYaOcupado(25, 2, asig, actual)).toBe(true);
  });
});

describe("collectFreeChipSlots / autoFillChipAssignments", () => {
  it("fills 6 readings across two empty chips (3+3)", () => {
    const slots = collectFreeChipSlots([83, 84], []);
    expect(slots).toEqual([
      { numChip: 83, fc: 1 },
      { numChip: 83, fc: 2 },
      { numChip: 83, fc: 3 },
      { numChip: 84, fc: 1 },
      { numChip: 84, fc: 2 },
      { numChip: 84, fc: 3 },
    ]);
    const filled = autoFillChipAssignments(
      ["271", "272", "273", "274", "275", "276"],
      slots
    );
    expect(filled["271"]).toEqual({ numChip: 83, fc: 1 });
    expect(filled["273"]).toEqual({ numChip: 83, fc: 3 });
    expect(filled["274"]).toEqual({ numChip: 84, fc: 1 });
    expect(filled["276"]).toEqual({ numChip: 84, fc: 3 });
  });

  it("can start filling from a preferred chip", () => {
    const slots = collectFreeChipSlots([83, 84], [], 84);
    expect(slots[0]).toEqual({ numChip: 84, fc: 1 });
    expect(slots[3]).toEqual({ numChip: 83, fc: 1 });
  });
});
