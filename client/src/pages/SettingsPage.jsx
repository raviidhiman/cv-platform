import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../utils/api'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState(user?.name || '')
  const [username, setUsername] = useState(user?.username || '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const res = await API.put('/user/me', { name, username })
      updateUser(res.data.user)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update.')
    } finally { setSavingProfile(false) }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters.')
    if (newPassword !== confirmNewPassword) return toast.error('Passwords do not match.')
    setSavingPassword(true)
    try {
      await API.put('/user/change-password', { currentPassword, newPassword })
      toast.success('Password changed!')
      setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.')
    } finally { setSavingPassword(false) }
  }

  const handleDeleteAccount = async () => {
    if (confirmDelete !== user?.username) return toast.error(`Type your username "${user?.username}" to confirm.`)
    setDeletingAccount(true)
    try {
      await API.delete('/user/me')
      logout(); toast.success('Account deleted.'); navigate('/')
    } catch {
      toast.error('Failed to delete account.')
    } finally { setDeletingAccount(false) }
  }

  return (
    <div className="settings-page">
      <div className="settings-inner">
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: 600, marginBottom: '24px' }}>Settings</h1>

        <div className="settings-section">
          <div className="settings-section-title">Profile Information</div>
          <form onSubmit={handleSaveProfile}>
            <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={name} onChange={e => setName(e.target.value)} required /></div>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input className="form-input" value={username} onChange={e => setUsername(e.target.value.toLowerCase())} pattern="[a-z0-9_]{3,20}" required />
              <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>Your CV URL: {window.location.origin}/resume/{username}</div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" value={user?.email || ''} disabled style={{ background: '#f5f5f5', color: '#888' }} />
              <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>Email cannot be changed.</div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={savingProfile}>{savingProfile ? 'Saving...' : 'Save Changes'}</button>
          </form>
        </div>

        <div className="settings-section">
          <div className="settings-section-title">Change Password</div>
          <form onSubmit={handleChangePassword}>
            <div className="form-group"><label className="form-label">Current Password</label><input type="password" className="form-input" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required /></div>
            <div className="form-group"><label className="form-label">New Password</label><input type="password" className="form-input" value={newPassword} onChange={e => setNewPassword(e.target.value)} required /></div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input type="password" className="form-input" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} required />
              {confirmNewPassword && newPassword !== confirmNewPassword && <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px' }}>Passwords do not match</div>}
            </div>
            <button type="submit" className="btn btn-primary" disabled={savingPassword || !currentPassword || !newPassword || newPassword !== confirmNewPassword}>
              {savingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>

        <div className="settings-section">
          <div className="settings-section-title">Public CV</div>
          <p style={{ fontSize: '13.5px', color: '#666', marginBottom: '14px' }}>Your CV is publicly accessible at:</p>
          <div style={{ background: '#f5f5f5', padding: '12px 16px', fontFamily: 'monospace', fontSize: '13px', marginBottom: '14px', border: '1px solid #e0e0e0' }}>
            {window.location.origin}/resume/{user?.username}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/resume/${user?.username}`); toast.success('Link copied!') }}>Copy Link</button>
            <a href={`/resume/${user?.username}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">Open CV ↗</a>
          </div>
        </div>

        <div className="settings-section" style={{ borderColor: '#fecaca' }}>
          <div className="settings-section-title" style={{ color: '#dc2626' }}>Danger Zone</div>
          <p style={{ fontSize: '13.5px', color: '#666', marginBottom: '14px' }}>Deleting your account is permanent. All your CV data will be lost.</p>
          <div className="form-group">
            <label className="form-label">Type your username to confirm: <strong>{user?.username}</strong></label>
            <input className="form-input" value={confirmDelete} onChange={e => setConfirmDelete(e.target.value)} placeholder={user?.username} style={{ borderColor: confirmDelete && confirmDelete !== user?.username ? '#dc2626' : '' }} />
          </div>
          <button className="btn btn-danger" onClick={handleDeleteAccount} disabled={deletingAccount || confirmDelete !== user?.username}>
            {deletingAccount ? 'Deleting...' : 'Delete My Account'}
          </button>
        </div>
      </div>
    </div>
  )
}
