export enum ItemType {
  Cosmetic = "cosmetic",
  Cat = "cat",
  Trinket = "trinket",
  Rod = "rod",
  Bait = "bait",
}

export interface ItemOptions {
  id: string;
  name: string;
  description: string;
  stackable: boolean;
  maxStackSize?: number;
  artwork: string;
  type: ItemType;
  value: number;
  sellable?: boolean;
  tradeable?: boolean;
  droppable?: boolean;
}

export default class Item {
  protected item: Required<ItemOptions>;

  /**
   * Create a new Item with the given item options.
   *
   * @param item The item data used to create this item.
   */
  constructor(item: ItemOptions) {
    if (item.id.trim().length === 0) {
      throw new Error("Item id cannot be empty");
    }

    if (item.name.trim().length === 0) {
      throw new Error("Item name cannot be empty");
    }

    if (item.value < 0) {
      throw new Error("Item value cannot be negative");
    }

    if (item.maxStackSize !== undefined && item.maxStackSize <= 0) {
      throw new Error("Item max stack size must be positive");
    }

    if (!item.stackable && item.maxStackSize !== undefined && item.maxStackSize > 1) {
      throw new Error("Non-stackable items cannot have a max stack size above 1");
    }

    this.item = {
      ...item,
      maxStackSize: item.maxStackSize ?? (item.stackable ? 99 : 1),
      sellable: item.sellable ?? true,
      tradeable: item.tradeable ?? true,
      droppable: item.droppable ?? true,
    };
  }

  /**
   * Returns the raw item data.
   */
  public getItem(): Required<ItemOptions> {
    return { ...this.item };
  }

  public getId(): string {
    return this.item.id;
  }

  public getName(): string {
    return this.item.name;
  }

  public getDescription(): string {
    return this.item.description;
  }

  public isStackable(): boolean {
    return this.item.stackable;
  }

  public getMaxStackSize(): number {
    return this.item.maxStackSize;
  }

  public getArtwork(): string {
    return this.item.artwork;
  }

  public getType(): ItemType {
    return this.item.type;
  }

  public getValue(): number {
    return this.item.value;
  }

  public isSellable(): boolean {
    return this.item.sellable;
  }

  public isTradeable(): boolean {
    return this.item.tradeable;
  }

  public isDroppable(): boolean {
    return this.item.droppable;
  }

  public getDisplayName(): string {
    return `${this.item.artwork} ${this.item.name}`;
  }
}