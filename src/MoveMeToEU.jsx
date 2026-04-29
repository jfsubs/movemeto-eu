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

/* US national homicide rate (per 100k). Source: FBI UCR / CDC WONDER, ~2023.
   This is a national average — individual states vary widely (1.3–12.5).
   Used by the intro fork's Why EU? banner to show a stable comparison
   independent of any particular state. The Why EU? page itself uses
   per-state data via the US_STATES selector. */
const US_HOMICIDE_AVG = 6.4;

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

/* ---------- COST OF LIVING (Numbeo Cost of Living + Rent Index, 2025) ---- */
/* NYC = 100 baseline. Combines groceries, dining, transport, utilities, and rent
   into a single normalized index. The "Cost of Living + Rent" variant is used
   (vs. the basic CoL which excludes rent) because rent is a major part of
   household expenses and varies more between US and EU than other categories.
   Source: Numbeo, https://www.numbeo.com/cost-of-living/rankings_by_country.jsp
   Annual snapshot — refresh against Numbeo's latest annual index when it rolls
   over (typically a new annual dataset each January). */
const COL_PLUS_RENT = {
  AT: 43.6, BE: 40.1, BG: 24.2, HR: 30.5, CY: 38.2, CZ: 31.5, DK: 48.6, EE: 33.8,
  FI: 41.1, FR: 41.0, DE: 42.4, GR: 31.1, HU: 25.3, IE: 50.6, IT: 36.3, LV: 28.6,
  LT: 30.9, LU: 54.8, MT: 37.1, NL: 47.9, PL: 28.8, PT: 32.8, RO: 23.2, SK: 29.7,
  SI: 34.1, ES: 33.6, SE: 38.7,
};
const US_COL_PLUS_RENT = 54.3;

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

/* ---------- VISA DETAILS ------------------------------------------------- */
/* Research-backed detailed data for each country/visa combo. Lookup falls back
   to visa-type defaults when a country-specific entry is not present. Data
   accurate as of early 2026; always verify at the official portal before acting. */

const VISA_DETAILS_DEFAULTS = {
  bluecard: {
    income: "Salary at minimum 1× national average (≈ €45,000–€60,000/year depending on country). Shortage occupations often have lower thresholds.",
    documents: "University degree or equivalent 3+ years IT experience, signed employment contract (6+ months), valid passport, health insurance, criminal background check.",
    processing: "4–20 weeks depending on embassy workload.",
    duration: "Typically 1–4 years, renewable while you hold a qualifying job.",
    pathToPR: "Permanent residence in 21–33 months with B1 language, 5 years standard. EU mobility rights after 12 months (move to another EU state under simplified rules).",
    family: "Spouse and minor children eligible for family reunification. Spouse usually gets unrestricted work rights. Reduced language requirements vs. national permits.",
  },
  national_work: {
    income: "Varies widely by country and occupation; generally tied to national minimum wage or collective bargaining agreements.",
    documents: "Signed employment contract, proof of qualifications, employer sponsorship/labor market test in many cases, passport, health coverage, police clearance.",
    processing: "1–6 months depending on country.",
    duration: "Usually 1–2 years initially, renewable as long as employment continues.",
    pathToPR: "Permanent residence typically after 5 years of continuous legal residence.",
    family: "Family reunification generally available once main holder meets minimum residency + income thresholds.",
  },
  nomad: {
    income: "Typically €2,500–€3,500/month from foreign employers or clients. Spain: €2,849/mo. Portugal D8: €3,480/mo. Estonia: €4,500/mo.",
    documents: "Proof of remote work (contracts, employer letter confirming remote work authorization), 6–12 months of bank statements, private health insurance, clean record, passport.",
    processing: "30–90 days at most consulates.",
    duration: "1–2 years initially, renewable up to 5 years in most countries.",
    pathToPR: "Most DNVs count toward permanent residence (5 years typical). A few explicitly exclude DNV holders from PR — verify.",
    family: "Spouse and dependent children included with higher income thresholds. Add ~75% of base for spouse, ~25% per child.",
  },
  freelance: {
    income: "€24,000–€40,000/year typical. Must show stable self-employment income and, often, existing clients or business plan.",
    documents: "Business plan or client list, financial projections, tax registration in home country, portfolio/qualifications, proof of accommodation, health insurance.",
    processing: "2–6 months; varies significantly by country.",
    duration: "1–3 years initially, renewable.",
    pathToPR: "Permanent residence after 5 years in most EU states.",
    family: "Family reunification available; income threshold rises with dependents.",
  },
  family: {
    income: "Sponsor usually needs stable income equivalent to minimum wage or social assistance threshold, plus adequate housing.",
    documents: "Marriage/birth certificate (apostilled & translated), sponsor's proof of legal residence, sponsor's income and housing proof, health insurance for family member.",
    processing: "3–9 months; often the slowest category due to document verification.",
    duration: "Usually matches the sponsor's residence permit, with independent renewal rights after 3–5 years.",
    pathToPR: "Spouses of EU citizens can often apply for PR after 3 years; spouses of non-EU residents typically 5 years.",
    family: "This visa IS the family path — spouse, registered partner, minor children, sometimes dependent parents.",
  },
  student: {
    income: "Proof of sufficient funds for living costs, typically €6,000–€12,000/year in a blocked account or sponsor guarantee.",
    documents: "Acceptance letter from recognized institution, proof of tuition payment, financial guarantee, accommodation, health insurance, language proficiency (if degree taught in local language).",
    processing: "4–12 weeks.",
    duration: "Duration of study, typically renewed annually.",
    pathToPR: "Study years often count only partially (50%) toward the 5-year PR timeline. Post-study work permits available in most EU states (6–18 months to find qualifying employment).",
    family: "Spouse/children reunification possible for degree-level students with adequate funds; typically not for short programs.",
  },
  jobseeker: {
    income: "Proof of savings to cover 6–12 months of living expenses (usually €5,000–€15,000).",
    documents: "University degree (recognized or evaluated), CV, proof of savings, health insurance, accommodation proof.",
    processing: "4–12 weeks.",
    duration: "6–12 months, non-renewable — must convert to a work permit if employment found.",
    pathToPR: "No direct PR path; must convert to Blue Card or national work permit first.",
    family: "Generally not available for dependents during the job search phase.",
  },
  retirement: {
    income: "Stable passive income; Portugal D7: €920/mo; Spain NLV: €2,400/mo (400% IPREM); Greece FIP: €3,500/mo; Italy ERV: €31,000/yr.",
    documents: "Proof of passive income (pension statements, dividend records, rental agreements, bank statements 6–12 months), private health insurance, criminal background check, proof of accommodation in country.",
    processing: "2–6 months.",
    duration: "1–2 years initially, renewable up to 5 years.",
    pathToPR: "Permanent residence after 5 years of continuous residence in most countries.",
    family: "Spouse and dependent children can be included; threshold usually +50% for spouse, +30% per child.",
  },
  golden: {
    income: "Capital investment required, not income. Real estate, government funds, business creation, or donation options. Typical floor: €250,000–€500,000.",
    documents: "Proof of source of funds, investment confirmation, clean criminal record, health insurance, passport. Anti-money-laundering checks are thorough.",
    processing: "6–12 months typically; Malta MPRP 4–6 months.",
    duration: "1–5 years initially; renewable while investment is maintained.",
    pathToPR: "Most programs lead to PR in 5 years. Malta MPRP grants PR directly on approval.",
    family: "Spouse, children (often including adult children if dependent), sometimes parents and siblings. Family inclusion is generally more generous than other visa types.",
  },
};

const VISA_DETAILS = {
  DE: {
    bluecard: {
      income: "€50,700/year gross (2026 standard). €45,934.20 for shortage occupations (IT, engineering, healthcare, STEM) and recent graduates (<3 years since degree).",
      documents: "University degree (or 3+ years IT experience for IT specialists, no degree needed since 2025), employment contract ≥6 months, passport, health insurance, criminal background check.",
      processing: "4–20 weeks at the German embassy or consulate. Faster via fast-track if employer is certified.",
      duration: "Up to 4 years initially, renewable while employed.",
      pathToPR: "Permanent settlement permit (Niederlassungserlaubnis) after 21 months with B1 German, or 27 months with A1. EU mobility rights after 12 months. Citizenship eligible after 5 years.",
      family: "Spouse can join without German language skills and receives unrestricted right to work. Minor children included. Reduced language requirements vs. standard work permit.",
    },
    freelance: {
      income: "No fixed minimum; must demonstrate viable self-employment with German clients or demonstrable local economic interest. Typical threshold: €9,000–€30,000+ annual profit depending on city.",
      documents: "Business plan, CV, portfolio, 2+ letters of intent from potential German clients (for Freiberufler), Krankenversicherung (health insurance), Anmeldung (address registration), Steueridentifikationsnummer.",
      processing: "2–4 months from within Germany. Apply at local Ausländerbehörde after entering on a visa or (for US citizens) visa-free and converting.",
      duration: "Usually 1–3 years initially, renewable.",
      pathToPR: "Permanent residence after 3 years if business is profitable, otherwise 5 years. Citizenship after 5 years of residence (down from 8 since 2024 reform).",
      family: "Spouse and minor children via family reunification. Spouse needs A1 German in most cases (exceptions for highly qualified).",
    },
    national_work: {
      income: "Fachkräfte (skilled workers): generally at prevailing wage, no fixed floor. Opportunity Card (Chancenkarte) job seeker requires points-based qualifying score.",
      documents: "Recognized qualification (Anerkennung for regulated professions), employment contract or job offer, health insurance, housing proof.",
      processing: "4–16 weeks.",
      duration: "Up to 4 years, renewable.",
      pathToPR: "PR after 4 years of legal employment (3 years with B1 German). Citizenship at 5 years.",
      family: "Standard German family reunification rules apply.",
    },
  },
  PT: {
    retirement: {
      income: "€920/month passive income (indexed to Portuguese minimum wage, 2026). +50% for spouse (€1,380 couple), +30% per child.",
      documents: "6–12 months of bank statements showing income, rental contract or property deed in Portugal, NIF (Portuguese tax number), Portuguese bank account with €10,440+ balance, private health insurance, criminal background check (apostilled).",
      processing: "2–6 months for the consular visa; then 6–9 months for AIMA residence card after arrival.",
      duration: "Initial visa 4 months (enter and apply for residence permit). First residence card: 2 years. Renewed for 3-year periods.",
      pathToPR: "Permanent residence or citizenship after 5 years. Must reside 16+ months within any 2-year period. US citizens can apply for Portuguese citizenship after 5 years (was 6; aligned in 2024 reform).",
      family: "Spouse, minor children, dependent adult children in education, and dependent parents all eligible under family reunification.",
    },
    nomad: {
      income: "€3,480/month (4× Portuguese minimum wage, 2026) from foreign-source remote work. Applies to employees of foreign companies and freelancers with foreign clients.",
      documents: "Employment contract or client agreements showing remote work, 3 months of bank statements meeting threshold, proof of accommodation in Portugal, NIF, private health insurance, criminal record.",
      processing: "2–4 months consular visa; then residence permit appointment with AIMA after arrival.",
      duration: "Initial visa 4 months; residence permit 2 years, renewable for 3 years.",
      pathToPR: "Permanent residence / citizenship after 5 years with 16+ months of physical presence per 2-year period.",
      family: "Spouse, minor children, dependent adult children, dependent parents eligible.",
    },
    golden: {
      income: "Post-2023 reform: €500,000 investment fund contribution, €500,000 research/arts donation, or €250,000 cultural heritage donation. Real estate is NO LONGER eligible.",
      documents: "Proof of investment, source-of-funds documentation, criminal background check, health insurance, passport.",
      processing: "8–14 months (longer since 2023 reform backlog).",
      duration: "Residence card valid 2 years, renewable for 3-year periods. Only 7 days/year minimum physical presence required.",
      pathToPR: "Permanent residence or citizenship after 5 years (this program has among the shortest physical-presence requirements in the EU).",
      family: "Spouse, children, dependent parents, dependent siblings all eligible under one investment.",
    },
  },
  ES: {
    nomad: {
      income: "€2,849/month gross (2026), tied to 200% of Spanish SMI. +75% for spouse (≈€1,069), +25% per child (≈€357).",
      documents: "Employment contract or client agreements (company must have existed 1+ year, you must have worked there 3+ months), university degree OR 3+ years relevant experience, criminal background check, private health insurance meeting Spanish standards, proof of accommodation.",
      processing: "2–4 months consular; faster (15–45 days) if applied from within Spain on a tourist Schengen stamp.",
      duration: "1 year if applied via consulate; 3 years if applied from within Spain. Renewable for 2-year periods up to 5 years total.",
      pathToPR: "Long-term residence after 5 years. Spanish citizenship typically after 10 years (2 years for Latin Americans, Portuguese, Filipinos, Equatorial Guineans, Sephardic Jews).",
      family: "Spouse/registered partner and minor children eligible. US W-2 employees now accepted (as of 2025) though 1099/autónomo conversion still common.",
    },
    national_work: {
      income: "Highly Qualified Professional (HQP) visa: €40,000+/year typical. Other work permits require labor market test and prevailing-wage offer.",
      documents: "Job offer from Spanish employer with approved labor market test (or HQP exemption), recognized qualifications, social security enrollment, housing.",
      processing: "3–6 months.",
      duration: "1 year initially, then 2-year renewals.",
      pathToPR: "PR after 5 years continuous residence. Citizenship at 10 years (2 years for select nationalities).",
      family: "Family reunification after 1 year of legal residence in Spain.",
    },
    retirement: {
      income: "Non-Lucrative Visa (NLV): €2,400/month (400% of IPREM, 2026), OR equivalent capital. +25% per dependent. No work permitted in Spain.",
      documents: "Proof of passive income/savings, private health insurance covering Spain with no co-pay, criminal record, medical certificate, accommodation.",
      processing: "1–3 months consular.",
      duration: "1 year initially, renewable for 2-year periods.",
      pathToPR: "PR at 5 years; citizenship at 10 years (2 for select nationalities).",
      family: "Spouse and dependent children included; threshold +25% per person.",
    },
  },
  NL: {
    bluecard: {
      income: "€5,688/month gross (2026, standard threshold) ≈ €68,260/year. €4,171/month for recent graduates (<1 year since degree) or under-30.",
      documents: "Recognized bachelor's+ degree, employment contract with IND-recognized sponsor, passport, health insurance via Dutch system.",
      processing: "2–4 weeks with recognized sponsor (faster than most EU countries).",
      duration: "Up to 4 years, matching employment contract.",
      pathToPR: "Permanent residence after 5 years; citizenship at 5 years with B1 Dutch (requires renouncing existing citizenship in most cases — Netherlands does not generally allow dual citizenship for naturalized citizens).",
      family: "Spouse gets unrestricted work rights. Minor children included. Spouse income doesn't count toward threshold.",
    },
    freelance: {
      income: "DAFT (Dutch-American Friendship Treaty) — open exclusively to US citizens. €4,500 minimum business investment (held in Dutch business bank account). No salary threshold but business must be viable.",
      documents: "US passport, business registration with Kamer van Koophandel, Dutch business bank account with €4,500 deposit, business plan, health insurance, BSN (citizen service number).",
      processing: "2–4 months.",
      duration: "2 years initially, renewed for 5-year periods.",
      pathToPR: "PR after 5 years; citizenship at 5 years (with the dual-citizenship caveat above).",
      family: "Spouse and minor children can join. Spouse may work freely under family reunification.",
    },
  },
  IE: {
    national_work: {
      income: "Critical Skills Employment Permit: €38,000/year (2026) for qualifying roles on the Critical Skills Occupations List; €64,000/year for other skilled roles. General Employment Permit: €34,000/year with labor market test.",
      documents: "Job offer from Irish employer, qualifications, passport, medical insurance.",
      processing: "8–12 weeks.",
      duration: "2 years initially (Critical Skills), then Stamp 4 (effectively permanent) after 2 years.",
      pathToPR: "Long-term residence (Stamp 4) after 2 years on Critical Skills Permit — among the fastest in Europe. Irish citizenship after 5 years of reckonable residence.",
      family: "Spouse/partner of Critical Skills Permit holders can work without a separate permit (Stamp 1G). Immediate family reunification.",
    },
    retirement: {
      income: "Stamp 0 (retirement): €50,000/year per person passive income OR significant lump sum (~€1M in readily available resources). Strict — Ireland is not a retirement-friendly destination.",
      documents: "Proof of income/savings, private health insurance, accommodation, character references, medical assessment.",
      processing: "6–12 months.",
      duration: "1 year, renewable annually.",
      pathToPR: "Stamp 0 does NOT lead to PR or citizenship, even after many years. It is a limited, renewable permission to reside.",
      family: "Spouse can be included under separate Stamp 0 application with matching income.",
    },
  },
  MT: {
    golden: {
      income: "Malta Permanent Residency Programme (MPRP): €150,000 government contribution + property purchase (€375,000+) OR rental (€14,000+/year for 5 years) + €50,000 charitable donation. Total cost: ~€550,000–€700,000 depending on route.",
      documents: "Source-of-funds documentation (forensic due diligence is rigorous), property/lease agreement, criminal background check, health insurance, passport.",
      processing: "4–6 months (among the fastest golden visa programs).",
      duration: "Permanent residence granted directly on approval (not temporary like most programs).",
      pathToPR: "PR is granted from day one. Citizenship path available via separate Exceptional Investment Naturalisation programme (much more expensive, ~€690,000+).",
      family: "Spouse, children (including adult children up to 29 if dependent), parents, and grandparents of main applicant and spouse — broadest family inclusion in the EU.",
    },
  },
  FR: {
    bluecard: {
      income: "€59,373/year gross (2026) — 1.5× the French reference average salary set by the August 2025 ministerial decree. Processing target reduced to 90 days under the 2025 reform.",
      documents: "Recognised bachelor's+ degree OR 5+ years equivalent professional experience, signed employment contract (6+ months), passport, health coverage.",
      processing: "Typically 8–12 weeks; 90-day processing target codified in 2025. Same-day validation possible if employer is certified.",
      duration: "Up to 4 years under the 'Talent — EU Blue Card' permit, renewable while employed.",
      pathToPR: "Permanent residence after 5 years of legal residence. French citizenship at 5 years (2 if graduated from a French university). Holders of a Blue Card from another EU state can apply in France within 1 month of arrival.",
      family: "Spouse and minor children under simultaneous 'Talent — famille' application. Spouse gets unrestricted work rights. Recent reform allows family applications to be processed in parallel with the main applicant.",
    },
    national_work: {
      income: "'Talent — Qualified Employee' permit: €39,582/year gross (2026), reduced by 8% in the August 2025 reform to improve accessibility. Company directors: €65,629+/year. No SMIC-based calculation — fixed reference salary.",
      documents: "Master's degree or 5+ years equivalent experience, employment contract (permanent, or fixed-term of 3+ months), French employer with the role genuinely requiring the qualification.",
      processing: "4–8 weeks through the France-Visas platform.",
      duration: "Up to 4 years, renewable. A2 French proficiency required for renewal starting 2026.",
      pathToPR: "Long-term residence after 5 years. Citizenship at 5 years standard; 2 years for graduates of French higher education.",
      family: "'Talent — famille' accompanying visa for spouse and children. Spouse may work freely.",
    },
    freelance: {
      income: "'Entrepreneur / Liberal Profession' residence permit: ~€23,000/year minimum (equivalent to SMIC); viable business plan required. Company directors: €65,629+/year under the Talent scheme.",
      documents: "Business plan, proof of qualifications, financial projections, accommodation in France, health insurance.",
      processing: "2–4 months.",
      duration: "Up to 4 years, renewable.",
      pathToPR: "Permanent residence after 5 years. Citizenship at 5 years standard.",
      family: "Spouse and children eligible via 'Talent — famille' if applicant qualifies under the Talent scheme; otherwise standard family reunification (longer process).",
    },
    retirement: {
      income: "Long-stay Visitor Visa (VLS-TS Visiteur): ~€1,800/month passive income OR €30,000+ in a foreign bank account. No work permitted in France — strictly for financially independent residents.",
      documents: "Bank statements, pension documents, proof of accommodation in France (lease or property deed), private health insurance covering France, commitment letter stating you will not work.",
      processing: "2–4 months.",
      duration: "1 year initially, renewable. Multi-year card possible after 3 years.",
      pathToPR: "Long-term residence at 5 years. Citizenship at 5 years (2 years if a French university graduate).",
      family: "Spouse can obtain own Visitor Visa with matching income proof. Minor children eligible under family reunification after sponsor establishes 1+ year of residence.",
    },
  },
  IT: {
    nomad: {
      income: "€28,000/year minimum from foreign sources (some consulates request more); €32,400/year commonly cited for comfortable approval. +20% for spouse, additional €6,200/year per dependent child. Plus €30,000+ savings typically required.",
      documents: "University degree OR equivalent 6+ months relevant remote work experience, employment contract or client agreements (foreign-only), bank statements, private health insurance, accommodation in Italy, criminal record check.",
      processing: "30–60 days at consulate; can take up to 120 days. After arrival, 'permesso di soggiorno' must be applied for within 8 working days.",
      duration: "1 year initially, renewable for 2 additional years while requirements are maintained.",
      pathToPR: "Counts toward permanent residence after 5 years if 183+ days/year physical presence is maintained. Italian citizenship possible after 10 years of legal residence.",
      family: "Spouse and minor children via family reunification ('ricongiungimento familiare'). Income threshold rises per family member.",
    },
    retirement: {
      income: "Elective Residency Visa: €32,000+/year per applicant in passive income (pensions, dividends, rental income, investments). +20% per dependent, +€6,200/year per child. Active work income (even remote) does NOT qualify — this is for the financially independent.",
      documents: "Proof of passive income sources (pension statements, dividend records, rental contracts), 12-month lease agreement or property deed in Italy, private health insurance, criminal record, clean financial history.",
      processing: "2–4 months consular. Convert to residence permit within 8 working days of arrival.",
      duration: "1 year initially, renewable in 2-year increments.",
      pathToPR: "Permanent residence at 5 years (183+ days/year presence). Italian citizenship at 10 years.",
      family: "Spouse and dependent children can be included with higher income thresholds; each needs independent proof of means in many consular districts.",
    },
    golden: {
      income: "Investor Visa: €250,000 in an Italian innovative startup, €500,000 in an Italian limited company, €2M in government bonds, OR €1M philanthropic donation. New 'flat tax' regime for high-net-worth individuals rose to €300,000/year in December 2025.",
      documents: "Proof of investment readiness, source-of-funds documentation, anti-money-laundering clearance, criminal record, health insurance.",
      processing: "30 days for nulla osta (approval); then apply for visa and residence permit.",
      duration: "2 years initially, renewable for 3-year periods while investment is maintained.",
      pathToPR: "Permanent residence at 5 years; no minimum stay required for visa maintenance (attractive for those seeking EU residency without relocating).",
      family: "Spouse, minor children, dependent adult children, dependent parents — generous family inclusion.",
    },
    bluecard: {
      income: "Approximately €26,000–€28,000/year gross (3× Italian minimum annual wage) — one of the lowest Blue Card thresholds in the EU, making Italy attractive for non-elite skilled migration.",
      documents: "Recognised higher education qualification (3+ years), employment contract 6+ months, passport, health insurance.",
      processing: "60–120 days.",
      duration: "2 years or matching contract length, renewable.",
      pathToPR: "PR at 5 years. Citizenship at 10 years (Italy's long path — among the slowest in the EU).",
      family: "Spouse and children via simultaneous family application; spouse receives unrestricted work rights.",
    },
  },
  GR: {
    retirement: {
      income: "Financially Independent Person (FIP) visa: €3,500/month in stable passive income (+20% for spouse = €4,200 couple, +15% per child). Alternatively: €126,000 lump-sum deposit covering 3 years. Savings alone generally not accepted without supporting passive income.",
      documents: "Pension statements, bank account statements, investment income proof, rental agreements abroad, private health insurance, criminal record, proof of accommodation in Greece, clean financial history.",
      processing: "Type D visa issued in ~10 days; residence permit processing up to 3 months after arrival.",
      duration: "3 years initially (extended from 2 years in June 2024 reform), renewable.",
      pathToPR: "Permanent residence after 5 years. Greek citizenship possible after 7 years. Requires 183+ days physical presence per year.",
      family: "Spouse and dependent children under 21 eligible. Must meet the higher combined income threshold (+20% spouse, +15% per child).",
    },
    golden: {
      income: "Real estate investment: €800,000 in Athens/Thessaloniki/popular islands (since January 2025 reform); €400,000 in other regions; €250,000 for property conversions (commercial→residential) or listed-building restorations. Minimum 120m² per property in high-cost zones.",
      documents: "Property purchase contracts, notary deeds, proof of funds transfer (€250k+), source-of-funds documentation, criminal record, health insurance.",
      processing: "1–2 months typical (streamlined online platform since 2022). Backlogs possible near investment-threshold deadlines.",
      duration: "5-year renewable residence permit; NO physical presence requirement — you can keep the permit without living in Greece.",
      pathToPR: "Permanent residence at 5 years (with physical presence). Citizenship at 7 years. Many Golden Visa holders never qualify for citizenship because they don't actually live in Greece.",
      family: "Spouse, dependent children (under 21 can be extended to 24 if in full-time education), dependent parents of both applicant and spouse.",
    },
    nomad: {
      income: "€3,500/month net from remote work (foreign employers or clients); +20% for spouse, +15% per child. Same threshold as FIP.",
      documents: "Employment contract or client agreements with foreign entities, 6 months of bank statements, private health insurance, criminal record, accommodation in Greece.",
      processing: "Approximately 10 days for visa; 2–3 months for residence permit after arrival.",
      duration: "2 years initially, renewable.",
      pathToPR: "Counts toward 5-year PR path if 183+ days/year physical presence is maintained. Special 50% income tax reduction for 7 years available under Greek non-dom regime.",
      family: "Spouse and minor children eligible with higher income.",
    },
  },
  CZ: {
    freelance: {
      income: "Žživno (Trade License) visa: CZK 156,500 (~€6,300) in a bank account as proof of funds. Ongoing income after arrival: ~CZK 20,000+/month typical; precise renewal threshold set by Ministry annually.",
      documents: "Trade License (živnostenské oprávnění) from a Czech Trade Licence Office, bank letter showing CZK 156,500+, notarised lease agreement (minimum 1 year), criminal background check (apostilled + translated to Czech), health insurance, passport.",
      processing: "60–120 days; official 90-day target. Applications must be lodged at a Czech consulate (some nationalities restricted to specific locations).",
      duration: "12 months initially, extended by 24 months. Subsequent renewals via Ministry of Interior.",
      pathToPR: "Permanent residence after 5 years of continuous legal residence. Czech citizenship after 10 years (5 PR + 5 more).",
      family: "Spouse and dependent children can join through separate family reunification applications; must meet accommodation and income thresholds.",
    },
    nomad: {
      income: "€2,800–€3,000/month (1.5× Czech average salary, ~CZK 69,836/month in 2026). Restricted to IT and marketing specialists from selected eligible countries (includes US, UK, Australia, Brazil, Israel, Mexico, Singapore, South Korea, Japan, New Zealand, Canada, Taiwan).",
      documents: "University degree in IT/marketing OR 3+ years experience, Trade License (for freelancers) or foreign employer contract (for employees of companies with 50+ staff), criminal record, health insurance, accommodation.",
      processing: "45–90 days.",
      duration: "1 year initially, extendable to 2-year residence permit.",
      pathToPR: "Can transition to standard long-term residence; counts toward 5-year PR path once converted. Czech citizenship at 10 years.",
      family: "Spouse and children via Czech family reunification; not bundled with the main applicant's process.",
    },
    bluecard: {
      income: "Czech Blue Card requires salary at 1.5× the Czech average gross wage — approximately CZK 70,000/month (€2,850/month, ~€34,200/year) in 2026.",
      documents: "Recognised higher education qualification, employment contract 12+ months, passport, health insurance.",
      processing: "Reduced standard processing times following the 2025 EU Blue Card reform; typically 60–90 days.",
      duration: "2 years or contract length, renewable.",
      pathToPR: "PR after 5 years (or 33 months with B1 Czech per 2025 reform). Citizenship at 10 years.",
      family: "Spouse and children via simultaneous family processing; spouse receives work rights.",
    },
  },
  EE: {
    nomad: {
      income: "€4,500/month gross (2026) — among the highest DNV thresholds in the EU. Must be sustained for 6 months preceding application. Work must be for foreign-registered employers, foreign-owned companies you run, OR foreign clients.",
      documents: "Employment contract / business registration / client contracts (foreign only), 6 months of bank statements proving income, private health insurance, criminal record, accommodation, passport.",
      processing: "Approximately 30 days — among the fastest in the EU.",
      duration: "1 year, NOT renewable. 6-month cooling-off period required before re-application.",
      pathToPR: "No direct path. The DNV is strictly temporary and does not count toward permanent residence or Estonian citizenship.",
      family: "Spouse and dependent children can join under Estonia's standard family reunification rules; not automatic with DNV.",
    },
    bluecard: {
      income: "Estonian Blue Card salary threshold: approximately €2,000–€2,500/month gross (1.5× Estonian average salary). Among the lowest Blue Card thresholds in the EU.",
      documents: "Recognised university degree, employment contract 6+ months, employer sponsorship letter, passport, health insurance.",
      processing: "Approximately 8 weeks.",
      duration: "Up to 2 years initially; renewable. Multi-entry work/residence rights.",
      pathToPR: "Long-term residence after 5 years with B1 Estonian language proficiency. Estonian citizenship at 8 years (5 TRP + 3 PR), also requires B1 Estonian and a civics exam.",
      family: "Spouse and minor children via family reunification. Important: Estonia generally does not allow dual citizenship for naturalized citizens.",
    },
    freelance: {
      income: "TRP for Enterprise: €65,000 investment into an Estonian company (one of the lowest investment thresholds in the EU). Alternative: Startup Visa (no minimum investment) if your startup is accepted by Startup Estonia.",
      documents: "Business registration, investment proof, business plan, financial projections, health insurance, accommodation.",
      processing: "Approximately 8 weeks (includes Startup Committee review for Startup Visa route).",
      duration: "Up to 2 years initially, renewable while the business is active.",
      pathToPR: "Long-term residence at 5 years with B1 Estonian. Citizenship at 8 years total. Note: Estonia's annual immigration quota (~1,300 permits) can fill; however, startup, IT, and top-specialist categories are exempt.",
      family: "Family reunification for spouse and minor children.",
    },
    student: {
      income: "Proof of financial means: €250–€300/month for living costs (€3,000–€3,600/year minimum), typically via blocked account deposit.",
      documents: "Admission letter from recognised Estonian university, proof of tuition payment, financial guarantee, accommodation, health insurance.",
      processing: "Approximately 2 months.",
      duration: "Duration of study, typically renewed annually.",
      pathToPR: "Study years count only 50% toward the 5-year PR timeline. Post-study work permit available for 9 months to find qualifying employment after graduation.",
      family: "Spouse reunification possible for degree-level students with adequate funds; generally not for short programs.",
    },
  },
};

/* Lookup: returns country-specific details if available, else visa-type defaults */
function getVisaDetails(countryCode, visaId) {
  return VISA_DETAILS[countryCode]?.[visaId] || VISA_DETAILS_DEFAULTS[visaId] || null;
}

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

/* Priority weighting budget. Every factor starts at PRIORITY_BASELINE (3 = moderate).
   Users get PRIORITY_BONUS_POOL extra points to spend above baseline. Lowering a factor
   below baseline refunds points back into the pool, so dropping something to 1 frees
   2 points to push another factor higher. The intent is to force tradeoffs rather
   than letting users mark everything "critical." */
const PRIORITY_BASELINE = 3;
const PRIORITY_BONUS_POOL = 5;
const computeNetSpent = (w) =>
  PRIORITIES.reduce((sum, p) => sum + ((w[p.id] ?? PRIORITY_BASELINE) - PRIORITY_BASELINE), 0);

/* ---------- QUIZ DEFINITION (interactive matching path) ------------------ */
/* The quiz is an alternative entry to the Pathway Finder. The trunk question is
   multi-select: pick one for the full guided flow (1 trunk + 2 branched + 5
   value trade-offs = 8 questions), or pick multiple to see several pathways on
   each country (1 trunk + 5 value trade-offs = 6 questions; branched eligibility
   is skipped because those questions are per-visa-type and don't make coherent
   sense across multiple trunks). Each value trade-off bumps one priority by +1
   from baseline 3, so the 5 trade-offs spend exactly the PRIORITY_BONUS_POOL
   regardless of how many trunks were picked. Quiz answers populate `selectedVisas`
   (array — empty means "show all"), profile fields (education/income/capital/
   canRemote/hasEUFamily/wantsCitizenship), and weights — then hand off to the
   existing Step 3 results view. From there, "Refine with sliders" jumps to wizard
   Step 2 with everything pre-filled. Single scoring engine, single +5 budget. */

const QUIZ = {
  trunk: {
    id: "trunk",
    title: "What's bringing you to the EU?",
    desc: "Pick all that apply. If you select one, the next questions adapt to your situation; if you select more than one, we'll skip ahead to the priority questions and show every matching pathway on each country.",
    options: [
      { id: "career",       label: "Career or a job opportunity",                              visa: "bluecard"   },
      { id: "remote",       label: "Remote work for a non-EU employer",                        visa: "nomad",      profile: { canRemote: true } },
      { id: "selfemployed", label: "Self-employed or freelance",                               visa: "freelance"  },
      { id: "retirement",   label: "Retirement or near-retirement",                            visa: "retirement" },
      { id: "family",       label: "Joining family already in the EU",                         visa: "family",     profile: { hasEUFamily: true } },
      { id: "investment",   label: "Investment or starting a business",                        visa: "golden"     },
      { id: "study",        label: "Education or study",                                       visa: "student"    },
    ],
  },
  branches: {
    career: [
      { id: "career_stage", title: "Where are you in the process?", options: [
        { id: "sponsored",   label: "I have an offer with sponsorship" },
        { id: "unconfirmed", label: "I have an offer, sponsorship unconfirmed" },
        { id: "interviewing",label: "I'm actively interviewing" },
        { id: "preseek",     label: "I plan to relocate first, then job-hunt", visa: "jobseeker" },
      ]},
      { id: "career_edu", title: "Your highest qualification?", options: [
        { id: "highschool", label: "High school / secondary",         profile: { education: "highschool" } },
        { id: "associates", label: "Associate or vocational degree",  profile: { education: "associates" } },
        { id: "bachelors",  label: "Bachelor's degree",               profile: { education: "bachelors"  } },
        { id: "masters",    label: "Master's degree",                 profile: { education: "masters"    } },
        { id: "doctorate",  label: "Doctorate",                       profile: { education: "doctorate"  } },
      ]},
    ],
    remote: [
      { id: "remote_structure", title: "How is your remote work structured?", options: [
        { id: "w2",   label: "US W-2 employee with remote approval" },
        { id: "1099", label: "1099 contractor" },
        { id: "llc",  label: "I own an LLC or business" },
        { id: "free", label: "Multiple freelance clients" },
      ]},
      { id: "remote_income", title: "Monthly remote-work income (USD)?", options: [
        { id: "u3k",   label: "Under $3,000",       profile: { income: "under30"  } },
        { id: "3to5",  label: "$3,000 – $5,000",    profile: { income: "30to60"   } },
        { id: "5to8",  label: "$5,000 – $8,000",    profile: { income: "60to100"  } },
        { id: "8plus", label: "$8,000 or more",     profile: { income: "100to150" } },
      ]},
    ],
    selfemployed: [
      { id: "se_type", title: "What type of self-employed work?", options: [
        { id: "intl",  label: "Service provider with international clients" },
        { id: "local", label: "Local-market business or services" },
        { id: "mix",   label: "A mix of both" },
      ]},
      { id: "se_income", title: "Approximate annual income (USD)?", options: [
        { id: "u40",     label: "Under $40,000",          profile: { income: "under30"  } },
        { id: "40to80",  label: "$40,000 – $80,000",      profile: { income: "30to60"   } },
        { id: "80to150", label: "$80,000 – $150,000",     profile: { income: "60to100"  } },
        { id: "150plus", label: "$150,000 or more",       profile: { income: "100to150" } },
      ]},
    ],
    retirement: [
      { id: "ret_source", title: "Primary retirement income source?", options: [
        { id: "pension", label: "Pension" },
        { id: "invest",  label: "Investment portfolio" },
        { id: "rental",  label: "Rental income" },
        { id: "mix",     label: "A mix of sources" },
      ]},
      { id: "ret_income", title: "Monthly passive income (USD)?", options: [
        { id: "u2k",   label: "Under $2,000",       profile: { income: "under30"  } },
        { id: "2to4",  label: "$2,000 – $4,000",    profile: { income: "30to60"   } },
        { id: "4to7",  label: "$4,000 – $7,000",    profile: { income: "60to100"  } },
        { id: "7plus", label: "$7,000 or more",     profile: { income: "100to150" } },
      ]},
    ],
    family: [
      { id: "fam_who", title: "Who are you joining?", options: [
        { id: "eu_spouse",       label: "EU citizen spouse" },
        { id: "noneu_spouse",    label: "Non-EU spouse with EU residency" },
        { id: "eu_parent_child", label: "EU citizen parent or child" },
        { id: "other",           label: "Other immediate family" },
      ]},
      { id: "fam_country", title: "Are they in a specific country?", options: [
        { id: "specific", label: "Yes — one specific country" },
        { id: "few",      label: "A few options under consideration" },
        { id: "open",     label: "Open / not yet decided" },
      ]},
    ],
    investment: [
      { id: "inv_capital", title: "Available investment capital (USD)?", options: [
        { id: "50to250",  label: "$50,000 – $250,000",      profile: { capital: "50to250"  } },
        { id: "250to500", label: "$250,000 – $500,000",     profile: { capital: "250to500" } },
        { id: "500to1m",  label: "$500,000 – $1,000,000",   profile: { capital: "500to1m"  } },
        { id: "over1m",   label: "$1,000,000 or more",      profile: { capital: "over1m"   } },
      ]},
      { id: "inv_pref", title: "Investment preference?", options: [
        { id: "realestate", label: "Real estate" },
        { id: "funds",      label: "Government funds or bonds" },
        { id: "business",   label: "Active business or startup" },
        { id: "open",       label: "Open to any qualifying option" },
      ]},
    ],
    study: [
      { id: "study_level", title: "Level of study?", options: [
        { id: "undergrad",  label: "Undergraduate (Bachelor's)",  profile: { education: "highschool" } },
        { id: "masters",    label: "Master's",                    profile: { education: "bachelors"  } },
        { id: "phd",        label: "PhD",                         profile: { education: "masters"    } },
        { id: "vocational", label: "Vocational training",         profile: { education: "highschool" } },
      ]},
      { id: "study_funding", title: "Funding situation?", options: [
        { id: "selffund",    label: "Self-funded" },
        { id: "scholarship", label: "Scholarship or grant" },
        { id: "family",      label: "Family support" },
        { id: "combo",       label: "A combination of the above" },
      ]},
    ],
  },
  values: [
    {
      id: "v_cost_health",
      title: "Cost vs. healthcare",
      desc: "Both options assume universal healthcare; the question is the trade-off vs. cost.",
      options: [
        { id: "cost",   label: "Lower cost of living, with healthcare that's reliable but not flashy", weight: "affordability" },
        { id: "health", label: "Higher cost is fine if healthcare is top-tier with short waits",       weight: "healthcare"    },
      ],
    },
    {
      id: "v_pace",
      title: "Career pace and intensity",
      options: [
        { id: "ambitious", label: "Ambitious city, strong job market — I can match the intensity",   weight: "jobs"   },
        { id: "outdoors",  label: "Slower pace, easier access to outdoors and weekends in nature",   weight: "nature" },
      ],
    },
    {
      id: "v_language",
      title: "Language posture",
      options: [
        { id: "english",     label: "Daily life needs to work in English",                                                       weight: "english"    },
        { id: "citizenship", label: "I'll learn the local language for deeper integration and faster citizenship",               weight: "citizenship", profile: { wantsCitizenship: true } },
      ],
    },
    {
      id: "v_place",
      title: "Where you actually want to live",
      options: [
        { id: "transit", label: "Dense walkable city with transit and culture at the door", weight: "transit"      },
        { id: "town",    label: "Smaller town, slower pace, more car dependent",            weight: "qualityOfLife" },
      ],
    },
    {
      id: "v_community",
      title: "What kind of community do you want around you?",
      options: [
        { id: "international", label: "Lots of immigrants/expats and international community", weight: "international" },
        { id: "culture",       label: "Distinctive local culture, fewer compatriots",          weight: "culture"       },
      ],
    },
  ],
};

// Maximum quiz length (single-trunk path): 1 trunk + 2 branched + 5 values.
// The actual total can be 6 (multi-trunk skips branches) — see `quizFlow` below.
const QUIZ_MAX_QUESTIONS = 8;

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

/* ---------- FLAG COMPONENT ----------------------------------------------- */
/* Renders country flags as Twemoji SVG images rather than Unicode emoji. On
   Windows (Chrome/Edge), the OS doesn't ship color flag glyphs, so the native
   emoji renders as empty boxes or monochrome letters. Twemoji is served from
   jsDelivr as SVG, so flags render identically on every platform. */

/* Convert a 2-letter ISO country code to the Twemoji flag filename.
   Each regional indicator letter is at Unicode 0x1F1E6 + (char - 'A'). */
function flagFilename(code) {
  if (!code || code.length !== 2) return null;
  const cc = code.toUpperCase();
  const a = 0x1F1E6 + (cc.charCodeAt(0) - 65);
  const b = 0x1F1E6 + (cc.charCodeAt(1) - 65);
  return `${a.toString(16)}-${b.toString(16)}`;
}

const FLAG_CDN = "https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg";

/* <Flag code="NL" alt="Netherlands" />
   - For decorative use (country name adjacent), pass decorative={true} or
     omit alt. The image will be marked aria-hidden.
   - For standalone use (flag only, no name), pass a descriptive alt. */
function Flag({ code, alt, size = 18, style, decorative = false }) {
  const filename = flagFilename(code);
  if (!filename) return null;
  const isDecorative = decorative || !alt;
  return (
    <img
      src={`${FLAG_CDN}/${filename}.svg`}
      alt={isDecorative ? "" : alt}
      aria-hidden={isDecorative ? "true" : undefined}
      loading="lazy"
      draggable="false"
      style={{
        display: "inline-block",
        width: size,
        height: size * 0.75, // flags have 4:3 aspect ratio
        verticalAlign: "-0.15em",
        objectFit: "contain",
        ...style,
      }}
    />
  );
}

/* ---------- HERO IMAGES (intro fork rotating slideshow) ------------------ */
/* 4 stock photos that rotate every 6s on the intro fork's hero band. Files
   live in public/images/hero/ and must be processed to WebP at ~1600w
   (desktop) and ~800w (mobile) before commit. Filenames are referenced
   from the JSX as /images/hero/<name>; renaming a file requires updating
   this list. Each entry needs a descriptive alt for screen readers and a
   short credit attribution rendered in the page footer. */
const HERO_IMAGES = [
  { src: "/images/hero/hero-01.webp", alt: "Wisteria-draped buildings line the cobblestone Konviktstraße in Freiburg's old town",                                                  credit: "Paul Henri-Alley / Pexels" },
  { src: "/images/hero/hero-02.webp", alt: "Café La Favorite Saint-Paul beneath a Haussmann-style apartment building on rue Saint-Antoine, Paris",                                  credit: "ChiemSeherin / Pixabay"    },
  { src: "/images/hero/hero-03.webp", alt: "Brick townhouses, parked bicycles and a church spire along a quiet canal in Delft, Netherlands",                                       credit: "djedj / Pixabay"           },
  { src: "/images/hero/hero-04.webp", alt: "The Hemisfèric and Palau de les Arts at the City of Arts and Sciences reflected in still water at dusk in Valencia, Spain",            credit: "papagnoc / Pixabay"        },
];
const HERO_ROTATE_MS = 6000;

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
  { code:"CZ", name:"Czechia (Czech Republic)", capital:"Prague",     flag:"🇨🇿", pop:10.7, lang:"Czech",                        eurozone:false, schengen:true,  natYears:5,
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
  const [view, setView] = useState("wizard"); // "wizard" | "whyEU" | "faq"
  const [userState, setUserState] = useState("Virginia");
  // selectedVisas: array of visa IDs to filter to. Empty array = "show every
  // pathway available across all 27 countries." A single-element array is the
  // wizard's Step 0 single-select case. Multi-element arrays come from the
  // quiz when a user picks multiple reasons for moving.
  const [selectedVisas, setSelectedVisas] = useState([]);
  const [profile, setProfile] = useState({
    education: "bachelors", income: "60to100", capital: "under50",
    age: 35, yearsExp: 10,
    hasEUFamily: false, canRemote: false, wantsCitizenship: true,
  });
  const [weights, setWeights] = useState(() =>
    Object.fromEntries(PRIORITIES.map(p => [p.id, PRIORITY_BASELINE]))
  );
  const [shortlist, setShortlist] = useState([]);   // array of country codes, max 3
  const [comparing, setComparing] = useState(false);
  const [chartScope, setChartScope] = useState("all"); // "all" | "matches"
  const [expandedPathways, setExpandedPathways] = useState({}); // { "DE:bluecard": true, ... }

  /* Entry mode lets users pick between the wizard (existing 4-step flow) and the
     interactive quiz on first arrival. null = show the intro fork; "wizard" or
     "quiz" = engaged with that path. The quiz funnels into the wizard's Step 3
     (matches) once finished, with weights and profile pre-populated. */
  const [entryMode, setEntryMode] = useState(null); // null | "wizard" | "quiz"
  const [quizStep, setQuizStep] = useState(0);      // 0..(quizFlow.length-1)
  const [quizAnswers, setQuizAnswers] = useState({}); // { trunk: ["career"], career_stage: "sponsored", ... }

  const mainRef = useRef(null);
  const [animateIn, setAnimateIn] = useState(true);
  useEffect(() => {
    setAnimateIn(false);
    requestAnimationFrame(() => setAnimateIn(true));
    window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  }, [step, comparing, view, entryMode, quizStep]);

  /* ---------- Hero slideshow ----------
     Rotates HERO_IMAGES every HERO_ROTATE_MS. Pauses when:
     - The user is hovering the hero band (heroPaused = true)
     - The browser tab is hidden (saves CPU and avoids racing animations)
     - The user prefers reduced motion (effect never starts the interval)
     A manual indicator row lets users jump to any slide directly; clicking
     also resets the auto-rotate clock so the chosen image gets a full cycle.
     Only runs when the user is actually on the intro fork. */
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  useEffect(() => {
    if (entryMode !== null || view !== "wizard") return;
    if (heroPaused) return;
    if (typeof window !== "undefined") {
      const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) return;
    }
    const id = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      setHeroIndex(i => (i + 1) % HERO_IMAGES.length);
    }, HERO_ROTATE_MS);
    return () => clearInterval(id);
  }, [entryMode, view, heroPaused, heroIndex]);

  /* ---------- Shortlist helpers ---------- */
  const toggleShortlist = (code) => {
    setShortlist(prev => {
      if (prev.includes(code)) return prev.filter(c => c !== code);
      if (prev.length >= 3) return prev;
      return [...prev, code];
    });
  };
  const clearShortlist = () => { setShortlist([]); setComparing(false); };

  /* ---------- Priority budget helpers ----------
     Decreases are always allowed (they refund points). Increases are clamped to
     whatever fits in the remaining budget so users can't max everything to 5. */
  const setWeight = (id, newVal) => {
    const proposed = { ...weights, [id]: newVal };
    if (computeNetSpent(proposed) <= PRIORITY_BONUS_POOL) {
      setWeights(proposed);
      return;
    }
    // Increase would blow the budget. Clamp to the highest legal value for this slider.
    const otherSpent = computeNetSpent(weights) - (weights[id] - PRIORITY_BASELINE);
    const maxLegal = PRIORITY_BASELINE + (PRIORITY_BONUS_POOL - otherSpent);
    setWeights({ ...weights, [id]: Math.max(0, Math.min(5, maxLegal)) });
  };
  const netSpent = computeNetSpent(weights);
  const refunded = PRIORITIES.reduce((s, p) => s + Math.max(0, PRIORITY_BASELINE - weights[p.id]), 0);
  const totalAvailable = PRIORITY_BONUS_POOL + refunded;
  const totalUsed = PRIORITIES.reduce((s, p) => s + Math.max(0, weights[p.id] - PRIORITY_BASELINE), 0);
  const pointsRemaining = PRIORITY_BONUS_POOL - netSpent;

  /* ---------- Quiz helpers ----------
     Multi-select trunk hybrid: trunk → (only if exactly one trunk picked) 2
     branched eligibility → 5 universal value trade-offs. Each value trade-off
     bumps one priority by +1 (5 questions × +1 = exactly the PRIORITY_BONUS_POOL
     of 5) regardless of how many trunks were picked. Multi-trunk skips branched
     eligibility because those questions are per-visa-type (e.g., "where are you
     in your job search?" is incoherent for someone who picked Career *and*
     Retirement). On finish, all answers fold into the wizard's existing state
     (selectedVisas, profile, weights) and the user lands on the existing Step 3
     results. From there, "Refine with sliders" jumps to Step 2 with everything
     pre-filled. */

  // Trunk selections are an array. We tolerate the legacy string shape from any
  // mid-flight state for safety, but everything written by the new handler is an
  // array.
  const trunkAnswers = Array.isArray(quizAnswers.trunk)
    ? quizAnswers.trunk
    : (quizAnswers.trunk ? [quizAnswers.trunk] : []);
  const singleTrunkId = trunkAnswers.length === 1 ? trunkAnswers[0] : null;
  const activeBranch = singleTrunkId ? QUIZ.branches[singleTrunkId] : null;

  // Build the live question flow. After the trunk, branched eligibility runs
  // only when the user has picked exactly one trunk option; multi-trunk users
  // skip straight to the value trade-offs.
  const quizFlow = [{ kind: "trunk", q: QUIZ.trunk }];
  if (activeBranch) {
    activeBranch.forEach(q => quizFlow.push({ kind: "branch", q }));
  }
  QUIZ.values.forEach(q => quizFlow.push({ kind: "values", q }));

  const quizTotalQuestions = quizFlow.length; // 8 for single-trunk, 6 for multi
  const getQuizQuestion = () => quizFlow[quizStep] || null;

  // Apply all quiz answers to wizard state, then route to Step 3 results.
  // Trunk options can carry { visa } or { profile }; branched options can carry
  // { visa } (override) or { profile }; values options carry { weight } and
  // optionally { profile }.
  const finishQuiz = (answers) => {
    const newProfile = { ...profile };
    const newWeights = Object.fromEntries(
      PRIORITIES.map(p => [p.id, PRIORITY_BASELINE])
    );
    let newSelectedVisas = [];

    const trunkIds = Array.isArray(answers.trunk)
      ? answers.trunk
      : (answers.trunk ? [answers.trunk] : []);
    const trunkOpts = trunkIds
      .map(id => QUIZ.trunk.options.find(o => o.id === id))
      .filter(Boolean);

    if (trunkOpts.length === 1) {
      // Single-trunk path: preserve the original override semantics. The trunk
      // sets the visa; a branched answer (e.g. Career → "preseek") may override
      // it (e.g. bluecard → jobseeker).
      const trunkOpt = trunkOpts[0];
      let v = trunkOpt.visa || null;
      if (trunkOpt.profile) Object.assign(newProfile, trunkOpt.profile);
      const branch = QUIZ.branches[trunkOpt.id];
      if (branch) {
        branch.forEach(q => {
          const opt = q.options.find(o => o.id === answers[q.id]);
          if (!opt) return;
          if (opt.visa) v = opt.visa;
          if (opt.profile) Object.assign(newProfile, opt.profile);
        });
      }
      if (v) newSelectedVisas = [v];
    } else if (trunkOpts.length > 1) {
      // Multi-trunk path: collect every trunk's visa and merge profile fields;
      // branches were skipped, so no overrides to apply.
      trunkOpts.forEach(opt => {
        if (opt.visa && !newSelectedVisas.includes(opt.visa)) {
          newSelectedVisas.push(opt.visa);
        }
        if (opt.profile) Object.assign(newProfile, opt.profile);
      });
    }
    // (trunkOpts.length === 0 shouldn't happen — Continue is gated on ≥1 — but
    // we leave newSelectedVisas as [] which means "show every pathway".)

    QUIZ.values.forEach(q => {
      const opt = q.options.find(o => o.id === answers[q.id]);
      if (!opt) return;
      if (opt.profile) Object.assign(newProfile, opt.profile);
      if (opt.weight) {
        newWeights[opt.weight] = Math.min(5, (newWeights[opt.weight] || PRIORITY_BASELINE) + 1);
      }
    });

    setSelectedVisas(newSelectedVisas);
    setProfile(newProfile);
    setWeights(newWeights);
    setEntryMode("wizard"); // hand off to the existing wizard rendering
    setStep(3);
  };

  // Toggle a trunk option in/out of the selection. Used by the multi-select
  // trunk question — does NOT auto-advance the quiz.
  const toggleTrunkOption = (optionId) => {
    const current = trunkAnswers;
    const next = current.includes(optionId)
      ? current.filter(id => id !== optionId)
      : [...current, optionId];
    setQuizAnswers({ ...quizAnswers, trunk: next });
  };

  // Advance from the trunk question once the user has picked at least one
  // option and tapped Continue.
  const advanceFromTrunk = () => {
    if (trunkAnswers.length === 0) return;
    setQuizStep(1);
  };

  // Single-select handler for branched + values questions. Auto-advances or
  // finishes the quiz on the last question.
  const handleQuizAnswer = (questionId, optionId) => {
    const newAnswers = { ...quizAnswers, [questionId]: optionId };
    setQuizAnswers(newAnswers);
    if (quizStep === quizTotalQuestions - 1) {
      finishQuiz(newAnswers);
    } else {
      setQuizStep(quizStep + 1);
    }
  };

  const goBackQuiz = () => {
    if (quizStep === 0) {
      setEntryMode(null); // back to the intro fork
    } else {
      setQuizStep(quizStep - 1);
    }
  };

  // "Start over" — full reset to the intro fork. Distinct from the nav-link
  // route to the fork (which preserves any in-progress data so the user can
  // pop back). Start-over also clears shortlists, expanded pathways, and the
  // user's US-state selector on the Why EU page.
  const startOver = () => {
    setEntryMode(null);
    setStep(0);
    setQuizStep(0);
    setQuizAnswers({});
    setSelectedVisas([]);
    setProfile({
      education: "bachelors", income: "60to100", capital: "under50",
      age: 35, yearsExp: 10,
      hasEUFamily: false, canRemote: false, wantsCitizenship: true,
    });
    setWeights(Object.fromEntries(PRIORITIES.map(p => [p.id, PRIORITY_BASELINE])));
    setShortlist([]);
    setComparing(false);
    setExpandedPathways({});
  };

  // Top priorities for the Step 3 summary card. Lists every priority bumped
  // above baseline, capped at 5 to keep the card to one line on most viewports.
  const topPriorities = useMemo(() => {
    return PRIORITIES
      .filter(p => weights[p.id] > PRIORITY_BASELINE)
      .sort((a, b) => weights[b.id] - weights[a.id])
      .slice(0, 5);
  }, [weights]);

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
            if (selectedVisas.length > 0 && !selectedVisas.includes(v.id)) return false;
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

        return {
          country: c,
          score: finalScore,
          rawScore: Math.round(rawScore),
          bonus, penalty,
          availableVisas,
          eligible: availableVisas.length > 0,
          hasAny5,
        };
      })
      .sort((a, b) => {
        if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
        return b.score - a.score;
      });
  }, [step, comparing, view, selectedVisas, profile, weights]);

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
    h2: { fontFamily:'"Fraunces", Georgia, serif', fontSize:36, fontWeight:500, letterSpacing:"-0.02em", margin:"0 0 8px", color:"#0A1F4D", textAlign:"center" },
    lede: { fontSize:16, color:"#4A5578", maxWidth:640, margin:"0 auto 32px", lineHeight:1.55, textAlign:"center" },
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
    visaItem: { background:"#FAF6EE", border:"1px solid #E8DFC9", borderRadius:4, padding:"10px 14px", display:"flex", alignItems:"center", gap:10, fontSize:14, transition:"background .15s ease, border-color .15s ease, transform .15s ease, box-shadow .15s ease" },
    toggle: { display:"flex", alignItems:"center", gap:10, padding:"10px 14px", background:"#fff", border:"1px solid #CEC2A0", borderRadius:4, cursor:"pointer", fontSize:14, fontFamily:"inherit" },
    actionBar: { display:"flex", gap:10, marginTop:20, paddingTop:16, borderTop:"1px solid #EADFC2", flexWrap:"wrap", alignItems:"center" },
    compareBtn: { padding:"10px 16px", background:"transparent", color:"#003399", border:"1px solid #B8C9F5", borderRadius:4, fontSize:13, fontWeight:600, lineHeight:1.3, minHeight:40, cursor:"pointer", fontFamily:"inherit", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8, boxSizing:"border-box", transition:"background .15s ease, border-color .15s ease, color .15s ease, transform .15s ease, box-shadow .15s ease" },
    compareBtnActive: { background:"#FFCC00", borderColor:"#FFCC00", color:"#003399" },
    portalLink: { padding:"10px 16px", background:"transparent", color:"#003399", border:"1px solid #B8C9F5", borderRadius:4, fontSize:13, fontWeight:600, lineHeight:1.3, minHeight:40, cursor:"pointer", fontFamily:"inherit", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8, textDecoration:"none", boxSizing:"border-box", transition:"background .15s ease, border-color .15s ease, color .15s ease, transform .15s ease, box-shadow .15s ease" },
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

  const renderIntro = () => (
    <div style={{ animation: animateIn ? "fadeSlideIn .4s ease" : undefined }}>
      {/* Hero band: full-bleed within the main column. Rotating image with a
          gradient overlay so the white headline + lede stay legible. The two
          choice cards sit on the normal cream background below the hero. */}
      <section
        aria-label="Welcome to Move Me To EU"
        className="hero-band"
        onMouseEnter={() => setHeroPaused(true)}
        onMouseLeave={() => setHeroPaused(false)}
        onFocus={() => setHeroPaused(true)}
        onBlur={() => setHeroPaused(false)}
        style={{
          position: "relative",
          width: "100%",
          minHeight: 480,
          marginBottom: 32,
          borderRadius: 4,
          overflow: "hidden",
          background: "#0A1F4D", // fallback if images fail to load
          isolation: "isolate",
        }}>
        {/* Image stack — all four <img> elements rendered, opacity-toggled.
            The non-active images stay loaded so transitions are instant. */}
        {HERO_IMAGES.map((img, i) => (
          <img
            key={img.src}
            src={img.src}
            alt={i === heroIndex ? img.alt : ""}
            aria-hidden={i === heroIndex ? undefined : "true"}
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              opacity: i === heroIndex ? 1 : 0,
              transition: "opacity .8s ease",
              zIndex: 1,
            }}
          />
        ))}

        {/* Gradient overlay — darker at the top to ensure white text contrast */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            background: "linear-gradient(180deg, rgba(10,31,77,0.65) 0%, rgba(10,31,77,0.35) 50%, rgba(10,31,77,0.55) 100%)",
          }}
        />

        {/* Headline + lede content overlay */}
        <div
          className="hero-content"
          style={{
            position: "relative",
            zIndex: 3,
            padding: "60px 28px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 480,
            textAlign: "center",
          }}>
          <h2 style={{
            ...S.h2,
            color: "#fff",
            margin: "0 0 12px",
            textShadow: "0 2px 16px rgba(0,0,0,0.35)",
            maxWidth: 720,
          }}>
            Find your match
          </h2>
          <p style={{
            ...S.lede,
            color: "#FAF6EE",
            margin: "0 auto 0",
            textShadow: "0 1px 8px rgba(0,0,0,0.4)",
          }}>
            Two ways to discover the EU countries that fit your situation. Both
            produce the same kind of ranked list — pick whichever feels right.
          </p>
        </div>

        {/* Slide indicators — clickable, keyboard-accessible, sit above the
            gradient. Spacebar / Enter activate via the native button role. */}
        <div
          role="tablist"
          aria-label="Hero image slide selector"
          style={{
            position: "absolute",
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 4,
            display: "flex",
            gap: 8,
            padding: "6px 10px",
            background: "rgba(10,31,77,0.4)",
            borderRadius: 999,
            backdropFilter: "blur(4px)",
          }}>
          {HERO_IMAGES.map((img, i) => (
            <button
              key={`dot-${img.src}`}
              type="button"
              role="tab"
              aria-selected={i === heroIndex}
              aria-label={`Show slide ${i + 1} of ${HERO_IMAGES.length}: ${img.alt}`}
              onClick={() => setHeroIndex(i)}
              style={{
                width: 10,
                height: 10,
                padding: 0,
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.7)",
                background: i === heroIndex ? "#FFCC00" : "rgba(255,255,255,0.25)",
                cursor: "pointer",
                transition: "background .2s ease, transform .15s ease",
                transform: i === heroIndex ? "scale(1.15)" : "scale(1)",
              }}
            />
          ))}
        </div>
      </section>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: 20,
        maxWidth: 880,
        margin: "0 auto",
      }}>
        {/* Quiz card — listed first; better fit for first-time relocators */}
        <button
          type="button"
          onClick={() => { setEntryMode("quiz"); setQuizStep(0); setQuizAnswers({}); }}
          style={{
            ...S.card,
            padding: "32px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
          aria-label="Take the interactive quiz — about 2 minutes">
          <span style={{ ...S.icon, fontSize: 28 }} aria-hidden="true">◇</span>
          <div style={{ ...S.cardTitle, fontSize: 24 }}>Take the quiz</div>
          <p style={{ ...S.cardDesc, marginBottom: 8 }}>
            Answer 8 quick questions and we'll match you to countries based on
            your situation and what you value. No need to know visa types in
            advance.
          </p>
          <div style={{
            marginTop: "auto",
            paddingTop: 12,
            fontSize: 12,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#003399",
            fontWeight: 700,
          }}>
            About 2 minutes →
          </div>
        </button>

        {/* Wizard card — for users who already know what they want */}
        <button
          type="button"
          onClick={() => { setEntryMode("wizard"); setStep(0); }}
          style={{
            ...S.card,
            padding: "32px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
          aria-label="Use the detailed wizard — about 4 to 5 minutes">
          <span style={{ ...S.icon, fontSize: 28 }} aria-hidden="true">◆</span>
          <div style={{ ...S.cardTitle, fontSize: 24 }}>Use the detailed wizard</div>
          <p style={{ ...S.cardDesc, marginBottom: 8 }}>
            Pick a visa pathway, fill in your eligibility, and dial in priority
            sliders yourself. Best if you already know roughly what you want.
          </p>
          <div style={{
            marginTop: "auto",
            paddingTop: 12,
            fontSize: 12,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#003399",
            fontWeight: 700,
          }}>
            About 4–5 minutes →
          </div>
        </button>
      </div>

      {/* Why EU? promoted banner — three-stat preview to surface the comparison
          data more prominently than a one-liner can. Stats are computed at
          module scope from the same QOL/ROAD_DEATHS/EU_CRIME data the Why EU
          page uses, so they stay in sync if the underlying data updates.
          Sits below the two choice cards as a clear secondary action. */}
      {(() => {
        const usQolRank = QOL.US?.overallRank ?? 23;
        const euQolEntries = Object.entries(QOL)
          .filter(([k, v]) => k !== "US" && v.overallRank != null);
        const euQolBetter = euQolEntries.filter(([, v]) => v.overallRank < usQolRank).length;
        const euQolTotal = euQolEntries.length;
        const colValues = Object.values(COL_PLUS_RENT);
        const colEuAvg = colValues.reduce((s, x) => s + x, 0) / colValues.length;
        const colGap = Math.round(((US_COL_PLUS_RENT - colEuAvg) / US_COL_PLUS_RENT) * 100);
        const roadEuValues = Object.values(ROAD_DEATHS);
        const roadEuAvg = roadEuValues.reduce((s, x) => s + x, 0) / roadEuValues.length;
        const roadGap = Math.round(((US_ROAD_DEATHS - roadEuAvg) / US_ROAD_DEATHS) * 100);
        const euHomicideValues = Object.values(EU_CRIME)
          .filter(c => c.homicide != null)
          .map(c => c.homicide);
        const euHomicideAvg = euHomicideValues.reduce((s, x) => s + x, 0) / euHomicideValues.length;
        const homicideGap = Math.round(((US_HOMICIDE_AVG - euHomicideAvg) / US_HOMICIDE_AVG) * 100);

        return (
          <section
            aria-labelledby="why-eu-banner-h"
            style={{
              marginTop: 32,
              background: "#fff",
              border: "1px solid #E8DFC9",
              borderLeft: "4px solid #FFCC00",
              borderRadius: 4,
              padding: "28px 32px",
              maxWidth: 880,
              marginLeft: "auto",
              marginRight: "auto",
            }}>
            <div style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
              marginBottom: 20,
            }}>
              <div style={{ flex: "1 1 320px", minWidth: 0 }}>
                <div style={{
                  fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase",
                  color: "#7A5C00", fontWeight: 700, marginBottom: 6,
                }}>
                  Why EU?
                </div>
                <h3 id="why-eu-banner-h" style={{
                  fontFamily: '"Fraunces", Georgia, serif',
                  fontSize: 22, fontWeight: 600, color: "#0A1F4D",
                  margin: 0, lineHeight: 1.25,
                }}>
                  How does the US actually compare? Here's the data.
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setView("whyEU")}
                className="cta-outline"
                style={{ ...S.compareBtn, whiteSpace: "nowrap", alignSelf: "center" }}>
                See the full comparison →
              </button>
            </div>

            {/* Three-stat row. Each stat: serif number, label, descriptor.
                Thin dividers between columns on desktop; stack on mobile. */}
            <div
              role="group"
              aria-label="Quick US-vs-EU statistics"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 0,
                borderTop: "1px solid #EADFC2",
                paddingTop: 16,
              }}>
              <div className="why-eu-stat" style={{ padding: "4px 16px 4px 0", borderRight: "1px solid #EADFC2" }}>
                <div style={{
                  fontFamily: '"Fraunces", Georgia, serif',
                  fontSize: 32, fontWeight: 500, color: "#003399", lineHeight: 1,
                }}>
                  {euQolBetter}<span style={{ fontSize: 18, color: "#4A5578" }}>/{euQolTotal}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0A1F4D", marginTop: 6 }}>
                  EU nations rank higher than the US
                </div>
                <div style={{ fontSize: 12, color: "#4A5578", marginTop: 2, lineHeight: 1.4 }}>
                  Overall quality of life, across six global indices
                </div>
              </div>
              <div className="why-eu-stat" style={{ padding: "4px 16px", borderRight: "1px solid #EADFC2" }}>
                <div style={{
                  fontFamily: '"Fraunces", Georgia, serif',
                  fontSize: 32, fontWeight: 500, color: "#1F5D1F", lineHeight: 1,
                }}>
                  {colGap}%
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0A1F4D", marginTop: 6 }}>
                  Lower cost of living vs. US
                </div>
                <div style={{ fontSize: 12, color: "#4A5578", marginTop: 2, lineHeight: 1.4 }}>
                  EU 27 average, including rent (Numbeo 2025)
                </div>
              </div>
              <div className="why-eu-stat" style={{ padding: "4px 16px", borderRight: "1px solid #EADFC2" }}>
                <div style={{
                  fontFamily: '"Fraunces", Georgia, serif',
                  fontSize: 32, fontWeight: 500, color: "#1F5D1F", lineHeight: 1,
                }}>
                  {roadGap}%
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0A1F4D", marginTop: 6 }}>
                  Fewer road deaths vs. US
                </div>
                <div style={{ fontSize: 12, color: "#4A5578", marginTop: 2, lineHeight: 1.4 }}>
                  Per capita, EU average vs. US
                </div>
              </div>
              <div className="why-eu-stat" style={{ padding: "4px 0 4px 16px" }}>
                <div style={{
                  fontFamily: '"Fraunces", Georgia, serif',
                  fontSize: 32, fontWeight: 500, color: "#1F5D1F", lineHeight: 1,
                }}>
                  {homicideGap}%
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0A1F4D", marginTop: 6 }}>
                  Lower homicide rate vs. US
                </div>
                <div style={{ fontSize: 12, color: "#4A5578", marginTop: 2, lineHeight: 1.4 }}>
                  Per capita, EU average vs. US
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* Contact line — sits below the Why EU? banner so it's the last thing
          on the intro page before the footer. Quieter visual treatment than
          the banner above so it doesn't compete; more visible than the
          footer alone because Justin specifically wanted a hero-page touch. */}
      <div style={{
        marginTop: 24,
        maxWidth: 880,
        marginLeft: "auto",
        marginRight: "auto",
        textAlign: "center",
        fontSize: 14,
        color: "#4A5578",
        padding: "16px 20px 4px",
        lineHeight: 1.5,
      }}>
        Want personalized help to answer your questions? Email{" "}
        <a href="mailto:info@movemeto.eu" style={{ color:"#003399", fontWeight:600 }}>info@movemeto.eu</a>.
      </div>
    </div>
  );

  const renderQuiz = () => {
    const current = getQuizQuestion();
    if (!current) return null;
    const { kind, q } = current;
    const isTrunk = kind === "trunk";
    const questionNumber = quizStep + 1;
    const totalQuestions = quizTotalQuestions;
    const progressPct = Math.round((questionNumber / totalQuestions) * 100);

    // For the trunk question we render multi-select toggle behavior; everything
    // else is single-select with auto-advance.
    const trunkSelected = isTrunk ? trunkAnswers : null;
    const currentAnswer = isTrunk ? null : quizAnswers[q.id];
    const isOptionSelected = (opt) => isTrunk
      ? trunkSelected.includes(opt.id)
      : currentAnswer === opt.id;
    const onOptionClick = (opt) => isTrunk
      ? toggleTrunkOption(opt.id)
      : handleQuizAnswer(q.id, opt.id);

    const trunkCount = trunkSelected ? trunkSelected.length : 0;

    return (
      <div style={{ animation: animateIn ? "fadeSlideIn .4s ease" : undefined }}>
        {/* Progress header */}
        <div style={{ marginBottom: 28, maxWidth: 760, margin: "0 auto 28px" }}>
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "baseline",
            gap: 12, flexWrap: "wrap", marginBottom: 8,
          }}>
            <div style={{
              fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase",
              color: "#4A5578", fontWeight: 700,
            }}>
              Question {questionNumber} of {totalQuestions}
            </div>
            <button
              type="button"
              onClick={() => setEntryMode(null)}
              style={{
                background: "transparent", border: "none", color: "#4A5578",
                fontSize: 13, cursor: "pointer", textDecoration: "underline",
                fontFamily: "inherit", padding: 0,
              }}>
              Switch to detailed wizard
            </button>
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={totalQuestions}
            aria-valuenow={questionNumber}
            aria-valuetext={`Question ${questionNumber} of ${totalQuestions}`}
            style={{ height: 6, background: "#EADFC2", borderRadius: 999, overflow: "hidden" }}>
            <div style={{
              width: `${progressPct}%`,
              height: "100%",
              background: "#003399",
              transition: "width .25s ease",
            }} />
          </div>
        </div>

        <h2 style={S.h2}>{q.title}</h2>
        {q.desc && <p style={S.lede}>{q.desc}</p>}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 14,
            maxWidth: 760,
            margin: "0 auto",
          }}
          role="group"
          aria-label={isTrunk ? `${q.title} — select all that apply` : q.title}>
          {q.options.map(opt => {
            const selected = isOptionSelected(opt);
            return (
              <button
                key={opt.id}
                type="button"
                aria-pressed={selected}
                onClick={() => onOptionClick(opt)}
                style={{
                  ...S.card,
                  ...(selected ? S.cardActive : {}),
                  padding: "18px 20px",
                  fontSize: 15,
                  lineHeight: 1.45,
                  fontWeight: 500,
                }}>
                {opt.label}
              </button>
            );
          })}
        </div>

        <div style={{ ...S.nav, maxWidth: 760, margin: "32px auto 0" }}>
          <button type="button" style={S.btnGhost} onClick={goBackQuiz}>
            ← {quizStep === 0 ? "Back to start" : "Back"}
          </button>
          {isTrunk ? (
            <button
              type="button"
              style={{
                ...S.btn,
                opacity: trunkCount === 0 ? 0.4 : 1,
                cursor: trunkCount === 0 ? "not-allowed" : "pointer",
              }}
              onClick={advanceFromTrunk}
              disabled={trunkCount === 0}
              aria-label={
                trunkCount === 0
                  ? "Continue — pick at least one reason first"
                  : trunkCount === 1
                    ? "Continue with 1 reason selected"
                    : `Continue with ${trunkCount} reasons selected`
              }>
              Continue →{trunkCount > 0 ? ` (${trunkCount})` : ""}
            </button>
          ) : (
            <span style={{ fontSize: 13, color: "#4A5578", alignSelf: "center" }}>
              Tap an answer to continue
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderStep0 = () => (
    <div style={{ animation: animateIn ? "fadeSlideIn .4s ease" : undefined }}>
      <div style={{ marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => setEntryMode(null)}
          style={{
            background: "transparent", border: "none", color: "#4A5578",
            fontSize: 13, cursor: "pointer", textDecoration: "underline",
            fontFamily: "inherit", padding: 0,
          }}>
          ← Back to start
        </button>
      </div>
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
          className="cta-outline"
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
        <button type="button" aria-pressed={selectedVisas.length === 0}
          style={{ ...S.card, ...(selectedVisas.length === 0 ? S.cardActive : {}) }}
          onClick={() => setSelectedVisas([])}>
          <span style={S.icon} aria-hidden="true">∞</span>
          <div style={S.cardTitle}>Show me everything</div>
          <div style={S.cardDesc}>I'm open to any pathway — show which ones fit my profile.</div>
        </button>
        {VISAS.map(v => {
          const isSelected = selectedVisas.length === 1 && selectedVisas[0] === v.id;
          return (
            <button key={v.id} type="button" aria-pressed={isSelected}
              style={{ ...S.card, ...(isSelected ? S.cardActive : {}) }}
              onClick={() => setSelectedVisas([v.id])}>
              <span style={S.icon} aria-hidden="true">{v.icon}</span>
              <div style={S.cardTitle}>{v.label}</div>
              <div style={S.cardDesc}>{v.desc}</div>
            </button>
          );
        })}
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

  const renderStep2 = () => {
    const budgetPct = totalAvailable > 0
      ? Math.min(100, Math.round((totalUsed / totalAvailable) * 100))
      : 0;
    const remainingLabel = pointsRemaining === 1 ? "1 point" : `${pointsRemaining} points`;
    return (
    <div style={{ animation: animateIn ? "fadeSlideIn .4s ease" : undefined }}>
      <h2 style={S.h2}>What matters most?</h2>
      <p style={S.lede}>
        Every factor starts at <strong>3 (moderate)</strong>. You have{" "}
        <strong>{PRIORITY_BONUS_POOL} extra points</strong> to bump factors that
        matter most up to 5. Lowering a factor below 3 refunds points back into
        the pool — so you can drop something to 1 or 0 to push another higher.
        The point is to make tradeoffs, not max everything.
      </p>

      <div
        style={{
          background:"#fff", border:"1px solid #E8DFC9", borderRadius:4,
          padding:"16px 20px", marginBottom:24,
        }}
        aria-live="polite"
      >
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", flexWrap:"wrap", gap:8 }}>
          <div style={{ fontSize:13, letterSpacing:"0.08em", textTransform:"uppercase", color:"#4A5578", fontWeight:700 }}>
            Priority budget
          </div>
          <div style={{ fontSize:14, color:"#0A1F4D" }}>
            <strong style={{ color: pointsRemaining === 0 ? "#8C1F1F" : "#003399", fontSize:16 }}>
              {remainingLabel}
            </strong>{" "}
            remaining
            <span style={{ color:"#4A5578" }}> · {totalUsed} of {totalAvailable} used</span>
          </div>
        </div>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={totalAvailable}
          aria-valuenow={totalUsed}
          aria-valuetext={`${totalUsed} of ${totalAvailable} extra points used`}
          style={{
            marginTop:10, height:8, background:"#EADFC2", borderRadius:999, overflow:"hidden",
          }}
        >
          <div style={{
            width:`${budgetPct}%`, height:"100%",
            background: pointsRemaining === 0 ? "#FFCC00" : "#003399",
            transition:"width .18s ease, background .18s ease",
          }} />
        </div>
        {refunded > 0 && (
          <div style={{ marginTop:8, fontSize:12, color:"#4A5578" }}>
            +{refunded} freed by lowering {refunded === 1 ? "a factor" : "factors"} below 3.
          </div>
        )}
      </div>

      <div role="group" aria-label="Priorities">
        {PRIORITIES.map(p => {
          const w = weights[p.id];
          const weightValueText = ["not important (excluded from scoring)","minor","moderate","important","very important","critical"][w];
          const otherSpent = netSpent - (w - PRIORITY_BASELINE);
          const maxAllowed = Math.max(0, Math.min(5, PRIORITY_BASELINE + (PRIORITY_BONUS_POOL - otherSpent)));
          const atCap = w === maxAllowed && w < 5;
          const chipStyle = w === 0
            ? S.chipRed
            : w >= 4
              ? S.chipGold
              : w >= PRIORITY_BASELINE
                ? S.chipBlue
                : { background:"#F5EFD9", color:"#7A5C00", border:"1px solid #E8DFC9" };
          return (
          <div key={p.id} style={S.sliderRow}>
            <div>
              <div style={S.priName}>{p.label}</div>
              <div style={S.priDesc}>{p.desc}</div>
              <div style={{ marginTop:10, display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
                <label htmlFor={`w-${p.id}`} style={{ fontSize:12, color:"#4A5578" }}>
                  Importance: <strong style={{ color:"#003399" }}>{w}</strong>
                  <span style={{ color:"#4A5578" }}> / 5</span>
                </label>
                <input id={`w-${p.id}`} type="range" min={0} max={5}
                  value={w}
                  onChange={e => setWeight(p.id, +e.target.value)}
                  style={{ flex:1, maxWidth:220 }}
                  aria-label={`Importance of ${p.label} on a scale from 0 to 5`}
                  aria-valuetext={`${w} of 5 — ${weightValueText}${atCap ? `; capped by remaining priority budget` : ""}`} />
                {atCap && (
                  <span style={{ fontSize:11, color:"#7A5C00" }} aria-hidden="true">
                    budget cap — lower another factor to raise this
                  </span>
                )}
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <span style={{ ...S.chip, ...chipStyle }} aria-hidden="true">weight {w}</span>
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
  };

  const renderResultRow = (r) => {
    const isShortlisted = shortlist.includes(r.country.code);
    const canAdd = shortlist.length < 3 || isShortlisted;
    const portal = PORTALS[r.country.code];
    return (
      <article key={r.country.code} style={S.resultRow} aria-label={r.country.name}>
        <header style={S.resultHead}>
          <div>
            <div style={S.resultTitle}>
              <Flag code={r.country.code} size={32} />
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
            Available pathways ({r.availableVisas.length}) — click for details
          </div>
          <div style={S.visaList}>
            {r.availableVisas.map(v => {
              const key = `${r.country.code}:${v.id}`;
              const isExpanded = !!expandedPathways[key];
              return (
                <button
                  key={v.id}
                  type="button"
                  className={isExpanded ? "pathway-pill is-expanded" : "pathway-pill"}
                  onClick={() => setExpandedPathways(prev => ({ ...prev, [key]: !prev[key] }))}
                  aria-expanded={isExpanded}
                  aria-controls={`details-${key}`}
                  style={{
                    ...S.visaItem,
                    cursor:"pointer",
                    border: isExpanded ? "1px solid #003399" : "1px solid #E8DFC9",
                    background: isExpanded ? "#E4ECFF" : "#FAF6EE",
                    justifyContent:"space-between",
                    textAlign:"left",
                    fontFamily:"inherit",
                    color:"inherit",
                    width:"100%",
                  }}>
                  <span style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ color:"#FFCC00", fontSize:18 }} aria-hidden="true">{v.icon}</span>
                    <span>{v.label}</span>
                  </span>
                  <span style={{ fontSize:14, color:"#4A5578", fontWeight:600 }} aria-hidden="true">
                    {isExpanded ? "−" : "+"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Expanded detail panels — render after the grid so they span full width */}
          {r.availableVisas.map(v => {
            const key = `${r.country.code}:${v.id}`;
            if (!expandedPathways[key]) return null;
            const details = getVisaDetails(r.country.code, v.id);
            const hasCountrySpecific = !!VISA_DETAILS[r.country.code]?.[v.id];
            const portal = PORTALS[r.country.code];
            if (!details) return null;
            return (
              <div
                key={`panel-${key}`}
                id={`details-${key}`}
                role="region"
                aria-label={`${v.label} details for ${r.country.name}`}
                style={{
                  marginTop:16, padding:"18px 22px",
                  background:"#fff", border:"1px solid #003399", borderLeft:"4px solid #003399",
                  borderRadius:4,
                }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12, flexWrap:"wrap" }}>
                  <span style={{ color:"#FFCC00", fontSize:22 }} aria-hidden="true">{v.icon}</span>
                  <h4 style={{ fontFamily:'"Fraunces", Georgia, serif', fontSize:20, fontWeight:600, color:"#0A1F4D", margin:0 }}>
                    {v.label} — {r.country.name}
                  </h4>
                  {!hasCountrySpecific && (
                    <span style={{ ...S.chip, ...S.chipGold, fontSize:10 }}
                      title="Details below are general guidance for this visa type. Verify specifics at the official portal.">
                      General guidance
                    </span>
                  )}
                </div>
                <p style={{ fontSize:14, color:"#4A5578", margin:"0 0 16px", lineHeight:1.5 }}>{v.desc}</p>

                <dl style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))", gap:"16px 24px", margin:0 }}>
                  {[
                    { label:"Income / investment threshold", key:"income" },
                    { label:"Required documents", key:"documents" },
                    { label:"Processing time", key:"processing" },
                    { label:"Duration & renewal", key:"duration" },
                    { label:"Path to permanent residence", key:"pathToPR" },
                    { label:"Family member eligibility", key:"family" },
                  ].map(field => details[field.key] && (
                    <div key={field.key} style={{ margin:0 }}>
                      <dt style={{ fontSize:11, letterSpacing:"0.1em", textTransform:"uppercase", color:"#4A5578", fontWeight:700, marginBottom:4 }}>
                        {field.label}
                      </dt>
                      <dd style={{ fontSize:14, lineHeight:1.55, color:"#0A1F4D", margin:0 }}>
                        {details[field.key]}
                      </dd>
                    </div>
                  ))}
                </dl>

                {portal && (
                  <div style={{ marginTop:16, paddingTop:14, borderTop:"1px solid #EADFC2", display:"flex", flexWrap:"wrap", gap:10, alignItems:"center" }}>
                    <span style={{ fontSize:12, color:"#4A5578" }}>
                      Verify current details at:
                    </span>
                    <a href={portal.url} target="_blank" rel="noopener noreferrer"
                      className="cta-outline"
                      style={{ ...S.portalLink, padding:"8px 14px", fontSize:13, minHeight:32 }}
                      aria-label={`Open official immigration portal for ${r.country.name} in a new tab`}>
                      <span aria-hidden="true">↗</span> {portal.agency}
                    </a>
                  </div>
                )}
                <p style={{ fontSize:11, color:"#4A5578", fontStyle:"italic", marginTop:12, marginBottom:0 }}>
                  Data current as of early 2026. Immigration rules change frequently — always verify at the official portal before acting.
                </p>
              </div>
            );
          })}
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
            className={isShortlisted ? "cta-outline is-active" : "cta-outline"}
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
              className="cta-outline"
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
          {eligible.length} of 27 EU member states fit your profile and {selectedVisas.length > 1 ? "pathways" : "pathway"}
          {selectedVisas.length === 1
            ? ` (${VISAS.find(v => v.id === selectedVisas[0])?.label})`
            : selectedVisas.length > 1
              ? ` (${selectedVisas.map(id => VISAS.find(v => v.id === id)?.label).filter(Boolean).join(", ")})`
              : ""}.
          Ranked by how well each scores against your priorities. Add up to 3 to compare side by side.
        </p>
        <span id="max-shortlist-notice" className="sr-only">
          You have reached the maximum of 3 countries in your comparison shortlist. Remove one to add another.
        </span>

        {/* Priority summary card. Shows whenever any priority is bumped above
            baseline (so this lights up for both quiz finishers and wizard users
            who actually customized Step 2). The "Refine with sliders" CTA jumps
            to Step 2 with weights and profile already set. */}
        {topPriorities.length > 0 && (
          <div style={{
            background: "#FFFBEB",
            border: "1px solid #FFCC00",
            borderLeft: "4px solid #FFCC00",
            borderRadius: 4,
            padding: "16px 20px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}>
            <div style={{ fontSize: 14, color: "#0A1F4D", lineHeight: 1.5 }}>
              <span style={{
                display: "inline-block", marginRight: 8,
                fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase",
                color: "#7A5C00", fontWeight: 700,
              }}>
                Your priorities
              </span>
              {topPriorities.map((p, i) => (
                <span key={p.id}>
                  {i > 0 && <span style={{ color: "#7A5C00", margin: "0 6px" }}>·</span>}
                  <strong>{p.label}</strong>
                </span>
              ))}
            </div>
            <button
              type="button"
              className="cta-outline"
              style={{ ...S.compareBtn, whiteSpace: "nowrap" }}
              onClick={() => setStep(2)}
              aria-label="Refine your priorities with the slider view">
              Refine with sliders →
            </button>
          </div>
        )}

        {/* How scoring works — collapsed by default. Mirrors the Why EU page's
            methodology disclosure pattern: opt-in transparency about the
            bonus/penalty layer that produces the "+X strong fit" / "−X weak fit"
            chips next to each country's score. */}
        <details style={{ marginBottom:24, fontSize:13, color:"#4A5578" }}>
          <summary style={{ cursor:"pointer", fontWeight:600 }}>How is this scored?</summary>
          <div style={{ marginTop:12, lineHeight:1.6 }}>
            <p style={{ marginBottom:8 }}>
              <strong>Priority match.</strong> Each country gets a weighted average of how well it matches
              your 13 priorities, with priorities you rated higher counting disproportionately more (weight
              squared — so a 5 counts roughly 2.8× more than a 3). This is deliberate; flat averages bunch
              countries into a narrow band that isn't useful for comparing.
            </p>
            <p style={{ marginBottom:8 }}>
              <strong>Bonus and penalty layer.</strong> The raw average is then adjusted for standout matches
              and mismatches on your top-weighted priorities. A country gets <strong>+0.5</strong> for every
              priority you rated 4 where it scores ≥85, and <strong>+1.5</strong> for every priority you rated
              5 where it scores ≥90. Mirror penalties apply: <strong>−1</strong> per weight-4 priority scoring
              ≤40, <strong>−3</strong> per weight-5 priority scoring ≤30. The final score is clamped to 0–100.
            </p>
            <p style={{ margin:0 }}>
              <strong>The "+X strong fit" / "−X weak fit" chips</strong> next to each country's score surface
              this adjustment when it reaches <strong>±2 or more</strong>, so you can see why a country jumped
              above or fell below its raw average. Smaller adjustments stay hidden to keep the page uncluttered.
            </p>
          </div>
        </details>

        {/* Contact banner — sits at the top of Step 3 (after the gold priority
            summary, before the matches list) so users see the offer of help
            before diving into the data. EU-blue left border distinguishes it
            from the gold priorities card above. */}
        <div style={{
          background: "#fff",
          border: "1px solid #E8DFC9",
          borderLeft: "4px solid #003399",
          borderRadius: 4,
          padding: "16px 20px",
          marginBottom: 24,
        }}>
          <p style={{ fontSize: 14, color: "#0A1F4D", lineHeight: 1.5, margin: 0 }}>
            Email <a href="mailto:info@movemeto.eu" style={{ color:"#003399", fontWeight:600 }}>info@movemeto.eu</a>{" "}
            for guidance and support on thinking through what comes next. We read every message.
          </p>
        </div>

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
                    <Flag code={r.country.code} size={22} />
                    <strong>{r.country.name}</strong>
                    {r.availableVisas.length === 0 && (
                      <span style={{ ...S.chip, ...S.chipRed }}>No matching pathway for your profile</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}

        <div style={S.nav}>
          <button type="button" style={S.btnGhost} onClick={startOver}>← Start over</button>
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
                  <Flag code={r.country.code} size={32} />
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

    // Cost of living: US vs EU. Numbeo Cost of Living + Rent Index, NYC = 100.
    // EU 27 each have a value; US is national. Lower = cheaper.
    const colRows = COUNTRIES
      .map(c => ({ country: c, rate: COL_PLUS_RENT[c.code] }))
      .filter(x => x.rate != null)
      .sort((a, b) => a.rate - b.rate);
    const cheapestCol = colRows[0];
    const priciestCol = colRows[colRows.length - 1];
    const colEuAvg = colRows.reduce((s, x) => s + x.rate, 0) / colRows.length;
    const colGapPct = Math.round(((US_COL_PLUS_RENT - colEuAvg) / US_COL_PLUS_RENT) * 100);
    const euCheaperThanUs = colRows.filter(x => x.rate < US_COL_PLUS_RENT).length;
    const maxCol = Math.max(US_COL_PLUS_RENT, ...colRows.map(x => x.rate));

    const Bar = ({ label, rate, highlight, code, max = maxRate, unitLabel = "homicides per 100,000 residents" }) => {
      const pct = (rate / max) * 100;
      return (
        <div style={{ display:"grid", gridTemplateColumns:"minmax(120px, 160px) 1fr 56px", alignItems:"center", gap:12, padding:"4px 0" }}>
          <div style={{ fontSize:13, textAlign:"right", color: highlight ? "#0A1F4D" : "#4A5578", fontWeight: highlight ? 700 : 500 }}>
            {code && <span style={{ marginRight:6, display:"inline-block" }}><Flag code={code} size={18} /></span>}
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
          show up in broad quality of life, cost of living, traffic deaths, and day-to-day safety. Choose your
          US state to see how it compares to the 27 EU member states across all four dimensions.
        </p>

        {/* ================= QUALITY OF LIFE ================= */}
        <section aria-labelledby="qol-h" style={{ marginBottom:48 }}>
          <h3 id="qol-h" style={{ fontFamily:'"Fraunces", Georgia, serif', fontSize:28, fontWeight:500, marginBottom:4, color:"#0A1F4D", textAlign:"center" }}>
            Quality of life: where the US actually ranks
          </h3>
          <p style={{ fontSize:14, color:"#4A5578", marginBottom:24, maxWidth:720, lineHeight:1.55, textAlign:"center", margin:"0 auto 24px" }}>
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
                {[...qolRows, { country:{ code:"US", name:"United States" }, ...usQoL, isUS:true }]
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
                          <span style={{ marginRight:6 }}><Flag code={row.country.code} size={14} /></span>{row.country.name}
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

        {/* ================= COST OF LIVING ================= */}
        <section aria-labelledby="cost-h" style={{ marginBottom:48, paddingTop:32, borderTop:"2px solid #EADFC2" }}>
          <h3 id="cost-h" style={{ fontFamily:'"Fraunces", Georgia, serif', fontSize:28, fontWeight:500, marginBottom:4, color:"#0A1F4D", textAlign:"center" }}>
            Cost of living: how the EU compares
          </h3>
          <p style={{ fontSize:14, color:"#4A5578", marginBottom:24, maxWidth:720, lineHeight:1.55, textAlign:"center", margin:"0 auto 24px" }}>
            On the Numbeo Cost of Living + Rent Index — a normalized measure that combines groceries, dining,
            transport, utilities, and rent — the US scores <strong>{US_COL_PLUS_RENT}</strong>{" "}
            (NYC = 100). The EU 27 average sits at <strong>{colEuAvg.toFixed(1)}</strong>, roughly{" "}
            <strong>{colGapPct}% lower</strong>. Of the 27 EU member states, <strong>{euCheaperThanUs}</strong>{" "}
            cost less to live in than the US.
          </p>

          {/* CoL hero stats */}
          <div style={{
            display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:16, marginBottom:32,
          }}>
            <div style={{ ...S.resultRow, marginBottom:0, borderLeft:"4px solid #8C1F1F" }}>
              <div style={{ ...S.label, marginBottom:8 }}>US cost of living</div>
              <div style={{ fontFamily:'"Fraunces", Georgia, serif', fontSize:44, fontWeight:500, color:"#8C1F1F", lineHeight:1 }}>
                {US_COL_PLUS_RENT}
              </div>
              <div style={{ fontSize:13, color:"#4A5578", marginTop:6 }}>Numbeo CoL + Rent Index, NYC = 100</div>
            </div>
            <div style={{ ...S.resultRow, marginBottom:0, borderLeft:"4px solid #003399" }}>
              <div style={{ ...S.label, marginBottom:8 }}>EU 27 average</div>
              <div style={{ fontFamily:'"Fraunces", Georgia, serif', fontSize:44, fontWeight:500, color:"#003399", lineHeight:1 }}>
                {colEuAvg.toFixed(1)}
              </div>
              <div style={{ fontSize:13, color:"#4A5578", marginTop:6 }}>
                across the 27 EU member states
              </div>
            </div>
            <div style={{ ...S.resultRow, marginBottom:0, borderLeft:"4px solid #FFCC00", background:"#FFFBEB" }}>
              <div style={{ ...S.label, marginBottom:8 }}>The gap</div>
              <div style={{ fontFamily:'"Fraunces", Georgia, serif', fontSize:44, fontWeight:500, color:"#7A5C00", lineHeight:1 }}>
                {colGapPct}%
              </div>
              <div style={{ fontSize:13, color:"#4A5578", marginTop:6 }}>
                EU average lower than the US.{" "}
                <Flag code={cheapestCol.country.code} size={14} /> {cheapestCol.country.name} is the cheapest
                ({cheapestCol.rate.toFixed(1)}).
              </div>
            </div>
          </div>

          {/* CoL bar chart */}
          <div style={{ background:"#fff", border:"1px solid #E8DFC9", borderRadius:4, padding:"20px 24px" }}>
            <Bar
              label="United States"
              rate={US_COL_PLUS_RENT}
              highlight={true}
              code="US"
              max={maxCol}
              unitLabel="cost of living plus rent index, NYC = 100"
            />
            <div style={{ borderBottom:"1px dashed #CEC2A0", margin:"10px 0" }} />
            {colRows.map(x => (
              <Bar
                key={x.country.code}
                label={x.country.name}
                rate={x.rate}
                code={x.country.code}
                max={maxCol}
                unitLabel="cost of living plus rent index, NYC = 100"
              />
            ))}
          </div>
          <p style={{ fontSize:12, color:"#4A5578", marginTop:12, fontStyle:"italic" }}>
            <strong>{euCheaperThanUs} of 27</strong> EU member states cost less to live in than the US;
            only <Flag code={priciestCol.country.code} size={14} /> {priciestCol.country.name}{" "}
            ({priciestCol.rate.toFixed(1)}) edges above the US.{" "}
            Source: Numbeo Cost of Living + Rent Index, 2025 annual snapshot.
          </p>
        </section>

        {/* ================= ROAD TRAFFIC DEATHS ================= */}
        <section aria-labelledby="road-h" style={{ marginBottom:48, paddingTop:32, borderTop:"2px solid #EADFC2" }}>
          <h3 id="road-h" style={{ fontFamily:'"Fraunces", Georgia, serif', fontSize:28, fontWeight:500, marginBottom:4, color:"#0A1F4D", textAlign:"center" }}>
            Road fatalities: another lens on everyday safety
          </h3>
          <p style={{ fontSize:14, color:"#4A5578", marginBottom:24, maxWidth:720, lineHeight:1.55, textAlign:"center", margin:"0 auto 24px" }}>
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
                <Flag code={safestRoad.country.code} size={14} /> {safestRoad.country.name}/
                <Flag code={roadRows[1]?.country.code} size={14} /> {roadRows[1]?.country.name} (safest).
              </div>
            </div>
          </div>

          {/* Road deaths bar chart */}
          <div style={{ background:"#fff", border:"1px solid #E8DFC9", borderRadius:4, padding:"20px 24px" }}>
            <Bar
              label="United States"
              rate={US_ROAD_DEATHS}
              highlight={true}
              code="US"
              max={maxRoad}
              unitLabel="road deaths per 100,000 residents"
            />
            <div style={{ borderBottom:"1px dashed #CEC2A0", margin:"10px 0" }} />
            {roadRows.map(x => (
              <Bar
                key={x.country.code}
                label={x.country.name}
                rate={x.rate}
                code={x.country.code}
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

        {/* ================= PERSONAL SAFETY (HOMICIDE) ================= */}
        <section aria-labelledby="homicide-h" style={{ marginBottom:48, paddingTop:32, borderTop:"2px solid #EADFC2" }}>
        <h3 id="homicide-h" style={{ fontFamily:'"Fraunces", Georgia, serif', fontSize:28, fontWeight:500, marginBottom:4, color:"#0A1F4D", textAlign:"center" }}>
          Personal safety: homicide risk
        </h3>
        <p style={{ fontSize:14, color:"#4A5578", marginBottom:20, maxWidth:720, lineHeight:1.55, textAlign:"center", margin:"0 auto 20px" }}>
          The most directly comparable crime metric across US and EU jurisdictions is the intentional homicide
          rate. Here's how {userState} stacks up.
        </p>

        {/* State selector — only this section's data depends on it */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, marginBottom:32 }}>
          <label htmlFor="us-state" style={S.label}>Your US state</label>
          <select id="us-state" style={{ ...S.select, minWidth:260 }} value={userState}
            onChange={e => setUserState(e.target.value)}>
            {US_STATES.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
          </select>
        </div>

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
            In <strong><Flag code={safestEU.country.code} size={16} /> {safestEU.country.name}</strong>, it's{" "}
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
              <Flag code={safestEU.country.code} size={14} /> {safestEU.country.name} to{" "}
              <Flag code={leastSafeEU.country.code} size={14} /> {leastSafeEU.country.name}.{" "}
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
              code="US"
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
                code={x.country.code}
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
                    <span style={{ marginRight:6 }}><Flag code="US" size={16} /></span>{userState} <span style={{ fontWeight:500, color:"#4A5578", fontSize:12 }}>(your state)</span>
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
                        <span style={{ marginRight:6 }}><Flag code={x.country.code} size={16} /></span>{x.country.name}
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
        </section>

        {/* Methodology */}
        <details style={{ marginBottom:32, fontSize:13, color:"#4A5578" }}>
          <summary style={{ cursor:"pointer", fontWeight:600 }}>About this data &amp; how it affects rankings</summary>
          <div style={{ marginTop:12, lineHeight:1.6 }}>
            <p style={{ marginBottom:8 }}>
              <strong>Quality of life.</strong> The overall rank shown is an average of six independent global
              indices: the UN Human Development Index, the OECD Better Life Index, the Numbeo Quality of Life
              Index, the Social Progress Imperative's Social Progress Index, the Good Country Index, and the
              Happy Planet Index. Each index weights different factors (income, education, environment,
              social cohesion, life expectancy, and so on), so an average across all six is a more robust
              signal than any single source. The average is over the 28 places compared here (US + EU 27).
            </p>
            <p style={{ marginBottom:8 }}>
              <strong>Cost of living.</strong> The Numbeo Cost of Living + Rent Index sets New York City at 100
              and combines the relative cost of groceries, dining, transport, utilities, and rent into a single
              normalized number. Numbeo aggregates crowdsourced prices alongside official sources and publishes
              a fresh annual index each January; the values shown here are from the 2025 annual snapshot. The
              EU average shown is a simple country-level average across the 27 member states. As with any
              single index, individual cities within a country can run meaningfully above or below the national
              figure.
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
              <strong>Homicide.</strong> Intentional homicide is the one crime metric where US and EU data are
              directly comparable — the definition is essentially the same everywhere and reporting is
              consistently near-complete. Theft, burglary, and assault each mean different things in different
              jurisdictions, and reporting rates vary substantially, so absolute cross-border comparisons of
              those categories would be misleading. Per-100,000 homicide rates come from Eurostat crime
              statistics and the FBI Uniform Crime Reporting program.
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
          <button type="button" style={S.btn} onClick={() => { setView("wizard"); setEntryMode(null); }}>
            Find your match →
          </button>
        </div>
      </div>
    );
  };

  /* ---------- FAQ ----------
     SEO-targeted long-tail Q&A. Plain-prose answers, project tone (dry, honest,
     reader-as-capable-adult). The same questions are mirrored as JSON-LD in
     index.html so search engines can surface FAQ rich snippets. If you edit
     the question text or answer below, mirror the change there too. */
  const FAQ_ITEMS = [
    {
      q: "Which EU country is easiest for an American to move to?",
      a: "There's no single answer — it depends on your visa pathway. For remote workers with a foreign income, Portugal, Spain, Greece, and Estonia all run reasonably accessible digital-nomad visas with monthly income thresholds in the €2,500–€3,500 range. For salaried professionals, Germany's Blue Card is the highest-volume pathway in Europe and has a relatively predictable approval process. For retirees with passive income, Portugal's D7 and Spain's non-lucrative visa are the long-running standards. \"Easiest\" usually means \"matches your situation best,\" not \"lowest bar.\" The pathway finder asks the right intake questions and surfaces the countries where you actually qualify.",
    },
    {
      q: "Do I need to speak the local language to qualify for an EU visa?",
      a: "For the initial residence permit, almost never. Most work, remote, retirement, and investment visas are granted on the basis of income, employment, or capital — not language ability. Where language matters is later: permanent residence typically requires A2 (basic) proficiency, citizenship usually requires B1 (intermediate) and sometimes B2, and these are real exams, not formalities. A few countries with English-friendly daily life — Ireland, Malta, the Netherlands — let you function indefinitely without local language; in most others you'll plateau socially and professionally without it.",
    },
    {
      q: "What's the difference between an EU Blue Card and a Digital Nomad visa?",
      a: "The Blue Card is a salaried-employee permit. You need a binding job offer from an EU employer at a salary above the country's threshold (Germany's 2026 threshold is around €48,300, lower for shortage occupations). It's tied to employment and counts toward EU permanent residence after roughly 33 months (21 with B1 German). A Digital Nomad visa, by contrast, is for people earning income from outside the host country — usually remote employees of US companies or self-employed freelancers serving non-local clients. It typically requires proof of monthly income above some threshold and prohibits or restricts local-market work. Different visas, different audiences. The Blue Card is generally the stronger long-term path because it leads cleanly to permanent residence and citizenship; nomad visas are often capped in duration and don't always count toward residence accrual.",
    },
    {
      q: "How long does it take to get EU citizenship?",
      a: "Five to ten years of legal residence in the same country, depending on the country and your situation. Portugal is the EU's fastest at 5 years. Germany dropped its general track to 5 years in 2024 (3 with exceptional integration). France, Spain, Italy, the Netherlands, and most others sit at 7–10 years. Spouses of citizens generally qualify earlier (often 3 years). Time spent on a student visa often counts at half. EU citizenship gives you the right to live and work in all 27 member states for life — it's the strategic prize most permanent movers are aiming at, and the reason the difference between a 5-year track and a 10-year track matters more than most people realize when they pick a country.",
    },
    {
      q: "Can Americans actually retire in Europe?",
      a: "Yes, and a growing number do. The standard pathways are passive-income visas: Portugal D7, Spain non-lucrative visa, Greece's financially-independent-person visa, and Italy's elective residency. The bar is usually proof of stable income above a threshold (typically €2,000–€3,000/month for Portugal and Spain; higher for Italy) and private health insurance. Social Security income counts in every country that has a US totalization agreement, which is most of them. The two practical issues most US retirees underestimate: (1) the US still taxes its citizens worldwide, so you'll file in both countries every year, and (2) Medicare doesn't cover you abroad, so you're on private insurance or the host country's public system depending on the visa.",
    },
    {
      q: "Does an EU visa let me work in any EU country?",
      a: "No, not initially. A residence permit issued by Germany lets you live and work in Germany. To work in France you'd need a French permit. The exception is the EU Blue Card, which after 18 months of residence in the issuing country gives you the right to apply for a Blue Card in another member state under a faster process. Once you reach EU long-term resident status (after 5 years in one country) or citizenship in any member state, the entire EU opens up. Until then, you live where your visa was issued. This is also why the choice of which EU country to start in matters more than people assume — switching is possible but never frictionless.",
    },
    {
      q: "Is healthcare free in Europe?",
      a: "Free at point of use is closer to the truth than free outright. Most EU countries fund healthcare through payroll-style contributions or general taxation, so residents pay through the system rather than at the doctor's office. As a new arrival on a visa, you'll typically be required to carry private health insurance for the first year or two, after which you can join the public system if your visa qualifies you. Out-of-pocket costs once you're in the public system are dramatically lower than US norms — most EU countries cap annual out-of-pocket spending in the low four figures even for serious conditions. Quality is high in the wealthier member states (Germany, France, Netherlands, Austria, the Nordics) and varies more in the south and east. Worth researching by country, not by region.",
    },
    {
      q: "What's the cheapest EU country to live in?",
      a: "By cost-of-living-plus-rent index, Bulgaria, Romania, Poland, Hungary, and Slovakia consistently sit at the bottom of the EU 27 — roughly 30–45% below the EU average and 50–65% below the US. Portugal and Greece are mid-tier, often misunderstood as cheap because they were a decade ago; Lisbon and Athens have caught up substantially. The wealthy western and northern states (Ireland, Luxembourg, Denmark, the Netherlands, Germany, France) are the priciest, though still typically below US coastal-city costs. Cheap is relative to your situation: a US-salaried remote worker spending dollars in Sofia or Riga is operating on a different cost curve than a local earning local wages, and that gap is the actual proposition for most American movers.",
    },
    {
      q: "Can I keep my US job while living in the EU?",
      a: "Sometimes, with structure. The legal complication is that working physically from another country generally creates tax and employment-law obligations there — for you and for your employer. Some US employers will sign off on this through an Employer of Record arrangement; many won't, citing payroll, tax, and benefits exposure. The cleanest pathway when the employer can't accommodate it is a Digital Nomad visa with a self-employed contractor relationship rather than W-2 employment. Whatever the structure, you'll owe US tax (citizenship-based taxation), likely owe host-country tax once you cross 183 days of presence, and need to navigate the relevant tax treaty. Talk to a cross-border tax accountant before assuming the math works — it usually does, but the details matter.",
    },
    {
      q: "Do I need a job offer to move to Europe?",
      a: "Only for some visa types. Salaried-work visas (the Blue Card, national work permits) require a binding offer before you apply. Job-seeker visas — Germany's Chancenkarte being the largest example — let you move first and look for work after, typically for 6–12 months. Digital Nomad, freelance, retirement, and student visas don't require a local job offer at all. The traditional model where you secured a job from abroad and then relocated is one of several pathways now, not the default. The pathway finder maps your situation to the visa types that don't require what you don't have.",
    },
    {
      q: "Will my US degree be recognized in the EU?",
      a: "Generally yes for visa purposes, sometimes with a wrinkle for regulated professions. A US bachelor's or master's degree is recognized as equivalent to an EU degree by most national immigration authorities for Blue Card and skilled-worker visa purposes — Germany requires the degree to be listed in the Anabin database (most accredited US universities are), and similar databases exist elsewhere. Where it gets harder is regulated professions: medicine, law, nursing, teaching, accounting, engineering in some countries. Those usually require a separate professional recognition process beyond the visa, which can take months to years and may require additional coursework or exams. For unregulated professions — software, design, finance, marketing, most management — recognition is rarely the bottleneck.",
    },
    {
      q: "How does this tool work, and is the data trustworthy?",
      a: "The tool is a sorting mechanism, not legal advice. You pick a pathway or take the quiz; the tool asks about your situation and what matters to you; it scores all 27 EU countries on a non-linear weighted average and surfaces the strongest matches with side-by-side comparisons. The data — visa thresholds, cost of living, healthcare and safety indices — comes from official government portals and reputable cross-country sources (Numbeo, Eurostat, OECD, FBI UCR for US comparators). It's labeled as of early 2026 with a \"verify at the official portal before acting\" caveat. Immigration rules change quarterly, especially income thresholds tied to local minimum wages. The tool's job is to narrow your options from 27 to a shortlist of 3–5 worth real research; the actual application work happens at the official portals.",
    },
  ];

  const renderFAQ = () => (
    <div style={{ animation: animateIn ? "fadeSlideIn .4s ease" : undefined }}>
      <h2 style={S.h2}>Common questions about moving to the EU</h2>
      <p style={S.lede}>
        Practical answers to the questions Americans ask most often when they
        start researching a move to Europe. If a question's missing, the tool
        itself probably already accounts for it — start with the pathway finder.
      </p>

      <section aria-labelledby="faq-h" style={{ maxWidth: 820, margin: "0 auto 48px" }}>
        <h3 id="faq-h" className="sr-only">Frequently asked questions</h3>
        <div role="list">
          {FAQ_ITEMS.map((item, i) => (
            <details
              key={i}
              role="listitem"
              style={{
                background: "#fff",
                border: "1px solid #E8DFC9",
                borderRadius: 4,
                padding: "18px 22px",
                marginBottom: 12,
              }}
            >
              <summary
                style={{
                  cursor: "pointer",
                  fontFamily: '"Fraunces", Georgia, serif',
                  fontSize: 19,
                  fontWeight: 600,
                  color: "#0A1F4D",
                  lineHeight: 1.4,
                  listStyle: "revert",
                }}
              >
                {item.q}
              </summary>
              <div
                style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: "1px solid #EADFC2",
                  fontSize: 15,
                  lineHeight: 1.65,
                  color: "#0A1F4D",
                }}
              >
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Source/disclaimer note matching Why EU page tone */}
      <div
        style={{
          maxWidth: 820,
          margin: "0 auto 32px",
          padding: "16px 22px",
          background: "#FFF8E5",
          border: "1px solid #FFCC00",
          borderRadius: 4,
          fontSize: 13,
          lineHeight: 1.55,
          color: "#0A1F4D",
        }}
      >
        <strong>Not legal advice.</strong> Immigration rules change quarterly and
        country-specific thresholds are tied to local minimum wages that reset
        annually. Treat answers above as orientation, not as the basis for filing
        an application — verify at the host country's official immigration portal
        before acting.
      </div>

      {/* CTA back to wizard */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", padding: "32px 0", borderTop: "1px solid #EADFC2" }}>
        <button type="button" style={S.btn} onClick={() => { setView("wizard"); setEntryMode(null); }}>
          Find your match →
        </button>
        <button type="button" style={S.btnGhost} onClick={() => setView("whyEU")}>
          See US vs EU data
        </button>
      </div>
    </div>
  );

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
        /* Pathway pills inside country cards — clearer hover than the default brightness */
        .pathway-pill:not(:disabled):hover { background:#F3EBDA !important; border-color:#B8C9F5 !important; transform:translateY(-1px); box-shadow:0 3px 8px rgba(0,51,153,0.08); filter:none; }
        .pathway-pill.is-expanded:not(:disabled):hover { background:#D4E0FF !important; border-color:#003399 !important; }
        /* Outline CTAs (Compare button, Portal link) — fill on hover */
        .cta-outline:not(:disabled):hover { background:#E4ECFF; border-color:#003399; transform:translateY(-1px); box-shadow:0 3px 8px rgba(0,51,153,0.08); filter:none; text-decoration:none; }
        .cta-outline.is-active:not(:disabled):hover { background:#FFD633; border-color:#E6B800; }
        summary::marker { color:#003399; }
        /* Hero band — shrink on narrow viewports so it doesn't dominate phones */
        .hero-band { min-height: 480px !important; }
        .hero-band .hero-content { min-height: 480px !important; padding: 60px 28px !important; }
        @media (max-width: 600px) {
          .hero-band { min-height: 320px !important; }
          .hero-band .hero-content { min-height: 320px !important; padding: 40px 20px !important; }
          /* Why EU banner stat row: drop the column dividers when columns
             stack vertically, add a top border between stacked items instead. */
          .why-eu-stat { border-right: none !important; padding: 14px 0 !important; }
          .why-eu-stat + .why-eu-stat { border-top: 1px solid #EADFC2; }
        }
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
              onClick={() => { setView("wizard"); setEntryMode(null); }}
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
            <button
              type="button"
              onClick={() => setView("faq")}
              aria-current={view === "faq" ? "page" : undefined}
              style={{
                background:"transparent", border:"none", color:"#fff", fontFamily:"inherit", fontSize:14,
                fontWeight: view === "faq" ? 700 : 500,
                opacity: view === "faq" ? 1 : 0.75,
                cursor:"pointer", padding:"6px 0",
                borderBottom: view === "faq" ? "2px solid #FFCC00" : "2px solid transparent",
              }}>
              FAQ
            </button>
            {view === "wizard" && entryMode === "wizard" && step < 3 && !comparing && (
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
        {view === "whyEU" ? renderWhyEU() : view === "faq" ? renderFAQ() : (
          comparing ? renderCompare() : (
            entryMode === null ? renderIntro() :
            entryMode === "quiz" ? renderQuiz() : (
              <>
                {step === 0 && renderStep0()}
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
              </>
            )
          )
        )}
      </main>

      {/* Floating comparison tray — appears on step 3 when 1+ shortlisted */}
      {view === "wizard" && entryMode === "wizard" && step === 3 && !comparing && shortlist.length > 0 && (
        <div style={{ ...S.floatingBar, animation:"popIn .3s ease" }}
          role="region"
          aria-label="Country comparison tray"
          aria-live="polite">
          <span style={{ ...S.floatingFlags, display:"inline-flex", alignItems:"center", gap:6 }} aria-hidden="true">
            {shortlist.map(code => <Flag key={code} code={code} size={20} />)}
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
        <div>
          Move Me To EU · 27 member states · Data compiled from public sources, including official government portals,
          Eurostat, Numbeo indices and EF English Proficiency Index. Always confirm visa requirements with the
          relevant consulate before acting.
        </div>
        <div style={{ marginTop:10 }}>
          Questions, corrections or feedback: <a href="mailto:info@movemeto.eu" style={{ color:"#003399", fontWeight:600 }}>info@movemeto.eu</a>
        </div>
        {HERO_IMAGES.some(img => img.credit) && (
          <div style={{ marginTop:8, fontSize:11, color:"#4A5578" }}>
            Hero images: {HERO_IMAGES.filter(img => img.credit).map(img => img.credit).join(" · ")}
          </div>
        )}
      </footer>
    </div>
  );
}
