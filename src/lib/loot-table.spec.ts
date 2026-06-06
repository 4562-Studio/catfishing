import { beforeEach, describe, expect, it, vi } from "vitest";
import LootTable from "./loot-table";
import { faker } from "@faker-js/faker";
import { randomInt } from "node:crypto";

interface TestLootType {
  id: string;
  name: string;
}

interface TestRollContext {
  conditionalValue?: boolean;
}

vi.mock("node:crypto", (importOriginal) => ({
  ...importOriginal,
  randomInt: vi.fn(),
}));

const generateTestLootTypeData = (
  overrides?: Partial<TestLootType>,
): TestLootType => ({
  id: faker.string.uuid(),
  // oxlint-disable-next-line no-magic-numbers
  name: faker.string.alpha(10),
  ...overrides,
});

describe("LootTable", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("#roll", () => {
    describe("when all loots are non conditional", () => {
      let lootTable: LootTable<TestLootType, TestRollContext>;

      beforeEach(() => {
        lootTable = new LootTable<TestLootType, TestRollContext>([
          {
            loot: generateTestLootTypeData(),
            weight: 1,
          },
          {
            loot: generateTestLootTypeData(),
            weight: 1,
          },
        ]);
      });

      describe("and when a 0 is rolled", () => {
        beforeEach(() => {
          vi.mocked(randomInt).mockImplementation(() => 0);
        });

        it("should return the first loot", () => {
          expect(lootTable.roll({})).toEqual(lootTable.getLoots()[0].loot);
        });
      });

      describe("and when a 1 is rolled", () => {
        beforeEach(() => {
          vi.mocked(randomInt).mockImplementation(() => 1);
        });

        it("should return the second loot", () => {
          expect(lootTable.roll({})).toEqual(lootTable.getLoots()[1].loot);
        });
      });
    });

    describe("when a loot in the table has a conditional weight", () => {
      let lootTable: LootTable<TestLootType, TestRollContext>;

      beforeEach(() => {
        lootTable = new LootTable<TestLootType, TestRollContext>([
          {
            loot: generateTestLootTypeData(),
            weight: (ctx) => (ctx.conditionalValue ? 2 : 1),
          },
          {
            loot: generateTestLootTypeData(),
            weight: 1,
          },
        ]);
      });

      describe("and when the condition evaluates to true", () => {
        const ctx: TestRollContext = {
          conditionalValue: true,
        };

        it("should set the weight to 2 and return when those values are rolled", () => {
          vi.mocked(randomInt).mockImplementation(() => 0);
          expect(lootTable.roll(ctx)).toEqual(lootTable.getLoots()[0].loot);
          vi.mocked(randomInt).mockImplementation(() => 1);
          expect(lootTable.roll(ctx)).toEqual(lootTable.getLoots()[0].loot);
        });

        it("should return the other loot when a 2 is rolled", () => {
          vi.mocked(randomInt).mockImplementation(() => 2);
          expect(lootTable.roll(ctx)).toEqual(lootTable.getLoots()[1].loot);
        });
      });

      describe("and when the condition evaluates to false", () => {
        const ctx: TestRollContext = {
          conditionalValue: false,
        };

        it("should set the weight to 1 and return when that value is rolled", () => {
          vi.mocked(randomInt).mockImplementation(() => 0);
          expect(lootTable.roll(ctx)).toEqual(lootTable.getLoots()[0].loot);
        });

        it("should return the other loot when a 1 is rolled", () => {
          vi.mocked(randomInt).mockImplementation(() => 1);
          expect(lootTable.roll(ctx)).toEqual(lootTable.getLoots()[1].loot);
        });
      });
    });

    describe("when a loot in the table has a conditional inclusion", () => {
      let lootTable: LootTable<TestLootType, TestRollContext>;

      describe("and when the condition is a static boolean value (false)", () => {
        beforeEach(() => {
          lootTable = new LootTable<TestLootType, TestRollContext>([
            {
              includeInRoll: false,
              loot: generateTestLootTypeData(),
              weight: 1,
            },
            {
              loot: generateTestLootTypeData(),
              weight: 1,
            },
          ]);
        });

        it("should not include the loot in rolls", () => {
          vi.mocked(randomInt).mockImplementation(() => 0);
          expect(lootTable.roll({})).not.toEqual(lootTable.getLoots()[0].loot);
        });
      });

      describe("and when the condition is a function consuming context", () => {
        beforeEach(() => {
          lootTable = new LootTable<TestLootType, TestRollContext>([
            {
              includeInRoll: (ctx) => Boolean(ctx.conditionalValue),
              loot: generateTestLootTypeData(),
              weight: 1,
            },
            {
              loot: generateTestLootTypeData(),
              weight: 1,
            },
          ]);
        });

        describe("and the condition evaluates to true", () => {
          const ctx: TestRollContext = {
            conditionalValue: true,
          };

          it("should include the loot in rolls", () => {
            vi.mocked(randomInt).mockImplementation(() => 0);
            expect(lootTable.roll(ctx)).toEqual(lootTable.getLoots()[0].loot);
          });
        });

        describe("and the condition evaluates to false", () => {
          const ctx: TestRollContext = {
            conditionalValue: false,
          };

          it("should not include the loot in rolls", () => {
            vi.mocked(randomInt).mockImplementation(() => 0);
            expect(lootTable.roll(ctx)).not.toEqual(
              lootTable.getLoots()[0].loot,
            );
          });
        });
      });
    });
  });
});
