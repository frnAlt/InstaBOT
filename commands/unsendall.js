const unsend = require('./unsend.js');

module.exports = {
  config: {
    name: "unsendall",
    aliases: ["unsentall", "delall", "deleteall"],
    version: "2.0",
    author: "NTKhang, Gtajisan && frnAlt",
    cooldown: 1,
    role: 0,
    description: "Unsend all recent bot messages in thread",
    category: "utility",
    usage: "{pn} | {pn} <count>"
  },

  async onStart(params) {
    if (!params.args || params.args.length === 0) {
      params.args = ['all'];
    }
    return unsend.onStart(params);
  }
};
