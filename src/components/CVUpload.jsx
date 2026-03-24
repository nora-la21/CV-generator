import { useRef, useState } from 'react';

export default function CVUpload({ onUpload, filename, loading }) {
  const inputRef = useRef();
  const [dragOver, setDragOver] = useState(false);

  function handleFiles(files) {
    if (files?.[0]) onUpload(files[0]);
  }

  return (
    <div className="panel-section">
      <span className="section-label">Upload CV</span>
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
            <div className="upload-icon">✅</div>
            <p className="file-name">{filename}</p>
            <p className="change-link">Click to replace</p>
          </>
        ) : (
          <>
            <div className="upload-icon">📄</div>
            <p><strong>Click to upload</strong> or drag &amp; drop</p>
            <p style={{ fontSize: '11px', marginTop: '4px' }}>PDF, DOC, DOCX — up to 10MB</p>
          </>
        )}
      </div>
    </div>
  );
}
