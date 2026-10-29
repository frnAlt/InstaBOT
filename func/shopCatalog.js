'use strict';

/**
 * Shop Catalog - Central items definition for Floppa RPG & Economy
 */

const ITEMS = [
  { id: 'rod_basic', name: 'Wooden Fishing Rod', category: 'tools', price: 1500, icon: '🎣', desc: 'Increases common fish catch rates' },
  { id: 'rod_pro', name: 'Carbon Fiber Rod', category: 'tools', price: 8500, icon: '🎣', desc: 'Unlocks rare and mythical deep-sea fish' },
  { id: 'pickaxe_iron', name: 'Iron Pickaxe', category: 'tools', price: 2500, icon: '⛏️', desc: 'Mines iron and silver ores efficiently' },
  { id: 'pickaxe_diamond', name: 'Diamond Pickaxe', category: 'tools', price: 15000, icon: '💎', desc: 'Extracts precious diamonds and raw gems' },
  { id: 'shovel_steel', name: 'Steel Shovel', category: 'tools', price: 2000, icon: '🪙', desc: 'Digs up buried relics and ancient artifacts' },
  { id: 'axe_titanium', name: 'Titanium Lumber Axe', category: 'tools', price: 4500, icon: '🪓', desc: 'Chops enchanted elderwood logs' },
  { id: 'sword_flame', name: 'Flame Katana', category: 'weapons', price: 12000, icon: '⚔️', desc: '+50 Attack Power in Arena & Adventures' },
  { id: 'shield_aegis', name: 'Aegis Shield', category: 'weapons', price: 10000, icon: '🛡️', desc: '+40 Defense in combat encounters' },
  { id: 'health_potion', name: 'Elixir of Life', category: 'consumables', price: 800, icon: '🧪', desc: 'Restores 100 HP during adventures' },
  { id: 'lucky_charm', name: 'Four-Leaf Golden Clover', category: 'consumables', price: 5000, icon: '🍀', desc: 'Boosts gambling luck for 1 hour' }
];

module.exports = {
  ITEMS,
  findItem(query) {
    if (!query) return null;
    const q = String(query).trim().toLowerCase();
    return ITEMS.find(item =>
      item.id.toLowerCase() === q ||
      item.name.toLowerCase().includes(q)
    ) || null;
  }
};
