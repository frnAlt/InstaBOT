function getRank(number, callback = () => {}) {
  const ranks = [
    { name: "Warrior", tier: 3, value: 50 },
    { name: "Warrior", tier: 2, value: 100 },
    { name: "Warrior", tier: 1, value: 300 },
    { name: "Elite", tier: 3, value: 500 },
    { name: "Elite", tier: 2, value: 700 },
    { name: "Elite", tier: 1, value: 1000 },
    { name: "Master", tier: 3, value: 2000 },
    { name: "Master", tier: 2, value: 5000 },
    { name: "Master", tier: 1, value: 10000 },
    { name: "Grandmaster", tier: 5, value: 50000 },
    { name: "Grandmaster", tier: 4, value: 100000 },
    { name: "Grandmaster", tier: 3, value: 500000 },
    { name: "Grandmaster", tier: 2, value: 1000000 },
    { name: "Grandmaster", tier: 1, value: 50000000 },
    { name: "Epic", tier: 5, value: 100000000 },
    { name: "Epic", tier: 4, value: 500000000 },
    { name: "Epic", tier: 3, value: 1000000000 },
    { name: "Epic", tier: 2, value: 5000000000 },
    { name: "Epic", tier: 1, value: 10000000000 },
    { name: "Legend", value: 500000000000 },
    { name: "Mythic", value: 1000000000000 },
    { name: "Mythical Glory", value: 10000000000000 },
  ];

  let remainingValue = number;
  let highestRank = "";
  let count = 0;
  let rankValue = 0;
  let chancer = 0;

  ranks.forEach((rank) => {
    if (remainingValue >= rank.value) {
      remainingValue -= rank.value;

      highestRank = `${rank.name} ${rank.tier ? romanize(rank.tier) : ""}`;
      count++;
      if (rank.name == "Mythical Glory") {
        rankValue = "infinity";
      }
    } else if (!chancer || !rankValue) {
      rankValue = rank.value;
      chancer++;
    }
    /*if (!rankValue) {
        rankValue = rank.value;
        
      }*/
  });

  if (!highestRank) {
    highestRank = `No Valid Rank`;
  }

  callback(highestRank, count - ranks.length, remainingValue);
  return {
    remainingValue,
    highestRank,
    count,
    rankValue,
    length: ranks.length,
    toString() {
      return highestRank;
    },
  };
}

function romanize(num) {
  const romanNumeralMap = [
    "I",
    "II",
    "III",
    "IV",
    "V",
    "VI",
    "VII",
    "VIII",
    "IX",
    "X",
  ];

  return romanNumeralMap[num - 1];
}

export async function use(obj) {
  obj.flipcoin = {
    ranker: {
      getRank,
      romanize,
    },
  };
  const luck = {
    async isLucky(uid) {
      const userData = await obj.money.get(uid);
      const { luckStat = 100 } = userData;

      const luckBool = Math.random() < luckStat / 200;
      return luckBool;
    },
    async getLuckStat(uid) {
      const userData = await obj.money.get(uid);
      const { luckStat = 100 } = userData;
      return luckStat;
    },
    async setLuckStat(uid, luckStat) {
      await obj.money.set(uid, {
        luckStat,
      });
      return luckStat;
    },
    async addLuckStat(uid, luckStat2, range1 = 0, range2 = 0) {
      if (
        (isNaN(luckStat2) && luckStat2 != "random") ||
        isNaN(range1) ||
        isNaN(range2)
      )
        return;
      const userData = await obj.money.get(uid);
      const { luckStat = 100 } = userData;
      let newLuckStat = luckStat;
      if (luckStat2 == "random") {
        newLuckStat =
          luckStat +
          (Math.floor(Math.random() * (range2 - range1 + 1)) + range1);
      } else {
        newLuckStat = luckStat + luckStat2;
      }
      await obj.money.set(uid, {
        luckStat: newLuckStat,
      });
      return newLuckStat;
    },
  };
  obj.flipcoin.luck = luck;
  obj.next();
}
export const meta = {
  name: "flipcoinSys",
  author: "Liane Cagara",
  version: "1.0.0",
  description: "They came from nicabot",
  supported: "^1.0.0",
  order: 1,
  type: "plugin",
};
