import { useState } from 'react';
import { exportDOCX } from '../services/docxExporter';
import { exportPDF } from '../services/pdfExporter';
import { TEMPLATES } from '../templates';

export default function DownloadButtons({ cvData, company, disabled }) {
  const [downloading, setDownloading] = useState(null);
  const [error, setError] = useState('');

  async function download(format) {
    setError('');
    setDownloading(format);
    try {
      const template = TEMPLATES[company];
      const blob = format === 'docx'
        ? await exportDOCX(cvData, template)
        : await exportPDF(cvData, template);

      const safeName = (cvData.name || 'CV').replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '_');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${safeName}_${template.displayName}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(`Download failed: ${err.message}`);
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="panel-section">
      <span className="section-label">Download</span>
      <div className="download-btns">
        <button className="download-btn" onClick={() => download('docx')} disabled={disabled || !!downloading}>
          {downloading === 'docx' ? '⏳' : '📝'} DOCX
        </button>
        <button className="download-btn" onClick={() => download('pdf')} disabled={disabled || !!downloading}>
          {downloading === 'pdf' ? '⏳' : '📄'} PDF
        </button>
      </div>
      {error && <div className="error-msg">{error}</div>}
    </div>
  );
}
