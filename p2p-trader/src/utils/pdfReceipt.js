import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import workerSrc from 'pdfjs-dist/legacy/build/pdf.worker.mjs?url';
import { toNumber } from './calculations';

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

function amountVariants(amount) {
  const value = toNumber(amount);
  const integer = Math.round(value);
  const fixed = value.toFixed(2);
  const comma = fixed.replace('.', ',');
  const withSpaces = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  const integerSpaces = new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 0,
  }).format(integer);

  return new Set([
    String(integer),
    fixed,
    comma,
    withSpaces,
    withSpaces.replace(/\u00a0/g, ' '),
    integerSpaces,
    integerSpaces.replace(/\u00a0/g, ' '),
  ]);
}

function normalize(text) {
  return text
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function extractPdfText(file) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({
    data: new Uint8Array(buffer),
    disableWorker: false,
  }).promise;

  const pages = [];
  for (let pageNo = 1; pageNo <= pdf.numPages; pageNo += 1) {
    const page = await pdf.getPage(pageNo);
    const content = await page.getTextContent();
    pages.push(content.items.map(item => item.str).join(' '));
  }
  return normalize(pages.join(' '));
}

export async function verifyReceiptAmount(file, expectedAmount) {
  const text = await extractPdfText(file);
  const compactText = text.replace(/\s+/g, '');
  const variants = [...amountVariants(expectedAmount)];
  const matchedVariant = variants.find(variant => {
    const normalizedVariant = normalize(variant);
    return text.includes(normalizedVariant) || compactText.includes(normalizedVariant.replace(/\s+/g, ''));
  });

  return {
    ok: Boolean(matchedVariant),
    fileName: file.name,
    matchedVariant,
    textPreview: text.slice(0, 500),
  };
}
