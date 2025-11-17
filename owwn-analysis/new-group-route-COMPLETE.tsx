import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useAuth } from '~/lib/auth-context'
import { ArrowLeft, Users, DollarSign } from 'lucide-react'

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

export const Route = createFileRoute('/groups/new')({
  component: NewGroup,
})

function NewGroup() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [currency, setCurrency] = useState('USD')
  const createGroup = useMutation(api.groups.createGroup)

  if (!user) {
    navigate({ to: '/' })
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return

    try {
      const selectedCurrency = CURRENCIES.find(c => c.code === currency)!
      const groupId = await createGroup({
        name,
        description: description || undefined,
        createdBy: user._id,
        currency: selectedCurrency.code,
        currencySymbol: selectedCurrency.symbol,
      })
      navigate({ to: '/groups/$groupId', params: { groupId } })
    } catch (error) {
      console.error('Failed to create group:', error)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0A0F12]">
      <header className="bg-[#101418]/80 backdrop-blur-md shadow-lg border-b border-[#10B981]/30 sticky top-0 z-40 pt-safe px-safe">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate({ to: '/' })}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#10B981] text-white flex items-center justify-center shadow-md">
                <Users className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Create New Group
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[#101418] rounded-2xl shadow-xl p-8 border border-[#10B981]/30">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Group Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#10B981]/30 rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] bg-[#111827] text-white placeholder-white/40 transition-all"
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
                className="w-full px-4 py-3 border-2 border-[#10B981]/30 rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] bg-[#111827] text-white placeholder-white/40 transition-all"
                placeholder="What's this group for?"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Currency *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="w-5 h-5 text-white/50" />
                </div>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-[#10B981]/30 rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] bg-[#111827] text-white appearance-none cursor-pointer transition-all"
                  required
                >
                  {CURRENCIES.map((curr) => (
                    <option key={curr.code} value={curr.code}>
                      {curr.symbol} - {curr.name} ({curr.code})
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-2 text-sm text-white/70">
                All expenses in this group will use {CURRENCIES.find(c => c.code === currency)?.name}
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate({ to: '/' })}
                className="flex-1 px-6 py-3 border-2 border-[#10B981]/30 text-white rounded-xl hover:bg-[#10B981]/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Users className="w-5 h-5" />
                Create Group
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
