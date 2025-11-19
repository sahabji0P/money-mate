'use client';

import { useAuth } from '@/lib/useAuth';
import { signIn, signOut } from 'next-auth/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  ArrowRight,
  Receipt,
  TrendingUp,
  Sparkles,
  Plus,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Wallet,
  Zap,
  Shield,
  Globe
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';
import Link from 'next/link';
import { CURRENCIES } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import MobileNav from '@/components/layout/MobileNav';
import Avatar, { AvatarGroup } from '@/components/shared/Avatar';
import Badge from '@/components/shared/Badge';
import EmptyState from '@/components/shared/EmptyState';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
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
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-accent-emerald/20 flex items-center justify-center animate-pulse">
          <Wallet className="w-6 h-6 text-accent-emerald" />
        </div>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-accent-emerald animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-accent-emerald animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-accent-emerald animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-primary relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent-emerald/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-blue/10 blur-[120px] rounded-full" />

      <div className="relative z-10">
        {/* Header */}
        <header className="px-4 py-5 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-emerald to-accent-emerald-dark flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-text">MoneyMate</span>
            </div>
            <button
              onClick={() => signIn('google', { callbackUrl: '/' })}
              className="hidden sm:flex items-center gap-2 bg-accent-emerald hover:bg-accent-emerald-dark text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 hover:shadow-glow-emerald"
            >
              Sign In
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <main className="px-4 py-12 sm:py-20 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Hero */}
            <div className="text-center mb-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center gap-2 bg-accent-emerald/10 border border-accent-emerald/20 rounded-full px-4 py-2 mb-6">
                  <Sparkles className="w-4 h-4 text-accent-emerald" />
                  <span className="text-sm font-medium text-accent-emerald">AI-powered expense splitting</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold mb-6 leading-tight tracking-tight">
                  <span className="text-text">Split expenses</span>
                  <br />
                  <span className="gradient-text-emerald">without the drama</span>
                </h1>

                <p className="text-lg text-text-secondary mb-10 max-w-xl mx-auto">
                  Track shared expenses, see who owes what, and settle up instantly.
                  No more awkward conversations or mental math.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={() => signIn('google', { callbackUrl: '/' })}
                    className="w-full sm:w-auto flex items-center justify-center gap-3 bg-accent-emerald hover:bg-accent-emerald-dark text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 hover:shadow-glow-emerald"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </button>
                  <span className="text-sm text-text-tertiary">
                    Free forever - No credit card
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Feature Cards */}
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid md:grid-cols-3 gap-4 mb-20"
            >
              <motion.div variants={item} className="group p-6 rounded-2xl bg-primary-elevated border border-border-subtle hover:border-accent-emerald/50 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-accent-emerald/10 flex items-center justify-center mb-4 group-hover:bg-accent-emerald/20 transition-colors">
                  <Receipt className="w-6 h-6 text-accent-emerald" />
                </div>
                <h3 className="text-lg font-medium text-text mb-2">Smart Receipt Scanning</h3>
                <p className="text-sm text-text-secondary">Snap a photo and let AI extract items, prices, and split them automatically.</p>
              </motion.div>

              <motion.div variants={item} className="group p-6 rounded-2xl bg-primary-elevated border border-border-subtle hover:border-accent-blue/50 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-accent-blue/10 flex items-center justify-center mb-4 group-hover:bg-accent-blue/20 transition-colors">
                  <TrendingUp className="w-6 h-6 text-accent-blue" />
                </div>
                <h3 className="text-lg font-medium text-text mb-2">Clear Balance View</h3>
                <p className="text-sm text-text-secondary">See exactly who owes whom at a glance. Minimize transactions with smart suggestions.</p>
              </motion.div>

              <motion.div variants={item} className="group p-6 rounded-2xl bg-primary-elevated border border-border-subtle hover:border-accent-purple/50 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-accent-purple/10 flex items-center justify-center mb-4 group-hover:bg-accent-purple/20 transition-colors">
                  <Users className="w-6 h-6 text-accent-purple" />
                </div>
                <h3 className="text-lg font-medium text-text mb-2">Group Management</h3>
                <p className="text-sm text-text-secondary">Create groups for roommates, trips, or events. Add members and track expenses together.</p>
              </motion.div>
            </motion.div>

            {/* App Preview Card */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="max-w-sm mx-auto"
            >
              <div className="bg-primary-elevated border border-border rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-medium text-text">Weekend Trip</h3>
                    <p className="text-sm text-text-tertiary">4 members</p>
                  </div>
                  <AvatarGroup
                    users={[
                      { name: 'Alex' },
                      { name: 'Sam' },
                      { name: 'Jordan' },
                      { name: 'Taylor' },
                    ]}
                    size="sm"
                  />
                </div>

                <div className="bg-accent-emerald/5 border border-accent-emerald/20 rounded-xl p-5 mb-4">
                  <div className="flex items-center gap-3 mb-1">
                    <ArrowUpRight className="w-5 h-5 text-accent-emerald" />
                    <span className="text-sm text-text-secondary">You're owed</span>
                  </div>
                  <p className="text-3xl font-semibold text-accent-emerald">
                    +$156.50
                  </p>
                </div>

                <button className="w-full bg-accent-emerald hover:bg-accent-emerald-dark text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2">
                  <span>Settle Up</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

            {/* Trust indicators */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-6 text-sm text-text-tertiary">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Bank-level security</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>10+ currencies</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>Instant sync</span>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-4 py-8 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-text-tertiary">
            Split bills effortlessly with MoneyMate
          </p>
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

  // Calculate total balance across all groups
  const totalBalance = groups.reduce((acc: number, group: any) => {
    return acc + (group.userBalance || 0);
  }, 0);

  const positiveBalance = groups.reduce((acc: number, group: any) => {
    const balance = group.userBalance || 0;
    return acc + (balance > 0 ? balance : 0);
  }, 0);

  const negativeBalance = groups.reduce((acc: number, group: any) => {
    const balance = group.userBalance || 0;
    return acc + (balance < 0 ? Math.abs(balance) : 0);
  }, 0);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-primary flex">
      {/* Desktop Sidebar */}
      <Sidebar user={user} onCreateGroup={() => setShowCreateGroup(true)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <Header user={user} title="Dashboard" showSearch />

        {/* Content */}
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8 pb-24 lg:pb-8">
          <div className="max-w-6xl mx-auto">
            {/* Welcome & Summary Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-text mb-1">
                Welcome back, {user.name?.split(' ')[0] || 'there'}
              </h2>
              <p className="text-text-secondary">
                Here's your expense summary across all groups
              </p>
            </div>

            {/* Balance Summary Cards */}
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              {/* Total Balance */}
              <div className={`
                p-5 rounded-xl border transition-all
                ${totalBalance > 0
                  ? 'bg-accent-emerald/5 border-accent-emerald/20'
                  : totalBalance < 0
                    ? 'bg-accent-rose/5 border-accent-rose/20'
                    : 'bg-primary-elevated border-border-subtle'
                }
              `}>
                <div className="flex items-center gap-2 mb-3">
                  {totalBalance > 0 ? (
                    <ArrowUpRight className="w-5 h-5 text-accent-emerald" />
                  ) : totalBalance < 0 ? (
                    <ArrowDownRight className="w-5 h-5 text-accent-rose" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-text-tertiary" />
                  )}
                  <span className="text-sm text-text-secondary">Total Balance</span>
                </div>
                <p className={`
                  text-2xl font-semibold
                  ${totalBalance > 0
                    ? 'text-accent-emerald'
                    : totalBalance < 0
                      ? 'text-accent-rose'
                      : 'text-text-tertiary'
                  }
                `}>
                  {totalBalance >= 0 ? '+' : '-'}${Math.abs(totalBalance).toFixed(2)}
                </p>
              </div>

              {/* You're Owed */}
              <div className="p-5 rounded-xl bg-primary-elevated border border-border-subtle">
                <div className="flex items-center gap-2 mb-3">
                  <ArrowUpRight className="w-5 h-5 text-accent-emerald" />
                  <span className="text-sm text-text-secondary">You're owed</span>
                </div>
                <p className="text-2xl font-semibold text-accent-emerald">
                  +${positiveBalance.toFixed(2)}
                </p>
              </div>

              {/* You Owe */}
              <div className="p-5 rounded-xl bg-primary-elevated border border-border-subtle">
                <div className="flex items-center gap-2 mb-3">
                  <ArrowDownRight className="w-5 h-5 text-accent-rose" />
                  <span className="text-sm text-text-secondary">You owe</span>
                </div>
                <p className="text-2xl font-semibold text-accent-rose">
                  -${negativeBalance.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Pending Settlements Section */}
            {(positiveBalance > 0 || negativeBalance > 0) && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-text mb-4">Pending Settlements</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* You Owe */}
                  {negativeBalance > 0 && (
                    <div className="p-4 rounded-xl bg-accent-rose/5 border border-accent-rose/20">
                      <div className="flex items-center gap-2 mb-3">
                        <ArrowDownRight className="w-4 h-4 text-accent-rose" />
                        <span className="text-sm font-medium text-text">Payments to Make</span>
                      </div>
                      <div className="space-y-2">
                        {groups
                          .filter((g: any) => (g.userBalance || 0) < 0)
                          .sort((a: any, b: any) => (a.userBalance || 0) - (b.userBalance || 0))
                          .map((group: any) => (
                            <Link
                              key={group.id}
                              href={`/groups/${group.id}`}
                              className="flex items-center justify-between p-2 rounded-lg hover:bg-accent-rose/10 transition-colors"
                            >
                              <span className="text-sm text-text truncate">{group.name}</span>
                              <span className="text-sm font-medium text-accent-rose whitespace-nowrap">
                                -${Math.abs(group.userBalance).toFixed(2)}
                              </span>
                            </Link>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* You're Owed */}
                  {positiveBalance > 0 && (
                    <div className="p-4 rounded-xl bg-accent-emerald/5 border border-accent-emerald/20">
                      <div className="flex items-center gap-2 mb-3">
                        <ArrowUpRight className="w-4 h-4 text-accent-emerald" />
                        <span className="text-sm font-medium text-text">Payments to Receive</span>
                      </div>
                      <div className="space-y-2">
                        {groups
                          .filter((g: any) => (g.userBalance || 0) > 0)
                          .sort((a: any, b: any) => (b.userBalance || 0) - (a.userBalance || 0))
                          .map((group: any) => (
                            <Link
                              key={group.id}
                              href={`/groups/${group.id}`}
                              className="flex items-center justify-between p-2 rounded-lg hover:bg-accent-emerald/10 transition-colors"
                            >
                              <span className="text-sm text-text truncate">{group.name}</span>
                              <span className="text-sm font-medium text-accent-emerald whitespace-nowrap">
                                +${group.userBalance.toFixed(2)}
                              </span>
                            </Link>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Groups Section */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-text">Your Groups</h3>
              <button
                onClick={() => setShowCreateGroup(true)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-emerald hover:bg-accent-emerald-dark text-white text-sm font-medium transition-all duration-200 hover:shadow-glow-emerald"
              >
                <Plus className="w-4 h-4" />
                New Group
              </button>
            </div>

            {groups.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No groups yet"
                description="Create your first group to start tracking shared expenses with friends, roommates, or travel buddies."
                action={{
                  label: 'Create Your First Group',
                  onClick: () => setShowCreateGroup(true),
                }}
              />
            ) : (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {groups.map((group: any) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    onClick={() => router.push(`/groups/${group.id}`)}
                  />
                ))}
              </motion.div>
            )}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileNav onCreateExpense={() => setShowCreateGroup(true)} />
      </div>

      {/* Create Group Dialog */}
      <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
        <DialogContent className="sm:max-w-md bg-primary-elevated border-border">
          <DialogHeader>
            <DialogTitle className="text-text">Create New Group</DialogTitle>
          </DialogHeader>
          <CreateGroupForm onSuccess={() => setShowCreateGroup(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GroupCard({ group, onClick }: { group: any; onClick: () => void }) {
  const balance = group.userBalance || 0;
  const isPositive = balance > 0;
  const isNegative = balance < 0;
  const currencySymbol = group.currencySymbol || '$';

  return (
    <motion.div
      variants={item}
      whileHover={{ y: -4 }}
      className="group bg-primary-elevated border border-border-subtle hover:border-accent-emerald/50 rounded-xl p-5 cursor-pointer transition-all duration-200"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-medium text-text truncate mb-1">
            {group.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-tertiary">
              {group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}
            </span>
            {group.role === 'admin' && (
              <Badge variant="emerald" size="sm">Admin</Badge>
            )}
          </div>
        </div>
        <div className="text-xl text-text-tertiary">
          {currencySymbol}
        </div>
      </div>

      {/* Balance */}
      <div className={`
        p-3 rounded-lg transition-colors
        ${isPositive
          ? 'bg-accent-emerald/10'
          : isNegative
            ? 'bg-accent-rose/10'
            : 'bg-primary-hover'
        }
      `}>
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-secondary">
            {isPositive ? "You're owed" : isNegative ? 'You owe' : 'Settled up'}
          </span>
          <span className={`
            font-semibold
            ${isPositive
              ? 'text-accent-emerald'
              : isNegative
                ? 'text-accent-rose'
                : 'text-text-tertiary'
            }
          `}>
            {isPositive && '+'}
            {currencySymbol}{Math.abs(balance).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Hover indicator */}
      <div className="mt-4 flex items-center justify-end text-xs text-text-tertiary group-hover:text-accent-emerald transition-colors">
        <span>View details</span>
        <ArrowRight className="w-3 h-3 ml-1" />
      </div>
    </motion.div>
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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-text mb-2">
          Group Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-3 border border-border rounded-xl bg-primary text-text placeholder-text-tertiary focus:border-accent-emerald focus:ring-1 focus:ring-accent-emerald/20 transition-all text-sm"
          placeholder="e.g., Roommates, Paris Trip"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text mb-2">
          Description <span className="text-text-tertiary">(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-3 border border-border rounded-xl bg-primary text-text placeholder-text-tertiary focus:border-accent-emerald focus:ring-1 focus:ring-accent-emerald/20 transition-all text-sm resize-none"
          placeholder="What's this group for?"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text mb-2">
          Currency
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <DollarSign className="w-4 h-4 text-text-tertiary" />
          </div>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-border rounded-xl bg-primary text-text focus:border-accent-emerald focus:ring-1 focus:ring-accent-emerald/20 appearance-none cursor-pointer transition-all text-sm"
            required
          >
            {CURRENCIES.map((curr) => (
              <option key={curr.code} value={curr.code}>
                {curr.symbol} {curr.name} ({curr.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={createGroupMutation.isPending || !name}
        className="w-full bg-accent-emerald hover:bg-accent-emerald-dark disabled:bg-accent-emerald/50 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:cursor-not-allowed"
      >
        {createGroupMutation.isPending ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Creating...
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" />
            Create Group
          </>
        )}
      </button>
    </form>
  );
}
