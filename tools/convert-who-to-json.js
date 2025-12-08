#!/usr/bin/env node
/**
 * WHO CSV/XLSX → JSON LMS converter
 */

const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const { parse } = require("csv-parse/sync"); // <-- FIXED IMPORT

function parseArgs() {
  const args = {};
  const raw = process.argv.slice(2);
  for (let i = 0; i < raw.length; i++) {
    const a = raw[i];
    if (a.startsWith("--")) {
      const key = a.replace(/^--/, "");
      const val = raw[i + 1] && !raw[i + 1].startsWith("--") ? raw[++i] : true;
      args[key] = val;
    }
  }
  return args;
}

function readCsvFileSync(filePath) {
  const txt = fs.readFileSync(filePath, "utf8");
  const records = parse(txt, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
  return records;
}

function readSheetFromXlsx(filePath, sheetName) {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(
      `Sheet "${sheetName}" not found. Available: ${Object.keys(workbook.Sheets).join(", ")}`
    );
  }
  return XLSX.utils.sheet_to_json(sheet, { defval: null });
}

function pickColumn(row, candidates) {
  const keys = Object.keys(row);
  const lowerMap = {};
  keys.forEach(
    (k) => (lowerMap[k.toLowerCase().replace(/\s+/g, "")] = k)
  );
  for (const c of candidates) {
    const key = lowerMap[c.toLowerCase().replace(/\s+/g, "")];
    if (key !== undefined) return key;
  }
  return null;
}

function mapRowsToLms(rows, ageUnit = "days") {
  if (!rows || rows.length === 0) return [];

  const sample = rows[0];
  const ageCandidates = [
    "ageDays",
    "agedays",
    "age_days",
    "AgeDays",
    "age",
    "aged",
    "Agemos",
    "agemo",
    "agemonths",
    "agem"
  ];

  const LCandidates = ["L", "l", "lambda"];
  const MCandidates = ["M", "m", "median"];
  const SCandidates = ["S", "s", "sigma"];

  const ageCol = pickColumn(sample, ageCandidates);
  const Lcol = pickColumn(sample, LCandidates);
  const Mcol = pickColumn(sample, MCandidates);
  const Scol = pickColumn(sample, SCandidates);

  if (!ageCol || !Lcol || !Mcol || !Scol) {
    console.warn("Column autodetection failed. Columns found:", Object.keys(sample));
  }

  const out = [];

  for (const r of rows) {
    const rawAge = ageCol ? r[ageCol] : r[Object.keys(r)[0]];
    if (rawAge == null || rawAge === "") continue;

    let ageNum = Number(String(rawAge).replace(/[^\d.-]/g, ""));
    if (Number.isNaN(ageNum)) continue;

    let ageDays = ageNum;
    if (ageUnit === "months") ageDays = Math.round(ageNum * 30.4375);
    if (ageUnit === "weeks") ageDays = Math.round(ageNum * 7);

    const L = Number(r[Lcol]);
    const M = Number(r[Mcol]);
    const S = Number(r[Scol]);

    out.push({ ageDays, L, M, S });
  }

  out.sort((a, b) => a.ageDays - b.ageDays);
  return out;
}

function writeJson(outPath, jsonObj) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(jsonObj, null, 2), "utf8");
  console.log("Wrote", outPath);
}

(function main() {
  const args = parseArgs();
  const outPath = args.out || "./src/data/who-output.json";
  const ageUnit = (args.ageUnit || "days").toLowerCase();

  const result = { male: [], female: [] };

  ////// XLSX MODE ///////
  if (args.xlsx) {
    const maleSheet = args.maleSheet || "Male";
    const femaleSheet = args.femaleSheet || "Female";

    const maleRows = readSheetFromXlsx(args.xlsx, maleSheet);
    const femaleRows = readSheetFromXlsx(args.xlsx, femaleSheet);

    result.male = mapRowsToLms(maleRows, ageUnit);
    result.female = mapRowsToLms(femaleRows, ageUnit);
  }

  ////// CSV MODE ///////
  if (args.male) {
    const maleRows = readCsvFileSync(args.male);
    result.male = mapRowsToLms(maleRows, ageUnit);
  }

  if (args.female) {
    const femaleRows = readCsvFileSync(args.female);
    result.female = mapRowsToLms(femaleRows, ageUnit);
  }

  writeJson(outPath, result);
})();
