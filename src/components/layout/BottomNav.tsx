import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Dumbbell, Clock, Apple, MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'

const BLUE     = '#2563EB'
const BLUE_DIM = 'rgba(37,99,235,0.12)'
const BG       = '#101D33'
const BORDER   = '#1A2D42'
const TEXT_MUT = '#3D5A74'

const navItems = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Home'      },
  { to: '/workout/today', icon: Dumbbell,         label: 'Workout'   },
  { to: '/history',       icon: Clock,            label: 'History'   },
  { to: '/nutrition',     icon: Apple,            label: 'Nutrition' },
  { to: '/coach',         icon: MessageCircle,    label: 'Coach'     },
]

export function BottomNav() {
  return (
    <nav
      className="lg:hidden"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        padding: '0 12px',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom, 12px))',
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        backgroundColor: BG,
        border: `1px solid ${BORDER}`,
        borderRadius: 12,
        padding: '6px 4px',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 -2px 20px rgba(0,0,0,0.4)',
      }}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} style={{ flex: 1, textDecoration: 'none' }}>
            {({ isActive }) => (
              <motion.div
                whileTap={{ scale: 0.88 }}
                transition={{ duration: 0.12 }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  padding: '7px 4px', borderRadius: 8, minHeight: 52,
                  justifyContent: 'center',
                  background: isActive ? BLUE_DIM : 'transparent',
                  transition: 'background 0.18s',
                }}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.75}
                  style={{
                    color: isActive ? BLUE : TEXT_MUT,
                    filter: isActive ? 'drop-shadow(0 0 5px rgba(37,99,235,0.55))' : 'none',
                    transition: 'color 0.18s',
                  }}
                />
                <span style={{
                  fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em',
                  lineHeight: 1, fontFamily: 'DM Sans',
                  fontWeight: isActive ? 700 : 400,
                  color: isActive ? BLUE : TEXT_MUT,
                  transition: 'color 0.18s',
                }}>
                  {label}
                </span>
              </motion.div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
