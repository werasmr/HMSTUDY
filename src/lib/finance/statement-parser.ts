import * as XLSX from "xlsx";
import { parseCsv } from "@/lib/crud/utils";
import type { ParsedStatementRow } from "@/types/database";

const DATE_ALIASES = ["date", "дата", "transaction_date", "дата операции", "дата проводки"];
const AMOUNT_ALIASES = ["amount", "сумма", "sum", "итого"];
const DEBIT_ALIASES = ["debit", "расход", "списание", "дебет"];
const CREDIT_ALIASES = ["credit", "доход", "поступление", "кредит"];
const DESC_ALIASES = [
  "description",
  "назначение",
  "назначение платежа",
  "описание",
  "details",
  "комментарий",
];

function findColumn(headers: string[], aliases: string[]) {
  const normalized = headers.map((header) => header.toLowerCase().trim());
  return normalized.findIndex((header) => aliases.some((alias) => header.includes(alias)));
}

function normalizeDate(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

  const dotted = trimmed.match(/^(\d{1,2})[./](\d{1,2})[./](\d{2,4})/);
  if (dotted) {
    const year = dotted[3].length === 2 ? `20${dotted[3]}` : dotted[3];
    return `${year}-${dotted[2].padStart(2, "0")}-${dotted[1].padStart(2, "0")}`;
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return null;
}

function parseAmountValue(value: string) {
  const normalized = value.replace(/\s/g, "").replace(",", ".");
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : null;
}

function rowsFromSheetRows(rows: Record<string, string>[], fileName: string) {
  if (rows.length === 0) return [];

  const headers = Object.keys(rows[0]);
  const dateCol = findColumn(headers, DATE_ALIASES);
  const amountCol = findColumn(headers, AMOUNT_ALIASES);
  const debitCol = findColumn(headers, DEBIT_ALIASES);
  const creditCol = findColumn(headers, CREDIT_ALIASES);
  const descCol = findColumn(headers, DESC_ALIASES);

  const parsed: ParsedStatementRow[] = [];

  rows.forEach((row, index) => {
    const values = headers.map((header) => row[header] ?? "");
    const dateValue = dateCol >= 0 ? values[dateCol] : "";
    const date = normalizeDate(dateValue);
    if (!date) return;

    let amount: number | null = null;
    if (amountCol >= 0) {
      amount = parseAmountValue(values[amountCol]);
    } else {
      const debit = debitCol >= 0 ? parseAmountValue(values[debitCol]) : null;
      const credit = creditCol >= 0 ? parseAmountValue(values[creditCol]) : null;
      if (credit && credit !== 0) amount = Math.abs(credit);
      else if (debit && debit !== 0) amount = -Math.abs(debit);
    }

    if (amount == null || amount === 0) return;

    const description =
      descCol >= 0 ? values[descCol] : values.find((value) => value && value !== dateValue) ?? "Без описания";

    parsed.push({
      date,
      amount,
      description: description || "Без описания",
      importRef: `${fileName}:${index + 1}`,
    });
  });

  return parsed;
}

export function parseStatementFile(fileName: string, buffer: ArrayBuffer) {
  const lowerName = fileName.toLowerCase();

  if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) {
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "" });
    return rowsFromSheetRows(rows, fileName);
  }

  const text = new TextDecoder().decode(buffer);
  const csvRows = parseCsv(text);
  return rowsFromSheetRows(csvRows, fileName);
}
