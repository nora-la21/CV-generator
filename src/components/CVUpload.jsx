import { useRef, useState } from 'react';

function UploadZone({ onUpload, filename, loading, label, hint, icon }) {
  const inputRef = useRef();
  const [dragOver, setDragOver] = useState(false);

  function handleFiles(files) {
    if (files?.[0]) onUpload(files[0]);
  }

  return (
    <div
      className={`upload-zone${dragOver ? ' drag-over' : ''}${filename ? ' has-file' : ''}`}
      onClick={() => !loading && inputRef.current.click()}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
    >
      <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleFiles(e.target.files)} />
      {filename ? (
        <>
          <div className="upload-icon-wrap">✅</div>
          <p className="file-name">{filename}</p>
          <p className="change">Click to replace</p>
        </>
      ) : (
        <>
          <div className="upload-icon-wrap">{icon}</div>
          <p><strong>{label}</strong> or click to browse</p>
          <p className="hint">{hint}</p>
        </>
      )}
    </div>
  );
}

export default function CVUpload({ onUpload, filename, loading, onReferenceUpload, referenceFilename, referenceLoading }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon">📎</div>
        <h2 className="card-title">CVs</h2>
      </div>

      <p className="card-section-label">Reference CV <span className="optional-badge">optional</span></p>
      <UploadZone
        onUpload={onReferenceUpload}
        filename={referenceFilename}
        loading={referenceLoading}
        label="Drop a finished example CV here"
        hint="Used to match format & structure — PDF, DOCX"
        icon="🗂️"
      />

      <p className="card-section-label" style={{ marginTop: 16 }}>Candidate CV</p>
      <UploadZone
        onUpload={onUpload}
        filename={filename}
        loading={loading}
        label="Drop your CV here"
        hint="Supports PDF, DOCX"
        icon="📎"
      />
    </div>
  );
}
