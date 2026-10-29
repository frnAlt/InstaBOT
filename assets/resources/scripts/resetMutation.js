// @ts-check
/**
 *
 * @param {CommandContext} params
 */
export async function growAll({ usersDB }) {
  const all = await usersDB.queryItemAll(
    {
      "value.gardenPlots": { $exists: true },
    },
    "gardenPlots",
    "userID"
  );
  for (const user of Object.values(all)) {
    const plots = user.gardenPlots ?? [];
    plots.forEach((plot) => {
      plot.mutation = [];
    });
    await usersDB.setItem(user.userID, {
      gardenPlots: plots,
    });
  }
}
