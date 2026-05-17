import React, { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import API from '../utils/api'
import { ResumeRenderer } from '../components/templates/ResumeTemplates'
import { TEMPLATES } from '../utils/fonts'
import toast from 'react-hot-toast'

export default function PublicResumePage() {
  const { username } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTemplate, setActiveTemplate] = useState(null)
  const [exporting, setExporting] = useState(false)
  const resumeRef = useRef()

  useEffect(() => {
    API.get(`/resume/${username}`)
      .then(res => {
        setData(res.data)
        const enabled = res.data.resume?.settings?.enabledTemplates
        const defaultT = res.data.resume?.settings?.defaultTemplate || 'classic'
        setActiveTemplate(enabled?.includes(defaultT) ? defaultT : (enabled?.[0] || 'classic'))
      })
      .catch(() => toast.error('Profile not found.'))
      .finally(() => setLoading(false))
  }, [username])

  const handlePrint = () => window.print()

  const handleExportPDF = async () => {
    setExporting(true)
    try {
      const { default: jsPDF } = await import('jspdf')
      const { default: html2canvas } = await import('html2canvas')
      const element = resumeRef.current
      const canvas = await html2canvas(element, {
        scale: 3, useCORS: true, backgroundColor: '#ffffff',
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      })
      const imgData = canvas.toDataURL('image/jpeg', 1.0)
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgHeight = (canvas.height * pdfWidth) / canvas.width

      if (imgHeight <= pdfHeight) {
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeight)
      } else {
        let position = 0
        let remaining = imgHeight
        while (remaining > 0) {
          pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight)
          remaining -= pdfHeight
          position -= pdfHeight
          if (remaining > 0) pdf.addPage()
        }
      }
      pdf.save(`${data?.user?.name || username}_CV_${activeTemplate}.pdf`)
      toast.success('PDF downloaded!')
    } catch (err) {
      console.error('PDF error:', err)
      toast.error('PDF export failed. Try Print instead.')
    } finally {
      setExporting(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Link copied!')
  }

  if (loading) return (
    <div className="public-resume-page">
      <div className="loading-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="spinner" />
        <p style={{ fontFamily: 'Georgia, serif', fontSize: '14px', color: '#888' }}>Loading CV...</p>
      </div>
    </div>
  )

  if (!data) return (
    <div className="public-resume-page">
      <div className="loading-center" style={{ minHeight: 'calc(100vh - 64px)', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px' }}>Profile not found</div>
        <p style={{ color: '#888' }}>The username <strong>{username}</strong> does not exist.</p>
        <Link to="/" className="btn btn-secondary">← Go Home</Link>
      </div>
    </div>
  )

  const { resume, user } = data
  const enabledTemplates = resume?.settings?.enabledTemplates || ['classic']
  const availableTemplates = TEMPLATES.filter(t => enabledTemplates.includes(t.id))

  return (
    <div className="public-resume-page">
      <div className="resume-page-inner">
        <div className="resume-toolbar no-print">
          <div className="toolbar-left">
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '15px', fontWeight: 600 }}>
              {user?.name}'s CV
            </span>
            {user?.profileViews > 0 && <span className="view-count">· {user.profileViews} views</span>}
          </div>
          <div className="toolbar-right">
            <button className="btn btn-ghost btn-sm" onClick={handleCopyLink}>🔗 Share</button>
            <button className="btn btn-ghost btn-sm" onClick={handlePrint}>🖨 Print</button>
            <button className="btn btn-secondary btn-sm" onClick={handleExportPDF} disabled={exporting}>
              {exporting ? 'Exporting...' : '⬇ PDF'}
            </button>
          </div>
        </div>

        {availableTemplates.length > 1 && (
          <div className="template-tabs no-print">
            {availableTemplates.map(t => (
              <button key={t.id} className={`template-tab ${activeTemplate === t.id ? 'active' : ''}`}
                onClick={() => setActiveTemplate(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        )}

        <div ref={resumeRef}>
          <ResumeRenderer resume={resume} template={activeTemplate} settings={resume?.settings} preview={false} />
        </div>
      </div>
    </div>
  )
}
