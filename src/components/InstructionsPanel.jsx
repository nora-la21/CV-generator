export default function InstructionsPanel({ value, onChange, disabled }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon">📋</div>
        <h2 className="card-title">Job Description</h2>
      </div>

      <textarea
        className="instructions-area"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={`Paste the full job description here — requirements, responsibilities, company info. The more detail, the better the result.\n\nOr write direct instructions: "add more emphasis on leadership", "reorder sections", "add a professional summary".`}
      />
      <p className="char-count">{value.length.toLocaleString()} characters</p>
    </div>
  );
}
