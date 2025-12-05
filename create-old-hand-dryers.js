const fs = require('fs');

console.log('🔄 Processing complete old hand dryer data...');

// Your complete hand dryer data
const handDryers = [
  {
    name: "Dyson Airblade V",
    brand: "Dyson",
    power: 1.6,
    year: 2015,
    efficiencyRating: "C",
    modelNumber: "AB04",
    runningCostPerYear: 80,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Dyson Airblade dB",
    brand: "Dyson",
    power: 1.6,
    year: 2013,
    efficiencyRating: "B",
    modelNumber: "AB14",
    runningCostPerYear: 78,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Dyson Airblade Wash+Dry",
    brand: "Dyson",
    power: 1.6,
    year: 2014,
    efficiencyRating: "B",
    modelNumber: "WD05",
    runningCostPerYear: 82,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Mitsubishi Jet Towel Smart",
    brand: "Mitsubishi",
    power: 1.1,
    year: 2018,
    efficiencyRating: "A",
    modelNumber: "JT-SB116JH2",
    runningCostPerYear: 55,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Mitsubishi Jet Towel Slim",
    brand: "Mitsubishi",
    power: 1.0,
    year: 2019,
    efficiencyRating: "A",
    modelNumber: "JT-SB216JSH2",
    runningCostPerYear: 52,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Excel Dryer XLERATOReco",
    brand: "Excel Dryer",
    power: 0.5,
    year: 2017,
    efficiencyRating: "A+",
    modelNumber: "XL-BW-ECO",
    runningCostPerYear: 38,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Excel Dryer XLERATOR",
    brand: "Excel Dryer",
    power: 1.5,
    year: 2008,
    efficiencyRating: "C",
    modelNumber: "XL-BW",
    runningCostPerYear: 85,
    category: "current",
    type: "handdryer"
  },
  {
    name: "World Dryer Airforce",
    brand: "World Dryer",
    power: 1.1,
    year: 2016,
    efficiencyRating: "B",
    modelNumber: "J-162",
    runningCostPerYear: 62,
    category: "current",
    type: "handdryer"
  },
  {
    name: "World Dryer VERDEdri",
    brand: "World Dryer",
    power: 0.95,
    year: 2019,
    efficiencyRating: "A",
    modelNumber: "Q-162",
    runningCostPerYear: 48,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Mediclinics Machflow",
    brand: "Mediclinics",
    power: 1.8,
    year: 2015,
    efficiencyRating: "C",
    modelNumber: "M09AC",
    runningCostPerYear: 92,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Mediclinics Speedflow",
    brand: "Mediclinics",
    power: 1.25,
    year: 2018,
    efficiencyRating: "B",
    modelNumber: "M06AC",
    runningCostPerYear: 68,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Mediclinics Dualflow Plus",
    brand: "Mediclinics",
    power: 1.0,
    year: 2020,
    efficiencyRating: "A",
    modelNumber: "M14ACS",
    runningCostPerYear: 54,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Dyson Airblade 9kJ",
    brand: "Dyson",
    power: 1.0,
    year: 2021,
    efficiencyRating: "A+",
    modelNumber: "AB14",
    runningCostPerYear: 42,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Biobot HandForce",
    brand: "Biobot",
    power: 1.2,
    year: 2017,
    efficiencyRating: "B",
    modelNumber: "HF-1200",
    runningCostPerYear: 65,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Airforce Pro-Dry",
    brand: "Airforce",
    power: 0.85,
    year: 2020,
    efficiencyRating: "A",
    modelNumber: "AF-850",
    runningCostPerYear: 46,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Warner Howard EcoDry",
    brand: "Warner Howard",
    power: 0.75,
    year: 2019,
    efficiencyRating: "A",
    modelNumber: "SM50AC",
    runningCostPerYear: 44,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Warner Howard FastDry",
    brand: "Warner Howard",
    power: 1.4,
    year: 2016,
    efficiencyRating: "C",
    modelNumber: "FD88",
    runningCostPerYear: 76,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Saniflow Jet Plus",
    brand: "Saniflow",
    power: 1.3,
    year: 2018,
    efficiencyRating: "B",
    modelNumber: "E88",
    runningCostPerYear: 70,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Saniflow EcoJet",
    brand: "Saniflow",
    power: 0.9,
    year: 2020,
    efficiencyRating: "A",
    modelNumber: "E05A",
    runningCostPerYear: 49,
    category: "current",
    type: "handdryer"
  },
  {
    name: "JVD Exp'air",
    brand: "JVD",
    power: 1.15,
    year: 2017,
    efficiencyRating: "B",
    modelNumber: "8111302",
    runningCostPerYear: 63,
    category: "current",
    type: "handdryer"
  },
  {
    name: "JVD Stell'air",
    brand: "JVD",
    power: 0.95,
    year: 2019,
    efficiencyRating: "A",
    modelNumber: "8231302",
    runningCostPerYear: 51,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Bradley Aerix+",
    brand: "Bradley",
    power: 1.05,
    year: 2018,
    efficiencyRating: "A",
    modelNumber: "2902-287400",
    runningCostPerYear: 56,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Bradley Diplomat",
    brand: "Bradley",
    power: 2.3,
    year: 2010,
    efficiencyRating: "D",
    modelNumber: "2901-10",
    runningCostPerYear: 128,
    category: "legacy",
    type: "handdryer"
  },
  {
    name: "American Dryer ExtremeAir",
    brand: "American Dryer",
    power: 1.5,
    year: 2014,
    efficiencyRating: "C",
    modelNumber: "GXT9",
    runningCostPerYear: 82,
    category: "current",
    type: "handdryer"
  },
  {
    name: "American Dryer Global GX3",
    brand: "American Dryer",
    power: 1.8,
    year: 2012,
    efficiencyRating: "C",
    modelNumber: "GX3-M",
    runningCostPerYear: 95,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Toto CleanDry",
    brand: "Toto",
    power: 1.2,
    year: 2016,
    efficiencyRating: "B",
    modelNumber: "HDR101",
    runningCostPerYear: 66,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Palmer Fixture Thunder",
    brand: "Palmer Fixture",
    power: 1.35,
    year: 2015,
    efficiencyRating: "C",
    modelNumber: "TD0150",
    runningCostPerYear: 74,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Palmer Fixture Electra",
    brand: "Palmer Fixture",
    power: 0.88,
    year: 2019,
    efficiencyRating: "A",
    modelNumber: "EL520",
    runningCostPerYear: 47,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Bobrick TrimDry",
    brand: "Bobrick",
    power: 1.0,
    year: 2017,
    efficiencyRating: "A",
    modelNumber: "B-778",
    runningCostPerYear: 53,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Bobrick CompacDryer",
    brand: "Bobrick",
    power: 1.45,
    year: 2013,
    efficiencyRating: "C",
    modelNumber: "B-710",
    runningCostPerYear: 79,
    category: "current",
    type: "handdryer"
  },
  {
    name: "ASI Roval Turbo",
    brand: "ASI",
    power: 1.25,
    year: 2016,
    efficiencyRating: "B",
    modelNumber: "0198-2",
    runningCostPerYear: 69,
    category: "current",
    type: "handdryer"
  },
  {
    name: "ASI Profile",
    brand: "ASI",
    power: 0.92,
    year: 2019,
    efficiencyRating: "A",
    modelNumber: "0165",
    runningCostPerYear: 50,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Velo VHD-1",
    brand: "Velo",
    power: 1.1,
    year: 2018,
    efficiencyRating: "B",
    modelNumber: "VHD-1-WHT",
    runningCostPerYear: 60,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Velo EcoSpeed",
    brand: "Velo",
    power: 0.78,
    year: 2020,
    efficiencyRating: "A",
    modelNumber: "ECO-780",
    runningCostPerYear: 43,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Panasonic FJ-T09B3",
    brand: "Panasonic",
    power: 1.0,
    year: 2017,
    efficiencyRating: "A",
    modelNumber: "FJ-T09B3",
    runningCostPerYear: 54,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Panasonic FJ-T10A2",
    brand: "Panasonic",
    power: 1.2,
    year: 2015,
    efficiencyRating: "B",
    modelNumber: "FJ-T10A2",
    runningCostPerYear: 67,
    category: "current",
    type: "handdryer"
  },
  {
    name: "ATC Rapide",
    brand: "ATC",
    power: 1.6,
    year: 2014,
    efficiencyRating: "C",
    modelNumber: "Z-2638",
    runningCostPerYear: 87,
    category: "current",
    type: "handdryer"
  },
  {
    name: "ATC Tiger Paw",
    brand: "ATC",
    power: 0.85,
    year: 2019,
    efficiencyRating: "A",
    modelNumber: "Z-2856",
    runningCostPerYear: 45,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Electrostar Jet Dry",
    brand: "Electrostar",
    power: 1.3,
    year: 2016,
    efficiencyRating: "B",
    modelNumber: "JD-1300",
    runningCostPerYear: 71,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Electrostar Nova",
    brand: "Electrostar",
    power: 0.95,
    year: 2020,
    efficiencyRating: "A",
    modelNumber: "NV-950",
    runningCostPerYear: 52,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Stern Velocity",
    brand: "Stern",
    power: 1.4,
    year: 2015,
    efficiencyRating: "C",
    modelNumber: "SV-1400",
    runningCostPerYear: 77,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Stern Eco",
    brand: "Stern",
    power: 0.8,
    year: 2019,
    efficiencyRating: "A",
    modelNumber: "SE-800",
    runningCostPerYear: 44,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Dolphin Prestige",
    brand: "Dolphin",
    power: 1.15,
    year: 2017,
    efficiencyRating: "B",
    modelNumber: "BC2400",
    runningCostPerYear: 64,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Dolphin Avalon",
    brand: "Dolphin",
    power: 0.9,
    year: 2020,
    efficiencyRating: "A",
    modelNumber: "BC2418",
    runningCostPerYear: 48,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Sloan EHD-501",
    brand: "Sloan",
    power: 1.5,
    year: 2014,
    efficiencyRating: "C",
    modelNumber: "EHD-501",
    runningCostPerYear: 83,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Sloan EHD-351",
    brand: "Sloan",
    power: 1.0,
    year: 2018,
    efficiencyRating: "A",
    modelNumber: "EHD-351",
    runningCostPerYear: 55,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Dihour PowerWave",
    brand: "Dihour",
    power: 1.35,
    year: 2016,
    efficiencyRating: "B",
    modelNumber: "DH2400",
    runningCostPerYear: 73,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Dihour EcoWave",
    brand: "Dihour",
    power: 0.88,
    year: 2019,
    efficiencyRating: "A",
    modelNumber: "DH2600",
    runningCostPerYear: 47,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Kimberly-Clark Professional",
    brand: "Kimberly-Clark",
    power: 1.2,
    year: 2015,
    efficiencyRating: "B",
    modelNumber: "09995",
    runningCostPerYear: 66,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Kimberly-Clark Mod",
    brand: "Kimberly-Clark",
    power: 0.82,
    year: 2018,
    efficiencyRating: "A",
    modelNumber: "09988",
    runningCostPerYear: 45,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Cleanmaster Turbo",
    brand: "Cleanmaster",
    power: 1.55,
    year: 2013,
    efficiencyRating: "C",
    modelNumber: "CM-T155",
    runningCostPerYear: 86,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Cleanmaster Whisper",
    brand: "Cleanmaster",
    power: 0.75,
    year: 2019,
    efficiencyRating: "A",
    modelNumber: "CM-W75",
    runningCostPerYear: 41,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Hokwang HK-2400H",
    brand: "Hokwang",
    power: 1.8,
    year: 2014,
    efficiencyRating: "C",
    modelNumber: "HK-2400H",
    runningCostPerYear: 98,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Hokwang EcoMo",
    brand: "Hokwang",
    power: 1.05,
    year: 2018,
    efficiencyRating: "A",
    modelNumber: "HK-1800PA",
    runningCostPerYear: 57,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Airdri Quazar",
    brand: "Airdri",
    power: 1.65,
    year: 2015,
    efficiencyRating: "C",
    modelNumber: "QZ2003",
    runningCostPerYear: 90,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Airdri Quietdri",
    brand: "Airdri",
    power: 0.95,
    year: 2019,
    efficiencyRating: "A",
    modelNumber: "QD1993",
    runningCostPerYear: 51,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Starmix XT",
    brand: "Starmix",
    power: 1.25,
    year: 2016,
    efficiencyRating: "B",
    modelNumber: "T-10",
    runningCostPerYear: 69,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Starmix Compact",
    brand: "Starmix",
    power: 0.85,
    year: 2020,
    efficiencyRating: "A",
    modelNumber: "C-08",
    runningCostPerYear: 46,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Fumagalli Zefiro",
    brand: "Fumagalli",
    power: 1.1,
    year: 2017,
    efficiencyRating: "B",
    modelNumber: "Z-11",
    runningCostPerYear: 61,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Fumagalli Mistral",
    brand: "Fumagalli",
    power: 0.92,
    year: 2019,
    efficiencyRating: "A",
    modelNumber: "M-09",
    runningCostPerYear: 50,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Alpine Hemlock",
    brand: "Alpine",
    power: 1.4,
    year: 2014,
    efficiencyRating: "C",
    modelNumber: "402-10",
    runningCostPerYear: 78,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Alpine Willow",
    brand: "Alpine",
    power: 0.8,
    year: 2018,
    efficiencyRating: "A",
    modelNumber: "402-20",
    runningCostPerYear: 44,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Delabie Infrared",
    brand: "Delabie",
    power: 1.3,
    year: 2015,
    efficiencyRating: "B",
    modelNumber: "738130",
    runningCostPerYear: 72,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Delabie Tempomatic",
    brand: "Delabie",
    power: 0.88,
    year: 2019,
    efficiencyRating: "A",
    modelNumber: "738160",
    runningCostPerYear: 48,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Vent-Axia Ultradry",
    brand: "Vent-Axia",
    power: 1.5,
    year: 2013,
    efficiencyRating: "C",
    modelNumber: "422706",
    runningCostPerYear: 84,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Vent-Axia Jetdry",
    brand: "Vent-Axia",
    power: 1.0,
    year: 2018,
    efficiencyRating: "A",
    modelNumber: "422796",
    runningCostPerYear: 54,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Saniflo DryJet",
    brand: "Saniflo",
    power: 1.35,
    year: 2016,
    efficiencyRating: "B",
    modelNumber: "DJ-135",
    runningCostPerYear: 74,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Saniflo QuietStream",
    brand: "Saniflo",
    power: 0.85,
    year: 2019,
    efficiencyRating: "A",
    modelNumber: "QS-085",
    runningCostPerYear: 46,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Simco AirMax",
    brand: "Simco",
    power: 1.6,
    year: 2014,
    efficiencyRating: "C",
    modelNumber: "AM-1600",
    runningCostPerYear: 89,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Simco EcoStream",
    brand: "Simco",
    power: 0.9,
    year: 2019,
    efficiencyRating: "A",
    modelNumber: "ES-900",
    runningCostPerYear: 49,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Zephyr Hurricane",
    brand: "Zephyr",
    power: 1.7,
    year: 2013,
    efficiencyRating: "C",
    modelNumber: "ZH-1700",
    runningCostPerYear: 93,
    category: "legacy",
    type: "handdryer"
  },
  {
    name: "Zephyr Breeze",
    brand: "Zephyr",
    power: 0.78,
    year: 2020,
    efficiencyRating: "A",
    modelNumber: "ZB-780",
    runningCostPerYear: 42,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Nova PowerBlast",
    brand: "Nova",
    power: 1.45,
    year: 2015,
    efficiencyRating: "C",
    modelNumber: "NV-PB145",
    runningCostPerYear: 80,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Nova SilentDry",
    brand: "Nova",
    power: 0.82,
    year: 2019,
    efficiencyRating: "A",
    modelNumber: "NV-SD82",
    runningCostPerYear: 45,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Tempest ForceAir",
    brand: "Tempest",
    power: 1.55,
    year: 2014,
    efficiencyRating: "C",
    modelNumber: "TF-1550",
    runningCostPerYear: 85,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Tempest GreenAir",
    brand: "Tempest",
    power: 0.88,
    year: 2018,
    efficiencyRating: "A",
    modelNumber: "TG-880",
    runningCostPerYear: 48,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Cascade Rapids",
    brand: "Cascade",
    power: 1.2,
    year: 2016,
    efficiencyRating: "B",
    modelNumber: "CS-R120",
    runningCostPerYear: 67,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Cascade Stream",
    brand: "Cascade",
    power: 0.75,
    year: 2019,
    efficiencyRating: "A",
    modelNumber: "CS-S75",
    runningCostPerYear: 41,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Meridian PowerDry",
    brand: "Meridian",
    power: 1.65,
    year: 2013,
    efficiencyRating: "C",
    modelNumber: "MD-PD165",
    runningCostPerYear: 91,
    category: "legacy",
    type: "handdryer"
  },
  {
    name: "Meridian EcoSense",
    brand: "Meridian",
    power: 0.85,
    year: 2020,
    efficiencyRating: "A",
    modelNumber: "MD-ES85",
    runningCostPerYear: 46,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Summit AirJet",
    brand: "Summit",
    power: 1.3,
    year: 2015,
    efficiencyRating: "B",
    modelNumber: "SM-AJ130",
    runningCostPerYear: 71,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Summit WhisperDry",
    brand: "Summit",
    power: 0.8,
    year: 2019,
    efficiencyRating: "A",
    modelNumber: "SM-WD80",
    runningCostPerYear: 44,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Pinnacle Velocity",
    brand: "Pinnacle",
    power: 1.5,
    year: 2014,
    efficiencyRating: "C",
    modelNumber: "PN-V150",
    runningCostPerYear: 83,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Pinnacle EcoVelocity",
    brand: "Pinnacle",
    power: 0.92,
    year: 2018,
    efficiencyRating: "A",
    modelNumber: "PN-EV92",
    runningCostPerYear: 50,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Horizon TurboDry",
    brand: "Horizon",
    power: 1.75,
    year: 2013,
    efficiencyRating: "D",
    modelNumber: "HZ-TD175",
    runningCostPerYear: 96,
    category: "legacy",
    type: "handdryer"
  },
  {
    name: "Horizon SmartDry",
    brand: "Horizon",
    power: 0.9,
    year: 2019,
    efficiencyRating: "A",
    modelNumber: "HZ-SD90",
    runningCostPerYear: 49,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Velocity Pro X1",
    brand: "Velocity",
    power: 1.4,
    year: 2016,
    efficiencyRating: "B",
    modelNumber: "VL-X1",
    runningCostPerYear: 77,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Velocity Eco X2",
    brand: "Velocity",
    power: 0.82,
    year: 2020,
    efficiencyRating: "A",
    modelNumber: "VL-X2",
    runningCostPerYear: 45,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Apex TurboForce",
    brand: "Apex",
    power: 1.6,
    year: 2015,
    efficiencyRating: "C",
    modelNumber: "AP-TF160",
    runningCostPerYear: 88,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Apex GreenForce",
    brand: "Apex",
    power: 0.88,
    year: 2019,
    efficiencyRating: "A",
    modelNumber: "AP-GF88",
    runningCostPerYear: 48,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Vortex MaxAir",
    brand: "Vortex",
    power: 1.55,
    year: 2014,
    efficiencyRating: "C",
    modelNumber: "VX-MA155",
    runningCostPerYear: 86,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Vortex EcoAir",
    brand: "Vortex",
    power: 0.85,
    year: 2018,
    efficiencyRating: "A",
    modelNumber: "VX-EA85",
    runningCostPerYear: 46,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Zenith PowerStream",
    brand: "Zenith",
    power: 1.35,
    year: 2016,
    efficiencyRating: "B",
    modelNumber: "ZN-PS135",
    runningCostPerYear: 74,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Zenith QuietStream",
    brand: "Zenith",
    power: 0.78,
    year: 2020,
    efficiencyRating: "A",
    modelNumber: "ZN-QS78",
    runningCostPerYear: 43,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Excel Dryer ThinAir",
    brand: "Excel Dryer",
    power: 0.7,
    year: 2019,
    efficiencyRating: "A+",
    modelNumber: "TA-ABS",
    runningCostPerYear: 39,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Dyson Airblade HU02",
    brand: "Dyson",
    power: 1.6,
    year: 2012,
    efficiencyRating: "B",
    modelNumber: "HU02",
    runningCostPerYear: 81,
    category: "current",
    type: "handdryer"
  },
  {
    name: "World Dryer SLIMdri",
    brand: "World Dryer",
    power: 0.95,
    year: 2020,
    efficiencyRating: "A",
    modelNumber: "L-974",
    runningCostPerYear: 51,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Mitsubishi Wave i01",
    brand: "Mitsubishi",
    power: 1.05,
    year: 2016,
    efficiencyRating: "A",
    modelNumber: "JT-MC106",
    runningCostPerYear: 56,
    category: "current",
    type: "handdryer"
  },
  {
    name: "American Dryer EXT Series",
    brand: "American Dryer",
    power: 1.2,
    year: 2017,
    efficiencyRating: "B",
    modelNumber: "EXT7-M",
    runningCostPerYear: 66,
    category: "current",
    type: "handdryer"
  },
  {
    name: "Mediclinics SmartFlow",
    brand: "Mediclinics",
    power: 0.65,
    year: 2021,
    efficiencyRating: "A+",
    modelNumber: "M17E",
    runningCostPerYear: 36,
    category: "current",
    type: "handdryer"
  }
];

console.log(`📊 Processing ${handDryers.length} old hand dryers...`);

// Transform to Energy Audit Widget format
const transformedHandDryers = handDryers.map((product, index) => ({
    id: `old_hd_${index + 1}`,
    name: product.name,
    power: product.power,
    type: product.type,
    brand: product.brand,
    year: product.year,
    efficiency: product.efficiencyRating,
    energyRating: product.efficiencyRating,
    icon: '🤚',
    category: product.category,
    subcategory: 'Old Hand Dryer',
    isCurated: false,
    displayName: product.name,
    notes: `Old Model - ${product.year}`,
    hasMoreInfo: true,
    moreInfoText: `Brand: ${product.brand}\\nModel: ${product.modelNumber}\\nYear: ${product.year}\\nEfficiency: ${product.efficiencyRating}\\nType: Old Hand Dryer`,
    runningCostPerYear: product.runningCostPerYear,
    modelNumber: product.modelNumber
}));

// Create embedded JavaScript file
const jsContent = `// Embedded Old Hand Dryers Data
const EMBEDDED_OLD_HAND_DRYERS = ${JSON.stringify(transformedHandDryers, null, 2)};

// Make it globally available
if (typeof window !== 'undefined') {
    window.EMBEDDED_OLD_HAND_DRYERS = EMBEDDED_OLD_HAND_DRYERS;
}`;

// Write the file
fs.writeFileSync('embedded-old-hand-dryers.js', jsContent);

console.log(`✅ Created embedded-old-hand-dryers.js with ${transformedHandDryers.length} old hand dryers`);

// Show efficiency breakdown
const efficiencyCount = {};
transformedHandDryers.forEach(p => {
    efficiencyCount[p.efficiency] = (efficiencyCount[p.efficiency] || 0) + 1;
});

console.log('📈 Efficiency Rating Breakdown:');
Object.entries(efficiencyCount).forEach(([rating, count]) => {
    console.log(`   ${rating}: ${count} products`);
});

// Show category breakdown
const categoryCount = {};
transformedHandDryers.forEach(p => {
    categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
});

console.log('📊 Category Breakdown:');
Object.entries(categoryCount).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count} products`);
});

console.log('🎯 Ready to integrate into test file!');







