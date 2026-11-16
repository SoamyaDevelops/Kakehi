import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme, type ThemePreference } from '../../context/ThemeContext'

const OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
]

export default function AppearanceSettings() {
  const { preference, setPreference } = useTheme()
  return (
    <section className="section" aria-labelledby="theme-h">
      <div className="section-head">
        <h2 id="theme-h">Theme</h2>
        <p className="muted small">System follows your device. Your choice is remembered on this browser.</p>
      </div>
      <div role="radiogroup" aria-labelledby="theme-h" className="segmented">
        {OPTIONS.map(({ value, label, icon: Icon }) => (
          <label key={value}>
            <input type="radio" name="theme" value={value} checked={preference === value} onChange={() => setPreference(value)} />
            <span><Icon size={16} aria-hidden />{label}</span>
          </label>
        ))}
      </div>
    </section>
  )
}
