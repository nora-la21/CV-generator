import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, BorderStyle, AlignmentType, ImageRun, Header, Footer,
  ShadingType, convertInchesToTwip,
} from 'docx';

const FONT = 'Calibri';

function accentHex(template) {
  return template.accentColor.replace('#', '');
}

async function getLogoImageRun(logoUrl) {
  if (!logoUrl) return null;
  const ext = logoUrl.split('.').pop().split('?')[0].toLowerCase();
  if (ext === 'svg') return null; // docx doesn't support SVG
  try {
    const res = await fetch(logoUrl);
    const blob = await res.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const type = ext === 'jpg' ? 'jpeg' : ext;
    return new ImageRun({
      data: arrayBuffer,
      transformation: { width: 120, height: 40 },
      type,
    });
  } catch {
    return null;
  }
}

function sectionHeading(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 22, font: FONT, color: '000000' })],
    spacing: { before: 300, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC' } },
  });
}

function bulletParagraph(text) {
  return new Paragraph({
    bullet: { level: 0 },
    children: [new TextRun({ text, size: 20, font: FONT })],
    spacing: { after: 60 },
  });
}

function skillsTable(rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(row =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 25, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: 'F5F5F5' },
            borders: { top: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD' }, bottom: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD' }, left: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD' }, right: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD' } },
            children: [new Paragraph({ children: [new TextRun({ text: row.category, bold: true, size: 20, font: FONT })], spacing: { before: 60, after: 60 } })],
          }),
          new TableCell({
            width: { size: 75, type: WidthType.PERCENTAGE },
            borders: { top: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD' }, bottom: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD' }, left: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD' }, right: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD' } },
            children: [new Paragraph({ children: [new TextRun({ text: row.items, size: 20, font: FONT })], spacing: { before: 60, after: 60 } })],
          }),
        ],
      })
    ),
  });
}

export async function exportDOCX(cvData, template) {
  const color = accentHex(template);

  // Header
  const logoRun = await getLogoImageRun(template.logoUrl);
  const headerPara = new Paragraph({
    alignment: AlignmentType.RIGHT,
    children: logoRun
      ? [logoRun]
      : [new TextRun({ text: template.displayName, bold: true, size: 28, color, font: FONT })],
    spacing: { before: 0, after: 100 },
  });

  // Footer cells
  const noBorder = { style: BorderStyle.NONE };
  const footerLeft = new TableCell({
    borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
    children: [
      new Paragraph({ children: [new TextRun({ text: template.footerLeft || template.displayName, bold: true, size: 18, color: template.footerLeft ? '333333' : color, font: FONT })] }),
      ...(template.website ? [new Paragraph({ children: [new TextRun({ text: template.website, size: 16, color, font: FONT })] })] : []),
    ],
  });
  const rightParts = [template.email, template.phone].filter(Boolean).join('   ');
  const footerRight = new TableCell({
    borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
    children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: rightParts ? [new TextRun({ text: rightParts, size: 16, color, font: FONT })] : [] })],
  });

  const docChildren = [
    // Name
    new Paragraph({ children: [new TextRun({ text: cvData.name, bold: true, size: 52, font: FONT, color: '000000' })], spacing: { before: 200, after: 80 } }),
    // Title
    new Paragraph({ children: [new TextRun({ text: cvData.title, bold: true, size: 24, font: FONT, color })], spacing: { after: 240 } }),
    // General Qualification
    sectionHeading('GENERAL QUALIFICATION'),
    ...(cvData.summary || []).map(l => bulletParagraph(l)),
    new Paragraph({ children: [], spacing: { after: 120 } }),
    ...(cvData.skillsTable?.length ? [skillsTable(cvData.skillsTable), new Paragraph({ children: [], spacing: { after: 200 } })] : []),
    // Employment
    ...(cvData.employmentHistory?.length ? [
      sectionHeading('EMPLOYMENT HISTORY'),
      ...cvData.employmentHistory.map(job =>
        new Paragraph({
          bullet: { level: 0 },
          children: [
            new TextRun({ text: job.period ? `${job.period}, ` : '', bold: true, size: 20, font: FONT }),
            new TextRun({ text: job.period ? job.role : job.role, size: 20, font: FONT }),
          ],
          spacing: { after: 60 },
        })
      ),
      new Paragraph({ children: [], spacing: { after: 200 } }),
    ] : []),
    // Education
    ...(cvData.education?.length ? [
      sectionHeading('EDUCATION'),
      ...cvData.education.map(e => bulletParagraph(e)),
      new Paragraph({ children: [], spacing: { after: 200 } }),
    ] : []),
    // Experience / Projects
    ...(cvData.projects?.length ? [
      sectionHeading('EXPERIENCE'),
      ...cvData.projects.flatMap(proj => [
        new Paragraph({
          children: [new TextRun({ text: proj.name, bold: true, size: 20, font: FONT, color })],
          spacing: { before: 160, after: 60 },
        }),
        ...(proj.environment ? [new Paragraph({ children: [new TextRun({ text: 'Environment: ', bold: true, size: 20, font: FONT }), new TextRun({ text: proj.environment, size: 20, font: FONT })], spacing: { after: 40 } })] : []),
        ...(proj.description ? [new Paragraph({ children: [new TextRun({ text: 'Description: ', bold: true, size: 20, font: FONT }), new TextRun({ text: proj.description, size: 20, font: FONT })], spacing: { after: 40 } })] : []),
        ...(proj.responsibilities ? [new Paragraph({ children: [new TextRun({ text: 'Responsibilities: ', bold: true, size: 20, font: FONT }), new TextRun({ text: proj.responsibilities, size: 20, font: FONT })], spacing: { after: 40 } })] : []),
        ...(proj.testingTypes ? [new Paragraph({ children: [new TextRun({ text: 'Testing types: ', bold: true, size: 20, font: FONT }), new TextRun({ text: proj.testingTypes, size: 20, font: FONT })], spacing: { after: 60 } })] : []),
      ]),
      new Paragraph({ children: [], spacing: { after: 200 } }),
    ] : []),
    // Additional sections
    ...(cvData.additionalSections || []).flatMap(sec => [
      sectionHeading(sec.title.toUpperCase()),
      ...sec.bullets.map(b => bulletParagraph(b)),
      new Paragraph({ children: [], spacing: { after: 200 } }),
    ]),
  ];

  const doc = new Document({
    sections: [{
      headers: { default: new Header({ children: [headerPara] }) },
      footers: {
        default: new Footer({
          children: [
            ...(template.confidentialText ? [new Paragraph({ children: [new TextRun({ text: template.confidentialText, size: 16, font: FONT })] })] : []),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder, insideH: noBorder, insideV: noBorder },
              rows: [new TableRow({ children: [footerLeft, footerRight] })],
            }),
          ],
        }),
      },
      properties: { page: { margin: { top: convertInchesToTwip(0.75), right: convertInchesToTwip(0.9), bottom: convertInchesToTwip(0.75), left: convertInchesToTwip(0.9) } } },
      children: docChildren,
    }],
  });

  return Packer.toBlob(doc);
}
