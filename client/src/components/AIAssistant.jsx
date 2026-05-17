import React, { useState } from 'react'
import API from '../utils/api'
import toast from 'react-hot-toast'

const SECTION_HINTS = {
  personal: 'e.g. "My name is John, I am a software engineer based in Delhi, email john@gmail.com, linkedin linkedin.com/in/john"',
  education: 'e.g. "I did B.Tech in Computer Science from IIT Delhi, 2019-2023, CGPA 8.5"',
  experience: 'e.g. "I worked at Google as a software engineer from June 2023 to present, built payment systems, improved latency by 30%"',
  projects: 'e.g. "I built a task manager app using React and Node.js, github github.com/john/tasks, live at tasks.com"',
  skills: 'e.g. "I know Python, JavaScript, React, Node.js, MongoDB, Docker, AWS"',
  achievements: 'e.g. "I won Smart India Hackathon 2023, ranked top 5 nationally in ICPC 2022"',
}

export default function AIAssistant({ section, onApply, onClose }) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [chatMode, setChatMode] = useState(false)
  const [chatPrompt, setChatPrompt] = useState('')
  const [chatResponse, setChatResponse] = useState('')

  const handleFill = async () => {
    if (!message.trim()) return toast.error('Please describe your details first.')
    setLoading(true)
    try {
      const res = await API.post('/ai/fill', { message, section })
      if (res.data.success) {
        setResult(res.data.data)
        toast.success('AI extracted your details!')
      } else {
        toast.error(res.data.message || 'Could not parse. Try rephrasing.')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI service failed.')
    } finally { setLoading(false) }
  }

  const handleSuggest = async () => {
    if (!chatPrompt.trim()) return
    setLoading(true)
    try {
      const res = await API.post('/ai/suggest', {
        prompt: `For a ${section} section in a CV: ${chatPrompt}`
      })
      setChatResponse(res.data.text || '')
    } catch (err) {
      toast.error('AI service failed.')
    } finally { setLoading(false) }
  }

  const handleApply = () => {
    if (result) { onApply(result); onClose() }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>

        {/* Header */}
        <div style={{ background: '#0d0d0d', color: 'white', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 600 }}>🤖 AI Assistant</div>
            <div style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>Powered by Gemini AI</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid #555', color: 'white', padding: '4px 12px', cursor: 'pointer', fontSize: '13px' }}>Close</button>
        </div>

        {/* Mode Switch */}
        <div style={{ display: 'flex', borderBottom: '1px solid #eee' }}>
          <button onClick={() => setChatMode(false)} style={{ flex: 1, padding: '12px', border: 'none', background: !chatMode ? '#f5f5f5' : 'white', fontFamily: 'Georgia, serif', fontSize: '13px', cursor: 'pointer', borderBottom: !chatMode ? '2px solid #000' : 'none' }}>
            📋 Auto Fill
          </button>
          <button onClick={() => setChatMode(true)} style={{ flex: 1, padding: '12px', border: 'none', background: chatMode ? '#f5f5f5' : 'white', fontFamily: 'Georgia, serif', fontSize: '13px', cursor: 'pointer', borderBottom: chatMode ? '2px solid #000' : 'none' }}>
            💬 Ask AI
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {!chatMode ? (
            <>
              <p style={{ fontSize: '13px', color: '#555', marginBottom: '16px', lineHeight: 1.6 }}>
                Describe your <strong>{section}</strong> details in plain English. AI will extract and structure the data for you.
              </p>
              <div style={{ fontSize: '12px', color: '#888', background: '#f9f9f9', padding: '10px 14px', marginBottom: '14px', borderLeft: '3px solid #ddd', lineHeight: 1.6 }}>
                💡 {SECTION_HINTS[section] || 'Describe your details naturally'}
              </div>
              <textarea
                style={{ width: '100%', fontFamily: 'Georgia, serif', fontSize: '14px', padding: '12px', border: '1px solid #ddd', outline: 'none', resize: 'vertical', minHeight: '120px', marginBottom: '14px' }}
                placeholder={SECTION_HINTS[section]}
                value={message}
                onChange={e => setMessage(e.target.value)}
              />
              <button onClick={handleFill} disabled={loading || !message.trim()}
                style={{ width: '100%', padding: '12px', background: '#000', color: 'white', border: 'none', fontFamily: 'Georgia, serif', fontSize: '14px', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.6 : 1 }}>
                {loading ? '🤖 Processing...' : '✨ Extract Details with AI'}
              </button>

              {result && (
                <div style={{ marginTop: '20px', background: '#f9f9f9', border: '1px solid #e0e0e0', padding: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555', marginBottom: '12px' }}>AI Extracted Data — Review before applying</div>
                  <pre style={{ fontSize: '12px', color: '#333', overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'monospace', marginBottom: '14px' }}>
                    {JSON.stringify(result, null, 2)}
                  </pre>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={handleApply}
                      style={{ flex: 1, padding: '10px', background: '#000', color: 'white', border: 'none', fontFamily: 'Georgia, serif', fontSize: '13px', cursor: 'pointer' }}>
                      ✅ Apply to Form
                    </button>
                    <button onClick={() => setResult(null)}
                      style={{ padding: '10px 16px', background: 'white', border: '1px solid #ddd', fontFamily: 'Georgia, serif', fontSize: '13px', cursor: 'pointer' }}>
                      ✕ Discard
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <p style={{ fontSize: '13px', color: '#555', marginBottom: '16px', lineHeight: 1.6 }}>
                Ask AI anything about improving your <strong>{section}</strong> section.
              </p>
              <textarea
                style={{ width: '100%', fontFamily: 'Georgia, serif', fontSize: '14px', padding: '12px', border: '1px solid #ddd', outline: 'none', resize: 'vertical', minHeight: '80px', marginBottom: '14px' }}
                placeholder={`e.g. "Write 3 professional bullet points for a software engineer role", "How to describe my internship better?"`}
                value={chatPrompt}
                onChange={e => setChatPrompt(e.target.value)}
              />
              <button onClick={handleSuggest} disabled={loading || !chatPrompt.trim()}
                style={{ width: '100%', padding: '12px', background: '#000', color: 'white', border: 'none', fontFamily: 'Georgia, serif', fontSize: '14px', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.6 : 1, marginBottom: '16px' }}>
                {loading ? '🤖 Thinking...' : '💬 Ask AI'}
              </button>
              {chatResponse && (
                <div style={{ background: '#f9f9f9', border: '1px solid #e0e0e0', padding: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555', marginBottom: '10px' }}>AI Response</div>
                  <div style={{ fontSize: '13.5px', color: '#333', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{chatResponse}</div>
                  <button onClick={() => { navigator.clipboard.writeText(chatResponse); toast.success('Copied!') }}
                    style={{ marginTop: '12px', padding: '6px 14px', background: 'white', border: '1px solid #ddd', fontFamily: 'Georgia, serif', fontSize: '12px', cursor: 'pointer' }}>
                    📋 Copy
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
