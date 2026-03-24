import { useState } from 'react';
import { parseCV } from './services/cvParser';
import { processCV } from './services/claudeService';
import ApiKeyInput from './components/ApiKeyInput';
import CompanySelector from './components/CompanySelector';
import CVUpload from './components/CVUpload';
import InstructionsPanel from './components/InstructionsPanel';
import CVPreview from './components/CVPreview';
import DownloadButtons from './components/DownloadButtons';

const STORAGE_KEY = 'cv_generator_api_key';

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(STORAGE_KEY) || '');
  const [company, setCompany] = useState('qarea');
  const [cvText, setCvText] = useState('');
  const [filename, setFilename] = useState('');
  const [instructions, setInstructions] = useState('');
  const [cvData, setCvData] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [parseError, setParseError] = useState('');
  const [generateError, setGenerateError] = useState('');
  const [parseStatus, setParseStatus] = useState('');

  function saveApiKey(key) {
    setApiKey(key);
    localStorage.setItem(STORAGE_KEY, key);
  }

  async function handleUpload(file) {
    setParseError('');
    setParseStatus('');
    setParsing(true);
    setCvText('');
    setFilename('');
    setCvData(null);
    try {
      const text = await parseCV(file);
      if (!text || text.length < 50) throw new Error('Could not extract readable text. Is the PDF text-based (not scanned)?');
      setCvText(text);
      setFilename(file.name);
      setParseStatus(`✓ Loaded — ${text.length.toLocaleString()} characters`);
    } catch (err) {
      setParseError(err.message);
    } finally {
      setParsing(false);
    }
  }

  async function handleGenerate() {
    if (!apiKey) { setGenerateError('Please enter your Anthropic API key first.'); return; }
    if (!cvText) { setGenerateError('Please upload a CV first.'); return; }
    if (!instructions.trim()) { setGenerateError('Please enter instructions.'); return; }

    setGenerateError('');
    setGenerating(true);
    setCvData(null);
    try {
      const data = await processCV(apiKey, cvText, instructions);
      setCvData(data);
    } catch (err) {
      const msg = err.status === 401
        ? 'Invalid API key. Please check your Anthropic API key.'
        : err.message || 'Failed to generate CV. Please try again.';
      setGenerateError(msg);
    } finally {
      setGenerating(false);
    }
  }

  const canGenerate = !!apiKey && !!cvText && !!instructions.trim() && !parsing && !generating;

  return (
    <div className="app">
      <header className="app-header">
        <h1>CV <span className="accent">Generator</span></h1>
      </header>
      <div className="app-body">
        <main className="left-panel">
          <CVPreview cvData={cvData} company={company} loading={generating} />
        </main>
        <aside className="right-panel">
          <div className="right-panel-inner">
            <ApiKeyInput apiKey={apiKey} onSave={saveApiKey} />
            <CompanySelector selected={company} onChange={setCompany} />
            <CVUpload onUpload={handleUpload} filename={filename} loading={parsing} />
            {parsing && <div className="status-msg">⏳ Reading CV…</div>}
            {parseStatus && !parsing && <div className="status-msg">{parseStatus}</div>}
            {parseError && <div className="error-msg">{parseError}</div>}
            <InstructionsPanel value={instructions} onChange={setInstructions} disabled={generating} />
            {generateError && <div className="error-msg">{generateError}</div>}
            <button className="generate-btn" onClick={handleGenerate} disabled={!canGenerate}>
              {generating ? 'Generating…' : '✨ Generate CV'}
            </button>
            <DownloadButtons cvData={cvData} company={company} disabled={!cvData || generating} />
          </div>
        </aside>
      </div>
    </div>
  );
}
