import axios from 'axios';
import { useState } from 'react';

const API = '/api';

export default function DownloadButtons({ cvData, company, disabled }) {
  const [downloading, setDownloading] = useState(null);
  const [error, setError] = useState('');

  async function download(format) {
    if (!cvData) return;
    setError('');
    setDownloading(format);
    try {
      const res = await axios.post(
        `${API}/export`,
        { cvData, company, format },
        { responseType: 'blob' }
      );

      const mime = format === 'docx'
        ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        : 'application/pdf';

      const url = URL.createObjectURL(new Blob([res.data], { type: mime }));
      const a = document.createElement('a');
      const safeName = (cvData.name || 'CV').replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '_');
      a.href = url;
      a.download = `${safeName}_${company}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(`Failed to download ${format.toUpperCase()}: ${err.response?.data?.error || err.message}`);
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="panel-section">
      <span className="section-label">Download</span>
      <div className="download-btns">
        <button
          className="download-btn"
          onClick={() => download('docx')}
          disabled={disabled || !!downloading}
        >
          {downloading === 'docx' ? '⏳' : '📝'} DOCX
        </button>
        <button
          className="download-btn"
          onClick={() => download('pdf')}
          disabled={disabled || !!downloading}
        >
          {downloading === 'pdf' ? '⏳' : '📄'} PDF
        </button>
      </div>
      {error && <div className="error-msg">{error}</div>}
    </div>
  );
}
