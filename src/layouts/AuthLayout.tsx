import type { ReactNode } from 'react'
import { Wordmark } from '../components/ui/Logo'

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-page">
      <div className="auth-top">
        <Wordmark />
      </div>
      <main className="auth-main">
        <div className="auth-panel">{children}</div>
      </main>
    </div>
  )
}
