import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import API from '../utils/api'
import toast from 'react-hot-toast'
import { FONTS, TEMPLATES } from '../utils/fonts'
import AIAssistant from '../components/AIAssistant'

const SIDEBAR = [
  { section: 'Content', items: [
    { key: 'personal', label: 'Personal Info', icon: '👤' },
    { key: 'education', label: 'Education', icon: '🎓' },
    { key: 'experience', label: 'Experience', icon: '💼' },
    { key: 'projects', label: 'Projects', icon: '🔧' },
    { key: 'skills', label: 'Skills', icon: '⚡' },
    { key: 'achievements', label: 'Achievements', icon: '🏆' },
    { key: 'custom', label: 'Custom Sections', icon: '➕' },
  ]},
  { section: 'Appearance', items: [
    { key: 'design', label: 'Templates & Fonts', icon: '🎨' },
    { key: 'sections', label: 'Section Order', icon: '↕' },
  ]},
]

export default function DashboardPage() {
  const { user } = useAuth()
  const [resume, setResume] = useState(null)
  const [draft, setDraft] = useState(null)
  const [activeKey, setActiveKey] = useState('personal')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [aiSection, setAiSection] = useState(null)

  useEffect(() => {
    API.get('/resume/me/data')
      .then(res => { setResume(res.data); setDraft(JSON.parse(JSON.stringify(res.data))) })
      .catch(() => toast.error('Failed to load resume.'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!draft) return
    setSaving(true)
    try {
      const res = await API.put('/resume', draft)
      setResume(res.data.resume)
      setDraft(JSON.parse(JSON.stringify(res.data.resume)))
      toast.success('Saved!')
    } catch { toast.error('Failed to save.') }
    finally { setSaving(false) }
  }

  const updateDraft = useCallback((path, value) => {
    setDraft(prev => {
      const next = JSON.parse(JSON.stringify(prev))
      const parts = path.split('.')
      let obj = next
      for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]]
      obj[parts[parts.length - 1]] = value
      return next
    })
  }, [])

  const handleAIApply = (section, data) => {
    if (section === 'personal') {
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined) updateDraft(`personal.${key}`, data[key])
      })
    } else {
      setDraft(prev => {
        const next = JSON.parse(JSON.stringify(prev))
        const arr = next[section] || []
        arr.push({ ...data, order: arr.length, customFields: [] })
        next[section] = arr
        return next
      })
    }
    toast.success('AI data applied! Review and save.')
  }

  if (loading) return (
    <div className="dashboard-page">
      <div className="loading-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="spinner" /><p style={{ color: '#888', fontFamily: 'Georgia, serif' }}>Loading editor...</p>
      </div>
    </div>
  )

  if (!draft) return null
  const props = { draft, setDraft, updateDraft }

  return (
    <div className="dashboard-page">
      {aiSection && (
        <AIAssistant
          section={aiSection}
          onApply={(data) => handleAIApply(aiSection, data)}
          onClose={() => setAiSection(null)}
        />
      )}

      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          {SIDEBAR.map(group => (
            <div key={group.section}>
              <div className="sidebar-section-label">{group.section}</div>
              {group.items.map(item => (
                <button key={item.key} className={`sidebar-item ${activeKey === item.key ? 'active' : ''}`} onClick={() => setActiveKey(item.key)}>
                  <span>{item.icon}</span> {item.label}
                </button>
              ))}
            </div>
          ))}
        </aside>

        <main className="dashboard-main">
          <div className="profile-link-card no-print">
            <div>
              <div style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#aaa', marginBottom: '4px' }}>Your Public CV</div>
              <div className="profile-link-url">{window.location.origin}/resume/{user?.username}</div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-ghost btn-sm" style={{ color: '#ccc', borderColor: '#444' }}
                onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/resume/${user?.username}`); toast.success('Copied!') }}>
                Copy Link
              </button>
              <a href={`/resume/${user?.username}`} target="_blank" rel="noreferrer" className="btn btn-sm" style={{ background: 'white', color: 'black' }}>View ↗</a>
            </div>
          </div>

          <div className="dash-header">
            <h2 className="dash-title">
              {SIDEBAR.flatMap(g => g.items).find(i => i.key === activeKey)?.icon}{' '}
              {SIDEBAR.flatMap(g => g.items).find(i => i.key === activeKey)?.label}
            </h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['personal','education','experience','projects','skills','achievements'].includes(activeKey) && (
                <button className="btn btn-ghost btn-sm" onClick={() => setAiSection(activeKey)} style={{ borderColor: '#ddd' }}>
                  🤖 AI Fill
                </button>
              )}
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? '⌛ Saving...' : '💾 Save'}
              </button>
            </div>
          </div>

          {activeKey === 'personal' && <PersonalEditor {...props} />}
          {activeKey === 'education' && <EducationEditor {...props} />}
          {activeKey === 'experience' && <ExperienceEditor {...props} />}
          {activeKey === 'projects' && <ProjectsEditor {...props} />}
          {activeKey === 'skills' && <SkillsEditor {...props} />}
          {activeKey === 'achievements' && <AchievementsEditor {...props} />}
          {activeKey === 'custom' && <CustomSectionsEditor {...props} />}
          {activeKey === 'design' && <DesignEditor {...props} />}
          {activeKey === 'sections' && <SectionsEditor {...props} />}
        </main>
      </div>
    </div>
  )
}

function CustomFieldsEditor({ fields = [], onChange }) {
  const add = () => onChange([...fields, { label: '', value: '' }])
  const update = (i, key, val) => { const arr = [...fields]; arr[i] = { ...arr[i], [key]: val }; onChange(arr) }
  const remove = (i) => onChange(fields.filter((_, idx) => idx !== i))
  return (
    <div style={{ marginTop: '12px' }}>
      <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', marginBottom: '8px' }}>Custom Fields</div>
      <div className="custom-fields-list">
        {fields.map((f, i) => (
          <div key={i} className="custom-field-editor">
            <input className="form-input" placeholder="Label" value={f.label} onChange={e => update(i, 'label', e.target.value)} />
            <input className="form-input" placeholder="Value" value={f.value} onChange={e => update(i, 'value', e.target.value)} />
            <button className="btn-icon danger" onClick={() => remove(i)}>×</button>
          </div>
        ))}
      </div>
      <button className="btn-add" style={{ marginTop: '4px' }} onClick={add}>+ Add Custom Field</button>
    </div>
  )
}

function TagsInput({ tags = [], onChange }) {
  const [input, setInput] = useState('')
  const add = (val) => { const t = val.trim().replace(/,+$/, ''); if (t && !tags.includes(t)) onChange([...tags, t]); setInput('') }
  return (
    <div>
      <div className="tags-container">
        {tags.map((tag, i) => (
          <div key={i} className="tag">{tag}<button className="tag-remove" onClick={() => onChange(tags.filter((_, idx) => idx !== i))}>×</button></div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input className="form-input" style={{ flex: 1 }} value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(input) } else if (e.key === 'Backspace' && !input && tags.length) onChange(tags.slice(0, -1)) }}
          onBlur={() => input && add(input)} />
        <button className="btn-icon" onClick={() => add(input)}>Add</button>
      </div>
    </div>
  )
}

function PersonalEditor({ draft, updateDraft }) {
  const p = draft.personal || {}
  const [uploading, setUploading] = useState(false)

  const handlePhoto = async (e) => {
    const file = e.target.files[0]; if (!file) return
    setUploading(true)
    try {
      const formData = new FormData(); formData.append('photo', file)
      const res = await API.post('/user/photo', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      updateDraft('personal.photo', res.data.photoUrl); toast.success('Photo uploaded!')
    } catch { toast.error('Upload failed.') }
    finally { setUploading(false) }
  }

  const fields = [
    ['name','Full Name'],['email','Email'],['phone','Phone'],['location','Location'],
    ['linkedin','LinkedIn (no https://)'],['github','GitHub (no https://)'],['website','Website (no https://)'],
  ]

  return (
    <div>
      <div className="edit-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
          <div style={{ width: '72px', height: '72px', border: '1px solid #ddd', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {p.photo ? <img src={p.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '24px' }}>👤</span>}
          </div>
          <div>
            <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
              {uploading ? 'Uploading...' : 'Upload Photo'}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} disabled={uploading} />
            </label>
            {p.photo && <button className="btn btn-ghost btn-sm" onClick={() => updateDraft('personal.photo', '')} style={{ marginLeft: '8px' }}>Remove</button>}
          </div>
        </div>
        <div className="form-grid-2">
          {fields.map(([key, label]) => (
            <div className="form-group" key={key}>
              <label className="form-label">{label}</label>
              <input className="form-input" value={p[key] || ''} onChange={e => updateDraft(`personal.${key}`, e.target.value)} />
            </div>
          ))}
        </div>
        <div className="form-group">
          <label className="form-label">Professional Summary</label>
          <textarea className="form-textarea" value={p.summary || ''} onChange={e => updateDraft('personal.summary', e.target.value)} style={{ minHeight: '100px' }} />
        </div>
        <CustomFieldsEditor fields={p.customFields || []} onChange={val => updateDraft('personal.customFields', val)} />
      </div>
    </div>
  )
}

function EducationEditor({ draft, setDraft }) {
  const add = () => setDraft(prev => ({ ...prev, education: [...(prev.education || []), { institution: '', degree: '', field: '', startYear: '', endYear: '', grade: '', location: '', customFields: [], order: prev.education?.length || 0 }] }))
  const remove = (i) => setDraft(prev => ({ ...prev, education: prev.education.filter((_, idx) => idx !== i) }))
  const update = (i, key, val) => setDraft(prev => { const arr = [...prev.education]; arr[i] = { ...arr[i], [key]: val }; return { ...prev, education: arr } })

  return (
    <div>
      {(draft.education || []).map((edu, i) => (
        <div className="edit-card" key={i}>
          <div className="edit-card-header">
            <span className="edit-card-title">{edu.degree || edu.institution || `Education ${i + 1}`}</span>
            <button className="btn-icon danger" onClick={() => remove(i)}>Remove</button>
          </div>
          <div className="form-grid-2">
            {[['degree','Degree / Qualification'],['field','Field of Study'],['institution','Institution'],['startYear','Start Year'],['endYear','End Year'],['grade','Grade / GPA'],['location','Location']].map(([key, label]) => (
              <div className="form-group" key={key}>
                <label className="form-label">{label}</label>
                <input className="form-input" value={edu[key] || ''} onChange={e => update(i, key, e.target.value)} />
              </div>
            ))}
          </div>
          <CustomFieldsEditor fields={edu.customFields || []} onChange={val => update(i, 'customFields', val)} />
        </div>
      ))}
      <button className="btn-add" onClick={add}>+ Add Education</button>
    </div>
  )
}

function ExperienceEditor({ draft, setDraft }) {
  const add = () => setDraft(prev => ({ ...prev, experience: [...(prev.experience || []), { company: '', role: '', startDate: '', endDate: '', location: '', bullets: [''], customFields: [], order: prev.experience?.length || 0 }] }))
  const remove = (i) => setDraft(prev => ({ ...prev, experience: prev.experience.filter((_, idx) => idx !== i) }))
  const update = (i, key, val) => setDraft(prev => { const arr = [...prev.experience]; arr[i] = { ...arr[i], [key]: val }; return { ...prev, experience: arr } })
  const addBullet = (i) => setDraft(prev => { const arr = [...prev.experience]; arr[i] = { ...arr[i], bullets: [...(arr[i].bullets || []), ''] }; return { ...prev, experience: arr } })
  const updateBullet = (i, j, val) => setDraft(prev => { const arr = [...prev.experience]; const bullets = [...arr[i].bullets]; bullets[j] = val; arr[i] = { ...arr[i], bullets }; return { ...prev, experience: arr } })
  const removeBullet = (i, j) => setDraft(prev => { const arr = [...prev.experience]; arr[i] = { ...arr[i], bullets: arr[i].bullets.filter((_, idx) => idx !== j) }; return { ...prev, experience: arr } })

  return (
    <div>
      {(draft.experience || []).map((exp, i) => (
        <div className="edit-card" key={i}>
          <div className="edit-card-header">
            <span className="edit-card-title">{exp.role ? `${exp.role} @ ${exp.company}` : `Experience ${i + 1}`}</span>
            <button className="btn-icon danger" onClick={() => remove(i)}>Remove</button>
          </div>
          <div className="form-grid-2">
            {[['role','Role / Title'],['company','Company'],['startDate','Start Date'],['endDate','End Date'],['location','Location']].map(([key, label]) => (
              <div className="form-group" key={key}>
                <label className="form-label">{label}</label>
                <input className="form-input" value={exp[key] || ''} onChange={e => update(i, key, e.target.value)} />
              </div>
            ))}
          </div>
          <div className="form-group">
            <label className="form-label">Bullet Points</label>
            <div className="bullets-list">
              {(exp.bullets || []).map((b, j) => (
                <div className="bullet-row" key={j}>
                  <span className="bullet-prefix">•</span>
                  <input className="bullet-input" value={b} onChange={e => updateBullet(i, j, e.target.value)} />
                  <button className="btn-icon danger" onClick={() => removeBullet(i, j)}>×</button>
                </div>
              ))}
            </div>
            <button className="btn-add" style={{ marginTop: '4px' }} onClick={() => addBullet(i)}>+ Add Bullet</button>
          </div>
          <CustomFieldsEditor fields={exp.customFields || []} onChange={val => update(i, 'customFields', val)} />
        </div>
      ))}
      <button className="btn-add" onClick={add}>+ Add Experience</button>
    </div>
  )
}

function ProjectsEditor({ draft, setDraft }) {
  const add = () => setDraft(prev => ({ ...prev, projects: [...(prev.projects || []), { title: '', description: '', tech: [], github: '', link: '', customFields: [], order: prev.projects?.length || 0 }] }))
  const remove = (i) => setDraft(prev => ({ ...prev, projects: prev.projects.filter((_, idx) => idx !== i) }))
  const update = (i, key, val) => setDraft(prev => { const arr = [...prev.projects]; arr[i] = { ...arr[i], [key]: val }; return { ...prev, projects: arr } })

  return (
    <div>
      {(draft.projects || []).map((proj, i) => (
        <div className="edit-card" key={i}>
          <div className="edit-card-header">
            <span className="edit-card-title">{proj.title || `Project ${i + 1}`}</span>
            <button className="btn-icon danger" onClick={() => remove(i)}>Remove</button>
          </div>
          <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={proj.title || ''} onChange={e => update(i, 'title', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={proj.description || ''} onChange={e => update(i, 'description', e.target.value)} /></div>
          <div className="form-grid-2">
            <div className="form-group"><label className="form-label">GitHub (no https://)</label><input className="form-input" value={proj.github || ''} onChange={e => update(i, 'github', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Live Link (no https://)</label><input className="form-input" value={proj.link || ''} onChange={e => update(i, 'link', e.target.value)} /></div>
          </div>
          <div className="form-group"><label className="form-label">Tech Stack</label><TagsInput tags={proj.tech || []} onChange={val => update(i, 'tech', val)} /></div>
          <CustomFieldsEditor fields={proj.customFields || []} onChange={val => update(i, 'customFields', val)} />
        </div>
      ))}
      <button className="btn-add" onClick={add}>+ Add Project</button>
    </div>
  )
}

function SkillsEditor({ draft, setDraft }) {
  const add = () => setDraft(prev => ({ ...prev, skills: [...(prev.skills || []), { category: '', items: [], customFields: [], order: prev.skills?.length || 0 }] }))
  const remove = (i) => setDraft(prev => ({ ...prev, skills: prev.skills.filter((_, idx) => idx !== i) }))
  const update = (i, key, val) => setDraft(prev => { const arr = [...prev.skills]; arr[i] = { ...arr[i], [key]: val }; return { ...prev, skills: arr } })

  return (
    <div>
      {(draft.skills || []).map((cat, i) => (
        <div className="edit-card" key={i}>
          <div className="edit-card-header">
            <span className="edit-card-title">{cat.category || `Category ${i + 1}`}</span>
            <button className="btn-icon danger" onClick={() => remove(i)}>Remove</button>
          </div>
          <div className="form-group"><label className="form-label">Category Name</label><input className="form-input" value={cat.category || ''} onChange={e => update(i, 'category', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Skills (Enter or comma to add)</label><TagsInput tags={cat.items || []} onChange={val => update(i, 'items', val)} /></div>
          <CustomFieldsEditor fields={cat.customFields || []} onChange={val => update(i, 'customFields', val)} />
        </div>
      ))}
      <button className="btn-add" onClick={add}>+ Add Skill Category</button>
    </div>
  )
}

function AchievementsEditor({ draft, setDraft }) {
  const add = () => setDraft(prev => ({ ...prev, achievements: [...(prev.achievements || []), { title: '', description: '', year: '', customFields: [], order: prev.achievements?.length || 0 }] }))
  const remove = (i) => setDraft(prev => ({ ...prev, achievements: prev.achievements.filter((_, idx) => idx !== i) }))
  const update = (i, key, val) => setDraft(prev => { const arr = [...prev.achievements]; arr[i] = { ...arr[i], [key]: val }; return { ...prev, achievements: arr } })

  return (
    <div>
      {(draft.achievements || []).map((ach, i) => (
        <div className="edit-card" key={i}>
          <div className="edit-card-header">
            <span className="edit-card-title">{ach.title || `Achievement ${i + 1}`}</span>
            <button className="btn-icon danger" onClick={() => remove(i)}>Remove</button>
          </div>
          <div className="form-group"><label className="form-label">Title</label><input className="form-input" value={ach.title || ''} onChange={e => update(i, 'title', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Description</label><textarea className="form-textarea" value={ach.description || ''} onChange={e => update(i, 'description', e.target.value)} style={{ minHeight: '60px' }} /></div>
          <div className="form-group"><label className="form-label">Year</label><input className="form-input" value={ach.year || ''} onChange={e => update(i, 'year', e.target.value)} /></div>
          <CustomFieldsEditor fields={ach.customFields || []} onChange={val => update(i, 'customFields', val)} />
        </div>
      ))}
      <button className="btn-add" onClick={add}>+ Add Achievement</button>
    </div>
  )
}

function CustomSectionsEditor({ draft, setDraft }) {
  const addSection = () => setDraft(prev => ({ ...prev, customSections: [...(prev.customSections || []), { title: '', entries: [], order: prev.customSections?.length || 0 }] }))
  const removeSection = (i) => setDraft(prev => ({ ...prev, customSections: prev.customSections.filter((_, idx) => idx !== i) }))
  const updateSection = (i, key, val) => setDraft(prev => { const arr = [...(prev.customSections || [])]; arr[i] = { ...arr[i], [key]: val }; return { ...prev, customSections: arr } })
  const addEntry = (i) => setDraft(prev => { const arr = [...(prev.customSections || [])]; arr[i] = { ...arr[i], entries: [...(arr[i].entries || []), { fields: [], order: arr[i].entries?.length || 0 }] }; return { ...prev, customSections: arr } })
  const removeEntry = (si, ei) => setDraft(prev => { const arr = [...(prev.customSections || [])]; arr[si] = { ...arr[si], entries: arr[si].entries.filter((_, idx) => idx !== ei) }; return { ...prev, customSections: arr } })
  const updateEntryFields = (si, ei, fields) => setDraft(prev => { const arr = [...(prev.customSections || [])]; const entries = [...arr[si].entries]; entries[ei] = { ...entries[ei], fields }; arr[si] = { ...arr[si], entries }; return { ...prev, customSections: arr } })

  return (
    <div>
      <p style={{ fontFamily: 'Georgia, serif', fontSize: '13px', color: '#888', marginBottom: '16px' }}>Add custom sections like Publications, Certifications, Languages, Volunteer Work, etc.</p>
      {(draft.customSections || []).map((sec, si) => (
        <div className="edit-card" key={si}>
          <div className="edit-card-header">
            <span className="edit-card-title">{sec.title || `Section ${si + 1}`}</span>
            <button className="btn-icon danger" onClick={() => removeSection(si)}>Remove Section</button>
          </div>
          <div className="form-group">
            <label className="form-label">Section Title</label>
            <input className="form-input" placeholder="e.g. Certifications, Publications..." value={sec.title || ''} onChange={e => updateSection(si, 'title', e.target.value)} />
          </div>
          {(sec.entries || []).map((entry, ei) => (
            <div key={ei} style={{ background: '#f9f9f9', border: '1px solid #eee', padding: '14px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#888' }}>Entry {ei + 1}</span>
                <button className="btn-icon danger" onClick={() => removeEntry(si, ei)}>×</button>
              </div>
              <CustomFieldsEditor fields={entry.fields || []} onChange={val => updateEntryFields(si, ei, val)} />
            </div>
          ))}
          <button className="btn-add" onClick={() => addEntry(si)}>+ Add Entry</button>
        </div>
      ))}
      <button className="btn-add" onClick={addSection}>+ Add Custom Section</button>
    </div>
  )
}

function DesignEditor({ draft, updateDraft }) {
  const settings = draft.settings || {}
  const toggleTemplate = (id) => {
    const current = settings.enabledTemplates || []
    const updated = current.includes(id) ? current.filter(t => t !== id) : [...current, id]
    if (updated.length === 0) return toast.error('At least one template must be enabled.')
    updateDraft('settings.enabledTemplates', updated)
  }
  const COLORS = ['#000000','#1a1a2e','#2d4a6e','#1e3a2f','#4a1e2d','#2d1e4a','#4a3728','#555555']

  return (
    <div>
      <div className="edit-card">
        <div className="edit-card-header"><span className="edit-card-title">Resume Templates</span></div>
        <p style={{ fontSize: '13px', color: '#888', marginBottom: '16px' }}>Enable templates viewers can switch between on your public profile.</p>
        <div className="template-selector-grid">
          {TEMPLATES.map(t => {
            const enabled = (settings.enabledTemplates || []).includes(t.id)
            const isDefault = settings.defaultTemplate === t.id
            return (
              <div key={t.id} className={`template-option ${enabled ? 'active' : ''}`} onClick={() => toggleTemplate(t.id)}>
                <div style={{ fontSize: '22px', marginBottom: '6px' }}>
                  {t.id==='classic'&&'📄'}{t.id==='modern'&&'🎨'}{t.id==='creative'&&'✨'}{t.id==='minimal'&&'⬜'}{t.id==='executive'&&'💼'}
                </div>
                <div className="template-option-name">{t.label}</div>
                <div className="template-option-desc">{t.desc}</div>
                <div style={{ marginTop: '8px', display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '10px', padding: '2px 6px', background: enabled ? '#000' : '#eee', color: enabled ? 'white' : '#888' }}>{enabled ? '✓ Enabled' : 'Disabled'}</span>
                  {enabled && <span style={{ fontSize: '10px', padding: '2px 6px', background: isDefault ? '#555' : '#f0f0f0', color: isDefault ? 'white' : '#888', cursor: 'pointer' }} onClick={e => { e.stopPropagation(); updateDraft('settings.defaultTemplate', t.id) }}>{isDefault ? '★ Default' : 'Set Default'}</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="edit-card">
        <div className="edit-card-header"><span className="edit-card-title">Global Font</span></div>
        <div className="font-grid">
          {Object.entries(FONTS).map(([key, font]) => (
            <div key={key} className={`font-option ${settings.globalFont === key ? 'active' : ''}`} onClick={() => updateDraft('settings.globalFont', key)}>
              <div className="font-option-name" style={{ fontFamily: font.css }}>{font.label}</div>
              <div className="font-option-preview" style={{ fontFamily: font.css }}>Aa Bb Cc</div>
              <div style={{ fontSize: '10px', color: '#aaa', marginTop: '2px' }}>{font.category}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="edit-card">
        <div className="edit-card-header"><span className="edit-card-title">Font Size & Style</span></div>
        <div className="style-controls">
          <div className="style-control-group">
            <span className="style-label">Size</span>
            {['small','medium','large'].map(s => (
              <button key={s} className={`toggle-btn ${settings.fontSize === s ? 'active' : ''}`} onClick={() => updateDraft('settings.fontSize', s)}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <div className="style-control-group">
            <span className="style-label">Style</span>
            <button className={`toggle-btn ${settings.globalBold ? 'active' : ''}`} onClick={() => updateDraft('settings.globalBold', !settings.globalBold)}><strong>B</strong></button>
            <button className={`toggle-btn ${settings.globalItalic ? 'active' : ''}`} onClick={() => updateDraft('settings.globalItalic', !settings.globalItalic)}><em>I</em></button>
          </div>
          <div className="style-control-group">
            <span className="style-label">Photo</span>
            <button className={`toggle-btn ${settings.showPhoto ? 'active' : ''}`} onClick={() => updateDraft('settings.showPhoto', !settings.showPhoto)}>{settings.showPhoto ? 'Shown' : 'Hidden'}</button>
          </div>
        </div>
      </div>

      <div className="edit-card">
        <div className="edit-card-header"><span className="edit-card-title">Accent Color</span></div>
        <p style={{ fontSize: '13px', color: '#888', marginBottom: '14px' }}>Used in templates that support color accents.</p>
        <div className="color-swatches">
          {COLORS.map(c => (
            <div key={c} className={`color-swatch ${settings.primaryColor === c ? 'active' : ''}`} style={{ background: c }} onClick={() => updateDraft('settings.primaryColor', c)} />
          ))}
          <input type="color" value={settings.primaryColor || '#000000'} onChange={e => updateDraft('settings.primaryColor', e.target.value)} style={{ width: '36px', height: '36px', border: '1px solid #ddd', cursor: 'pointer', padding: '2px' }} />
        </div>
      </div>
    </div>
  )
}

function SectionsEditor({ draft, setDraft }) {
  const order = draft.sectionOrder || ['education','experience','projects','skills','achievements']
  const visible = draft.visibleSections || order
  const LABELS = { education:'🎓 Education', experience:'💼 Experience', projects:'🔧 Projects', skills:'⚡ Skills', achievements:'🏆 Achievements' }

  const moveUp = (i) => { if (i===0) return; const n=[...order]; [n[i-1],n[i]]=[n[i],n[i-1]]; setDraft(prev => ({ ...prev, sectionOrder: n })) }
  const moveDown = (i) => { if (i===order.length-1) return; const n=[...order]; [n[i],n[i+1]]=[n[i+1],n[i]]; setDraft(prev => ({ ...prev, sectionOrder: n })) }
  const toggleVisible = (key) => { const updated = visible.includes(key) ? visible.filter(k => k!==key) : [...visible, key]; setDraft(prev => ({ ...prev, visibleSections: updated })) }

  return (
    <div>
      <div className="edit-card">
        <div className="edit-card-header"><span className="edit-card-title">Section Visibility & Order</span></div>
        <p style={{ fontSize: '13px', color: '#888', marginBottom: '16px' }}>Toggle sections on/off and reorder them on your resume.</p>
        <div className="visibility-list">
          {order.map((key, i) => (
            <div key={key} className="visibility-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontFamily: 'Georgia, serif', fontSize: '14px' }}>{LABELS[key] || key}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button className="btn-icon" onClick={() => moveUp(i)} disabled={i===0}>↑</button>
                <button className="btn-icon" onClick={() => moveDown(i)} disabled={i===order.length-1}>↓</button>
                <button className={`visibility-toggle ${visible.includes(key) ? 'on' : ''}`} onClick={() => toggleVisible(key)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

