const express = require('express');
const multer = require('multer');
const { parseCVBuffer } = require('../services/cvParser');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    const allowedExt = ['pdf', 'doc', 'docx'];
    const ext = file.originalname.split('.').pop().toLowerCase();
    if (allowed.includes(file.mimetype) || allowedExt.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are supported'));
    }
  },
});

router.post('/', upload.single('cv'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const cvText = await parseCVBuffer(
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname
    );

    if (!cvText || cvText.trim().length < 50) {
      return res.status(422).json({ error: 'Could not extract text from the uploaded file. Please ensure the file contains readable text.' });
    }

    res.json({
      success: true,
      filename: req.file.originalname,
      cvText,
      charCount: cvText.length,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message || 'Failed to parse CV file' });
  }
});

module.exports = router;
