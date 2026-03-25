import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, BorderStyle, AlignmentType, ImageRun, Header, Footer,
  ShadingType, TableLayoutType, convertInchesToTwip, TabStopType,
} from 'docx';

const FONT = 'Calibri';

// A4 page width minus 0.9" margins on each side (in twips)
const CONTENT_W = 9314;

function accentHex(template) {
  return template.accentColor.replace('#', '');
}

async function getLogoImageRun(logoUrl, isQarea = false) {
  if (!logoUrl) return null;
  const ext = logoUrl.split('.').pop().split('?')[0].toLowerCase();
  if (ext === 'svg') return null;
  try {
    const res = await fetch(import.meta.env.BASE_URL + logoUrl);
    const blob = await res.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const type = ext === 'jpg' ? 'jpeg' : ext;
    return new ImageRun({
      data: arrayBuffer,
      transformation: { width: isQarea ? 160 : 90, height: isQarea ? 48 : 71 },
      type,
    });
  } catch {
    return null;
  }
}

function sectionHeading(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 26, font: FONT, color: '000000' })],
    spacing: { before: 520, after: 260 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC' } },
  });
}

function bulletParagraph(text, accentColor = 'E8352A') {
  return new Paragraph({
    children: [
      new TextRun({ text: '● ', color: accentColor, size: 20, font: FONT }),
      new TextRun({ text, size: 20, font: FONT }),
    ],
    indent: { left: 360, hanging: 360 },
    spacing: { after: 60 },
  });
}

function skillsTable(rows) {
  const col1 = Math.round(CONTENT_W * 0.26);
  const col2 = CONTENT_W - col1;
  const cellBorders = {
    top: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD' },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD' },
    left: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD' },
    right: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD' },
  };
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    columnWidths: [col1, col2],
    rows: rows.map(row =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 26, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.CLEAR, fill: 'F5F5F5' },
            borders: cellBorders,
            children: [new Paragraph({
              children: [new TextRun({ text: row.category, bold: true, size: 20, font: FONT })],
              spacing: { before: 60, after: 60 },
            })],
          }),
          new TableCell({
            width: { size: 74, type: WidthType.PERCENTAGE },
            borders: cellBorders,
            children: [new Paragraph({
              children: [new TextRun({ text: row.items, size: 20, font: FONT })],
              spacing: { before: 60, after: 60 },
            })],
          }),
        ],
      })
    ),
  });
}

export async function exportDOCX(cvData, template) {
  const color = accentHex(template);

  // Header — logo if available, else company name text
  const logoRun = await getLogoImageRun(template.logoUrl, template.id === 'qarea');
  const headerPara = new Paragraph({
    alignment: AlignmentType.RIGHT,
    children: logoRun
      ? [logoRun]
      : [new TextRun({ text: template.displayName, bold: true, size: 28, color, font: FONT })],
    spacing: { before: 0, after: 100 },
  });

  // Footer — single paragraph with right tab stop (avoids table cell sizing bugs)
  const leftText = template.footerLeft || template.displayName;
  const rightParts = [
    ...(template.id === 'qarea' ? [template.website, template.email] : []),
    ...(template.id !== 'qarea' && template.website ? [template.website] : []),
    ...(template.id !== 'qarea' && template.email ? [template.email] : []),
    ...(template.phone ? template.phone.split('\n').map(p => p.trim()) : []),
  ].filter(Boolean);

  const footerChildren = [
    new Paragraph({
      tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_W }],
      children: [
        new TextRun({ text: leftText, bold: true, size: 18, color: '333333', font: FONT }),
        new TextRun({ text: '\t', size: 18, font: FONT }),
        new TextRun({ text: rightParts.join('   '), size: 16, color: template.id === 'qarea' ? '1a6fc4' : color, font: FONT }),
      ],
    }),
  ];

  const docChildren = [
    new Paragraph({
      children: [new TextRun({ text: cvData.name, bold: true, size: 68, font: FONT, color: '000000' })],
      spacing: { before: 200, after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({ text: cvData.title, bold: true, size: 32, font: FONT, color })],
      spacing: { after: 240 },
    }),
    sectionHeading('GENERAL QUALIFICATION'),
    ...(cvData.summary || []).map(l => bulletParagraph(l, accentHex(template))),
    new Paragraph({ children: [], spacing: { after: 120 } }),
    ...(cvData.skillsTable?.length ? [skillsTable(cvData.skillsTable), new Paragraph({ children: [], spacing: { after: 200 } })] : []),
    ...(cvData.employmentHistory?.length ? [
      sectionHeading('EMPLOYMENT HISTORY'),
      ...cvData.employmentHistory.map(job =>
        new Paragraph({
          children: [
            new TextRun({ text: '● ', color: accentHex(template), size: 20, font: FONT }),
            new TextRun({ text: job.period ? `${job.period}, ` : '', bold: true, size: 20, font: FONT }),
            new TextRun({ text: job.role, size: 20, font: FONT }),
          ],
          indent: { left: 360, hanging: 360 },
          spacing: { after: 60 },
        })
      ),
      new Paragraph({ children: [], spacing: { after: 200 } }),
    ] : []),
    ...(cvData.projects?.length ? [
      sectionHeading('EXPERIENCE'),
      ...cvData.projects.flatMap(proj => [
        new Paragraph({
          children: [new TextRun({ text: proj.name, bold: true, size: 20, font: FONT, color })],
          spacing: { before: 160, after: 60 },
        }),
        ...(proj.environment ? [new Paragraph({
          children: [new TextRun({ text: 'Environment: ', bold: true, size: 20, font: FONT }), new TextRun({ text: proj.environment, size: 20, font: FONT })],
          spacing: { after: 40 },
        })] : []),
        ...(proj.description ? [new Paragraph({
          children: [new TextRun({ text: 'Description: ', bold: true, size: 20, font: FONT }), new TextRun({ text: proj.description, size: 20, font: FONT })],
          spacing: { after: 40 },
        })] : []),
        ...(proj.responsibilities ? [new Paragraph({
          children: [new TextRun({ text: 'Responsibilities: ', bold: true, size: 20, font: FONT }), new TextRun({ text: proj.responsibilities, size: 20, font: FONT })],
          spacing: { after: 40 },
        })] : []),
        ...(proj.testingTypes ? [new Paragraph({
          children: [new TextRun({ text: 'Testing types: ', bold: true, size: 20, font: FONT }), new TextRun({ text: proj.testingTypes, size: 20, font: FONT })],
          spacing: { after: 60 },
        })] : []),
      ]),
      new Paragraph({ children: [], spacing: { after: 200 } }),
    ] : []),
    ...(cvData.additionalSections || []).flatMap(sec => [
      sectionHeading(sec.title.toUpperCase()),
      ...sec.bullets.map(b => bulletParagraph(b, accentHex(template))),
      new Paragraph({ children: [], spacing: { after: 200 } }),
    ]),
    ...(cvData.languages?.length ? [
      sectionHeading('COMMUNICATION SKILLS'),
      ...cvData.languages.map(l => new Paragraph({
        children: [
          new TextRun({ text: '● ', color: accentHex(template), size: 20, font: FONT }),
          new TextRun({ text: `${l.language}: `, bold: true, size: 20, font: FONT }),
          new TextRun({ text: `${l.level}.`, size: 20, font: FONT }),
        ],
        indent: { left: 360, hanging: 360 },
        spacing: { after: 60 },
      })),
      new Paragraph({ children: [], spacing: { after: 200 } }),
    ] : []),
    ...(cvData.education?.length ? [
      sectionHeading('EDUCATION'),
      ...cvData.education.map(e => bulletParagraph(e, accentHex(template))),
      new Paragraph({ children: [], spacing: { after: 200 } }),
    ] : []),
  ];

  const doc = new Document({
    sections: [{
      headers: { default: new Header({ children: [headerPara] }) },
      footers: {
        default: new Footer({
          children: [
            ...(template.confidentialText ? [new Paragraph({
              children: [new TextRun({ text: template.confidentialText, size: 16, font: FONT })],
            })] : []),
            ...footerChildren,
          ],
        }),
      },
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(0.75),
            right: convertInchesToTwip(0.9),
            bottom: convertInchesToTwip(0.75),
            left: convertInchesToTwip(0.9),
          },
        },
      },
      children: docChildren,
    }],
  });

  return Packer.toBlob(doc);
}
