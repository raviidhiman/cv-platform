import React from 'react'
import { Link } from 'react-router-dom'
import { TEMPLATES } from '../utils/fonts'

export default function LandingPage() {
  return (
    <div className="landing-page">
      <section className="hero">
        <div className="hero-badge">Professional CV Platform</div>
        <h1 className="hero-title">Build your CV.<br /><span>Share it anywhere.</span></h1>
        <p className="hero-subtitle">Create a stunning professional CV with multiple templates, custom fonts, and a public URL you can share with anyone.</p>
        <div className="hero-actions">
          <Link to="/register" className="btn btn-primary" style={{ fontSize: '15px', padding: '12px 32px' }}>Get Started Free →</Link>
          <Link to="/login" className="btn btn-secondary" style={{ fontSize: '15px', padding: '12px 32px' }}>Login</Link>
        </div>
      </section>

      <section className="templates-preview">
        <div className="section-label">Choose from 5 Professional Templates</div>
        <div className="template-cards">
          {TEMPLATES.map((t) => (
            <div key={t.id} className="template-card">
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>
                {t.id === 'classic' && '📄'}{t.id === 'modern' && '🎨'}{t.id === 'creative' && '✨'}{t.id === 'minimal' && '⬜'}{t.id === 'executive' && '💼'}
              </div>
              <div className="template-card-name">{t.label}</div>
              <div className="template-card-desc">{t.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="features-section">
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Everything you need</div>
        <div style={{ fontSize: '15px', color: '#aaa' }}>Built for professionals who want to stand out</div>
        <div className="features-grid">
          {[
            { icon: '🖋', title: '10 Font Styles', desc: 'Garamond, Calibri, Arial, Times New Roman and more' },
            { icon: '📐', title: '5 Templates', desc: 'Classic, Modern, Creative, Minimal, Executive' },
            { icon: '🔗', title: 'Public URL', desc: 'Share your CV at yoursite.com/ resume/ username' },
            { icon: '🔄', title: 'Viewer Switching', desc: 'Visitors can switch between templates you enable' },
            { icon: '📥', title: 'PDF Export', desc: 'Download any template as a print-ready PDF' },
            { icon: '✏️', title: 'Custom Fields', desc: 'Add any extra info to any section' },
          ].map((f, i) => (
            <div key={i} className="feature-item">
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      

      <footer style={{ background: '#0d0d0d', color: 'white', padding: '56px 24px 32px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '40px', marginBottom: '48px' }}>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 700, marginBottom: '12px' }}>CV Platform</div>
              <p style={{ fontSize: '14px', color: '#aaa', lineHeight: 1.7 }}>Build and share your professional CV with multiple templates, custom fonts, and a public URL.</p>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#888', marginBottom: '16px' }}>Quick Links</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[{ label: 'Home', href: '/' }, { label: 'Register', href: '/register' }, { label: 'Login', href: '/login' }].map((link, i) => (
                  <a key={i} href={link.href} style={{ color: '#ccc', fontSize: '14px', textDecoration: 'none' }}
                    onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = '#ccc'}>
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#888', marginBottom: '16px' }}>Connect</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'LinkedIn', href: 'https://linkedin.com/in/your-username', icon: '💼' },
                  { label: 'GitHub', href: 'https://github.com/raviidhiman', icon: '⌥' },
                  { label: 'Twitter / X', href: 'https://twitter.com/your-username', icon: '𝕏' },
                  { label: 'Email', href: 'mailto:ravidhiman8673@gmail.com', icon: '✉' },
                ].map((social, i) => (
                  <a key={i} href={social.href} target="_blank" rel="noreferrer"
                    style={{ color: '#ccc', fontSize: '14px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'white'} onMouseLeave={e => e.currentTarget.style.color = '#ccc'}>
                    <span>{social.icon}</span> {social.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
          
        </div>
      </footer>
    </div>
  )
}
