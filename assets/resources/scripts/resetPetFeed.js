// @ts-check
/**
 *
 * @param {CommandContext} ctx
 */
export async function resetPetFeed({ usersDB }) {
  const allPets = await usersDB.queryItemAll(
    {
      "value.petsData": { $exists: true },
    },
    "petsData"
  );

  for (const [uid, { petsData = [] }] of Object.entries(allPets)) {
    const modifiedPets = petsData.map((i) => {
      return {
        ...i,
        lastFeed: Date.now(),
        lastFoodEaten: null,
        lastSaturation: 0,
      };
    });
    await usersDB.setItem(uid, {
      petsData: modifiedPets,
    });
  }
}
