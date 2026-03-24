import { useState } from 'react';

export default function ApiKeyInput({ apiKey, onSave }) {
  const [value, setValue] = useState(apiKey || '');
  const [saved, setSaved] = useState(!!apiKey);
  const [visible, setVisible] = useState(false);

  function handleSave() {
    if (!value.trim()) return;
    onSave(value.trim());
    setSaved(true);
  }

  function handleChange(e) {
    setValue(e.target.value);
    setSaved(false);
  }

  function handleKey(e) {
    if (e.key === 'Enter') handleSave();
  }

  return (
    <div className="navbar-api">
      <span className="navbar-api-label">API Key</span>
      <input
        type={visible ? 'text' : 'password'}
        className="navbar-api-input"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKey}
        placeholder="sk-ant-..."
        autoComplete="off"
      />
      <button
        className={`navbar-api-save${saved ? ' saved' : ''}`}
        onClick={handleSave}
        disabled={!value.trim()}
        title={visible ? 'Hide key' : 'Show key'}
        onDoubleClick={() => setVisible(v => !v)}
      >
        {saved ? '✓ Saved' : 'Save'}
      </button>
    </div>
  );
}
