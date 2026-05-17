import React from 'react'
import { getFontCSS, getFontSize } from '../../utils/fonts'

const sorted = (arr) => [...(arr || [])].sort((a, b) => (a.order || 0) - (b.order || 0))
const ContactSep = () => <span style={{ color: '#ccc', margin: '0 4px' }}>|</span>

function CustomFields({ fields }) {
  if (!fields?.length) return null
  return (
    <div style={{ marginTop: '3px' }}>
      {fields.map((f, i) => (
        <div key={i} style={{ display: 'flex', gap: '6px', fontSize: '11px', marginBottom: '2px' }}>
          <span style={{ fontWeight: 600, color: '#333', minWidth: '80px' }}>{f.label}:</span>
          <span style={{ color: '#555' }}>{f.value}</span>
        </div>
      ))}
    </div>
  )
}

function getStyle(settings, sectionKey) {
  const s = settings?.sectionStyles?.[sectionKey] || {}
  return {
    fontFamily: getFontCSS(s.font || settings?.globalFont || 'garamond'),
    fontWeight: (s.bold || settings?.globalBold) ? 'bold' : 'normal',
    fontStyle: (s.italic || settings?.globalItalic) ? 'italic' : 'normal',
  }
}

function ProjectLinks({ github, link, preview = false }) {
  if (!github && !link) return null
  if (preview) {
    return (
      <div style={{ display: 'flex', gap: '10px', fontSize: '10px', color: '#666', marginTop: '2px' }}>
        {github && <span style={{ fontStyle: 'italic' }}>GitHub: {github}</span>}
        {link && <span style={{ fontStyle: 'italic' }}>Live: {link}</span>}
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', gap: '12px', fontSize: '11px' }}>
      {github && (
        <a href={`https://${github}`} target="_blank" rel="noreferrer"
          style={{ color: '#444', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
          ⌥ GitHub
        </a>
      )}
      {link && (
        <a href={`https://${link}`} target="_blank" rel="noreferrer"
          style={{ color: '#444', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
          🔗 Live
        </a>
      )}
    </div>
  )
}

export function ClassicTemplate({ resume, settings, preview = false }) {
  const { personal, education, experience, projects, skills, achievements, customSections, sectionOrder, visibleSections } = resume
  const baseFont = getFontCSS(settings?.globalFont || 'garamond')
  const accentColor = settings?.primaryColor || '#000000'
  const visible = (key) => !visibleSections || visibleSections.includes(key)

  const sectionComponents = {
    education: visible('education') && education?.length > 0 && (
      <div key="education" style={{ marginBottom: '10px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', borderBottom: `1.5px solid ${accentColor}`, paddingBottom: '3px', marginBottom: '6px', color: accentColor }}>Education</div>
        {sorted(education).map((edu, i) => (
          <div key={i} style={{ marginBottom: '6px', ...getStyle(settings, 'education') }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 700, fontSize: '12px' }}>{edu.degree}{edu.field ? `, ${edu.field}` : ''}</span>
              <span style={{ color: '#777', fontSize: '10px' }}>{edu.startYear}{edu.endYear ? ` – ${edu.endYear}` : ''}</span>
            </div>
            <div style={{ fontSize: '11px', color: '#555', fontStyle: 'italic' }}>
              {edu.institution}{edu.location ? ` · ${edu.location}` : ''}{edu.grade ? ` · ${edu.grade}` : ''}
            </div>
            <CustomFields fields={edu.customFields} />
          </div>
        ))}
      </div>
    ),
    experience: visible('experience') && experience?.length > 0 && (
      <div key="experience" style={{ marginBottom: '10px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', borderBottom: `1.5px solid ${accentColor}`, paddingBottom: '3px', marginBottom: '6px', color: accentColor }}>Experience</div>
        {sorted(experience).map((exp, i) => (
          <div key={i} style={{ marginBottom: '8px', ...getStyle(settings, 'experience') }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2px' }}>
              <span style={{ fontWeight: 700, fontSize: '12px' }}>{exp.role}</span>
              <span style={{ color: '#777', fontSize: '10px' }}>{exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : ''}</span>
            </div>
            <div style={{ fontStyle: 'italic', fontSize: '11px', color: '#555', marginBottom: '3px' }}>
              {exp.company}{exp.location ? ` · ${exp.location}` : ''}
            </div>
            {exp.bullets?.length > 0 && (
              <ul style={{ margin: '3px 0 0 14px', padding: 0 }}>
                {exp.bullets.filter(Boolean).map((b, j) => (
                  <li key={j} style={{ fontSize: '11px', color: '#333', marginBottom: '2px', lineHeight: 1.4 }}>{b}</li>
                ))}
              </ul>
            )}
            <CustomFields fields={exp.customFields} />
          </div>
        ))}
      </div>
    ),
    projects: visible('projects') && projects?.length > 0 && (
      <div key="projects" style={{ marginBottom: '10px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', borderBottom: `1.5px solid ${accentColor}`, paddingBottom: '3px', marginBottom: '6px', color: accentColor }}>Projects</div>
        {sorted(projects).map((proj, i) => (
          <div key={i} style={{ marginBottom: '7px', ...getStyle(settings, 'projects') }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 700, fontSize: '12px' }}>{proj.title}</span>
              <ProjectLinks github={proj.github} link={proj.link} preview={preview} />
            </div>
            {proj.tech?.length > 0 && <div style={{ fontStyle: 'italic', fontSize: '10px', color: '#666', margin: '1px 0' }}>{proj.tech.join(', ')}</div>}
            {proj.description && <div style={{ fontSize: '11px', color: '#333', lineHeight: 1.4 }}>{proj.description}</div>}
            <CustomFields fields={proj.customFields} />
          </div>
        ))}
      </div>
    ),
    skills: visible('skills') && skills?.length > 0 && (
      <div key="skills" style={{ marginBottom: '10px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', borderBottom: `1.5px solid ${accentColor}`, paddingBottom: '3px', marginBottom: '6px', color: accentColor }}>Skills</div>
        <div style={{ ...getStyle(settings, 'skills') }}>
          {sorted(skills).map((cat, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '2px 6px', marginBottom: '3px', fontSize: '11px' }}>
              <span style={{ fontWeight: 600, color: '#333' }}>{cat.category}:</span>
              <span style={{ color: '#444' }}>{cat.items.join(', ')}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    achievements: visible('achievements') && achievements?.length > 0 && (
      <div key="achievements" style={{ marginBottom: '10px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', borderBottom: `1.5px solid ${accentColor}`, paddingBottom: '3px', marginBottom: '6px', color: accentColor }}>Achievements</div>
        {sorted(achievements).map((ach, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', ...getStyle(settings, 'achievements') }}>
            <div>
              <span style={{ fontWeight: 600, fontSize: '11px' }}>{ach.title}</span>
              {ach.description && <span style={{ fontSize: '11px', color: '#555' }}> — {ach.description}</span>}
              <CustomFields fields={ach.customFields} />
            </div>
            {ach.year && <span style={{ fontSize: '10px', color: '#888', whiteSpace: 'nowrap', marginLeft: '8px' }}>{ach.year}</span>}
          </div>
        ))}
      </div>
    ),
  }

  const orderedSections = (sectionOrder || Object.keys(sectionComponents)).map(k => sectionComponents[k]).filter(Boolean)

  return (
    <div className="resume-paper" style={{ fontFamily: baseFont, padding: '32px 40px', fontSize: '12px', lineHeight: 1.5 }}>
      <div style={{ textAlign: 'center', paddingBottom: '10px', marginBottom: '10px', borderBottom: `1.5px solid ${accentColor}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {settings?.showPhoto && personal?.photo && (
            <img src={personal.photo} alt="Profile" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
          )}
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: accentColor, marginBottom: '4px' }}>{personal?.name}</div>
            <div style={{ fontSize: '11px', color: '#555', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2px 10px' }}>
              {personal?.email && <span>{personal.email}</span>}
              {personal?.phone && <><ContactSep /><span>{personal.phone}</span></>}
              {personal?.location && <><ContactSep /><span>{personal.location}</span></>}
              {personal?.linkedin && <><ContactSep /><a href={`https://${personal.linkedin}`} target="_blank" rel="noreferrer" style={{ color: '#555', textDecoration: 'underline' }}>{personal.linkedin}</a></>}
              {personal?.github && <><ContactSep /><a href={`https://${personal.github}`} target="_blank" rel="noreferrer" style={{ color: '#555', textDecoration: 'underline' }}>{personal.github}</a></>}
              {personal?.website && <><ContactSep /><a href={`https://${personal.website}`} target="_blank" rel="noreferrer" style={{ color: '#555', textDecoration: 'underline' }}>{personal.website}</a></>}
            </div>
          </div>
        </div>
        {personal?.summary && <div style={{ fontStyle: 'italic', fontSize: '11px', color: '#555', maxWidth: '560px', margin: '6px auto 0', lineHeight: 1.5 }}>{personal.summary}</div>}
      </div>
      {orderedSections}
      {customSections?.map((sec, i) => (
        <div key={i} style={{ marginBottom: '10px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', borderBottom: `1.5px solid ${accentColor}`, paddingBottom: '3px', marginBottom: '6px' }}>{sec.title}</div>
          {sec.entries?.map((entry, j) => (
            <div key={j} style={{ marginBottom: '5px' }}>
              {entry.fields?.map((f, k) => (
                <div key={k} style={{ display: 'flex', gap: '6px', fontSize: '11px', marginBottom: '2px' }}>
                  <span style={{ fontWeight: 600 }}>{f.label}:</span><span>{f.value}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

export function ModernTemplate({ resume, settings, preview = false }) {
  const { personal, education, experience, projects, skills, achievements } = resume
  const baseFont = getFontCSS(settings?.globalFont || 'inter')
  const accentColor = settings?.primaryColor || '#1a1a1a'

  return (
    <div className="resume-paper" style={{ fontFamily: baseFont, display: 'grid', gridTemplateColumns: '210px 1fr', fontSize: '11px' }}>
      <div style={{ background: accentColor, color: 'white', padding: '28px 18px' }}>
        {settings?.showPhoto && personal?.photo && (
          <img src={personal.photo} alt="Profile" style={{ width: '68px', height: '68px', borderRadius: '50%', objectFit: 'cover', marginBottom: '10px' }} />
        )}
        <div style={{ fontSize: '17px', fontWeight: 700, marginBottom: '4px' }}>{personal?.name}</div>
        <div style={{ fontSize: '10px', color: '#bbb', marginBottom: '16px' }}>{personal?.summary?.split('.')[0]}</div>
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#888', marginBottom: '6px', borderBottom: '1px solid #333', paddingBottom: '3px' }}>Contact</div>
          {personal?.email && <div style={{ fontSize: '10px', color: '#ccc', marginBottom: '4px', wordBreak: 'break-all' }}>✉ {personal.email}</div>}
          {personal?.phone && <div style={{ fontSize: '10px', color: '#ccc', marginBottom: '4px' }}>📞 {personal.phone}</div>}
          {personal?.location && <div style={{ fontSize: '10px', color: '#ccc', marginBottom: '4px' }}>📍 {personal.location}</div>}
          {personal?.linkedin && <div style={{ fontSize: '10px', color: '#ccc', marginBottom: '4px' }}>in {personal.linkedin}</div>}
          {personal?.github && <div style={{ fontSize: '10px', color: '#ccc', marginBottom: '4px' }}>⌥ {personal.github}</div>}
        </div>
        {skills?.length > 0 && (
          <div>
            <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#888', marginBottom: '6px', borderBottom: '1px solid #333', paddingBottom: '3px' }}>Skills</div>
            {sorted(skills).map((cat, i) => (
              <div key={i} style={{ marginBottom: '7px' }}>
                <div style={{ fontSize: '9px', fontWeight: 700, color: '#999', marginBottom: '2px', textTransform: 'uppercase' }}>{cat.category}</div>
                <div style={{ fontSize: '10px', color: '#ccc' }}>{cat.items.join(' · ')}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ padding: '28px 24px' }}>
        {experience?.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', borderLeft: `3px solid ${accentColor}`, paddingLeft: '8px', marginBottom: '8px' }}>Experience</div>
            {sorted(experience).map((exp, i) => (
              <div key={i} style={{ marginBottom: '9px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '12px' }}>{exp.role}</span>
                  <span style={{ fontSize: '10px', color: '#888' }}>{exp.startDate} – {exp.endDate}</span>
                </div>
                <div style={{ fontSize: '11px', color: accentColor, fontWeight: 600, marginBottom: '3px' }}>{exp.company}</div>
                {exp.bullets?.filter(Boolean).map((b, j) => <div key={j} style={{ fontSize: '11px', color: '#444', paddingLeft: '10px', borderLeft: '2px solid #eee', marginBottom: '2px' }}>· {b}</div>)}
              </div>
            ))}
          </div>
        )}
        {education?.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', borderLeft: `3px solid ${accentColor}`, paddingLeft: '8px', marginBottom: '8px' }}>Education</div>
            {sorted(education).map((edu, i) => (
              <div key={i} style={{ marginBottom: '7px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: '12px' }}>{edu.degree}{edu.field ? `, ${edu.field}` : ''}</span>
                  <span style={{ fontSize: '10px', color: '#888' }}>{edu.startYear} – {edu.endYear}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#555' }}>{edu.institution}{edu.grade ? ` · ${edu.grade}` : ''}</div>
              </div>
            ))}
          </div>
        )}
        {projects?.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', borderLeft: `3px solid ${accentColor}`, paddingLeft: '8px', marginBottom: '8px' }}>Projects</div>
            {sorted(projects).map((proj, i) => (
              <div key={i} style={{ marginBottom: '7px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '12px' }}>{proj.title}</span>
                  <ProjectLinks github={proj.github} link={proj.link} preview={preview} />
                </div>
                {proj.tech?.length > 0 && <div style={{ fontSize: '10px', color: accentColor, fontWeight: 600, marginBottom: '2px' }}>{proj.tech.join(' · ')}</div>}
                {proj.description && <div style={{ fontSize: '11px', color: '#444' }}>{proj.description}</div>}
              </div>
            ))}
          </div>
        )}
        {achievements?.length > 0 && (
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', borderLeft: `3px solid ${accentColor}`, paddingLeft: '8px', marginBottom: '8px' }}>Achievements</div>
            {sorted(achievements).map((ach, i) => (
              <div key={i} style={{ marginBottom: '5px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: '11px' }}>{ach.title}</span>
                  {ach.description && <span style={{ fontSize: '11px', color: '#555' }}> — {ach.description}</span>}
                </div>
                {ach.year && <span style={{ fontSize: '10px', color: '#888' }}>{ach.year}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function CreativeTemplate({ resume, settings, preview = false }) {
  const { personal, education, experience, projects, skills, achievements } = resume
  const baseFont = getFontCSS(settings?.globalFont || 'playfair')
  const accentColor = settings?.primaryColor || '#2d4a6e'

  return (
    <div className="resume-paper" style={{ fontFamily: baseFont, display: 'grid', gridTemplateColumns: '185px 1fr', fontSize: '11px' }}>
      <div style={{ background: `${accentColor}12`, borderRight: `3px solid ${accentColor}`, padding: '28px 16px' }}>
        {settings?.showPhoto && personal?.photo && (
          <img src={personal.photo} alt="Profile" style={{ width: '68px', height: '68px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${accentColor}`, marginBottom: '10px' }} />
        )}
        <div style={{ fontSize: '17px', fontWeight: 700, color: accentColor, lineHeight: 1.2, marginBottom: '8px' }}>{personal?.name}</div>
        <div style={{ fontSize: '10px', color: '#555', marginBottom: '16px', lineHeight: 1.6 }}>
          {personal?.email && <div style={{ wordBreak: 'break-all' }}>{personal.email}</div>}
          {personal?.phone && <div>{personal.phone}</div>}
          {personal?.location && <div>{personal.location}</div>}
          {personal?.linkedin && <div>{personal.linkedin}</div>}
          {personal?.github && <div>{personal.github}</div>}
        </div>
        {skills?.length > 0 && (
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: accentColor, borderBottom: `2px solid ${accentColor}`, paddingBottom: '3px', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Skills</div>
            {sorted(skills).map((cat, i) => (
              <div key={i} style={{ marginBottom: '7px' }}>
                <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: accentColor, marginBottom: '2px' }}>{cat.category}</div>
                <div style={{ fontSize: '10px', color: '#444', lineHeight: 1.5 }}>{cat.items.join(', ')}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ padding: '28px 24px' }}>
        {personal?.summary && <p style={{ fontSize: '11px', color: '#444', lineHeight: 1.6, fontStyle: 'italic', borderLeft: `3px solid ${accentColor}`, paddingLeft: '10px', marginBottom: '14px' }}>{personal.summary}</p>}
        {experience?.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: accentColor, borderBottom: `2px solid ${accentColor}`, paddingBottom: '3px', marginBottom: '8px' }}>Experience</div>
            {sorted(experience).map((exp, i) => (
              <div key={i} style={{ paddingLeft: '10px', borderLeft: `2px solid ${accentColor}20`, marginBottom: '9px' }}>
                <div style={{ fontWeight: 700, fontSize: '12px' }}>{exp.role}</div>
                <div style={{ color: accentColor, fontSize: '11px', fontWeight: 600 }}>{exp.company}</div>
                <div style={{ fontSize: '10px', color: '#888', marginBottom: '3px' }}>{exp.startDate} – {exp.endDate}{exp.location ? ` · ${exp.location}` : ''}</div>
                {exp.bullets?.filter(Boolean).map((b, j) => <div key={j} style={{ fontSize: '11px', color: '#444', marginBottom: '2px' }}>• {b}</div>)}
              </div>
            ))}
          </div>
        )}
        {education?.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: accentColor, borderBottom: `2px solid ${accentColor}`, paddingBottom: '3px', marginBottom: '8px' }}>Education</div>
            {sorted(education).map((edu, i) => (
              <div key={i} style={{ paddingLeft: '10px', borderLeft: `2px solid ${accentColor}20`, marginBottom: '7px' }}>
                <div style={{ fontWeight: 700, fontSize: '12px' }}>{edu.degree}{edu.field ? `, ${edu.field}` : ''}</div>
                <div style={{ fontSize: '11px', color: '#555' }}>{edu.institution}</div>
                <div style={{ fontSize: '10px', color: '#888' }}>{edu.startYear} – {edu.endYear}{edu.grade ? ` · ${edu.grade}` : ''}</div>
              </div>
            ))}
          </div>
        )}
        {projects?.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: accentColor, borderBottom: `2px solid ${accentColor}`, paddingBottom: '3px', marginBottom: '8px' }}>Projects</div>
            {sorted(projects).map((proj, i) => (
              <div key={i} style={{ marginBottom: '7px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '12px', color: accentColor }}>{proj.title}</span>
                  <ProjectLinks github={proj.github} link={proj.link} preview={preview} />
                </div>
                {proj.tech?.length > 0 && <div style={{ fontSize: '10px', color: '#888', marginBottom: '2px' }}>{proj.tech.join(' · ')}</div>}
                {proj.description && <div style={{ fontSize: '11px', color: '#444' }}>{proj.description}</div>}
              </div>
            ))}
          </div>
        )}
        {achievements?.length > 0 && (
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: accentColor, borderBottom: `2px solid ${accentColor}`, paddingBottom: '3px', marginBottom: '8px' }}>Achievements</div>
            {sorted(achievements).map((ach, i) => (
              <div key={i} style={{ marginBottom: '5px' }}>
                <span style={{ fontWeight: 600, fontSize: '11px' }}>{ach.title}</span>
                {ach.year && <span style={{ fontSize: '10px', color: '#888', marginLeft: '8px' }}>{ach.year}</span>}
                {ach.description && <div style={{ fontSize: '11px', color: '#555' }}>{ach.description}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function MinimalTemplate({ resume, settings, preview = false }) {
  const { personal, education, experience, projects, skills, achievements } = resume
  const baseFont = getFontCSS(settings?.globalFont || 'lora')

  return (
    <div className="resume-paper" style={{ fontFamily: baseFont, padding: '32px 44px', fontSize: '11px', lineHeight: 1.5 }}>
      <div style={{ borderBottom: '1px solid #ddd', paddingBottom: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {settings?.showPhoto && personal?.photo && (
            <img src={personal.photo} alt="Profile" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #ddd' }} />
          )}
          <div>
            <div style={{ fontSize: '24px', fontWeight: 400, letterSpacing: '0.04em', marginBottom: '4px' }}>{personal?.name}</div>
            <div style={{ fontSize: '10px', color: '#888', letterSpacing: '0.05em', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[personal?.email, personal?.phone, personal?.location, personal?.linkedin, personal?.github, personal?.website].filter(Boolean).join('  ·  ')}
            </div>
          </div>
        </div>
        {personal?.summary && <p style={{ fontSize: '11px', color: '#555', lineHeight: 1.6, marginTop: '8px', maxWidth: '560px' }}>{personal.summary}</p>}
      </div>
      {education?.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#888', marginBottom: '8px' }}>Education</div>
          {sorted(education).map((edu, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '4px 8px', marginBottom: '8px' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '12px' }}>{edu.degree}{edu.field ? `, ${edu.field}` : ''}</div>
                <div style={{ fontSize: '11px', color: '#666' }}>{edu.institution}{edu.grade ? ` · ${edu.grade}` : ''}</div>
              </div>
              <div style={{ fontSize: '10px', color: '#888', textAlign: 'right', whiteSpace: 'nowrap' }}>{edu.startYear}{edu.endYear ? `–${edu.endYear}` : ''}</div>
            </div>
          ))}
        </div>
      )}
      {experience?.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#888', marginBottom: '8px' }}>Experience</div>
          {sorted(experience).map((exp, i) => (
            <div key={i} style={{ marginBottom: '9px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '4px', marginBottom: '3px' }}>
                <div style={{ fontWeight: 600, fontSize: '12px' }}>{exp.role} <span style={{ fontWeight: 400, color: '#666' }}>at {exp.company}</span></div>
                <div style={{ fontSize: '10px', color: '#888', textAlign: 'right', whiteSpace: 'nowrap' }}>{exp.startDate}–{exp.endDate}</div>
              </div>
              {exp.bullets?.filter(Boolean).map((b, j) => <div key={j} style={{ fontSize: '11px', color: '#555', paddingLeft: '12px', marginBottom: '2px' }}>— {b}</div>)}
            </div>
          ))}
        </div>
      )}
      {projects?.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#888', marginBottom: '8px' }}>Projects</div>
          {sorted(projects).map((proj, i) => (
            <div key={i} style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                <div style={{ fontWeight: 600, fontSize: '12px' }}>{proj.title}</div>
                <ProjectLinks github={proj.github} link={proj.link} preview={preview} />
              </div>
              {proj.tech?.length > 0 && <div style={{ fontSize: '10px', color: '#888', marginBottom: '2px' }}>{proj.tech.join(', ')}</div>}
              {proj.description && <div style={{ fontSize: '11px', color: '#555' }}>{proj.description}</div>}
            </div>
          ))}
        </div>
      )}
      {skills?.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#888', marginBottom: '8px' }}>Skills</div>
          {sorted(skills).map((cat, i) => (
            <div key={i} style={{ fontSize: '11px', marginBottom: '3px' }}>
              <span style={{ fontWeight: 600, color: '#333' }}>{cat.category}: </span>
              <span style={{ color: '#555' }}>{cat.items.join(', ')}</span>
            </div>
          ))}
        </div>
      )}
      {achievements?.length > 0 && (
        <div>
          <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#888', marginBottom: '8px' }}>Achievements</div>
          {sorted(achievements).map((ach, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '4px', marginBottom: '7px' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '12px' }}>{ach.title}</div>
                {ach.description && <div style={{ fontSize: '11px', color: '#555' }}>{ach.description}</div>}
              </div>
              <div style={{ fontSize: '10px', color: '#888', whiteSpace: 'nowrap' }}>{ach.year}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function ExecutiveTemplate({ resume, settings, preview = false }) {
  const { personal, education, experience, projects, skills, achievements } = resume
  const baseFont = getFontCSS(settings?.globalFont || 'garamond')
  const accentColor = settings?.primaryColor || '#0d0d0d'

  return (
    <div className="resume-paper" style={{ fontFamily: baseFont, fontSize: '11px' }}>
      <div style={{ background: accentColor, color: 'white', padding: '26px 44px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {settings?.showPhoto && personal?.photo && (
            <img src={personal.photo} alt="Profile" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
          )}
          <div>
            <div style={{ fontSize: '24px', fontWeight: 700, marginBottom: '6px', letterSpacing: '0.04em' }}>{personal?.name}</div>
            <div style={{ fontSize: '11px', color: '#ccc', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {[personal?.email, personal?.phone, personal?.location].filter(Boolean).map((item, i) => <span key={i}>{item}</span>)}
            </div>
            {(personal?.linkedin || personal?.github || personal?.website) && (
              <div style={{ fontSize: '11px', color: '#ccc', display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '3px' }}>
                {[personal?.linkedin, personal?.github, personal?.website].filter(Boolean).map((item, i) => <span key={i}>{item}</span>)}
              </div>
            )}
          </div>
        </div>
        {personal?.summary && <p style={{ fontSize: '11px', color: '#ccc', lineHeight: 1.6, marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '10px' }}>{personal.summary}</p>}
      </div>
      <div style={{ padding: '24px 44px' }}>
        {experience?.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#555', borderBottom: '1px solid #ddd', paddingBottom: '5px', marginBottom: '9px' }}>Professional Experience</div>
            {sorted(experience).map((exp, i) => (
              <div key={i} style={{ marginBottom: '9px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 700, fontSize: '12px' }}>{exp.role}</span>
                  <span style={{ fontSize: '10px', color: '#888' }}>{exp.startDate} – {exp.endDate}</span>
                </div>
                <div style={{ fontSize: '11px', color: accentColor, fontWeight: 600, marginBottom: '3px' }}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</div>
                {exp.bullets?.filter(Boolean).map((b, j) => (
                  <div key={j} style={{ fontSize: '11px', color: '#444', paddingLeft: '12px', position: 'relative', marginBottom: '2px' }}>
                    <span style={{ position: 'absolute', left: 0, color: accentColor }}>›</span>{b}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        {education?.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#555', borderBottom: '1px solid #ddd', paddingBottom: '5px', marginBottom: '9px' }}>Education</div>
            {sorted(education).map((edu, i) => (
              <div key={i} style={{ marginBottom: '7px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 700, fontSize: '12px' }}>{edu.degree}{edu.field ? `, ${edu.field}` : ''}</span>
                  <span style={{ fontSize: '10px', color: '#888' }}>{edu.startYear} – {edu.endYear}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#555' }}>{edu.institution}{edu.grade ? ` · ${edu.grade}` : ''}</div>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
          {skills?.length > 0 && (
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#555', borderBottom: '1px solid #ddd', paddingBottom: '5px', marginBottom: '9px' }}>Core Skills</div>
              {sorted(skills).map((cat, i) => (
                <div key={i} style={{ marginBottom: '5px' }}>
                  <div style={{ fontWeight: 600, fontSize: '11px', marginBottom: '1px' }}>{cat.category}</div>
                  <div style={{ fontSize: '10px', color: '#555' }}>{cat.items.join(', ')}</div>
                </div>
              ))}
            </div>
          )}
          {achievements?.length > 0 && (
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#555', borderBottom: '1px solid #ddd', paddingBottom: '5px', marginBottom: '9px' }}>Achievements</div>
              {sorted(achievements).map((ach, i) => (
                <div key={i} style={{ marginBottom: '5px' }}>
                  <div style={{ fontWeight: 600, fontSize: '11px' }}>{ach.title} {ach.year && <span style={{ color: '#888', fontWeight: 400 }}>({ach.year})</span>}</div>
                  {ach.description && <div style={{ fontSize: '10px', color: '#555' }}>{ach.description}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
        {projects?.length > 0 && (
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#555', borderBottom: '1px solid #ddd', paddingBottom: '5px', marginBottom: '9px' }}>Key Projects</div>
            {sorted(projects).map((proj, i) => (
              <div key={i} style={{ marginBottom: '7px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, fontSize: '12px' }}>{proj.title}</span>
                  <ProjectLinks github={proj.github} link={proj.link} preview={preview} />
                </div>
                {proj.tech?.length > 0 && <div style={{ fontSize: '10px', color: accentColor, marginBottom: '2px' }}>{proj.tech.join(' · ')}</div>}
                {proj.description && <div style={{ fontSize: '11px', color: '#555' }}>{proj.description}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function ResumeRenderer({ resume, template, settings, preview = false }) {
  const props = { resume, settings, preview }
  switch (template) {
    case 'modern': return <ModernTemplate {...props} />
    case 'creative': return <CreativeTemplate {...props} />
    case 'minimal': return <MinimalTemplate {...props} />
    case 'executive': return <ExecutiveTemplate {...props} />
    default: return <ClassicTemplate {...props} />
  }
}
