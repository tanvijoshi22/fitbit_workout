import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Calendar, Dumbbell, Apple, MessageCircle,
  Clock, Settings, LogOut, Activity,
} from 'lucide-react'
import { supabase } from '../../api/supabase'
import { useAppStore } from '../../store/useAppStore'
import toast from 'react-hot-toast'

const BLUE     = '#2563EB'
const BLUE_DIM = 'rgba(37,99,235,0.10)'
const BG_SEC   = '#0C1525'
const BG_EL    = '#101D33'
const BORDER   = '#1A2D42'
const TEXT_PRI = '#EDF4FC'
const TEXT_SEC = '#7A9BB8'
const TEXT_MUT = '#3D5A74'

const navItems = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/plan',          icon: Calendar,        label: 'My Plan'   },
  { to: '/workout/today', icon: Dumbbell,        label: 'Workout'   },
  { to: '/nutrition',     icon: Apple,           label: 'Nutrition' },
  { to: '/coach',         icon: MessageCircle,   label: 'Coach'     },
  { to: '/history',       icon: Clock,           label: 'History'   },
  { to: '/settings',      icon: Settings,        label: 'Settings'  },
]

export function Sidebar() {
  const navigate = useNavigate()
  const { user, setUser, setAuthenticated } = useAppStore()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setAuthenticated(false)
    navigate('/')
    toast.success('Logged out')
  }

  return (
    <aside
      className="hidden lg:flex"
      style={{
        position: 'fixed', left: 0, top: 0, height: '100%', width: 240,
        backgroundColor: BG_SEC,
        borderRight: `1px solid ${BORDER}`,
        flexDirection: 'column', zIndex: 50,
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '22px 20px', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{
          padding: 8, borderRadius: 6,
          background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
          boxShadow: '0 2px 8px rgba(37,99,235,0.35)',
        }}>
          <Activity size={16} style={{ color: 'white' }} strokeWidth={2.5} />
        </div>
        <span style={{ fontFamily: 'DM Sans', fontWeight: 700, fontSize: 17, color: TEXT_PRI, letterSpacing: '0.04em' }}>
          FitForge
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: 2 }}
                transition={{ duration: 0.12 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 11,
                  padding: '9px 11px', borderRadius: 6, transition: 'all 0.15s',
                  background: isActive ? BLUE_DIM : 'transparent',
                  color: isActive ? BLUE : TEXT_SEC,
                  border: `1px solid ${isActive ? 'rgba(37,99,235,0.20)' : 'transparent'}`,
                  cursor: 'pointer',
                }}
              >
                <Icon
                  size={16} strokeWidth={isActive ? 2.5 : 2}
                  style={{ flexShrink: 0 }}
                />
                <span style={{ fontFamily: 'DM Sans', fontWeight: isActive ? 600 : 400, fontSize: 14 }}>
                  {label}
                </span>
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: '10px 10px', borderTop: `1px solid ${BORDER}` }}>
        {user && (
          <div style={{
            padding: '10px 12px', marginBottom: 6, borderRadius: 6,
            background: BG_EL, border: `1px solid ${BORDER}`,
          }}>
            <p style={{ fontSize: 11, color: TEXT_MUT, fontFamily: 'DM Sans', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </p>
            <p style={{ fontSize: 13, color: TEXT_PRI, fontFamily: 'DM Sans', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
              {user.name}
            </p>
          </div>
        )}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 11, padding: '9px 11px', width: '100%',
            color: TEXT_MUT, background: 'none', border: 'none', cursor: 'pointer',
            borderRadius: 6, fontFamily: 'DM Sans', fontWeight: 400, fontSize: 14,
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            const b = e.currentTarget
            b.style.color = '#f87171'
            b.style.background = 'rgba(248,113,113,0.06)'
          }}
          onMouseLeave={e => {
            const b = e.currentTarget
            b.style.color = TEXT_MUT
            b.style.background = 'none'
          }}
        >
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  )
}
