import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isDashboard = location.pathname === '/dashboard'
  const [search, setSearch] = useState('')

  const handleLogout = () => { logout(); toast.success('Logged out.'); navigate('/') }

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) { navigate(`/resume/${search.trim().toLowerCase()}`); setSearch('') }
  }

  return (
    <nav className="navbar no-print">
      <div className="navbar-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/" className="navbar-logo">
            <div className="logo-mark" style={{ flexDirection: 'column', width: '58px', height: '58px', fontSize: '13px', padding: '8px' }}>
              <span style={{ fontWeight: 700, letterSpacing: '0.05em' }}>CV</span>
              <span style={{ fontSize: '8px', fontWeight: 400, letterSpacing: '0.1em', opacity: 0.8 }}>homepage</span>
            </div>
          </Link>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0' }}>
            <input className="form-input" placeholder="Search username..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ height: '38px', width: '200px', fontSize: '14px', padding: '0 12px', borderRight: 'none' }} />
            <button type="submit" className="btn btn-primary" style={{ height: '38px', padding: '0 14px', fontSize: '14px' }}>Search</button>
          </form>
        </div>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              {user && <Link to={`/resume/${user.username}`} className="btn btn-ghost btn-sm" target="_blank">View Profile ↗</Link>}
              {!isDashboard && <Link to="/dashboard" className="btn btn-secondary btn-sm">Dashboard</Link>}
              <Link to="/settings" className="btn btn-ghost btn-sm">Settings</Link>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
