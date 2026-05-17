import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../utils/api'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotStep, setForgotStep] = useState(1)
  const [forgotOTP, setForgotOTP] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await API.post('/auth/login', { email, password })
      login(res.data.token, res.data.user)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed.')
    } finally { setLoading(false) }
  }

  const handleForgotSend = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await API.post('/auth/forgot-password', { email: forgotEmail })
      toast.success('OTP sent!')
      setForgotStep(2)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed.')
    } finally { setLoading(false) }
  }

  const handleForgotReset = async (e) => {
    e.preventDefault()
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters.')
    setLoading(true)
    try {
      await API.post('/auth/reset-password', { email: forgotEmail, otp: forgotOTP, newPassword })
      toast.success('Password reset! Please login.')
      setShowForgot(false); setForgotStep(1); setForgotEmail(''); setForgotOTP(''); setNewPassword('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed.')
    } finally { setLoading(false) }
  }

  if (showForgot) return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ borderBottom: '1.5px solid #000', paddingBottom: '16px', marginBottom: '24px' }}>
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle" style={{ marginBottom: 0 }}>
            {forgotStep === 1 ? 'Enter your email to receive an OTP.' : 'Enter the OTP and your new password.'}
          </p>
        </div>
        {forgotStep === 1 ? (
          <form onSubmit={handleForgotSend}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" className="form-input" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required autoFocus />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>{loading ? 'Sending...' : 'Send OTP →'}</button>
          </form>
        ) : (
          <form onSubmit={handleForgotReset}>
            <div className="form-group">
              <label className="form-label">OTP Code</label>
              <input className="form-input" value={forgotOTP} onChange={e => setForgotOTP(e.target.value)} placeholder="6-digit code" maxLength={6} required />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input type="password" className="form-input" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>{loading ? 'Resetting...' : 'Reset Password →'}</button>
          </form>
        )}
        <div className="auth-footer">
          <span className="auth-link" onClick={() => setShowForgot(false)} style={{ cursor: 'pointer' }}>← Back to Login</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ borderBottom: '1.5px solid #000', paddingBottom: '16px', marginBottom: '24px' }}>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle" style={{ marginBottom: 0 }}>Login to manage your CV.</p>
        </div>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} className="form-input" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingRight: '48px' }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#888' }}>
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>
          <div style={{ textAlign: 'right', marginBottom: '16px', marginTop: '-10px' }}>
            <span className="auth-link" onClick={() => setShowForgot(true)} style={{ fontSize: '13px', cursor: 'pointer' }}>Forgot password?</span>
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading || !email || !password}>{loading ? 'Logging in...' : 'Login →'}</button>
        </form>
        <div className="auth-footer">Don't have an account? <Link to="/register" className="auth-link">Register</Link></div>
      </div>
    </div>
  )
}
