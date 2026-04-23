import React, { useState, useMemo, useRef, useEffect } from "react";

/* ==========================================================================
   MOVE ME TO EU — Nation-level visa pathway finder
   Sibling to My Wise Relocation, focused on the EU 27.
   Flow: Pathway -> Profile -> Priorities -> Matches (+ Compare up to 3)
   ========================================================================== */

const EDUCATION = [
  { id: "none", label: "No formal degree", rank: 0 },
  { id: "highschool", label: "High school / secondary", rank: 1 },
  { id: "associates", label: "Associate / vocational", rank: 2 },
  { id: "bachelors", label: "Bachelor's degree", rank: 3 },
  { id: "masters", label: "Master's degree", rank: 4 },
  { id: "doctorate", label: "Doctorate", rank: 5 },
];

const INCOME_BANDS = [
  { id: "under30", label: "Under €30k / $32k", eur: 20000 },
  { id: "30to60", label: "€30k–€60k / $32k–$64k", eur: 45000 },
  { id: "60to100", label: "€60k–€100k / $64k–$107k", eur: 80000 },
  { id: "100to150", label: "€100k–€150k / $107k–$160k", eur: 125000 },
  { id: "over150", label: "Over €150k / $160k", eur: 200000 },
];

const CAPITAL_BANDS = [
  { id: "under50", label: "Under €50k", eur: 30000 },
  { id: "50to250", label: "€50k–€250k", eur: 150000 },
  { id: "250to500", label: "€250k–€500k", eur: 375000 },
  { id: "500to1m", label: "€500k–€1M", eur: 750000 },
  { id: "over1m", label: "Over €1M", eur: 1500000 },
];

/* ---------- CRIME DATA (homicide per 100k + tier ratings) ---------------- */
/* Tiers: Low / Moderate / High. Homicide rate is per 100,000 residents. */
const US_STATES = [
  { name:"Alabama",        homicide:8.9,  theft:"High",     burglary:"High",     assault:"High",     robbery:"High"     },
  { name:"Alaska",         homicide:7.3,  theft:"High",     burglary:"High",     assault:"High",     robbery:"High"     },
  { name:"Arizona",        homicide:6.2,  theft:"High",     burglary:"High",     assault:"High",     robbery:"High"     },
  { name:"Arkansas",       homicide:9.1,  theft:"High",     burglary:"High",     assault:"High",     robbery:"High"     },
  { name:"California",     homicide:5.2,  theft:"High",     burglary:"Moderate", assault:"High",     robbery:"Moderate" },
  { name:"Colorado",       homicide:4.6,  theft:"Moderate", burglary:"Moderate", assault:"Moderate", robbery:"Moderate" },
  { name:"Connecticut",    homicide:3.1,  theft:"Moderate", burglary:"Low",      assault:"Moderate", robbery:"Low"      },
  { name:"Delaware",       homicide:5.8,  theft:"Moderate", burglary:"Moderate", assault:"High",     robbery:"Moderate" },
  { name:"Florida",        homicide:6.0,  theft:"High",     burglary:"Moderate", assault:"High",     robbery:"Moderate" },
  { name:"Georgia",        homicide:8.4,  theft:"High",     burglary:"High",     assault:"High",     robbery:"High"     },
  { name:"Hawaii",         homicide:2.4,  theft:"Moderate", burglary:"Low",      assault:"Low",      robbery:"Low"      },
  { name:"Idaho",          homicide:2.5,  theft:"Moderate", burglary:"Low",      assault:"Low",      robbery:"Low"      },
  { name:"Illinois",       homicide:7.8,  theft:"High",     burglary:"High",     assault:"High",     robbery:"High"     },
  { name:"Indiana",        homicide:6.3,  theft:"Moderate", burglary:"Moderate", assault:"High",     robbery:"Moderate" },
  { name:"Iowa",           homicide:2.3,  theft:"Low",      burglary:"Low",      assault:"Low",      robbery:"Low"      },
  { name:"Kansas",         homicide:4.9,  theft:"Moderate", burglary:"Moderate", assault:"Moderate", robbery:"Moderate" },
  { name:"Kentucky",       homicide:5.5,  theft:"Moderate", burglary:"Moderate", assault:"High",     robbery:"Moderate" },
  { name:"Louisiana",      homicide:11.8, theft:"High",     burglary:"High",     assault:"High",     robbery:"High"     },
  { name:"Maine",          homicide:1.8,  theft:"Low",      burglary:"Low",      assault:"Low",      robbery:"Low"      },
  { name:"Maryland",       homicide:9.0,  theft:"High",     burglary:"High",     assault:"High",     robbery:"High"     },
  { name:"Massachusetts",  homicide:2.4,  theft:"Moderate", burglary:"Low",      assault:"Moderate", robbery:"Low"      },
  { name:"Michigan",       homicide:7.0,  theft:"High",     burglary:"High",     assault:"High",     robbery:"High"     },
  { name:"Minnesota",      homicide:2.2,  theft:"Low",      burglary:"Low",      assault:"Low",      robbery:"Low"      },
  { name:"Mississippi",    homicide:12.5, theft:"High",     burglary:"High",     assault:"High",     robbery:"High"     },
  { name:"Missouri",       homicide:9.9,  theft:"High",     burglary:"High",     assault:"High",     robbery:"High"     },
  { name:"Montana",        homicide:3.7,  theft:"Moderate", burglary:"Low",      assault:"Moderate", robbery:"Low"      },
  { name:"Nebraska",       homicide:3.0,  theft:"Low",      burglary:"Low",      assault:"Low",      robbery:"Low"      },
  { name:"Nevada",         homicide:6.5,  theft:"High",     burglary:"Moderate", assault:"High",     robbery:"Moderate" },
  { name:"New Hampshire",  homicide:1.3,  theft:"Low",      burglary:"Low",      assault:"Low",      robbery:"Low"      },
  { name:"New Jersey",     homicide:3.4,  theft:"Moderate", burglary:"Low",      assault:"Moderate", robbery:"Low"      },
  { name:"New Mexico",     homicide:8.6,  theft:"High",     burglary:"High",     assault:"High",     robbery:"High"     },
  { name:"New York",       homicide:4.1,  theft:"Moderate", burglary:"Moderate", assault:"Moderate", robbery:"Moderate" },
  { name:"North Carolina", homicide:6.2,  theft:"High",     burglary:"Moderate", assault:"High",     robbery:"Moderate" },
  { name:"North Dakota",   homicide:3.2,  theft:"Low",      burglary:"Low",      assault:"Low",      robbery:"Low"      },
  { name:"Ohio",           homicide:5.6,  theft:"Moderate", burglary:"Moderate", assault:"High",     robbery:"Moderate" },
  { name:"Oklahoma",       homicide:7.2,  theft:"High",     burglary:"High",     assault:"High",     robbery:"High"     },
  { name:"Oregon",         homicide:3.5,  theft:"Moderate", burglary:"Moderate", assault:"Moderate", robbery:"Moderate" },
  { name:"Pennsylvania",   homicide:5.1,  theft:"Moderate", burglary:"Moderate", assault:"High",     robbery:"Moderate" },
  { name:"Rhode Island",   homicide:3.3,  theft:"Moderate", burglary:"Low",      assault:"Moderate", robbery:"Low"      },
  { name:"South Carolina", homicide:8.3,  theft:"High",     burglary:"High",     assault:"High",     robbery:"High"     },
  { name:"South Dakota",   homicide:3.8,  theft:"Low",      burglary:"Low",      assault:"Low",      robbery:"Low"      },
  { name:"Tennessee",      homicide:8.3,  theft:"High",     burglary:"High",     assault:"High",     robbery:"High"     },
  { name:"Texas",          homicide:5.0,  theft:"High",     burglary:"Moderate", assault:"High",     robbery:"Moderate" },
  { name:"Utah",           homicide:2.6,  theft:"Low",      burglary:"Low",      assault:"Low",      robbery:"Low"      },
  { name:"Vermont",        homicide:1.8,  theft:"Low",      burglary:"Low",      assault:"Low",      robbery:"Low"      },
  { name:"Virginia",       homicide:5.0,  theft:"Moderate", burglary:"Moderate", assault:"Moderate", robbery:"Moderate" },
  { name:"Washington",     homicide:3.5,  theft:"Moderate", burglary:"Moderate", assault:"Moderate", robbery:"Moderate" },
  { name:"West Virginia",  homicide:5.2,  theft:"Moderate", burglary:"Moderate", assault:"High",     robbery:"Moderate" },
  { name:"Wisconsin",      homicide:3.4,  theft:"Low",      burglary:"Low",      assault:"Low",      robbery:"Low"      },
  { name:"Wyoming",        homicide:4.0,  theft:"Low",      burglary:"Low",      assault:"Low",      robbery:"Low"      },
];

/* EU crime data keyed by ISO country code. homicide = null when source had N/A. */
const EU_CRIME = {
  AT: { homicide:0.6,  theft:"Low",      burglary:"Low",      assault:"Low",      robbery:"Low"      },
  BE: { homicide:1.7,  theft:"High",     burglary:"Moderate", assault:"Moderate", robbery:"Moderate" },
  BG: { homicide:1.5,  theft:"Moderate", burglary:"Moderate", assault:"Moderate", robbery:"Moderate" },
  HR: { homicide:1.1,  theft:"Moderate", burglary:"Low",      assault:"Low",      robbery:"Low"      },
  CY: { homicide:1.2,  theft:"Moderate", burglary:"Moderate", assault:"Low",      robbery:"Low"      },
  CZ: { homicide:0.9,  theft:"Low",      burglary:"Low",      assault:"Low",      robbery:"Low"      },
  DK: { homicide:0.8,  theft:"Low",      burglary:"Low",      assault:"Low",      robbery:"Low"      },
  EE: { homicide:null, theft:"Low",      burglary:"Low",      assault:"Low",      robbery:"Low"      },
  FI: { homicide:1.1,  theft:"Low",      burglary:"Low",      assault:"Low",      robbery:"Low"      },
  FR: { homicide:1.3,  theft:"High",     burglary:"Moderate", assault:"Moderate", robbery:"Moderate" },
  DE: { homicide:0.8,  theft:"Moderate", burglary:"Low",      assault:"Low",      robbery:"Low"      },
  GR: { homicide:1.0,  theft:"Moderate", burglary:"Moderate", assault:"Low",      robbery:"Low"      },
  HU: { homicide:1.3,  theft:"Moderate", burglary:"Moderate", assault:"Moderate", robbery:"Moderate" },
  IE: { homicide:0.8,  theft:"Low",      burglary:"Low",      assault:"Low",      robbery:"Low"      },
  IT: { homicide:0.6,  theft:"High",     burglary:"Moderate", assault:"Low",      robbery:"Moderate" },
  LV: { homicide:2.5,  theft:"Moderate", burglary:"Moderate", assault:"Moderate", robbery:"Moderate" },
  LT: { homicide:2.8,  theft:"Moderate", burglary:"Moderate", assault:"Moderate", robbery:"Moderate" },
  LU: { homicide:0.3,  theft:"Low",      burglary:"Low",      assault:"Low",      robbery:"Low"      },
  MT: { homicide:0.9,  theft:"Low",      burglary:"Low",      assault:"Low",      robbery:"Low"      },
  NL: { homicide:0.6,  theft:"Moderate", burglary:"Low",      assault:"Low",      robbery:"Low"      },
  PL: { homicide:0.7,  theft:"Low",      burglary:"Low",      assault:"Low",      robbery:"Low"      },
  PT: { homicide:0.8,  theft:"Moderate", burglary:"Low",      assault:"Low",      robbery:"Low"      },
  RO: { homicide:1.8,  theft:"Moderate", burglary:"Moderate", assault:"Moderate", robbery:"Moderate" },
  SK: { homicide:1.0,  theft:"Low",      burglary:"Low",      assault:"Low",      robbery:"Low"      },
  SI: { homicide:0.5,  theft:"Low",      burglary:"Low",      assault:"Low",      robbery:"Low"      },
  ES: { homicide:0.6,  theft:"High",     burglary:"Moderate", assault:"Low",      robbery:"Moderate" },
  SE: { homicide:1.1,  theft:"Moderate", burglary:"Low",      assault:"Moderate", robbery:"Low"      },
};

/* Convert a per-100k homicide rate to a 5–98 safety score (inverse linear). */
const homicideToSafety = (rate) => {
  if (rate == null) return null;
  return Math.max(5, Math.min(98, 100 - rate * 7));
};

/* ---------- QUALITY OF LIFE DATA (Global Index Ranks, lower = better) ----- */
/* Source: HDI, OECD Better Life Index, Numbeo QoL, Social Progress Imperative, Good Country Index, Happy Planet Index.
   Overall Rank is among the 28 places scored (27 EU + US). */
const QOL = {
  DK: { overallRank:1,  avgRank:5.33,  hdi:8,  oecd:2,  numbeo:2,  socialProgress:3,  goodLife:4,  happyPlanet:13 },
  NL: { overallRank:2,  avgRank:6.67,  hdi:7,  oecd:5,  numbeo:1,  socialProgress:7,  goodLife:6,  happyPlanet:14 },
  FI: { overallRank:3,  avgRank:7.00,  hdi:9,  oecd:8,  numbeo:6,  socialProgress:2,  goodLife:5,  happyPlanet:12 },
  SE: { overallRank:4,  avgRank:8.83,  hdi:5,  oecd:7,  numbeo:13, socialProgress:5,  goodLife:7,  happyPlanet:16 },
  DE: { overallRank:5,  avgRank:10.17, hdi:4,  oecd:10, numbeo:8,  socialProgress:11, goodLife:9,  happyPlanet:19 },
  AT: { overallRank:6,  avgRank:12.17, hdi:18, oecd:9,  numbeo:7,  socialProgress:13, goodLife:8,  happyPlanet:18 },
  IE: { overallRank:7,  avgRank:13.20, hdi:3,  oecd:12, numbeo:29, socialProgress:10, goodLife:12, happyPlanet:null },
  LU: { overallRank:8,  avgRank:13.67, hdi:16, oecd:13, numbeo:3,  socialProgress:9,  goodLife:10, happyPlanet:31 },
  BE: { overallRank:9,  avgRank:16.83, hdi:19, oecd:11, numbeo:25, socialProgress:15, goodLife:11, happyPlanet:20 },
  ES: { overallRank:10, avgRank:18.20, hdi:27, oecd:18, numbeo:null, socialProgress:18, goodLife:17, happyPlanet:11 },
  FR: { overallRank:11, avgRank:20.50, hdi:28, oecd:16, numbeo:27, socialProgress:16, goodLife:15, happyPlanet:21 },
  SI: { overallRank:12, avgRank:21.67, hdi:23, oecd:21, numbeo:19, socialProgress:21, goodLife:22, happyPlanet:24 },
  EE: { overallRank:13, avgRank:23.00, hdi:30, oecd:24, numbeo:11, socialProgress:23, goodLife:24, happyPlanet:26 },
  IT: { overallRank:14, avgRank:24.50, hdi:29, oecd:19, numbeo:40, socialProgress:19, goodLife:18, happyPlanet:22 },
  CZ: { overallRank:15, avgRank:24.67, hdi:32, oecd:22, numbeo:24, socialProgress:22, goodLife:23, happyPlanet:25 },
  PT: { overallRank:16, avgRank:25.00, hdi:38, oecd:20, numbeo:28, socialProgress:20, goodLife:21, happyPlanet:23 },
  SK: { overallRank:17, avgRank:28.83, hdi:39, oecd:23, numbeo:35, socialProgress:24, goodLife:25, happyPlanet:27 },
  PL: { overallRank:18, avgRank:29.17, hdi:34, oecd:25, numbeo:37, socialProgress:25, goodLife:26, happyPlanet:28 },
  LV: { overallRank:19, avgRank:31.17, hdi:37, oecd:28, numbeo:31, socialProgress:27, goodLife:34, happyPlanet:30 },
  CY: { overallRank:20, avgRank:31.17, hdi:26, oecd:30, numbeo:34, socialProgress:33, goodLife:29, happyPlanet:35 },
  LT: { overallRank:21, avgRank:31.33, hdi:36, oecd:29, numbeo:21, socialProgress:26, goodLife:35, happyPlanet:29 },
  HR: { overallRank:22, avgRank:32.00, hdi:42, oecd:34, numbeo:22, socialProgress:28, goodLife:33, happyPlanet:34 },
  US: { overallRank:23, avgRank:33.00, hdi:21, oecd:15, numbeo:15, socialProgress:17, goodLife:22, happyPlanet:108 },
  GR: { overallRank:24, avgRank:33.17, hdi:35, oecd:27, numbeo:47, socialProgress:30, goodLife:28, happyPlanet:32 },
  HU: { overallRank:25, avgRank:33.17, hdi:40, oecd:26, numbeo:44, socialProgress:29, goodLife:27, happyPlanet:33 },
  MT: { overallRank:26, avgRank:34.50, hdi:25, oecd:31, numbeo:51, socialProgress:34, goodLife:30, happyPlanet:36 },
  RO: { overallRank:27, avgRank:38.17, hdi:53, oecd:32, numbeo:45, socialProgress:31, goodLife:31, happyPlanet:37 },
  BG: { overallRank:28, avgRank:39.33, hdi:58, oecd:33, numbeo:43, socialProgress:32, goodLife:32, happyPlanet:38 },
};

/* ---------- ROAD TRAFFIC DEATHS (per 100,000 population) ----------------- */
/* Source: WHO Global Status Report on Road Safety, national road safety agencies. */
const ROAD_DEATHS = {
  AT: 4.5, BE: 5.0, BG: 9.0, HR: 7.0, CY: 6.0, CZ: 6.5, DK: 2.5, EE: 5.5,
  FI: 3.0, FR: 4.8, DE: 4.1, GR: 7.0, HU: 6.0, IE: 3.2, IT: 5.3, LV: 7.5,
  LT: 7.0, LU: 4.0, MT: 4.0, NL: 2.8, PL: 7.5, PT: 6.0, RO: 9.5, SK: 6.8,
  SI: 5.0, ES: 3.7, SE: 2.5,
};
const US_ROAD_DEATHS = 12.4;

/* Index keys for QoL breakdown display */
const QOL_INDICES = [
  { key:"hdi",             label:"HDI",             desc:"UN Human Development Index" },
  { key:"oecd",            label:"OECD Better Life", desc:"OECD Better Life Index" },
  { key:"numbeo",          label:"Numbeo QoL",      desc:"Numbeo Quality of Life Index" },
  { key:"socialProgress",  label:"Social Progress", desc:"Social Progress Imperative" },
  { key:"goodLife",        label:"Good Country",    desc:"Good Country Index" },
  { key:"happyPlanet",     label:"Happy Planet",    desc:"Happy Planet Index" },
];

/* ---------- VISA PATHWAYS (EU-level + national) ------------------------- */
const VISAS = [
  { id: "bluecard", label: "EU Blue Card", desc: "Pan-EU skilled worker permit for university-educated professionals with a qualifying job offer.", minEducation: "bachelors", needsJobOffer: true, minIncomeEUR: 45000, prYears: 5, icon: "◆" },
  { id: "national_work", label: "National Work Permit", desc: "Country-specific employment visa. Requirements vary by state and occupation.", minEducation: "none", needsJobOffer: true, minIncomeEUR: 25000, prYears: 5, icon: "●" },
  { id: "nomad", label: "Digital Nomad Visa", desc: "Remote work residency for non-EU citizens earning from foreign clients or employers.", minEducation: "none", needsRemote: true, minIncomeEUR: 30000, prYears: null, icon: "◇" },
  { id: "freelance", label: "Self-Employed / Freelance", desc: "Residency for independent professionals, contractors and liberal-profession workers.", minEducation: "none", minIncomeEUR: 24000, prYears: 5, icon: "◈" },
  { id: "family", label: "Family Reunification", desc: "Join a spouse, parent or child already holding EU residency or citizenship.", needsFamily: true, prYears: 3, icon: "♥" },
  { id: "student", label: "Student Visa", desc: "Enrolment at a recognised EU university or vocational institution.", prYears: null, icon: "✦" },
  { id: "jobseeker", label: "Job Seeker Visa", desc: "Enter the country for 6–12 months to search for qualifying employment.", minEducation: "bachelors", prYears: null, icon: "◎" },
  { id: "retirement", label: "Retirement / Passive Income", desc: "Residency for non-working retirees or anyone with stable passive income (pensions, investments, rent).", needsPassiveIncome: true, minIncomeEUR: 24000, prYears: 5, icon: "☼" },
  { id: "golden", label: "Investor / Golden Visa", desc: "Residency by investment — property, funds, business creation, or government-approved contribution.", needsCapital: true, minCapitalEUR: 50000, prYears: 5, icon: "★" },
];

/* ---------- PRIORITIES ---------------------------------------------------- */
const PRIORITIES = [
  { id: "affordability", label: "Affordability", desc: "Low cost of living and housing" },
  { id: "safety",        label: "Safety",        desc: "Low homicide, low road fatalities, stable institutions" },
  { id: "healthcare",    label: "Healthcare",    desc: "Quality of public healthcare system" },
  { id: "english",       label: "English-friendly", desc: "Daily life workable in English" },
  { id: "jobs",          label: "Job market",    desc: "Opportunities for English-speaking professionals" },
  { id: "family",        label: "Family-friendly", desc: "Schools, childcare, parental leave" },
  { id: "climate",       label: "Mild climate",  desc: "Moderate temperatures year-round" },
  { id: "nature",        label: "Nature & outdoors", desc: "Green space, coastline, mountains" },
  { id: "culture",       label: "Cultural life", desc: "Arts, music, food, history" },
  { id: "transit",       label: "Transit & walkability", desc: "Public transport, cyclable cities" },
  { id: "international", label: "International community", desc: "Expat and international presence" },
  { id: "citizenship",   label: "Path to citizenship", desc: "Shorter naturalisation timelines" },
  { id: "qualityOfLife", label: "Overall quality of life", desc: "HDI, OECD Better Life, Social Progress, and other global indices combined" },
];

/* ---------- OFFICIAL GOVERNMENT PORTALS ---------------------------------- */
/* English-accessible official sources where possible; fallback to authoritative national portal. */
const PORTALS = {
  AT: { url: "https://www.migration.gv.at/en/",                              agency: "Austrian Migration Portal (BMI)" },
  BE: { url: "https://dofi.ibz.be/en",                                       agency: "Belgian Immigration Office (OE/DVZ)" },
  BG: { url: "https://www.mvr.bg/en",                                        agency: "Bulgarian Ministry of Interior" },
  HR: { url: "https://mup.gov.hr/aliens-281621/281621",                      agency: "Croatian Ministry of Interior" },
  CY: { url: "https://www.moi.gov.cy/moi/crmd/crmd.nsf/index_en/index_en",   agency: "Cyprus Civil Registry & Migration" },
  CZ: { url: "https://www.mvcr.cz/mvcren/",                                  agency: "Czech Ministry of Interior" },
  DK: { url: "https://www.nyidanmark.dk/en-GB",                              agency: "New to Denmark (SIRI)" },
  EE: { url: "https://www.politsei.ee/en/",                                  agency: "Estonian Police & Border Guard" },
  FI: { url: "https://migri.fi/en/home",                                     agency: "Finnish Immigration Service (Migri)" },
  FR: { url: "https://france-visas.gouv.fr/en/",                             agency: "France-Visas (Official Visa Portal)" },
  DE: { url: "https://www.make-it-in-germany.com/en/",                       agency: "Make it in Germany (Federal Govt.)" },
  GR: { url: "https://migration.gov.gr/en/",                                 agency: "Greek Ministry of Migration & Asylum" },
  HU: { url: "https://oif.gov.hu/index.php?lang=en",                         agency: "Hungarian Aliens Policing (OIF)" },
  IE: { url: "https://www.irishimmigration.ie/",                             agency: "Irish Immigration Service" },
  IT: { url: "https://vistoperitalia.esteri.it/home/en",                     agency: "Visto per Italia (Italian MFA)" },
  LV: { url: "https://www.pmlp.gov.lv/en",                                   agency: "Latvian Citizenship & Migration Office" },
  LT: { url: "https://migracija.lrv.lt/en/",                                 agency: "Lithuanian Migration Department" },
  LU: { url: "https://guichet.public.lu/en/citoyens/immigration.html",       agency: "Guichet.lu (Luxembourg Govt.)" },
  MT: { url: "https://www.identita.gov.mt/",                                 agency: "Identità (formerly Identity Malta)" },
  NL: { url: "https://ind.nl/en",                                            agency: "Immigration & Naturalisation Service (IND)" },
  PL: { url: "https://www.gov.pl/web/udsc-en",                               agency: "Polish Office for Foreigners (UdSC)" },
  PT: { url: "https://vistos.mne.gov.pt/en/",                                agency: "Portugal Visas (MNE) / AIMA" },
  RO: { url: "https://igi.mai.gov.ro/en/",                                   agency: "Romanian Inspectorate for Immigration" },
  SK: { url: "https://www.minv.sk/?foreigner-residence",                     agency: "Slovak Ministry of Interior" },
  SI: { url: "https://www.gov.si/en/topics/residence-and-foreigners/",       agency: "Government of Slovenia" },
  ES: { url: "https://extranjeros.inclusion.gob.es/en/",                     agency: "Spanish Extranjería" },
  SE: { url: "https://www.migrationsverket.se/English/",                     agency: "Swedish Migration Agency (Migrationsverket)" },
};

/* ---------- 27 EU MEMBER STATES ------------------------------------------ */
const COUNTRIES = [
  { code:"AT", name:"Austria",        capital:"Vienna",     flag:"🇦🇹", pop:9.1,  lang:"German",                       eurozone:true,  schengen:true,  natYears:10,
    visas:["bluecard","national_work","freelance","family","student","jobseeker","retirement"],
    s:{ affordability:45, safety:82, healthcare:88, english:75, jobs:65, family:82, climate:62, nature:90, culture:88, transit:88, international:72, citizenship:35 }},
  { code:"BE", name:"Belgium",        capital:"Brussels",   flag:"🇧🇪", pop:11.8, lang:"Dutch, French, German",        eurozone:true,  schengen:true,  natYears:5,
    visas:["bluecard","national_work","freelance","family","student","retirement"],
    s:{ affordability:48, safety:58, healthcare:85, english:75, jobs:72, family:78, climate:68, nature:60, culture:85, transit:85, international:82, citizenship:70 }},
  { code:"BG", name:"Bulgaria",       capital:"Sofia",      flag:"🇧🇬", pop:6.4,  lang:"Bulgarian",                    eurozone:false, schengen:true,  natYears:5,
    visas:["bluecard","national_work","freelance","family","student","retirement","golden"],
    s:{ affordability:90, safety:62, healthcare:58, english:55, jobs:42, family:60, climate:72, nature:80, culture:68, transit:62, international:50, citizenship:72 }},
  { code:"HR", name:"Croatia",        capital:"Zagreb",     flag:"🇭🇷", pop:3.8,  lang:"Croatian",                     eurozone:true,  schengen:true,  natYears:8,
    visas:["bluecard","national_work","nomad","family","student","retirement"],
    s:{ affordability:72, safety:78, healthcare:70, english:72, jobs:48, family:72, climate:82, nature:88, culture:74, transit:65, international:65, citizenship:45 }},
  { code:"CY", name:"Cyprus",         capital:"Nicosia",    flag:"🇨🇾", pop:1.3,  lang:"Greek, Turkish",               eurozone:true,  schengen:false, natYears:7,
    visas:["bluecard","national_work","nomad","family","student","retirement","golden"],
    s:{ affordability:60, safety:75, healthcare:70, english:82, jobs:60, family:72, climate:92, nature:68, culture:68, transit:55, international:70, citizenship:55 }},
  { code:"CZ", name:"Czech Republic", capital:"Prague",     flag:"🇨🇿", pop:10.7, lang:"Czech",                        eurozone:false, schengen:true,  natYears:5,
    visas:["bluecard","national_work","freelance","nomad","family","student"],
    s:{ affordability:68, safety:78, healthcare:78, english:66, jobs:58, family:74, climate:60, nature:76, culture:84, transit:82, international:70, citizenship:70 }},
  { code:"DK", name:"Denmark",        capital:"Copenhagen", flag:"🇩🇰", pop:5.9,  lang:"Danish",                       eurozone:false, schengen:true,  natYears:9,
    visas:["bluecard","national_work","freelance","family","student","jobseeker"],
    s:{ affordability:32, safety:88, healthcare:88, english:92, jobs:72, family:90, climate:55, nature:72, culture:80, transit:85, international:75, citizenship:35 }},
  { code:"EE", name:"Estonia",        capital:"Tallinn",    flag:"🇪🇪", pop:1.4,  lang:"Estonian",                     eurozone:true,  schengen:true,  natYears:8,
    visas:["bluecard","national_work","freelance","nomad","family","student"],
    s:{ affordability:66, safety:82, healthcare:75, english:72, jobs:58, family:80, climate:48, nature:85, culture:70, transit:70, international:65, citizenship:45 }},
  { code:"FI", name:"Finland",        capital:"Helsinki",   flag:"🇫🇮", pop:5.6,  lang:"Finnish, Swedish",             eurozone:true,  schengen:true,  natYears:5,
    visas:["bluecard","national_work","freelance","family","student","jobseeker"],
    s:{ affordability:46, safety:90, healthcare:86, english:88, jobs:62, family:92, climate:35, nature:94, culture:72, transit:78, international:65, citizenship:70 }},
  { code:"FR", name:"France",         capital:"Paris",      flag:"🇫🇷", pop:68.4, lang:"French",                       eurozone:true,  schengen:true,  natYears:5,
    visas:["bluecard","national_work","freelance","family","student","retirement"],
    s:{ affordability:45, safety:52, healthcare:92, english:56, jobs:58, family:80, climate:80, nature:82, culture:95, transit:85, international:72, citizenship:70 }},
  { code:"DE", name:"Germany",        capital:"Berlin",     flag:"🇩🇪", pop:84.6, lang:"German",                       eurozone:true,  schengen:true,  natYears:5,
    visas:["bluecard","national_work","freelance","family","student","jobseeker"],
    s:{ affordability:52, safety:68, healthcare:86, english:80, jobs:75, family:82, climate:65, nature:82, culture:90, transit:86, international:78, citizenship:70 }},
  { code:"GR", name:"Greece",         capital:"Athens",     flag:"🇬🇷", pop:10.4, lang:"Greek",                        eurozone:true,  schengen:true,  natYears:7,
    visas:["bluecard","national_work","nomad","family","student","retirement","golden"],
    s:{ affordability:66, safety:62, healthcare:68, english:76, jobs:48, family:68, climate:90, nature:88, culture:90, transit:68, international:66, citizenship:55 }},
  { code:"HU", name:"Hungary",        capital:"Budapest",   flag:"🇭🇺", pop:9.6,  lang:"Hungarian",                    eurozone:false, schengen:true,  natYears:8,
    visas:["bluecard","national_work","nomad","family","student","golden"],
    s:{ affordability:76, safety:72, healthcare:66, english:58, jobs:52, family:68, climate:62, nature:70, culture:82, transit:82, international:62, citizenship:45 }},
  { code:"IE", name:"Ireland",        capital:"Dublin",     flag:"🇮🇪", pop:5.3,  lang:"English, Irish",               eurozone:true,  schengen:false, natYears:5,
    visas:["national_work","family","student","retirement"],
    s:{ affordability:32, safety:64, healthcare:78, english:100, jobs:88, family:75, climate:72, nature:85, culture:78, transit:62, international:85, citizenship:70 }},
  { code:"IT", name:"Italy",          capital:"Rome",       flag:"🇮🇹", pop:58.8, lang:"Italian",                      eurozone:true,  schengen:true,  natYears:10,
    visas:["bluecard","national_work","freelance","nomad","family","student","retirement","golden"],
    s:{ affordability:56, safety:60, healthcare:82, english:52, jobs:50, family:72, climate:88, nature:86, culture:96, transit:76, international:65, citizenship:35 }},
  { code:"LV", name:"Latvia",         capital:"Riga",       flag:"🇱🇻", pop:1.9,  lang:"Latvian",                      eurozone:true,  schengen:true,  natYears:5,
    visas:["bluecard","national_work","nomad","family","student","golden"],
    s:{ affordability:72, safety:68, healthcare:66, english:62, jobs:46, family:70, climate:50, nature:82, culture:66, transit:70, international:58, citizenship:70 }},
  { code:"LT", name:"Lithuania",      capital:"Vilnius",    flag:"🇱🇹", pop:2.9,  lang:"Lithuanian",                   eurozone:true,  schengen:true,  natYears:10,
    visas:["bluecard","national_work","freelance","family","student"],
    s:{ affordability:70, safety:72, healthcare:68, english:60, jobs:48, family:70, climate:55, nature:78, culture:68, transit:68, international:55, citizenship:35 }},
  { code:"LU", name:"Luxembourg",     capital:"Luxembourg", flag:"🇱🇺", pop:0.66, lang:"Luxembourgish, French, German", eurozone:true, schengen:true, natYears:5,
    visas:["bluecard","national_work","family","student"],
    s:{ affordability:30, safety:82, healthcare:86, english:86, jobs:85, family:88, climate:68, nature:72, culture:72, transit:82, international:90, citizenship:70 }},
  { code:"MT", name:"Malta",          capital:"Valletta",   flag:"🇲🇹", pop:0.55, lang:"Maltese, English",             eurozone:true,  schengen:true,  natYears:5,
    visas:["bluecard","national_work","nomad","family","student","retirement","golden"],
    s:{ affordability:54, safety:62, healthcare:78, english:100, jobs:75, family:72, climate:94, nature:58, culture:70, transit:58, international:72, citizenship:70 }},
  { code:"NL", name:"Netherlands",    capital:"Amsterdam",  flag:"🇳🇱", pop:17.9, lang:"Dutch",                        eurozone:true,  schengen:true,  natYears:5,
    visas:["bluecard","national_work","freelance","family","student"],
    s:{ affordability:38, safety:72, healthcare:86, english:95, jobs:85, family:86, climate:68, nature:66, culture:85, transit:90, international:82, citizenship:70 }},
  { code:"PL", name:"Poland",         capital:"Warsaw",     flag:"🇵🇱", pop:36.8, lang:"Polish",                       eurozone:false, schengen:true,  natYears:10,
    visas:["bluecard","national_work","freelance","family","student"],
    s:{ affordability:72, safety:74, healthcare:70, english:68, jobs:58, family:74, climate:58, nature:82, culture:76, transit:76, international:62, citizenship:35 }},
  { code:"PT", name:"Portugal",       capital:"Lisbon",     flag:"🇵🇹", pop:10.6, lang:"Portuguese",                   eurozone:true,  schengen:true,  natYears:5,
    visas:["bluecard","national_work","freelance","nomad","family","student","jobseeker","retirement","golden"],
    s:{ affordability:64, safety:80, healthcare:76, english:82, jobs:62, family:76, climate:90, nature:80, culture:80, transit:78, international:78, citizenship:88 }},
  { code:"RO", name:"Romania",        capital:"Bucharest",  flag:"🇷🇴", pop:19.1, lang:"Romanian",                     eurozone:false, schengen:true,  natYears:8,
    visas:["bluecard","national_work","nomad","family","student"],
    s:{ affordability:82, safety:58, healthcare:60, english:66, jobs:46, family:62, climate:62, nature:86, culture:72, transit:62, international:56, citizenship:45 }},
  { code:"SK", name:"Slovakia",       capital:"Bratislava", flag:"🇸🇰", pop:5.4,  lang:"Slovak",                       eurozone:true,  schengen:true,  natYears:8,
    visas:["bluecard","national_work","family","student"],
    s:{ affordability:72, safety:66, healthcare:66, english:60, jobs:46, family:72, climate:58, nature:82, culture:66, transit:70, international:55, citizenship:45 }},
  { code:"SI", name:"Slovenia",       capital:"Ljubljana",  flag:"🇸🇮", pop:2.1,  lang:"Slovenian",                    eurozone:true,  schengen:true,  natYears:10,
    visas:["bluecard","national_work","freelance","family","student"],
    s:{ affordability:66, safety:82, healthcare:80, english:75, jobs:52, family:86, climate:68, nature:94, culture:70, transit:72, international:60, citizenship:35 }},
  { code:"ES", name:"Spain",          capital:"Madrid",     flag:"🇪🇸", pop:48.6, lang:"Spanish",                      eurozone:true,  schengen:true,  natYears:10,
    visas:["bluecard","national_work","freelance","nomad","family","student","retirement"],
    s:{ affordability:60, safety:64, healthcare:84, english:58, jobs:58, family:76, climate:88, nature:84, culture:90, transit:82, international:78, citizenship:35 }},
  { code:"SE", name:"Sweden",         capital:"Stockholm",  flag:"🇸🇪", pop:10.6, lang:"Swedish",                      eurozone:false, schengen:true,  natYears:5,
    visas:["bluecard","national_work","freelance","family","student","jobseeker"],
    s:{ affordability:42, safety:55, healthcare:85, english:90, jobs:72, family:90, climate:45, nature:92, culture:80, transit:82, international:72, citizenship:70 }},
];

const citizenshipScore = (natYears) => Math.max(0, 100 - (natYears - 3) * 8);

/* Convert road death rate (per 100k) to a 0-100 safety score.
   Baseline: 2.5 (best EU) → 100, 9.5 (worst EU) → 30, US at 12.4 would be ~10. */
const roadToSafety = (rate) => {
  if (rate == null) return null;
  return Math.max(5, Math.min(100, 110 - rate * 10));
};

/* Convert an overall QoL rank (1 = best, among 28 countries) to a 0-100 score. */
const qolRankToScore = (rank) => {
  if (rank == null) return null;
  return Math.max(10, Math.min(100, 105 - rank * 3.5));
};

const priorityValue = (country, pid) => {
  if (pid === "citizenship") return citizenshipScore(country.natYears);
  if (pid === "qualityOfLife") {
    // QoL priority: use the blended overall rank from 6 global indices
    const rank = QOL[country.code]?.overallRank;
    return qolRankToScore(rank) ?? 50;
  }
  if (pid === "safety") {
    // Blend: 45% homicide, 25% road deaths, 30% institutional baseline.
    const baseline = country.s.safety ?? 50;
    const h = EU_CRIME[country.code]?.homicide;
    const homicideScore = homicideToSafety(h);
    const road = ROAD_DEATHS[country.code];
    const roadScore = roadToSafety(road);
    // Weighted components with fallbacks for missing data
    let total = 0, weightSum = 0;
    if (homicideScore != null) { total += homicideScore * 45; weightSum += 45; }
    if (roadScore != null)     { total += roadScore * 25;     weightSum += 25; }
    total += baseline * 30;
    weightSum += 30;
    return Math.round(total / weightSum);
  }
  return country.s[pid] ?? 50;
};

/* ==========================================================================
   MAIN COMPONENT
   ========================================================================== */

export default function MoveMeToEU() {
  const [step, setStep] = useState(0);
  const [view, setView] = useState("wizard"); // "wizard" | "whyEU"
  const [userState, setUserState] = useState("Virginia");
  const [selectedVisa, setSelectedVisa] = useState(null);
  const [profile, setProfile] = useState({
    education: "bachelors", income: "60to100", capital: "under50",
    age: 35, yearsExp: 10,
    hasEUFamily: false, canRemote: false, wantsCitizenship: true,
  });
  const [weights, setWeights] = useState(() =>
    Object.fromEntries(PRIORITIES.map(p => [p.id, 3]))
  );
  const [dealbreakers, setDealbreakers] = useState(() =>
    Object.fromEntries(PRIORITIES.map(p => [p.id, 0]))
  );
  const [shortlist, setShortlist] = useState([]);   // array of country codes, max 3
  const [comparing, setComparing] = useState(false);
  const [chartScope, setChartScope] = useState("all"); // "all" | "matches"

  const mainRef = useRef(null);
  const [animateIn, setAnimateIn] = useState(true);
  useEffect(() => {
    setAnimateIn(false);
    requestAnimationFrame(() => setAnimateIn(true));
    mainRef.current?.focus();
  }, [step, comparing, view]);

  /* ---------- Shortlist helpers ---------- */
  const toggleShortlist = (code) => {
    setShortlist(prev => {
      if (prev.includes(code)) return prev.filter(c => c !== code);
      if (prev.length >= 3) return prev;
      return [...prev, code];
    });
  };
  const clearShortlist = () => { setShortlist([]); setComparing(false); };

  /* ---------- Matching engine ---------- */
  const results = useMemo(() => {
    if (step < 3 && !comparing && view !== "whyEU") return [];
    const edRank = EDUCATION.find(e => e.id === profile.education)?.rank ?? 0;
    const incomeEUR = INCOME_BANDS.find(b => b.id === profile.income)?.eur ?? 0;
    const capitalEUR = CAPITAL_BANDS.find(b => b.id === profile.capital)?.eur ?? 0;

    // --- Priority weighting ---
    // Non-linear weight curve: w² amplifies the effect of high priorities and
    // diminishes the effect of weights near 0. Weight 0 is excluded entirely,
    // so priorities a user marks "doesn't matter" don't dilute the score.
    const activePriorities = PRIORITIES.filter(p => (weights[p.id] ?? 0) > 0);
    const weightPower = (w) => w * w;
    const totalPower = activePriorities.reduce((s, p) => s + weightPower(weights[p.id]), 0) || 1;
    // Has the user meaningfully customized their priorities? If not, show a
    // generic score (average of all priorities at equal weight).
    const hasAny5 = activePriorities.some(p => weights[p.id] === 5);

    return COUNTRIES
      .map(c => {
        // --- Visa eligibility filter ---
        const availableVisas = c.visas
          .map(vid => VISAS.find(v => v.id === vid))
          .filter(Boolean)
          .filter(v => {
            if (selectedVisa && v.id !== selectedVisa) return false;
            if (v.minEducation) {
              const required = EDUCATION.find(e => e.id === v.minEducation)?.rank ?? 0;
              if (edRank < required) return false;
            }
            if (v.minIncomeEUR && incomeEUR < v.minIncomeEUR) return false;
            if (v.minCapitalEUR && capitalEUR < v.minCapitalEUR) return false;
            if (v.needsRemote && !profile.canRemote) return false;
            if (v.needsFamily && !profile.hasEUFamily) return false;
            if (v.needsCapital && capitalEUR < 50000) return false;
            return true;
          });

        // --- Priority match score ---
        // 1) Weighted average using w² so high priorities dominate.
        const rawScore = activePriorities.reduce((acc, p) => {
          return acc + priorityValue(c, p.id) * weightPower(weights[p.id]);
        }, 0) / totalPower;

        // 2) Bonus for excellence on critical priorities (w≥4).
        //    +0.5 point for every priority weighted 4-5 that scores ≥85.
        //    +1.5 points for every priority weighted 5 that scores ≥90.
        let bonus = 0;
        for (const p of activePriorities) {
          const w = weights[p.id];
          const v = priorityValue(c, p.id);
          if (w >= 4 && v >= 85) bonus += 0.5;
          if (w === 5 && v >= 90) bonus += 1.5;
        }

        // 3) Penalty for weak performance on critical priorities (w≥4).
        //    -1 point for every priority weighted 4-5 that scores ≤40.
        //    -3 points for every priority weighted 5 that scores ≤30.
        let penalty = 0;
        for (const p of activePriorities) {
          const w = weights[p.id];
          const v = priorityValue(c, p.id);
          if (w >= 4 && v <= 40) penalty += 1;
          if (w === 5 && v <= 30) penalty += 3;
        }

        // 4) Apply a spreading curve that amplifies differences near the middle.
        //    Raw avg of 50 → 45 (small dip), 70 → 73 (slight bump), 85 → 92 (reward
        //    excellence), 40 → 30 (penalize mediocrity). This increases spread without
        //    driving every country to 100.
        const spread = (x) => {
          if (x >= 70) return 70 + (x - 70) * 1.4;   // excellence bumps higher
          if (x >= 50) return 45 + (x - 50) * 1.4;   // middling gets pushed slightly up
          return x * 0.9;                             // low stays low
        };

        const finalScore = Math.max(0, Math.min(100,
          Math.round(spread(rawScore) + bonus - penalty)
        ));

        // --- Dealbreakers ---
        const failedDealbreakers = PRIORITIES.filter(p => {
          const min = dealbreakers[p.id];
          if (!min) return false;
          return priorityValue(c, p.id) < min;
        });

        return {
          country: c,
          score: finalScore,
          rawScore: Math.round(rawScore),
          bonus, penalty,
          availableVisas,
          failedDealbreakers,
          eligible: availableVisas.length > 0 && failedDealbreakers.length === 0,
          hasAny5,
        };
      })
      .sort((a, b) => {
        if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
        return b.score - a.score;
      });
  }, [step, comparing, view, selectedVisa, profile, weights, dealbreakers]);

  const shortlistedResults = useMemo(
    () => shortlist.map(code => results.find(r => r.country.code === code)).filter(Boolean),
    [shortlist, results]
  );

  /* ---------- Styles ---------- */
  const S = {
    page: { minHeight:"100vh", background:"#FAF6EE", fontFamily:'"Manrope", -apple-system, sans-serif', color:"#0A1F4D" },
    header: { background:"#003399", color:"#FAF6EE", borderBottom:"1px solid #002277" },
    headerInner: { maxWidth:1120, margin:"0 auto", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:20, flexWrap:"wrap" },
    logoArea: { display:"flex", alignItems:"center", gap:14 },
    logoTitle: { fontFamily:'"Fraunces", Georgia, serif', fontSize:22, fontWeight:600, letterSpacing:"-0.01em", margin:0, lineHeight:1.1, color:"#fff" },
    logoSub: { fontSize:11, opacity:0.85, marginTop:2, letterSpacing:"0.14em", textTransform:"uppercase", color:"#FFCC00" },
    stepper: { display:"flex", gap:8, listStyle:"none", padding:0, margin:0, flexWrap:"wrap" },
    stepDot: { display:"flex", alignItems:"center", gap:8, fontSize:13, color:"#FAF6EE", opacity:0.6 },
    stepDotActive: { opacity:1 },
    dot: { width:24, height:24, borderRadius:"50%", display:"grid", placeItems:"center", fontSize:12, fontWeight:600, background:"rgba(255,255,255,0.15)", color:"#FAF6EE", border:"1px solid rgba(255,255,255,0.25)" },
    dotActive: { background:"#FFCC00", color:"#003399", border:"1px solid #FFCC00" },
    main: { maxWidth:1120, margin:"0 auto", padding:"40px 20px 140px" },
    h2: { fontFamily:'"Fraunces", Georgia, serif', fontSize:36, fontWeight:500, letterSpacing:"-0.02em", margin:"0 0 8px", color:"#0A1F4D" },
    lede: { fontSize:16, color:"#4A5578", maxWidth:640, margin:"0 0 32px", lineHeight:1.55 },
    grid: { display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:16 },
    card: { background:"#fff", border:"1px solid #E8DFC9", borderRadius:4, padding:20, cursor:"pointer", transition:"all .18s ease", textAlign:"left", font:"inherit", color:"inherit", width:"100%", display:"block" },
    cardActive: { borderColor:"#003399", boxShadow:"0 0 0 2px #003399, 0 8px 24px rgba(0,51,153,0.12)" },
    cardTitle: { fontFamily:'"Fraunces", Georgia, serif', fontSize:20, fontWeight:600, marginBottom:6, color:"#0A1F4D" },
    cardDesc: { fontSize:14, color:"#4A5578", lineHeight:1.5 },
    icon: { fontSize:22, color:"#FFCC00", marginBottom:12, display:"block" },
    formRow: { display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))", gap:20, marginBottom:24 },
    field: { display:"flex", flexDirection:"column", gap:8 },
    label: { fontSize:12, letterSpacing:"0.1em", textTransform:"uppercase", color:"#4A5578", fontWeight:600 },
    select: { padding:"12px 14px", border:"1px solid #CEC2A0", background:"#fff", borderRadius:4, fontSize:15, fontFamily:"inherit", color:"inherit" },
    sliderRow: { display:"grid", gridTemplateColumns:"1fr 80px", alignItems:"center", gap:16, padding:"14px 0", borderBottom:"1px solid #EADFC2" },
    priName: { fontSize:15, fontWeight:600 },
    priDesc: { fontSize:13, color:"#4A5578", marginTop:2 },
    chip: { display:"inline-block", padding:"3px 9px", borderRadius:999, fontSize:11, fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase" },
    chipGold: { background:"#FFF4C4", color:"#7A5C00", border:"1px solid #FFCC00" },
    chipBlue: { background:"#E4ECFF", color:"#003399", border:"1px solid #B8C9F5" },
    chipGreen: { background:"#E6F4E4", color:"#1F5D1F", border:"1px solid #B6DDB0" },
    chipRed: { background:"#FDE4E4", color:"#8C1F1F", border:"1px solid #F0B8B8" },
    btn: { padding:"14px 28px", background:"#003399", color:"#fff", border:"none", borderRadius:4, fontSize:15, fontWeight:600, cursor:"pointer", fontFamily:"inherit", transition:"background .15s" },
    btnGhost: { padding:"14px 28px", background:"transparent", color:"#003399", border:"1px solid #003399", borderRadius:4, fontSize:15, fontWeight:600, cursor:"pointer", fontFamily:"inherit" },
    btnGold: { padding:"14px 28px", background:"#FFCC00", color:"#003399", border:"none", borderRadius:4, fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"inherit" },
    nav: { display:"flex", justifyContent:"space-between", marginTop:32, flexWrap:"wrap", gap:12 },
    resultRow: { background:"#fff", border:"1px solid #E8DFC9", borderRadius:4, padding:24, marginBottom:16 },
    resultHead: { display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:20, flexWrap:"wrap", marginBottom:12 },
    resultTitle: { fontFamily:'"Fraunces", Georgia, serif', fontSize:26, fontWeight:600, color:"#0A1F4D", display:"flex", alignItems:"center", gap:12 },
    scoreBadge: { fontFamily:'"Fraunces", Georgia, serif', fontSize:32, fontWeight:500, color:"#003399" },
    metaRow: { display:"flex", flexWrap:"wrap", gap:8, marginTop:4, marginBottom:16 },
    metaList: { display:"flex", flexWrap:"wrap", columnGap:22, rowGap:6, fontSize:14, color:"#0A1F4D", margin:"8px 0 0" },
    metaItem: { display:"inline-flex", alignItems:"baseline", gap:6, margin:0 },
    metaLabel: { fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", color:"#4A5578", fontWeight:700, margin:0 },
    metaValue: { fontWeight:500, margin:0 },
    visaList: { display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:10, marginTop:12 },
    visaItem: { background:"#FAF6EE", border:"1px solid #E8DFC9", borderRadius:4, padding:"10px 14px", display:"flex", alignItems:"center", gap:10, fontSize:14 },
    toggle: { display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:"#fff", border:"1px solid #CEC2A0", borderRadius:4, cursor:"pointer", fontSize:14, fontFamily:"inherit" },
    actionBar: { display:"flex", gap:10, marginTop:20, paddingTop:16, borderTop:"1px solid #EADFC2", flexWrap:"wrap", alignItems:"center" },
    compareBtn: { padding:"10px 16px", background:"transparent", color:"#003399", border:"1px solid #B8C9F5", borderRadius:4, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", display:"inline-flex", alignItems:"center", gap:8 },
    compareBtnActive: { background:"#FFCC00", borderColor:"#FFCC00", color:"#003399" },
    portalLink: { padding:"10px 16px", background:"transparent", color:"#003399", border:"1px solid #B8C9F5", borderRadius:4, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", display:"inline-flex", alignItems:"center", gap:8, textDecoration:"none" },
    floatingBar: { position:"fixed", bottom:20, left:"50%", transform:"translateX(-50%)", background:"#003399", color:"#fff", padding:"14px 20px", borderRadius:999, boxShadow:"0 8px 32px rgba(0,51,153,0.35)", display:"flex", alignItems:"center", gap:16, zIndex:100, maxWidth:"calc(100% - 40px)", flexWrap:"wrap" },
    floatingFlags: { display:"flex", gap:6, fontSize:20 },
    compareCell: { padding:"16px 14px", borderRight:"1px solid #EADFC2", fontSize:14 },
    compareLabelCell: { padding:"16px 14px", borderRight:"1px solid #EADFC2", fontSize:12, letterSpacing:"0.08em", textTransform:"uppercase", color:"#4A5578", fontWeight:600, background:"#FAF6EE" },
    compareScoreBar: { height:8, background:"#F3EBDA", borderRadius:4, overflow:"hidden", marginTop:6 },
    compareScoreFill: { height:"100%", background:"linear-gradient(90deg, #003399, #FFCC00)", transition:"width .3s" },
  };

  const stepNames = ["Pathway", "About you", "Priorities", "Matches"];
  const goNext = () => setStep(s => Math.min(3, s + 1));
  const goBack = () => setStep(s => Math.max(0, s - 1));

  /* ============================================================
     STEP RENDERERS
     ============================================================ */

  const renderStep0 = () => (
    <div style={{ animation: animateIn ? "fadeSlideIn .4s ease" : undefined }}>
      <div style={{
        background:"#fff", border:"1px solid #E8DFC9", borderLeft:"4px solid #FFCC00",
        borderRadius:4, padding:"14px 18px", marginBottom:28, display:"flex",
        alignItems:"center", justifyContent:"space-between", gap:16, flexWrap:"wrap",
      }}>
        <div style={{ fontSize:14, color:"#0A1F4D" }}>
          <strong>Moving from the US?</strong>{" "}
          <span style={{ color:"#4A5578" }}>See how your state's safety compares to every EU member state.</span>
        </div>
        <button type="button" onClick={() => setView("whyEU")}
          style={{ ...S.compareBtn, whiteSpace:"nowrap" }}>
          Why EU? →
        </button>
      </div>
      <h2 style={S.h2}>Which pathway are you exploring?</h2>
      <p style={S.lede}>
        Pick the visa route that fits your situation, or skip this step to see every pathway available
        to you across the 27 EU member states.
      </p>
      <div style={S.grid} role="group" aria-label="Visa pathway — select one option">
        <button type="button" aria-pressed={selectedVisa === null}
          style={{ ...S.card, ...(selectedVisa === null ? S.cardActive : {}) }}
          onClick={() => setSelectedVisa(null)}>
          <span style={S.icon} aria-hidden="true">∞</span>
          <div style={S.cardTitle}>Show me everything</div>
          <div style={S.cardDesc}>I'm open to any pathway — show which ones fit my profile.</div>
        </button>
        {VISAS.map(v => (
          <button key={v.id} type="button" aria-pressed={selectedVisa === v.id}
            style={{ ...S.card, ...(selectedVisa === v.id ? S.cardActive : {}) }}
            onClick={() => setSelectedVisa(v.id)}>
            <span style={S.icon} aria-hidden="true">{v.icon}</span>
            <div style={S.cardTitle}>{v.label}</div>
            <div style={S.cardDesc}>{v.desc}</div>
          </button>
        ))}
      </div>
      <div style={S.nav}>
        <span />
        <button type="button" style={S.btn} onClick={goNext}>Continue →</button>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div style={{ animation: animateIn ? "fadeSlideIn .4s ease" : undefined }}>
      <h2 style={S.h2}>A bit about you</h2>
      <p style={S.lede}>
        This helps us filter pathways you actually qualify for. All answers stay on this device —
        nothing is sent anywhere.
      </p>

      <div style={S.formRow}>
        <div style={S.field}>
          <label htmlFor="ed" style={S.label}>Highest education</label>
          <select id="ed" style={S.select} value={profile.education}
            onChange={e => setProfile({ ...profile, education: e.target.value })}>
            {EDUCATION.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
          </select>
        </div>
        <div style={S.field}>
          <label htmlFor="inc" style={S.label}>Annual income (gross)</label>
          <select id="inc" style={S.select} value={profile.income}
            onChange={e => setProfile({ ...profile, income: e.target.value })}>
            {INCOME_BANDS.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
          </select>
        </div>
        <div style={S.field}>
          <label htmlFor="cap" style={S.label}>Available investment capital</label>
          <select id="cap" style={S.select} value={profile.capital}
            onChange={e => setProfile({ ...profile, capital: e.target.value })}>
            {CAPITAL_BANDS.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
          </select>
        </div>
      </div>

      <div style={S.formRow}>
        <div style={S.field}>
          <label htmlFor="age" style={S.label}>Age</label>
          <input id="age" type="number" min={18} max={99} style={S.select}
            value={profile.age}
            onChange={e => setProfile({ ...profile, age: +e.target.value })} />
        </div>
        <div style={S.field}>
          <label htmlFor="exp" style={S.label}>Years of work experience</label>
          <input id="exp" type="number" min={0} max={60} style={S.select}
            value={profile.yearsExp}
            onChange={e => setProfile({ ...profile, yearsExp: +e.target.value })} />
        </div>
      </div>

      <fieldset style={{ border:"none", padding:0, margin:"0 0 16px" }}>
        <legend style={{ ...S.label, marginBottom:10 }}>Which of these describe you?</legend>
        <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
          <label style={S.toggle}>
            <input type="checkbox" checked={profile.canRemote}
              onChange={e => setProfile({ ...profile, canRemote: e.target.checked })} />
            I can work fully remote for a non-EU employer or clients
          </label>
          <label style={S.toggle}>
            <input type="checkbox" checked={profile.hasEUFamily}
              onChange={e => setProfile({ ...profile, hasEUFamily: e.target.checked })} />
            I have immediate family with EU residency or citizenship
          </label>
          <label style={S.toggle}>
            <input type="checkbox" checked={profile.wantsCitizenship}
              onChange={e => setProfile({ ...profile, wantsCitizenship: e.target.checked })} />
            A path to EU citizenship matters to me
          </label>
        </div>
      </fieldset>

      <div style={S.nav}>
        <button type="button" style={S.btnGhost} onClick={goBack}>← Back</button>
        <button type="button" style={S.btn} onClick={goNext}>Continue →</button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div style={{ animation: animateIn ? "fadeSlideIn .4s ease" : undefined }}>
      <h2 style={S.h2}>What matters most?</h2>
      <p style={S.lede}>
        Rate each factor from <strong>0 (doesn't matter, excluded from scoring)</strong> to{" "}
        <strong>5 (critical)</strong>. Higher weights count disproportionately more — critical priorities
        can dominate the match score, and countries that excel (or fail) on them earn bonuses (or penalties).
        Optionally set a minimum threshold to flag dealbreakers.
      </p>

      <div role="group" aria-label="Priorities">
        {PRIORITIES.map(p => {
          const weightValueText = ["not important (excluded from scoring)","minor","moderate","important","very important","critical"][weights[p.id]];
          const dealbreakerValueText = dealbreakers[p.id] === 0 ? "no dealbreaker set" : `must score at least ${dealbreakers[p.id]} out of 100`;
          return (
          <div key={p.id} style={S.sliderRow}>
            <div>
              <div style={S.priName}>{p.label}</div>
              <div style={S.priDesc}>{p.desc}</div>
              <div style={{ marginTop:10, display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                <label htmlFor={`w-${p.id}`} style={{ fontSize:12, color:"#4A5578" }}>
                  Importance: <strong style={{ color:"#003399" }}>{weights[p.id]}</strong>
                </label>
                <input id={`w-${p.id}`} type="range" min={0} max={5}
                  value={weights[p.id]}
                  onChange={e => setWeights({ ...weights, [p.id]: +e.target.value })}
                  style={{ flex:1, maxWidth:220 }}
                  aria-label={`Importance of ${p.label} on a scale from 0 to 5`}
                  aria-valuetext={`${weights[p.id]} of 5 — ${weightValueText}`} />
              </div>
              <div style={{ marginTop:6, display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                <label htmlFor={`d-${p.id}`} style={{ fontSize:12, color:"#4A5578" }}>
                  Dealbreaker below: <strong style={{ color:"#8C1F1F" }}>{dealbreakers[p.id] || "off"}</strong>
                </label>
                <input id={`d-${p.id}`} type="range" min={0} max={90} step={10}
                  value={dealbreakers[p.id]}
                  onChange={e => setDealbreakers({ ...dealbreakers, [p.id]: +e.target.value })}
                  style={{ flex:1, maxWidth:220 }}
                  aria-label={`Minimum acceptable score for ${p.label}. Countries scoring below this will be flagged as dealbreakers.`}
                  aria-valuetext={dealbreakerValueText} />
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <span style={{ ...S.chip, ...S.chipBlue }} aria-hidden="true">weight {weights[p.id]}</span>
            </div>
          </div>
          );
        })}
      </div>

      <div style={S.nav}>
        <button type="button" style={S.btnGhost} onClick={goBack}>← Back</button>
        <button type="button" style={S.btn} onClick={goNext}>See my matches →</button>
      </div>
    </div>
  );

  const renderResultRow = (r) => {
    const isShortlisted = shortlist.includes(r.country.code);
    const canAdd = shortlist.length < 3 || isShortlisted;
    const portal = PORTALS[r.country.code];
    return (
      <article key={r.country.code} style={S.resultRow} aria-label={r.country.name}>
        <header style={S.resultHead}>
          <div>
            <div style={S.resultTitle}>
              <span aria-hidden="true" style={{ fontSize:32 }}>{r.country.flag}</span>
              {r.country.name}
            </div>
            <dl style={S.metaList}>
              <div style={S.metaItem}>
                <dt style={S.metaLabel}>Capital</dt>
                <dd style={S.metaValue}>{r.country.capital}</dd>
              </div>
              <div style={S.metaItem}>
                <dt style={S.metaLabel}>Official language</dt>
                <dd style={S.metaValue}>{r.country.lang}</dd>
              </div>
              <div style={S.metaItem}>
                <dt style={S.metaLabel}>Population</dt>
                <dd style={S.metaValue}>{r.country.pop} million</dd>
              </div>
            </dl>
            <div style={S.metaRow}>
              {r.country.eurozone && (
                <span style={{ ...S.chip, ...S.chipBlue }}
                  title="Uses the euro (€) as official currency"
                  aria-label="Eurozone member: uses the euro as official currency">
                  Eurozone
                </span>
              )}
              {r.country.schengen && (
                <span style={{ ...S.chip, ...S.chipGreen }}
                  title="Part of the Schengen Area — passport-free travel across 29 European countries"
                  aria-label="Schengen Area member: passport-free travel across 29 European countries">
                  Schengen
                </span>
              )}
              <span style={{ ...S.chip, ...S.chipGold }}
                title="Typical residency required before you can apply for naturalisation"
                aria-label={`Typical residency required before applying for citizenship: approximately ${r.country.natYears} years`}>
                Citizenship eligible after ~{r.country.natYears} yrs
              </span>
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div
              style={S.scoreBadge}
              title={`Raw priority average: ${r.rawScore} (boosted by ${r.bonus.toFixed(1)} for strong matches, reduced by ${r.penalty} for weak matches on high-importance factors).`}
              aria-label={`Priority match score: ${r.score} out of 100. Raw average ${r.rawScore}, bonus ${r.bonus.toFixed(1)}, penalty ${r.penalty}.`}
            >
              {r.score}<span style={{ fontSize:18, color:"#4A5578", fontWeight:400 }}>/100</span>
            </div>
            <div style={{ fontSize:11, color:"#4A5578", letterSpacing:"0.1em", textTransform:"uppercase" }}>
              priority match
            </div>
            {(r.bonus >= 2 || r.penalty >= 2) && (
              <div style={{ fontSize:11, color:"#4A5578", marginTop:4, display:"flex", gap:6, justifyContent:"flex-end", flexWrap:"wrap" }}>
                {r.bonus >= 2 && (
                  <span
                    style={{ color:"#1F5D1F", fontWeight:600 }}
                    title="Bonus from strong matches on priorities you rated 4 or 5"
                    aria-label={`Bonus of ${r.bonus.toFixed(1)} points for strong matches on high-importance priorities`}>
                    +{r.bonus.toFixed(1)} strong fit
                  </span>
                )}
                {r.penalty >= 2 && (
                  <span
                    style={{ color:"#8C1F1F", fontWeight:600 }}
                    title="Penalty from weak scores on priorities you rated 4 or 5"
                    aria-label={`Penalty of ${r.penalty} points for weak scores on high-importance priorities`}>
                    −{r.penalty} weak fit
                  </span>
                )}
              </div>
            )}
          </div>
        </header>

        <div>
          <div style={{ fontSize:12, letterSpacing:"0.1em", textTransform:"uppercase", color:"#4A5578", fontWeight:600, marginBottom:8 }}>
            Available pathways ({r.availableVisas.length})
          </div>
          <div style={S.visaList}>
            {r.availableVisas.map(v => (
              <div key={v.id} style={S.visaItem}>
                <span style={{ color:"#FFCC00", fontSize:18 }} aria-hidden="true">{v.icon}</span>
                <span>{v.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop:16, display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(120px, 1fr))", gap:8 }}>
          {PRIORITIES.filter(p => weights[p.id] >= 3).slice(0, 6).map(p => {
            const val = priorityValue(r.country, p.id);
            return (
              <div key={p.id} style={{ fontSize:12 }}>
                <div style={{ color:"#4A5578" }}>{p.label}</div>
                <div style={{ fontWeight:600, fontSize:15, color: val >= 70 ? "#1F5D1F" : val >= 50 ? "#0A1F4D" : "#8C1F1F" }}>
                  {Math.round(val)}
                </div>
              </div>
            );
          })}
        </div>

        <div style={S.actionBar}>
          <button type="button"
            disabled={!canAdd}
            style={{
              ...S.compareBtn,
              ...(isShortlisted ? S.compareBtnActive : {}),
              opacity: !canAdd ? 0.4 : 1,
              cursor: !canAdd ? "not-allowed" : "pointer",
            }}
            onClick={() => toggleShortlist(r.country.code)}
            aria-pressed={isShortlisted}
            aria-label={
              !canAdd
                ? `Cannot add ${r.country.name} to comparison — maximum of 3 countries already shortlisted`
                : isShortlisted
                  ? `Remove ${r.country.name} from comparison`
                  : `Add ${r.country.name} to comparison`
            }
            aria-describedby={!canAdd ? `max-shortlist-notice` : undefined}>
            {isShortlisted ? "✓ In comparison" : "+ Compare"}
          </button>
          {portal && (
            <a href={portal.url} target="_blank" rel="noopener noreferrer"
              style={S.portalLink}
              aria-label={`Open official immigration portal for ${r.country.name} in a new tab`}>
              <span aria-hidden="true">↗</span> {portal.agency}
            </a>
          )}
        </div>
      </article>
    );
  };

  const renderStep3 = () => {
    const eligible = results.filter(r => r.eligible);
    const ineligible = results.filter(r => !r.eligible);
    return (
      <div style={{ animation: animateIn ? "fadeSlideIn .4s ease" : undefined }}>
        <h2 style={S.h2}>Your EU matches</h2>
        <p style={S.lede}>
          {eligible.length} of 27 EU member states fit your profile and pathway
          {selectedVisa ? ` (${VISAS.find(v => v.id === selectedVisa)?.label})` : ""}.
          Ranked by how well each scores against your priorities. Add up to 3 to compare side by side.
        </p>
        <span id="max-shortlist-notice" className="sr-only">
          You have reached the maximum of 3 countries in your comparison shortlist. Remove one to add another.
        </span>

        {eligible.map(renderResultRow)}

        {ineligible.length > 0 && (
          <details style={{ marginTop:32 }}>
            <summary style={{ cursor:"pointer", fontSize:14, color:"#4A5578", fontWeight:600 }}>
              {ineligible.length} countries didn't match — see why
            </summary>
            <div style={{ marginTop:16 }}>
              {ineligible.map(r => (
                <div key={r.country.code} style={{ ...S.resultRow, opacity:0.7 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                    <span aria-hidden="true" style={{ fontSize:22 }}>{r.country.flag}</span>
                    <strong>{r.country.name}</strong>
                    {r.availableVisas.length === 0 && (
                      <span style={{ ...S.chip, ...S.chipRed }}>No matching pathway for your profile</span>
                    )}
                    {r.failedDealbreakers.map(p => (
                      <span key={p.id} style={{ ...S.chip, ...S.chipRed }}>
                        Dealbreaker: {p.label}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}

        <div style={S.nav}>
          <button type="button" style={S.btnGhost} onClick={() => setStep(0)}>← Start over</button>
          <button type="button" style={S.btn} onClick={goBack}>Refine priorities</button>
        </div>
      </div>
    );
  };

  /* ---------- Comparison View ---------- */
  const renderCompare = () => {
    const cols = shortlistedResults.length;
    const gridCols = `minmax(160px, 180px) repeat(${cols}, minmax(220px, 1fr))`;
    return (
      <div style={{ animation: animateIn ? "fadeSlideIn .4s ease" : undefined }}>
        <h2 style={S.h2}>Side-by-side comparison</h2>
        <p style={S.lede}>
          Comparing {cols} {cols === 1 ? "country" : "countries"} across pathways, priorities and naturalisation timelines.
        </p>

        <div style={{ overflowX:"auto", marginBottom:24, border:"1px solid #E8DFC9", borderRadius:4, background:"#fff" }}
          role="region" aria-label="Country comparison table, scroll horizontally if needed"
          tabIndex={0}>
          {/* Header row */}
          <div style={{ display:"grid", gridTemplateColumns: gridCols, borderBottom:"2px solid #003399", background:"#F3EBDA" }}>
            <div style={S.compareLabelCell}>Country</div>
            {shortlistedResults.map(r => (
              <div key={r.country.code} style={S.compareCell}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:32 }} aria-hidden="true">{r.country.flag}</span>
                  <div>
                    <div style={{ fontFamily:'"Fraunces", Georgia, serif', fontSize:22, fontWeight:600, color:"#0A1F4D" }}>{r.country.name}</div>
                    <div style={{ fontSize:12, color:"#4A5578" }}>{r.country.capital}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Priority match */}
          <div style={{ display:"grid", gridTemplateColumns: gridCols, borderBottom:"1px solid #EADFC2" }}>
            <div style={S.compareLabelCell}>Priority match</div>
            {shortlistedResults.map(r => (
              <div key={r.country.code} style={S.compareCell}>
                <div style={{ fontFamily:'"Fraunces", Georgia, serif', fontSize:28, fontWeight:500, color:"#003399" }}>
                  {r.score}<span style={{ fontSize:16, color:"#4A5578", fontWeight:400 }}>/100</span>
                </div>
                <div style={S.compareScoreBar}>
                  <div style={{ ...S.compareScoreFill, width:`${r.score}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Language */}
          <div style={{ display:"grid", gridTemplateColumns: gridCols, borderBottom:"1px solid #EADFC2" }}>
            <div style={S.compareLabelCell}>Language</div>
            {shortlistedResults.map(r => (
              <div key={r.country.code} style={S.compareCell}>{r.country.lang}</div>
            ))}
          </div>

          {/* Population */}
          <div style={{ display:"grid", gridTemplateColumns: gridCols, borderBottom:"1px solid #EADFC2" }}>
            <div style={S.compareLabelCell}>Population</div>
            {shortlistedResults.map(r => (
              <div key={r.country.code} style={S.compareCell}>{r.country.pop}M</div>
            ))}
          </div>

          {/* EU integration */}
          <div style={{ display:"grid", gridTemplateColumns: gridCols, borderBottom:"1px solid #EADFC2" }}>
            <div style={S.compareLabelCell}>EU integration</div>
            {shortlistedResults.map(r => (
              <div key={r.country.code} style={S.compareCell}>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  <span style={{ ...S.chip, ...(r.country.eurozone ? S.chipBlue : S.chipRed) }}>
                    {r.country.eurozone ? "Eurozone" : "Non-euro"}
                  </span>
                  <span style={{ ...S.chip, ...(r.country.schengen ? S.chipGreen : S.chipRed) }}>
                    {r.country.schengen ? "Schengen" : "Non-Schengen"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Naturalisation */}
          <div style={{ display:"grid", gridTemplateColumns: gridCols, borderBottom:"1px solid #EADFC2" }}>
            <div style={S.compareLabelCell}>Naturalisation</div>
            {shortlistedResults.map(r => (
              <div key={r.country.code} style={S.compareCell}>
                <strong>~{r.country.natYears} years</strong> of residency
              </div>
            ))}
          </div>

          {/* Pathways */}
          <div style={{ display:"grid", gridTemplateColumns: gridCols, borderBottom:"1px solid #EADFC2" }}>
            <div style={S.compareLabelCell}>Available pathways</div>
            {shortlistedResults.map(r => (
              <div key={r.country.code} style={S.compareCell}>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {r.availableVisas.length === 0 ? (
                    <span style={{ color:"#8C1F1F", fontSize:13 }}>No matching pathway for your profile</span>
                  ) : r.availableVisas.map(v => (
                    <div key={v.id} style={{ display:"flex", alignItems:"center", gap:8, fontSize:13 }}>
                      <span style={{ color:"#FFCC00", fontSize:16 }} aria-hidden="true">{v.icon}</span>
                      <span>{v.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Per-priority scores */}
          {PRIORITIES.map(p => (
            <div key={p.id} style={{ display:"grid", gridTemplateColumns: gridCols, borderBottom:"1px solid #EADFC2" }}>
              <div style={S.compareLabelCell}>
                {p.label}
                {weights[p.id] >= 4 && <span style={{ ...S.chip, ...S.chipGold, marginLeft:6, fontSize:9 }}>priority</span>}
              </div>
              {shortlistedResults.map(r => {
                const val = Math.round(priorityValue(r.country, p.id));
                return (
                  <div key={r.country.code} style={S.compareCell}>
                    <strong style={{ fontSize:16, color: val >= 70 ? "#1F5D1F" : val >= 50 ? "#0A1F4D" : "#8C1F1F" }}>{val}</strong>
                    <div style={S.compareScoreBar}>
                      <div style={{ ...S.compareScoreFill, width:`${val}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Official portal */}
          <div style={{ display:"grid", gridTemplateColumns: gridCols }}>
            <div style={S.compareLabelCell}>Official portal</div>
            {shortlistedResults.map(r => {
              const portal = PORTALS[r.country.code];
              return (
                <div key={r.country.code} style={S.compareCell}>
                  {portal ? (
                    <a href={portal.url} target="_blank" rel="noopener noreferrer"
                      style={{ color:"#003399", fontSize:13, fontWeight:600, textDecoration:"underline" }}>
                      {portal.agency} ↗
                    </a>
                  ) : <span style={{ color:"#4A5578" }}>—</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div style={S.nav}>
          <button type="button" style={S.btnGhost} onClick={() => setComparing(false)}>← Back to matches</button>
          <button type="button" style={S.btnGhost} onClick={clearShortlist}>Clear comparison</button>
        </div>
      </div>
    );
  };

  /* ---------- Why EU? View ---------- */
  const renderWhyEU = () => {
    const state = US_STATES.find(s => s.name === userState) || US_STATES[0];

    // Check if wizard has yielded matches
    const eligibleMatches = results.filter(r => r.eligible);
    const hasMatches = eligibleMatches.length > 0;
    const matchCodes = new Set(eligibleMatches.slice(0, 10).map(r => r.country.code));

    // Build EU dataset, sort by homicide ascending, skip nulls for chart comparisons
    const allEuRows = COUNTRIES
      .map(c => ({ country: c, ...(EU_CRIME[c.code] || {}) }))
      .filter(x => x.homicide != null)
      .sort((a, b) => a.homicide - b.homicide);

    // Filter chart by wizard matches if user has opted in
    const effectiveScope = hasMatches && chartScope === "matches" ? "matches" : "all";
    const chartRows = effectiveScope === "matches"
      ? allEuRows.filter(x => matchCodes.has(x.country.code))
      : allEuRows;

    // Stats based on full EU dataset (not filtered)
    const euRows = allEuRows;
    const euAvg = euRows.reduce((s, x) => s + x.homicide, 0) / euRows.length;
    const safestEU = euRows[0];
    const leastSafeEU = euRows[euRows.length - 1];
    const maxRate = Math.max(state.homicide, ...chartRows.map(x => x.homicide));
    const vsSafest = (state.homicide / safestEU.homicide).toFixed(1);
    const vsAvg = (state.homicide / euAvg).toFixed(1);

    // How many EU countries are safer than the user's state?
    const safeCount = euRows.filter(x => x.homicide < state.homicide).length;

    // User's state rank among US states (1 = safest)
    const usStatesSorted = [...US_STATES].sort((a, b) => a.homicide - b.homicide);
    const usRank = usStatesSorted.findIndex(s => s.name === userState) + 1;

    // Head-to-head rows: every EU country vs user state, sorted safest first
    const headToHead = euRows.map(x => {
      const ratio = state.homicide / x.homicide; // >1 means country is safer; <1 means country is less safe
      return {
        ...x,
        ratio,
        saferThanState: x.homicide < state.homicide,
        equalToState: Math.abs(x.homicide - state.homicide) < 0.05,
      };
    });

    // Quality of Life: US vs EU comparison rows, sorted best-to-worst by overall rank.
    // Note: QoL is national — same for every US state.
    const usQoL = QOL.US;
    const qolRows = COUNTRIES
      .map(c => ({ country: c, ...(QOL[c.code] || {}) }))
      .filter(x => x.overallRank != null)
      .sort((a, b) => a.overallRank - b.overallRank);
    const euQolBetter = qolRows.filter(x => x.overallRank < usQoL.overallRank).length;
    const euQolWorse  = qolRows.filter(x => x.overallRank > usQoL.overallRank).length;

    // Road deaths: US vs EU. US is national (12.4). EU varies per country.
    const roadRows = COUNTRIES
      .map(c => ({ country: c, rate: ROAD_DEATHS[c.code] }))
      .filter(x => x.rate != null)
      .sort((a, b) => a.rate - b.rate);
    const safestRoad = roadRows[0];
    const leastSafeRoad = roadRows[roadRows.length - 1];
    const roadEuAvg = roadRows.reduce((s, x) => s + x.rate, 0) / roadRows.length;
    const roadVsSafest = (US_ROAD_DEATHS / safestRoad.rate).toFixed(1);
    const roadVsAvg = (US_ROAD_DEATHS / roadEuAvg).toFixed(1);
    const euSaferRoads = roadRows.filter(x => x.rate < US_ROAD_DEATHS).length;
    const maxRoad = Math.max(US_ROAD_DEATHS, ...roadRows.map(x => x.rate));

    const Bar = ({ label, rate, highlight, flag, max = maxRate, unitLabel = "homicides per 100,000 residents" }) => {
      const pct = (rate / max) * 100;
      return (
        <div style={{ display:"grid", gridTemplateColumns:"minmax(120px, 160px) 1fr 56px", alignItems:"center", gap:12, padding:"4px 0" }}>
          <div style={{ fontSize:13, textAlign:"right", color: highlight ? "#0A1F4D" : "#4A5578", fontWeight: highlight ? 700 : 500 }}>
            {flag && <span aria-hidden="true" style={{ marginRight:6 }}>{flag}</span>}
            {label}
          </div>
          <div style={{ background:"#F3EBDA", height:22, borderRadius:2, position:"relative", overflow:"hidden" }}>
            <div
              role="progressbar"
              aria-valuenow={rate}
              aria-valuemin={0}
              aria-valuemax={max}
              aria-label={`${label}: ${rate} ${unitLabel}`}
              style={{
                width:`${pct}%`, height:"100%",
                background: highlight ? "#FFCC00" : "#003399",
                transition:"width .4s ease",
              }}
            />
          </div>
          <div style={{ fontSize:13, fontWeight: highlight ? 700 : 500, color: highlight ? "#7A5C00" : "#0A1F4D" }}>
            {rate.toFixed(1)}
          </div>
        </div>
      );
    };

    return (
      <div style={{ animation: animateIn ? "fadeSlideIn .4s ease" : undefined }}>
        <h2 style={S.h2}>Why move to the EU?</h2>
        <p style={S.lede}>
          Some of the clearest differences between life in the United States and life in the European Union
          show up in daily safety, traffic deaths, and broader quality of life. Choose your US state to see
          how it compares to the 27 EU member states across all three dimensions.
        </p>

        <div style={{ ...S.formRow, maxWidth:420, marginBottom:32 }}>
          <div style={S.field}>
            <label htmlFor="us-state" style={S.label}>Your US state</label>
            <select id="us-state" style={S.select} value={userState}
              onChange={e => setUserState(e.target.value)}>
              {US_STATES.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
            </select>
          </div>
        </div>

        {/* ================= PERSONAL SAFETY (HOMICIDE) ================= */}
        <h3 style={{ fontFamily:'"Fraunces", Georgia, serif', fontSize:28, fontWeight:500, marginBottom:4, color:"#0A1F4D" }}>
          Personal safety: homicide risk
        </h3>
        <p style={{ fontSize:14, color:"#4A5578", marginBottom:24, maxWidth:720, lineHeight:1.55 }}>
          The most directly comparable crime metric across US and EU jurisdictions is the intentional homicide
          rate. Here's how {userState} stacks up.
        </p>

        {/* Hero numbers */}
        <div style={{
          display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:16, marginBottom:32,
        }}>
          <div style={{ ...S.resultRow, marginBottom:0, borderLeft:"4px solid #8C1F1F" }}>
            <div style={{ ...S.label, marginBottom:8 }}>{userState} homicide rate</div>
            <div style={{ fontFamily:'"Fraunces", Georgia, serif', fontSize:44, fontWeight:500, color:"#8C1F1F", lineHeight:1 }}>
              {state.homicide.toFixed(1)}
            </div>
            <div style={{ fontSize:13, color:"#4A5578", marginTop:6 }}>per 100,000 residents</div>
          </div>
          <div style={{ ...S.resultRow, marginBottom:0, borderLeft:"4px solid #003399" }}>
            <div style={{ ...S.label, marginBottom:8 }}>EU average</div>
            <div style={{ fontFamily:'"Fraunces", Georgia, serif', fontSize:44, fontWeight:500, color:"#003399", lineHeight:1 }}>
              {euAvg.toFixed(1)}
            </div>
            <div style={{ fontSize:13, color:"#4A5578", marginTop:6 }}>per 100,000 residents</div>
          </div>
          <div style={{ ...S.resultRow, marginBottom:0, borderLeft:"4px solid #FFCC00", background:"#FFFBEB" }}>
            <div style={{ ...S.label, marginBottom:8 }}>The gap</div>
            <div style={{ fontFamily:'"Fraunces", Georgia, serif', fontSize:44, fontWeight:500, color:"#7A5C00", lineHeight:1 }}>
              {vsAvg}×
            </div>
            <div style={{ fontSize:13, color:"#4A5578", marginTop:6 }}>
              {userState} vs EU average. {vsSafest}× vs {safestEU.country.name} (safest EU state).
            </div>
          </div>
        </div>

        {/* Headline framing */}
        <div style={{ background:"#fff", border:"1px solid #E8DFC9", borderLeft:"4px solid #003399", borderRadius:4, padding:"20px 24px", marginBottom:32 }}>
          <p style={{ fontSize:16, lineHeight:1.6, color:"#0A1F4D", margin:0 }}>
            In <strong>{userState}</strong>, the homicide rate is{" "}
            <strong style={{ color:"#8C1F1F" }}>{state.homicide.toFixed(1)} per 100,000</strong>.{" "}
            In <strong><span aria-hidden="true">{safestEU.country.flag}</span> {safestEU.country.name}</strong>, it's{" "}
            <strong style={{ color:"#1F5D1F" }}>{safestEU.homicide.toFixed(1)} per 100,000</strong>.{" "}
            That means a resident of {userState} is statistically{" "}
            <strong style={{ color:"#7A5C00" }}>{vsSafest}× more likely</strong>{" "}
            to be murdered than a resident of {safestEU.country.name}.
          </p>
        </div>

        {/* Where your state lands — homicide-based state-vs-EU stats */}
        <h4 style={{ fontFamily:'"Fraunces", Georgia, serif', fontSize:22, fontWeight:600, margin:"0 0 12px", color:"#0A1F4D" }}>
          Where {userState} lands on the EU map
        </h4>
        <div style={{
          display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:16, marginBottom:32,
        }}>
          <div style={{ ...S.resultRow, marginBottom:0, borderLeft:"4px solid #1F5D1F" }}>
            <div style={{ ...S.label, marginBottom:8 }}>EU countries safer than {userState}</div>
            <div style={{ fontFamily:'"Fraunces", Georgia, serif', fontSize:44, fontWeight:500, color:"#1F5D1F", lineHeight:1 }}>
              {safeCount}<span style={{ fontSize:24, color:"#4A5578" }}>/{euRows.length}</span>
            </div>
            <div style={{ fontSize:13, color:"#4A5578", marginTop:6 }}>
              with a lower homicide rate (per 100,000)
            </div>
          </div>
          <div style={{ ...S.resultRow, marginBottom:0, borderLeft:"4px solid #003399" }}>
            <div style={{ ...S.label, marginBottom:8 }}>US safety rank</div>
            <div style={{ fontFamily:'"Fraunces", Georgia, serif', fontSize:44, fontWeight:500, color:"#003399", lineHeight:1 }}>
              #{usRank}<span style={{ fontSize:24, color:"#4A5578" }}>/50</span>
            </div>
            <div style={{ fontSize:13, color:"#4A5578", marginTop:6 }}>
              safest US state, by homicide rate (1 = safest)
            </div>
          </div>
          <div style={{ ...S.resultRow, marginBottom:0, borderLeft:"4px solid #FFCC00", background:"#FFFBEB" }}>
            <div style={{ ...S.label, marginBottom:8 }}>EU range</div>
            <div style={{ fontFamily:'"Fraunces", Georgia, serif', fontSize:32, fontWeight:500, color:"#7A5C00", lineHeight:1.1 }}>
              {safestEU.homicide.toFixed(1)} – {leastSafeEU.homicide.toFixed(1)}
            </div>
            <div style={{ fontSize:13, color:"#4A5578", marginTop:6 }}>
              <span aria-hidden="true">{safestEU.country.flag}</span> {safestEU.country.name} to{" "}
              <span aria-hidden="true">{leastSafeEU.country.flag}</span> {leastSafeEU.country.name}.{" "}
              {userState}: <strong>{state.homicide.toFixed(1)}</strong>
            </div>
          </div>
        </div>

        {/* Bar chart */}
        <section aria-labelledby="chart-h" style={{ marginBottom:32 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", gap:16, flexWrap:"wrap", marginBottom:4 }}>
            <div>
              <h4 id="chart-h" style={{ fontFamily:'"Fraunces", Georgia, serif', fontSize:22, fontWeight:600, marginBottom:4, color:"#0A1F4D" }}>
                Homicide rate: {userState} vs {effectiveScope === "matches" ? "your EU matches" : "the EU 27"}
              </h4>
              <p style={{ fontSize:13, color:"#4A5578", margin:0 }}>
                Intentional homicides per 100,000 residents. Sorted safest to least safe. Source: Eurostat / FBI UCR; Estonia excluded (N/A).
              </p>
            </div>
            {hasMatches && (
              <div role="group" aria-label="Filter chart scope" style={{
                display:"inline-flex", border:"1px solid #CEC2A0", borderRadius:4, overflow:"hidden", background:"#fff",
              }}>
                <button
                  type="button"
                  aria-pressed={chartScope === "all"}
                  onClick={() => setChartScope("all")}
                  style={{
                    padding:"8px 14px", fontSize:13, fontWeight:600, fontFamily:"inherit",
                    border:"none", cursor:"pointer",
                    background: chartScope === "all" ? "#003399" : "transparent",
                    color: chartScope === "all" ? "#fff" : "#003399",
                  }}>
                  All EU ({allEuRows.length})
                </button>
                <button
                  type="button"
                  aria-pressed={chartScope === "matches"}
                  onClick={() => setChartScope("matches")}
                  style={{
                    padding:"8px 14px", fontSize:13, fontWeight:600, fontFamily:"inherit",
                    border:"none", borderLeft:"1px solid #CEC2A0", cursor:"pointer",
                    background: chartScope === "matches" ? "#003399" : "transparent",
                    color: chartScope === "matches" ? "#fff" : "#003399",
                  }}>
                  My matches ({Math.min(eligibleMatches.length, 10)})
                </button>
              </div>
            )}
          </div>
          <div style={{ background:"#fff", border:"1px solid #E8DFC9", borderRadius:4, padding:"20px 24px", marginTop:16 }}>
            <Bar
              label={userState}
              rate={state.homicide}
              highlight={true}
              flag="🇺🇸"
            />
            <div style={{ borderBottom:"1px dashed #CEC2A0", margin:"10px 0" }} />
            {chartRows.length === 0 ? (
              <p style={{ fontSize:13, color:"#4A5578", fontStyle:"italic", padding:"12px 0" }}>
                None of your current wizard matches have comparable homicide data. Try broadening your wizard criteria, or switch to "All EU" above.
              </p>
            ) : chartRows.map(x => (
              <Bar
                key={x.country.code}
                label={x.country.name}
                rate={x.homicide}
                flag={x.country.flag}
              />
            ))}
          </div>
          {!hasMatches && (
            <p style={{ fontSize:13, color:"#4A5578", marginTop:12, fontStyle:"italic" }}>
              Tip: complete the Pathway Finder to filter this chart to countries that actually match your profile.
            </p>
          )}
        </section>

        {/* Head-to-head comparison: every EU country vs user's state */}
        <section aria-labelledby="h2h-h" style={{ marginBottom:32 }}>
          <h4 id="h2h-h" style={{ fontFamily:'"Fraunces", Georgia, serif', fontSize:22, fontWeight:600, marginBottom:4, color:"#0A1F4D" }}>
            Head-to-head: every EU country vs {userState}
          </h4>
          <p style={{ fontSize:13, color:"#4A5578", marginBottom:16 }}>
            How much safer — or less safe — would you be on homicide risk alone? Direct comparison using per-100,000 rates.
            {effectiveScope === "matches" && " Showing only your wizard matches."}
          </p>
          <div style={{ overflowX:"auto", background:"#fff", border:"1px solid #E8DFC9", borderRadius:4 }}
            role="region" aria-label="Head-to-head homicide comparison table, scroll horizontally if needed"
            tabIndex={0}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
              <caption className="sr-only">Head-to-head homicide comparison: {userState} vs each EU country</caption>
              <thead>
                <tr style={{ background:"#F3EBDA", borderBottom:"2px solid #003399" }}>
                  <th scope="col" style={{ textAlign:"left", padding:"12px 14px", fontSize:12, letterSpacing:"0.08em", textTransform:"uppercase", color:"#4A5578" }}>Country</th>
                  <th scope="col" style={{ textAlign:"right", padding:"12px 14px", fontSize:12, letterSpacing:"0.08em", textTransform:"uppercase", color:"#4A5578" }}>Homicide rate</th>
                  <th scope="col" style={{ textAlign:"left", padding:"12px 14px", fontSize:12, letterSpacing:"0.08em", textTransform:"uppercase", color:"#4A5578" }}>vs {userState} ({state.homicide.toFixed(1)})</th>
                </tr>
              </thead>
              <tbody>
                {/* Anchor row: user's state */}
                <tr style={{ borderBottom:"2px solid #FFCC00", background:"#FFFBEB" }}>
                  <th scope="row" style={{ textAlign:"left", padding:"12px 14px", fontWeight:700 }}>
                    <span aria-hidden="true" style={{ marginRight:6 }}>🇺🇸</span>{userState} <span style={{ fontWeight:500, color:"#4A5578", fontSize:12 }}>(your state)</span>
                  </th>
                  <td style={{ textAlign:"right", padding:"12px 14px", fontWeight:700, fontFamily:'"Fraunces", Georgia, serif', fontSize:16 }}>
                    {state.homicide.toFixed(1)}
                  </td>
                  <td style={{ padding:"12px 14px", fontSize:13, color:"#7A5C00" }}>
                    baseline
                  </td>
                </tr>
                {(effectiveScope === "matches"
                  ? headToHead.filter(x => matchCodes.has(x.country.code))
                  : headToHead
                ).map(x => {
                  const saferColor = "#1F5D1F";
                  const lessSafeColor = "#8C1F1F";
                  const equalColor = "#4A5578";
                  let ratioDisplay, ratioColor, ratioBg, arrow;
                  if (x.equalToState) {
                    ratioDisplay = "Roughly equal";
                    ratioColor = equalColor;
                    ratioBg = "#F3EBDA";
                    arrow = "=";
                  } else if (x.saferThanState) {
                    ratioDisplay = `${x.ratio.toFixed(1)}× safer`;
                    ratioColor = saferColor;
                    ratioBg = "#E6F4E4";
                    arrow = "↓";
                  } else {
                    const inverse = (1 / x.ratio).toFixed(1);
                    ratioDisplay = `${inverse}× more dangerous`;
                    ratioColor = lessSafeColor;
                    ratioBg = "#FDE4E4";
                    arrow = "↑";
                  }
                  return (
                    <tr key={x.country.code} style={{ borderBottom:"1px solid #EADFC2" }}>
                      <th scope="row" style={{ textAlign:"left", padding:"12px 14px", fontWeight:500 }}>
                        <span aria-hidden="true" style={{ marginRight:6 }}>{x.country.flag}</span>{x.country.name}
                      </th>
                      <td style={{ textAlign:"right", padding:"12px 14px", fontFamily:'"Fraunces", Georgia, serif', fontSize:16, fontWeight:500 }}>
                        {x.homicide.toFixed(1)}
                      </td>
                      <td style={{ padding:"12px 14px" }}>
                        <span style={{
                          display:"inline-flex", alignItems:"center", gap:6,
                          padding:"3px 10px", borderRadius:999, fontSize:13, fontWeight:600,
                          background:ratioBg, color:ratioColor, border:`1px solid ${ratioColor}33`,
                        }}>
                          <span aria-hidden="true">{arrow}</span>
                          {ratioDisplay}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize:12, color:"#4A5578", marginTop:12, fontStyle:"italic" }}>
            Note: This compares homicide rates only — the one crime metric where US and EU data are directly
            comparable. Theft, burglary, and assault definitions differ enough across jurisdictions that
            cross-border absolute comparisons aren't reliable.
          </p>
        </section>

        {/* ================= ROAD TRAFFIC DEATHS ================= */}
        <section aria-labelledby="road-h" style={{ marginBottom:48, paddingTop:32, borderTop:"2px solid #EADFC2" }}>
          <h3 id="road-h" style={{ fontFamily:'"Fraunces", Georgia, serif', fontSize:28, fontWeight:500, marginBottom:4, color:"#0A1F4D" }}>
            Road fatalities: another lens on everyday safety
          </h3>
          <p style={{ fontSize:14, color:"#4A5578", marginBottom:24, maxWidth:720, lineHeight:1.55 }}>
            Violent crime gets the headlines, but driving is statistically the most dangerous thing most
            Americans do each day. The US averages <strong>{US_ROAD_DEATHS} road deaths per 100,000 people</strong> —
            every EU country does better, most of them dramatically so.
          </p>

          {/* Road hero stats */}
          <div style={{
            display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:16, marginBottom:32,
          }}>
            <div style={{ ...S.resultRow, marginBottom:0, borderLeft:"4px solid #8C1F1F" }}>
              <div style={{ ...S.label, marginBottom:8 }}>US road death rate</div>
              <div style={{ fontFamily:'"Fraunces", Georgia, serif', fontSize:44, fontWeight:500, color:"#8C1F1F", lineHeight:1 }}>
                {US_ROAD_DEATHS}
              </div>
              <div style={{ fontSize:13, color:"#4A5578", marginTop:6 }}>per 100,000 residents, per year</div>
            </div>
            <div style={{ ...S.resultRow, marginBottom:0, borderLeft:"4px solid #003399" }}>
              <div style={{ ...S.label, marginBottom:8 }}>EU average</div>
              <div style={{ fontFamily:'"Fraunces", Georgia, serif', fontSize:44, fontWeight:500, color:"#003399", lineHeight:1 }}>
                {roadEuAvg.toFixed(1)}
              </div>
              <div style={{ fontSize:13, color:"#4A5578", marginTop:6 }}>
                across the 27 EU member states
              </div>
            </div>
            <div style={{ ...S.resultRow, marginBottom:0, borderLeft:"4px solid #FFCC00", background:"#FFFBEB" }}>
              <div style={{ ...S.label, marginBottom:8 }}>The gap</div>
              <div style={{ fontFamily:'"Fraunces", Georgia, serif', fontSize:44, fontWeight:500, color:"#7A5C00", lineHeight:1 }}>
                {roadVsAvg}×
              </div>
              <div style={{ fontSize:13, color:"#4A5578", marginTop:6 }}>
                US vs EU average. {roadVsSafest}× vs{" "}
                <span aria-hidden="true">{safestRoad.country.flag}</span> {safestRoad.country.name}/
                <span aria-hidden="true">{roadRows[1]?.country.flag}</span> {roadRows[1]?.country.name} (safest).
              </div>
            </div>
          </div>

          {/* Road deaths bar chart */}
          <div style={{ background:"#fff", border:"1px solid #E8DFC9", borderRadius:4, padding:"20px 24px" }}>
            <Bar
              label="United States"
              rate={US_ROAD_DEATHS}
              highlight={true}
              flag="🇺🇸"
              max={maxRoad}
              unitLabel="road deaths per 100,000 residents"
            />
            <div style={{ borderBottom:"1px dashed #CEC2A0", margin:"10px 0" }} />
            {roadRows.map(x => (
              <Bar
                key={x.country.code}
                label={x.country.name}
                rate={x.rate}
                flag={x.country.flag}
                max={maxRoad}
                unitLabel="road deaths per 100,000 residents"
              />
            ))}
          </div>
          <p style={{ fontSize:12, color:"#4A5578", marginTop:12, fontStyle:"italic" }}>
            All <strong>{euSaferRoads} of 27</strong> EU member states have lower road death rates than the US.
            Source: WHO Global Status Report on Road Safety and national road safety agencies.
          </p>
        </section>

        {/* ================= QUALITY OF LIFE ================= */}
        <section aria-labelledby="qol-h" style={{ marginBottom:48, paddingTop:32, borderTop:"2px solid #EADFC2" }}>
          <h3 id="qol-h" style={{ fontFamily:'"Fraunces", Georgia, serif', fontSize:28, fontWeight:500, marginBottom:4, color:"#0A1F4D" }}>
            Quality of life: where the US actually ranks
          </h3>
          <p style={{ fontSize:14, color:"#4A5578", marginBottom:24, maxWidth:720, lineHeight:1.55 }}>
            Across six independent global quality-of-life indices — HDI, the OECD Better Life Index, Numbeo,
            Social Progress, Good Country, and the Happy Planet Index — the United States ranks{" "}
            <strong>#{usQoL.overallRank} out of 28</strong>{" "}
            (the 27 EU member states plus the US), with an average rank of{" "}
            <strong>{usQoL.avgRank.toFixed(1)}</strong>.
          </p>

          {/* QoL hero stats */}
          <div style={{
            display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:16, marginBottom:32,
          }}>
            <div style={{ ...S.resultRow, marginBottom:0, borderLeft:"4px solid #003399" }}>
              <div style={{ ...S.label, marginBottom:8 }}>US overall QoL rank</div>
              <div style={{ fontFamily:'"Fraunces", Georgia, serif', fontSize:44, fontWeight:500, color:"#003399", lineHeight:1 }}>
                #{usQoL.overallRank}<span style={{ fontSize:24, color:"#4A5578" }}>/28</span>
              </div>
              <div style={{ fontSize:13, color:"#4A5578", marginTop:6 }}>across the US and the EU 27</div>
            </div>
            <div style={{ ...S.resultRow, marginBottom:0, borderLeft:"4px solid #1F5D1F" }}>
              <div style={{ ...S.label, marginBottom:8 }}>EU countries ranked higher</div>
              <div style={{ fontFamily:'"Fraunces", Georgia, serif', fontSize:44, fontWeight:500, color:"#1F5D1F", lineHeight:1 }}>
                {euQolBetter}<span style={{ fontSize:24, color:"#4A5578" }}>/27</span>
              </div>
              <div style={{ fontSize:13, color:"#4A5578", marginTop:6 }}>
                score better than the US on the combined index
              </div>
            </div>
            <div style={{ ...S.resultRow, marginBottom:0, borderLeft:"4px solid #FFCC00", background:"#FFFBEB" }}>
              <div style={{ ...S.label, marginBottom:8 }}>EU countries ranked lower</div>
              <div style={{ fontFamily:'"Fraunces", Georgia, serif', fontSize:44, fontWeight:500, color:"#7A5C00", lineHeight:1 }}>
                {euQolWorse}<span style={{ fontSize:24, color:"#4A5578" }}>/27</span>
              </div>
              <div style={{ fontSize:13, color:"#4A5578", marginTop:6 }}>
                score worse than the US on the combined index
              </div>
            </div>
          </div>

          {/* QoL comparison table */}
          <div style={{ overflowX:"auto", background:"#fff", border:"1px solid #E8DFC9", borderRadius:4 }}
            role="region" aria-label="Quality of life rankings table, scroll horizontally if needed"
            tabIndex={0}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <caption className="sr-only">Quality of life index rankings: US vs each EU country, lower is better</caption>
              <thead>
                <tr style={{ background:"#F3EBDA", borderBottom:"2px solid #003399" }}>
                  <th scope="col" style={{ textAlign:"left", padding:"10px 12px", fontSize:11, letterSpacing:"0.08em", textTransform:"uppercase", color:"#4A5578" }}><span aria-hidden="true">#</span><span className="sr-only">Overall rank</span></th>
                  <th scope="col" style={{ textAlign:"left", padding:"10px 12px", fontSize:11, letterSpacing:"0.08em", textTransform:"uppercase", color:"#4A5578" }}>Country</th>
                  <th scope="col" style={{ textAlign:"right", padding:"10px 12px", fontSize:11, letterSpacing:"0.08em", textTransform:"uppercase", color:"#4A5578" }} title="Average rank across all six indices (lower is better)">
                    Avg rank
                  </th>
                  {QOL_INDICES.map(idx => (
                    <th key={idx.key} scope="col" style={{ textAlign:"right", padding:"10px 12px", fontSize:11, letterSpacing:"0.08em", textTransform:"uppercase", color:"#4A5578" }} title={idx.desc}>
                      {idx.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...qolRows, { country:{ code:"US", name:"United States", flag:"🇺🇸" }, ...usQoL, isUS:true }]
                  .sort((a, b) => a.overallRank - b.overallRank)
                  .map(row => {
                    const isUS = row.country.code === "US";
                    return (
                      <tr key={row.country.code} style={{
                        borderBottom:"1px solid #EADFC2",
                        background: isUS ? "#FFFBEB" : "transparent",
                        borderTop: isUS ? "2px solid #FFCC00" : undefined,
                        borderBottomColor: isUS ? "#FFCC00" : "#EADFC2",
                        borderBottomWidth: isUS ? 2 : 1,
                      }}>
                        <td style={{ padding:"10px 12px", fontWeight: isUS ? 700 : 500, color: isUS ? "#7A5C00" : "#0A1F4D" }}>
                          #{row.overallRank}
                        </td>
                        <th scope="row" style={{ textAlign:"left", padding:"10px 12px", fontWeight: isUS ? 700 : 500 }}>
                          <span aria-hidden="true" style={{ marginRight:6 }}>{row.country.flag}</span>{row.country.name}
                        </th>
                        <td style={{ textAlign:"right", padding:"10px 12px", fontWeight: isUS ? 700 : 600, fontFamily:'"Fraunces", Georgia, serif', fontSize:15 }}>
                          {row.avgRank.toFixed(2)}
                        </td>
                        {QOL_INDICES.map(idx => (
                          <td key={idx.key} style={{ textAlign:"right", padding:"10px 12px", color:"#4A5578" }}>
                            {row[idx.key] == null ? "—" : row[idx.key]}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                }
              </tbody>
            </table>
          </div>
          <p style={{ fontSize:12, color:"#4A5578", marginTop:12, fontStyle:"italic" }}>
            Rankings are <strong>lower is better</strong> — #1 is the best performer in each index. Individual
            index columns show the country's rank within that specific index's global dataset (so HDI rank 21
            means the US is 21st in the world on the UN Human Development Index). The overall rank in this
            table is among the 28 places shown here (US + EU 27), not worldwide.
          </p>
        </section>

        {/* Methodology */}
        <details style={{ marginBottom:32, fontSize:13, color:"#4A5578" }}>
          <summary style={{ cursor:"pointer", fontWeight:600 }}>About this data &amp; how it affects rankings</summary>
          <div style={{ marginTop:12, lineHeight:1.6 }}>
            <p style={{ marginBottom:8 }}>
              <strong>Homicide.</strong> Intentional homicide is the one crime metric where US and EU data are
              directly comparable — the definition is essentially the same everywhere and reporting is
              consistently near-complete. Theft, burglary, and assault each mean different things in different
              jurisdictions, and reporting rates vary substantially, so absolute cross-border comparisons of
              those categories would be misleading. Per-100,000 homicide rates come from Eurostat crime
              statistics and the FBI Uniform Crime Reporting program.
            </p>
            <p style={{ marginBottom:8 }}>
              <strong>Road fatalities.</strong> Deaths per 100,000 population per year, sourced from the WHO
              Global Status Report on Road Safety and national road safety agencies. Unlike most crime
              categories, road deaths are near-universally counted the same way (fatal traffic collisions
              within a defined reporting period), making cross-border comparison straightforward. US figures
              reflect the 50-state average — individual states vary from roughly 6 (Massachusetts, New York)
              to 25+ (Mississippi, South Carolina) but every state is still above nearly every EU country.
            </p>
            <p style={{ marginBottom:8 }}>
              <strong>Quality of life.</strong> The overall rank shown is an average of six independent global
              indices: the UN Human Development Index, the OECD Better Life Index, the Numbeo Quality of Life
              Index, the Social Progress Imperative's Social Progress Index, the Good Country Index, and the
              Happy Planet Index. Each index weights different factors (income, education, environment,
              social cohesion, life expectancy, and so on), so an average across all six is a more robust
              signal than any single source. The average is over the 28 places compared here (US + EU 27).
            </p>
            <p>
              <strong>Effect on pathway finder scores.</strong> The finder's <strong>Safety</strong> score
              now blends three components: homicide rate (45%), road fatality rate (25%), and a broader
              institutional baseline covering political stability, trust in institutions, and social cohesion
              (30%). A new <strong>Overall quality of life</strong> priority draws on the combined QoL rank
              shown on this page. Dial it up on the priorities step if life-quality factors beyond any single
              dimension matter to you.
            </p>
          </div>
        </details>

        {/* CTA back to wizard */}
        <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center", padding:"32px 0", borderTop:"1px solid #EADFC2" }}>
          <button type="button" style={S.btn} onClick={() => { setView("wizard"); setStep(0); }}>
            Find your pathway to the EU →
          </button>
        </div>
      </div>
    );
  };

  /* ---------- Render ---------- */
  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600&family=Manrope:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .sr-only { position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0; }
        .skip-link {
          position:absolute; left:-9999px; top:8px;
          padding:10px 16px; background:#003399; color:#fff;
          text-decoration:underline; border-radius:4px; z-index:1000;
          font-weight:600; font-size:14px; font-family:inherit;
        }
        .skip-link:focus, .skip-link:focus-visible {
          left:16px; outline:3px solid #FFCC00; outline-offset:2px;
        }
        a:focus-visible, button:focus-visible, input:focus-visible, select:focus-visible, [tabindex]:focus-visible, summary:focus-visible {
          outline: 3px solid #FFCC00; outline-offset: 2px;
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
        }
        @keyframes fadeSlideIn { from{opacity:0; transform:translateY(14px)} to{opacity:1; transform:translateY(0)} }
        @keyframes popIn { from{opacity:0; transform:translate(-50%, 20px) scale(.95)} to{opacity:1; transform:translate(-50%, 0) scale(1)} }
        input[type="range"] { -webkit-appearance:none; appearance:none; height:4px; border-radius:2px; background:#CEC2A0; outline:none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:20px; height:20px; border-radius:50%; background:#003399; cursor:pointer; border:2px solid #FAF6EE; box-shadow:0 1px 3px rgba(0,0,0,0.2); }
        input[type="range"]::-moz-range-thumb { width:20px; height:20px; border-radius:50%; background:#003399; cursor:pointer; border:2px solid #FAF6EE; }
        button:not(:disabled):hover { filter: brightness(1.05); }
        summary::marker { color:#003399; }
      `}</style>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>

      <header style={S.header} role="banner">
        <div style={S.headerInner}>
          <div style={S.logoArea}>
            <svg width="48" height="32" viewBox="0 0 54 36" aria-hidden="true" focusable="false"
              style={{ display:"block", borderRadius:2, boxShadow:"0 0 0 1px rgba(255,255,255,0.2)" }}>
              <rect width="54" height="36" fill="#003399" />
              {[...Array(12)].map((_, i) => {
                // 12 stars arranged in a circle, first star at top (12 o'clock position)
                const angle = (i * 30 - 90) * Math.PI / 180;
                const cx = 27 + 11 * Math.cos(angle);
                const cy = 18 + 11 * Math.sin(angle);
                // 5-pointed star centered at (cx, cy) with outer radius 2.2
                const outerR = 2.2, innerR = outerR * 0.382;
                const points = [];
                for (let p = 0; p < 10; p++) {
                  const r = p % 2 === 0 ? outerR : innerR;
                  const a = (p * 36 - 90) * Math.PI / 180;
                  points.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
                }
                return <polygon key={i} points={points.join(" ")} fill="#FFCC00" />;
              })}
            </svg>
            <div>
              <h1 style={S.logoTitle}>Move Me To EU</h1>
              <div style={S.logoSub}>Find your path into the Union</div>
            </div>
          </div>
          <nav aria-label="Primary" style={{ display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
            <button
              type="button"
              onClick={() => setView("wizard")}
              aria-current={view === "wizard" ? "page" : undefined}
              style={{
                background:"transparent", border:"none", color:"#fff", fontFamily:"inherit", fontSize:14,
                fontWeight: view === "wizard" ? 700 : 500,
                opacity: view === "wizard" ? 1 : 0.75,
                cursor:"pointer", padding:"6px 0",
                borderBottom: view === "wizard" ? "2px solid #FFCC00" : "2px solid transparent",
              }}>
              Pathway Finder
            </button>
            <button
              type="button"
              onClick={() => setView("whyEU")}
              aria-current={view === "whyEU" ? "page" : undefined}
              style={{
                background:"transparent", border:"none", color:"#fff", fontFamily:"inherit", fontSize:14,
                fontWeight: view === "whyEU" ? 700 : 500,
                opacity: view === "whyEU" ? 1 : 0.75,
                cursor:"pointer", padding:"6px 0",
                borderBottom: view === "whyEU" ? "2px solid #FFCC00" : "2px solid transparent",
              }}>
              Why EU?
            </button>
            {view === "wizard" && step < 3 && !comparing && (
              <ol style={{ ...S.stepper, marginLeft:12, paddingLeft:12, borderLeft:"1px solid rgba(255,255,255,0.2)" }} aria-label="Progress">
                {stepNames.slice(0, 3).map((name, i) => (
                  <li key={name} style={{ ...S.stepDot, ...(i <= step ? S.stepDotActive : {}) }}
                    aria-current={i === step ? "step" : undefined}>
                    <span style={{ ...S.dot, ...(i <= step ? S.dotActive : {}) }} aria-hidden="true">{i + 1}</span>
                    <span>{name}</span>
                  </li>
                ))}
              </ol>
            )}
          </nav>
        </div>
      </header>

      <main id="main" ref={mainRef} tabIndex={-1} style={S.main} role="main">
        {view === "whyEU" ? renderWhyEU() : (
          comparing ? renderCompare() : (
            <>
              {step === 0 && renderStep0()}
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
            </>
          )
        )}
      </main>

      {/* Floating comparison tray — appears on step 3 when 1+ shortlisted */}
      {view === "wizard" && step === 3 && !comparing && shortlist.length > 0 && (
        <div style={{ ...S.floatingBar, animation:"popIn .3s ease" }}
          role="region"
          aria-label="Country comparison tray"
          aria-live="polite">
          <span style={S.floatingFlags} aria-hidden="true">
            {shortlist.map(code => COUNTRIES.find(c => c.code === code)?.flag)}
          </span>
          <span style={{ fontSize:14, fontWeight:600 }} aria-live="polite">
            {shortlist.length} of 3 countries shortlisted
          </span>
          <button type="button"
            onClick={() => setComparing(true)}
            style={{ ...S.btnGold, padding:"10px 20px", fontSize:14 }}
            aria-label={`Open side-by-side comparison of ${shortlist.length} shortlisted ${shortlist.length === 1 ? "country" : "countries"}`}>
            Compare →
          </button>
          <button type="button"
            onClick={clearShortlist}
            style={{ background:"transparent", border:"none", color:"#FAF6EE", cursor:"pointer", fontSize:13, textDecoration:"underline", fontFamily:"inherit" }}
            aria-label="Clear all shortlisted countries">
            clear
          </button>
        </div>
      )}

      <footer style={{ borderTop:"1px solid #E8DFC9", padding:"24px 20px 80px", fontSize:12, color:"#4A5578", textAlign:"center" }}>
        Move Me To EU · 27 member states · Data compiled from public sources, including official government portals,
        Eurostat, Numbeo indices and EF English Proficiency Index. Always confirm visa requirements with the
        relevant consulate before acting.
      </footer>
    </div>
  );
}
