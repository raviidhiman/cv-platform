import React, { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../utils/api'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', username: '', email: '' })
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState(null)
  const [resendTimer, setResendTimer] = useState(0)
  const otpRefs = useRef([])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (e.target.name === 'username') setUsernameAvailable(null)
  }

  const checkUsername = async () => {
    if (!form.username || form.username.length < 3) return
    try {
      const res = await API.get(`/auth/check-username/${form.username}`)
      setUsernameAvailable(res.data.available)
    } catch { setUsernameAvailable(null) }
  }

  const startResendTimer = () => {
    setResendTimer(60)
    const interval = setInterval(() => {
      setResendTimer(t => { if (t <= 1) { clearInterval(interval); return 0 } return t - 1 })
    }, 1000)
  }

  const handleSendOTP = async (e) => {
    e.preventDefault()
    if (!form.name || !form.username || !form.email) return toast.error('All fields required.')
    if (usernameAvailable === false) return toast.error('Username already taken.')
    setLoading(true)
    try {
      await API.post('/auth/register', form)
      toast.success('OTP sent to your email!')
      setStep(2)
      startResendTimer()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP.')
    } finally { setLoading(false) }
  }

  const handleResend = async () => {
    if (resendTimer > 0) return
    setLoading(true)
    try {
      await API.post('/auth/register', form)
      toast.success('OTP resent!')
      startResendTimer()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.')
    } finally { setLoading(false) }
  }

  const handleOTPChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < 5) otpRefs.current[index + 1]?.focus()
  }

  const handleOTPKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp]; newOtp[index] = ''; setOtp(newOtp)
      if (!otp[index] && index > 0) otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOTPPaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newOtp = Array(6).fill('')
    pasted.split('').forEach((char, i) => { newOtp[i] = char })
    setOtp(newOtp)
    otpRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    const otpString = otp.join('')
    if (otpString.length < 6) return toast.error('Enter the 6-digit OTP.')
    setLoading(true)
    try {
      await API.post('/auth/verify-register', { email: form.email, otp: otpString })
      toast.success('Email verified! Now set your password.')
      setStep(3)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP.')
      setOtp(['', '', '', '', '', ''])
      otpRefs.current[0]?.focus()
    } finally { setLoading(false) }
  }

  const handleSetPassword = async (e) => {
    e.preventDefault()
    if (password.length < 6) return toast.error('Password must be at least 6 characters.')
    if (password !== confirmPassword) return toast.error('Passwords do not match.')
    setLoading(true)
    try {
      const res = await API.post('/auth/complete-register', { ...form, password })
      localStorage.setItem('rp_token', res.data.token)
      localStorage.setItem('rp_user', JSON.stringify(res.data.user))
      toast.success('Account created! Welcome 🎉')
      window.location.href = '/dashboard'
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ borderBottom: '1.5px solid #000', paddingBottom: '16px', marginBottom: '24px' }}>
          <h1 className="auth-title">
            {step === 1 && 'Create Account'}
            {step === 2 && 'Verify Email'}
            {step === 3 && 'Set Password'}
          </h1>
          <p className="auth-subtitle" style={{ marginBottom: 0 }}>
            {step === 1 && 'Join CV and build your professional resume.'}
            {step === 2 && `Enter the 6-digit code sent to ${form.email}`}
            {step === 3 && 'Choose a secure password for your account.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ flex: 1, height: '3px', background: s <= step ? '#000' : '#e0e0e0', transition: 'background 0.3s' }} />
          ))}
        </div>

        {step === 1 && (
          <form onSubmit={handleSendOTP}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input name="name" className="form-input" value={form.name} onChange={handleChange} required autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">
                Username
                {usernameAvailable === true && <span style={{ color: '#16a34a', marginLeft: 8, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>✓ available</span>}
                {usernameAvailable === false && <span style={{ color: '#dc2626', marginLeft: 8, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>✗ taken</span>}
              </label>
              <input name="username" className="form-input" value={form.username} onChange={handleChange} onBlur={checkUsername} pattern="[a-zA-Z0-9_]{3,20}" required />
              <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>Profile URL: {window.location.origin}/resume/{form.username || 'username'}</div>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input name="email" type="email" className="form-input" value={form.email} onChange={handleChange} required />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>{loading ? 'Sending OTP...' : 'Send OTP →'}</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP}>
            <div className="otp-inputs" onPaste={handleOTPPaste} style={{ marginBottom: '16px' }}>
              {otp.map((digit, i) => (
                <input key={i} ref={el => otpRefs.current[i] = el}
                  type="text" inputMode="numeric" maxLength={1} className="otp-digit" value={digit}
                  onChange={e => handleOTPChange(i, e.target.value)} onKeyDown={e => handleOTPKeyDown(i, e)}
                  autoFocus={i === 0} />
              ))}
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading || otp.join('').length < 6}>
              {loading ? 'Verifying...' : 'Verify OTP →'}
            </button>
            <div style={{ textAlign: 'center', fontSize: '13px', color: '#888', marginTop: '14px' }}>
              {resendTimer > 0 ? <span>Resend in <strong>{resendTimer}s</strong></span> : <span>Didn't get it? <span className="auth-link" onClick={handleResend} style={{ cursor: 'pointer' }}>Resend OTP</span></span>}
            </div>
            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <span className="auth-link" onClick={() => setStep(1)} style={{ fontSize: '13px', cursor: 'pointer' }}>← Change email</span>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleSetPassword}>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} className="form-input" value={password} onChange={e => setPassword(e.target.value)} required autoFocus style={{ paddingRight: '48px' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#888' }}>
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
              <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>Minimum 6 characters</div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input type={showPassword ? 'text' : 'password'} className="form-input" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
              {confirmPassword && password !== confirmPassword && <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px' }}>Passwords do not match</div>}
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading || !password || password !== confirmPassword}>
              {loading ? 'Creating Account...' : 'Create Account →'}
            </button>
          </form>
        )}

        <div className="auth-footer" style={{ marginTop: '20px' }}>
          Already have an account? <Link to="/login" className="auth-link">Login</Link>
        </div>
      </div>
    </div>
  )
}
