import { useState } from 'react';
import axios from 'axios';
import CompanySelector from './components/CompanySelector';
import CVUpload from './components/CVUpload';
import InstructionsPanel from './components/InstructionsPanel';
import CVPreview from './components/CVPreview';
import DownloadButtons from './components/DownloadButtons';

const API = import.meta.env.VITE_API_URL || '/api';

export default function App() {
  const [company, setCompany] = useState('qarea');
  const [cvText, setCvText] = useState('');
  const [filename, setFilename] = useState('');
  const [instructions, setInstructions] = useState('');
  const [cvData, setCvData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [generateError, setGenerateError] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');

  async function handleUpload(file) {
    setUploadError('');
    setUploadStatus('');
    setUploading(true);
    setCvText('');
    setFilename('');
    setCvData(null);

    const formData = new FormData();
    formData.append('cv', file);

    try {
      const res = await axios.post(`${API}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setCvText(res.data.cvText);
      setFilename(res.data.filename);
      setUploadStatus(`✓ CV loaded — ${res.data.charCount.toLocaleString()} characters extracted`);
    } catch (err) {
      setUploadError(err.response?.data?.error || 'Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  async function handleGenerate() {
    if (!cvText) { setGenerateError('Please upload a CV first.'); return; }
    if (!instructions.trim()) { setGenerateError('Please enter instructions.'); return; }

    setGenerateError('');
    setGenerating(true);
    setCvData(null);

    try {
      const res = await axios.post(`${API}/generate`, { cvText, instructions, company });
      setCvData(res.data.cvData);
    } catch (err) {
      setGenerateError(err.response?.data?.error || 'Failed to generate CV. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  const canGenerate = !!cvText && !!instructions.trim() && !uploading && !generating;

  return (
    <div className="app">
      <header className="app-header">
        <h1>CV <span className="accent">Generator</span></h1>
      </header>

      <div className="app-body">
        {/* Left: CV Preview */}
        <main className="left-panel">
          <CVPreview cvData={cvData} company={company} loading={generating} />
        </main>

        {/* Right: Controls */}
        <aside className="right-panel">
          <div className="right-panel-inner">
            <CompanySelector selected={company} onChange={setCompany} />

            <CVUpload
              onUpload={handleUpload}
              filename={filename}
              loading={uploading}
            />

            {uploading && (
              <div className="status-msg">⏳ Extracting text from CV…</div>
            )}
            {uploadStatus && !uploading && (
              <div className="status-msg">{uploadStatus}</div>
            )}
            {uploadError && (
              <div className="error-msg">{uploadError}</div>
            )}

            <InstructionsPanel
              value={instructions}
              onChange={setInstructions}
              disabled={generating}
            />

            {generateError && (
              <div className="error-msg">{generateError}</div>
            )}

            <button
              className="generate-btn"
              onClick={handleGenerate}
              disabled={!canGenerate}
            >
              {generating ? 'Generating…' : '✨ Generate CV'}
            </button>

            <DownloadButtons
              cvData={cvData}
              company={company}
              disabled={!cvData || generating}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
