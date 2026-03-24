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
        placeholder={`Optional — paste a job description to tailor the CV for a specific role, or write direct instructions: "add more emphasis on leadership", "reorder sections", "add a professional summary".\n\nLeave empty to simply format the CV for the selected template.`}
      />
      <p className="char-count">{value.length.toLocaleString()} characters</p>
    </div>
  );
}
