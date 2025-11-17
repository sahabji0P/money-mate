import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useAuth } from '~/lib/auth-context'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'
import { Users, ArrowRight, Receipt, TrendingUp, Sparkles, LogOut, Plus, DollarSign, Settings } from 'lucide-react'
import { motion } from 'motion/react'
import { Drawer, DrawerContent, DrawerTrigger } from '~/components/ui/drawer'
import { useState } from 'react'
import { useMutation } from 'convex/react'

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export const Route = createFileRoute('/')({
  component: Home,
})

function CreateGroupDrawer() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [isOpen, setIsOpen] = useState(false)
  const createGroup = useMutation(api.groups.createGroup)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !user) return

    try {
      const selectedCurrency = CURRENCIES.find(c => c.code === currency)!
      const groupId = await createGroup({
        name,
        description: description || undefined,
        createdBy: user._id,
        currency: selectedCurrency.code,
        currencySymbol: selectedCurrency.symbol,
      })
      setIsOpen(false)
      setName('')
      setDescription('')
      setCurrency('USD')
      navigate({ to: '/groups/$groupId', params: { groupId } })
    } catch (error) {
      console.error('Failed to create group:', error)
    }
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <button className="sm:hidden fixed bottom-6 right-6 b-safe-4 r-safe-4 z-40 w-14 h-14 rounded-full bg-[#10B981] hover:bg-[#059669] text-white flex items-center justify-center shadow-lg transition-all">
          <Plus className="w-6 h-6" />
        </button>
      </DrawerTrigger>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
      )}
      <DrawerContent className="bg-[#101418] border-t border-[#10B981]/30 px-2">
        <div className="w-full max-w-md mx-auto px-4 py-6 pb-12">
          <h2 className="text-xl font-bold text-white mb-6">Create New Group</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Group Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-[#10B981]/30 rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] bg-[#111827] text-white placeholder-white/40 transition-all text-sm"
                placeholder="e.g., Roommates, Trip to Paris"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-[#10B981]/30 rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] bg-[#111827] text-white placeholder-white/40 transition-all text-sm"
                placeholder="What's this group for?"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Currency *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="w-4 h-4 text-white/50" />
                </div>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border-2 border-[#10B981]/30 rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] bg-[#111827] text-white appearance-none cursor-pointer transition-all text-sm"
                  required
                >
                  {CURRENCIES.map((curr) => (
                    <option key={curr.code} value={curr.code}>
                      {curr.symbol} - {curr.name} ({curr.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-2.5 border-2 border-[#10B981]/30 text-white rounded-xl hover:bg-[#10B981]/10 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white font-semibold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Users className="w-4 h-4" />
                Create
              </button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function Home() {
  const { user, isLoading, signInWithGoogle } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-[#0A0F12] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-[#10B981] text-white mb-4 animate-pulse">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 font-audiowide">Owwn</h1>
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-b from-[#020617] via-[#020817] to-[#020617] text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-[#10B981]/20 blur-3xl rounded-full opacity-60" />
          <div className="absolute top-40 -right-32 w-72 h-72 bg-emerald-500/20 blur-3xl rounded-full opacity-60" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col gap-12">
          {/* Top nav */}
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#10B981] flex items-center justify-center shadow-lg shadow-emerald-500/40">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold font-audiowide tracking-tight">Owwn</h1>
                <p className="text-xs sm:text-sm text-white/60">Own what you owe</p>
              </div>
            </div>
            <button
              onClick={async () => {
                try {
                  await signInWithGoogle()
                } catch (err: any) {
                  console.error('Google sign-in failed:', err)
                }
              }}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-medium text-white transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in
            </button>
          </header>

          <main className="grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-10 items-center">
            {/* Hero copy */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-100">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                AI‑powered group expense tracking
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
                  Split bills without
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-300"> awkward maths.</span>
                </h2>
                <p className="text-base sm:text-lg text-white/70 max-w-xl">
                  Owwn keeps every trip, flatshare, and dinner night fair. Add expenses in seconds, let AI do the splitting, and see who owes what at a glance.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <button
                  onClick={async () => {
                    try {
                      await signInWithGoogle()
                    } catch (err: any) {
                      console.error('Google sign-in failed:', err)
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-gray-900 hover:bg-gray-100 font-semibold px-5 py-3 text-sm sm:text-base shadow-lg shadow-emerald-500/30 w-full sm:w-auto"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
                <div className="flex flex-wrap gap-2 text-xs text-white/60">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                    <Receipt className="w-3 h-3" />
                    Track every bill
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                    <Users className="w-3 h-3" />
                    Built for real groups
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-3">
                  <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-300">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-1">Smart expense timelines</p>
                    <p className="text-xs text-white/60">See every trip, dinner, and bill in one clean feed.</p>
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-3">
                  <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-300">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-1">Balances that make sense</p>
                    <p className="text-xs text-white/60">Always know who owes whom — and how much.</p>
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-3">
                  <div className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-300">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-1">AI‑powered inputs</p>
                    <p className="text-xs text-white/60">Type "split pizza between us" and let Owwn handle the math.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side "app preview" card */}
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-emerald-400/50 via-emerald-500/10 to-cyan-400/40 rounded-[2rem] blur-xl opacity-60" />
              <div className="relative rounded-[1.7rem] bg-[#050A0F] border border-emerald-500/40 shadow-[0_20px_60px_rgba(16,185,129,0.45)] px-5 py-6 max-w-sm mx-auto">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#10B981] flex items-center justify-center text-white">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-white/60">Trip group</p>
                      <p className="text-sm font-semibold">Goa 2025</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/40 text-emerald-200">
                    All synced
                  </span>
                </div>

                <div className="rounded-2xl bg-[#050712] border border-emerald-500/30 p-4 mb-4">
                  <p className="text-xs text-white/60 mb-1">Your balance</p>
                  <p className="text-3xl font-bold text-emerald-300 mb-1">₹ 2,430.50</p>
                  <p className="text-[11px] inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-200">
                    <TrendingUp className="w-3 h-3" />
                    You are owed overall
                  </p>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center">
                        <span className="text-[11px]">MK</span>
                      </div>
                      <div>
                        <p className="font-medium">Madhav</p>
                        <p className="text-[11px] text-white/50">Owes you</p>
                      </div>
                    </div>
                    <p className="font-semibold text-emerald-300">₹ 1,203.30</p>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center">
                        <span className="text-[11px]">CK</span>
                      </div>
                      <div>
                        <p className="font-medium">Chirag</p>
                        <p className="text-[11px] text-white/50">You owe</p>
                      </div>
                    </div>
                    <p className="font-semibold text-red-400">₹ 540.20</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div>
                    <p className="text-[11px] text-white/50 mb-1">Settle up in one tap</p>
                    <p className="text-xs text-white/70">We suggest the minimal repayments so everyone is square.</p>
                  </div>
                  <button className="ml-3 inline-flex items-center justify-center rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-[11px] font-semibold px-3 py-2">
                    Settle
                  </button>
                </div>
              </div>
            </div>
          </main>

          <footer className="pt-4 pb-6 text-[11px] text-white/40 flex flex-wrap items-center justify-between gap-2">
            <p>Made for trips, flats, and friend groups who hate spreadsheets.</p>
            <p>Sign in with Google to get started in under 10 seconds.</p>
          </footer>
        </div>
      </div>
    )
  }

  return <Dashboard user={user} />
}

function Dashboard({ user }: { user: { _id: any; name?: string; email?: string } }) {
  const { signOut } = useAuth()
  const { data: groups = [] } = useSuspenseQuery(
    convexQuery(api.groups.getUserGroups, { userId: user._id })
  )

  return (
    <div className="min-h-[100dvh] bg-[#0A0F12]">
      {/* Header */}
      <header className="bg-[#101418]/80 backdrop-blur-md border-b border-[#10B981]/30 shadow-lg sticky top-0 z-50 pt-safe px-safe">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-900 text-white flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white font-audiowide">Owwn</h1>
              <p className="text-xs text-white/50">
                Own what you owe
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">
                {user.name || user.email}
              </p>
              <p className="text-xs text-white/60">
                {user.email}
              </p>
            </div>
            <Link
              to="/settings"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white hover:bg-[#10B981]/20 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white hover:bg-[#10B981]/20 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 sm:pb-8">
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Your Groups
            </h2>
            <p className="text-white/70">
              Manage your shared expenses and settlements
            </p>
          </div>
          {groups.length === 0 && (
            <Link
              to="/groups/new"
              className="hidden sm:flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              <Users className="w-5 h-5" />
              Create Group
            </Link>
          )}
        </div>

        {groups.length === 0 ? (
          <div className="bg-[#101418] rounded-2xl shadow-xl p-12 text-center border border-[#10B981]/30">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#10B981]/10 mb-6">
              <Users className="w-10 h-10 text-[#10B981]" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              No groups yet
            </h3>
            <p className="text-white/70 mb-8 max-w-md mx-auto">
              Create your first group to start tracking expenses with friends, roommates, or travel companions
            </p>
            <Link
              to="/groups/new"
              className="inline-flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-lg"
            >
              <Users className="w-5 h-5" />
              Create Your First Group
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {groups.map((group: any) => (
              <motion.div
                key={group._id}
                variants={item}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Link
                  to="/groups/$groupId"
                  params={{ groupId: group._id }}
                  className="block group bg-[#101418] rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 border border-[#10B981]/30 hover:border-[#10B981]"
                >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-[#10B981] text-white flex items-center justify-center shadow-md">
                        <Users className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white">
                          {group.name}
                        </h3>
                      </div>
                    </div>
                    {group.description && (
                      <p className="text-sm text-white/70 line-clamp-2">
                        {group.description}
                      </p>
                    )}
                  </div>
                  {group.role === 'admin' && (
                    <span className="bg-[#10B981] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                      Admin
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-[#10B981]/20">
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <Users className="w-4 h-4" />
                    <span className="font-medium">{group.memberCount} members</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-white/40 group-hover:text-[#10B981] transition-colors" />
                </div>
              </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      {/* Create Group Drawer - Mobile */}
      <CreateGroupDrawer />
      
      {/* Create Group Button - Desktop only */}
      <Link
        to="/groups/new"
        className="hidden sm:flex fixed bottom-6 right-6 items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg"
      >
        <Users className="w-5 h-5" />
        Create Group
      </Link>
    </div>
  )
}

