import { useRef, useState } from 'react';

export default function CVUpload({ onUpload, filename, loading }) {
  const inputRef = useRef();
  const [dragOver, setDragOver] = useState(false);

  function handleFiles(files) {
    if (files?.[0]) onUpload(files[0]);
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon">📎</div>
        <h2 className="card-title">Your Current CV</h2>
      </div>

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
            <div className="upload-icon-wrap">📎</div>
            <p><strong>Drop your CV here</strong> or click to browse</p>
            <p className="hint">Supports PDF, DOCX</p>
          </>
        )}
      </div>
    </div>
  );
}
