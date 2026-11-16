import type { ReactNode } from 'react'
import { AlertCircle, CheckCircle2, Info, Loader2 } from 'lucide-react'

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <span role="status" className="spinner-wrap">
      <Loader2 size={20} className="spin" aria-hidden />
      <span className="sr-only">{label}</span>
    </span>
  )
}

export function FullScreenLoader() {
  return (
    <div className="center-screen">
      <Spinner />
    </div>
  )
}

export function Skeleton({ width = '100%', height = 14 }: { width?: number | string; height?: number }) {
  return <span className="skeleton" style={{ width, height }} aria-hidden="true" />
}

type NoticeKind = 'info' | 'success' | 'warning' | 'error'
export function Notice({ kind = 'info', title, children }: { kind?: NoticeKind; title?: string; children?: ReactNode }) {
  const Icon = kind === 'error' ? AlertCircle : kind === 'success' ? CheckCircle2 : Info
  return (
    <div className={`notice notice-${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      <Icon size={18} aria-hidden />
      <div>
        {title && <p className="notice-title">{title}</p>}
        {children && <div className="notice-body">{children}</div>}
      </div>
    </div>
  )
}

export function EmptyState({ icon, title, children, action }: { icon?: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty">
      {icon && <div className="empty-icon">{icon}</div>}
      <h2>{title}</h2>
      {children && <p className="muted">{children}</p>}
      {action}
    </div>
  )
}
