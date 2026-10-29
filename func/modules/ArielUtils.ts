export const numMultipliers = {
  "": 1,
  k: 1e3,
  m: 1e6,
  b: 1e9,
  t: 1e12,
  qa: 1e15,
  qi: 1e18,
  sx: 1e21,
  sp: 1e24,
  oc: 1e27,
  no: 1e30,
  dc: 1e33,
  ud: 1e36,
  dd: 1e39,
  td: 1e42,
  qad: 1e45,
  qid: 1e48,
  sxd: 1e51,
  spd: 1e54,
  ocd: 1e57,
  nod: 1e60,
  vg: 1e63,
  uvg: 1e66,
  dvg: 1e69,
  tvg: 1e72,
  qavg: 1e75,
  qivg: 1e78,
  sxvg: 1e81,
  spvg: 1e84,
  ocvg: 1e87,
  novg: 1e90,
  trg: 1e93,
  utrg: 1e96,
  dtrg: 1e99,
  ttrg: 1e102,
  qatrg: 1e105,
  qitrg: 1e108,
  sxtrg: 1e111,
  sptrg: 1e114,
  octrg: 1e117,
  notrg: 1e120,
  qag: 1e123,
  uqag: 1e126,
  dqag: 1e129,
  tqag: 1e132,
  qaqag: 1e135,
  qiqag: 1e138,
  sxqag: 1e141,
  spqag: 1e144,
  ocqag: 1e147,
  noqag: 1e150,
  qig: 1e153,
  uqig: 1e156,
  dqig: 1e159,
  tqig: 1e162,
  qaqig: 1e165,
  qiqig: 1e168,
  sxqig: 1e171,
  spqig: 1e174,
  ocqig: 1e177,
  noqig: 1e180,
  sxg: 1e183,
  usxg: 1e186,
  dsxg: 1e189,
  tsxg: 1e192,
  qasxg: 1e195,
  qisxg: 1e198,
  sxsxg: 1e201,
  spsxg: 1e204,
  ocsxg: 1e207,
  nosxg: 1e210,
  spg: 1e213,
  uspg: 1e216,
  dspg: 1e219,
  tspg: 1e222,
  qaspg: 1e225,
  qispg: 1e228,
  sxspg: 1e231,
  spspg: 1e234,
  ocspg: 1e237,
  nospg: 1e240,
  ocg: 1e243,
  uocg: 1e246,
  docg: 1e249,
  tocg: 1e252,
  qaocg: 1e255,
  qiocg: 1e258,
  sxocg: 1e261,
  spocg: 1e264,
  ococg: 1e267,
  noocg: 1e270,
  nog: 1e273,
  unog: 1e276,
  dnog: 1e279,
  tnog: 1e282,
  qanog: 1e285,
  qinog: 1e288,
  sxnog: 1e291,
  spnog: 1e294,
  ocnog: 1e297,
  nonog: 1e300,
  ctg: 1e303,
  uctg: 1e306,
  ctc: 1e309,
};

export function parseBet(arg: string | number, totalBalance?: number) {
  let targetArg = `${arg}`.trim();

  if (targetArg === "allin" && !isNaN(totalBalance)) {
    return Math.min(global.Cassidy.highRoll, Number(totalBalance));
  }

  if (targetArg === "allin" || (targetArg === "all" && !isNaN(totalBalance))) {
    return Number(totalBalance);
  }

  if (targetArg.endsWith("%")) {
    const per = parseFloat(targetArg.replaceAll("%", "")) / 100;
    return Math.floor(Number(totalBalance) * per);
  }

  const clean = targetArg.replaceAll(",", "").replaceAll("_", "");

  const multipliers: Record<string, number> = numMultipliers;

  const suffixPattern = Object.keys(multipliers)
    .sort((a, b) => b.length - a.length)
    .join("|");

  const regex = new RegExp(
    `^([\\d.]+(?:e[+-]?\\d+)?)(?:(${suffixPattern}))?$`,
    "i"
  );

  const match = clean.match(regex);

  if (match) {
    const numberPart = parseFloat(match[1]);
    const abbreviation = match[2];

    if (!abbreviation) {
      return Math.floor(numberPart);
    }

    const multiplier = multipliers[String(abbreviation).toLowerCase()];
    if (multiplier !== undefined) {
      return Math.floor(numberPart * multiplier);
    }
  }

  return NaN;
}

export class ArielIcons {
  static mainArrow = "⇒";
  static info = "ℹ️ ⇒";
}

export function abbreviateNumber(
  value: number | string,
  places: number = 3,
  isFull: boolean = false
) {
  let num = Number(value);
  if (isNaN(num)) return "Invalid input";
  if (num < 1000) {
    return num.toFixed(places).replace(/\.?0+$/, "");
  }

  const suffixes = [
    "", // 10^0
    "K", // 10^3
    "M", // 10^6
    "B", // 10^9
    "T", // 10^12
    "Qa", // Quadrillion, 10^15
    "Qi", // Quintillion, 10^18
    "Sx", // Sextillion, 10^21
    "Sp", // Septillion, 10^24
    "Oc", // Octillion, 10^27
    "No", // Nonillion, 10^30
    "Dc", // Decillion, 10^33
    "Ud", // Undecillion, 10^36
    "Dd", // Duodecillion, 10^39
    "Td", // Tredecillion, 10^42
    "Qad", // Quattuordecillion, 10^45
    "Qid", // Quindecillion, 10^48
    "Sxd", // Sexdecillion, 10^51
    "Spd", // Septendecillion, 10^54
    "Ocd", // Octodecillion, 10^57
    "Nod", // Novemdecillion, 10^60
    "Vg", // Vigintillion, 10^63
    "Uvg", // Unvigintillion, 10^66
    "Dvg", // Duovigintillion, 10^69
    "Tvg", // Tresvigintillion, 10^72
    "Qavg", // Quattuorvigintillion, 10^75
    "Qivg", // Quinquavigintillion, 10^78
    "Sxvg", // Sexvigintillion, 10^81
    "Spvg", // Septenvigintillion, 10^84
    "Ocvg", // Octovigintillion, 10^87
    "Novg", // Novemvigintillion, 10^90
    "Trg", // Trigintillion, 10^93
    "Utrg", // Untrigintillion, 10^96
    "Dtrg", // Duotrigintillion, 10^99
    "Ttrg", // Trestrigintillion, 10^102
    "Qatrg", // Quattuortrigintillion, 10^105
    "Qitrg", // Quinquatrigintillion, 10^108
    "Sxtrg", // Sextrigintillion, 10^111
    "Sptrg", // Septentrigintillion, 10^114
    "Octrg", // Octotrigintillion, 10^117
    "Notrg", // Novemtrigintillion, 10^120
    "Qag", // Quadragintillion, 10^123
    "Uqag", // Unquadragintillion, 10^126
    "Dqag", // Duoquadragintillion, 10^129
    "Tqag", // Tresquadragintillion, 10^132
    "Qaqag", // Quattuorquadragintillion, 10^135
    "Qiqag", // Quinquaquadragintillion, 10^138
    "Sxqag", // Sexquadragintillion, 10^141
    "Spqag", // Septenquadragintillion, 10^144
    "Ocqag", // Octoquadragintillion, 10^147
    "Noqag", // Novemquadragintillion, 10^150
    "Qig", // Quinquagintillion, 10^153
    "Uqig", // Unquinquagintillion, 10^156
    "Dqig", // Duoquinquagintillion, 10^159
    "Tqig", // Tresquinquagintillion, 10^162
    "Qaqig", // Quattuorquinquagintillion, 10^165
    "Qiqig", // Quinquaquinquagintillion, 10^168
    "Sxqig", // Sexquinquagintillion, 10^171
    "Spqig", // Septenquinquagintillion, 10^174
    "Ocqig", // Octoquinquagintillion, 10^177
    "Noqig", // Novemquinquagintillion, 10^180
    "Sxg", // Sexagintillion, 10^183
    "Usxg", // Unsexagintillion, 10^186
    "Dsxg", // Duosexagintillion, 10^189
    "Tsxg", // Tresexagintillion, 10^192
    "Qasxg", // Quattuorsexagintillion, 10^195
    "Qisxg", // Quinquasexagintillion, 10^198
    "Sxsxg", // Sexsexagintillion, 10^201
    "Spsxg", // Septensexagintillion, 10^204
    "Ocsxg", // Octosexagintillion, 10^207
    "Nosxg", // Novemsexagintillion, 10^210
    "Spg", // Septuagintillion, 10^213
    "Uspg", // Unseptuagintillion, 10^216
    "Dspg", // Duoseptuagintillion, 10^219
    "Tspg", // Treseptuagintillion, 10^222
    "Qaspg", // Quattuorseptuagintillion, 10^225
    "Qispg", // Quinquaseptuagintillion, 10^228
    "Sxspg", // Sexseptuagintillion, 10^231
    "Spspg", // Septenseptuagintillion, 10^234
    "Ocspg", // Octoseptuagintillion, 10^237
    "Nospg", // Novemseptuagintillion, 10^240
    "Ocg", // Octogintillion, 10^243
    "Uocg", // Unoctogintillion, 10^246
    "Docg", // Duooctogintillion, 10^249
    "Tocg", // Tresoctogintillion, 10^252
    "Qaocg", // Quattuoroctogintillion, 10^255
    "Qiocg", // Quinquaoctogintillion, 10^258
    "Sxocg", // Sexoctogintillion, 10^261
    "Spocg", // Septenoctogintillion, 10^264
    "Ococg", // Octooctogintillion, 10^267
    "Noocg", // Novemoctogintillion, 10^270
    "Nog", // Nonagintillion, 10^273
    "Unog", // Unnonagintillion, 10^276
    "Dnog", // Duononagintillion, 10^279
    "Tnog", // Tresnonagintillion, 10^282
    "Qanog", // Quattuornonagintillion, 10^285
    "Qinog", // Quinquanonagintillion, 10^288
    "Sxnog", // Sexnonagintillion, 10^291
    "Spnog", // Septennonagintillion, 10^294
    "Ocnog", // Octononagintillion, 10^297
    "Nonog", // Novemnonagintillion, 10^300
    "Ctg", // Centillion, 10^303
    "Uctg", // Uncentillion, 10^306
    "Ctc", // Centicentillion, 10^309
  ];

  const fullSuffixes = [
    "",
    "Thousand",
    "Million",
    "Billion",
    "Trillion",
    "Quadrillion",
    "Quintillion",
    "Sextillion",
    "Septillion",
    "Octillion",
    "Nonillion",
    "Decillion",
    "Undecillion",
    "Duodecillion",
    "Tredecillion",
    "Quattuordecillion",
    "Quindecillion",
    "Sexdecillion",
    "Septendecillion",
    "Octodecillion",
    "Novemdecillion",
    "Vigintillion",
    "Unvigintillion", // 10^66
    "Duovigintillion", // 10^69
    "Tresvigintillion", // 10^72
    "Quattuorvigintillion", // 10^75
    "Quinquavigintillion", // 10^78
    "Sexvigintillion", // 10^81
    "Septenvigintillion", // 10^84
    "Octovigintillion", // 10^87
    "Novemvigintillion", // 10^90
    "Trigintillion", // 10^93
    "Untrigintillion", // 10^96
    "Duotrigintillion", // 10^99
    "Trestrigintillion", // 10^102
    "Quattuortrigintillion", // 10^105
    "Quinquatrigintillion", // 10^108
    "Sextrigintillion", // 10^111
    "Septentrigintillion", // 10^114
    "Octotrigintillion", // 10^117
    "Novemtrigintillion", // 10^120
    "Quadragintillion", // 10^123
    "Unquadragintillion", // 10^126
    "Duoquadragintillion", // 10^129
    "Tresquadragintillion", // 10^132
    "Quattuorquadragintillion", // 10^135
    "Quinquaquadragintillion", // 10^138
    "Sexquadragintillion", // 10^141
    "Septenquadragintillion", // 10^144
    "Octoquadragintillion", // 10^147
    "Novemquadragintillion", // 10^150
    "Quinquagintillion", // 10^153
    "Unquinquagintillion", // 10^156
    "Duoquinquagintillion", // 10^159
    "Tresquinquagintillion", // 10^162
    "Quattuorquinquagintillion", // 10^165
    "Quinquaquinquagintillion", // 10^168
    "Sexquinquagintillion", // 10^171
    "Septenquinquagintillion", // 10^174
    "Octoquinquagintillion", // 10^177
    "Novemquinquagintillion", // 10^180
    "Sexagintillion", // 10^183
    "Unsexagintillion", // 10^186
    "Duosexagintillion", // 10^189
    "Tresexagintillion", // 10^192
    "Quattuorsexagintillion", // 10^195
    "Quinquasexagintillion", // 10^198
    "Sexsexagintillion", // 10^201
    "Septensexagintillion", // 10^204
    "Octosexagintillion", // 10^207
    "Novemsexagintillion", // 10^210
    "Septuagintillion", // 10^213
    "Unseptuagintillion", // 10^216
    "Duoseptuagintillion", // 10^219
    "Treseptuagintillion", // 10^222
    "Quattuorseptuagintillion", // 10^225
    "Quinquaseptuagintillion", // 10^228
    "Sexseptuagintillion", // 10^231
    "Septenseptuagintillion", // 10^234
    "Octoseptuagintillion", // 10^237
    "Novemseptuagintillion", // 10^240
    "Octogintillion", // 10^243
    "Unoctogintillion", // 10^246
    "Duooctogintillion", // 10^249
    "Tresoctogintillion", // 10^252
    "Quattuoroctogintillion", // 10^255
    "Quinquaoctogintillion", // 10^258
    "Sexoctogintillion", // 10^261
    "Septenoctogintillion", // 10^264
    "Octooctogintillion", // 10^267
    "Novemoctogintillion", // 10^270
    "Nonagintillion", // 10^273
    "Unnonagintillion", // 10^276
    "Duononagintillion", // 10^279
    "Tresnonagintillion", // 10^282
    "Quattuornonagintillion", // 10^285
    "Quinquanonagintillion", // 10^288
    "Sexnonagintillion", // 10^291
    "Septennonagintillion", // 10^294
    "Octononagintillion", // 10^297
    "Novemnonagintillion", // 10^300
    "Centillion", // 10^303
    "Uncentillion", // 10^306
    "Centicentillion", // 10^309
  ];

  const magnitude = Math.floor(Math.log10(num) / 3);

  if (magnitude === 0) {
    return num % 1 === 0
      ? num.toString()
      : num.toFixed(places).replace(/\.?0+$/, "");
  }

  const abbreviatedValue = num / Math.pow(1000, magnitude);
  const suffix = isFull ? fullSuffixes[magnitude] : suffixes[magnitude];

  if (!suffix) {
    return num.toExponential();
  }

  if (abbreviatedValue % 1 === 0) {
    return `${Math.round(abbreviatedValue)}${isFull ? ` ${suffix}` : suffix}`;
  }

  const formattedValue =
    places === 0
      ? abbreviatedValue.toFixed(0)
      : abbreviatedValue.toFixed(places).replace(/\.?0+$/, "");

  return `${formattedValue}${isFull ? ` ${suffix}` : suffix}`;
}

export function formatCash(
  number: number,
  emoji?: string,
  bold?: boolean
): string;

export function formatCash(number: number, bold?: boolean): string;

export function formatCash(
  number: number = 0,
  emoji: string | boolean = "💵",
  bold = false
) {
  if (typeof emoji === "boolean") {
    bold = emoji;
    emoji = "💵";
  }
  return `${bold ? "**" : ""}${
    number > 999 ? `($${abbreviateNumber(number)}) ` : ""
  }$${Number(number).toLocaleString()}${emoji || "💵"}${bold ? "**" : ""}`;
}

export function formatValue(
  number: number,
  emoji?: string,
  bold?: boolean
): string;

export function formatValue(number: number, bold?: boolean): string;

export function formatValue(
  number: number = 0,
  emoji: string | boolean = "🎲",
  bold = false
) {
  if (typeof emoji === "boolean") {
    bold = emoji;
    emoji = "🎲";
  }
  return `${bold ? "**" : ""}${
    number > 999 ? `(${emoji || "🎲"}${abbreviateNumber(number)}) ` : ""
  }${emoji || "🎲"}${Number(number).toLocaleString()}${bold ? "**" : ""}`;
}

export function formatTimeSentence(ms: number, showMs = false): string {
  const baseUnits = [
    { label: "year", ms: 365 * 24 * 60 * 60 * 1000 },
    { label: "day", ms: 24 * 60 * 60 * 1000 },
    { label: "hour", ms: 60 * 60 * 1000 },
    { label: "minute", ms: 60 * 1000 },
    { label: "second", ms: 1000 },
  ];

  const allUnits = showMs
    ? [...baseUnits, { label: "millisecond", ms: 1 }]
    : baseUnits;

  const parts: string[] = [];

  let remainingMs = ms;

  for (const { label, ms: unitMs } of allUnits) {
    const value = Math.floor(remainingMs / unitMs);
    if (value > 0) {
      parts.push(`${value} ${label}${value > 1 ? "s" : ""}`);
      remainingMs %= unitMs;
    }
  }

  if (parts.length === 0 && !showMs && ms > 0 && ms < 1000) {
    parts.push(`${ms} millisecond${ms !== 1 ? "s" : ""}`);
  }

  if (parts.length === 0) return "";

  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
}

export function formatTimeSentenceV2(
  ms: number,
  { abbr = false } = {}
): string {
  const baseUnits = [
    { label: abbr ? "y" : "year", ms: 365 * 24 * 60 * 60 * 1000 },
    { label: abbr ? "d" : "day", ms: 24 * 60 * 60 * 1000 },
    { label: abbr ? "h" : "hour", ms: 60 * 60 * 1000 },
    { label: abbr ? "m" : "minute", ms: 60 * 1000 },
    { label: abbr ? "s" : "second", ms: 1000 },
  ];

  const allUnits = baseUnits;

  const parts: string[] = [];

  let remainingMs = ms;

  for (const { label, ms: unitMs } of allUnits) {
    const value = Math.floor(remainingMs / unitMs);
    if (value > 0) {
      parts.push(
        `${value}${abbr ? "" : " "}${label}${value > 1 && !abbr ? "s" : ""}`
      );
      remainingMs %= unitMs;
    }
  }

  if (parts.length === 0) return "";

  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} ${abbr ? "" : "and "}${parts[1]}`;
  return `${parts.slice(0, -1).join(abbr ? " " : ", ")}${abbr ? "" : ","} ${
    abbr ? "" : "and "
  }${parts[parts.length - 1]}`;
}

export function getMinimumChange(total: number) {
  const exp = Math.floor(Math.log2(Math.abs(total)));
  return Math.pow(2, exp - 52);
}

export function isNoChange(change: number, total: number) {
  return change < getMinimumChange(total);
}
