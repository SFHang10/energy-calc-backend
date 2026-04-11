/**
 * One-off / batch: set imageUrl (and optional url) on companies.json by exact name match.
 * Run: node scripts/apply-org-wix-images-batch.js
 *
 * Round 2 URLs from Wix Media override round 1 where the same org appears again.
 */
const fs = require("fs");
const path = require("path");

const JSON_PATH = path.join(__dirname, "..", "data", "companies.json");

/** Earlier batch (kept for orgs not listed in round 2) */
const IMAGE_BY_NAME_PREVIOUS = {
  "WWF (World Wildlife Fund)":
    "https://static.wixstatic.com/media/c123de_b7dc0ac391d94c1c8e8dd0fa8c894c94~mv2.jpg",
  Wren: "https://static.wixstatic.com/media/c123de_e84d344ceb4e496cac503832282a5a60~mv2.jpg",
  "World Resources Institute (WRI)":
    "https://static.wixstatic.com/media/c123de_2d7d7f915b6e4fb990613db62480467a~mv2.jpg",
  Vestergaard:
    "https://static.wixstatic.com/media/c123de_f9b00e13f5764b91a8e67da7373d041f~mv2.jpg",
  "Triodos Bank":
    "https://static.wixstatic.com/media/c123de_0f35cfcb8f5e4457a1cea0df543c5d1c~mv2.jpg",
  "The Ocean Cleanup":
    "https://static.wixstatic.com/media/c123de_a585fcc49a9b45d995e9d98704c7c492~mv2.jpg",
  "The Nature Conservancy":
    "https://static.wixstatic.com/media/c123de_a573bd8eb13c4bf6b056ce8dd92c9538~mv2.jpg",
  "Tata Power Solar":
    "https://static.wixstatic.com/media/c123de_19c10a65a70241359b807264465543be~mv2.jpg",
  Terracycle:
    "https://static.wixstatic.com/media/c123de_bcd06ccb07944b43b79f6b0e70f8f610~mv2.jpg",
  Sunrun: "https://static.wixstatic.com/media/c123de_7aecb1c26e4a4f84b05887d0a9f6f0fa~mv2.jpg",
  "Stockholm Environment Institute":
    "https://static.wixstatic.com/media/c123de_8c61267c20c74ee1b3304fda947f64fc~mv2.jpg",
  "Solar Sister":
    "https://static.wixstatic.com/media/c123de_4854dd8b04254c5aa2e824859da97804~mv2.jpg",
  "SEWA (Self Employed Women's Association)":
    "https://static.wixstatic.com/media/c123de_c2587cb7f6444eed9b8eee5d275fd779~mv2.jpg",
  "Singapore Public Utilities Board":
    "https://static.wixstatic.com/media/c123de_aad477de310341e08479ae59a6687a6a~mv2.jpg",
  "SELCO Foundation":
    "https://static.wixstatic.com/media/c123de_d10dc5e24e5b4cf2aa8e0b9b1c2e0f15~mv2.jpg",
  "Project Drawdown":
    "https://static.wixstatic.com/media/c123de_e21da757b576401989a70f8dc44f1491~mv2.jpg",
  "Rocky Mountain Institute (RMI)":
    "https://static.wixstatic.com/media/c123de_e38f35c667804a9fa9824b34e43cc451~mv2.jpg",
  "Rainforest Alliance":
    "https://static.wixstatic.com/media/c123de_4686f5c5be9e4daf887339f5e2b84a33~mv2.jpg",
  Patagonia:
    "https://static.wixstatic.com/media/c123de_d9e06fb5b03a4339a85157d01be39765~mv2.jpg",
  Ørsted:
    "https://static.wixstatic.com/media/c123de_cedd4beb5dbd4fdba911503d4063aba8~mv2.jpg",
  Oatly: "https://static.wixstatic.com/media/c123de_29caaa6592cd4ce498c2a89e9e971158~mv2.jpg",
  "M-KOPA Solar":
    "https://static.wixstatic.com/media/c123de_62f630a8fab2427382ea92638f11c1f8~mv2.jpg",
  "Masdar City":
    "https://static.wixstatic.com/media/c123de_59fa8408297a4884a1417fb393406aa3~mv2.jpg",
  Envirofit:
    "https://static.wixstatic.com/media/c123de_d5b485143607448fb2e1a50f265c0ae5~mv2.jpg",
  Kheyti: "https://static.wixstatic.com/media/c123de_ab27d9a9bce847e691e168d536922428~mv2.jpg",
  "Jain Irrigation Systems":
    "https://static.wixstatic.com/media/c123de_ef2719e5e28846c7bf8c74b37fa8302e~mv2.jpg",
  Interface:
    "https://static.wixstatic.com/media/c123de_bb3b2adbf95a4371a3476d97d9f4f540~mv2.jpg",
  "Impossible Foods":
    "https://static.wixstatic.com/media/c123de_2d159969e9ae4923bcb0225b777c35a6~mv2.jpg",
  "ICLEI – Local Governments for Sustainability":
    "https://static.wixstatic.com/media/c123de_c3bb3d93a503406484d71e62ac5c8994~mv2.jpg",
  Greenpeace:
    "https://static.wixstatic.com/media/c123de_2a372cfea7b546719d22793d79a44203~mv2.jpg",
  "Green Belt Movement":
    "https://static.wixstatic.com/media/c123de_d9c32a322580472f8a7dcdbd9af7dfcc~mv2.jpg",
  "Great Green Wall Initiative":
    "https://static.wixstatic.com/media/c123de_221fab46de9842f798f48ff85b43d01f~mv2.jpg",
  "Grameen Shakti":
    "https://static.wixstatic.com/media/c123de_65912a09e254498fbe303b4b2a13b044~mv2.jpg",
  ECOALF:
    "https://static.wixstatic.com/media/c123de_341028a81dda459584b2961bec28fdea~mv2.jpg",
  "Forum for the Future":
    "https://static.wixstatic.com/media/c123de_c29d527926894ab7a1a904e823661a0e~mv2.jpg",
  "Fairtrade International":
    "https://static.wixstatic.com/media/c123de_3441c563fe754bc9b71a978a0869baf0~mv2.jpg",
  Fairphone:
    "https://static.wixstatic.com/media/c123de_f952a40bab844e78949aab8bc59a06d2~mv2.jpg",
  "Ellen MacArthur Foundation":
    "https://static.wixstatic.com/media/c123de_a09628247e004150a604e76344c57245~mv2.jpg",
  Ecosia: "https://static.wixstatic.com/media/c123de_f7e3b22bc9304f0d8fd11effaf0d2a7d~mv2.jpg",
  "d.light":
    "https://static.wixstatic.com/media/c123de_ec6fa005571b4f48a4674585c99146b7~mv2.jpg",
  ClientEarth:
    "https://static.wixstatic.com/media/c123de_65f57f719bdb4e709c08a11d9e8e3c12~mv2.jpg",
  "Conservation International":
    "https://static.wixstatic.com/media/c123de_24d12f05a1f74c2aa8c71b3bc0a9c4a9~mv2.jpg",
  "BURN Manufacturing":
    "https://static.wixstatic.com/media/c123de_80a439c09097420d99bafa9dc7b2b321~mv2.jpg",
  "Carbon Disclosure Project (CDP)":
    "https://static.wixstatic.com/media/c123de_2886ec7ce37240079c1736947e4db1e8~mv2.jpg",
  "C40 Cities":
    "https://static.wixstatic.com/media/c123de_37958d28dacf441da1bc214394abecb5~mv2.jpg",
  "Azuri Technologies":
    "https://static.wixstatic.com/media/c123de_daf2767cfa884709ac7bc36be8cd9b09~mv2.jpg",
  Ashoka:
    "https://static.wixstatic.com/media/c123de_d3ab85d403ec4936add7c21af4270adf~mv2.png",
  "Barefoot College":
    "https://static.wixstatic.com/media/c123de_7d3a4f0dae1b4941a3b5812bfd433c51~mv2.jpg",
  "BioCarbon Engineering":
    "https://static.wixstatic.com/media/c123de_8fe979db72294bef96cb1fb783be317b~mv2.jpg",
};

/** Round 2 — Wix Media URLs (Apr 2026 batch); overrides PREVIOUS */
const IMAGE_BY_NAME_ROUND2 = {
  "Ellen MacArthur Foundation":
    "https://static.wixstatic.com/media/c123de_852a659524e1417d80894bc8f4e0c403~mv2.jpg",
  Interface:
    "https://static.wixstatic.com/media/c123de_9220daa980f04ad78d9fd35dde86fa6b~mv2.jpg",
  Patagonia:
    "https://static.wixstatic.com/media/c123de_caf8a6c397c44c0a9b44c04e16e0aac8~mv2.jpg",
  "Grameen Shakti":
    "https://static.wixstatic.com/media/c123de_e55742f62002494087b94697044da070~mv2.jpg",
  "The Ocean Cleanup":
    "https://static.wixstatic.com/media/c123de_d86fb4dc4bb54bea95f5d588c3d2b6d0~mv2.jpg",
  "Tony's Chocolonely":
    "https://static.wixstatic.com/media/c123de_0113481b6494404c98b487b2bac4fec3~mv2.jpg",
  Fairphone:
    "https://static.wixstatic.com/media/c123de_e9f6776aa93d47819f61c43362943dba~mv2.jpg",
  ECOALF:
    "https://static.wixstatic.com/media/c123de_59a2f2d058d3411788c8f644a23ada3c~mv2.jpg",
  Sunrun:
    "https://static.wixstatic.com/media/c123de_e1e8955b9d494abe95e5b21b68db7787~mv2.jpg",
  "Rocky Mountain Institute (RMI)":
    "https://static.wixstatic.com/media/c123de_b77763c198384c019c28f52f08aed0e3~mv2.jpg",
  Ecosia:
    "https://static.wixstatic.com/media/c123de_84237ffe1b5d44ee9b501242a1872da3~mv2.jpg",
  "Triodos Bank":
    "https://static.wixstatic.com/media/c123de_9616e6a8c71842b1af73032b388478c5~mv2.jpg",
  "BioCarbon Engineering":
    "https://static.wixstatic.com/media/c123de_b2adb668f28b41eb982d7e0a67733178~mv2.jpg",
  "Green Belt Movement":
    "https://static.wixstatic.com/media/c123de_1b636727f30a433387ba19e9e8b5cb39~mv2.jpg",
  Ørsted:
    "https://static.wixstatic.com/media/c123de_4abb6f551d54491f96a9495c51791060~mv2.jpg",
  "Solar Sister":
    "https://static.wixstatic.com/media/c123de_c1ef61fb8baa41f9941200a7525969ce~mv2.jpg",
  Wren:
    "https://static.wixstatic.com/media/c123de_c033d05ed6144edf8962d1da4dc62d39~mv2.jpg",
  "Great Green Wall Initiative":
    "https://static.wixstatic.com/media/c123de_1434e692e39342fe937385732b70472e~mv2.jpg",
  "Impossible Foods":
    "https://static.wixstatic.com/media/c123de_ca0fbfb8fac94ed48243e042e9a42b5d~mv2.jpg",
  Oatly:
    "https://static.wixstatic.com/media/c123de_2b6bd4916b0948dcad06aca554832674~mv2.jpg",
  Kheyti:
    "https://static.wixstatic.com/media/c123de_15f7ddd5a0924cbdb34b3c0f7efe5143~mv2.jpg",
  Vestergaard:
    "https://static.wixstatic.com/media/c123de_94c2c3ad78464e66bcf90a225312e9ce~mv2.jpg",
  Envirofit:
    "https://static.wixstatic.com/media/c123de_f3d81eaa6b9d4af48164521975a0e9f0~mv2.jpg",
  Terracycle:
    "https://static.wixstatic.com/media/c123de_777d1e888e2747ddb7ff49e6b8bf0e6d~mv2.jpg",
  "The Nature Conservancy":
    "https://static.wixstatic.com/media/c123de_efd3351405494226810744b8d752ff78~mv2.jpg",
  "Conservation International":
    "https://static.wixstatic.com/media/c123de_4c4989b810ac4033a4d9f40978e2f941~mv2.jpg",
  "WWF (World Wildlife Fund)":
    "https://static.wixstatic.com/media/c123de_ae7cc09359b74d0e8b18b7c40eb05861~mv2.jpg",
  Greenpeace:
    "https://static.wixstatic.com/media/c123de_d77e15779d8a457c9f3c7d7d22e30ff7~mv2.jpg",
  ClientEarth:
    "https://static.wixstatic.com/media/c123de_26b4316abd3b445798631f10e0fba444~mv2.jpg",
  "Rainforest Alliance":
    "https://static.wixstatic.com/media/c123de_0c30d5557f2e436f953299d0c0979184~mv2.jpg",
  "Fairtrade International":
    "https://static.wixstatic.com/media/c123de_2b0a4cfe92924fb4b4ffe50050a61d54~mv2.jpg",
  "Carbon Disclosure Project (CDP)":
    "https://static.wixstatic.com/media/c123de_2b68709754324bb4ae396c5157314a2d~mv2.jpg",
  "Forum for the Future":
    "https://static.wixstatic.com/media/c123de_b9f3098062834e5db160c00e03f9bc65~mv2.jpg",
  Ashoka:
    "https://static.wixstatic.com/media/c123de_31308f8152364ab0b7129bddaf386dca~mv2.png",
  "Project Drawdown":
    "https://static.wixstatic.com/media/c123de_cc037592bd084660945e2ab1a3ea2cb4~mv2.jpg",
  "Stockholm Environment Institute":
    "https://static.wixstatic.com/media/c123de_9eb04885f5a944a9b451d19b75900782~mv2.jpg",
  "World Resources Institute (WRI)":
    "https://static.wixstatic.com/media/c123de_0e8418416ccd4a0fa06cea51a43ecbe7~mv2.jpg",
  "C40 Cities":
    "https://static.wixstatic.com/media/c123de_2126ee119c0745dea1c15fd5e29f747c~mv2.jpg",
  "ICLEI – Local Governments for Sustainability":
    "https://static.wixstatic.com/media/c123de_2095522688d14918b821dd7c8dd70b1a~mv2.jpg",
  "Masdar City":
    "https://static.wixstatic.com/media/c123de_1af42f8c6938452f8cc592e16124f752~mv2.jpg",
  "Singapore Public Utilities Board":
    "https://static.wixstatic.com/media/c123de_c3ad120d6f224e59bd51c88bda9770ef~mv2.jpg",
  "SEWA (Self Employed Women's Association)":
    "https://static.wixstatic.com/media/c123de_4a812911f6d24cbda6bccfdba92805e9~mv2.jpg",
  "Barefoot College":
    "https://static.wixstatic.com/media/c123de_046e63af9fbb4d488e111d1ff5555033~mv2.jpg",
  "SELCO Foundation":
    "https://static.wixstatic.com/media/c123de_0af20636772f44cdb9aa172cc695ba2b~mv2.jpg",
  "Jain Irrigation Systems":
    "https://static.wixstatic.com/media/c123de_bdc6cf545c6549018d2ed533597a272b~mv2.jpg",
  "Tata Power Solar":
    "https://static.wixstatic.com/media/c123de_f731e68570144037b0e9204f193d68f3~mv2.jpg",
  "Azuri Technologies":
    "https://static.wixstatic.com/media/c123de_932be4499d5b4518bab88bdac549e31f~mv2.jpg",
  "M-KOPA Solar":
    "https://static.wixstatic.com/media/c123de_12bbf50e6d674c45a32f26ad4b45cdf4~mv2.jpg",
  "BURN Manufacturing":
    "https://static.wixstatic.com/media/c123de_eba36b6cf6434c1aa47ab651f3fb3f23~mv2.jpg",
  "d.light":
    "https://static.wixstatic.com/media/c123de_ac8cfe3f0b0d4e44bb3d4f3b1bb64f25~mv2.jpg",
  Sanergy:
    "https://static.wixstatic.com/media/c123de_85b0d1635655476dba3a8875620ba8a6~mv2.jpg",
  WaterAid:
    "https://static.wixstatic.com/media/c123de_a5f1ff14cffe41769c5d94904c55514b~mv2.jpg",
  "Practical Action":
    "https://static.wixstatic.com/media/c123de_aca0b50b71ee4cee9ee981d54e75a14e~mv2.jpg",
  "African Development Bank (Green Finance)":
    "https://static.wixstatic.com/media/c123de_f83f3fae174b42df8d1c295b0b47322b~mv2.jpg",
  "CGIAR (Consultative Group for International Agricultural Research)":
    "https://static.wixstatic.com/media/c123de_e55615ea20f2414785bb25e1fdda2943~mv2.jpg",
  "Wetlands International":
    "https://static.wixstatic.com/media/c123de_2b35a706d9e2471ab9987b8f3f4f26db~mv2.jpg",
  "Rewilding Europe":
    "https://static.wixstatic.com/media/c123de_e5b135f241234aa18454f4af59be016b~mv2.jpg",
  "Sea Shepherd Conservation Society":
    "https://static.wixstatic.com/media/c123de_d514a519284d45519b736b3c968ea79f~mv2.jpg",
  "Surfrider Foundation":
    "https://static.wixstatic.com/media/c123de_3f8abb4d2fa84b6b8749c03de6838579~mv2.jpg",
  "Plastic Bank":
    "https://static.wixstatic.com/media/c123de_7c6c3be917d349aeb1ee11dcd878fd7b~mv2.jpg",
  "Too Good To Go":
    "https://static.wixstatic.com/media/c123de_d679c5717b78454093e6ef0bd797a2e5~mv2.jpg",
  Winnow:
    "https://static.wixstatic.com/media/c123de_d249f3e220fa4b2987c453ba0b458a48~mv2.jpg",
  "Apeel Sciences":
    "https://static.wixstatic.com/media/c123de_6313b57b70974766b6eff35632d7ccb2~mv2.jpg",
  AgriProtein:
    "https://static.wixstatic.com/media/c123de_204d59287f774e7188be502e49a3925e~mv2.jpg",
  "Pur Projet":
    "https://static.wixstatic.com/media/c123de_170100e64a824dbeaaa5452b2bce15ab~mv2.jpg",
  Engie:
    "https://static.wixstatic.com/media/c123de_efe50d583b744d8ab75df53b0bc0cdfd~mv2.jpg",
  "Schneider Electric":
    "https://static.wixstatic.com/media/c123de_2fe4c06843fe44a6ad4cd6296a65116c~mv2.jpg",
  Veolia:
    "https://static.wixstatic.com/media/c123de_95bf75cd48994e9ebf54e88338704718~mv2.jpg",
  "GIZ (Deutsche Gesellschaft für Internationale Zusammenarbeit)":
    "https://static.wixstatic.com/media/c123de_3fe77f3a2cc543819c8b22fec3a839f4~mv2.jpg",
  "KfW Development Bank":
    "https://static.wixstatic.com/media/c123de_23f7a760b33c4bec807cc588be1029e6~mv2.jpg",
  Northvolt:
    "https://static.wixstatic.com/media/c123de_8945f4fe1b6240508ce90b0727ebbd2d~mv2.jpg",
  Climeworks:
    "https://static.wixstatic.com/media/c123de_1a1d2aa2c28b4af8a34a1ed7f3d198df~mv2.jpg",
  "International Renewable Energy Agency (IRENA)":
    "https://static.wixstatic.com/media/c123de_4aaa0de426c044f2b0d661e9b8b9b4f2~mv2.jpg",
  "United Nations Environment Programme (UNEP)":
    "https://static.wixstatic.com/media/c123de_e2fe197d855742f1934903bda33d3f85~mv2.jpg",
  "UNDP (UN Development Programme)":
    "https://static.wixstatic.com/media/c123de_2a289401db4b4d5486d1db4086ac640f~mv2.jpg",
  "Green Climate Fund (GCF)":
    "https://static.wixstatic.com/media/c123de_658b3dbdb3ee49bbaffa72c9f20582d2~mv2.jpg",
  "Costa Rica Forest Conservation Programme":
    "https://static.wixstatic.com/media/c123de_a0e17aa1ecc94af09bf1d87ec567f54e~mv2.jpg",
  "Morocco Noor Solar Complex":
    "https://static.wixstatic.com/media/c123de_39036a58daf04528b947c787ad63a983~mv2.jpg",
  "Ethiopia Forests Programme":
    "https://static.wixstatic.com/media/c123de_5e6b7e1e2899445d96cf7f31196526e3~mv2.jpg",
  "Wildlife Conservation Society (WCS)":
    "https://static.wixstatic.com/media/c123de_c85302fdf0d74743a6f548db77f4ffdd~mv2.jpg",
  "Jane Goodall Institute":
    "https://static.wixstatic.com/media/c123de_7de25ce96b5745849c4aa99914557d39~mv2.jpg",
  "Zoological Society of London (ZSL)":
    "https://static.wixstatic.com/media/c123de_8a41259325504ea4ad6c9d57eea85cac~mv2.jpg",
  "TRAFFIC (Wildlife Trade Monitoring)":
    "https://static.wixstatic.com/media/c123de_67cc4d79d8624cc18ecbee2aded0aa35~mv2.jpg",
  "Earthwatch Institute":
    "https://static.wixstatic.com/media/c123de_8eb5bdd10e7c48b895c2d17e3b127248~mv2.jpg",
  "Trees for Life":
    "https://static.wixstatic.com/media/c123de_75886ad8524448b5b480b905805749db~mv2.jpg",
  "B Lab":
    "https://static.wixstatic.com/media/c123de_1c1ff6113a914c739f0e098f644e136e~mv2.jpg",
  "Cradle to Cradle Institute":
    "https://static.wixstatic.com/media/c123de_e8ed47ee92ce4df1acaa142a367b21c9~mv2.jpg",
  "Architecture 2030":
    "https://static.wixstatic.com/media/c123de_3685a0dd38854831b161524104264b05~mv2.jpg",
  "Passivhaus Institut":
    "https://static.wixstatic.com/media/c123de_e0bd7e0ee512434eb7dd9b0d074aefcc~mv2.jpg",
  "Ecovillage Network (GEN)":
    "https://static.wixstatic.com/media/c123de_d8d52dc4a1594b7eb825b25e26d4d168~mv2.jpg",
  "Transition Network":
    "https://static.wixstatic.com/media/c123de_d7cb1b571c6944369f012d0271087650~mv2.jpg",
  "China NDRC Renewable Energy Programme":
    "https://static.wixstatic.com/media/c123de_d67a155d08e6458cb3f36990f7f87e8b~mv2.jpg",
  "Singapore Green Plan 2030":
    "https://static.wixstatic.com/media/c123de_33a49b22b3f3460e9afdf40d45119384~mv2.jpg",
  "Philippine Coral Triangle Initiative":
    "https://static.wixstatic.com/media/c123de_7c07f55846004f22952bb46c0f8f444f~mv2.jpg",
  "Amazon Fund (Fundo Amazônia)":
    "https://static.wixstatic.com/media/c123de_ec1d847db04247539cecb2f89f1de5a5~mv2.jpg",
  "Forest Stewardship Council (FSC)":
    "https://static.wixstatic.com/media/c123de_73e2d13603164d2eb379acbb20650b70~mv2.jpg",
  "Marine Stewardship Council (MSC)":
    "https://static.wixstatic.com/media/c123de_f177dc9bb87e4893a6bfb6986cd7eec4~mv2.jpg",
  "Gold Standard Foundation":
    "https://static.wixstatic.com/media/c123de_3420c1921abb495b870d0b8ac6a993bc~mv2.jpg",
  "Verra (Verified Carbon Standard)":
    "https://static.wixstatic.com/media/c123de_be7822e384594908b47983bba5bb371c~mv2.jpg",
  "Agora Energiewende":
    "https://static.wixstatic.com/media/c123de_7318c4e311564c518082388940ee3a65~mv2.jpg",
  "Carbon Tracker Initiative":
    "https://static.wixstatic.com/media/c123de_cc4dcd58420d461f9aad1313195bc81a~mv2.jpg",
  ShareAction:
    "https://static.wixstatic.com/media/c123de_943135aa839e41d4b21747c52273ad14~mv2.jpg",
  "Principles for Responsible Investment (PRI)":
    "https://static.wixstatic.com/media/c123de_da9f856b9875420bb919ea4b58cb58c9~mv2.jpg",
  Acumen:
    "https://static.wixstatic.com/media/c123de_785872105bfe467dae74c85ef6fdf0b2~mv2.jpg",
  "Good Food Institute":
    "https://static.wixstatic.com/media/c123de_843d928fe9a44f14a221d8e5446a1b51~mv2.jpg",
  "Bolt Threads":
    "https://static.wixstatic.com/media/c123de_7d7968baeb5a4ae1b0e6de9103949a18~mv2.jpg",
  "Solar Impulse Foundation":
    "https://static.wixstatic.com/media/c123de_83a463ff4c754a3d8a64f228d822b906~mv2.jpg",
  REN21:
    "https://static.wixstatic.com/media/c123de_38982257df5b49d7b12afe738d8a8dd9~mv2.jpg",
  "International Energy Agency (IEA)":
    "https://static.wixstatic.com/media/c123de_4fbdda4b2e2b4ba79037126b8872c9de~mv2.jpg",
  "Global Covenant of Mayors for Climate & Energy":
    "https://static.wixstatic.com/media/c123de_5bec2dbcea4146699e443a9940a20dc0~mv2.jpg",
  "Commonland Foundation":
    "https://static.wixstatic.com/media/c123de_f8a16053ac584ee1baafd22ca9705a98~mv2.jpg",
  "Urgenda Foundation":
    "https://static.wixstatic.com/media/c123de_903aef6c4a874c64a696babecf836a2f~mv2.jpg",
  "Natuur & Milieu":
    "https://static.wixstatic.com/media/c123de_914e815b92f44f3fb7e5d1e04927d7bc~mv2.jpg",
  "MVO Nederland (CSR Netherlands)":
    "https://static.wixstatic.com/media/c123de_c7df112bd53f4c18aef24dd51ffce451~mv2.jpg",
  Metabolic:
    "https://static.wixstatic.com/media/c123de_13744f3cf1634bec86b0aa3f429732aa~mv2.jpg",
};

/** Round 3 — Wix Media URLs (Apr 2026); overrides earlier rounds */
const IMAGE_BY_NAME_ROUND3 = {
  "IHE Delft":
    "https://static.wixstatic.com/media/c123de_e5223ce27dec41b18b9976f7de6ab2e4~mv2.jpg",
  Deltares:
    "https://static.wixstatic.com/media/c123de_db1e0791edb8462e9fa351fdc4434dda~mv2.jpg",
  Justdiggit:
    "https://static.wixstatic.com/media/c123de_0a66782a1e6c407db1019c5bd932298f~mv2.jpg",
  "SNV Netherlands":
    "https://static.wixstatic.com/media/c123de_e72244fa7eba4e968bc309fabf325251~mv2.jpg",
  Dopper:
    "https://static.wixstatic.com/media/c123de_6198853e1d9b4fa1a964269de2c3640d~mv2.jpg",
  "Mud Jeans":
    "https://static.wixstatic.com/media/c123de_2114be3689fe48d595e9c1463ae48ece~mv2.jpg",
  "Waka Waka":
    "https://static.wixstatic.com/media/c123de_d1280d2eaf754bbc9edcaa669245700b~mv2.jpg",
  "Both ENDS":
    "https://static.wixstatic.com/media/c123de_24e365814a484c7fa9a2e23d0ee07ab5~mv2.jpg",
  Solidaridad:
    "https://static.wixstatic.com/media/c123de_c78cbde2b6924468b9282ed927f1b1b0~mv2.jpg",
  "Rwanda Plastic Bag Ban":
    "https://static.wixstatic.com/media/c123de_bc2d04b487f24f82b6c27b93c39e709c~mv2.jpg",
  Legambiente:
    "https://static.wixstatic.com/media/c123de_faf0e36479444f32aebc142d59c16cb1~mv2.jpg",
  Novamont:
    "https://static.wixstatic.com/media/c123de_3b598385e53a4185b360aef57550f674~mv2.jpg",
  Sekem:
    "https://static.wixstatic.com/media/c123de_4d2b6d0b93f84462a81c59b2c10b48e1~mv2.jpg",
  "Terre de Liens":
    "https://static.wixstatic.com/media/c123de_a7116efed840449b834619a165470fad~mv2.jpg",
  "Zero Waste France":
    "https://static.wixstatic.com/media/c123de_59accc92ea5746e0a607ebbdba77457d~mv2.jpg",
  "NABU (Nature And Biodiversity Conservation Union)":
    "https://static.wixstatic.com/media/c123de_806bebf93c5f464aa040cf7fd93e95dd~mv2.jpg",
  EnBW:
    "https://static.wixstatic.com/media/c123de_61e639c78f8d4107b72b7b81f1f5ce42~mv2.jpg",
  Scania:
    "https://static.wixstatic.com/media/c123de_7d1e179815c344d5a2ea18e1348fb2a0~mv2.jpg",
  "H2 Green Steel":
    "https://static.wixstatic.com/media/c123de_b7eb892e05a24f6b9e9760511110d5b4~mv2.jpg",
  "Good Energy":
    "https://static.wixstatic.com/media/c123de_5488f10e0c27402e965d6e422e56c8a2~mv2.jpg",
  Sustrans:
    "https://static.wixstatic.com/media/c123de_3697221de839484c89baa4102339338f~mv2.jpg",
  Bioregional:
    "https://static.wixstatic.com/media/c123de_faa734e02d374034a451041e27743885~mv2.jpg",
  Earthjustice:
    "https://static.wixstatic.com/media/c123de_5aabfa44dc444145b80ccd54e15375ef~mv2.jpg",
  "Global Optimism":
    "https://static.wixstatic.com/media/c123de_22dbc0afc1464dceafe842a608a281f8~mv2.jpg",
  Ceres:
    "https://static.wixstatic.com/media/c123de_dc73ea33dcb14acfa17c2a5e4df3f6c4~mv2.jpg",
  "Natural Capital Project":
    "https://static.wixstatic.com/media/c123de_0521fbb3429d4c028c8a33b04f199f97~mv2.jpg",
  "RSPO (Roundtable on Sustainable Palm Oil)":
    "https://static.wixstatic.com/media/c123de_23ef0d19746f4ee480de8f677eeb437b~mv2.jpg",
  "Siemens Gamesa":
    "https://static.wixstatic.com/media/c123de_cc6a4397c57d420e9bed22f12ade9ebd~mv2.jpg",
  "First Solar":
    "https://static.wixstatic.com/media/c123de_9803aa7de5444501b27d32d4b7926e57~mv2.jpg",
  LanzaTech:
    "https://static.wixstatic.com/media/c123de_08b0367aecfb4d38876d10d3a9f599c5~mv2.jpg",
  "Kiss the Ground":
    "https://static.wixstatic.com/media/c123de_da04da741b414224bcb4b50931fa2d03~mv2.jpg",
  "Rodale Institute":
    "https://static.wixstatic.com/media/c123de_5a572b09ea9e4e41b3022833d8457d5b~mv2.jpg",
  "Savory Institute":
    "https://static.wixstatic.com/media/c123de_67a6ed6dc6184e979129b496888c7b36~mv2.jpg",
  Danone:
    "https://static.wixstatic.com/media/c123de_9c184151a3cf4e4898a6b93c0cfaad31~mv2.jpg",
  "South Pole":
    "https://static.wixstatic.com/media/c123de_ef4c224976ab40f0901117076b8dae8d~mv2.jpg",
  myclimate:
    "https://static.wixstatic.com/media/c123de_fb6f275530914cb18833b0ce43865a74~mv2.jpg",
  GreenCape:
    "https://static.wixstatic.com/media/c123de_0496c15f89914e3baed305f506255b17~mv2.jpg",
  "Hivos East Africa":
    "https://static.wixstatic.com/media/c123de_1a309480ddd24826b448450427e12153~mv2.jpg",
  "Power Africa Initiative":
    "https://static.wixstatic.com/media/c123de_3edfa35a77c749739907cb4270ba9a2e~mv2.jpg",
  Enviu:
    "https://static.wixstatic.com/media/c123de_b6e8be34fdca42ab97b8933afbda686e~mv2.jpg",
  "Community Energy England":
    "https://static.wixstatic.com/media/c123de_cdf978fd3bdb416cb24b27f6aae45f72~mv2.jpg",
  "Mainstream Renewable Power":
    "https://static.wixstatic.com/media/c123de_cd367bcfe07546dd89e75cba2dd98742~mv2.jpg",
  Systemiq:
    "https://static.wixstatic.com/media/c123de_5b26f831d68f429ca15d1193ccd191dc~mv2.jpg",
  "Energy Globe Foundation":
    "https://static.wixstatic.com/media/c123de_ac7e3222c9bc4538bfc26c416dff4e48~mv2.jpg",
  Naturefund:
    "https://static.wixstatic.com/media/c123de_5b1e3c533bdf4564861da9026bb7c66d~mv2.jpg",
  "Healthy Seas Initiative":
    "https://static.wixstatic.com/media/c123de_23764058be594b41bf64e1abf17f9464~mv2.jpg",
  Eneco:
    "https://static.wixstatic.com/media/c123de_1a46204043f343e9ac623be4403d1e3d~mv2.jpg",
  "Stockholm Royal Seaport":
    "https://static.wixstatic.com/media/c123de_41d34bc674f2490da1a32985e6f8b98a~mv2.jpg",
  Allbirds:
    "https://static.wixstatic.com/media/c123de_cebc2be76e604e159055b391c8a1d668~mv2.jpg",
  Cotopaxi:
    "https://static.wixstatic.com/media/c123de_36f30e60537347c4b7ce750eaac9b9c9~mv2.jpg",
  "REI Co-op":
    "https://static.wixstatic.com/media/c123de_7e2bb8efc22b4cf1848ff0ac377e73f9~mv2.jpg",
  "Charm Industrial":
    "https://static.wixstatic.com/media/c123de_97841ab0efd149aeb3c1a96c7bcfa10f~mv2.jpg",
  "Stripe Climate":
    "https://static.wixstatic.com/media/c123de_b45092f028704b73ab01f7f391109ee1~mv2.jpg",
  NatureFinance:
    "https://static.wixstatic.com/media/c123de_283408ffa88949889b87ddc9b09e40af~mv2.jpg",
  "Generation Investment Management":
    "https://static.wixstatic.com/media/c123de_5e267568b559449097cce82d0c1e357e~mv2.jpg",
  "Impax Asset Management":
    "https://static.wixstatic.com/media/c123de_f89d99f8973d48ef8fb352f18788b728~mv2.jpg",
  Persefoni:
    "https://static.wixstatic.com/media/c123de_cf9b66b3f1254b54812b50bc6b2bf775~mv2.jpg",
  Provenance:
    "https://static.wixstatic.com/media/c123de_0b676cb423f74406b6dac384dbe6e84d~mv2.jpg",
  EcoVadis:
    "https://static.wixstatic.com/media/c123de_51e0a58e4d2b4676804f305b3fcb1dae~mv2.jpg",
  "Plan A":
    "https://static.wixstatic.com/media/c123de_11eb5bc0eadc42fca0f7cbd2475e1637~mv2.jpg",
  "Cool Effect":
    "https://static.wixstatic.com/media/c123de_30b14fc9cc0c45fcbfd7baf4f6dc18f4~mv2.jpg",
  BBOXX:
    "https://static.wixstatic.com/media/c123de_54c7c69db1104cf2955ca965cd2518f0~mv2.jpg",
  "Greenlight Planet":
    "https://static.wixstatic.com/media/c123de_0e359bfd11374b18b64f4f23e1caec3e~mv2.jpg",
  "ReNew Power":
    "https://static.wixstatic.com/media/c123de_cc031db14f2b41ba82271fdca46eb87d~mv2.jpg",
  "Social Alpha":
    "https://static.wixstatic.com/media/c123de_a4d67d100e6145bc9ce7af8ce9feb013~mv2.jpg",
  "Blue Carbon Initiative":
    "https://static.wixstatic.com/media/c123de_a5e3334f106542c8b4f60ef98269d3f2~mv2.jpg",
  "ClimateWorks Australia":
    "https://static.wixstatic.com/media/c123de_cdb79a76a72d44c397591c677140d08e~mv2.jpg",
  "Landcare Australia":
    "https://static.wixstatic.com/media/c123de_1b6f8a82bb174a8ea16a5c718321d8bf~mv2.jpg",
  GlobalGiving:
    "https://static.wixstatic.com/media/c123de_7c7b8ec7993e4771b1dd0857aa851e37~mv2.jpg",
  "Plan Vivo":
    "https://static.wixstatic.com/media/c123de_0fa183f611bb4669be4b1a251d08948b~mv2.jpg",
  "African Circular Economy Network (ACEN)":
    "https://static.wixstatic.com/media/c123de_00c8ec7fb7194372aaf8f0fab6360413~mv2.jpg",
  Pachama:
    "https://static.wixstatic.com/media/c123de_def940b5559e422295c8f2906632f4ed~mv2.jpg",
  "Propagate Ventures":
    "https://static.wixstatic.com/media/c123de_5961a66328ab4c15a4c21a5daf62a355~mv2.jpg",
  Enerkem:
    "https://static.wixstatic.com/media/c123de_ec9538a5cfa2447ea1ee5262d4476d71~mv2.jpg",
  "Bullfrog Power":
    "https://static.wixstatic.com/media/c123de_bebacd6c018144569b85f9d9ac211d8c~mv2.jpg",
  "Green America":
    "https://static.wixstatic.com/media/c123de_1e04f7601f7e4fc1aaa7e90a528aca4b~mv2.jpg",
  "Sugi App":
    "https://static.wixstatic.com/media/c123de_3ddd63c8d58a4293b460ce9b73c44d92~mv2.jpg",
  Earthly:
    "https://static.wixstatic.com/media/c123de_b1fb7e88bb2b4bf692295863bb14c988~mv2.jpg",
  AfricaRice:
    "https://static.wixstatic.com/media/c123de_79632085984b4fb388e0e0792a1b2cfb~mv2.jpg",
  "The Bertha Foundation":
    "https://static.wixstatic.com/media/c123de_81ce4f744589489e8c8134ca360e27dc~mv2.jpg",
  "Proximity Designs":
    "https://static.wixstatic.com/media/c123de_6d301ae7986a462c84690dfa97855ae5~mv2.jpg",
  Simavi:
    "https://static.wixstatic.com/media/c123de_c6b5ac0886b64456b34dae07f98bc70f~mv2.jpg",
  "WASTE (Netherlands)":
    "https://static.wixstatic.com/media/c123de_30ce71fd14204127a97a513378d94e57~mv2.jpg",
  "Hoge Veluwe National Park":
    "https://static.wixstatic.com/media/c123de_4de8ed3569524840aa1e248dc7cd2036~mv2.jpg",
  "Gentoo Group":
    "https://static.wixstatic.com/media/c123de_a07cdf0d567643fcb2bd8973258e0d38~mv2.jpg",
  "EcoMachines Ventures":
    "https://static.wixstatic.com/media/c123de_7e006f83865b47b0bec6212521381415~mv2.jpg",
  "ENGIE Impact":
    "https://static.wixstatic.com/media/c123de_23703f51bcc24a219fe2e87fc7622fa9~mv2.jpg",
  "Kommunalkredit Austria":
    "https://static.wixstatic.com/media/c123de_4501663c08704bb6af1ada7e2745998e~mv2.jpg",
  "Deutsche Umwelthilfe (DUH)":
    "https://static.wixstatic.com/media/c123de_84bf6f3778bd47d09f2523418df27b7c~mv2.jpg",
  Eurosolar:
    "https://static.wixstatic.com/media/c123de_19b28ffb40e44cc095a1d0998d8e67f7~mv2.jpg",
  "Infineon Technologies (Green Chips)":
    "https://static.wixstatic.com/media/c123de_cbbf3cc5d19047c7bdfaa4a45d9cc86a~mv2.jpg",
  "Urban Catalyst":
    "https://static.wixstatic.com/media/c123de_62c435bbebe243a8acea3ad207bba12f~mv2.jpg",
  Northvolt:
    "https://static.wixstatic.com/media/c123de_6256374e33114f5693b7265378b9cd42~mv2.jpg",
  "Patagonia Works (Social Innovation)":
    "https://static.wixstatic.com/media/c123de_658452bf17a24ca9add776483081a50e~mv2.jpg",
  "Eileen Fisher":
    "https://static.wixstatic.com/media/c123de_a59b102dd9874e0d81cc5ac87b514784~mv2.jpg",
  "8 Rivers Capital":
    "https://static.wixstatic.com/media/c123de_9965a4decc824a399f2f984f3cd96f27~mv2.jpg",
  "Amazon Right Now Climate Pledge":
    "https://static.wixstatic.com/media/c123de_c920abefd83e4f98a793a1495fcdae57~mv2.jpg",
  "Apple Environmental Progress":
    "https://static.wixstatic.com/media/c123de_0d4549cfe4b14aa09fc68aaf1329544d~mv2.jpg",
  "Fair by Design":
    "https://static.wixstatic.com/media/c123de_dc96f083e3b54f2e8548751353c36ea0~mv2.jpg",
  Sedex:
    "https://static.wixstatic.com/media/c123de_a2a2a8265de64b9cb3ae07f048473a46~mv2.jpg",
  Quantis:
    "https://static.wixstatic.com/media/c123de_7fef899895124cde92a13697366b5321~mv2.jpg",
  "Xlinks Morocco-UK Power Project":
    "https://static.wixstatic.com/media/c123de_a965f1049f35413b82edb10e38a3e094~mv2.jpg",
  "DESERTEC Foundation":
    "https://static.wixstatic.com/media/c123de_86244b21e2c1405682a3f1da9f3a70d5~mv2.jpg",
  "Agahozo-Shalom Youth Village":
    "https://static.wixstatic.com/media/c123de_a0abe182c58e4394bf528f959a4f9dd1~mv2.jpg",
  "Fenix International":
    "https://static.wixstatic.com/media/c123de_73ca6caaa7914e868f6be1f01503b3bc~mv2.jpg",
  "Husk Power Systems":
    "https://static.wixstatic.com/media/c123de_fe7f7b3328524c82baf6d52fa5d8dbf8~mv2.jpg",
  "Center for Study of Science":
    "https://static.wixstatic.com/media/c123de_7e2af7f6ec6140e39ba6f6887b583f20~mv2.jpg",
  "Mahindra Susten":
    "https://static.wixstatic.com/media/c123de_4bf974299d1146b6b484befbe2c822b2~mv2.jpg",
  "Aavishkaar Capital":
    "https://static.wixstatic.com/media/c123de_3d90ba165abc407cbb415be3e855e73f~mv2.jpg",
  "Villgro Innovations":
    "https://static.wixstatic.com/media/c123de_a35e28c518f84c1d858a7641c5425299~mv2.jpg",
  "Mangrove Alliance":
    "https://static.wixstatic.com/media/c123de_49b243e10d5d4cccaf96f959b5658fe9~mv2.jpg",
  "Kitakyushu Eco-Town":
    "https://static.wixstatic.com/media/c123de_327b25883cf845b0b052a04f855f2a0d~mv2.jpg",
  "Toyota Environmental Challenge 2050":
    "https://static.wixstatic.com/media/c123de_8334678cb2c442089e78c02c273970f2~mv2.jpg",
  "KEPCO (Korea Electric Power) Green Transition":
    "https://static.wixstatic.com/media/c123de_2a494ff014d44b2d80f584992ef78c17~mv2.jpg",
  "SK Innovation (Battery Recycling)":
    "https://static.wixstatic.com/media/c123de_dfd54bc5bf39465fad4777b792141bbe~mv2.jpg",
  "Vietnam Net Zero by 2050":
    "https://static.wixstatic.com/media/c123de_0174ad6a99b74f458be9f00c1bda2b57~mv2.jpg",
  "GreenID Vietnam":
    "https://static.wixstatic.com/media/c123de_ba0cb83a75b64e87aa5ec55abab1ea0e~mv2.jpg",
  Kopernik:
    "https://static.wixstatic.com/media/c123de_9099f4c746b840c9bdac38dd4d22571a~mv2.jpg",
  "New Zealand Zero Carbon Act":
    "https://static.wixstatic.com/media/c123de_07acc03dc6374d76af7a4f39275501de~mv2.jpg",
  "Te Ara Poutama o Aotearoa (TPK)":
    "https://static.wixstatic.com/media/c123de_0b79a93f242a4a9eb4d81bbd28727467~mv2.jpg",
  "Beyond Zero Emissions (BZE)":
    "https://static.wixstatic.com/media/c123de_239810113bb4477ba9cb147eb20af339~mv2.jpg",
};

/**
 * Round 4 — new orgs + a few URL overrides (duplicates vs round 3 ignored unless noted).
 * Not in DB (skipped): SNV (Biogas Africa), AEB-Klantonderzoek, Wildlife Works, Watts Up Solar,
 * Regen Organics, Sanku, Global Energy Alliance for People and Planet, Governance & Accountability Institute.
 */
const IMAGE_BY_NAME_ROUND4 = {
  "Both ENDS":
    "https://static.wixstatic.com/media/c123de_055d745a75f54c1fbfa9edd0af472253~mv2.jpg",
  "Project Sea Change":
    "https://static.wixstatic.com/media/c123de_5343bc864328406d9c9c26d77ff68e8a~mv2.jpg",
  "Pronatura Mexico":
    "https://static.wixstatic.com/media/c123de_522f874e87b74a7bb35e04f5c5fea34e~mv2.jpg",
  Remix:
    "https://static.wixstatic.com/media/c123de_0d2b55356dbd4c5ebd659edea26248b5~mv2.jpg",
  "Algama Foods":
    "https://static.wixstatic.com/media/c123de_47e8ac197a0144eeacf52a1fbe1e5ecc~mv2.jpg",
  Connect4Climate:
    "https://static.wixstatic.com/media/c123de_964487759114418da1548d7ae1f06463~mv2.jpg",
  Lime:
    "https://static.wixstatic.com/media/c123de_a36df3d5899345f8bbee42fdcc248079~mv2.jpg",
  "Ather Energy":
    "https://static.wixstatic.com/media/c123de_897ca7bbf24d4a1aa5ebe9d94b3ebc9e~mv2.jpg",
  Gogoro:
    "https://static.wixstatic.com/media/c123de_316e645862074bc8be24f10624572377~mv2.jpg",
  Goldwind:
    "https://static.wixstatic.com/media/c123de_0fbfb541e2ef4953b4e195aa8dc2eedc~mv2.jpg",
  "Hive Energy":
    "https://static.wixstatic.com/media/c123de_878052875ad04258974a9ed7e6b3e22b~mv2.jpg",
  "Energy 4 Impact":
    "https://static.wixstatic.com/media/c123de_78ef5d3cd09f420284fa30d1ced56f68~mv2.jpg",
  Commonlands:
    "https://static.wixstatic.com/media/c123de_29be21551c244b86844debd8bbcc0831~mv2.jpg",
  "Blue Carbon Initiative":
    "https://static.wixstatic.com/media/c123de_b38266183dbc4381b18c991184770a8c~mv2.jpg",
  "Synchronicity Earth":
    "https://static.wixstatic.com/media/c123de_f2fcdd9be71948d5ad5a43eb2b831d2b~mv2.jpg",
  "Post Carbon Institute":
    "https://static.wixstatic.com/media/c123de_344dff68740a49a685d4b86171d5f26a~mv2.jpg",
  Earthjustice:
    "https://static.wixstatic.com/media/c123de_6a703caae0aa47bd9746acfea98ae534~mv2.jpg",
  "Ecole de la Deuxième Chance (E2C)":
    "https://static.wixstatic.com/media/c123de_18ab68c119914c61bd05a904b1dc2e22~mv2.jpg",
  "Consorzio Italiano Compostatori":
    "https://static.wixstatic.com/media/c123de_4aced082bfea4dc48769c7173f8f8868~mv2.jpg",
  "Fater Group (P&G/Angelini)":
    "https://static.wixstatic.com/media/c123de_ad8a77def4eb438ea8f3f3289b3e696e~mv2.jpg",
  "Ecoplanet Bamboo":
    "https://static.wixstatic.com/media/c123de_1f92662acd9543bca09b730ad36a2ab3~mv2.jpg",
  "Amazon Conservation Association":
    "https://static.wixstatic.com/media/c123de_71b6d95ac3e149f8af7b51e3779c3d4c~mv2.jpg",
  "Conservation Stewards Programme (CSP)":
    "https://static.wixstatic.com/media/c123de_5bfdd6993d8c46cd87f7228e75fa59ae~mv2.jpg",
  "Curitiba Urban Planning Institute":
    "https://static.wixstatic.com/media/c123de_47b429805d444d68b2dce598b865fe47~mv2.jpg",
  FLOCERT:
    "https://static.wixstatic.com/media/c123de_7483af621ed94e6d807c8671654989f7~mv2.jpg",
  "Plan Vivo":
    "https://static.wixstatic.com/media/c123de_61a1a7b630d34a71bb38e87bef1091e5~mv2.jpg",
  "Global Impact Investing Network (GIIN)":
    "https://static.wixstatic.com/media/c123de_f17b5154f02d4459bb8df889ce3a71ff~mv2.jpg",
  "Root Capital":
    "https://static.wixstatic.com/media/c123de_4fe63e8f284649ef85c8eecc0b7a0a41~mv2.jpg",
  "Bridges Fund Management":
    "https://static.wixstatic.com/media/c123de_797050099ed94aa59b2e7de6394805c0~mv2.jpg",
  "New Harvest":
    "https://static.wixstatic.com/media/c123de_f6631ca175f64821aa787f872a8d5ac7~mv2.jpg",
  "Modern Meadow":
    "https://static.wixstatic.com/media/c123de_f56d5ab35903424e9509a99c9cd838b4~mv2.jpg",
  "Tigray Reforestation Programme":
    "https://static.wixstatic.com/media/c123de_d03907c71ebd4c4a9a630991c60f619a~mv2.jpg",
};

/** Round 5 — updates to orgs already in DB (batch 5); new orgs added via append-finder-orgs-batch5.js */
const IMAGE_BY_NAME_ROUND5 = {
  Ceres:
    "https://static.wixstatic.com/media/c123de_9bfb1de8a10c485e80cc576be2671ff4~mv2.jpg",
  "Rewilding Britain":
    "https://static.wixstatic.com/media/c123de_a16c63cd9628456fbce60abd22f84f80~mv2.jpg",
  "Dark Sky Association":
    "https://static.wixstatic.com/media/c123de_c472e5b412c148d19e616b9c9104a0a2~mv2.jpg",
  "Birdlife International":
    "https://static.wixstatic.com/media/c123de_8f70584eb99d46d4b8f912fa6c761771~mv2.jpg",
};

const IMAGE_BY_NAME = {
  ...IMAGE_BY_NAME_PREVIOUS,
  ...IMAGE_BY_NAME_ROUND2,
  ...IMAGE_BY_NAME_ROUND3,
  ...IMAGE_BY_NAME_ROUND4,
  ...IMAGE_BY_NAME_ROUND5,
};

const URL_OVERRIDE = {
  "Forum for the Future": "https://www.forumforthefuture.org/",
};

function main() {
  const raw = fs.readFileSync(JSON_PATH, "utf8");
  const parsed = JSON.parse(raw);
  const items = Array.isArray(parsed) ? parsed : parsed.items;
  if (!Array.isArray(items)) {
    console.error("No items array");
    process.exit(1);
  }

  let updated = 0;
  for (const item of items) {
    const img = IMAGE_BY_NAME[item.name];
    if (!img) continue;
    item.imageUrl = img;
    updated++;
    const u = URL_OVERRIDE[item.name];
    if (u) item.url = u;
  }

  const missing = Object.keys(IMAGE_BY_NAME).filter((n) => !items.some((i) => i.name === n));
  console.log("imageUrl set for", updated, "companies");
  if (missing.length) console.warn("Map keys not found in DB:", missing);

  fs.writeFileSync(JSON_PATH, JSON.stringify(parsed, null, 2) + "\n", "utf8");
}

main();
