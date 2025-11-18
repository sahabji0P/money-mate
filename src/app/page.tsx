'use client';

import { useAuth } from '@/lib/useAuth';
import { signIn, signOut } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, ArrowRight, Receipt, TrendingUp, Sparkles, LogOut, Plus, DollarSign, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';
import Link from 'next/link';
import { CURRENCIES } from '@/lib/constants';
import { useRouter } from 'next/navigation';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Home() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isAuthenticated && user) {
    return <Dashboard user={user} />;
  }

  return <LandingPage />;
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-primary flex items-center justify-center">
      <div className="space-y-4 w-full max-w-md p-4">
        <div className="h-12 bg-primary-elevated rounded-lg skeleton" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-primary-elevated rounded-lg skeleton" />
          ))}
        </div>
      </div>
    </div>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-primary relative overflow-hidden">
      {/* Floating blobs - subtle monochromatic */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-text/5 blur-3xl rounded-full animate-blob opacity-60" />
      <div className="absolute -top-20 -right-40 w-80 h-80 bg-text/5 blur-3xl rounded-full animate-blob animation-delay-2000 opacity-60" />
      <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-text/5 blur-3xl rounded-full animate-blob animation-delay-4000 opacity-60" />

      <div className="relative z-10">
        {/* Header */}
        <header className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-text rounded-xl flex items-center justify-center">
                <Receipt className="w-6 h-6 text-primary" />
              </div>
              <span className="text-2xl font-audiowide font-bold text-text">Money Mate</span>
            </div>
            <button
              onClick={() => signIn('google', { callbackUrl: '/' })}
              className="hidden sm:flex items-center gap-2 bg-text text-primary px-6 py-2.5 rounded-xl font-medium hover:bg-text/90 transition-all duration-base"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <main className="px-4 py-12 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Hero */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-primary-elevated border border-border rounded-full px-4 py-2 mb-6">
                <Sparkles className="w-4 h-4 text-text" />
                <span className="text-sm font-medium text-text">AI-powered group expense tracking</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light mb-6 leading-tight">
                <span className="text-text">
                  Split bills without
                </span>
                <br />
                <span className="text-text">awkward maths</span>
              </h1>

              <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto font-normal">
                Track shared expenses, split bills fairly, and settle up with friends. All without spreadsheets or mental gymnastics.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => signIn('google', { callbackUrl: '/' })}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-text hover:bg-text/90 text-primary px-8 py-4 rounded-xl font-medium transition-all duration-base hover:shadow-lg shadow-text/20 active:scale-[0.98]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Get Started Free
                </button>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <span className="inline-flex items-center gap-1 bg-primary-elevated border border-border rounded-full px-3 py-1.5">
                    Track every bill
                  </span>
                  <span className="inline-flex items-center gap-1 bg-primary-elevated border border-border rounded-full px-3 py-1.5">
                    Built for real groups
                  </span>
                </div>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              <div className="bg-primary-elevated border border-border-subtle rounded-2xl p-6 hover:border-border transition-all duration-base hover-lift">
                <div className="w-12 h-12 bg-primary-hover rounded-xl flex items-center justify-center mb-4">
                  <Receipt className="w-6 h-6 text-text" />
                </div>
                <h3 className="text-xl font-medium text-text mb-2">Smart expense timelines</h3>
                <p className="text-text-secondary">See who paid what, when. No more digging through old messages to remember who owes what.</p>
              </div>

              <div className="bg-primary-elevated border border-border-subtle rounded-2xl p-6 hover:border-border transition-all duration-base hover-lift">
                <div className="w-12 h-12 bg-primary-hover rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-text" />
                </div>
                <h3 className="text-xl font-medium text-text mb-2">Balances that make sense</h3>
                <p className="text-text-secondary">See exactly who owes who at a glance. Smart settlement suggestions minimize transactions.</p>
              </div>

              <div className="bg-primary-elevated border border-border-subtle rounded-2xl p-6 hover:border-border transition-all duration-base hover-lift">
                <div className="w-12 h-12 bg-primary-hover rounded-xl flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-text" />
                </div>
                <h3 className="text-xl font-medium text-text mb-2">AI-powered inputs</h3>
                <p className="text-text-secondary">Just type "Split dinner between me and Alice for $50" and let AI do the rest.</p>
              </div>
            </div>

            {/* App Preview */}
            <div className="bg-primary-elevated border border-border rounded-3xl p-8 max-w-md mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-text">Goa 2025</h3>
                  <p className="text-sm text-text-secondary">4 members</p>
                </div>
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-text border-2 border-primary-elevated" />
                  ))}
                </div>
              </div>

              <div className="bg-primary rounded-2xl p-6 mb-4">
                <p className="text-sm text-text-secondary mb-2">Your balance</p>
                <p className="text-4xl font-light text-text">
                  +$156.50
                </p>
                <p className="text-sm text-text mt-1">You are owed</p>
              </div>

              <button className="w-full bg-text hover:bg-text/90 text-primary font-medium py-3 px-4 rounded-xl transition-all duration-base flex items-center justify-center gap-2">
                <span>Settle up</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-4 py-8 sm:px-6 lg:px-8 text-center text-text-secondary text-sm">
          <p>Split bills effortlessly. No spreadsheets required.</p>
        </footer>
      </div>
    </div>
  );
}

function Dashboard({ user }: { user: any }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  // Fetch user's groups
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const res = await fetch('/api/groups');
      if (!res.ok) throw new Error('Failed to fetch groups');
      return res.json();
    },
  });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-primary">
      {/* Header */}
      <header className="border-b border-border px-4 py-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-text rounded-xl flex items-center justify-center">
              <Receipt className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-audiowide font-bold text-text">Money Mate</h1>
              <p className="text-xs text-text-secondary">Split bills effortlessly</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/settings" className="text-text-secondary hover:text-text transition-colors duration-base">
              <Settings className="w-5 h-5" />
            </Link>
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-text">{user.name}</p>
                <p className="text-xs text-text-secondary">{user.email}</p>
              </div>
              {user.image && (
                <img src={user.image} alt={user.name || ''} className="w-8 h-8 rounded-full" />
              )}
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-text-secondary hover:text-text transition-colors duration-base"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-light text-text">Your Groups</h2>
            <button
              onClick={() => setShowCreateGroup(true)}
              className="hidden sm:flex items-center gap-2 bg-text hover:bg-text/90 text-primary px-6 py-2.5 rounded-xl font-medium transition-all duration-base"
            >
              <Plus className="w-5 h-5" />
              Create Group
            </button>
          </div>

          {groups.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-primary-elevated rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-text" />
              </div>
              <h3 className="text-xl font-medium text-text mb-2">No groups yet</h3>
              <p className="text-text-secondary mb-6">Create your first group to start tracking expenses</p>
              <button
                onClick={() => setShowCreateGroup(true)}
                className="inline-flex items-center gap-2 bg-text hover:bg-text/90 text-primary px-6 py-3 rounded-xl font-medium transition-all duration-base"
              >
                <Plus className="w-5 h-5" />
                Create Your First Group
              </button>
            </div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {groups.map((group: any) => (
                <motion.div
                  key={group.id}
                  variants={item}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="bg-primary-elevated border border-border-subtle rounded-2xl p-6 hover:border-border transition-all duration-base cursor-pointer"
                  onClick={() => router.push(`/groups/${group.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-text mb-1">{group.name}</h3>
                      {group.description && (
                        <p className="text-sm text-text-secondary line-clamp-2">{group.description}</p>
                      )}
                    </div>
                    <span className="text-2xl">{group.currencySymbol}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <Users className="w-4 h-4" />
                    <span>{group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}</span>
                  </div>

                  {group.role === 'admin' && (
                    <div className="mt-3">
                      <span className="inline-flex items-center text-xs bg-primary-hover text-text px-2 py-1 rounded-full">
                        Admin
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>

      {/* Create Group - Desktop Dialog */}
      <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Group</DialogTitle>
          </DialogHeader>
          <CreateGroupForm onSuccess={() => setShowCreateGroup(false)} />
        </DialogContent>
      </Dialog>

      {/* Create Group - Mobile Drawer */}
      <CreateGroupDrawer />
    </div>
  );
}

function CreateGroupDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <button className="sm:hidden fixed bottom-6 right-6 b-safe-4 r-safe-4 z-40 w-14 h-14 rounded-full bg-text hover:bg-text/90 text-primary flex items-center justify-center shadow-lg transition-all duration-base">
          <Plus className="w-6 h-6" />
        </button>
      </DrawerTrigger>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
      )}
      <DrawerContent className="bg-primary-elevated border-t border-border px-2">
        <div className="w-full max-w-md mx-auto px-4 py-6 pb-12">
          <h2 className="text-xl font-medium text-text mb-6">Create New Group</h2>
          <CreateGroupForm onSuccess={() => setIsOpen(false)} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function CreateGroupForm({ onSuccess }: { onSuccess: () => void }) {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('USD');

  const createGroupMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create group');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      onSuccess();
      setName('');
      setDescription('');
      setCurrency('USD');
      router.push(`/groups/${data.id}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !user) return;

    const selectedCurrency = CURRENCIES.find(c => c.code === currency)!;
    createGroupMutation.mutate({
      name,
      description: description || undefined,
      currency: selectedCurrency.code,
      currencySymbol: selectedCurrency.symbol,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text mb-2">
          Group Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-text-tertiary focus:border-text-secondary bg-primary-elevated text-text placeholder-text-tertiary transition-all duration-fast text-sm"
          placeholder="e.g., Roommates, Trip to Paris"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text mb-2">
          Description (optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-text-tertiary focus:border-text-secondary bg-primary-elevated text-text placeholder-text-tertiary transition-all duration-fast text-sm resize-none"
          placeholder="What's this group for?"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text mb-2">
          Currency *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <DollarSign className="w-4 h-4 text-text-tertiary" />
          </div>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl focus:ring-2 focus:ring-text-tertiary focus:border-text-secondary bg-primary-elevated text-text appearance-none cursor-pointer transition-all duration-fast text-sm"
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
          type="submit"
          disabled={createGroupMutation.isPending}
          className="flex-1 bg-text hover:bg-text/90 text-primary font-medium py-2.5 px-4 rounded-xl transition-all duration-base flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {createGroupMutation.isPending ? (
            <>Creating...</>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Create Group
            </>
          )}
        </button>
      </div>
    </form>
  );
}
