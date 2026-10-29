"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartPet = exports.smartSpectra = void 0;
const cassidy_styler_1 = require("cassidy-styler");
const pet_fight_1 = require("@cass-plugins/pet-fight");
exports.smartSpectra = `🎓 ${cassidy_styler_1.FontSystem.fonts.bold_italic("SMART")}${cassidy_styler_1.FontSystem.fonts.fancy_italic("Spectra")}`;
var SmartPet;
(function (SmartPet) {
    function convertHealToSaturationRange(heal) {
        const sat1 = (Number(heal) || 0) * 1.2 * 60 * 1000;
        const satMin = Math.floor(sat1 * 0.25);
        const satMax = Math.floor(sat1 * 1);
        return [satMin, satMax];
    }
    SmartPet.convertHealToSaturationRange = convertHealToSaturationRange;
    function getFoodPts(item) {
        if (typeof item.heal === "number") {
            const satus = convertHealToSaturationRange(item.heal);
            if (satus.some((i) => isNaN(i))) {
                return 0;
            }
            return (satus[0] + satus[1]) * 0.2;
        }
        if (typeof item.saturation === "number") {
            return item.saturation;
        }
        return 0;
    }
    SmartPet.getFoodPts = getFoodPts;
    function findHungryPets(pets) {
        return Array.from(pets).sort((petA, petB) => {
            const { lastFeed: lastFeedA = Date.now(), lastSaturation: lastSaturationA = 0, } = petA;
            const { lastFeed: lastFeedB = Date.now(), lastSaturation: lastSaturationB = 0, } = petB;
            const timeSinceLastFeedA = Date.now() - Number(lastFeedA);
            const timeSinceLastFeedB = Date.now() - Number(lastFeedB);
            const hungerLevelA = timeSinceLastFeedA - Number(lastSaturationA);
            const hungerLevelB = timeSinceLastFeedB - Number(lastSaturationB);
            return hungerLevelB - hungerLevelA;
        });
    }
    SmartPet.findHungryPets = findHungryPets;
    function isFeedable(pet, food) {
        return (food.type === `${pet.petType}_food` ||
            food.type === "anypet_food" ||
            food.type === "food");
    }
    SmartPet.isFeedable = isFeedable;
    function findFoods(pet, inv) {
        const sorted = Array.from(inv)
            .filter((i) => isFeedable(pet, i))
            .toSorted((a, b) => getFoodPts(b) - getFoodPts(a));
        return sorted;
    }
    SmartPet.findFoods = findFoods;
    function findFood(pet, inv) {
        return findFoods(pet, inv)[0];
    }
    SmartPet.findFood = findFood;
    function findHungryFeedable(pets, inv) {
        const hungryPets = findHungryPets(pets);
        const sortedHungryPetsWithFood = hungryPets.map((pet) => {
            const suitableFood = findFood(pet, inv);
            return { pet, food: suitableFood };
        });
        const sortedResult = sortedHungryPetsWithFood.sort((a, b) => {
            const hungerDifference = Date.now() -
                Number(a.pet.lastFeed) -
                Number(a.pet.lastSaturation) -
                (Date.now() - Number(b.pet.lastFeed) - Number(b.pet.lastSaturation));
            if (hungerDifference !== 0) {
                return hungerDifference;
            }
            return getFoodPts(b.food) - getFoodPts(a.food);
        });
        return sortedResult;
    }
    SmartPet.findHungryFeedable = findHungryFeedable;
    function calculateAddedStat(pets, gears, item) {
        const gearsManage = new pet_fight_1.GearsManage(gears);
        const playersBefore = pets.map((i) => new pet_fight_1.PetPlayer(i, gearsManage.getGearData(i.key)));
        const playersAfter = pets.map((i) => {
            const gear = gearsManage.getGearData(i.key);
            if (item.type === "weapon") {
                const slots = gear.weapon;
                const maxSlots = pet_fight_1.GearData.MAX_WEAPON_SLOTS;
                let chosenSlot = -1;
                for (let i = 0; i < maxSlots; i++) {
                    if (!slots[i]) {
                        chosenSlot = i;
                        break;
                    }
                }
                if (chosenSlot === -1) {
                    let minAtk = Infinity;
                    for (let i = 0; i < maxSlots; i++) {
                        const atk = slots[i]?.atk ?? 0;
                        if (atk < minAtk) {
                            minAtk = atk;
                            chosenSlot = i;
                        }
                    }
                }
                gear.equipWeapon(item, chosenSlot);
            }
            if (item.type === "armor") {
                const slots = gear.armors;
                const maxSlots = pet_fight_1.GearData.MAX_ARMOR_SLOTS;
                let chosenSlot = -1;
                for (let i = 0; i < maxSlots; i++) {
                    if (!slots[i]) {
                        chosenSlot = i;
                        break;
                    }
                }
                if (chosenSlot === -1) {
                    let minDef = Infinity;
                    for (let i = 0; i < maxSlots; i++) {
                        const def = slots[i]?.def ?? 0;
                        if (def < minDef) {
                            minDef = def;
                            chosenSlot = i;
                        }
                    }
                }
                gear.equipArmor(chosenSlot, item);
            }
            return new pet_fight_1.PetPlayer(i, gear);
        });
        const diffs = [];
        for (const playerAfter of playersAfter) {
            const playerBefore = playersBefore.find((i) => i.OgpetData.key === playerAfter.OgpetData.key);
            let sub = (key, dis) => {
                const a = playerAfter[key];
                const b = playerBefore[key];
                const diff = (typeof a === "number" ? a : 0) - (typeof b === "number" ? b : 0);
                return {
                    diff,
                    str: `${playerAfter.petIcon} ${diff > 0 ? `+**${diff}** **${dis}**` : `-${Math.abs(diff)} ${dis}`}`,
                };
            };
            const atkSub = sub("ATK", "ATK");
            const defSub = sub("DF", "DEF");
            const magicSub = sub("MAGIC", "MAGIC");
            const hpSub = sub("HP", "MAX HP");
            diffs.push({
                atk: atkSub.diff,
                def: defSub.diff,
                magic: magicSub.diff,
                hp: hpSub.diff,
                strs: [atkSub, defSub, magicSub, hpSub].map((i) => i.str),
                str: [atkSub, defSub, magicSub, hpSub]
                    .filter((i) => i.diff)
                    .map((i) => i.str)
                    .join("\n"),
                before: playerBefore,
                after: playerAfter,
            });
        }
        return diffs;
    }
    SmartPet.calculateAddedStat = calculateAddedStat;
})(SmartPet || (exports.SmartPet = SmartPet = {}));
