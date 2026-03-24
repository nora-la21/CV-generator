export default function InstructionsPanel({ value, onChange, disabled }) {
  return (
    <div className="panel-section">
      <label htmlFor="instructions" className="section-label">Instructions</label>
      <textarea
        id="instructions"
        className="instructions-area"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Paste a job description to tailor this CV to that role, or write specific instructions — e.g.:&#10;• 'Add more emphasis on leadership skills'&#10;• 'Reorder sections — put Education first'&#10;• 'Include a short professional summary'"
      />
      <p className="instructions-hint">
        Job description? The AI will embed required skills organically.
        Direct instructions? Changes are applied as specified.
      </p>
    </div>
  );
}
