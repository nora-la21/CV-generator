export default function CompanySelector({ selected, onChange }) {
  const companies = [
    { id: 'qarea', label: 'QArea' },
    { id: 'testfort', label: 'TestFort' },
  ];

  return (
    <div className="company-row">
      <span className="company-row-label">Template</span>
      <div className="company-btns">
        {companies.map((c) => (
          <button
            key={c.id}
            className={`company-btn${selected === c.id ? ' active' : ''}`}
            onClick={() => onChange(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
