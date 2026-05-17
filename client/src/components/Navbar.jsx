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

        <div className="navbar-left">
          <Link to="/" className="navbar-logo">
            <div className="logo-mark">
              <span className="logo-cv">CV</span>
              <span className="logo-home">HOMEPAGE</span>
            </div>
          </Link>

          <form onSubmit={handleSearch} className="navbar-search">
            <input
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit">Go</button>
          </form>
        </div>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              {user && (
  <Link to={`/resume/${user.username}`} className="nav-btn nav-btn-ghost" target="_blank">
    View ↗
  </Link>
)}
              {!isDashboard && (
                <Link to="/dashboard" className="nav-btn nav-btn-outline">Dashboard</Link>
              )}
             <Link to="/settings" className="nav-btn nav-btn-ghost">⚙ Settings</Link>
<button onClick={handleLogout} className="nav-btn nav-btn-ghost">↩ Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-btn nav-btn-ghost">Login</Link>
              <Link to="/register" className="nav-btn nav-btn-solid">Get Started</Link>
            </>
          )}
        </div>

      </div>
    </nav>
  )
}