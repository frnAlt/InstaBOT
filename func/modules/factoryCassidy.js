import { ReduxCMDHome } from "./reduxCMDHome";

/**
 * @type {FactoryConfig}
 */
export const example = {
  title: "Fish Cooker",
  key: "fishCooker",
  init: {
    slot: 5,
    proc: 1,
  },
  upgrades: {
    slot: 1000000,
    proc: 5000000,
  },
  recipes: [
    {
      name: "Stew",
      icon: "🍲",
      levelRequirement: 2,
      waitingTime: 5 * 60 * 1000,
      ingr: [
        [
          {
            name: "Fish",
            icon: "🐟",
            amount: 5,
            key: "fish",
          },
          {
            name: "Salmon",
            icon: "🐠",
            amount: 5,
            key: "fishSalmon",
          },
          {
            name: "Bass",
            icon: "🐟",
            amount: 5,
            key: "fishBass",
          },
        ],
        {
          name: "Cat Canned Food",
          icon: "🥫",
          amount: 1,
          key: "catCan",
        },
      ],
      result: {
        name: "Fish Stew",
        icon: "🍲",
        flavorText: "A stew crafted using a Fish Cooker",
        sellPrice: 10000,
        key: "fishStew",
        type: "anypet_food",
        saturation: 30 * 60 * 1000,
      },
    },

    {
      name: "Cake",
      icon: "🍥",
      levelRequirement: 2,
      waitingTime: 5 * 60 * 1000,
      ingr: [
        [
          {
            name: "Fish",
            icon: "🐟",
            amount: 5,
            key: "fish",
          },
          {
            name: "Salmon",
            icon: "🐠",
            amount: 5,
            key: "fishSalmon",
          },
          {
            name: "Bass",
            icon: "🐟",
            amount: 5,
            key: "fishBass",
          },
        ],
        [
          {
            name: "Wheat",
            icon: "🌾",
            amount: 1,
            key: "cropWheat",
          },
          {
            name: "Rice",
            icon: "🌾",
            amount: 2,
            key: "cropRice",
          },
        ],
      ],
      result: {
        name: "Fish Cake",
        icon: "🍥",
        flavorText: "A cake crafted using a Fish Cooker",
        sellPrice: 10000,
        key: "fishCake",
        type: "anypet_food",
        saturation: 30 * 60 * 1000,
      },
    },
  ],
};

export class FactoryData {
  /**
   * @param {} userFactory
   * @param {FactoryConfig} metadata
   */
  constructor(userFactory = {}, metadata) {
    this.userFactory = userFactory;
    this.metadata = metadata;

    this.userFactory.queue = this.userFactory.queue || [];
    this.userFactory.currentSlot =
      this.userFactory.currentSlot || metadata.init.slot;
    this.userFactory.currentProc =
      this.userFactory.currentProc || metadata.init.proc;

    if (!metadata || !metadata.init || !metadata.upgrades) {
      throw new Error("Invalid metadata provided");
    }
  }

  /**
   * Adds an item to the processing queue if there is space.
   * @param {Object} info - The item information.
   * @returns {boolean} - Whether the item was successfully added.
   */
  addQueueItem(info) {
    if (this.isFull()) {
      console.warn("Queue is full, cannot add new item.");
      return false;
    }
    this.userFactory.queue.push({ ...info, startTime: Date.now() });
    return true;
  }

  /**
   * Removes an item from the queue by key.
   * @param {string} ref - The key of the item to remove.
   * @returns {boolean} - Whether the item was successfully removed.
   */
  removeQueueItem(ref) {
    const index = this.userFactory.queue.findIndex((item) => item.key === ref);
    if (index !== -1) {
      this.userFactory.queue.splice(index, 1);
      return true;
    }
    console.warn(`Item with key "${ref}" not found in queue.`);
    return false;
  }

  /**
   * Checks if the queue is full.
   * @returns {boolean} - Whether the queue is full.
   */
  isFull() {
    return this.userFactory.queue.length >= this.userFactory.currentSlot;
  }

  /**
   * Checks if an item has finished processing based on the time elapsed and the number of processors.
   * @param {string} ref - The key of the item to check.
   * @returns {boolean} - Whether the item is finished processing.
   */
  isFinished(ref) {
    const remainingTime = this.getTimeLeft(ref);

    return remainingTime <= 0;
  }

  /**
   * Get the remaining time until an item finishes processing.
   * @param {string} key - The key of the item to check.
   * @returns {number|null} - The remaining time in milliseconds, or null if the item is not found.
   */
  getTimeLeft(key) {
    const item = this.userFactory.queue.find((item) => item.key === ref);
    if (!item) return 0;

    const timeElapsed = Date.now() - item.startTime;
    const recipe = this.metadata.recipes.find((r) => r.name === item.key);

    if (!recipe) return 0;

    const maxProcessingTime = recipe.waitingTime || 0;

    if (timeElapsed >= maxProcessingTime) {
      const slotsAvailable = Math.min(
        this.userFactory.queue.length,
        this.userFactory.currentProc
      );
      const processingDuration =
        Math.ceil(this.userFactory.queue.length / slotsAvailable) *
        maxProcessingTime;

      return processingDuration - timeElapsed;
    }

    return 0;
  }

  /**
   * Get a list of currently processing items.
   * @returns {Array} - The list of processing items.
   */
  getProcessingItems() {
    return this.userFactory.queue.filter((item) => !this.isFinished(item.key));
  }
}

export class CassFactory {
  /**
   *
   * @param {FactoryConfig} config
   */
  constructor(config) {
    this.config = config;
    this.home = new ReduxCMDHome(
      {
        isHypen: true,
      },
      []
    );
  }

  /**
   *
   * @param {CommandContext} ctx
   */
  async runInContext(ctx) {
    const { money, input, output } = ctx;
    const userData = await money.getItem(input.senderID);
    const userFactory = new FactoryData(
      userData[`${this.config.key}_state`],
      this.config
    );
    this.home.configs = [
      {
        key: "queue",
        aliases: ["-q", "list"],
        description: "View the list of items currently being processed.",
        async handler() {},
      },
      {
        key: "recipes",
        aliases: ["-r", "formulas"],
        description:
          "Display all craftable items along with their required ingredients.",
        async handler() {},
      },
      {
        key: "process",
        aliases: ["-p", "create", "craft"],
        description:
          "Start processing an item using a specified recipe and required ingredients.",
        args: ["<recipe_key>", "<...recipe_keys>"],
        async handler() {},
      },
      {
        key: "collect",
        aliases: ["-c", "claim"],
        description:
          "Retrieve completed processed items. Use specific keys or * for all items.",
        args: ["<...keys>"],
        async handler() {},
      },
      {
        key: "upgrade",
        aliases: ["-u"],
        description:
          "Upgrade either the processing unit or expand the queue capacity.",
        args: ["<proc|queue>"],
        async handler() {},
      },
    ];
  }
}
