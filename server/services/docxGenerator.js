const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, BorderStyle, AlignmentType, ImageRun, Header, Footer,
  ShadingType, HeadingLevel, convertInchesToTwip, PageNumber,
} = require('docx');
const fs = require('fs');
const path = require('path');

const FONT = 'Calibri';
const BASE_DIR = path.join(__dirname, '..');

function hexToRgb(hex) {
  const n = typeof hex === 'number' ? hex : parseInt(hex.replace('#', ''), 16);
  return {
    r: (n >> 16) & 0xff,
    g: (n >> 8) & 0xff,
    b: n & 0xff,
  };
}

function accentColor(template) {
  return template.accentColor.replace('#', '');
}

function getLogoImageRun(template) {
  const logoFullPath = path.join(BASE_DIR, template.logoPath);
  if (!fs.existsSync(logoFullPath)) return null;
  const logoBuffer = fs.readFileSync(logoFullPath);
  const ext = path.extname(template.logoPath).slice(1).toLowerCase();
  const type = ext === 'jpg' ? 'jpeg' : ext;
  return new ImageRun({
    data: logoBuffer,
    transformation: { width: 120, height: 40 },
    type,
  });
}

function buildHeader(template) {
  const children = [];
  const logoRun = getLogoImageRun(template);

  if (logoRun) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [logoRun],
        spacing: { before: 0, after: 100 },
      })
    );
  } else {
    children.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({
            text: template.displayName,
            bold: true,
            size: 28,
            color: accentColor(template),
            font: FONT,
          }),
        ],
      })
    );
  }

  return new Header({ children });
}

function buildFooter(template) {
  const children = [];

  if (template.confidentialText) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: template.confidentialText,
            size: 16,
            font: FONT,
          }),
        ],
      })
    );
  }

  // Footer brand row
  const leftCell = new TableCell({
    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: template.footerLeft || template.footerBrand,
            bold: true,
            size: 18,
            color: template.footerLeft ? '333333' : accentColor(template),
            font: FONT,
          }),
        ],
      }),
      ...(template.website ? [new Paragraph({
        children: [new TextRun({ text: template.website, size: 16, color: accentColor(template), font: FONT })],
      })] : []),
    ],
  });

  const rightParts = [];
  if (template.email) rightParts.push(template.email);
  if (template.phone) rightParts.push(template.phone);

  const rightCell = new TableCell({
    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: rightParts.map((part, i) => new TextRun({
          text: part,
          size: 16,
          font: FONT,
          color: accentColor(template),
          break: i > 0 ? 1 : 0,
        })),
      }),
    ],
  });

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE },
        insideH: { style: BorderStyle.NONE }, insideV: { style: BorderStyle.NONE },
      },
      rows: [
        new TableRow({
          children: [leftCell, rightCell],
        }),
      ],
    })
  );

  return new Footer({ children });
}

function sectionHeading(text) {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size: 22,
        font: FONT,
        color: '000000',
      }),
    ],
    spacing: { before: 300, after: 120 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC' },
    },
  });
}

function bulletParagraph(text, template) {
  return new Paragraph({
    bullet: { level: 0 },
    children: [
      new TextRun({ text, size: 20, font: FONT }),
    ],
    spacing: { after: 60 },
  });
}

function buildSkillsTable(skillsTable) {
  const rows = skillsTable.map(row =>
    new TableRow({
      children: [
        new TableCell({
          width: { size: 25, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.CLEAR, fill: 'F5F5F5' },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD' },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD' },
            left: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD' },
            right: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD' },
          },
          children: [
            new Paragraph({
              children: [new TextRun({ text: row.category, bold: true, size: 20, font: FONT })],
              spacing: { before: 60, after: 60 },
            }),
          ],
        }),
        new TableCell({
          width: { size: 75, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD' },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD' },
            left: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD' },
            right: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD' },
          },
          children: [
            new Paragraph({
              children: [new TextRun({ text: row.items, size: 20, font: FONT })],
              spacing: { before: 60, after: 60 },
            }),
          ],
        }),
      ],
    })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows,
  });
}

async function generateDOCX(cvData, template) {
  const color = accentColor(template);
  const docChildren = [];

  // Name
  docChildren.push(
    new Paragraph({
      children: [
        new TextRun({
          text: cvData.name,
          bold: true,
          size: 52,
          font: FONT,
          color: '000000',
        }),
      ],
      spacing: { before: 200, after: 80 },
    })
  );

  // Title
  docChildren.push(
    new Paragraph({
      children: [
        new TextRun({
          text: cvData.title,
          bold: true,
          size: 24,
          font: FONT,
          color,
        }),
      ],
      spacing: { after: 240 },
    })
  );

  // General Qualification
  docChildren.push(sectionHeading('GENERAL QUALIFICATION'));

  if (cvData.summary && cvData.summary.length > 0) {
    for (const line of cvData.summary) {
      docChildren.push(bulletParagraph(line, template));
    }
    docChildren.push(new Paragraph({ children: [], spacing: { after: 120 } }));
  }

  if (cvData.skillsTable && cvData.skillsTable.length > 0) {
    docChildren.push(buildSkillsTable(cvData.skillsTable));
    docChildren.push(new Paragraph({ children: [], spacing: { after: 200 } }));
  }

  // Employment History
  if (cvData.employmentHistory && cvData.employmentHistory.length > 0) {
    docChildren.push(sectionHeading('EMPLOYMENT HISTORY'));
    for (const job of cvData.employmentHistory) {
      const text = job.period
        ? `${job.period}, ${job.role}`
        : job.role;
      docChildren.push(
        new Paragraph({
          bullet: { level: 0 },
          children: [
            new TextRun({
              text: job.period ? `${job.period}, ` : '',
              bold: true,
              size: 20,
              font: FONT,
            }),
            new TextRun({
              text: job.period ? job.role : text,
              size: 20,
              font: FONT,
            }),
          ],
          spacing: { after: 60 },
        })
      );
    }
    docChildren.push(new Paragraph({ children: [], spacing: { after: 200 } }));
  }

  // Education
  if (cvData.education && cvData.education.length > 0) {
    docChildren.push(sectionHeading('EDUCATION'));
    for (const edu of cvData.education) {
      docChildren.push(bulletParagraph(edu, template));
    }
    docChildren.push(new Paragraph({ children: [], spacing: { after: 200 } }));
  }

  // Additional sections
  if (cvData.additionalSections && cvData.additionalSections.length > 0) {
    for (const section of cvData.additionalSections) {
      docChildren.push(sectionHeading(section.title.toUpperCase()));
      for (const bullet of section.bullets) {
        docChildren.push(bulletParagraph(bullet, template));
      }
      docChildren.push(new Paragraph({ children: [], spacing: { after: 200 } }));
    }
  }

  const doc = new Document({
    sections: [
      {
        headers: { default: buildHeader(template) },
        footers: { default: buildFooter(template) },
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
      },
    ],
  });

  return Packer.toBuffer(doc);
}

module.exports = { generateDOCX };
