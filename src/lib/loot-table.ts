import { randomInt } from "node:crypto";

export interface BaseLoot<LootType, RollContext> {
  loot: LootType;
  weight: number | ((ctx: RollContext) => number);
  includeInRoll?: boolean | ((ctx: RollContext) => boolean);
}

interface LootsWithRanges<LootType, RollContext> extends BaseLoot<
  LootType,
  RollContext
> {
  range: {
    start: number;
    end: number;
  };
}

export default class LootTable<LootType, RollContext> {
  protected loots: BaseLoot<LootType, RollContext>[];

  /**
   * Create a new loot table with the given loot items.
   *
   * **Generic Types**
   *
   * The constructor requires 2 generics to be defined for the loot type and roll context.
   * - Loot type is the type of loot that can be rolled from the table.
   * - Roll context is the type of context that can be passed to the loot table for
   * additional information, this context can be used in the loot definition to
   * manipulate the inclusion and weight of loot items during a roll.
   * @param loot Loot items to include in the table.
   */
  constructor(loot: BaseLoot<LootType, RollContext>[]) {
    // Should do some validation of loot table structure as a guard
    this.loots = loot;
  }

  /**
   * Returns all loot items in the table, wrapped in the BaseLoot type.
   */
  public getLoots(): BaseLoot<LootType, RollContext>[] {
    return [...this.loots];
  }

  /**
   * Roll the loot table with any additional context. Will return a random loot
   * item based on the weight of each loot item.
   * @param ctx
   */
  public roll(ctx: RollContext): LootType {
    const rollableLoot = this.getAllRollableLoot(ctx);
    const { lootsWithRanges, weightTotal } = this.calculateRollRanges(
      rollableLoot,
      ctx,
    );

    if (weightTotal <= 0) {
      throw new Error("No loot items with positive weight found in the table");
    }

    return this.getRandomLoot(lootsWithRanges, weightTotal).loot;
  }

  protected getAllRollableLoot(
    ctx: RollContext,
  ): BaseLoot<LootType, RollContext>[] {
    return this.loots.filter((loot) => {
      if (loot.includeInRoll === undefined) {
        return true;
      }

      if (typeof loot.includeInRoll === "boolean") {
        return loot.includeInRoll;
      }

      return loot.includeInRoll(ctx);
    });
  }

  protected calculateRollRanges(
    loots: BaseLoot<LootType, RollContext>[],
    ctx: RollContext,
  ) {
    let weightTotal = 0;

    const lootsWithRanges = loots.map((loot) => {
      const weight =
        typeof loot.weight === "number" ? loot.weight : loot.weight(ctx);

      const prevTotalWeight = weightTotal;
      weightTotal += weight;

      return {
        ...loot,
        range: { end: weightTotal, start: prevTotalWeight },
        weight,
      };
    });

    return {
      lootsWithRanges,
      weightTotal,
    };
  }

  protected getRandomLoot(
    lootsWithRanges: LootsWithRanges<LootType, RollContext>[],
    weightTotal: number,
  ): LootsWithRanges<LootType, RollContext> {
    const selectedValueInRange = randomInt(weightTotal);

    const result = lootsWithRanges.find(
      (loot) =>
        selectedValueInRange >= loot.range.start &&
        selectedValueInRange < loot.range.end,
    );

    if (!result) {
      throw new Error("No loot found within the roll range");
    }

    return result;
  }
}
