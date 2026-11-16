import { useId, useState, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { Eye, EyeOff, Check, Loader2 } from 'lucide-react'

interface BaseProps {
  label: string
  hint?: string
  error?: string | null
  status?: 'checking' | 'ok'
}

function Wrapper({ id, label, hint, error, status, children }: BaseProps & { id: string; children: React.ReactNode }) {
  return (
    <div className="field">
      <label htmlFor={id} className="field-label">{label}</label>
      <div className="field-control">
        {children}
        {status === 'checking' && <Loader2 size={16} className="spin field-status" aria-label="Checking" />}
        {status === 'ok' && <Check size={16} className="field-status ok" aria-label="Available" />}
      </div>
      {error ? (
        <p id={`${id}-msg`} className="field-error" role="alert">{error}</p>
      ) : hint ? (
        <p id={`${id}-msg`} className="field-hint">{hint}</p>
      ) : null}
    </div>
  )
}

export function TextField({ label, hint, error, status, ...rest }: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  return (
    <Wrapper id={id} label={label} hint={hint} error={error} status={status}>
      <input
        {...rest}
        id={id}
        className="input"
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${id}-msg` : undefined}
      />
    </Wrapper>
  )
}

export function PasswordField({ label, hint, error, ...rest }: BaseProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>) {
  const id = useId()
  const [shown, setShown] = useState(false)
  return (
    <Wrapper id={id} label={label} hint={hint} error={error}>
      <input
        {...rest}
        id={id}
        type={shown ? 'text' : 'password'}
        className="input input-with-action"
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${id}-msg` : undefined}
      />
      <button type="button" className="field-action" onClick={() => setShown((s) => !s)} aria-label={shown ? 'Hide password' : 'Show password'}>
        {shown ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
      </button>
    </Wrapper>
  )
}

export function TextArea({ label, hint, error, ...rest }: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId()
  return (
    <Wrapper id={id} label={label} hint={hint} error={error}>
      <textarea
        {...rest}
        id={id}
        className="input textarea"
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${id}-msg` : undefined}
      />
    </Wrapper>
  )
}
