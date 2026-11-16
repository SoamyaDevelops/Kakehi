import { NavLink, Outlet } from 'react-router-dom'

export default function SettingsPage() {
  return (
    <div className="page">
      <div className="page-head">
        <h1>Settings</h1>
      </div>
      <nav className="subnav" aria-label="Settings">
        <NavLink to="/app/settings/account">Account</NavLink>
        <NavLink to="/app/settings/appearance">Appearance</NavLink>
      </nav>
      <Outlet />
    </div>
  )
}
