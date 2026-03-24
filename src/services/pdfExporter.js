import { jsPDF } from 'jspdf';
import 'jspdf/dist/polyfills.es.js';

const ACCENT = '#E8352A';
const BLACK = '#000000';
const MUTED = '#666666';
const TABLE_BG = '#F5F5F5';
const LINE_COLOR = '#CCCCCC';

async function loadLogoDataUrl(logoUrl) {
  if (!logoUrl) return null;
  const ext = logoUrl.split('.').pop().split('?')[0].toLowerCase();
  if (ext === 'svg') return null;
  // Draw through canvas → JPEG to avoid jsPDF PNG parser issues
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext('2d').drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = logoUrl;
  });
}

export async function exportPDF(cvData, template) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginL = 50;
  const marginR = 50;
  const contentW = pageW - marginL - marginR;
  const footerH = 60;
  let y = 40;

  const accent = template.accentColor || ACCENT;

  // ── Logo ──────────────────────────────────────────
  const logoDataUrl = await loadLogoDataUrl(template.logoUrl);
  if (logoDataUrl) {
    const logoW = 100;
    const logoH = 34;
    doc.addImage(logoDataUrl, 'JPEG', pageW - marginR - logoW, y, logoW, logoH);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(accent);
    doc.text(template.displayName, pageW - marginR, y + 20, { align: 'right' });
  }
  y += 50;

  // ── Name ──────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(BLACK);
  doc.text(cvData.name, marginL, y);
  y += 36;

  // ── Title ─────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(accent);
  doc.text(cvData.title, marginL, y);
  y += 28;

  // ── Helper: section heading ────────────────────────
  function sectionHead(title) {
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(BLACK);
    doc.text(title, marginL, y);
    y += 4;
    doc.setDrawColor(LINE_COLOR);
    doc.setLineWidth(0.5);
    doc.line(marginL, y, marginL + contentW, y);
    y += 10;
  }

  // ── Helper: bullet line ────────────────────────────
  function bullet(text, indent = 14) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(BLACK);
    doc.text('•', marginL + indent - 10, y);
    const lines = doc.splitTextToSize(text, contentW - indent);
    doc.text(lines, marginL + indent, y);
    y += lines.length * 14 + 2;
    checkPageBreak();
  }

  // ── Helper: page break check ───────────────────────
  function checkPageBreak(needed = 40) {
    if (y + needed > pageH - footerH - 20) {
      doc.addPage();
      y = 40;
    }
  }

  // ── General Qualification ─────────────────────────
  sectionHead('GENERAL QUALIFICATION');

  if (cvData.summary?.length) {
    for (const line of cvData.summary) {
      bullet(line);
    }
    y += 6;
  }

  // Skills table
  if (cvData.skillsTable?.length) {
    const col1W = contentW * 0.26;
    const col2W = contentW * 0.74;
    const rowH = 22;

    for (const row of cvData.skillsTable) {
      checkPageBreak(rowH + 4);

      // Row background
      doc.setFillColor(TABLE_BG);
      doc.rect(marginL, y - 14, col1W, rowH, 'F');

      // Borders
      doc.setDrawColor('#DDDDDD');
      doc.setLineWidth(0.4);
      doc.rect(marginL, y - 14, col1W, rowH);
      doc.rect(marginL + col1W, y - 14, col2W, rowH);

      // Category
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(BLACK);
      doc.text(row.category, marginL + 4, y);

      // Items
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      const itemLines = doc.splitTextToSize(row.items, col2W - 8);
      doc.text(itemLines, marginL + col1W + 4, y);

      y += rowH;
    }
    y += 10;
  }

  // ── Employment History ────────────────────────────
  if (cvData.employmentHistory?.length) {
    checkPageBreak(30);
    sectionHead('EMPLOYMENT HISTORY');
    for (const job of cvData.employmentHistory) {
      checkPageBreak(20);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(BLACK);
      doc.text('•', marginL + 4, y);
      if (job.period) {
        doc.setFont('helvetica', 'bold');
        doc.text(`${job.period}, `, marginL + 14, y);
        const periodW = doc.getTextWidth(`${job.period}, `);
        doc.setFont('helvetica', 'normal');
        const roleLines = doc.splitTextToSize(job.role, contentW - 14 - periodW);
        doc.text(roleLines[0], marginL + 14 + periodW, y);
        if (roleLines.length > 1) {
          y += 14;
          doc.text(roleLines.slice(1), marginL + 14, y);
        }
      } else {
        doc.text(job.role, marginL + 14, y);
      }
      y += 16;
    }
    y += 6;
  }

  // ── Education ─────────────────────────────────────
  if (cvData.education?.length) {
    checkPageBreak(30);
    sectionHead('EDUCATION');
    for (const edu of cvData.education) bullet(edu);
    y += 6;
  }

  // ── Additional sections ───────────────────────────
  for (const sec of (cvData.additionalSections || [])) {
    checkPageBreak(30);
    sectionHead(sec.title.toUpperCase());
    for (const b of sec.bullets) bullet(b);
    y += 6;
  }

  // ── Footer (last page) ────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    const fy = pageH - 36;
    doc.setDrawColor(LINE_COLOR);
    doc.setLineWidth(0.5);
    doc.line(marginL, fy - 8, marginL + contentW, fy - 8);

    if (template.confidentialText) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(MUTED);
      doc.text(template.confidentialText, marginL, fy - 14);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(template.footerLeft ? '#333333' : accent);
    doc.text(template.footerLeft || template.displayName, marginL, fy);

    if (template.website) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(accent);
      doc.text(template.website, marginL, fy + 12);
    }

    const rightParts = [template.email, ...(template.phone ? template.phone.split('\n') : [])].filter(Boolean);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(accent);
    rightParts.forEach((part, i) => {
      doc.text(part.trim(), marginL + contentW, fy + i * 12, { align: 'right' });
    });
  }

  return doc.output('blob');
}
