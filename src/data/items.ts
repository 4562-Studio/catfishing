import Item from "../lib/item";
import {
  ItemType,
  itemSchema,
  type ItemOptions,
} from "../schemas/item";

// Item definitions to be stored in memory.

const rawItemDefinitions = [
  {
    id: "basic_kibble",
    name: "Basic Kibble",
    description:
      "Gets the job done.",
    maxStackSize: 99,
    artwork: "",
    emoji: "🥣",
    type: ItemType.Bait,
    value: 1,
    sellable: false,
    tradeable: false,
    droppable: false,
    equippable: true,
  },

  {
    id: "deluxe_cat_food",
    name: "Deluxe Cat Food",
    description:
      "You're gonna be catching some serious cats with this..",
    maxStackSize: 99,
    artwork: "",
    emoji: "🥫",
    type: ItemType.Bait,
    value: 5,
    sellable: false,
    tradeable: false,
    droppable: false,
    equippable: true,
  },

  {
    id: "basic_rod",
    name: "Basic Rod",
    description: "A beginner rod.. it works well enough!",
    maxStackSize: 1,
    artwork: "",
    emoji: "🎣",
    type: ItemType.Rod,
    value: 0,
    sellable: false,
    tradeable: false,
    droppable: false,
    equippable: true,
  },

  {
    id: "rootkits_special_rod",
    name: "Rootkit's Special Rod",
    description: "A suspiciously powerful rod with unclear origins.",
    maxStackSize: 1,
    artwork: "",
    emoji: "✨",
    type: ItemType.Rod,
    value: 0,
    sellable: false,
    tradeable: false,
    droppable: false,
    equippable: true,
  },

  {
    id: "hapcat",
    name: "Hapcat",
    description: "A happy little critter.",
    maxStackSize: 1,
    artwork: "",
    emoji: "",
    type: ItemType.Cat,
    value: 50,
    sellable: true,
    tradeable: false,
    droppable: false,
    equippable: false,
  },

  {
    id: "ninabubu",
    name: "Ninabubu",
    description: "A legendary artifact. A sight to behold.",
    maxStackSize: 1,
    artwork: "",
    emoji: "",
    type: ItemType.Trinket,
    value: 4562,
    sellable: true,
    tradeable: true,
    droppable: true,
    equippable: true,
  },

  {
    id: "tophat",
    name: "Tophat",
    description: "A classy hat for a classy cat.",
    maxStackSize: 1,
    artwork: "",
    emoji: "🎩",
    type: ItemType.Cosmetic,
    value: 0,
    sellable: true,
    tradeable: true,
    droppable: true,
    equippable: true,
  },
] satisfies ItemOptions[];