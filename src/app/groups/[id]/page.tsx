'use client';

import { useAuth } from '@/lib/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  ArrowLeft, Plus, Users, Receipt, Settings as SettingsIcon,
  LayoutGrid, CreditCard, UserCheck, Trash2, UserPlus, Check, X,
  AlertCircle, ChevronDown, Camera, Loader2, ArrowUpRight, ArrowDownRight,
  CheckCircle2, ArrowRight, MoreHorizontal, Mail
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { formatCurrency } from '@/lib/calculations';
import { CATEGORIES } from '@/lib/constants';
import Avatar from '@/components/shared/Avatar';
import Badge from '@/components/shared/Badge';
import EmptyState from '@/components/shared/EmptyState';
import ExpenseCard from '@/components/group/ExpenseCard';
import SettlementCard, { SettlementSuggestion } from '@/components/group/SettlementCard';

export default function GroupDetailPage() {
  const params = useParams();
  const groupId = params.id as string;
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'members' | 'settings'>('overview');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSettlement, setShowSettlement] = useState(false);
  const [settlementData, setSettlementData] = useState<any>(null);
  const [showAddMember, setShowAddMember] = useState(false);

  // Fetch group details
  const { data: group, isLoading: groupLoading } = useQuery({
    queryKey: ['group', groupId],
    queryFn: async () => {
      const res = await fetch(`/api/groups/${groupId}`);
      if (!res.ok) {
        if (res.status === 403 || res.status === 404) {
          router.push('/');
          throw new Error('Group not found or access denied');
        }
        throw new Error('Failed to fetch group');
      }
      return res.json();
    },
    enabled: !!groupId && !!user,
  });

  // Fetch expenses
  const { data: expenses = [] } = useQuery({
    queryKey: ['expenses', groupId],
    queryFn: async () => {
      const res = await fetch(`/api/groups/${groupId}/expenses`);
      if (!res.ok) throw new Error('Failed to fetch expenses');
      return res.json();
    },
    enabled: !!groupId && !!user,
  });

  // Fetch settlements
  const { data: settlements = [] } = useQuery({
    queryKey: ['settlements', groupId],
    queryFn: async () => {
      const res = await fetch(`/api/groups/${groupId}/settlements`);
      if (!res.ok) throw new Error('Failed to fetch settlements');
      return res.json();
    },
    enabled: !!groupId && !!user,
  });

  // Fetch balances
  const { data: balancesData } = useQuery({
    queryKey: ['balances', groupId],
    queryFn: async () => {
      const res = await fetch(`/api/groups/${groupId}/balances`);
      if (!res.ok) throw new Error('Failed to fetch balances');
      return res.json();
    },
    enabled: !!groupId && !!user,
  });

  const balances = balancesData?.balances || [];
  const suggestions = balancesData?.suggestions || [];
  const queryClient = useQueryClient();

  // Reminder mutation
  const sendReminderMutation = useMutation({
    mutationFn: async ({ userId, customMessage }: { userId: string; customMessage?: string }) => {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'reminder',
          userId,
          groupId,
          customMessage,
        }),
      });
      if (!res.ok) throw new Error('Failed to send reminder');
      return res.json();
    },
    onSuccess: () => {
      // Could show a toast notification here
    },
  });

  if (authLoading || groupLoading) {
    return <LoadingSkeleton />;
  }

  if (!group) {
    return null;
  }

  const currentMember = group.members.find((m: any) => m.user.id === user?.id);
  const isAdmin = currentMember?.role === 'admin';
  const userBalance = balances.find((b: any) => b.userId === user?.id);

  return (
    <div className="min-h-screen bg-primary">
      {/* Header */}
      <header className="bg-primary-elevated border-b border-border-subtle sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6">
          {/* Back button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-semibold text-text truncate">{group.name}</h1>
              {group.description && (
                <p className="text-sm text-text-secondary mt-1 line-clamp-1">{group.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5 text-sm text-text-tertiary">
                  <Users className="w-4 h-4" />
                  <span>{group.members.length}</span>
                </div>
                <div className="text-sm text-text-tertiary">
                  {group.currencySymbol} {group.currency}
                </div>
                {isAdmin && <Badge variant="emerald" size="sm">Admin</Badge>}
              </div>
            </div>

            <button
              onClick={() => setShowAddExpense(true)}
              className="hidden sm:flex items-center gap-2 bg-accent-emerald hover:bg-accent-emerald-dark text-white px-4 py-2.5 rounded-xl font-medium transition-all hover:shadow-glow-emerald"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 -mb-px overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutGrid },
              { id: 'expenses', label: 'Expenses', icon: CreditCard },
              { id: 'members', label: 'Members', icon: UserCheck },
              { id: 'settings', label: 'Settings', icon: SettingsIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'border-accent-emerald text-accent-emerald'
                    : 'border-transparent text-text-secondary hover:text-text'
                  }
                `}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6 sm:px-6 pb-24 sm:pb-6">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <OverviewTab
                group={group}
                user={user}
                userBalance={userBalance}
                balances={balances}
                suggestions={suggestions}
                expenses={expenses}
                settlements={settlements}
                onSettleUp={(suggestion: any) => {
                  setSettlementData(suggestion);
                  setShowSettlement(true);
                }}
                onRemind={(userId: string) => {
                  sendReminderMutation.mutate({ userId });
                }}
              />
            </motion.div>
          )}

          {activeTab === 'expenses' && (
            <motion.div
              key="expenses"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ExpensesTab
                group={group}
                expenses={expenses}
                settlements={settlements}
              />
            </motion.div>
          )}

          {activeTab === 'members' && (
            <motion.div
              key="members"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <MembersTab
                group={group}
                members={group.members}
                balances={balances}
                isAdmin={isAdmin}
                currentUserId={user?.id}
                onAddMember={() => setShowAddMember(true)}
              />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <SettingsTab group={group} isAdmin={isAdmin} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile FAB */}
      <button
        onClick={() => setShowAddExpense(true)}
        className="sm:hidden fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-accent-emerald hover:bg-accent-emerald-dark text-white flex items-center justify-center shadow-lg shadow-accent-emerald/30 active:scale-95 transition-all"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Add Expense Drawer */}
      <AddExpenseDrawer
        isOpen={showAddExpense}
        onClose={() => setShowAddExpense(false)}
        group={group}
        members={group.members}
      />

      {/* Settlement Drawer */}
      <SettlementDrawer
        isOpen={showSettlement}
        onClose={() => {
          setShowSettlement(false);
          setSettlementData(null);
        }}
        group={group}
        settlementData={settlementData}
        members={group.members}
      />

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        groupId={groupId}
      />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-primary">
      <div className="bg-primary-elevated border-b border-border-subtle px-4 py-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="h-4 w-24 bg-primary-hover rounded skeleton mb-4" />
          <div className="h-8 w-48 bg-primary-hover rounded skeleton mb-2" />
          <div className="h-4 w-32 bg-primary-hover rounded skeleton" />
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6">
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-primary-elevated rounded-xl skeleton" />
          ))}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ group, user, userBalance, balances, suggestions, expenses, settlements, onSettleUp, onRemind }: any) {
  const balance = userBalance?.balance || 0;

  // Get who owes user and who user owes
  const owedToUser = balances.filter((b: any) => b.userId !== user?.id && b.balance < 0);
  const userOwes = balances.filter((b: any) => b.userId !== user?.id && b.balance > 0);

  // Recent activity
  const recentActivity = [
    ...expenses.map((e: any) => ({ ...e, type: 'expense', sortDate: new Date(e.date) })),
    ...settlements.map((s: any) => ({ ...s, type: 'settlement', sortDate: new Date(s.date) }))
  ].sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Balance Summary */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Your Balance */}
        <div className={`
          p-5 rounded-xl border
          ${balance > 0
            ? 'bg-accent-emerald/5 border-accent-emerald/20'
            : balance < 0
              ? 'bg-accent-rose/5 border-accent-rose/20'
              : 'bg-primary-elevated border-border-subtle'
          }
        `}>
          <div className="flex items-center gap-2 mb-3">
            {balance > 0 ? (
              <ArrowUpRight className="w-5 h-5 text-accent-emerald" />
            ) : balance < 0 ? (
              <ArrowDownRight className="w-5 h-5 text-accent-rose" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-text-tertiary" />
            )}
            <span className="text-sm text-text-secondary">Your Balance</span>
          </div>
          <p className={`
            text-3xl font-semibold
            ${balance > 0
              ? 'text-accent-emerald'
              : balance < 0
                ? 'text-accent-rose'
                : 'text-text-tertiary'
            }
          `}>
            {balance >= 0 ? '+' : '-'}{group.currencySymbol}{Math.abs(balance).toFixed(2)}
          </p>
          <p className="text-sm text-text-tertiary mt-1">
            {balance > 0 ? "You're owed" : balance < 0 ? 'You owe' : 'All settled up'}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="p-5 rounded-xl bg-primary-elevated border border-border-subtle">
          <h3 className="text-sm font-medium text-text mb-4">Group Activity</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-semibold text-text">{expenses.length}</p>
              <p className="text-xs text-text-tertiary">Expenses</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-text">{settlements.length}</p>
              <p className="text-xs text-text-tertiary">Settlements</p>
            </div>
          </div>
        </div>
      </div>

      {/* Balance Breakdown */}
      {(owedToUser.length > 0 || userOwes.length > 0) && (
        <div className="p-5 rounded-xl bg-primary-elevated border border-border-subtle">
          <h3 className="text-sm font-medium text-text mb-4">Balance Details</h3>
          <div className="space-y-3">
            {owedToUser.map((b: any) => {
              const member = group.members.find((m: any) => m.user.id === b.userId);
              return (
                <div key={b.userId} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Avatar src={member?.user.image} name={member?.user.name} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-text">{member?.user.name}</p>
                      <p className="text-xs text-text-tertiary">owes you</p>
                    </div>
                  </div>
                  <span className="font-semibold text-accent-emerald">
                    +{group.currencySymbol}{Math.abs(b.balance).toFixed(2)}
                  </span>
                </div>
              );
            })}
            {userOwes.map((b: any) => {
              const member = group.members.find((m: any) => m.user.id === b.userId);
              return (
                <div key={b.userId} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Avatar src={member?.user.image} name={member?.user.name} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-text">{member?.user.name}</p>
                      <p className="text-xs text-text-tertiary">you owe</p>
                    </div>
                  </div>
                  <span className="font-semibold text-accent-rose">
                    -{group.currencySymbol}{Math.abs(b.balance).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Settlement Suggestions */}
      {suggestions.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-text mb-4">Suggested Settlements</h3>
          <div className="space-y-3">
            {suggestions.map((suggestion: any, idx: number) => (
              <SettlementSuggestion
                key={idx}
                suggestion={suggestion}
                currencySymbol={group.currencySymbol}
                onSettle={() => onSettleUp(suggestion)}
                onRemind={() => onRemind(suggestion.fromUserId)}
                currentUserId={user?.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-text mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((item: any) => (
              item.type === 'expense' ? (
                <ExpenseCard
                  key={item.id}
                  expense={item}
                  currencySymbol={group.currencySymbol}
                />
              ) : (
                <SettlementCard
                  key={item.id}
                  settlement={item}
                  currencySymbol={group.currencySymbol}
                />
              )
            ))}
          </div>
        </div>
      )}

      {recentActivity.length === 0 && (
        <EmptyState
          icon={Receipt}
          title="No activity yet"
          description="Add your first expense to start tracking"
        />
      )}
    </div>
  );
}

function ExpensesTab({ group, expenses, settlements }: any) {
  // Combine and sort all transactions
  const allTransactions = [
    ...expenses.map((e: any) => ({ ...e, type: 'expense', sortDate: new Date(e.date) })),
    ...settlements.map((s: any) => ({ ...s, type: 'settlement', sortDate: new Date(s.date) }))
  ].sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime());

  if (allTransactions.length === 0) {
    return (
      <EmptyState
        icon={CreditCard}
        title="No expenses yet"
        description="Add your first expense to start tracking"
      />
    );
  }

  return (
    <div className="space-y-3">
      {allTransactions.map((item: any) => (
        item.type === 'expense' ? (
          <ExpenseCard
            key={item.id}
            expense={item}
            currencySymbol={group.currencySymbol}
          />
        ) : (
          <SettlementCard
            key={item.id}
            settlement={item}
            currencySymbol={group.currencySymbol}
          />
        )
      ))}
    </div>
  );
}

function MembersTab({ group, members, balances, isAdmin, currentUserId, onAddMember }: any) {
  const queryClient = useQueryClient();

  const removeMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/groups/${group.id}/members/${userId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to remove member');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', group.id] });
    },
  });

  return (
    <div className="space-y-4">
      {isAdmin && (
        <button
          onClick={onAddMember}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-border hover:border-accent-emerald text-text-secondary hover:text-accent-emerald transition-all"
        >
          <UserPlus className="w-5 h-5" />
          <span className="font-medium">Add Member</span>
        </button>
      )}

      <div className="space-y-2">
        {members.map((member: any) => {
          const memberBalance = balances.find((b: any) => b.userId === member.user.id);
          const balance = memberBalance?.balance || 0;

          return (
            <div
              key={member.user.id}
              className="flex items-center justify-between p-4 rounded-xl bg-primary-elevated border border-border-subtle"
            >
              <div className="flex items-center gap-3">
                <Avatar src={member.user.image} name={member.user.name} size="md" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-text">{member.user.name}</p>
                    {member.role === 'admin' && (
                      <Badge variant="emerald" size="sm">Admin</Badge>
                    )}
                  </div>
                  <p className="text-xs text-text-tertiary">{member.user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className={`
                  text-sm font-medium
                  ${balance > 0
                    ? 'text-accent-emerald'
                    : balance < 0
                      ? 'text-accent-rose'
                      : 'text-text-tertiary'
                  }
                `}>
                  {balance >= 0 ? '+' : ''}{group.currencySymbol}{balance.toFixed(2)}
                </span>

                {isAdmin && member.user.id !== currentUserId && (
                  <button
                    onClick={() => removeMemberMutation.mutate(member.user.id)}
                    className="p-2 text-text-tertiary hover:text-accent-rose transition-colors"
                    disabled={removeMemberMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SettingsTab({ group, isAdmin }: any) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const updateGroupMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/groups/${group.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update group');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', group.id] });
    },
  });

  const deleteGroupMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/groups/${group.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete group');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      router.push('/');
    },
  });

  return (
    <div className="space-y-6">
      {/* Group Details */}
      <div className="p-5 rounded-xl bg-primary-elevated border border-border-subtle">
        <h3 className="font-medium text-text mb-4">Group Details</h3>
        <div className="space-y-4">
          <div>
            <Label className="text-text-secondary">Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isAdmin}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label className="text-text-secondary">Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={!isAdmin}
              className="mt-1.5"
              placeholder="Optional description"
            />
          </div>
          {isAdmin && (
            <Button
              onClick={() => updateGroupMutation.mutate({ name, description })}
              disabled={updateGroupMutation.isPending}
              className="w-full bg-accent-emerald hover:bg-accent-emerald-dark"
            >
              {updateGroupMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      {isAdmin && (
        <div className="p-5 rounded-xl bg-accent-rose/5 border border-accent-rose/20">
          <h3 className="font-medium text-accent-rose mb-2">Danger Zone</h3>
          <p className="text-sm text-text-secondary mb-4">
            Once you delete a group, there is no going back. All expenses and settlements will be permanently deleted.
          </p>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-accent-rose hover:bg-accent-rose-dark"
          >
            Delete Group
          </Button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-primary-elevated border-border">
          <DialogHeader>
            <DialogTitle className="text-text">Delete Group?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-text-secondary">
            Are you sure you want to delete "{group.name}"? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteGroupMutation.mutate()}
              disabled={deleteGroupMutation.isPending}
              className="bg-accent-rose hover:bg-accent-rose-dark"
            >
              {deleteGroupMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AddExpenseDrawer({ isOpen, onClose, group, members }: any) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Form state
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('other');
  const [paidBy, setPaidBy] = useState(user?.id || '');
  const [splitType, setSplitType] = useState<'equal' | 'custom' | 'percentage'>('equal');
  const [splitBetween, setSplitBetween] = useState<string[]>(members.map((m: any) => m.user.id));
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [percentages, setPercentages] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

  // Receipt scanning
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const [scannedData, setScannedData] = useState<any>(null);

  // Nested drawers
  const [showPaidByDrawer, setShowPaidByDrawer] = useState(false);
  const [showSplitDrawer, setShowSplitDrawer] = useState(false);

  const createExpenseMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/groups/${group.id}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create expense');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', group.id] });
      queryClient.invalidateQueries({ queryKey: ['balances', group.id] });
      resetForm();
      onClose();
    },
  });

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setCategory('other');
    setPaidBy(user?.id || '');
    setSplitType('equal');
    setSplitBetween(members.map((m: any) => m.user.id));
    setCustomAmounts({});
    setPercentages({});
    setFormError('');
    setScannedData(null);
  };

  const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    setScanError('');
    setScannedData(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUri = reader.result as string;

        try {
          const res = await fetch('/api/analyze-receipt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: dataUri }),
          });

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to analyze receipt');
          }

          const data = await res.json();
          setScannedData(data);
          setScanning(false);
        } catch (error: any) {
          setScanError(error.message || 'Could not analyze receipt. Please try again or enter manually.');
          setScanning(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setScanError('Could not analyze receipt. Please try again or enter manually.');
      setScanning(false);
    }
  };

  const useScannedData = () => {
    if (!scannedData) return;

    setAmount((scannedData.amount / 100).toFixed(2));
    if (scannedData.description) {
      setDescription(scannedData.description);
    } else if (scannedData.merchant) {
      setDescription(scannedData.merchant);
    }
    setScannedData(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setFormError('Please enter a valid amount');
      return;
    }

    if (!description.trim()) {
      setFormError('Please enter a description');
      return;
    }

    if (splitBetween.length === 0) {
      setFormError('Please select at least one person to split with');
      return;
    }

    // Calculate splits
    let splits: { userId: string; amount: number }[] = [];

    if (splitType === 'equal') {
      const perPerson = amountNum / splitBetween.length;
      splits = splitBetween.map(userId => ({
        userId,
        amount: Math.round(perPerson * 100) / 100,
      }));
    } else if (splitType === 'custom') {
      const total = splitBetween.reduce((sum, id) => sum + parseFloat(customAmounts[id] || '0'), 0);
      if (Math.abs(total - amountNum) > 0.01) {
        setFormError('Custom amounts must equal the total');
        return;
      }
      splits = splitBetween.map(userId => ({
        userId,
        amount: parseFloat(customAmounts[userId] || '0'),
      }));
    } else if (splitType === 'percentage') {
      const totalPct = splitBetween.reduce((sum, id) => sum + parseFloat(percentages[id] || '0'), 0);
      if (Math.abs(totalPct - 100) > 0.01) {
        setFormError('Percentages must equal 100%');
        return;
      }
      splits = splitBetween.map(userId => ({
        userId,
        amount: Math.round((parseFloat(percentages[userId] || '0') / 100) * amountNum * 100) / 100,
      }));
    }

    createExpenseMutation.mutate({
      amount: amountNum,
      description: description.trim(),
      category,
      payments: [{ userId: paidBy, amount: amountNum }],
      splitType,
      splitBetween,
      customSplits: splitType === 'custom' ? splits : undefined,
      percentageSplits: splitType === 'percentage' ? splitBetween.map(id => ({
        userId: id,
        percentage: parseFloat(percentages[id] || '0')
      })) : undefined,
    });
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-primary-elevated border-t border-border max-h-[90vh]">
        <div className="w-full max-w-md mx-auto px-4 py-6 overflow-y-auto">
          <DrawerHeader className="px-0 pb-4">
            <DrawerTitle className="text-text">Add Expense</DrawerTitle>
          </DrawerHeader>

          {/* Receipt Scanner */}
          <div className="mb-6">
            <input
              type="file"
              id="receipt-upload"
              className="hidden"
              accept="image/*"
              capture="environment"
              onChange={handleScanReceipt}
            />
            <label
              htmlFor="receipt-upload"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border border-dashed border-border hover:border-accent-emerald bg-primary hover:bg-primary-hover text-text-secondary hover:text-accent-emerald transition-all cursor-pointer"
            >
              <Camera className="w-5 h-5" />
              <span className="text-sm font-medium">Scan Receipt</span>
            </label>

            {/* Scanning state */}
            {scanning && (
              <div className="mt-3 p-4 rounded-xl bg-primary border border-border flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-accent-emerald animate-spin" />
                <div>
                  <p className="text-sm font-medium text-text">Analyzing receipt...</p>
                  <p className="text-xs text-text-tertiary">This may take a few seconds</p>
                </div>
              </div>
            )}

            {/* Scan error */}
            {scanError && (
              <div className="mt-3 p-4 rounded-xl bg-accent-rose/5 border border-accent-rose/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-accent-rose flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-text">{scanError}</p>
                  </div>
                  <button onClick={() => setScanError('')} className="text-text-tertiary hover:text-text">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Scanned data preview */}
            {scannedData && !scanning && (
              <div className="mt-3 p-4 rounded-xl bg-accent-emerald/5 border border-accent-emerald/20">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-accent-emerald" />
                    <span className="text-sm font-medium text-text">Receipt scanned</span>
                  </div>
                  <button onClick={() => setScannedData(null)} className="text-text-tertiary hover:text-text">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Amount:</span>
                    <span className="font-medium text-text">{group.currencySymbol}{(scannedData.amount / 100).toFixed(2)}</span>
                  </div>
                  {scannedData.description && (
                    <div className="flex justify-between">
                      <span className="text-text-tertiary">Description:</span>
                      <span className="font-medium text-text truncate ml-2">{scannedData.description}</span>
                    </div>
                  )}
                  {scannedData.items && scannedData.items.length > 0 && (
                    <div className="pt-2 border-t border-border-subtle">
                      <p className="text-xs text-text-tertiary mb-2">Items ({scannedData.items.length}):</p>
                      <div className="space-y-1 max-h-24 overflow-y-auto">
                        {scannedData.items.slice(0, 5).map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-xs">
                            <span className="text-text-secondary truncate">{item.quantity}x {item.name}</span>
                            <span className="text-text ml-2">{group.currencySymbol}{(item.price / 100).toFixed(2)}</span>
                          </div>
                        ))}
                        {scannedData.items.length > 5 && (
                          <p className="text-xs text-text-tertiary">+{scannedData.items.length - 5} more</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={useScannedData}
                  className="w-full mt-3 py-2 px-4 rounded-lg bg-accent-emerald hover:bg-accent-emerald-dark text-white text-sm font-medium transition-colors"
                >
                  Use These Details
                </button>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Amount */}
            <div className="flex flex-col items-center py-4">
              <label className="text-xs text-text-tertiary mb-2">Amount</label>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-semibold text-text-tertiary">{group.currencySymbol}</span>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-transparent border-none outline-none text-4xl font-semibold text-text placeholder-text-tertiary w-32 text-center"
                  placeholder="0"
                  required
                />
              </div>
              <div className="h-0.5 w-24 mt-2 bg-border rounded-full" />
            </div>

            {/* Description */}
            <div>
              <Label className="text-text-secondary">Description</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What was this for?"
                className="mt-1.5"
                required
              />
            </div>

            {/* Category */}
            <div>
              <Label className="text-text-secondary">Category</Label>
              <div className="flex gap-2 mt-2 overflow-x-auto pb-2 no-scrollbar">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`
                      flex flex-col items-center gap-1 px-3 py-2 rounded-lg border transition-all min-w-[70px]
                      ${category === cat.id
                        ? 'bg-accent-emerald/10 border-accent-emerald text-accent-emerald'
                        : 'bg-primary border-border-subtle text-text-secondary hover:border-border'
                      }
                    `}
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <span className="text-[10px] font-medium">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Paid by & Split */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-text-secondary">Paid by</Label>
                <button
                  type="button"
                  onClick={() => setShowPaidByDrawer(true)}
                  className="w-full mt-1.5 px-3 py-2.5 rounded-lg border border-border bg-primary text-sm text-text flex items-center justify-between hover:border-text-tertiary transition-colors"
                >
                  <span className="truncate">
                    {members.find((m: any) => m.user.id === paidBy)?.user.name || 'Select'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-text-tertiary" />
                </button>
              </div>

              <div>
                <Label className="text-text-secondary">Split</Label>
                <button
                  type="button"
                  onClick={() => setShowSplitDrawer(true)}
                  className="w-full mt-1.5 px-3 py-2.5 rounded-lg border border-border bg-primary text-sm text-text flex items-center justify-between hover:border-text-tertiary transition-colors"
                >
                  <span>
                    {splitType === 'equal' && 'Equally'}
                    {splitType === 'custom' && 'Custom'}
                    {splitType === 'percentage' && 'Percent'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-text-tertiary" />
                </button>
              </div>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-accent-rose/10 border border-accent-rose/20 text-sm text-accent-rose">
                {formError}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => { resetForm(); onClose(); }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createExpenseMutation.isPending || !amount || !description}
                className="flex-1 bg-accent-emerald hover:bg-accent-emerald-dark"
              >
                {createExpenseMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Paid By Drawer */}
        <Drawer open={showPaidByDrawer} onOpenChange={setShowPaidByDrawer}>
          <DrawerContent className="bg-primary border-t border-border">
            <div className="w-full max-w-md mx-auto px-4 py-6">
              <DrawerTitle className="text-text mb-4">Who paid?</DrawerTitle>
              <RadioGroup value={paidBy} onValueChange={(v) => { setPaidBy(v); setShowPaidByDrawer(false); }}>
                <div className="space-y-2">
                  {members.map((member: any) => (
                    <div key={member.user.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary-hover">
                      <RadioGroupItem value={member.user.id} id={`paidby-${member.user.id}`} />
                      <label htmlFor={`paidby-${member.user.id}`} className="flex-1 flex items-center gap-3 cursor-pointer">
                        <Avatar src={member.user.image} name={member.user.name} size="sm" />
                        <span className="text-sm text-text">{member.user.name}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          </DrawerContent>
        </Drawer>

        {/* Split Drawer */}
        <Drawer open={showSplitDrawer} onOpenChange={setShowSplitDrawer}>
          <DrawerContent className="bg-primary border-t border-border max-h-[80vh]">
            <div className="w-full max-w-md mx-auto px-4 py-6 overflow-y-auto">
              <DrawerTitle className="text-text mb-4">Configure Split</DrawerTitle>

              {/* Split type selector */}
              <div className="space-y-2 mb-4">
                {[
                  { id: 'equal', label: 'Split Equally', desc: 'Divide equally among members' },
                  { id: 'custom', label: 'Custom Amounts', desc: 'Enter exact amount per person' },
                  { id: 'percentage', label: 'Percentages', desc: 'Split by percentage' },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSplitType(type.id as any)}
                    className={`
                      w-full p-3 rounded-lg border text-left transition-colors
                      ${splitType === type.id
                        ? 'bg-accent-emerald/10 border-accent-emerald'
                        : 'bg-primary-elevated border-border-subtle hover:border-border'
                      }
                    `}
                  >
                    <p className={`text-sm font-medium ${splitType === type.id ? 'text-accent-emerald' : 'text-text'}`}>
                      {type.label}
                    </p>
                    <p className="text-xs text-text-tertiary">{type.desc}</p>
                  </button>
                ))}
              </div>

              {/* Member selection / amounts */}
              <div className="space-y-2 pt-4 border-t border-border-subtle">
                <p className="text-sm font-medium text-text mb-2">
                  {splitType === 'equal' ? 'Split between:' : 'Enter amounts:'}
                </p>

                {members.map((member: any) => {
                  const isSelected = splitBetween.includes(member.user.id);
                  const perPerson = splitBetween.length > 0 ? parseFloat(amount || '0') / splitBetween.length : 0;

                  return (
                    <div key={member.user.id} className="flex items-center gap-3 p-2 rounded-lg">
                      {splitType === 'equal' && (
                        <>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSplitBetween([...splitBetween, member.user.id]);
                              } else {
                                setSplitBetween(splitBetween.filter(id => id !== member.user.id));
                              }
                            }}
                          />
                          <span className="flex-1 text-sm text-text">{member.user.name}</span>
                          {isSelected && amount && (
                            <span className="text-sm text-text-secondary">
                              {group.currencySymbol}{perPerson.toFixed(2)}
                            </span>
                          )}
                        </>
                      )}

                      {splitType === 'custom' && isSelected && (
                        <>
                          <span className="flex-1 text-sm text-text">{member.user.name}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-text-tertiary">{group.currencySymbol}</span>
                            <input
                              type="number"
                              step="0.01"
                              value={customAmounts[member.user.id] || ''}
                              onChange={(e) => setCustomAmounts({ ...customAmounts, [member.user.id]: e.target.value })}
                              className="w-20 px-2 py-1 rounded border border-border bg-primary-elevated text-sm text-text"
                              placeholder="0"
                            />
                          </div>
                        </>
                      )}

                      {splitType === 'percentage' && isSelected && (
                        <>
                          <span className="flex-1 text-sm text-text">{member.user.name}</span>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="0.1"
                              value={percentages[member.user.id] || ''}
                              onChange={(e) => setPercentages({ ...percentages, [member.user.id]: e.target.value })}
                              className="w-16 px-2 py-1 rounded border border-border bg-primary-elevated text-sm text-text"
                              placeholder="0"
                            />
                            <span className="text-sm text-text-tertiary">%</span>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              <Button
                onClick={() => setShowSplitDrawer(false)}
                className="w-full mt-4 bg-accent-emerald hover:bg-accent-emerald-dark"
              >
                Done
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
      </DrawerContent>
    </Drawer>
  );
}

function SettlementDrawer({ isOpen, onClose, group, settlementData, members }: any) {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Reset amount when settlement data changes
  useEffect(() => {
    if (settlementData) {
      setAmount(settlementData.amount.toFixed(2));
      setError('');
    }
  }, [settlementData]);

  const maxAmount = settlementData?.amount || 0;
  const currentAmount = parseFloat(amount) || 0;
  const isPartialPayment = currentAmount < maxAmount && currentAmount > 0;
  const remainingAmount = maxAmount - currentAmount;

  const validateAmount = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid amount');
      return false;
    }
    if (num > maxAmount) {
      setError(`Amount cannot exceed ${group.currencySymbol}${maxAmount.toFixed(2)}`);
      return false;
    }
    setError('');
    return true;
  };

  const createSettlementMutation = useMutation({
    mutationFn: async () => {
      if (!validateAmount(amount)) {
        throw new Error('Invalid amount');
      }
      const res = await fetch(`/api/groups/${group.id}/settlements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserId: settlementData.fromUserId,
          toUserId: settlementData.toUserId,
          amount: parseFloat(amount),
        }),
      });
      if (!res.ok) throw new Error('Failed to create settlement');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settlements', group.id] });
      queryClient.invalidateQueries({ queryKey: ['balances', group.id] });
      onClose();
    },
  });

  if (!settlementData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-primary-elevated border-border">
        <DialogHeader>
          <DialogTitle className="text-text">Record Settlement</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Avatar name={settlementData.fromUserName} size="lg" />
              <div>
                <p className="font-medium text-text">{settlementData.fromUserName}</p>
                <p className="text-xs text-text-tertiary">pays</p>
              </div>
            </div>

            <ArrowRight className="w-6 h-6 text-accent-emerald" />

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-medium text-text">{settlementData.toUserName}</p>
                <p className="text-xs text-text-tertiary">receives</p>
              </div>
              <Avatar name={settlementData.toUserName} size="lg" />
            </div>
          </div>

          {/* Editable Amount */}
          <div className="space-y-3">
            <div className="text-center">
              <label className="text-xs text-text-tertiary block mb-2">Settlement Amount</label>
              <div className="relative inline-flex items-center">
                <span className="text-2xl font-semibold text-text-secondary mr-1">{group.currencySymbol}</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    if (e.target.value) validateAmount(e.target.value);
                  }}
                  className="text-3xl font-semibold text-accent-emerald bg-transparent border-b-2 border-accent-emerald/30 focus:border-accent-emerald outline-none text-center w-32"
                  step="0.01"
                  min="0.01"
                  max={maxAmount}
                />
              </div>
              {error && (
                <p className="text-xs text-accent-rose mt-2">{error}</p>
              )}
            </div>

            <div className="text-center text-sm text-text-tertiary">
              <p>Suggested: {group.currencySymbol}{maxAmount.toFixed(2)}</p>
              {isPartialPayment && (
                <p className="text-accent-amber mt-1">
                  Remaining after payment: {group.currencySymbol}{remainingAmount.toFixed(2)}
                </p>
              )}
            </div>

            {/* Quick amount buttons */}
            <div className="flex justify-center gap-2 mt-3">
              <button
                onClick={() => {
                  setAmount(maxAmount.toFixed(2));
                  setError('');
                }}
                className="px-3 py-1 text-xs rounded-full bg-accent-emerald/10 text-accent-emerald hover:bg-accent-emerald/20 transition-colors"
              >
                Full Amount
              </button>
              <button
                onClick={() => {
                  setAmount((maxAmount / 2).toFixed(2));
                  setError('');
                }}
                className="px-3 py-1 text-xs rounded-full bg-primary-hover text-text-secondary hover:bg-primary-elevated transition-colors"
              >
                Half
              </button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => createSettlementMutation.mutate()}
            disabled={createSettlementMutation.isPending || !!error || !amount}
            className="bg-accent-emerald hover:bg-accent-emerald-dark"
          >
            {createSettlementMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isPartialPayment ? (
              'Record Partial Payment'
            ) : (
              'Confirm Settlement'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddMemberModal({ isOpen, onClose, groupId }: any) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const searchUsers = async (query: string) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const users = await res.json();
        setSearchResults(users);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const addMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error('Failed to add member');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      setEmail('');
      setSearchResults([]);
      onClose();
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-primary-elevated border-border">
        <DialogHeader>
          <DialogTitle className="text-text">Add Member</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-text-secondary">Search by email</Label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
              <Input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  searchUsers(e.target.value);
                }}
                placeholder="Enter email address"
                className="pl-10"
              />
            </div>
          </div>

          {/* Search results */}
          {searching && (
            <div className="flex items-center gap-2 text-sm text-text-tertiary">
              <Loader2 className="w-4 h-4 animate-spin" />
              Searching...
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-primary border border-border-subtle"
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={user.image} name={user.name} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-text">{user.name}</p>
                      <p className="text-xs text-text-tertiary">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => addMemberMutation.mutate(user.id)}
                    disabled={addMemberMutation.isPending}
                    className="bg-accent-emerald hover:bg-accent-emerald-dark"
                  >
                    Add
                  </Button>
                </div>
              ))}
            </div>
          )}

          {email.length >= 3 && !searching && searchResults.length === 0 && (
            <p className="text-sm text-text-tertiary text-center py-4">
              No users found with that email
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
