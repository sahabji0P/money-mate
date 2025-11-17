import { useNavigate } from '@tanstack/react-router'
import { LayoutGrid, CreditCard, Plus, UserCheck, Settings } from 'lucide-react'
import { motion } from 'motion/react'

interface GroupBottomNavProps {
  groupId: string
  activeTab: 'overview' | 'expenses' | 'members' | 'balances' | 'activity' | 'settings'
  isOnChildRoute: boolean
  onTabChange: (tab: 'overview' | 'expenses' | 'members' | 'balances' | 'activity' | 'settings') => void
  onAddExpense: () => void
}

export function GroupBottomNav({
  groupId,
  activeTab,
  isOnChildRoute,
  onTabChange,
  onAddExpense,
}: GroupBottomNavProps) {
  const navigate = useNavigate()

  const handleTabClick = (tab: 'overview' | 'expenses' | 'members' | 'balances' | 'activity' | 'settings') => {
    if (isOnChildRoute) {
      navigate({ to: '/groups/$groupId', params: { groupId } })
    }
    onTabChange(tab)
  }

  const handleAddClick = () => {
    if (isOnChildRoute) {
      navigate({ to: '/groups/$groupId', params: { groupId } })
      // Use setTimeout to ensure navigation completes before opening drawer
      setTimeout(() => onAddExpense(), 100)
    } else {
      onAddExpense()
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'expenses', label: 'Transactions', icon: CreditCard },
    { id: 'add', label: 'Add', icon: Plus },
    { id: 'members', label: 'Members', icon: UserCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const getActiveTab = () => {
    if (isOnChildRoute) return 'expenses'
    return activeTab
  }

  return (
    <div className="md:hidden fixed inset-x-0 bottom-0 z-50 pb-safe px-safe">
      <div className="max-w-7xl mx-auto px-2 pb-3">
        <div className="bg-[#101418] border border-[#10B981]/30 rounded-2xl shadow-2xl p-1 flex items-center justify-between relative">
          {tabs.map((tab) => {
            const isActive = getActiveTab() === tab.id
            const Icon = tab.icon
            
            // Special styling for Add button
            if (tab.id === 'add') {
              return (
                <motion.button
                  key={tab.id}
                  onClick={handleAddClick}
                  className="relative"
                  whileTap={{ scale: 0.85, rotate: 90 }}
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15 }}
                >
                  <motion.div
                    className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-full shadow-lg shadow-[#10B981]/50 flex items-center justify-center"
                    whileHover={{ y: -2, boxShadow: "0 10px 40px rgba(16, 185, 129, 0.6)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
                  </motion.div>
                  <div className="w-14 h-8" /> {/* Spacer */}
                </motion.button>
              )
            }
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => handleTabClick(tab.id as any)}
                className={`flex-1 py-2.5 mx-0.5 rounded-xl text-center transition-colors relative z-10 ${
                  isActive ? 'text-white' : 'text-white/80'
                }`}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-[#10B981] rounded-xl shadow-lg"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <motion.div 
                  className="flex flex-col items-center gap-1 relative z-10"
                  animate={isActive ? { y: -2 } : { y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[10px]">{tab.label}</span>
                </motion.div>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
