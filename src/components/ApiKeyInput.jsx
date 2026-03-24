import { useState } from 'react';

export default function ApiKeyInput({ apiKey, onSave }) {
  const [value, setValue] = useState(apiKey || '');
  const [visible, setVisible] = useState(false);
  const [saved, setSaved] = useState(!!apiKey);

  function handleSave() {
    if (!value.startsWith('sk-ant-')) {
      alert('That doesn\'t look like a valid Anthropic API key (should start with sk-ant-)');
      return;
    }
    onSave(value.trim());
    setSaved(true);
  }

  function handleChange(e) {
    setValue(e.target.value);
    setSaved(false);
  }

  return (
    <div className="panel-section">
      <label className="section-label">Anthropic API Key</label>
      <div className="api-key-row">
        <input
          type={visible ? 'text' : 'password'}
          className="api-key-input"
          value={value}
          onChange={handleChange}
          placeholder="sk-ant-api03-..."
          autoComplete="off"
        />
        <button className="icon-btn" onClick={() => setVisible(v => !v)} title={visible ? 'Hide' : 'Show'}>
          {visible ? '🙈' : '👁'}
        </button>
      </div>
      <button
        className={`save-key-btn${saved ? ' saved' : ''}`}
        onClick={handleSave}
        disabled={!value}
      >
        {saved ? '✓ Saved in browser' : 'Save key'}
      </button>
      <p className="instructions-hint">Stored only in your browser (localStorage). Never sent anywhere except Anthropic.</p>
    </div>
  );
}
