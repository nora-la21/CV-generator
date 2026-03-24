const mammoth = require('mammoth');
const pdfParse = require('pdf-parse');

async function parseCVBuffer(buffer, mimetype, originalname) {
  const ext = originalname.split('.').pop().toLowerCase();

  if (ext === 'pdf' || mimetype === 'application/pdf') {
    return parsePDF(buffer);
  }
  if (['doc', 'docx'].includes(ext) ||
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimetype === 'application/msword') {
    return parseDOCX(buffer);
  }
  throw new Error(`Unsupported file type: ${ext}`);
}

async function parseDOCX(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value.trim();
}

async function parsePDF(buffer) {
  const result = await pdfParse(buffer);
  return result.text.trim();
}

module.exports = { parseCVBuffer };
