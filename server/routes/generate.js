const express = require('express');
const { processCV } = require('../services/claudeService');
const { generateDOCX } = require('../services/docxGenerator');
const { generatePDF } = require('../services/pdfGenerator');

const router = express.Router();

const templates = {
  qarea: require('../templates/qarea'),
  testfort: require('../templates/testfort'),
};

// POST /api/generate — process CV with Claude
router.post('/generate', async (req, res) => {
  try {
    const { cvText, instructions, company } = req.body;

    if (!cvText || !cvText.trim()) {
      return res.status(400).json({ error: 'CV text is required' });
    }
    if (!instructions || !instructions.trim()) {
      return res.status(400).json({ error: 'Instructions are required' });
    }
    if (!templates[company]) {
      return res.status(400).json({ error: 'Invalid company. Choose "qarea" or "testfort"' });
    }

    const cvData = await processCV(cvText, instructions);

    res.json({ success: true, cvData });
  } catch (err) {
    console.error('Generate error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate CV' });
  }
});

// POST /api/export — export CV as DOCX or PDF
router.post('/export', async (req, res) => {
  try {
    const { cvData, company, format } = req.body;

    if (!cvData) return res.status(400).json({ error: 'CV data is required' });
    if (!templates[company]) return res.status(400).json({ error: 'Invalid company' });
    if (!['docx', 'pdf'].includes(format)) return res.status(400).json({ error: 'Format must be "docx" or "pdf"' });

    const template = templates[company];
    const safeName = (cvData.name || 'CV').replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '_');
    const filename = `${safeName}_${template.displayName}.${format}`;

    if (format === 'docx') {
      const buffer = await generateDOCX(cvData, template);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } else {
      const buffer = await generatePDF(cvData, template);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    }
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: err.message || 'Failed to export CV' });
  }
});

module.exports = router;
