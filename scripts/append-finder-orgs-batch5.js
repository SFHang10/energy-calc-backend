/**
 * One-time / idempotent: append case-study finder orgs from batch 5 (Apr 2026).
 * Skips any name that already exists. Run: node scripts/append-finder-orgs-batch5.js
 */
const fs = require("fs");
const path = require("path");

const JSON_PATH = path.join(__dirname, "..", "data", "companies.json");

function wix(mediaId, ext = "jpg") {
  return `https://static.wixstatic.com/media/c123de_${mediaId}~mv2.${ext}`;
}

const DEFAULT = {
  country: "Global",
  city: "Global",
  lng: 0,
  lat: 20,
  region: "Global",
  stats: { savings: "", energy: "", co2: "", payback: "" },
};

/** name, mediaId, sector, desc, ext? */
const ADD = [
  ["Regen Organics", "6e09cfb9c59d4b21abdce593259d52e8", "circular-economy", "Organic waste-to-value and regenerative supply chain programmes."],
  ["Sanku (Project Healthy Children)", "55831e2233eb4d98992e6660aa6037c8", "nutrition", "Fights malnutrition through micronutrient fortification of staple foods."],
  ["Global Energy Alliance for People and Planet", "89bf3ca0415340ea90769eeace33ec94", "climate-finance", "Accelerates clean energy transitions in emerging economies.", "png"],
  ["Governance & Accountability Institute", "dc30563e689445a6a12cfb3cf82324fa", "reporting", "Corporate sustainability disclosure, ESG research, and accountability frameworks."],
  ["Soil Association", "c4d28df5fd51498d8d4b37532f260168", "food-systems", "UK charity promoting organic farming, sustainable forestry, and healthy food."],
  ["Food and Land Use Coalition", "06ec7b65d34d4dfabca532534288e2b6", "food-systems", "Global coalition aligning food and land-use systems with climate and development goals."],
  ["EAT Forum", "952b692f2f384da488120a2791806a3c", "food-systems", "Science-based platform linking food, health, and sustainability policy."],
  ["Good Catch Foods", "7e31d72fb0684a86812cc1d9c6269cc5", "food-tech", "Plant-based seafood alternatives lowering pressure on ocean fisheries."],
  ["NotCo", "92355133f60f4ab0a6557650b015cc64", "food-tech", "AI-driven formulation of plant-based alternatives to animal products."],
  ["Calysta", "26d1a52659fe4c8693e24621b25ed7ca", "food-tech", "Microbial protein and feed ingredients reducing reliance on wild-caught fishmeal."],
  ["AllotMe", "cfb963c83d9548ba9174c2e51d022969", "urban-ag", "Connects underused urban land with growers for local food production."],
  ["UrbanFarmer", "d4e7ea0b158e47f092793b6dd56bcdc4", "urban-ag", "Urban farming systems, training, and controlled-environment food production."],
  ["Bowery Farming", "29be325d5f6a487a93dba69d47ac736e", "agtech", "Indoor vertical farming with precision control of light, water, and nutrients."],
  ["Infarm", "31a25867842f4761954a3ab707bfb1fa", "agtech", "Modular in-store and urban vertical farms for hyper-local herbs and greens."],
  ["AeroFarms", "7e7f5b2750ee4c228a349143e9bd8db4", "agtech", "Aeroponic vertical farming for high-yield, low-water leafy greens."],
  ["Plantagon", "f179cfd4753446d2b483e3c2161ffc06", "urban-ag", "Integrated urban greenhouse and workspace concepts for city food production."],
  ["Sunfire", "c1483f34bc344f0aa43c7a7b062ab6b6", "hydrogen", "Electrolysers and power-to-X systems for renewable hydrogen and e-fuels."],
  ["Nel Hydrogen", "21b7debc7ade4407bf1fd13f25cf1a73", "hydrogen", "Electrolyser manufacturing and hydrogen fuelling infrastructure."],
  ["ITM Power", "f628926aaefd49ed9fc43458562cba56", "hydrogen", "PEM electrolysers for grid balancing and green hydrogen production."],
  ["Orion Energy Systems", "db37a652f89b44afa752e5a42d18a0f4", "efficiency", "LED retrofit and intelligent controls for commercial and industrial buildings."],
  ["Enphase Energy", "0ea7e3f29d864c7d9fba3e83ecebd255", "solar", "Microinverter-based residential and commercial solar systems."],
  ["SolarEdge", "b9d357f92d9a42cf83e36f5df4e45b9c", "solar", "Power optimisers, inverters, and monitoring for PV installations."],
  ["ChargePoint", "0d5438f5807b4d398e38fd2a6889f520", "ev", "Networked EV charging hardware and software for fleets and public sites."],
  ["Wallbox", "b257fed5ba7e43bbb720bd757485731b", "ev", "Home and business smart EV chargers and energy management."],
  ["Sono Motors", "66de1b0c92644d64b107a6843770291b", "ev", "Solar integration concepts for electric light vehicles."],
  ["Riversimple", "7397c2481add4c5785b1c8d64eedcea2", "mobility", "Hydrogen fuel cell urban mobility and circular vehicle design."],
  ["Vertical Aerospace", "94dcbc7ff4814a0fb3c8008c572d77b1", "aviation", "Electric vertical take-off and landing (eVTOL) aircraft development."],
  ["Heart Aerospace", "3d68790141704213a6e83c6bb09610fb", "aviation", "Electric regional aircraft targeting short-haul decarbonisation."],
  ["ZeroAvia", "8c23f667b7cc4e4f8d1c1783f23c005b", "aviation", "Hydrogen-electric powertrains for aviation."],
  ["CMB.TECH", "4426e60ed0924e58a90f7c74b84e450a", "shipping", "Dual-fuel and hydrogen marine engines and harbour applications."],
  ["Maersk (Green Shipping)", "5734c824fb714a4494bd88c03bda6e2e", "shipping", "Container shipping decarbonisation, methanol vessels, and logistics efficiency."],
  ["Windship Technology", "0ade6dc0948e4935bcd22f0a6ace52f2", "shipping", "Wind-assist and hybrid propulsion systems for commercial shipping."],
  ["World Benchmarking Alliance", "b48a14968b32497e85a1fc768d9b6dec", "governance", "Corporate benchmarks on SDGs, climate, and just transition performance."],
  ["Science Based Targets Initiative", "f6352baeae0b42b58fae9617478aaccc", "governance", "Corporate science-based emissions reduction target validation."],
  ["RE100", "883489f417d745c2901125160deabc26", "renewable-energy", "Corporate commitment to 100% renewable electricity."],
  ["We Mean Business Coalition", "4269943c30ba41858599ea90d479c6e2", "climate-advocacy", "Mobilises business leadership for net-zero policy and implementation."],
  ["The Climate Pledge", "2ad7cac315f44c94a0831e0d021418b2", "climate-advocacy", "Cross-company pledge for net-zero carbon by 2040 and bold climate action."],
  ["Race to Zero", "fea5ad007ad145b8b110d410bfb1abdb", "climate-advocacy", "UN-backed campaign rallying non-state actors toward net-zero credibility."],
  ["Exponential Roadmap Initiative", "f02643ce179446aa8ab11404857aaaf2", "climate-advocacy", "Highlights solutions that can scale exponentially to halve emissions by 2030."],
  ["Rocky Mountain Institute (India)", "932a97b4a08f4a40aef537f6ea3ac150", "clean-energy", "India-focused clean energy and grid programmes (RMI network)."],
  ["Climate Policy Initiative", "fa46200e3b7c4939b3611e5375cb4d1f", "climate-finance", "Analysis and advisory on effective climate and energy finance policy."],
  ["Systemiq (Land & Nature)", "7cc9cd7fd5e14c6f9c2e9abc5d400c95", "nature", "Systemiq workstream on land use, nature, and natural climate solutions."],
  ["The Earthshot Prize", "bce93c7ab78749cc9899de4830d5337f", "climate-advocacy", "Global prize for innovators solving environmental challenges by 2030."],
  ["Bloomberg Philanthropies (Climate)", "933a9f2ae23f4781b61479ef5902a117", "philanthropy", "Philanthropic programmes on clean energy, cities, and climate resilience."],
  ["Packard Foundation (Conservation)", "1af26968a29548fbb878e598c8f55e28", "philanthropy", "Grants for ocean, land, and climate conservation priorities."],
  ["Gordon and Betty Moore Foundation", "b2bfe4c6fc804b1d8f27e8e38e4b573a", "philanthropy", "Science and environmental conservation grantmaking at scale."],
  ["Andes Amazon Fund", "20adb02605a94cf29f4568efc30e2309", "philanthropy", "Protects Andes–Amazon forests and indigenous and local stewardship."],
  ["Leonardo DiCaprio Foundation", "e125f0541f8943f79089c566bd760a87", "philanthropy", "Biodiversity and climate philanthropy (now part of Earth Alliance legacy work)."],
  ["Patagonia Environmental Grants", "849824f20bfb446e8a5f0854416764f3", "philanthropy", "Grassroots environmental grants through Patagonia’s corporate giving."],
  ["11th Hour Project", "74e0091473cc4b099378a6f24a71c819", "philanthropy", "Climate, ocean, and civic engagement funding."],
  ["Laudes Foundation", "ac7eb69245d74c01bf30169ec641b7f3", "philanthropy", "Just transition and regenerative economy philanthropy."],
  ["MAVA Foundation", "99db4eeed62747b08c9d16e4ecc0771c", "philanthropy", "European biodiversity and sustainability philanthropy."],
  ["50L Home Coalition", "9617f696d0654dad9ee16b2f0bc1bd13", "water", "Household water efficiency and sustainable home water use."],
  ["Alliance for Water Stewardship", "29aeff95fe9a4ddc9c8895324241dea3", "water", "International standard for responsible water catchment stewardship."],
  ["2030 Water Resources Group", "ed4a06626da1411daacda93636a1c45d", "water", "Public–private water security partnership hosted by the World Bank."],
  ["IUCN (International Union for Conservation of Nature)", "0ccda41661764cff9998246adb7ba2a8", "biodiversity", "Global authority on nature conservation status and protected areas."],
  ["Amphibian Survival Alliance", "1c4ab3f49eff400fb682ff39c78011bf", "biodiversity", "Partnership to halt amphibian declines and habitat loss."],
  ["Bat Conservation International", "f659368428f948d9ba5d6c25949260c6", "biodiversity", "Research and protection for bats and roosting habitats worldwide."],
  ["Living Oceans Foundation", "3c2e3a12cf864dab9685e29bfce09f5c", "ocean", "Coral reef research, mapping, and marine conservation science."],
  ["Oceana", "2371bff0cc2c44f08f7ea8672128d7cd", "ocean", "Advocacy to protect and restore the world’s oceans."],
  ["Mission Blue", "6a3261b61fd04d84a7ffa6921f9741da", "ocean", "Hope Spots network and ocean literacy led by Dr Sylvia Earle."],
  ["Pur Ocean", "74612406560e4cd5ac9f9c6f7ff5c39f", "ocean", "Ocean protection and awareness initiatives."],
  ["Rainforest Connection", "01fe05f90a30465989ac87c54c0afead", "forest", "Acoustic monitoring and AI to detect illegal logging and biodiversity."],
  ["Global Forest Watch", "31c4d1597f074ddda499082bd7d7d034", "forest", "Near-real-time forest change data and transparency tools."],
  ["MapBiomas", "c4bc061afb704973aabe298b84bce235", "forest", "Annual land-use and land-cover mapping across biomes (Brazil-led network)."],
  ["GLAD Forest Alert (Global Land Analysis and Discovery)", "8cbf16f3c024473e86d4cd4940797e59", "forest", "Satellite-based alerts for tropical forest disturbance."],
  ["Open Food Facts", "c8ebef45fb5e4a068c413d9e6a065ba3", "food-systems", "Open database of food products, nutrition, and environmental scores."],
  ["Jane Goodall's Roots & Shoots", "6626a71ff17144e9bd1f5e357765b517", "education", "Youth-led community action for people, animals, and the environment."],
  ["Eco-Schools Programme", "c11ae05e309849c595c4ba7be339824b", "education", "International green schools certification and student sustainability learning."],
  ["Teach the Future", "c4a501b056e8402ebebe053a48c42cc8", "education", "Integrates climate and futures education into schools."],
  ["Earth Day Network", "73a669cb17444a5297da6699932c2469", "climate-advocacy", "Earth Day mobilisation and environmental civic engagement worldwide."],
  ["350.org", "48274573a89142caaf1f29adda270722", "climate-advocacy", "Grassroots climate campaigns and fossil fuel divestment movement."],
  ["Fridays for Future", "20926f9a67014824b54467fd326aa27f", "climate-advocacy", "Youth climate strikes inspired by Greta Thunberg."],
  ["Extinction Rebellion", "39a8fbd4cb6c456ba0b730eea97f581e", "climate-advocacy", "Non-violent direct action demanding urgent climate and ecological truth."],
  ["Youth Climate Coalition", "f844665bb377428eb5adc6cc4d4d8346", "climate-advocacy", "Youth networks coordinating climate justice and policy engagement."],
  ["Client Earth (Plastics)", "17f9c0e6114d448a8c17bc59f06b0471", "environmental-law", "Legal work on plastic pollution and corporate environmental accountability."],
  ["Global Youth Biodiversity Network", "a0c2cc1a17104419b4be387d6951c5f1", "biodiversity", "Youth voice in the UN Convention on Biological Diversity process."],
  ["The Story of Stuff Project", "c175a3dc2b06482aa8b6e65ae46fbd9a", "climate-advocacy", "Media and campaigns on consumption, waste, and circular economy."],
  ["Plastic Pollution Coalition", "109792ff3c264476a55b939402aa006b", "pollution", "Alliance to reduce single-use plastic and toxic plastic impacts."],
  ["Ocean Conservancy", "2b50c6ece86044138db0fb2434a34331", "ocean", "Coastal clean-ups, fisheries policy, and ocean health programmes."],
];

function main() {
  const raw = fs.readFileSync(JSON_PATH, "utf8");
  const data = JSON.parse(raw);
  const items = data.items;
  if (!Array.isArray(items)) {
    console.error("No items array");
    process.exit(1);
  }
  const existing = new Set(items.map((i) => i.name));
  let maxId = Math.max(...items.map((i) => i.id || 0));
  let added = 0;
  for (const row of ADD) {
    const ext = row.length === 5 && row[4] === "png" ? "png" : "jpg";
    const [name, mediaId, sector, desc] = row.slice(0, 4);
    if (existing.has(name)) {
      console.warn("skip (exists):", name);
      continue;
    }
    items.push({
      ...DEFAULT,
      id: ++maxId,
      name,
      sector,
      desc,
      imageUrl: wix(mediaId, ext),
    });
    existing.add(name);
    added++;
  }
  data.updatedAt = new Date().toISOString();
  fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log("Appended", added, "organisations; total items:", items.length);
}

main();
