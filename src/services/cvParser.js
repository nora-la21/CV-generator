import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Point pdfjs worker to the CDN build so it works in the browser without bundling issues
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export async function parseCV(file) {
  const ext = file.name.split('.').pop().toLowerCase();

  if (ext === 'pdf') return parsePDF(file);
  if (['doc', 'docx'].includes(ext)) return parseDOCX(file);
  throw new Error('Unsupported file type. Please upload a PDF or Word document.');
}

async function parseDOCX(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}

async function parsePDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map(item => item.str).join(' ');
    pages.push(text);
  }
  return pages.join('\n').trim();
}
