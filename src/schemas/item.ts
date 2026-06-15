import { z } from "zod";

const MIN_ITEM_OPTION_STRING_SIZE = 1;

export enum ItemType {
  Cosmetic = "cosmetic",
  Cat = "cat",
  Trinket = "trinket",
  Rod = "rod",
  Bait = "bait",
}

const itemOptionString = (name: string) =>
  z
    .string(`${name} field must be a string`)
    .trim()
    .min(MIN_ITEM_OPTION_STRING_SIZE, `${name} field cannot be empty`);

export const itemSchema = z
  .object({
    artwork: itemOptionString("Item artwork"),
    description: itemOptionString("Item description"),
    droppable: z.boolean("Item droppable must be a boolean"),
    emoji: itemOptionString("Item emoji"),
    equippable: z.boolean("Item equippable must be a boolean"),
    id: itemOptionString("Item ID"),
    maxStackSize: z
      .int("Item max stack size must be an integer")
      .positive("Item max stack size must be positive"),
    name: itemOptionString("Item name"),
    sellable: z.boolean("Item sellable must be a boolean"),
    tradeable: z.boolean("Item tradeable must be a boolean"),
    type: z.enum(ItemType, "Item type is invalid"),
    value: z
      .int("Item value must be an integer")
      .nonnegative("Item value cannot be negative"),
  })
  .strict();

export type ItemOptions = z.infer<typeof itemSchema>;
