import * as XLSX from "xlsx";
import { parseCsv } from "@/lib/crud/utils";

export function parseSpreadsheetRows(file: File): Promise<Record<string, string>[]> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".csv")) {
    return file.text().then((text) => parseCsv(text));
  }

  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    return file.arrayBuffer().then((buffer) => {
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      if (!sheet) return [];

      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
        defval: "",
        raw: false,
      });

      return rows.map((row) =>
        Object.fromEntries(
          Object.entries(row).map(([key, value]) => [key, String(value ?? "").trim()]),
        ),
      );
    });
  }

  return Promise.resolve([]);
}
