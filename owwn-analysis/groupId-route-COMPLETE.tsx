import { createFileRoute, useNavigate, Link, Outlet, useMatches } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../../convex/_generated/api'
import { useAuth } from '~/lib/auth-context'
import { useMutation, useConvex, useAction } from 'convex/react'
import { useState, Suspense, useEffect, useRef } from 'react'
import { ArrowLeft, Plus, Users, Receipt, DollarSign, TrendingUp, UserPlus, X, Search, Check, ChevronsUpDown, LayoutGrid, CreditCard, UserCheck, UtensilsCrossed, Car, Popcorn, Zap, ShoppingBag, MoreHorizontal, Wallet, Download, Sparkles} from 'lucide-react'
import { GroupBottomNav } from '~/components/GroupBottomNav'
import { motion, AnimatePresence } from 'motion/react'
import { Drawer, DrawerContent } from '~/components/ui/drawer'
import { Checkbox } from '~/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group'

function GroupDetailSkeleton() {
  return (
    <div className="min-h-[100dvh] bg-[#0A0F12]">
      <header className="bg-[#101418]/80 backdrop-blur-md shadow-lg border-b border-[#10B981]/30 sticky top-0 z-40 pt-safe px-safe">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-white/10 rounded-lg animate-pulse" />
              <div className="w-40 h-6 bg-white/10 rounded animate-pulse" />
            </div>
            <div className="w-32 h-10 bg-white/10 rounded-xl animate-pulse" />
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[#101418] rounded-2xl shadow-xl p-8 mb-6 border border-[#10B981]/30">
          <div className="text-center py-8">
            <div className="w-32 h-32 mx-auto bg-white/10 rounded-full animate-pulse mb-4" />
            <div className="w-48 h-8 mx-auto bg-white/10 rounded animate-pulse" />
          </div>
        </div>
      </main>
    </div>
  )
}

export const Route = createFileRoute('/groups/$groupId')({
  component: GroupDetail,
  pendingComponent: GroupDetailSkeleton,
})

function GroupDetail() {
  const { groupId } = Route.useParams()
  const { user, isLoading: isAuthLoading } = useAuth()
  const navigate = useNavigate()
  const matches = useMatches()
  const [showAddExpense, setShowAddExpense] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)
  const [showSettlement, setShowSettlement] = useState(false)
  const [settlementMember, setSettlementMember] = useState<any>(null)
  const [showAiAssistant, setShowAiAssistant] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'members' | 'balances' | 'activity' | 'settings'>('expenses')
  const [, setEditingName] = useState('')
  const [, setEditingDescription] = useState('')
  const [aiInstruction, setAiInstruction] = useState('')
  const [aiStatus, setAiStatus] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)

  // Check if we're on a child route (e.g., expense details)
  const isOnChildRoute = matches.length > 2 // Root + Group + Child

  const { data: group } = useSuspenseQuery(
    convexQuery(api.groups.getGroupDetails, { groupId: groupId as any })
  )

  const { data: expenses } = useSuspenseQuery(
    convexQuery(api.expenses.getGroupExpenses, { groupId: groupId as any })
  )

  const { data: settlements } = useSuspenseQuery(
    convexQuery(api.settlements.getGroupSettlements, { groupId: groupId as any })
  )

  const { data: balances } = useSuspenseQuery(
    convexQuery(api.expenses.getGroupBalances, { groupId: groupId as any })
  )

  const createFromInstruction = useAction(api.ai.createExpenseFromInstruction)

  // Show loading skeleton while auth is loading
  if (isAuthLoading) {
    return <GroupDetailSkeleton />
  }

  // If no user after loading, show auth required state
  if (!user) {
    return (
      <motion.div 
        className="min-h-[100dvh] bg-[#0A0F12] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Authentication Required</h2>
          <p className="text-white/70 mb-4">Please sign in to view this group.</p>
          <button
            onClick={() => navigate({ to: '/' })}
            className="bg-[#10B981] hover:bg-[#059669] text-white font-semibold py-2 px-6 rounded-xl transition-all shadow-lg"
          >
            Go to Sign In
          </button>
        </div>
      </motion.div>
    )
  }

  // If no group found, show error state
  if (!group) {
    return (
      <motion.div 
        className="min-h-[100dvh] bg-[#0A0F12] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Group not found</h2>
          <p className="text-white/70 mb-4">This group doesn't exist or you don't have access to it.</p>
          <button
            onClick={() => navigate({ to: '/' })}
            className="bg-[#10B981] hover:bg-[#059669] text-white font-semibold py-2 px-6 rounded-xl transition-all shadow-lg"
          >
            Go to Dashboard
          </button>
        </div>
      </motion.div>
    )
  }

  const userBalance = balances.balances.find((b) => b.userId === user._id)

  return (
    <motion.div 
      className="min-h-[100dvh] bg-[#0A0F12]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Shared Header - Dynamic content based on route */}
      <header className="bg-[#101418]/80 backdrop-blur-md shadow-lg border-b border-[#10B981]/30 sticky top-0 z-40 pt-safe px-safe">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (isOnChildRoute) {
                    navigate({ to: '/groups/$groupId', params: { groupId } })
                  } else {
                    navigate({ to: '/' })
                  }
                }}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back</span>
              </button>
              {!isOnChildRoute && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#10B981] text-white flex items-center justify-center shadow-md">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white">
                      {group.name}
                    </h1>
                    {group.description && (
                      <p className="text-sm text-white/70">
                        {group.description}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {isOnChildRoute && (
                <h1 className="text-xl font-bold text-white">Expense Details</h1>
              )}
            </div>
            {!isOnChildRoute && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddExpense(true)}
                  className="flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white font-semibold py-2 px-4 sm:px-6 rounded-xl transition-all shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Add Expense</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Render child route (expense details) OR main group content */}
      {isOnChildRoute ? (
        <Suspense fallback={
          <div className="min-h-[100dvh] bg-[#0A0F12] flex items-center justify-center">
            <div className="text-white">Loading...</div>
          </div>
        }>
          <Outlet />
        </Suspense>
      ) : (
        <>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-28 md:pb-8">
        {/* Tab Navigation - Improved with smooth animations */}
        <div className="hidden md:block bg-[#101418] rounded-2xl shadow-lg p-1.5 mb-6 border border-[#10B981]/30">
          <div className="grid grid-cols-3 gap-2 relative">
            <button
              onClick={() => setActiveTab('overview')}
              className={`relative flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-semibold transition-colors z-10 ${
                activeTab === 'overview'
                  ? 'text-white'
                  : 'text-white/70 hover:text-white hover:bg-[#10B981]/20'
              }`}
            >
              {activeTab === 'overview' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-[#10B981] rounded-xl shadow-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <LayoutGrid className="w-5 h-5 relative z-10" />
              <span className="hidden sm:inline relative z-10">Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`relative flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-semibold transition-colors z-10 ${
                activeTab === 'expenses'
                  ? 'text-white'
                  : 'text-white/70 hover:text-white hover:bg-[#10B981]/20'
              }`}
            >
              {activeTab === 'expenses' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-[#10B981] rounded-xl shadow-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <CreditCard className="w-5 h-5 relative z-10" />
              <span className="hidden sm:inline relative z-10">Expenses</span>
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`relative flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-semibold transition-colors z-10 ${
                activeTab === 'members'
                  ? 'text-white'
                  : 'text-white/70 hover:text-white hover:bg-[#10B981]/20'
              }`}
            >
              {activeTab === 'members' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-[#10B981] rounded-xl shadow-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <UserCheck className="w-5 h-5 relative z-10" />
              <span className="hidden sm:inline relative z-10">Members</span>
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Balance Summary */}
            <div className="bg-[#101418] rounded-2xl shadow-xl p-8 mb-8 border border-[#10B981]/30">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#10B981] text-white flex items-center justify-center shadow-md">
              <Wallet className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              Your Balance
            </h2>
          </div>
          {userBalance ? (
            <div className="text-center py-4">
              <div
                className={`text-5xl sm:text-6xl font-bold mb-3 ${
                  userBalance.balance > 0
                    ? 'text-green-600 dark:text-green-400'
                    : userBalance.balance < 0
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {group.currencySymbol || '$'}{(Math.abs(userBalance.balance) / 100).toFixed(2)}
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#10B981]/20 border border-[#10B981]/30">
                <TrendingUp className={`w-5 h-5 ${
                  userBalance.balance > 0
                    ? 'text-green-600 dark:text-green-400'
                    : userBalance.balance < 0
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-600 dark:text-gray-400'
                }`} />
                <span className="text-lg font-medium text-white">
                  {userBalance.balance > 0
                    ? 'You are owed'
                    : userBalance.balance < 0
                      ? 'You owe'
                      : 'All settled up!'}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-white/70">
                No expenses yet
              </p>
              <p className="text-sm text-white/50 mt-2">
                Add your first expense to get started
              </p>
            </div>
          )}
        </div>

        {/* Suggested Settlements */}
        {balances.settlements.length > 0 && (
          <div className="bg-[#101418] rounded-xl shadow-lg p-6 border border-[#10B981]/30 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">
              Suggested Settlements
            </h2>
            <div className="space-y-3">
              {balances.settlements.map((settlement, idx) => {
                // Check if current user is the one who needs to pay
                const isUserPaying = settlement.from === user._id
                const toMember = group.members.find((m: any) => m._id === settlement.to)
                
                return (
                  <div
                    key={idx}
                    className="p-4 bg-[#10B981]/10 rounded-lg border border-[#10B981]/20"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-white font-medium">
                          {settlement.fromName}
                        </span>
                        <span className="text-white/50">→</span>
                        <span className="text-white font-medium">
                          {settlement.toName}
                        </span>
                      </div>
                      <div className="text-lg font-semibold text-[#10B981]">
                        {group.currencySymbol || '$'}{(settlement.amount / 100).toFixed(2)}
                      </div>
                    </div>
                    {isUserPaying && (
                      <button
                        onClick={() => {
                          setSettlementMember({ 
                            member: toMember, 
                            amount: settlement.amount,
                            isPayment: true // User is paying this person
                          })
                          setShowSettlement(true)
                        }}
                        className="w-full mt-2 bg-[#10B981] hover:bg-[#059669] text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <span className="text-base">{group.currencySymbol || '$'}</span>
                        Settle Up
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Export Data Section */}
        <div className="bg-[#101418] rounded-xl shadow-lg p-6 border border-[#10B981]/30">
          <ExportDataSection group={group} user={user} />
        </div>
          </>
        )}

        {/* Transactions Tab */}
        {activeTab === 'expenses' && (
          <div className="rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-6 gap-4">
              <h2 className="text-2xl font-bold text-white">
                Transactions
              </h2>
              <button
                onClick={() => setShowAddExpense(true)}
                className="flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white font-semibold py-2 px-4 rounded-lg transition-all shadow-md text-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Expense</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
            {expenses.length === 0 && settlements.length === 0 ? (
              <div className="text-center py-16 text-white/70">
                <Receipt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">No transactions yet</p>
                <p className="text-sm">Add your first expense to get started</p>
              </div>
            ) : (
              <div className="flex flex-col space-y-3">
                {/* Combine and sort expenses and settlements by date */}
                {[
                  ...expenses.map((e: any) => ({ ...e, type: 'expense', date: e.date })),
                  ...settlements.map((s: any) => ({ ...s, type: 'settlement', date: s.date }))
                ]
                  .sort((a, b) => b.date - a.date)
                  .map((transaction: any, index: any) => {
                    if (transaction.type === 'expense') {
                      const hasMultiplePayers = transaction.payments && transaction.payments.length > 1
                      const paidByText = hasMultiplePayers 
                        ? `${transaction.payments.length} people` 
                        : transaction.paidByName
                      
                      return (
                        <Link
                          key={transaction._id}
                          to="/groups/$groupId/expenses/$expenseId"
                          params={{ groupId, expenseId: transaction._id }}
                        >
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: Math.min(index * 0.05, 0.5), duration: 0.3 }}
                            whileHover={{ scale: 1.01, x: 4 }}
                            className="p-5 bg-[#10B981]/10 rounded-lg border border-[#10B981]/20 hover:border-[#10B981]/40 transition-colors cursor-pointer"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="font-semibold text-lg text-white mb-1">
                                  {transaction.description}
                                </div>
                                <div className="text-sm text-white/70">
                                  Paid by <span className="font-medium">{paidByText}</span> •{' '}
                                  {new Date(transaction.date).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="text-xl font-bold text-[#10B981]">
                                {group.currencySymbol || '$'}{(transaction.amount / 100).toFixed(2)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-white/60">
                              <Users className="w-3.5 h-3.5" />
                              Split between {transaction.splits.length} {transaction.splits.length === 1 ? 'person' : 'people'}
                            </div>
                          </motion.div>
                        </Link>
                      )
                    } else {
                      // Settlement
                      return (
                        <motion.div
                          key={transaction._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.3 }}
                          className="p-5 bg-blue-500/10 rounded-lg border border-blue-500/20"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-lg text-white mb-1 flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-blue-400" />
                                Settlement Payment
                              </div>
                              <div className="text-sm text-white/70">
                                <span className="font-medium">{transaction.fromUserName}</span> paid{' '}
                                <span className="font-medium">{transaction.toUserName}</span> •{' '}
                                {new Date(transaction.date).toLocaleDateString()}
                              </div>
                              {transaction.notes && (
                                <div className="text-xs text-white/50 mt-1">
                                  {transaction.notes}
                                </div>
                              )}
                            </div>
                            <div className="text-xl font-bold text-blue-400">
                              {group.currencySymbol || '$'}{(transaction.amount / 100).toFixed(2)}
                            </div>
                          </div>
                        </motion.div>
                      )
                    }
                  })}
              </div>
            )}
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <MembersTabContent 
            group={group}
            setShowAddMember={setShowAddMember}
          />
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="">
            <h2 className="text-xl font-semibold text-white mb-6">Group Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  defaultValue={group.name}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-[#10B981]/30 rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] bg-[#111827] text-white placeholder-white/40 transition-all"
                  placeholder="Group name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Description
                </label>
                <textarea
                  defaultValue={group.description || ''}
                  onChange={(e) => setEditingDescription(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-[#10B981]/30 rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] bg-[#111827] text-white placeholder-white/40 transition-all"
                  placeholder="Group description"
                  rows={3}
                />
              </div>
              <button
                className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-semibold py-2.5 px-4 rounded-xl transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Add Expense Drawer - Mobile */}
      <Drawer open={showAddExpense} onOpenChange={setShowAddExpense}>
        <DrawerContent className="bg-[#101418] border-t border-[#10B981]/30 px-2">
          <AddExpenseDrawer
            groupId={groupId as any}
            members={group.members}
            currentUserId={user._id}
            currencySymbol={group.currencySymbol || "$"}
            currencyCode={group.currency || "USD"}
            onClose={() => setShowAddExpense(false)}
          />
        </DrawerContent>
      </Drawer>

      {/* Floating AI Assistant Button - visible on all main group tabs */}
      {!isOnChildRoute && (
        <button
          onClick={() => setShowAiAssistant(true)}
          className="fixed left-6 bottom-24 md:bottom-10 z-40 inline-flex items-center justify-center rounded-full bg-[#10B981] hover:bg-[#059669] text-white shadow-xl w-12 h-12 border border-[#10B981]/40"
        >
          <Sparkles className="w-5 h-5" />
        </button>
      )}

      {/* AI Assistant Drawer */}
      <Drawer open={showAiAssistant} onOpenChange={setShowAiAssistant}>
        <DrawerContent className="bg-[#101418] border-t border-[#10B981]/30 px-2">
          <div className="w-full max-w-md mx-auto px-4 py-6 pb-10 max-h-[70dvh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#10B981]" />
                <h2 className="text-lg font-semibold text-white">AI expense assistant</h2>
              </div>
              <button
                onClick={() => setShowAiAssistant(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-white/60 mb-3">
              Describe the expense in natural language. The AI will create an equal-split expense for this group.
            </p>
            <div className="flex flex-col gap-3">
              <textarea
                value={aiInstruction}
                onChange={(e) => setAiInstruction(e.target.value)}
                placeholder="e.g. Split a pizza expense between me, Madhav and Chirag in this group for ₹900"
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-[#0B1014] border border-white/10 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981]"
              />
              <button
                disabled={aiLoading || !aiInstruction.trim()}
                onClick={async () => {
                  if (!aiInstruction.trim()) return
                  setAiLoading(true)
                  setAiStatus(null)
                  try {
                    const res = await createFromInstruction({
                      groupId: groupId as any,
                      userId: user._id,
                      instruction: aiInstruction.trim(),
                    })
                    if (res.success) {
                      setAiStatus('Created expense from instruction.')
                      setAiInstruction('')
                    } else {
                      setAiStatus(res.message || 'Could not create expense from instruction.')
                    }
                  } catch (err: any) {
                    console.error('AI expense error', err)
                    setAiStatus('Something went wrong while using AI.')
                  } finally {
                    setAiLoading(false)
                  }
                }}
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#10B981] hover:bg-[#059669] disabled:opacity-60 disabled:cursor-not-allowed text-sm font-semibold text-white whitespace-nowrap transition-colors"
              >
                {aiLoading ? 'Thinking…' : 'Create expense'}
              </button>
              {aiStatus && (
                <p className="text-xs text-white/70">{aiStatus}</p>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Add Expense Modal - Desktop only */}
      <AnimatePresence>
        {showAddExpense && (
          <div className="hidden md:block">
            <AddExpenseModal
              groupId={groupId as any}
              members={group.members}
              currentUserId={user._id}
              currencySymbol={group.currencySymbol || "$"}
              currencyCode={group.currency || "USD"}
              onClose={() => setShowAddExpense(false)}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Add Member Modal */}
      <AnimatePresence>
        {showAddMember && (
          <AddMemberModal
            groupId={groupId as any}
            currentUserId={user._id}
            existingMembers={group.members}
            onClose={() => setShowAddMember(false)}
          />
        )}
      </AnimatePresence>

      {/* Settlement Drawer */}
      <Drawer open={showSettlement} onOpenChange={setShowSettlement}>
        <DrawerContent className="bg-[#101418] border-t border-[#10B981]/30 px-2">
          {settlementMember && (
            <SettlementDrawer
              groupId={groupId as any}
              currentUserId={user._id}
              member={settlementMember.member || settlementMember}
              memberBalance={balances.balances.find((b) => b.userId === (settlementMember.member?._id || settlementMember._id))}
              currencySymbol={group.currencySymbol || '$'}
              currencyCode={group.currency || 'USD'}
              settlementAmount={settlementMember.amount}
              isPayment={settlementMember.isPayment}
              onClose={() => {
                setShowSettlement(false)
                setSettlementMember(null)
              }}
            />
          )}
        </DrawerContent>
      </Drawer>
        </>
      )}

      {/* Bottom Tab Bar - Shared across all pages */}
      <GroupBottomNav
        groupId={groupId}
        activeTab={activeTab}
        isOnChildRoute={isOnChildRoute}
        onTabChange={setActiveTab}
        onAddExpense={() => setShowAddExpense(true)}
      />
    </motion.div>
  )
}

function AddExpenseDrawer({
  groupId,
  members,
  currentUserId,
  currencySymbol,
  currencyCode,
  onClose,
}: {
  groupId: any
  members: any[]
  currentUserId: any
  currencySymbol: string
  currencyCode: string
  onClose: () => void
}) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [paidBy, setPaidBy] = useState(currentUserId)
  const [splitBetween, setSplitBetween] = useState<string[]>(members.map((m: any) => m._id))
  const [splitType, setSplitType] = useState<'equal' | 'custom' | 'percentage'>('equal')
  const [exactValues, setExactValues] = useState<Record<string, string>>({})
  const [percentValues, setPercentValues] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string>('')
  const [splitDrawerOpen, setSplitDrawerOpen] = useState(false)
  const [paidByDrawerOpen, setPaidByDrawerOpen] = useState(false)
  const [paidByMultiple, setPaidByMultiple] = useState<Record<string, string>>({})
  const [isMultiplePayers, setIsMultiplePayers] = useState(false)
  const createExpense = useMutation(api.expenses.createExpense)

  const categories = [
    { value: 'food', label: 'Food', icon: UtensilsCrossed },
    { value: 'transport', label: 'Transport', icon: Car },
    { value: 'entertainment', label: 'Entertainment', icon: Popcorn },
    { value: 'utilities', label: 'Utilities', icon: Zap },
    { value: 'shopping', label: 'Shopping', icon: ShoppingBag },
    { value: 'other', label: 'Other', icon: MoreHorizontal },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    
    // Validate paid by
    const hasMultiplePayers = Object.keys(paidByMultiple).length > 0
    if (!hasMultiplePayers && !paidBy) {
      setFormError('Please select who paid.')
      return
    }
    
    if (!description || !amount || splitBetween.length === 0) {
      setFormError('Please fill all required fields and select at least one member.')
      return
    }

    try {
      const totalCents = Math.round(parseFloat(amount) * 100)
      if (!isFinite(totalCents) || totalCents <= 0) {
        setFormError('Enter a valid amount.')
        return
      }
      
      // Validate multiple payers if applicable
      if (hasMultiplePayers) {
        const paidTotal = Object.values(paidByMultiple).reduce((sum, val) => {
          return sum + Math.round(parseFloat(val || '0') * 100)
        }, 0)
        if (Math.abs(paidTotal - totalCents) > 1) {
          setFormError('Paid amounts must add up to the total amount.')
          return
        }
      }

      let splits: { userId: any; amount: number }[] = []
      if (splitType === 'equal') {
        const n = splitBetween.length
        const base = Math.floor(totalCents / n)
        let remainder = totalCents - base * n
        splits = splitBetween.map((id) => {
          const extra = remainder > 0 ? 1 : 0
          if (remainder > 0) remainder -= 1
          return { userId: id as any, amount: base + extra }
        })
      } else if (splitType === 'custom') {
        let sum = 0
        splits = splitBetween.map((id) => {
          const v = Math.round(parseFloat(exactValues[id] || '0') * 100)
          sum += v
          return { userId: id as any, amount: v }
        })
        if (sum !== totalCents) {
          setFormError('Exact amounts must add up to the total amount.')
          return
        }
      } else {
        // percentage - send raw percentages to backend
        let pctSum = 0
        splits = splitBetween.map((id) => {
          const p = parseFloat(percentValues[id] || '0')
          pctSum += isFinite(p) ? p : 0
          return { userId: id as any, amount: isFinite(p) ? p : 0 }
        })
        // Allow a small epsilon for 100%
        if (Math.abs(pctSum - 100) > 0.01) {
          setFormError('Percentages must add up to 100%.')
          return
        }
      }

      // Prepare payment data
      const primaryPayer = hasMultiplePayers 
        ? Object.keys(paidByMultiple)[0] as any
        : paidBy as any

      const paidByData = hasMultiplePayers
        ? Object.entries(paidByMultiple).map(([userId, amt]) => ({
            userId: userId as any,
            amount: Math.round(parseFloat(amt) * 100)
          }))
        : undefined

      await createExpense({
        groupId,
        description,
        amount: totalCents,
        paidBy: primaryPayer,
        currency: currencyCode,
        date: Date.now(),
        splitType,
        category: category || undefined,
        splits,
        paidByMultiple: paidByData,
      })
      setDescription('')
      setAmount('')
      setCategory('')
      setPaidBy(currentUserId)
      setSplitBetween(members.map((m: any) => m._id))
      setSplitType('equal')
      setExactValues({})
      setPercentValues({})
      setPaidByMultiple({})
      onClose()
    } catch (error) {
      console.error('Failed to add expense:', error)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 pb-12 max-h-[75dvh] overflow-y-auto overscroll-contain">
      <h2 className="text-xl font-bold text-white mb-6">Add Expense</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount - Prominent centered display */}
        <div className="flex flex-col items-center py-4">
          <label className="text-sm font-medium text-white/50 mb-3">
            Enter Amount
          </label>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-bold text-white/60">
              {currencySymbol}
            </span>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-transparent border-none outline-none text-4xl font-bold text-white placeholder-white/30 w-auto min-w-[100px] max-w-[200px] text-left focus:text-[#10B981] transition-colors"
              placeholder="0"
              required
              autoFocus
              style={{ width: `${Math.max(3, (amount || '0').toString().length)}ch` }}
            />
          </div>
          <div className="h-1 w-24 mt-3 bg-[#10B981]/30 rounded-full" />
        </div>

        {/* Description - Optional, smaller */}
        <div>
          <label className="block text-sm font-medium text-white/60 mb-2">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 border-2 border-[#10B981]/30 rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] bg-[#111827] text-white placeholder-white/40 transition-all text-sm"
            placeholder="e.g., Dinner, Gas"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Category
          </label>
          <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {categories.map((cat) => {
              const Icon = cat.icon
              const isSelected = category === cat.value
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(isSelected ? '' : cat.value)}
                  className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border-2 transition-all min-w-[80px] ${
                    isSelected
                      ? 'bg-[#10B981] border-[#10B981] text-white'
                      : 'bg-[#111827] border-[#10B981]/30 text-white/70 hover:bg-[#10B981]/10 hover:border-[#10B981]/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{cat.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Paid by and Split fields inline */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Paid by *
            </label>
            <button
              type="button"
              onClick={() => setPaidByDrawerOpen(true)}
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full px-4 py-2.5 border-2 border-[#10B981]/30 rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] bg-[#111827] text-white transition-all text-sm flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="truncate">
                {isMultiplePayers
                  ? `${Object.keys(paidByMultiple).filter(k => paidByMultiple[k] && parseFloat(paidByMultiple[k]) > 0).length} people`
                  : members.find((m: any) => m._id === paidBy)?.name || members.find((m: any) => m._id === paidBy)?.email}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Split *
            </label>
            <button
              type="button"
              onClick={() => setSplitDrawerOpen(true)}
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full px-4 py-2.5 border-2 border-[#10B981]/30 rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] bg-[#111827] text-white transition-all text-sm flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="truncate">
                {splitType === 'equal' && 'Split Equally'}
                {splitType === 'custom' && 'Exact Values'}
                {splitType === 'percentage' && 'Percentage'}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </button>
          </div>
        </div>

        {formError && (
          <div className="text-red-400 text-sm">{formError}</div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border-2 border-[#10B981]/30 text-white rounded-xl hover:bg-[#10B981]/10 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!amount || parseFloat(amount) <= 0}
            className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white font-semibold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#10B981]"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </form>

      {/* Nested Split Configuration Drawer */}
      <Drawer open={splitDrawerOpen} onOpenChange={setSplitDrawerOpen}>
        <DrawerContent className="bg-[#0A0F12] border-t border-[#10B981]/30">
          <div className="w-full max-w-md mx-auto px-4 py-6 pb-12">
            <h3 className="text-lg font-bold text-white mb-4">Configure Split</h3>
            
            <div className="space-y-4">
              {/* Split type selector */}
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => setSplitType('equal')}
                  className={`px-4 py-3 rounded-xl text-sm font-medium border-2 transition-colors text-left ${
                    splitType === 'equal'
                      ? 'bg-[#10B981] text-white border-[#10B981]'
                      : 'bg-[#111827] text-white/80 border-[#10B981]/30 hover:bg-[#10B981]/10'
                  }`}
                >
                  <div className="font-semibold">Split Equally</div>
                  <div className="text-xs opacity-70 mt-1">Divide amount equally among selected members</div>
                </button>
                <button
                  type="button"
                  onClick={() => setSplitType('custom')}
                  className={`px-4 py-3 rounded-xl text-sm font-medium border-2 transition-colors text-left ${
                    splitType === 'custom'
                      ? 'bg-[#10B981] text-white border-[#10B981]'
                      : 'bg-[#111827] text-white/80 border-[#10B981]/30 hover:bg-[#10B981]/10'
                  }`}
                >
                  <div className="font-semibold">Split by Exact Values</div>
                  <div className="text-xs opacity-70 mt-1">Enter exact amount for each member</div>
                </button>
                <button
                  type="button"
                  onClick={() => setSplitType('percentage')}
                  className={`px-4 py-3 rounded-xl text-sm font-medium border-2 transition-colors text-left ${
                    splitType === 'percentage'
                      ? 'bg-[#10B981] text-white border-[#10B981]'
                      : 'bg-[#111827] text-white/80 border-[#10B981]/30 hover:bg-[#10B981]/10'
                  }`}
                >
                  <div className="font-semibold">Split by Percentage</div>
                  <div className="text-xs opacity-70 mt-1">Enter percentage for each member</div>
                </button>
              </div>

              {/* Show member selection for equal split */}
              {splitType === 'equal' && (
                <div className="mt-4 space-y-2 border-t border-[#10B981]/30 pt-4">
                  <div className="text-sm font-medium text-white mb-2">Split between:</div>
                  {members.map((member: any) => {
                    const totalAmount = parseFloat(amount) || 0
                    const perPersonAmount = splitBetween.length > 0 ? totalAmount / splitBetween.length : 0
                    const isSelected = splitBetween.includes(member._id)
                    
                    return (
                      <div key={member._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#10B981]/10 transition-colors">
                        <Checkbox
                          id={`equal-${member._id}`}
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSplitBetween([...splitBetween, member._id])
                            } else {
                              setSplitBetween(splitBetween.filter(id => id !== member._id))
                            }
                          }}
                        />
                        <label
                          htmlFor={`equal-${member._id}`}
                          className="text-sm text-white/80 cursor-pointer flex-1"
                        >
                          {member.name || member.email}
                        </label>
                        {isSelected && totalAmount > 0 && (
                          <span className="text-sm font-medium text-[#10B981]">
                            {currencySymbol}{perPersonAmount.toFixed(2)}
                          </span>
                        )}
                      </div>
                    )
                  })}
                  <button
                    type="button"
                    onClick={() => setSplitDrawerOpen(false)}
                    className="w-full mt-4 bg-[#10B981] hover:bg-[#059669] text-white font-semibold py-2.5 px-4 rounded-xl transition-colors"
                  >
                    Done
                  </button>
                </div>
              )}

              {/* Show input fields for custom/percentage */}
              {splitType === 'custom' && (
                <div className="mt-4 space-y-2 border-t border-[#10B981]/30 pt-4">
                  <div className="text-sm font-medium text-white mb-2">Enter amounts:</div>
                  {splitBetween.map((id) => {
                    const m = members.find((mm: any) => mm._id === id)
                    return (
                      <div key={id} className="grid grid-cols-2 gap-3 items-center">
                        <div className="text-sm text-white/80 truncate">{m?.name || m?.email}</div>
                        <input
                          type="number"
                          step="0.01"
                          value={exactValues[id] ?? ''}
                          onChange={(e) => setExactValues({ ...exactValues, [id]: e.target.value })}
                          className="w-full px-3 py-2 border-2 border-[#10B981]/30 rounded-lg bg-[#111827] text-white text-sm focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981]"
                          placeholder={`0.00 ${currencySymbol}`}
                        />
                      </div>
                    )
                  })}
                  {(() => {
                    const totalAmount = parseFloat(amount) || 0
                    const allocatedAmount = splitBetween.reduce((sum, id) => {
                      return sum + (parseFloat(exactValues[id] || '0'))
                    }, 0)
                    const remaining = totalAmount - allocatedAmount
                    const isValid = Math.abs(remaining) < 0.01
                    
                    return (
                      <div className={`text-sm p-3 rounded-lg border-2 ${
                        isValid 
                          ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]' 
                          : remaining > 0
                            ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'
                            : 'bg-red-500/10 border-red-500/30 text-red-500'
                      }`}>
                        {isValid ? (
                          <span className="font-medium">✓ Total matches: {currencySymbol}{totalAmount.toFixed(2)}</span>
                        ) : (
                          <span className="font-medium">
                            {remaining > 0 ? 'Remaining' : 'Over by'}: {currencySymbol}{Math.abs(remaining).toFixed(2)}
                          </span>
                        )}
                      </div>
                    )
                  })()}
                  {(() => {
                    const totalAmount = parseFloat(amount) || 0
                    const allocatedAmount = splitBetween.reduce((sum, id) => {
                      return sum + (parseFloat(exactValues[id] || '0'))
                    }, 0)
                    const remaining = totalAmount - allocatedAmount
                    const isValid = Math.abs(remaining) < 0.01
                    
                    return (
                      <button
                        type="button"
                        onClick={() => setSplitDrawerOpen(false)}
                        disabled={!isValid}
                        className={`w-full mt-4 font-semibold py-2.5 px-4 rounded-xl transition-colors ${
                          isValid
                            ? 'bg-[#10B981] hover:bg-[#059669] text-white cursor-pointer'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                        }`}
                      >
                        Done
                      </button>
                    )
                  })()}
                </div>
              )}
              
              {splitType === 'percentage' && (
                <div className="mt-4 space-y-2 border-t border-[#10B981]/30 pt-4">
                  <div className="text-sm font-medium text-white mb-2">Enter percentages:</div>
                  {splitBetween.map((id) => {
                    const m = members.find((mm: any) => mm._id === id)
                    const pct = parseFloat(percentValues[id] || '0')
                    const totalAmount = parseFloat(amount) || 0
                    const memberAmount = (pct / 100) * totalAmount
                    
                    return (
                      <div key={id} className="grid grid-cols-2 gap-3 items-center">
                        <div className="text-sm text-white/80 truncate">{m?.name || m?.email}</div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.01"
                            value={percentValues[id] ?? ''}
                            onChange={(e) => setPercentValues({ ...percentValues, [id]: e.target.value })}
                            className="w-full px-3 py-2 border-2 border-[#10B981]/30 rounded-lg bg-[#111827] text-white text-sm focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981]"
                            placeholder="0"
                          />
                          <span className="text-white/70 text-sm">%</span>
                          {pct > 0 && totalAmount > 0 && (
                            <span className="text-xs text-[#10B981] whitespace-nowrap">
                              {currencySymbol}{memberAmount.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                  {(() => {
                    const totalPercent = splitBetween.reduce((sum, id) => {
                      return sum + (parseFloat(percentValues[id] || '0'))
                    }, 0)
                    const remaining = 100 - totalPercent
                    const isValid = Math.abs(remaining) < 0.01
                    
                    return (
                      <div className={`text-sm p-3 rounded-lg border-2 ${
                        isValid 
                          ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]' 
                          : remaining > 0
                            ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'
                            : 'bg-red-500/10 border-red-500/30 text-red-500'
                      }`}>
                        {isValid ? (
                          <span className="font-medium">✓ Total: 100%</span>
                        ) : (
                          <span className="font-medium">
                            {remaining > 0 ? 'Remaining' : 'Over by'}: {Math.abs(remaining).toFixed(2)}%
                          </span>
                        )}
                      </div>
                    )
                  })()}
                  {(() => {
                    const totalPercent = splitBetween.reduce((sum, id) => {
                      return sum + (parseFloat(percentValues[id] || '0'))
                    }, 0)
                    const remaining = 100 - totalPercent
                    const isValid = Math.abs(remaining) < 0.01
                    
                    return (
                      <button
                        type="button"
                        onClick={() => setSplitDrawerOpen(false)}
                        disabled={!isValid}
                        className={`w-full mt-4 font-semibold py-2.5 px-4 rounded-xl transition-colors ${
                          isValid
                            ? 'bg-[#10B981] hover:bg-[#059669] text-white cursor-pointer'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                        }`}
                      >
                        Done
                      </button>
                    )
                  })()}
                </div>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Paid By Configuration Drawer */}
      <Drawer open={paidByDrawerOpen} onOpenChange={setPaidByDrawerOpen}>
        <DrawerContent className="bg-[#0A0F12] border-t border-[#10B981]/30">
          <div className="w-full max-w-md mx-auto px-4 py-6 pb-12">
            <h3 className="text-lg font-bold text-white mb-4">Who Paid?</h3>
            
            <div className="space-y-4">
              {!isMultiplePayers ? (
                <>
                  {/* Single person selection */}
                  <RadioGroup 
                    value={String(paidBy)} 
                    onValueChange={(value) => {
                      setPaidBy(value)
                      setPaidByDrawerOpen(false)
                    }}
                  >
                    <div className="space-y-2">
                      {members.map((member: any) => (
                        <div
                          key={member._id}
                          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                            String(paidBy) === String(member._id)
                              ? 'bg-[#10B981]/20 border-2 border-[#10B981]'
                              : 'bg-[#111827] border-2 border-[#10B981]/30 hover:bg-[#10B981]/10'
                          }`}
                          onClick={() => {
                            setPaidBy(member._id)
                            setPaidByDrawerOpen(false)
                          }}
                        >
                          <RadioGroupItem value={String(member._id)} id={`paidby-${member._id}`} />
                          <label
                            htmlFor={`paidby-${member._id}`}
                            className="text-sm text-white/80 cursor-pointer flex-1"
                          >
                            {member.name || member.email}
                          </label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>

                  {/* Button to switch to multiple payers */}
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        // Initialize with current payer
                        setPaidByMultiple({ [paidBy]: amount })
                        setIsMultiplePayers(true)
                      }}
                      className="w-1/2 px-3 py-2 border border-[#10B981]/30 text-white/70 rounded-lg hover:bg-[#10B981]/10 transition-colors text-xs font-medium"
                    >
                      Paid by Multiple People
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Multiple payers mode */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-white">Enter amounts paid:</div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMultiplePayers(false)
                        setPaidByMultiple({})
                      }}
                      className="text-xs text-white/70 hover:text-white underline"
                    >
                      Back to Single Person
                    </button>
                  </div>
                  {members.map((member: any) => (
                    <div key={member._id} className="grid grid-cols-2 gap-3 items-center">
                      <div className="text-sm text-white/80 truncate">{member.name || member.email}</div>
                      <input
                        type="number"
                        step="0.01"
                        value={paidByMultiple[member._id] ?? ''}
                        onChange={(e) => {
                          const val = e.target.value
                          // Always update the value, even if empty
                          if (val === '') {
                            const newPaid = { ...paidByMultiple }
                            delete newPaid[member._id]
                            setPaidByMultiple(newPaid)
                          } else {
                            setPaidByMultiple({ ...paidByMultiple, [member._id]: val })
                          }
                        }}
                        className="w-full px-3 py-2 border-2 border-[#10B981]/30 rounded-lg bg-[#111827] text-white text-sm focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981]"
                        placeholder={`0.00 ${currencySymbol}`}
                      />
                    </div>
                  ))}
                  
                  {(() => {
                    const totalAmount = parseFloat(amount) || 0
                    const paidAmount = Object.values(paidByMultiple).reduce((sum, val) => {
                      return sum + (parseFloat(val || '0'))
                    }, 0)
                    const remaining = totalAmount - paidAmount
                    const isValid = Math.abs(remaining) < 0.01
                    
                    return (
                      <div className={`text-sm p-3 rounded-lg border-2 ${
                        isValid 
                          ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]' 
                          : remaining > 0
                            ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'
                            : 'bg-red-500/10 border-red-500/30 text-red-500'
                      }`}>
                        {isValid ? (
                          <span className="font-medium">✓ Total matches: {currencySymbol}{totalAmount.toFixed(2)}</span>
                        ) : (
                          <span className="font-medium">
                            {remaining > 0 ? 'Remaining' : 'Over by'}: {currencySymbol}{Math.abs(remaining).toFixed(2)}
                          </span>
                        )}
                      </div>
                    )
                  })()}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPaidByMultiple({})
                      }}
                      className="flex-1 px-4 py-2.5 border-2 border-[#10B981]/30 text-white rounded-xl hover:bg-[#10B981]/10 transition-colors text-sm font-medium"
                    >
                      Back to Single
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaidByDrawerOpen(false)}
                      className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white font-semibold py-2.5 px-4 rounded-xl transition-colors text-sm"
                    >
                      Done
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}

function AddExpenseModal({
  groupId,
  members,
  currentUserId,
  currencySymbol,
  currencyCode,
  onClose,
}: {
  groupId: any
  members: any[]
  currentUserId: any
  currencySymbol: string
  currencyCode: string
  onClose: () => void
}) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState(currentUserId)
  const splitType = 'equal' as const
  const [selectedMembers, setSelectedMembers] = useState<any[]>(
    members.map((m) => m._id)
  )
  const [splitMode, setSplitMode] = useState<'everyone' | 'custom'>('everyone')

  const createExpense = useMutation(api.expenses.createExpense)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description || !amount) return

    try {
      const amountInCents = Math.round(parseFloat(amount) * 100)
      await createExpense({
        groupId,
        description,
        amount: amountInCents,
        currency: currencyCode,
        paidBy,
        date: Date.now(),
        splitType,
        splits: selectedMembers.map((userId) => ({
          userId,
          amount: 0, // Will be calculated based on splitType
        })),
      })
      onClose()
    } catch (error) {
      console.error('Failed to create expense:', error)
    }
  }

  const toggleMember = (memberId: any) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter((id) => id !== memberId))
    } else {
      setSelectedMembers([...selectedMembers, memberId])
    }
  }

  return (
    <motion.div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 md:flex md:items-center md:justify-center md:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      {/* Mobile: Full screen, Desktop: Modal */}
      <motion.div 
        className="h-full md:h-auto bg-[#101418] md:rounded-2xl md:shadow-2xl md:max-w-lg w-full flex flex-col md:max-h-[90vh]"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Sticky Header */}
        <div className="sticky top-0 bg-[#101418] border-b border-[#10B981]/30 px-4 sm:px-6 py-4 flex items-center justify-between z-10 pt-safe px-safe">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Add Expense
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#10B981]/20 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-white/70" />
          </button>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-6">
            
            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                What was it for?
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3.5 text-base border-2 border-[#10B981]/30 rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] bg-[#111827] text-white placeholder-white/40 transition-all"
                placeholder="e.g., Dinner, Groceries, Movie tickets"
                required
                autoFocus
              />
            </div>

            {/* Amount - Most prominent */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-white/50">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-2xl font-bold border-2 border-[#10B981]/30 rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] bg-[#111827] text-white placeholder-white/40 transition-all"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[#10B981]/20"></div>

            {/* Paid by */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Who paid?
              </label>
              <div className="grid grid-cols-1 gap-2">
                {members.map((member) => (
                  <button
                    key={member._id}
                    type="button"
                    onClick={() => setPaidBy(member._id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      paidBy === member._id
                        ? 'border-[#10B981] bg-[#10B981]/20'
                        : 'border-[#10B981]/30 hover:border-[#10B981]/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paidBy === member._id
                          ? 'border-[#10B981]'
                          : 'border-white/30'
                      }`}>
                        {paidBy === member._id && (
                          <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
                        )}
                      </div>
                      <span className="font-medium text-white">
                        {member.name || member.email || 'Unknown User'}
                        {member._id === currentUserId && (
                          <span className="ml-2 text-sm text-white/50">(You)</span>
                        )}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[#10B981]/20"></div>

            {/* Split between */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                Split between
              </label>
              
              {/* Quick Split Options */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setSplitMode('everyone')
                    setSelectedMembers(members.map(m => m._id))
                  }}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
                    splitMode === 'everyone'
                      ? 'bg-[#10B981] text-white'
                      : 'bg-[#111827] text-white/70 hover:bg-[#111827]/70'
                  }`}
                >
                  Everyone
                </button>
                <button
                  type="button"
                  onClick={() => setSplitMode('custom')}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
                    splitMode === 'custom'
                      ? 'bg-[#10B981] text-white'
                      : 'bg-[#111827] text-white/70 hover:bg-[#111827]/70'
                  }`}
                >
                  Custom
                </button>
              </div>

              {/* Member Selection */}
              {splitMode === 'custom' && (
                <div className="grid grid-cols-1 gap-2">
                  {members.map((member) => (
                    <button
                      key={member._id}
                      type="button"
                      onClick={() => toggleMember(member._id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedMembers.includes(member._id)
                          ? 'border-[#10B981] bg-[#10B981]/20'
                          : 'border-[#10B981]/30 hover:border-[#10B981]/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedMembers.includes(member._id)
                          ? 'border-[#10B981] bg-[#10B981]'
                          : 'border-white/30'
                      }`}>
                        {selectedMembers.includes(member._id) && (
                          <Check className="w-3.5 h-3.5 text-white" />
                        )}
                        </div>
                        <span className="font-medium text-white">
                          {member.name || member.email || 'Unknown User'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Split Preview */}
              {selectedMembers.length > 0 && amount && (
                <div className="mt-4 p-4 bg-[#10B981]/10 rounded-xl border border-[#10B981]/20">
                  <p className="text-sm text-white/70 mb-1">
                    Each person pays
                  </p>
                  <p className="text-xl font-bold text-[#10B981]">
                    {currencySymbol}{(parseFloat(amount) / selectedMembers.length).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-[#101418] border-t border-[#10B981]/30 p-4 sm:p-6 pb-safe px-safe">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 px-6 text-base font-semibold border-2 border-[#10B981]/30 text-white rounded-xl hover:bg-[#10B981]/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={selectedMembers.length === 0 || !amount || !description}
              className="flex-1 py-4 px-6 text-base font-bold bg-[#10B981] hover:bg-[#059669] disabled:bg-[#10B981]/30 text-white rounded-xl transition-colors disabled:cursor-not-allowed"
            >
              Add Expense
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function AddMemberModal({
  groupId,
  currentUserId,
  existingMembers,
  onClose,
}: {
  groupId: any
  currentUserId: any
  existingMembers: any[]
  onClose: () => void
}) {
  const [email, setEmail] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState('')

  const convex = useConvex()
  const addMember = useMutation(api.groups.addGroupMember)
  
  // Helper to check if user is already a member
  const isUserMember = (userId: any) => {
    return existingMembers.some((member: any) => member.userId === userId)
  }

  const handleSearch = async () => {
    if (!email) return
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a complete, valid email address')
      return
    }
    
    setIsSearching(true)
    setError('')
    setSearchResults([])
    try {
      // Search for exact email match
      const results = await convex.query(api.users.searchUsersByEmail, { emailQuery: email })
      
      // Filter to only exact matches
      const exactMatches = results.filter((user: any) => 
        user.email?.toLowerCase() === email.toLowerCase()
      )
      
      setSearchResults(exactMatches)
      if (exactMatches.length === 0) {
        setError('No user found with that email address')
      }
    } catch (err: any) {
      setError('Search failed. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddMember = async (userId: any) => {
    setError('')
    try {
      await addMember({
        groupId,
        userId,
        addedBy: currentUserId,
      })
      onClose()
    } catch (err: any) {
      // Extract user-friendly error message from Convex error
      let errorMessage = 'Failed to add member'
      
      if (err?.message) {
        // Extract the actual error message from Convex error format
        // Format: "[CONVEX M(...)] [Request ID: ...] Server Error\nUncaught Error: ACTUAL_MESSAGE"
        const match = err.message.match(/Uncaught Error: (.+?)(?:\n|$)/)
        if (match && match[1]) {
          errorMessage = match[1]
        } else {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
    }
  }

  return (
    <motion.div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div 
        className="bg-[#101418] backdrop-blur-xl rounded-2xl shadow-2xl max-w-lg w-full border border-[#10B981]/30"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#10B981] text-white flex items-center justify-center shadow-md">
                <UserPlus className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                Add Member
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
              <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Enter complete email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-white/50" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 border-2 border-[#10B981]/30 rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] bg-[#111827] text-white placeholder-white/40 transition-all"
                  placeholder="e.g., user@example.com"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={isSearching || !email}
                className="w-full bg-[#10B981] hover:bg-[#059669] disabled:bg-[#10B981]/30 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 mt-3"
              >
                <Search className="w-5 h-5" />
                {isSearching ? 'Searching...' : 'Find User'}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-white">
                  <Check className="w-4 h-4 text-green-600" />
                  Found {searchResults.length} user{searchResults.length !== 1 ? 's' : ''}
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {searchResults.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between p-4 bg-[#10B981]/10 rounded-xl border border-[#10B981]/20 hover:border-[#10B981]/40 transition-all"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center font-semibold shadow-lg">
                          {(user.name || user.email || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-white">
                            {user.name || user.email || 'Unknown User'}
                          </div>
                          {user.name && user.email && (
                            <div className="text-sm text-white/70">
                              {user.email}
                            </div>
                          )}
                        </div>
                      </div>
                      {isUserMember(user._id) ? (
                        <div className="flex items-center gap-2 text-sm text-white/70 px-4 py-2 bg-white/5 rounded-lg">
                          <Check className="w-4 h-4 text-[#10B981]" />
                          Already a member
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddMember(user._id)}
                          className="bg-[#10B981] hover:bg-[#059669] text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <UserPlus className="w-4 h-4" />
                          Add
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-[#10B981]/30 text-white rounded-lg hover:bg-[#10B981]/10 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function SettlementDrawer({
  groupId,
  currentUserId,
  member,
  memberBalance,
  currencySymbol,
  currencyCode,
  onClose,
  settlementAmount,
  isPayment,
}: {
  groupId: any
  currentUserId: any
  member: any
  memberBalance: any
  currencySymbol: string
  currencyCode: string
  onClose: () => void
  settlementAmount?: number
  isPayment?: boolean
}) {
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  const createSettlement = useMutation(api.settlements.createSettlement)
  
  // Use settlement amount if provided, otherwise use member balance
  const balanceAmount = settlementAmount 
    ? settlementAmount / 100 
    : Math.abs(memberBalance?.balance || 0) / 100
  
  // Determine who owes whom
  // If isPayment is explicitly set, use that; otherwise infer from balance
  const iOwe = isPayment !== undefined ? isPayment : memberBalance?.balance < 0
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    const settlementAmount = parseFloat(amount)
    if (!settlementAmount || settlementAmount <= 0) {
      setError('Please enter a valid amount')
      return
    }
    
    if (settlementAmount > balanceAmount) {
      setError(`Amount cannot exceed ${currencySymbol}${balanceAmount.toFixed(2)}`)
      return
    }
    
    setIsSubmitting(true)
    try {
      await createSettlement({
        groupId,
        fromUser: iOwe ? currentUserId : member._id,
        toUser: iOwe ? member._id : currentUserId,
        amount: Math.round(settlementAmount * 100),
        currency: currencyCode,
        date: Date.now(),
        notes: notes || undefined,
      })
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to record settlement')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <div className="w-full max-w-md mx-auto px-2 py-6 pb-12">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#10B981] text-white flex items-center justify-center font-semibold">
            <DollarSign className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            Settle Up
          </h2>
        </div>

        {/* Settlement Info */}
        <div className="mb-6 p-4 bg-[#10B981]/10 rounded-xl border border-[#10B981]/20">
          <div className="text-sm text-white/70 mb-1">
            {iOwe ? 'You owe' : 'Owes you'}
          </div>
          <div className="flex items-center justify-between">
            <div className="font-semibold text-white">
              {member.name || member.email || 'Unknown User'}
            </div>
            <div className={`text-lg font-bold ${iOwe ? 'text-red-400' : 'text-green-400'}`}>
              {currencySymbol}{balanceAmount.toFixed(2)}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
            <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Amount Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-white mb-2">
            Settlement Amount *
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 font-medium">
              {currencySymbol}
            </span>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-[#10B981]/30 rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] bg-[#111827] text-white placeholder-white/40 transition-all text-lg font-semibold"
              placeholder="0.00"
              required
              max={balanceAmount}
            />
          </div>
          <button
            type="button"
            onClick={() => setAmount(balanceAmount.toFixed(2))}
            className="mt-2 text-xs text-[#10B981] hover:text-[#059669] transition-colors"
          >
            Settle full amount ({currencySymbol}{balanceAmount.toFixed(2)})
          </button>
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-2">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-4 py-3 border-2 border-[#10B981]/30 rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] bg-[#111827] text-white placeholder-white/40 transition-all resize-none"
            placeholder="Add a note about this payment..."
            rows={3}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-transparent border-2 border-[#10B981]/30 text-white font-semibold py-3 px-4 rounded-xl transition-colors hover:bg-[#10B981]/10"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
            className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>Processing...</>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Record Payment
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

function ExportDataSection({ group, user }: { group: any; user: any }) {
  const convex = useConvex()
  const [isExporting, setIsExporting] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const exportMenuRef = useRef<HTMLDivElement>(null)

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false)
      }
    }

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showExportMenu])

  const handleExport = async (format: 'json' | 'csv') => {
    if (!user) return
    
    setIsExporting(true)
    try {
      const data = await convex.query(api.export.exportGroupData, {
        groupId: group._id,
        userId: user._id,
      })

      if (format === 'json') {
        // Export as JSON
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${group.name.replace(/\s+/g, '_')}_export_${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        // Export as CSV
        const csvContent = generateCSV(data)
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${group.name.replace(/\s+/g, '_')}_export_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
      
      setShowExportMenu(false)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export data. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const generateCSV = (data: any) => {
    const lines: string[] = []
    
    // Group Info
    lines.push('GROUP INFORMATION')
    lines.push(`Name,${data.group.name}`)
    lines.push(`Description,${data.group.description || 'N/A'}`)
    lines.push(`Currency,${data.group.currency || 'USD'}`)
    lines.push(`Created At,${new Date(data.group.createdAt).toLocaleString()}`)
    lines.push('')
    
    // Members
    lines.push('MEMBERS')
    lines.push('Name,Email,Role')
    data.members.forEach((member: any) => {
      lines.push(`${member.name},${member.email},${member.role}`)
    })
    lines.push('')
    
    // Balances
    lines.push('BALANCES')
    lines.push('Name,Email,Balance')
    data.balances.forEach((balance: any) => {
      const balanceAmount = (balance.balance / 100).toFixed(2)
      const sign = balance.balance >= 0 ? '+' : ''
      lines.push(`${balance.userName},${balance.userEmail},${sign}${balanceAmount}`)
    })
    lines.push('')
    
    // Expenses
    lines.push('EXPENSES')
    lines.push('Date,Description,Amount,Category,Paid By,Split Between')
    data.expenses.forEach((expense: any) => {
      const date = new Date(expense.date).toLocaleDateString()
      const amount = (expense.amount / 100).toFixed(2)
      const splitNames = expense.splits.map((s: any) => s.userName).join('; ')
      lines.push(`${date},${expense.description},${amount},${expense.category || 'N/A'},${expense.paidBy.userName},"${splitNames}"`)
    })
    lines.push('')
    
    // Settlements
    if (data.settlements.length > 0) {
      lines.push('SETTLEMENTS')
      lines.push('Date,From,To,Amount,Notes')
      data.settlements.forEach((settlement: any) => {
        const date = new Date(settlement.date).toLocaleDateString()
        const amount = (settlement.amount / 100).toFixed(2)
        lines.push(`${date},${settlement.fromUser.userName},${settlement.toUser.userName},${amount},${settlement.notes || 'N/A'}`)
      })
      lines.push('')
    }
    
    // Export Info
    lines.push('EXPORT INFORMATION')
    lines.push(`Exported At,${new Date(data.exportedAt).toLocaleString()}`)
    lines.push(`Exported By,${data.exportedBy.userName}`)
    
    return lines.join('\n')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">Export Group Data</h2>
          <p className="text-sm text-white/60">Download all expenses, settlements, and balances</p>
        </div>
        <div className="relative" ref={exportMenuRef}>
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={isExporting}
            className="flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2.5 rounded-xl transition-colors font-medium shadow-lg disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Exporting...' : 'Export'}</span>
          </button>
          {showExportMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-48 bg-[#101418] border border-[#10B981]/30 rounded-lg shadow-xl z-50 overflow-hidden"
            >
              <button
                onClick={() => handleExport('json')}
                disabled={isExporting}
                className="w-full px-4 py-3 text-left text-sm text-white hover:bg-[#10B981]/20 transition-colors disabled:opacity-50 flex items-center justify-between"
              >
                <span>Export as JSON</span>
                <span className="text-xs text-white/50">.json</span>
              </button>
              <button
                onClick={() => handleExport('csv')}
                disabled={isExporting}
                className="w-full px-4 py-3 text-left text-sm text-white hover:bg-[#10B981]/20 transition-colors disabled:opacity-50 flex items-center justify-between border-t border-[#10B981]/20"
              >
                <span>Export as CSV</span>
                <span className="text-xs text-white/50">.csv</span>
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

function MembersTabContent({
  group,
  setShowAddMember,
}: {
  group: any
  setShowAddMember: (show: boolean) => void
}) {
  return (
    <div className="">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">
          Members ({group.members.length})
        </h2>
        <button
          onClick={() => setShowAddMember(true)}
          className="text-sm text-[#10B981] hover:text-[#059669] transition-colors font-medium"
        >
          + Add Member
        </button>
      </div>
      <div className="space-y-2">
        {group.members.map((member: any, index: number) => {
          const displayName = member.name || member.email || 'Unknown User'
          
          return (
            <motion.div
              key={member._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileHover={{ scale: 1.01, x: 4 }}
              className="p-4 bg-[#10B981]/10 rounded-xl border border-[#10B981]/20"
            >
              <div className="flex items-center gap-2">
                <div className="font-semibold text-white truncate">
                  {displayName}
                </div>
                {member.role === 'admin' && (
                  <span className="text-xs bg-[#10B981] text-white px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                    Admin
                  </span>
                )}
              </div>
              {member.name && member.email && (
                <div className="text-xs text-white/50 truncate mt-1">
                  {member.email}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
