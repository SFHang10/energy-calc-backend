/**
 * Applies Wix imageUrl updates and removals to COMPANIES_INLINE in the Case Study Finder bundle.
 */
const fs = require("fs");
const path = require("path");

const bundlePath = path.join(
  __dirname,
  "..",
  "HTMLS GWM GWB",
  "European Company - Case Study Finder (Standalone) - Wix bundle.html"
);

const DELETE_NAMES = new Set([
  "Bulb Energy",
  "Google DeepMind (Climate AI)",
  "Makani Power (Google X)",
  "Microsoft Climate Innovation Fund",
  "Salesforce Sustainability Cloud",
  "SolarCity (Tesla Energy)",
  "Spotify (Social Impact)",
  "Suez",
]);

/** name -> Wix imageUrl (from user list) */
const IMAGE_URL_BY_NAME = {
  "5 Gyres Institute":
    "https://static.wixstatic.com/media/c123de_e7fc85f4c19a4e22872d465cb6b3ea58~mv2.jpg",
  "Accenture Sustainability Services":
    "https://static.wixstatic.com/media/c123de_f5b85bfd2d6a442faa80a2a697421df2~mv2.jpg",
  "AEB Amsterdam (Waste-to-Energy)":
    "https://static.wixstatic.com/media/c123de_158bdffb652449209f2626ba66e25b7d~mv2.jpg",
  "Aga Khan Development Network (AKDN)":
    "https://static.wixstatic.com/media/c123de_9cc4705ecb5f46408486acee4c74ae9d~mv2.jpg",
  "Agri-Kulture":
    "https://static.wixstatic.com/media/c123de_998a6075c61e4340b23aac9b97b5cd90~mv2.jpg",
  "Anthesis Group":
    "https://static.wixstatic.com/media/c123de_9b4c9fea58d24ddab90f2ce5f4216992~mv2.jpg",
  "Bain & Company (Sustainability Practice)":
    "https://static.wixstatic.com/media/c123de_3f89b85cf3be4a988efa04c4163d1a98~mv2.jpg",
  "Bboxx (East Africa)":
    "https://static.wixstatic.com/media/c123de_8c65573bd0114d7b9f9896986ee6fa67~mv2.jpg",
  "BedZED (Beddington Zero Energy Development)":
    "https://static.wixstatic.com/media/c123de_b7ff3b1c13e74cef890b163c2622161d~mv2.jpg",
  "Better Place Forest":
    "https://static.wixstatic.com/media/c123de_fdeffdf7764444e59d1954d9e534507e~mv2.jpg",
  "Bhutan Carbon Neutral Policy":
    "https://static.wixstatic.com/media/c123de_a2ce9390d8ee431d8f5f2ccaa1b1c885~mv2.jpg",
  "Biocidade Curitiba":
    "https://static.wixstatic.com/media/c123de_2c96cab342774454b66f6acd9339001d~mv2.jpg",
  "Biogas for Better Life":
    "https://static.wixstatic.com/media/c123de_2cf4abc5beaf43d993007da23cbc54ad~mv2.jpg",
  "Biomimicry Institute":
    "https://static.wixstatic.com/media/c123de_0d2f5f12ff204e8d8b511fce468d0f4c~mv2.jpg",
  "Bioversity International":
    "https://static.wixstatic.com/media/c123de_509843e54e43438e8fb5c1583a2dfcf6~mv2.jpg",
  "BlueGreen Future":
    "https://static.wixstatic.com/media/c123de_9c0e061bc72b4964a2fe107b3a6b6d0c~mv2.jpg",
  "Bosch Climate Solutions":
    "https://static.wixstatic.com/media/c123de_f2694b59ab154b33ad89c827dbed6211~mv2.jpg",
  "CAMCO Clean Energy":
    "https://static.wixstatic.com/media/c123de_4a425f02a63b447eadba556207ebf3d8~mv2.jpg",
  Citymapper:
    "https://static.wixstatic.com/media/c123de_af1b2870e6cd4b57b6adac3c36c422f0~mv2.jpg",
  "CLEAN (Clean Energy Access Network)":
    "https://static.wixstatic.com/media/c123de_470fdd80e7af4ad9b6b3269198bdd564~mv2.jpg",
  Commonplace:
    "https://static.wixstatic.com/media/c123de_fedc3f8ebb1440dda8efa64b8c178b0e~mv2.jpg",
  "Cycling UK":
    "https://static.wixstatic.com/media/c123de_43edf1ab716e4c8da40dc023cf7f2ec9~mv2.jpg",
  "De Groene Reus":
    "https://static.wixstatic.com/media/c123de_53ce1f0da5fd4fe386d25e6b18b122f1~mv2.jpg",
  "Deep Sky":
    "https://static.wixstatic.com/media/c123de_2312b1f6021f4348876f12f9307b3390~mv2.jpg",
  "Deloitte Climate & Sustainability":
    "https://static.wixstatic.com/media/c123de_816d3c7e01ef477e9747ef8f9838d40a~mv2.jpg",
  "DRIFT (Dutch Research Institute for Transitions)":
    "https://static.wixstatic.com/media/c123de_a27174d8a71f4a0ab74467831e8538b0~mv2.jpg",
  "Eco Mark Japan":
    "https://static.wixstatic.com/media/c123de_627ad1d846cd4d0282c7b3337ac42b2f~mv2.jpg",
  Ecometrica:
    "https://static.wixstatic.com/media/c123de_d24785e63e2d4516806765465c143785~mv2.jpg",
  "EcoPlanet Zambia":
    "https://static.wixstatic.com/media/c123de_0925649459974b35903d085e1398b06c~mv2.jpg",
  "Ecosia Germany (Reforestation Sites)":
    "https://static.wixstatic.com/media/c123de_3c09f1de155a4441b9cfc2982a3a7cdd~mv2.jpg",
  "Ecostar Cambodia":
    "https://static.wixstatic.com/media/c123de_b5f8f7ac73c541c983afeaea59f20b9d~mv2.jpg",
  Farmhack:
    "https://static.wixstatic.com/media/c123de_ecaaf59e6a8c402fa5ba28a5ea66ab33~mv2.jpg",
  FoodMesh:
    "https://static.wixstatic.com/media/c123de_a175a144a5bc4618acfa430cb4e65f40~mv2.jpg",
  "Fraunhofer Institute for Solar Energy Systems":
    "https://static.wixstatic.com/media/c123de_c6ea44f149b74cc99b7c97a83bcdd88c~mv2.jpg",
  "Friends of the Earth":
    "https://static.wixstatic.com/media/c123de_a511bf7bc1174821985fb3d3e458f021~mv2.jpg",
  "Full Harvest":
    "https://static.wixstatic.com/media/c123de_2870ad1c48ae477eaf699fa741b53367~mv2.jpg",
  "Future Fit Business Benchmark":
    "https://static.wixstatic.com/media/c123de_9c5fbffb1b6c495984d505fd7111802c~mv2.jpg",
  "GEF (Global Environment Facility)":
    "https://static.wixstatic.com/media/c123de_685d2a78e55e41a99adc647ffbc6b77e~mv2.jpg",
  "Global Alliance for Improved Nutrition (GAIN)":
    "https://static.wixstatic.com/media/c123de_2d15022597634e22bd1ebb2149349253~mv2.jpg",
  "Global Witness":
    "https://static.wixstatic.com/media/c123de_58bf73eb86524a6e8b49360d4db601c5~mv2.jpg",
  "GroenLinks (GreenLeft Municipal Projects)":
    "https://static.wixstatic.com/media/c123de_5be1b6ed8e304d5bb79e2a30f0a3394f~mv2.jpg",
  "Hermes EOS":
    "https://static.wixstatic.com/media/c123de_4a208e3d72d4417483ec3b7cd441c363~mv2.jpg",
  "Hitachi Green Innovation":
    "https://static.wixstatic.com/media/c123de_d6cb3a0e46864a92bde02b8655c9cbcc~mv2.jpg",
  "Indonesian Peatland Restoration Agency":
    "https://static.wixstatic.com/media/c123de_4338824a69d84da6b03191f9b47e3585~mv2.jpg",
  "Initiative for Smallholder Finance":
    "https://static.wixstatic.com/media/c123de_d8d9d08bf7d9446ab2036fe6b02fcfd0~mv2.jpg",
  "International Institute for Sustainable Development (IISD)":
    "https://static.wixstatic.com/media/c123de_3081a42021a842448bfa5c0ce5f9d642~mv2.jpg",
  "Interreg NWE (North West Europe)":
    "https://static.wixstatic.com/media/c123de_b7170238c5c34c2c96e1e7133b574d60~mv2.jpg",
  "ITC Limited (Agribusiness Division)":
    "https://static.wixstatic.com/media/c123de_607a97020498499c8fa7fb5cdfb695ca~mv2.jpg",
  "Japan COOL BIZ Campaign":
    "https://static.wixstatic.com/media/c123de_1f0bca34dfe649e2b31f99f76e54ab8e~mv2.jpg",
  "Kenya M-Pesa Green Finance":
    "https://static.wixstatic.com/media/c123de_b9655fa6ee66498aaba46ef083efced0~mv2.jpg",
  "Kenyan Wildlife Service":
    "https://static.wixstatic.com/media/c123de_7f3684ee78914128809810a2dd24fb1b~mv2.jpg",
  "LG Energy Solution (Sustainable Batteries)":
    "https://static.wixstatic.com/media/c123de_36abd1e38ec54feebe47318e13f21ebe~mv2.jpg",
  "Living Building Challenge":
    "https://static.wixstatic.com/media/c123de_31941d5ce6144b5cb4fdc35908876a99~mv2.jpg",
  "Locally Grown (Herenboeren)":
    "https://static.wixstatic.com/media/c123de_e1043615b6d7424eab5e76fffe96d84a~mv2.jpg",
  "Loop Industries":
    "https://static.wixstatic.com/media/c123de_79d35353b394440aa13ac76a0b8c987b~mv2.jpg",
  "Maldives Clean Environment Project":
    "https://static.wixstatic.com/media/c123de_320da95a0f44447e9a6927fbfc58fc99~mv2.jpg",
  "Metabolic Amsterdam":
    "https://static.wixstatic.com/media/c123de_50665dc302f341348b7adf72113647e4~mv2.jpg",
  Mightybytes:
    "https://static.wixstatic.com/media/c123de_024590ea548f40858610b33f13f39e02~mv2.jpg",
  "National Solar Mission (India)":
    "https://static.wixstatic.com/media/c123de_6dd90b4aa55c4116b06eb73ee540c52c~mv2.jpg",
  "Nuon (Vattenfall Netherlands)":
    "https://static.wixstatic.com/media/c123de_58fce98a33244bf3bdb5bb0e1f0501da~mv2.jpg",
  "Okeanos Foundation":
    "https://static.wixstatic.com/media/c123de_2e158d3c8bfc4d12a1ffd178fb51538b~mv2.jpg",
  "Pacific Community (SPC)":
    "https://static.wixstatic.com/media/c123de_82f57f2c35db4c3aad08c4d39eb65c10~mv2.jpg",
  "Pacific Possible (World Bank Pacific)":
    "https://static.wixstatic.com/media/c123de_d4b30b7dabde4eb1a4d638c5c2aa26a8~mv2.jpg",
  "Planetly (OneTrust)":
    "https://static.wixstatic.com/media/c123de_b33670dddeba4ccba863ecfc9a5003ba~mv2.jpg",
  "Platform Duurzame Biobrandstoffen":
    "https://static.wixstatic.com/media/c123de_6288866db0794575b3d85e8c61149ea2~mv2.jpg",
  "Port of Rotterdam (Circular Economy Hub)":
    "https://static.wixstatic.com/media/c123de_1dbd2603d39b48fd8d97ed9e25c55d9f~mv2.jpg",
  "Porvoo Agreement Cities":
    "https://static.wixstatic.com/media/c123de_d4fb918412fa4b0e81dffb4ba5c369d1~mv2.jpg",
  "Practical Action Bolivia":
    "https://static.wixstatic.com/media/c123de_34c4fd9c9a0d45968af2b1f2760897d3~mv2.jpg",
  "Practical Action East Africa":
    "https://static.wixstatic.com/media/c123de_6d46d6f96b75424ebdb361b077b576b9~mv2.jpg",
  "Practical Ocean":
    "https://static.wixstatic.com/media/c123de_6576c31c06234caba6ac0aa0b6178c72~mv2.jpg",
  "Rang De":
    "https://static.wixstatic.com/media/c123de_902ec339ce2f403eb624b5a4abcba146~mv2.jpg",
  "Rebel Energy":
    "https://static.wixstatic.com/media/c123de_f611b51cfe9d4d2f8a36323accd43369~mv2.jpg",
  "REDD+ Programme (India)":
    "https://static.wixstatic.com/media/c123de_edd7549506b8474e9838f02710632b30~mv2.jpg",
  "Renewables Academy (RENAC)":
    "https://static.wixstatic.com/media/c123de_ba4c2b7f4834471a9a423c99f8e5d92a~mv2.jpg",
  Renewlogy:
    "https://static.wixstatic.com/media/c123de_45c7cb4e931b41639c4e9ec5ca39b6ec~mv2.jpg",
  "Roof Water Farm Berlin":
    "https://static.wixstatic.com/media/c123de_3d037b276afe4b63a09133f70b59d9d0~mv2.jpg",
  "Sankalp Forum":
    "https://static.wixstatic.com/media/c123de_e77710d59a114e14a73302f429027f0f~mv2.jpg",
  "Sapient Industries":
    "https://static.wixstatic.com/media/c123de_347cbe925e464ce581ec7ce199194efc~mv2.jpg",
  "Schneider Electric Foundation":
    "https://static.wixstatic.com/media/c123de_2fe4c06843fe44a6ad4cd6296a65116c~mv2.jpg",
  "Sidewalk Labs (Alphabet)":
    "https://static.wixstatic.com/media/c123de_3c4556983de5409aa13f17e4244f80a6~mv2.jpg",
  "Simpa Networks":
    "https://static.wixstatic.com/media/c123de_553ff386a5a14750b6dfd0ed2cd156c7~mv2.jpg",
  "Skoll Foundation":
    "https://static.wixstatic.com/media/c123de_454c37efd40346b9b6f3fd8f196caf9b~mv2.jpg",
  "Small Grants Programme (GEF)":
    "https://static.wixstatic.com/media/c123de_3c5347ebefab4e3081e99f79af225195~mv2.jpg",
  "Smart Power India":
    "https://static.wixstatic.com/media/c123de_7fc45be2d55f49a084cbb387fcc0cfdb~mv2.jpg",
  "Social Value UK":
    "https://static.wixstatic.com/media/c123de_96b7d18331ba4718b5979056102f690c~mv2.jpg",
  "Songdo International Business District":
    "https://static.wixstatic.com/media/c123de_a51ed0747a6b48118b517c86d494b4fa~mv2.jpg",
  "Source Intelligence":
    "https://static.wixstatic.com/media/c123de_3b252572001849dba24e62da124e74b3~mv2.jpg",
  Sourcemap:
    "https://static.wixstatic.com/media/c123de_e70a55c9e766454ab56c2d5a2dadb86d~mv2.jpg",
  "Spark (formerly IBM Smarter Cities)":
    "https://static.wixstatic.com/media/c123de_3a0d1f3645c740499f913d3eeaec09a1~mv2.jpg",
  "Springtij Forum":
    "https://static.wixstatic.com/media/c123de_094a2511e4884b209e48a4f824747d6b~mv2.jpg",
  SunCulture:
    "https://static.wixstatic.com/media/c123de_127c9d9364d7458d83f3137210c64402~mv2.jpg",
  "Sundarban Tiger Reserve":
    "https://static.wixstatic.com/media/c123de_0cf28ea2baba4eb38f32a5bad11a8bac~mv2.jpg",
  Sunpower:
    "https://static.wixstatic.com/media/c123de_4a7ebff255db49d59e53c1ede5a20c96~mv2.jpg",
  "SunPower (Maxeon Solar)":
    "https://static.wixstatic.com/media/c123de_836e3ab43c4747a29180475ab800f2a4~mv2.jpg",
  "Sustainable Apparel Coalition":
    "https://static.wixstatic.com/media/c123de_2a595d47e4374313a5a1b1e97624f6c3~mv2.jpg",
  "Taiwan Circular Economy Promotion Office":
    "https://static.wixstatic.com/media/c123de_27cfa2d3529b4bfc931cb9682cdc10f5~mv2.jpg",
  "Task Force on Climate-related Financial Disclosures (TCFD)":
    "https://static.wixstatic.com/media/c123de_5a39343871e84addb80be5b23feaa4a0~mv2.jpg",
  Tauw:
    "https://static.wixstatic.com/media/c123de_7c0782c64adf4f6ea421a16fb7e9c86b~mv2.jpg",
  "The Great Barrier Reef Marine Park Authority":
    "https://static.wixstatic.com/media/c123de_85e67cba4bb74dca895eb845cc7c6689~mv2.jpg",
  "The Leap (New Weather Institute)":
    "https://static.wixstatic.com/media/c123de_6f05cd32603944c88cdce81d34152dd5~mv2.jpg",
  "The Rainforest Trust":
    "https://static.wixstatic.com/media/c123de_ea712d93231e43e0bf7667de4436cf06~mv2.jpg",
  "Transport for London (Zero Emission Zones)":
    "https://static.wixstatic.com/media/c123de_8c55b5abe88748e9816e85d5e7ec8e61~mv2.jpg",
  "UN-Habitat":
    "https://static.wixstatic.com/media/c123de_82a8adbc204545eb824cbdd35f9111d5~mv2.jpg",
  "Urgenda (Climate Action)":
    "https://static.wixstatic.com/media/c123de_7f8316cec6e34a2b80f93409abf2f839~mv2.jpg",
  Vandebron:
    "https://static.wixstatic.com/media/c123de_18affcff48504645aeb8011c20a37456~mv2.jpg",
  "Verdant Power":
    "https://static.wixstatic.com/media/c123de_d7bec3c19d3e40219fc646dee6158aa4~mv2.jpg",
  "Vulcan Inc. (Paul Allen Ocean Initiative)":
    "https://static.wixstatic.com/media/c123de_09b799ea33504cccad0c0f2cf208c5ca~mv2.jpg",
  "Waterkeeper Alliance":
    "https://static.wixstatic.com/media/c123de_ce2bbae44df74b0185c3bd7c154e32c5~mv2.jpg",
  Watershed:
    "https://static.wixstatic.com/media/c123de_5529aa622ae246d591bc64422e67f409~mv2.jpg",
  WaterWorX:
    "https://static.wixstatic.com/media/c123de_a5b3c025b10549d28f9dd16091ad9b37~mv2.jpg",
};

function extractCompaniesArrayBounds(html) {
  const marker = "window.COMPANIES_INLINE=";
  const i = html.indexOf(marker);
  if (i === -1) throw new Error("COMPANIES_INLINE not found");
  let start = i + marker.length;
  while (start < html.length && /\s/.test(html[start])) start++;
  if (html[start] !== "[") throw new Error("Expected [");
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let j = start; j < html.length; j++) {
    const ch = html[j];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') {
      inStr = true;
      continue;
    }
    if (ch === "[") depth++;
    if (ch === "]") {
      depth--;
      if (depth === 0) {
        let end = j + 1;
        if (html[end] === ";") end++;
        return { start: i, arrayStart: start, closeBracket: j, endExclusive: end };
      }
    }
  }
  throw new Error("Unclosed COMPANIES_INLINE array");
}

function parseCompanies(html) {
  const { arrayStart, closeBracket } = extractCompaniesArrayBounds(html);
  return JSON.parse(html.slice(arrayStart, closeBracket + 1));
}

function main() {
  const html = fs.readFileSync(bundlePath, "utf8");
  let companies = parseCompanies(html);

  const before = companies.length;

  const notFoundDelete = [];
  for (const n of DELETE_NAMES) {
    if (!companies.some((c) => c.name === n)) notFoundDelete.push(n);
  }
  if (notFoundDelete.length) {
    console.error("Delete names not found in data:", notFoundDelete);
    process.exit(1);
  }

  companies = companies.filter((c) => !DELETE_NAMES.has(c.name));

  const notFoundUrl = [];
  let updated = 0;
  for (const c of companies) {
    const url = IMAGE_URL_BY_NAME[c.name];
    if (url) {
      c.imageUrl = url;
      updated++;
    }
  }
  for (const name of Object.keys(IMAGE_URL_BY_NAME)) {
    if (!companies.some((c) => c.name === name)) notFoundUrl.push(name);
  }
  if (notFoundUrl.length) {
    console.error("Update names not found after delete (check spelling):", notFoundUrl);
    process.exit(1);
  }

  const bounds = extractCompaniesArrayBounds(html);
  const newChunk =
    "window.COMPANIES_INLINE=" + JSON.stringify(companies) + ";";

  const out = html.slice(0, bounds.start) + newChunk + html.slice(bounds.endExclusive);

  const backupPath =
    bundlePath +
    ".bak-" +
    new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19) +
    ".html";
  fs.copyFileSync(bundlePath, backupPath);

  fs.writeFileSync(bundlePath, out, "utf8");

  console.log("Backup:", backupPath);
  console.log("Companies before:", before, "after:", companies.length, "(removed", before - companies.length + ")");
  console.log("imageUrl set for", updated, "rows");
}

main();
