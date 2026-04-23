import { format } from 'date-fns'
import { Bell, Zap } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

const BLUE     = '#2563EB'
const BG_CARD  = '#101D33'
const BORDER   = '#1A2D42'
const TEXT_PRI = '#EDF4FC'
const TEXT_SEC = '#7A9BB8'
const TEXT_MUT = '#3D5A74'

export function TopBar() {
  const { user, streak } = useAppStore()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <header style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        {/* Left: date + greeting */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em',
            color: TEXT_MUT, fontFamily: 'DM Sans', fontWeight: 500, marginBottom: 6,
          }}>
            {format(new Date(), 'EEEE, MMMM do')}
          </p>
          <h1 style={{ fontFamily: 'DM Sans', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
            <span style={{
              display: 'block',
              fontSize: 'clamp(1rem, 4vw, 1.3rem)',
              color: TEXT_SEC, fontWeight: 400,
            }}>
              {greeting},
            </span>
            <span style={{
              display: 'block',
              fontSize: 'clamp(1.4rem, 5.5vw, 2rem)',
              color: TEXT_PRI, fontWeight: 700,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {user?.name || 'Athlete'}
            </span>
          </h1>
        </div>

        {/* Right: streak + bell */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginTop: 4 }}>
          {streak > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'rgba(37,99,235,0.10)', border: '1px solid rgba(37,99,235,0.22)',
              padding: '5px 10px', borderRadius: 4,
            }}>
              <Zap size={11} fill={BLUE} style={{ color: BLUE }} />
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: 13, fontWeight: 700, color: BLUE }}>{streak}</span>
              <span style={{ fontFamily: 'DM Sans', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', color: TEXT_MUT }}>streak</span>
            </div>
          )}
          <button style={{
            padding: 9, borderRadius: 4, background: BG_CARD, border: `1px solid ${BORDER}`,
            color: TEXT_MUT, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            minWidth: 38, minHeight: 38, transition: 'border-color 0.15s',
          }}>
            <Bell size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}
