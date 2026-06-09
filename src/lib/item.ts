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
  maxStackSize: number;
  artwork: string;
  type: ItemType;
  value: number;
  sellable: boolean;
  tradeable: boolean;
  droppable: boolean;
}

export default class Item {
  protected item: ItemOptions;

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

    if (item.maxStackSize <= 0) {
      throw new Error("Item max stack size must be positive");
    }

    this.item = { ...item };
  }

  /**
   * Returns the raw item data.
   */
  public getItem(): ItemOptions {
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
    return this.item.maxStackSize > 1;
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