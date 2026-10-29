// @ts-check
export class CassidyUser {
  constructor(allData = {}) {
    this.allData = allData;
  }
}

/**
 * @typedef {{ exp: number }} CXP
 */

export class CassEXP {
  /**
   *
   * @param {CXP} cassEXP
   */
  constructor(
    cassEXP = {
      exp: 0,
    }
  ) {
    this.cxp = this.sanitize(cassEXP);
    this.expControls = new EXP(this);
  }

  /**
   *
   * @param {CXP} data
   * @returns {CXP}
   */
  sanitize(data) {
    let { exp } = data;
    if (isNaN(exp)) {
      exp = 0;
    }
    exp = Number.parseInt(String(exp), 10);

    return {
      ...data,
      exp,
    };
  }

  getEXP() {
    return this.cxp.exp;
  }

  /**
   * @param {number} exp
   */
  setEXP(exp) {
    this.cxp.exp = exp;
    return true;
  }

  get exp() {
    return this.getEXP();
  }

  set exp(exp) {
    this.setEXP(exp);
  }

  getLevel() {
    return CassEXP.getLevelFromEXP(this.getEXP());
  }

  /**
   * @param {number} level
   */
  setLevel(level) {
    this.setEXP(CassEXP.getEXPFromLevel(level));
    return true;
  }

  get level() {
    return this.getLevel();
  }

  set level(level) {
    this.setLevel(level);
  }

  getNextRemaningEXP() {
    const currentLevel = this.getLevel();
    const currentEXP = this.getEXP();
    const nextLevelEXP = CassEXP.getEXPFromLevel(currentLevel + 1);
    return nextLevelEXP - currentEXP;
  }

  getNextEXP() {
    const currentLevel = this.getLevel();
    const nextLevelEXP = CassEXP.getEXPFromLevel(currentLevel + 1);

    return nextLevelEXP;
  }

  getEXPBeforeLv() {
    const lim = CassEXP.getEXPFromLevel(this.getLevel() - 1);
    return lim;
  }

  getNextEXPCurrentLv() {
    const currentLevel = this.getLevel();
    const nextEXP = this.getNextEXP();
    const levelEXP = CassEXP.getEXPFromLevel(currentLevel - 1);
    return nextEXP - levelEXP;
  }

  getEXPCurrentLv() {
    const lim = CassEXP.getEXPFromLevel(this.getLevel() - 1);
    return this.getEXP() - lim;
  }

  raw() {
    return JSON.parse(JSON.stringify(this.cxp));
  }

  getRankString() {
    return CassEXP.rankNames[
      Math.max(0, Math.min(this.getLevel() - 1, CassEXP.rankNames.length - 1))
    ];
  }

  /**
   * @param {number} exp
   */
  expReached(exp) {
    return this.getEXP() >= exp;
  }

  /**
   * @param {number} level
   */
  levelReached(level) {
    return this.getLevel() >= level;
  }

  /**
   * @param {number} level
   */
  static getEXPFromLevel(level) {
    if (level <= 1) {
      return 0;
    } else {
      return 10 * Math.pow(2, level - 1);
    }
  }

  /**
   * @param {number} lastExp
   */
  static getLevelFromEXP(lastExp) {
    return lastExp < 10 ? 1 : Math.floor(Math.log2(lastExp / 10)) + 1;
  }

  static rankNames = [
    "Novice",
    "Apprentice",
    "Adept",
    "Expert",
    "Master",
    "Grandmaster",
    "Champion",
    "Legend",
    "Mythic",
    "Godlike",
    "Hero",
    "Elite",
    "Veteran",
    "Elite Veteran",
    "Pro",
    "Master Pro",
    "Grandmaster Pro",
    "Immortal",
    "Ascendant",
    "Overlord",
    "Exalted",
    "Supreme",
    "Warlord",
    "Titan",
    "Champion of Champions",
    "Celestial",
    "Ascendant Master",
    "Sovereign",
    "Exemplary",
    "Invincible",
    "Radiant",
    "Virtuous",
    "Untouchable",
    "Eternal",
    "Indomitable",
    "Unyielding",
    "Pinnacle",
    "Invulnerable",
    "Unstoppable",
    "Unbeatable",
    "Invincible Ascendant",
    "Conqueror",
    "Conqueror Supreme",
    "Emperor",
    "Titan Master",
    "Supreme Immortal",
    "Legendary Immortal",
    "Divine",
    "Champion Ascendant",
    "Transcendent",
    "Mythical Champion",
    "Unmatched",
    "Grand Exemplar",
    "Celestial Legend",
    "Ancient",
    "Prime",
    "All-Powerful",
    "Unstoppable Force",
    "Peerless",
    "The Chosen One",
    "Master of Masters",
    "Guardian of Realms",
    "Celestial Overlord",
    "Elder Champion",
    "Ultimate",
    "Ultimate Ascendant",
    "Grand Titan",
    "Pinnacle Guardian",
    "Supreme Champion",
    "Unyielding Hero",
    "Arcane",
    "Sage",
    "Titan Guardian",
    "True Master",
    "Eternal Sovereign",
    "Guardian of Infinity",
    "Cosmic",
    "Universal Champion",
    "Elder Ascendant",
    "Sovereign Champion",
    "Prime Emperor",
    "Boundless",
    "Infinite",
    "Omnipotent",
    "Omniscient",
    "Supreme Ascendant",
    "Mythical Sovereign",
    "Celestial God",
    "Warden of Realms",
    "Timeless",
    "Destiny's Chosen",
    "Eternal Hero",
    "Champion of Time",
    "Beyond Legendary",
    "Eternal Exemplar",
    "Lord of Realms",
    "Cosmic Titan",
    "Master of Eternity",
    "Grand Warlord",
    "Celestial Exemplar",
    "Unstoppable Overlord",
    "Immortal Champion",
    "Titanic Legend",
    "Infallible",
    "Master of Time",
    "Warden of the Infinite",
    "Eternal Sovereign",
    "Cosmic Warlord",
    "Limitless",
    "Boundless Champion",
    "Guardian of Eternity",
    "Exalted Legend",
    "Unstoppable Legend",
    "Sage of Time",
    "Infinite Champion",
    "Champion of Realms",
    "Grand Immortal",
    "Guardian of Time",
    "Warden of Eternity",
    "Eternal Overlord",
    "All-Knowing",
    "Immortal Warlord",
    "True Exemplar",
    "Champion of Eternity",
    "Ultimate Lord",
    "Divine Guardian",
    "Supreme Warden",
    "Timeless Champion",
    "Cosmic Sovereign",
    "Transcendent Champion",
    "Omnipotent Guardian",
    "Beyond Supreme",
    "Unyielding Legend",
    "Infinite Sovereign",
    "Exalted Warlord",
    "Celestial Warden",
    "Ascendant Champion",
    "Divine Conqueror",
    "Titan of Eternity",
    "Warden of Time",
    "Unstoppable Sage",
    "Mythic Overlord",
    "Divine Exemplar",
    "Cosmic Overlord",
    "Elder Titan",
    "Cosmic Conqueror",
    "Champion of the Infinite",
    "Warlord of Time",
    "Champion of the Cosmos",
    "Legendary Overlord",
    "Timeless Titan",
    "Divine Ascendant",
    "Warden of Time",
    "Infinite Exemplar",
    "Cosmic Warlord",
    "Ascendant God",
    "Elder Conqueror",
    "Mythic Sovereign",
    "Beyond All",
    "Unstoppable Hero",
    "Legendary Sage",
    "Champion of the Infinite",
    "Boundless Overlord",
    "Eternal Conqueror",
    "Divine Warlord",
    "Champion of the Celestial",
    "Elder Warlord",
    "Immortal Sage",
    "Boundless Lord",
    "Warden of Infinity",
    "Ascendant Master",
    "Warden of Realms",
    "Beyond the Gods",
    "Omnipotent Overlord",
    "Titan of Realms",
    "Supreme Master",
    "Eternal Sage",
    "Mythic God",
    "Infinite Warlord",
    "Champion of Infinity",
    "Ultimate Warden",
    "Boundless Hero",
    "Warden of the Gods",
    "Ascendant Conqueror",
    "Immortal Hero",
    "Infinite Titan",
    "Eternal Warden",
    "Mythical Warlord",
    "Transcendent Warden",
    "Legendary Titan",
    "Omnipotent Champion",
    "Supreme Guardian",
    "Champion of Eternity",
    "Timeless Lord",
    "Exalted God",
    "Celestial Warlord",
    "Unbeatable Champion",
    "Legendary Sovereign",
    "Warden of Realms",
    "Eternal Warlord",
  ];
}

class EXP {
  constructor(parent = new CassEXP()) {
    // this.exp = exp;
    this.parent = parent;
  }
  get exp() {
    return this.parent.exp;
  }

  set exp(expp) {
    this.parent.exp = expp;
    true;
  }

  /**
   * @param {number} expAmount
   */
  raise(expAmount) {
    this.exp += expAmount;
  }

  /**
   * @param {number} expAmount
   */
  decrease(expAmount) {
    this.exp -= expAmount;
  }

  /**
   * @param {any} level
   */
  raiseToLevel(level) {
    const targetEXP = CassEXP.getEXPFromLevel(level);
    this.exp = targetEXP;
  }

  /**
   * @param {number} targetEXP
   */
  raiseTo(targetEXP) {
    this.exp = targetEXP;
  }

  /**
   * @param {any} level
   */
  raiseWithLevel(level) {
    const baseEXP = CassEXP.getEXPFromLevel(level);
    this.exp = baseEXP + this.exp;
  }

  retrieve() {
    return this.exp;
  }

  getLevel() {
    return CassEXP.getLevelFromEXP(this.exp);
  }
}

/**
 * @typedef {Object} Quest
 * @property {string} name - The name of the quest.
 * @property {string} description - A brief description of the quest.
 * @property {number} currentSteps - The current progress of the quest.
 * @property {number} totalSteps - The total steps required to complete the quest.
 * @property {boolean} isComplete - Indicates if the quest is complete.
 */

/**
 * Class representing a quest system.
 */
export class CassQuest {
  constructor(quests = {}) {
    /**
     * @type {Object.<string, Quest>}
     * @private
     */
    this.quests = quests;
  }

  raw() {
    return JSON.parse(JSON.stringify(this.quests));
  }

  /**
   * Creates a new quest.
   *
   * @param {string} questKey - The key of the quest.
   * @param {string} name - The name of the quest.
   * @param {string} description - A description of the quest.
   * @param {number} [totalSteps=10] - The total steps to complete the quest.
   * @throws {Error} If the quest already exists.
   */
  newQuest(questKey, name, description, totalSteps = 10) {
    if (this.quests[questKey]) {
      throw new Error(`Quest with key ${questKey} already exists.`);
    }
    this.quests[questKey] = {
      name,
      description,
      currentSteps: 0,
      totalSteps,
      isComplete: false,
    };
  }

  /**
   * Deletes a quest.
   *
   * @param {string} questKey - The key of the quest.
   * @throws {Error} If the quest does not exist.
   */
  deleteQuest(questKey) {
    if (!this.quests[questKey]) {
      throw new Error(`Quest with key ${questKey} does not exist.`);
    }
    delete this.quests[questKey];
  }

  /**
   * Completes a quest by deleting it, but only if the quest is complete.
   *
   * @param {string} questKey - The key of the quest.
   * @throws {Error} If the quest is not complete or doesn't exist.
   */
  complete(questKey) {
    const quest = this.quests[questKey];
    if (!quest) {
      throw new Error(`Quest with key ${questKey} does not exist.`);
    }
    if (!quest.isComplete) {
      throw new Error(
        `Quest with key ${questKey} is not complete and cannot be deleted.`
      );
    }
    this.deleteQuest(questKey);
  }

  /**
   * Advances the steps of a quest by a certain number of steps.
   *
   * @param {string} questKey - The key of the quest.
   * @param {number} [steps=1] - The number of steps to advance.
   * @throws {Error} If the quest does not exist.
   */
  advance(questKey, steps = 1) {
    const quest = this.quests[questKey];
    if (!quest) {
      throw new Error(`Quest with key ${questKey} does not exist.`);
    }
    quest.currentSteps += steps;
    quest.isComplete = quest.currentSteps >= quest.totalSteps;
  }

  /**
   * Checks if a quest is complete.
   *
   * @param {string} questKey - The key of the quest.
   * @returns {boolean} True if the quest is complete, otherwise false.
   * @throws {Error} If the quest does not exist.
   */
  isComplete(questKey) {
    const quest = this.quests[questKey];
    if (!quest) {
      throw new Error(`Quest with key ${questKey} does not exist.`);
    }
    return quest.isComplete;
  }

  /**
   * Checks if a quest exists.
   *
   * @param {string} questKey - The key of the quest.
   * @returns {boolean} True if the quest exists, otherwise false.
   */
  has(questKey) {
    return !!this.quests[questKey];
  }

  /**
   * Advances the quest steps only if it exists.
   *
   * @param {string} questKey - The key of the quest.
   * @param {number} [steps=1] - The number of steps to advance.
   */
  advanceIfHas(questKey, steps = 1) {
    if (!this.has(questKey)) {
      return;
    }
    this.advance(questKey, steps);
  }

  /**
   * Gets information about a specific quest.
   *
   * @param {string} questKey - The key of the quest.
   * @returns {Quest | null} The quest's details, or null if the quest doesn't exist.
   * @throws {Error} If the quest does not exist.
   */
  getInfo(questKey) {
    const quest = this.quests[questKey];
    if (!quest) {
      throw new Error(`Quest with key ${questKey} does not exist.`);
    }
    return {
      name: quest.name,
      description: quest.description,
      currentSteps: quest.currentSteps,
      totalSteps: quest.totalSteps,
      isComplete: quest.isComplete,
    };
  }

  /**
   * Gets the current steps of a specific quest.
   *
   * @param {string} questKey - The key of the quest.
   * @returns {number} The current steps of the quest.
   * @throws {Error} If the quest does not exist.
   */
  getCurrentSteps(questKey) {
    const quest = this.quests[questKey];
    if (!quest) {
      throw new Error(`Quest with key ${questKey} does not exist.`);
    }
    return quest.currentSteps;
  }

  /**
   * Gets the total steps of a specific quest.
   *
   * @param {string} questKey - The key of the quest.
   * @returns {number} The total steps of the quest.
   * @throws {Error} If the quest does not exist.
   */
  getStepsTotal(questKey) {
    const quest = this.quests[questKey];
    if (!quest) {
      throw new Error(`Quest with key ${questKey} does not exist.`);
    }
    return quest.totalSteps;
  }

  /**
   * Sets the total steps for a specific quest.
   *
   * @param {string} questKey - The key of the quest.
   * @param {number} totalSteps - The total steps to set for the quest.
   * @throws {Error} If the quest does not exist.
   */
  setTotalSteps(questKey, totalSteps) {
    const quest = this.quests[questKey];
    if (!quest) {
      throw new Error(`Quest with key ${questKey} does not exist.`);
    }
    quest.totalSteps = totalSteps;
  }

  /**
   * Resets a specific quest to its initial state.
   *
   * @param {string} questKey - The key of the quest.
   * @throws {Error} If the quest does not exist.
   */
  reset(questKey) {
    const quest = this.quests[questKey];
    if (!quest) {
      throw new Error(`Quest with key ${questKey} does not exist.`);
    }
    quest.currentSteps = 0;
    quest.isComplete = false;
  }
}
