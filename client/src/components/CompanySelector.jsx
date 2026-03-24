export default function CompanySelector({ selected, onChange }) {
  const companies = [
    { id: 'qarea', label: 'QArea', logo: '/logos/qarea.png' },
    { id: 'testfort', label: 'TestFort', logo: '/logos/testfort.png' },
  ];

  return (
    <div className="panel-section">
      <span className="section-label">Company Template</span>
      <div className="company-selector">
        {companies.map((c) => (
          <button
            key={c.id}
            className={`company-btn${selected === c.id ? ' active' : ''}`}
            onClick={() => onChange(c.id)}
            title={c.label}
          >
            <LogoOrFallback src={c.logo} alt={c.label} label={c.label} />
            <span>{c.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function LogoOrFallback({ src, alt, label }) {
  return (
    <img
      src={src}
      alt={alt}
      onError={(e) => {
        e.target.style.display = 'none';
        e.target.nextSibling && (e.target.nextSibling.style.display = 'block');
      }}
    />
  );
}
