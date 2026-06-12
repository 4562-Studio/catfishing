import { type ItemOptions, type ItemType, itemSchema } from "../schemas/item";

const SINGLE_STACK_ITEM_SIZE = 1;

export default class Item {
  protected item: ItemOptions;

  /**
   * Create a new Item with the given item options.
   *
   * The provided item options object is validated by itemSchema before being stored.
   *
   * @param item The item data used to create this item.
   */
  constructor(item: ItemOptions) {
    this.item = itemSchema.parse(item);
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
    return this.item.maxStackSize > SINGLE_STACK_ITEM_SIZE;
  }

  public getMaxStackSize(): number {
    return this.item.maxStackSize;
  }

  public getArtwork(): string {
    return this.item.artwork;
  }

  public getEmoji(): string {
    return this.item.emoji;
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

  public isEquippable(): boolean {
    return this.item.equippable;
  }

  public getDisplayName(): string {
    return `${this.item.emoji} ${this.item.name}`;
  }
}
