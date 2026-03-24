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
      setParseStatus(`✓ ${file.name} — ${text.length.toLocaleString()} characters`);
    } catch (err) {
      setParseError(err.message);
    } finally {
      setParsing(false);
    }
  }

  async function handleGenerate() {
    if (!apiKey) { setGenerateError('Enter your Anthropic API key in the top bar first.'); return; }
    if (!cvText) { setGenerateError('Please upload a CV first.'); return; }
    if (!instructions.trim()) { setGenerateError('Please paste a job description or write instructions.'); return; }
    setGenerateError('');
    setGenerating(true);
    setCvData(null);
    try {
      const data = await processCV(apiKey, cvText, instructions);
      setCvData(data);
    } catch (err) {
      const msg = err.status === 401
        ? 'Invalid API key — please check it in the top bar.'
        : err.message || 'Something went wrong. Please try again.';
      setGenerateError(msg);
    } finally {
      setGenerating(false);
    }
  }

  const canGenerate = !!apiKey && !!cvText && !!instructions.trim() && !parsing && !generating;

  // Which steps are "done"
  const step1done = !!cvText;
  const step2done = !!instructions.trim();
  const step3done = !!cvData;

  return (
    <div className="app">
      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="navbar-brand">
          CV Generator <span className="diamond">✦</span>
        </div>
        <ApiKeyInput apiKey={apiKey} onSave={saveApiKey} />
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        <h1 className="hero-title">
          Your CV, <span className="italic-accent">tailored</span> for every role
        </h1>
        <p className="hero-subtitle">
          Upload your CV, paste the job description — Claude rewrites it to match, in seconds.
        </p>
      </section>

      {/* ── Steps ── */}
      <div className="steps-bar">
        <div className={`step${step1done ? ' done' : ''}`}>
          <span className="step-num">1</span> Upload your CV
        </div>
        <div className="step-sep" />
        <div className={`step${step2done ? ' done' : ''}`}>
          <span className="step-num">2</span> Paste the job description
        </div>
        <div className="step-sep" />
        <div className={`step${step3done ? ' done' : ''}`}>
          <span className="step-num">3</span> Click Tailor CV
        </div>
        <div className="step-sep" />
        <div className={`step${step3done ? ' done' : ''}`}>
          <span className="step-num">4</span> Pick layout &amp; save
        </div>
      </div>

      {/* ── Main ── */}
      <main className="main-content">
        <CompanySelector selected={company} onChange={setCompany} />

        <div className="cards-grid">
          <CVUpload onUpload={handleUpload} filename={filename} loading={parsing} />
          <InstructionsPanel value={instructions} onChange={setInstructions} disabled={generating} />
        </div>

        {parsing && <div className="status-msg" style={{ marginBottom: 16 }}>⏳ Reading CV…</div>}
        {parseStatus && !parsing && <div className="status-msg" style={{ marginBottom: 16 }}>{parseStatus}</div>}
        {parseError && <div className="error-msg" style={{ marginBottom: 16 }}>{parseError}</div>}

        {/* ── Generate CTA ── */}
        <div className="generate-wrap">
          {generateError && <div className="error-msg">{generateError}</div>}
          <button className="generate-btn" onClick={handleGenerate} disabled={!canGenerate}>
            <span className="btn-diamond">✦</span>
            {generating ? 'Tailoring your CV…' : 'Tailor my CV'}
          </button>
        </div>

        {/* ── Result ── */}
        {(cvData || generating) && (
          <section className="result-section">
            <div className="result-header">
              <h2 className="result-title">Your tailored CV</h2>
              {cvData && <DownloadButtons cvData={cvData} company={company} disabled={generating} />}
            </div>
            <CVPreview cvData={cvData} company={company} loading={generating} />
          </section>
        )}
      </main>
    </div>
  );
}
