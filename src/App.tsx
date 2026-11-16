import { Navigate, Route, Routes } from 'react-router-dom'
import { NetworkGate } from './routes/NetworkGate'
import { PublicOnly, RequireAuth, RootRedirect } from './routes/guards'
import { AppLayout } from './layouts/AppLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import NetworkStatusPage from './pages/NetworkStatusPage'
import HomePage from './pages/HomePage'
import SettingsPage from './pages/SettingsPage'
import AccountSettings from './pages/settings/AccountSettings'
import AppearanceSettings from './pages/settings/AppearanceSettings'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      {/* Always reachable so people can diagnose a blocked connection */}
      <Route path="/network-status" element={<NetworkStatusPage />} />

      {/* Everything else requires a trusted network (when enforcement is on) */}
      <Route element={<NetworkGate />}>
        <Route path="/" element={<RootRedirect />} />
        <Route element={<PublicOnly />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route path="/app" element={<AppLayout />}>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<HomePage />} />
            <Route path="settings" element={<SettingsPage />}>
              <Route index element={<Navigate to="account" replace />} />
              <Route path="account" element={<AccountSettings />} />
              <Route path="appearance" element={<AppearanceSettings />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
