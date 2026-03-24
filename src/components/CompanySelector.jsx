export default function CompanySelector({ selected, onChange }) {
  const companies = [
    { id: 'qarea', label: 'QArea', logo: '/logos/qarea.png' },
    { id: 'testfort', label: 'TestFort', logo: '/logos/testfort.png' },
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
            <img src={c.logo} alt={c.label} onError={(e) => { e.target.style.display = 'none'; }} />
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
