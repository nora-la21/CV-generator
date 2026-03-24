import { TEMPLATES } from '../templates';

export default function CVPreview({ cvData, company, loading }) {
  if (loading) {
    return (
      <div className="cv-preview-card">
        <div className="spinner-wrap">
          <div className="spinner" />
          <p>Tailoring your CV with AI…</p>
        </div>
      </div>
    );
  }

  if (!cvData) {
    return (
      <div className="cv-preview-placeholder">
        <div className="ph-icon">📄</div>
        <p>Your tailored CV will appear here</p>
        <p className="ph-sub">Upload a CV and add instructions to get started</p>
      </div>
    );
  }

  const t = TEMPLATES[company] || TEMPLATES.qarea;
  const isQarea = company === 'qarea';

  return (
    <div className="cv-preview-card">
      <div className="cv-document">
        {isQarea ? (
          <div style={{ margin: '-48px -56px 24px', height: 105, position: 'relative' }}>
            <img
              src={import.meta.env.BASE_URL + t.logoUrl}
              alt={t.displayName}
              style={{ position: 'absolute', top: 10, right: 20, height: 85, width: 'auto' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        ) : (
          <div className="cv-doc-header">
            <img
              src={import.meta.env.BASE_URL + t.logoUrl}
              alt={t.displayName}
              style={{ maxHeight: 44, width: 'auto' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        )}

        <div className="cv-candidate-name">{cvData.name}</div>
        <div className="cv-candidate-title" style={{ color: t.accentColor }}>{cvData.title}</div>

        <div className="cv-section-heading">General Qualification</div>
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

        {cvData.employmentHistory?.length > 0 && (
          <>
            <div className="cv-section-heading">Employment History</div>
            <ul className="cv-bullets">
              {cvData.employmentHistory.map((job, i) => (
                <li key={i}>{job.period && <strong>{job.period}, </strong>}{job.role}</li>
              ))}
            </ul>
          </>
        )}

        {cvData.projects?.length > 0 && (
          <>
            <div className="cv-section-heading">Experience</div>
            {cvData.projects.map((proj, i) => (
              <div key={i} className="cv-project">
                <div className="cv-project-name" style={{ color: t.accentColor }}>{proj.name}</div>
                {proj.environment && <p className="cv-project-line"><strong>Environment:</strong> {proj.environment}</p>}
                {proj.description && <p className="cv-project-line"><strong>Description:</strong> {proj.description}</p>}
                {proj.responsibilities && <p className="cv-project-line"><strong>Responsibilities:</strong> {proj.responsibilities}</p>}
                {proj.testingTypes && <p className="cv-project-line"><strong>Testing types:</strong> {proj.testingTypes}</p>}
              </div>
            ))}
          </>
        )}

        {cvData.additionalSections?.map((sec, i) => (
          <div key={i}>
            <div className="cv-section-heading">{sec.title.toUpperCase()}</div>
            <ul className="cv-bullets">{sec.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>
          </div>
        ))}

        {cvData.languages?.length > 0 && (
          <div>
            <div className="cv-section-heading">Communication Skills</div>
            <ul className="cv-bullets">
              {cvData.languages.map((l, i) => (
                <li key={i}><strong>{l.language}:</strong> {l.level}.</li>
              ))}
            </ul>
          </div>
        )}

        {cvData.education?.length > 0 && (
          <>
            <div className="cv-section-heading">Education</div>
            <ul className="cv-bullets">{cvData.education.map((e, i) => <li key={i}>{e}</li>)}</ul>
          </>
        )}

        {isQarea ? (
          <div style={{ marginTop: 48, paddingTop: 12, borderTop: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: '#333' }}>
            <div>by <strong style={{ color: '#1a1a1a' }}>QAREA</strong></div>
            <div style={{ display: 'flex', gap: 20 }}>
              {t.website && <a href={`https://${t.website}`} target="_blank" rel="noreferrer" style={{ color: '#1a6fc4' }}>{t.website}</a>}
              {t.email && <a href={`mailto:${t.email}`} style={{ color: '#1a6fc4' }}>{t.email}</a>}
            </div>
          </div>
        ) : (
          <div className="cv-doc-footer">
            <div>
              {t.confidentialText && <div style={{ color: '#999', fontSize: 10, marginBottom: 2 }}>{t.confidentialText}</div>}
              <div className="footer-brand" style={{ color: t.footerLeft ? '#333' : t.accentColor }}>
                {t.footerLeft || t.displayName}
              </div>
              {t.website && <div><a href={`https://${t.website}`} target="_blank" rel="noreferrer">{t.website}</a></div>}
            </div>
            <div className="footer-right" style={{ color: t.accentColor }}>
              {t.email && <div>{t.email}</div>}
              {t.phone && t.phone.split('\n').map((p, i) => <div key={i}>{p}</div>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
