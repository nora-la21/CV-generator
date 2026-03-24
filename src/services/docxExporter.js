import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, BorderStyle, AlignmentType, Header, Footer,
  ShadingType, convertInchesToTwip,
} from 'docx';

const FONT = 'Calibri';

// A4 page width minus 0.9" margins on each side (in twips)
const CONTENT_W = 9314;

function accentHex(template) {
  return template.accentColor.replace('#', '');
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
  const col1 = Math.round(CONTENT_W * 0.26);
  const col2 = CONTENT_W - col1;
  const cellBorders = {
    top: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD' },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD' },
    left: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD' },
    right: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD' },
  };
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    rows: rows.map(row =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: col1, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: 'F5F5F5' },
            borders: cellBorders,
            children: [new Paragraph({
              children: [new TextRun({ text: row.category, bold: true, size: 20, font: FONT })],
              spacing: { before: 60, after: 60 },
            })],
          }),
          new TableCell({
            width: { size: col2, type: WidthType.DXA },
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

  // Header — company name as text
  const headerPara = new Paragraph({
    alignment: AlignmentType.RIGHT,
    children: [new TextRun({ text: template.displayName, bold: true, size: 28, color, font: FONT })],
    spacing: { before: 0, after: 100 },
  });

  // Footer
  const noBorder = { style: BorderStyle.NONE };
  const halfW = Math.round(CONTENT_W / 2);

  const footerLeftChildren = [
    new Paragraph({
      children: [new TextRun({
        text: template.footerLeft || template.displayName,
        bold: true,
        size: 18,
        color: template.footerLeft ? '333333' : color,
        font: FONT,
      })],
    }),
    ...(template.website ? [new Paragraph({
      children: [new TextRun({ text: template.website, size: 16, color, font: FONT })],
    })] : []),
  ];

  const rightLines = [
    ...(template.email ? [template.email] : []),
    ...(template.phone ? template.phone.split('\n') : []),
  ];
  const footerRightChildren = rightLines.length
    ? rightLines.map(line => new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: line.trim(), size: 16, color, font: FONT })],
      }))
    : [new Paragraph({ children: [] })];

  const footerLeft = new TableCell({
    width: { size: halfW, type: WidthType.DXA },
    borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
    children: footerLeftChildren,
  });
  const footerRight = new TableCell({
    width: { size: halfW, type: WidthType.DXA },
    borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
    children: footerRightChildren,
  });

  const docChildren = [
    new Paragraph({
      children: [new TextRun({ text: cvData.name, bold: true, size: 52, font: FONT, color: '000000' })],
      spacing: { before: 200, after: 80 },
    }),
    new Paragraph({
      children: [new TextRun({ text: cvData.title, bold: true, size: 24, font: FONT, color })],
      spacing: { after: 240 },
    }),
    sectionHeading('GENERAL QUALIFICATION'),
    ...(cvData.summary || []).map(l => bulletParagraph(l)),
    new Paragraph({ children: [], spacing: { after: 120 } }),
    ...(cvData.skillsTable?.length ? [skillsTable(cvData.skillsTable), new Paragraph({ children: [], spacing: { after: 200 } })] : []),
    ...(cvData.employmentHistory?.length ? [
      sectionHeading('EMPLOYMENT HISTORY'),
      ...cvData.employmentHistory.map(job =>
        new Paragraph({
          bullet: { level: 0 },
          children: [
            new TextRun({ text: job.period ? `${job.period}, ` : '', bold: true, size: 20, font: FONT }),
            new TextRun({ text: job.role, size: 20, font: FONT }),
          ],
          spacing: { after: 60 },
        })
      ),
      new Paragraph({ children: [], spacing: { after: 200 } }),
    ] : []),
    ...(cvData.education?.length ? [
      sectionHeading('EDUCATION'),
      ...cvData.education.map(e => bulletParagraph(e)),
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
            ...(template.confidentialText ? [new Paragraph({
              children: [new TextRun({ text: template.confidentialText, size: 16, font: FONT })],
            })] : []),
            new Table({
              width: { size: CONTENT_W, type: WidthType.DXA },
              borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder, insideH: noBorder, insideV: noBorder },
              rows: [new TableRow({ children: [footerLeft, footerRight] })],
            }),
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
