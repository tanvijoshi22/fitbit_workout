import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'

interface PageWrapperProps {
  children: ReactNode
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

export function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div className="min-h-screen bg-bg-primary flex">
      <Sidebar />
      <main
        className="flex-1 lg:ml-60 lg:pb-0"
        style={{ paddingBottom: 'max(5rem, calc(4rem + env(safe-area-inset-bottom, 0px)))' }}
      >
        <motion.div
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 lg:py-8"
        >
          {children}
        </motion.div>
      </main>
      <BottomNav />
    </div>
  )
}
