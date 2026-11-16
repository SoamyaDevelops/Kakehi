import { Link } from 'react-router-dom'
import { Avatar } from '../components/ui/Avatar'
import { Notice } from '../components/ui/Feedback'
import { useAuth } from '../context/AuthContext'
import { useNetwork } from '../context/NetworkContext'

export default function HomePage() {
  const { profile, isOwner } = useAuth()
  const { state } = useNetwork()
  if (!profile) return null

  const enforcementOff = state.phase === 'ready' && !state.status.enforcement_active
  const joined = new Date(profile.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="page">
      <div className="home-hello">
        <Avatar name={profile.display_name} seed={profile.id} size={56} />
        <div className="page-head">
          <h1>Welcome, {profile.display_name}</h1>
          <p className="muted">@{profile.username}</p>
        </div>
      </div>

      {isOwner && enforcementOff && (
        <Notice kind="warning" title="Network restriction is not active">
          Anyone with the link can see Kakehi. Switch it on after testing from the college Wi-Fi and from mobile data.
        </Notice>
      )}

      <div className="facts">
        <div className="fact">
          <span className="fact-label">Joined</span>
          <span className="fact-value">{joined}</span>
        </div>
        <div className="fact">
          <span className="fact-label">Role</span>
          <span className="fact-value">{isOwner ? 'Owner' : 'Student'}</span>
        </div>
      </div>

      <Notice title="Your account is ready">
        <p>Friends, messaging, files and stickers are being added step by step. You can edit your details in <Link to="/app/settings">Settings</Link> now.</p>
      </Notice>
    </div>
  )
}
