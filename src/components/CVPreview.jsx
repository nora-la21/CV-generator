import { TEMPLATES } from '../templates';

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

  const t = TEMPLATES[company] || TEMPLATES.qarea;

  return (
    <div className="cv-preview-wrap">
      <div className="cv-document">
        {/* Logo */}
        <div className="cv-doc-header">
          <img
            src={t.logoUrl}
            alt={t.displayName}
            onError={(e) => {
              e.target.style.display = 'none';
              if (!e.target.nextSibling) {
                const span = document.createElement('span');
                span.className = 'logo-placeholder';
                span.textContent = t.displayName;
                e.target.parentNode.appendChild(span);
              }
            }}
          />
        </div>

        {/* Name & title */}
        <div className="cv-candidate-name">{cvData.name}</div>
        <div className="cv-candidate-title" style={{ color: t.accentColor }}>{cvData.title}</div>

        {/* General Qualification */}
        <div className="cv-section-heading">GENERAL QUALIFICATION</div>
        {cvData.summary?.length > 0 && (
          <ul className="cv-bullets">
            {cvData.summary.map((l, i) => <li key={i}>{l}</li>)}
          </ul>
        )}
        {cvData.skillsTable?.length > 0 && (
          <table className="cv-skills-table">
            <tbody>
              {cvData.skillsTable.map((row, i) => (
                <tr key={i}><td>{row.category}</td><td>{row.items}</td></tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Employment */}
        {cvData.employmentHistory?.length > 0 && (
          <>
            <div className="cv-section-heading">EMPLOYMENT HISTORY</div>
            <ul className="cv-bullets">
              {cvData.employmentHistory.map((job, i) => (
                <li key={i}>{job.period && <strong>{job.period}, </strong>}{job.role}</li>
              ))}
            </ul>
          </>
        )}

        {/* Education */}
        {cvData.education?.length > 0 && (
          <>
            <div className="cv-section-heading">EDUCATION</div>
            <ul className="cv-bullets">
              {cvData.education.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </>
        )}

        {/* Additional */}
        {cvData.additionalSections?.map((sec, i) => (
          <div key={i}>
            <div className="cv-section-heading">{sec.title.toUpperCase()}</div>
            <ul className="cv-bullets">{sec.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>
          </div>
        ))}

        {/* Footer */}
        <div className="cv-doc-footer">
          <div>
            {t.confidentialText && <div style={{ color: '#888', marginBottom: 2, fontSize: 10 }}>{t.confidentialText}</div>}
            <div className="footer-brand" style={{ color: t.footerLeft ? '#333' : t.accentColor }}>
              {t.footerLeft || t.displayName}
            </div>
            {t.website && <div style={{ fontSize: 11 }}><a href={`https://${t.website}`} target="_blank" rel="noreferrer" style={{ color: t.accentColor }}>{t.website}</a></div>}
          </div>
          <div className="footer-right" style={{ fontSize: 11, color: t.accentColor }}>
            {t.email && <div>{t.email}</div>}
            {t.phone && t.phone.split('\n').map((p, i) => <div key={i}>{p}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
