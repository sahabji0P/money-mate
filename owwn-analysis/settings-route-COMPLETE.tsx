import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuth } from '~/lib/auth-context'
import { useMutation } from 'convex/react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'
import { useState } from 'react'
import { ArrowLeft, Plus, Copy, Trash2, Key, AlertCircle, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState(false)

  const { data: apiKeys } = useSuspenseQuery(
    convexQuery(api.apiKeys.getUserApiKeys, { userId: user!._id })
  )

  const createApiKey = useMutation(api.apiKeys.createApiKey)
  const revokeApiKey = useMutation(api.apiKeys.revokeApiKey)
  const deleteApiKey = useMutation(api.apiKeys.deleteApiKey)

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return

    const result = await createApiKey({
      userId: user!._id,
      name: newKeyName,
    })

    setCreatedKey(result.key)
    setNewKeyName('')
  }

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(true)
    setTimeout(() => setCopiedKey(false), 2000)
  }

  const handleRevokeKey = async (keyId: any) => {
    if (confirm('Are you sure you want to revoke this API key?')) {
      await revokeApiKey({ keyId, userId: user!._id })
    }
  }

  const handleDeleteKey = async (keyId: any) => {
    if (confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      await deleteApiKey({ keyId, userId: user!._id })
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#0A0F12]">
      <header className="bg-[#101418]/80 backdrop-blur-md shadow-lg border-b border-[#10B981]/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate({ to: '/' })}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[#101418] rounded-2xl shadow-xl p-8 border border-[#10B981]/30">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">API Keys</h2>
              <p className="text-white/60">
                Manage API keys for MCP server access. Use these keys to connect AI tools to your Owwn data.
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white font-semibold py-2 px-4 rounded-xl transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Create Key
            </button>
          </div>

          {apiKeys.length === 0 ? (
            <div className="text-center py-12">
              <Key className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg text-white/70 mb-2">No API keys yet</p>
              <p className="text-sm text-white/50">
                Create an API key to connect your AI tools to Owwn
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <motion.div
                  key={key._id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-[#10B981]/10 rounded-xl border border-[#10B981]/20"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-white">{key.name}</h3>
                        {!key.isActive && (
                          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                            Revoked
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-white/60 space-y-1">
                        <p>Key: {key.keyPreview}</p>
                        <p>Created: {new Date(key._creationTime).toLocaleDateString()}</p>
                        {key.lastUsed && (
                          <p>Last used: {new Date(key.lastUsed).toLocaleDateString()}</p>
                        )}
                        {key.expiresAt && (
                          <p>Expires: {new Date(key.expiresAt).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {key.isActive && (
                        <button
                          onClick={() => handleRevokeKey(key._id)}
                          className="text-yellow-400 hover:text-yellow-300 transition-colors p-2"
                          title="Revoke key"
                        >
                          <AlertCircle className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteKey(key._id)}
                        className="text-red-400 hover:text-red-300 transition-colors p-2"
                        title="Delete key"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-2">MCP Server Endpoint</h3>
            <p className="text-sm text-white/70 mb-2">
              Use this endpoint to connect your AI tools:
            </p>
            <code className="block bg-[#0A0F12] p-3 rounded-lg text-sm text-[#10B981] font-mono">
              {window.location.origin.replace('http://localhost:5173', 'YOUR_CONVEX_SITE_URL')}/mcp
            </code>
            <p className="text-xs text-white/50 mt-2">
              Replace YOUR_CONVEX_SITE_URL with your actual Convex deployment URL
            </p>
          </div>
        </div>
      </main>

      {/* Create API Key Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              if (!createdKey) setShowCreateModal(false)
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#101418] rounded-2xl shadow-xl p-6 max-w-md w-full border border-[#10B981]/30"
              onClick={(e) => e.stopPropagation()}
            >
              {!createdKey ? (
                <>
                  <h2 className="text-2xl font-bold text-white mb-4">Create API Key</h2>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-2">
                      Key Name
                    </label>
                    <input
                      type="text"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="e.g., Claude Desktop, Cursor"
                      className="w-full px-4 py-2.5 border-2 border-[#10B981]/30 rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-[#10B981] bg-[#111827] text-white placeholder-white/40 transition-all"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="flex-1 px-4 py-2.5 border-2 border-[#10B981]/30 text-white rounded-xl hover:bg-[#10B981]/10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateKey}
                      disabled={!newKeyName.trim()}
                      className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white font-semibold py-2.5 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-white mb-4">API Key Created!</h2>
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4">
                    <p className="text-sm text-yellow-400 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Save this key now - you won't be able to see it again!
                    </p>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-2">
                      Your API Key
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={createdKey}
                        readOnly
                        className="flex-1 px-4 py-2.5 border-2 border-[#10B981]/30 rounded-xl bg-[#111827] text-white font-mono text-sm"
                      />
                      <button
                        onClick={() => handleCopyKey(createdKey)}
                        className="px-4 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl transition-colors flex items-center gap-2"
                      >
                        {copiedKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setCreatedKey(null)
                      setShowCreateModal(false)
                    }}
                    className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-semibold py-2.5 px-4 rounded-xl transition-colors"
                  >
                    Done
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
