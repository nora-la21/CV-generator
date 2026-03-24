const pdfmake = require('pdfmake');
const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..');

function setupFonts() {
  const calibriPath = path.join(BASE_DIR, 'assets/fonts/calibri.ttf');
  const calibriBoldPath = path.join(BASE_DIR, 'assets/fonts/calibrib.ttf');

  if (fs.existsSync(calibriPath)) {
    pdfmake.addFonts({
      Calibri: {
        normal: calibriPath,
        bold: fs.existsSync(calibriBoldPath) ? calibriBoldPath : calibriPath,
      },
    });
    return 'Calibri';
  }

  // Fall back to built-in Helvetica (no file needed)
  pdfmake.addFonts({
    Helvetica: {
      normal: 'Helvetica',
      bold: 'Helvetica-Bold',
      italics: 'Helvetica-Oblique',
      bolditalics: 'Helvetica-BoldOblique',
    },
  });
  return 'Helvetica';
}

// pdfmake URL access policy: deny all external URLs (we only use data URIs)
pdfmake.setUrlAccessPolicy(() => false);

function getLogoDataUrl(template) {
  const logoPath = path.join(BASE_DIR, template.logoPath);
  if (!fs.existsSync(logoPath)) return null;
  const buffer = fs.readFileSync(logoPath);
  const ext = path.extname(template.logoPath).slice(1).toLowerCase();
  const mime = ext === 'jpg' ? 'jpeg' : ext;
  return `data:image/${mime};base64,${buffer.toString('base64')}`;
}

function buildContent(cvData, template, font) {
  const accent = template.accentColor;
  const logoDataUrl = getLogoDataUrl(template);
  const content = [];

  // Header row with logo
  content.push({
    columns: [
      { text: '', width: '*' },
      logoDataUrl
        ? { image: logoDataUrl, width: 100, alignment: 'right', margin: [0, 0, 0, 8] }
        : { text: template.displayName, bold: true, fontSize: 16, color: accent, alignment: 'right', margin: [0, 0, 0, 8] },
    ],
    margin: [0, 0, 0, 10],
  });

  // Name
  content.push({ text: cvData.name, fontSize: 26, bold: true, font, color: '#000000', margin: [0, 10, 0, 4] });

  // Title
  content.push({ text: cvData.title, fontSize: 13, bold: true, font, color: accent, margin: [0, 0, 0, 16] });

  // Section heading factory
  const sectionHead = (title) => ({
    stack: [
      { text: title, fontSize: 11, bold: true, font, color: '#000000', margin: [0, 12, 0, 2] },
      {
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: 495, y2: 0, lineWidth: 0.5, lineColor: '#CCCCCC' }],
        margin: [0, 0, 0, 8],
      },
    ],
  });

  // General Qualification
  content.push(sectionHead('GENERAL QUALIFICATION'));

  if (cvData.summary && cvData.summary.length > 0) {
    content.push({
      ul: cvData.summary.map(line => ({ text: line, fontSize: 10, font, margin: [0, 1, 0, 1] })),
      margin: [0, 0, 0, 8],
    });
  }

  if (cvData.skillsTable && cvData.skillsTable.length > 0) {
    content.push({
      table: {
        widths: ['26%', '74%'],
        body: cvData.skillsTable.map(row => [
          { text: row.category, bold: true, fontSize: 10, font, fillColor: '#F5F5F5', margin: [4, 4, 4, 4] },
          { text: row.items, fontSize: 10, font, margin: [4, 4, 4, 4] },
        ]),
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#DDDDDD',
        vLineColor: () => '#DDDDDD',
      },
      margin: [0, 0, 0, 14],
    });
  }

  // Employment History
  if (cvData.employmentHistory && cvData.employmentHistory.length > 0) {
    content.push(sectionHead('EMPLOYMENT HISTORY'));
    content.push({
      ul: cvData.employmentHistory.map(job => ({
        text: job.period
          ? [{ text: `${job.period}, `, bold: true, fontSize: 10, font }, { text: job.role, fontSize: 10, font }]
          : [{ text: job.role, fontSize: 10, font }],
        margin: [0, 1, 0, 1],
      })),
      margin: [0, 0, 0, 14],
    });
  }

  // Education
  if (cvData.education && cvData.education.length > 0) {
    content.push(sectionHead('EDUCATION'));
    content.push({
      ul: cvData.education.map(e => ({ text: e, fontSize: 10, font, margin: [0, 1, 0, 1] })),
      margin: [0, 0, 0, 14],
    });
  }

  // Additional sections
  if (cvData.additionalSections && cvData.additionalSections.length > 0) {
    for (const section of cvData.additionalSections) {
      content.push(sectionHead(section.title.toUpperCase()));
      content.push({
        ul: section.bullets.map(b => ({ text: b, fontSize: 10, font, margin: [0, 1, 0, 1] })),
        margin: [0, 0, 0, 14],
      });
    }
  }

  return content;
}

function buildFooter(template, font) {
  const accent = template.accentColor;
  return function () {
    const leftStack = [];
    if (template.confidentialText) {
      leftStack.push({ text: template.confidentialText, fontSize: 8, font, color: '#888888' });
    }
    leftStack.push({
      text: template.footerLeft || template.footerBrand,
      bold: true,
      fontSize: 9,
      font,
      color: template.footerLeft ? '#333333' : accent,
    });
    if (template.website) {
      leftStack.push({ text: template.website, fontSize: 8, font, color: accent });
    }

    const rightStack = [];
    if (template.email) rightStack.push({ text: template.email, fontSize: 8, font, color: accent });
    if (template.phone) {
      for (const line of template.phone.split('\n')) {
        rightStack.push({ text: line.trim(), fontSize: 8, font, color: '#333333' });
      }
    }

    return {
      columns: [
        { stack: leftStack, width: '*', margin: [50, 6, 0, 0] },
        { stack: rightStack, alignment: 'right', width: '*', margin: [0, 6, 50, 0] },
      ],
    };
  };
}

async function generatePDF(cvData, template) {
  const font = setupFonts();

  const docDefinition = {
    pageMargins: [50, 40, 50, 70],
    defaultStyle: { font },
    content: buildContent(cvData, template, font),
    footer: buildFooter(template, font),
  };

  return pdfmake.createPdf(docDefinition).getBuffer();
}

module.exports = { generatePDF };
