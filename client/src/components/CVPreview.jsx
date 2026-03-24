const COMPANY_CONFIG = {
  qarea: {
    footerLeft: 'by QAREA',
    footerRight: 'www.qarea.com   business@qarea.com',
    logo: '/logos/qarea.png',
    fallbackName: 'QAREA',
  },
  testfort: {
    confidential: 'Commercial-in-Confidence',
    brand: 'TestFort',
    website: 'testfort.com',
    phone: '+4 143 508 0794  |  +1 310 388 93 34',
    logo: '/logos/testfort.png',
    fallbackName: 'TESTFORT',
  },
};

export default function CVPreview({ cvData, company, loading }) {
  if (loading) {
    return (
      <div className="cv-preview-wrap">
        <div className="spinner-wrap">
          <div className="spinner" />
          <p>Generating your CV with AI…</p>
        </div>
      </div>
    );
  }

  if (!cvData) {
    return (
      <div className="cv-preview-placeholder">
        <div className="placeholder-icon">📋</div>
        <p>Your generated CV will appear here</p>
        <p style={{ fontSize: '12px' }}>Upload a CV and write instructions to get started</p>
      </div>
    );
  }

  const cfg = COMPANY_CONFIG[company] || COMPANY_CONFIG.qarea;

  return (
    <div className="cv-preview-wrap">
      <div className="cv-document">
        {/* Logo header */}
        <div className="cv-doc-header">
          <img
            src={cfg.logo}
            alt={cfg.fallbackName}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.insertAdjacentHTML('afterend', `<span class="logo-placeholder">${cfg.fallbackName}</span>`);
            }}
          />
        </div>

        {/* Name & title */}
        <div className="cv-candidate-name">{cvData.name}</div>
        <div className="cv-candidate-title">{cvData.title}</div>

        {/* General Qualification */}
        <div className="cv-section-heading">General Qualification</div>
        {cvData.summary && cvData.summary.length > 0 && (
          <ul className="cv-bullets">
            {cvData.summary.map((line, i) => <li key={i}>{line}</li>)}
          </ul>
        )}
        {cvData.skillsTable && cvData.skillsTable.length > 0 && (
          <table className="cv-skills-table">
            <tbody>
              {cvData.skillsTable.map((row, i) => (
                <tr key={i}>
                  <td>{row.category}</td>
                  <td>{row.items}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Employment History */}
        {cvData.employmentHistory && cvData.employmentHistory.length > 0 && (
          <>
            <div className="cv-section-heading">Employment History</div>
            <ul className="cv-bullets">
              {cvData.employmentHistory.map((job, i) => (
                <li key={i}>
                  {job.period && <strong>{job.period}, </strong>}
                  {job.role}
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Education */}
        {cvData.education && cvData.education.length > 0 && (
          <>
            <div className="cv-section-heading">Education</div>
            <ul className="cv-bullets">
              {cvData.education.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </>
        )}

        {/* Additional sections */}
        {cvData.additionalSections && cvData.additionalSections.map((sec, i) => (
          <div key={i}>
            <div className="cv-section-heading">{sec.title}</div>
            <ul className="cv-bullets">
              {sec.bullets.map((b, j) => <li key={j}>{b}</li>)}
            </ul>
          </div>
        ))}

        {/* Footer */}
        <div className="cv-doc-footer">
          <div>
            {cfg.confidential && <div style={{ color: '#888', marginBottom: 2 }}>{cfg.confidential}</div>}
            <div className="footer-brand">{cfg.brand || cfg.footerLeft}</div>
            {cfg.website && <div><a href={`https://${cfg.website}`} target="_blank" rel="noreferrer">{cfg.website}</a></div>}
          </div>
          <div className="footer-right">
            {cfg.footerRight && cfg.footerRight.split('   ').map((part, i) => (
              <div key={i}><a href={part.startsWith('www') ? `https://${part}` : `mailto:${part}`}>{part}</a></div>
            ))}
            {cfg.phone && <div>{cfg.phone}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
