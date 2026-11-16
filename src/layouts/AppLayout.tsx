import { NavLink, Outlet } from 'react-router-dom'
import { House, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Avatar } from '../components/ui/Avatar'
import { Wordmark } from '../components/ui/Logo'

const NAV = [
  { to: '/app/home', label: 'Home', icon: House },
  { to: '/app/settings', label: 'Settings', icon: Settings },
]

export function AppLayout() {
  const { profile, signOut } = useAuth()
  const toast = useToast()

  async function handleSignOut() {
    try {
      await signOut()
    } catch {
      toast.error('Couldn’t sign out. Try again.')
    }
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <Wordmark />
        <nav className="nav" aria-label="Main">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <Icon size={18} aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-spacer" />
        {profile && (
          <div className="user-chip">
            <Avatar name={profile.display_name} seed={profile.id} />
            <div className="user-chip-text">
              <div className="user-chip-name">{profile.display_name}</div>
              <div className="user-chip-handle">@{profile.username}</div>
            </div>
            <button className="icon-btn" onClick={handleSignOut} aria-label="Sign out" title="Sign out">
              <LogOut size={18} aria-hidden />
            </button>
          </div>
        )}
      </aside>

      <div className="content">
        <header className="topbar">
          <Wordmark />
          {profile && <Avatar name={profile.display_name} seed={profile.id} size={30} />}
        </header>
        <main id="main">
          <Outlet />
        </main>
      </div>

      <nav className="tabbar" aria-label="Main">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `tab${isActive ? ' active' : ''}`}>
            <Icon size={20} aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
