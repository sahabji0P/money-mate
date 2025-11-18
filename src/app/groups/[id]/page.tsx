'use client';

import { useAuth } from '@/lib/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useParams } from 'next/navigation';
import { useState } from 'react';
import {
  ArrowLeft, Plus, Users, Receipt, Settings as SettingsIcon,
  TrendingUp, LayoutGrid, CreditCard, UserCheck, Download,
  Trash2, UserPlus, Check, X, AlertCircle, ChevronDown, Camera, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerTrigger, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { formatCurrency } from '@/lib/calculations';
import { CATEGORIES } from '@/lib/constants';

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
      <header className="border-b border-border-subtle px-4 py-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-text-secondary hover:text-text transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Back to groups</span>
            </Link>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text mb-1">{group.name}</h1>
              {group.description && (
                <p className="text-sm text-text-secondary">{group.description}</p>
              )}
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                  <Users className="w-4 h-4" />
                  <span>{group.members.length} members</span>
                </div>
                <span className="text-gray-600">•</span>
                <div className="text-sm text-text-secondary">
                  {group.currencySymbol} {group.currency}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowAddExpense(true)}
              className="hidden sm:flex items-center gap-2 bg-text hover:bg-text/90 text-primary px-6 py-2.5 rounded-xl font-semibold transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Expense
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Tabs */}
      <div className="hidden sm:block border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)}>
            <TabsList className="bg-transparent">
              <TabsTrigger value="overview" className="gap-2">
                <LayoutGrid className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="expenses" className="gap-2">
                <CreditCard className="w-4 h-4" />
                Expenses
              </TabsTrigger>
              <TabsTrigger value="members" className="gap-2">
                <UserCheck className="w-4 h-4" />
                Members
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <SettingsIcon className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 pb-24 sm:pb-6">
        {activeTab === 'overview' && (
          <OverviewTab
            group={group}
            user={user}
            userBalance={userBalance}
            suggestions={suggestions}
            expenses={expenses}
            settlements={settlements}
            onSettleUp={(suggestion) => {
              setSettlementData(suggestion);
              setShowSettlement(true);
            }}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesTab
            group={group}
            expenses={expenses}
            settlements={settlements}
          />
        )}

        {activeTab === 'members' && (
          <MembersTab
            group={group}
            members={group.members}
            isAdmin={isAdmin}
            currentUserId={user?.id}
            onAddMember={() => setShowAddMember(true)}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            group={group}
            isAdmin={isAdmin}
          />
        )}
      </main>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAddExpense={() => setShowAddExpense(true)}
      />

      {/* Mobile Floating Add Button */}
      <button
        onClick={() => setShowAddExpense(true)}
        className="sm:hidden fixed bottom-20 right-6 b-safe-4 r-safe-4 z-40 w-14 h-14 rounded-full bg-text hover:bg-text/90 text-primary flex items-center justify-center shadow-lg transition-all"
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
      <div className="border-b border-border-subtle px-4 py-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-32 bg-gray-800 rounded skeleton mb-4" />
          <div className="h-10 w-64 bg-gray-800 rounded skeleton mb-2" />
          <div className="h-4 w-48 bg-gray-800 rounded skeleton" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-800 rounded-xl skeleton" />
          ))}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ group, user, userBalance, suggestions, expenses, settlements, onSettleUp }: any) {
  const balance = userBalance?.balance || 0;
  const balanceText = balance > 0 ? 'You are owed' : balance < 0 ? 'You owe' : 'Settled up';
  const balanceColor = balance > 0 ? 'text-text' : balance < 0 ? 'text-red-400' : 'text-text-secondary';

  // Combine and sort transactions
  const transactions = [
    ...expenses.map((e: any) => ({ ...e, type: 'expense', date: new Date(e.date) })),
    ...settlements.map((s: any) => ({ ...s, type: 'settlement', date: new Date(s.date) }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* User Balance Card */}
      <div className="bg-gradient-to-br from-[#111827] to-[#0F172A] border border-border-subtle rounded-2xl p-6">
        <p className="text-sm text-text-secondary mb-2">Your balance</p>
        <p className={`text-4xl font-bold ${balance === 0 ? 'text-text-secondary' : 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300'}`}>
          {balance > 0 ? '+' : ''}{formatCurrency(Math.abs(balance), group.currencySymbol)}
        </p>
        <p className={`text-sm ${balanceColor} mt-1`}>{balanceText}</p>
      </div>

      {/* Settlement Suggestions */}
      {suggestions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-text mb-4">Suggested settlements</h3>
          <div className="space-y-3">
            {suggestions.map((suggestion: any, idx: number) => (
              <div
                key={idx}
                className="bg-primary-elevated border border-border-subtle rounded-xl p-4 flex items-center justify-between hover:border-border transition-colors"
              >
                <div>
                  <p className="text-text font-medium">
                    {suggestion.fromName} → {suggestion.toName}
                  </p>
                  <p className="text-2xl font-bold text-text mt-1">
                    {formatCurrency(suggestion.amount, group.currencySymbol)}
                  </p>
                </div>
                <button
                  onClick={() => onSettleUp(suggestion)}
                  className="bg-text hover:bg-text/90 text-primary px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
                >
                  Settle up
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {transactions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-text mb-4">Recent activity</h3>
          <div className="space-y-3">
            {transactions.map((transaction: any) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                group={group}
                currentUserId={user?.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Export Data */}
      <div className="bg-primary-elevated border border-border-subtle rounded-xl p-6">
        <h3 className="text-lg font-semibold text-text mb-2">Export data</h3>
        <p className="text-sm text-text-secondary mb-4">
          Download all group transactions and balances
        </p>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-primary-elevated hover:bg-primary-hover text-text border border-border px-4 py-2 rounded-lg font-semibold transition-colors text-sm">
            <Download className="w-4 h-4" />
            Export JSON
          </button>
          <button className="flex items-center gap-2 bg-primary-elevated hover:bg-primary-hover text-text border border-border px-4 py-2 rounded-lg font-semibold transition-colors text-sm">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}

function ExpensesTab({ group, expenses, settlements }: any) {
  // Combine and sort all transactions
  const transactions = [
    ...expenses.map((e: any) => ({ ...e, type: 'expense', date: new Date(e.date) })),
    ...settlements.map((s: any) => ({ ...s, type: 'settlement', date: new Date(s.date) }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  if (transactions.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-primary-elevated rounded-full flex items-center justify-center mx-auto mb-4">
          <Receipt className="w-10 h-10 text-text" />
        </div>
        <h3 className="text-xl font-semibold text-text mb-2">No transactions yet</h3>
        <p className="text-text-secondary">Add your first expense to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction: any) => (
        <TransactionCard
          key={transaction.id}
          transaction={transaction}
          group={group}
        />
      ))}
    </div>
  );
}

function TransactionCard({ transaction, group, currentUserId }: any) {
  if (transaction.type === 'expense') {
    const category = CATEGORIES.find(c => c.id === transaction.category) || CATEGORIES[5];
    const paidByText = transaction.payments.length === 1
      ? transaction.payments[0].user.name
      : `${transaction.payments.length} people`;
    const splitCount = transaction.splits.length;

    return (
      <div className="bg-primary-elevated border border-border-subtle rounded-xl p-4 hover:border-gray-700 transition-colors">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-start gap-3">
            <div className="text-2xl">{category.icon}</div>
            <div>
              <h4 className="text-text font-medium">{transaction.description}</h4>
              <p className="text-sm text-text-secondary mt-0.5">
                Paid by {paidByText} • Split between {splitCount} {splitCount === 1 ? 'person' : 'people'}
              </p>
              <p className="text-xs text-text-tertiary mt-1">
                {new Date(transaction.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-text">
              {formatCurrency(transaction.amount, group.currencySymbol)}
            </p>
          </div>
        </div>
      </div>
    );
  } else {
    // Settlement
    return (
      <div className="bg-primary-elevated border border-blue-900/30 rounded-xl p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-medium">
                  Settlement
                </span>
              </div>
              <p className="text-text font-medium mt-1">
                {transaction.fromUser.name} paid {transaction.toUser.name}
              </p>
              <p className="text-xs text-text-tertiary mt-1">
                {new Date(transaction.date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-blue-400">
              {formatCurrency(transaction.amount, group.currencySymbol)}
            </p>
          </div>
        </div>
      </div>
    );
  }
}

function MembersTab({ group, members, isAdmin, currentUserId, onAddMember }: any) {
  const queryClient = useQueryClient();

  const removeMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/groups/${group.id}/members/${userId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to remove member');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', group.id] });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text">
          {members.length} {members.length === 1 ? 'member' : 'members'}
        </h3>
        {isAdmin && (
          <button
            onClick={onAddMember}
            className="flex items-center gap-2 bg-text hover:bg-text/90 text-primary px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
          >
            <UserPlus className="w-4 h-4" />
            Add Member
          </button>
        )}
      </div>

      <div className="space-y-3">
        {members.map((member: any) => (
          <div
            key={member.id}
            className="bg-primary-elevated border border-border-subtle rounded-xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              {member.user.image ? (
                <img
                  src={member.user.image}
                  alt={member.user.name || ''}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-text rounded-full flex items-center justify-center">
                  <span className="text-text font-semibold">
                    {member.user.name?.[0] || member.user.email[0].toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="text-text font-medium">{member.user.name || 'Unknown'}</p>
                <p className="text-sm text-text-secondary">{member.user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {member.role === 'admin' && (
                <span className="inline-flex items-center text-xs bg-primary-elevated text-text px-2 py-1 rounded-full">
                  Admin
                </span>
              )}
              {(isAdmin || member.user.id === currentUserId) && member.user.id !== currentUserId && (
                <button
                  onClick={() => {
                    if (confirm('Remove this member from the group?')) {
                      removeMemberMutation.mutate(member.user.id);
                    }
                  }}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsTab({ group, isAdmin }: any) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || '');

  const updateGroupMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/groups/${group.id}`, {
        method: 'PUT',
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
      return res.json();
    },
    onSuccess: () => {
      router.push('/');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    updateGroupMutation.mutate({ name, description });
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="group-name">Group Name</Label>
          <Input
            id="group-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!isAdmin}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="group-description">Description</Label>
          <textarea
            id="group-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={!isAdmin}
            className="mt-2 w-full px-4 py-2.5 border-2 border-border rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-text bg-primary-elevated text-text placeholder-text-tertiary transition-all text-sm resize-none"
            rows={3}
          />
        </div>

        {isAdmin && (
          <Button
            type="submit"
            disabled={updateGroupMutation.isPending}
            className="w-full sm:w-auto"
          >
            {updateGroupMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
      </form>

      {isAdmin && (
        <div className="border-t border-border-subtle pt-6">
          <h3 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h3>
          <p className="text-sm text-text-secondary mb-4">
            Once you delete a group, there is no going back. Please be certain.
          </p>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
                deleteGroupMutation.mutate();
              }
            }}
            disabled={deleteGroupMutation.isPending}
            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4" />
            {deleteGroupMutation.isPending ? 'Deleting...' : 'Delete Group'}
          </button>
        </div>
      )}
    </div>
  );
}

function AddExpenseDrawer({ isOpen, onClose, group, members }: any) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [paidBy, setPaidBy] = useState(user?.id || '');
  const [splitBetween, setSplitBetween] = useState<string[]>(members.map((m: any) => m.user.id));
  const [splitType, setSplitType] = useState<'equal' | 'custom' | 'percentage'>('equal');
  const [exactValues, setExactValues] = useState<Record<string, string>>({});
  const [percentValues, setPercentValues] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>('');
  const [splitDrawerOpen, setSplitDrawerOpen] = useState(false);
  const [paidByDrawerOpen, setPaidByDrawerOpen] = useState(false);
  const [paidByMultiple, setPaidByMultiple] = useState<Record<string, string>>({});
  const [isMultiplePayers, setIsMultiplePayers] = useState(false);

  // Bill scanning state
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [scanError, setScanError] = useState('');

  const createExpenseMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/groups/${group.id}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create expense');
      }
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
    setDescription('');
    setAmount('');
    setCategory('');
    setPaidBy(user?.id || '');
    setSplitBetween(members.map((m: any) => m.user.id));
    setSplitType('equal');
    setExactValues({});
    setPercentValues({});
    setPaidByMultiple({});
    setIsMultiplePayers(false);
    setFormError('');
    setScannedData(null);
    setScanError('');
  };

  const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setScanError('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setScanError('Image must be less than 10MB');
      return;
    }

    setScanning(true);
    setScanError('');
    setScannedData(null);

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64Image = reader.result as string;

          // Call analyze-receipt API
          const res = await fetch('/api/analyze-receipt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Image }),
          });

          const data = await res.json();

          if (!res.ok) {
            setScanError(data.error || 'Failed to analyze receipt');
            setScanning(false);
            return;
          }

          setScannedData(data);
          setScanning(false);
        } catch (error) {
          setScanError('Failed to analyze receipt. Please try again.');
          setScanning(false);
        }
      };

      reader.onerror = () => {
        setScanError('Failed to read image file');
        setScanning(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      setScanError('Failed to process image');
      setScanning(false);
    }

    // Reset file input
    e.target.value = '';
  };

  const useScannedData = () => {
    if (!scannedData) return;

    // Populate form with scanned data
    setAmount((scannedData.amount / 100).toFixed(2));
    setDescription(scannedData.description);

    // Close the scanned data card
    setScannedData(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const hasMultiplePayers = Object.keys(paidByMultiple).length > 0;
    if (!hasMultiplePayers && !paidBy) {
      setFormError('Please select who paid.');
      return;
    }

    if (!description || !amount || splitBetween.length === 0) {
      setFormError('Please fill all required fields and select at least one member.');
      return;
    }

    try {
      const totalCents = Math.round(parseFloat(amount) * 100);
      if (!isFinite(totalCents) || totalCents <= 0) {
        setFormError('Enter a valid amount.');
        return;
      }

      // Validate multiple payers if applicable
      if (hasMultiplePayers) {
        const paidTotal = Object.values(paidByMultiple).reduce((sum, val) => {
          return sum + Math.round(parseFloat(val || '0') * 100);
        }, 0);
        if (Math.abs(paidTotal - totalCents) > 1) {
          setFormError('Paid amounts must add up to the total amount.');
          return;
        }
      }

      // Validate split data before sending
      if (splitType === 'custom') {
        let sum = 0;
        splitBetween.forEach((id) => {
          const v = Math.round(parseFloat(exactValues[id] || '0') * 100);
          sum += v;
        });
        if (sum !== totalCents) {
          setFormError('Exact amounts must add up to the total amount.');
          return;
        }
      } else if (splitType === 'percentage') {
        let pctSum = 0;
        splitBetween.forEach((id) => {
          const p = parseFloat(percentValues[id] || '0');
          pctSum += isFinite(p) ? p : 0;
        });
        if (Math.abs(pctSum - 100) > 0.01) {
          setFormError('Percentages must add up to 100%.');
          return;
        }
      }

      // Prepare payment data
      const payments = hasMultiplePayers
        ? Object.entries(paidByMultiple).map(([userId, amt]) => ({
            userId,
            amount: Math.round(parseFloat(amt) * 100)
          }))
        : [{ userId: paidBy, amount: totalCents }];

      // Prepare request body based on split type
      const requestData: any = {
        description,
        amount: totalCents,
        category: category || 'other',
        date: new Date().toISOString(),
        splitType,
        payments,
      };

      // Add the correct field based on splitType
      if (splitType === 'equal') {
        requestData.splitBetween = splitBetween;
      } else if (splitType === 'custom') {
        requestData.customSplits = splitBetween.map((id) => ({
          userId: id,
          amount: Math.round(parseFloat(exactValues[id] || '0') * 100)
        }));
      } else if (splitType === 'percentage') {
        requestData.percentageSplits = splitBetween.map((id) => ({
          userId: id,
          percentage: parseFloat(percentValues[id] || '0')
        }));
      }

      await createExpenseMutation.mutateAsync(requestData);
    } catch (error: any) {
      console.error('Failed to add expense:', error);
      setFormError(error.message || 'Failed to create expense');
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DrawerContent className="bg-primary-elevated border-t border-border">
        <div className="w-full max-w-md mx-auto px-4 py-6 pb-12 max-h-[75dvh] overflow-y-auto overscroll-contain">
          <DrawerHeader className="px-0">
            <DrawerTitle className="text-xl font-bold text-text">Add Expense</DrawerTitle>
          </DrawerHeader>

          {/* Scan Receipt Section */}
          <div className="mt-4 mb-6">
            <input
              type="file"
              id="receipt-upload"
              className="hidden"
              accept="image/*"
              onChange={handleScanReceipt}
            />
            <label
              htmlFor="receipt-upload"
              className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-primary-elevated border border-border rounded-xl hover:bg-primary-hover transition-all duration-base cursor-pointer"
            >
              <Camera className="w-5 h-5 text-text-secondary" />
              <span className="text-sm font-medium text-text">Scan Receipt</span>
            </label>

            {/* Scanning Loading State */}
            {scanning && (
              <div className="mt-4 p-4 bg-primary-hover border border-border rounded-xl flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-text animate-spin" />
                <div>
                  <p className="text-sm font-medium text-text">Analyzing receipt...</p>
                  <p className="text-xs text-text-secondary mt-1">This will take a few seconds</p>
                </div>
              </div>
            )}

            {/* Scan Error */}
            {scanError && (
              <div className="mt-4 p-4 bg-primary-elevated border border-border rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-text-secondary flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text">Couldn't read receipt</p>
                    <p className="text-xs text-text-secondary mt-1">{scanError}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setScanError('')}
                    className="text-text-secondary hover:text-text transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Scanned Data Preview */}
            {scannedData && !scanning && (
              <div className="mt-4 p-4 bg-primary-elevated border border-border rounded-xl space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-text flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-text">Receipt scanned successfully</p>
                      <p className="text-xs text-text-secondary mt-1">Review and use details below</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setScannedData(null)}
                    className="text-text-secondary hover:text-text transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 pt-2 border-t border-border-subtle">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-secondary">Amount:</span>
                    <span className="text-sm font-medium text-text">{group.currencySymbol}{(scannedData.amount / 100).toFixed(2)}</span>
                  </div>
                  {scannedData.description && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-text-secondary">Description:</span>
                      <span className="text-sm font-medium text-text">{scannedData.description}</span>
                    </div>
                  )}
                  {scannedData.merchant && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-text-secondary">Merchant:</span>
                      <span className="text-sm font-medium text-text">{scannedData.merchant}</span>
                    </div>
                  )}
                  {scannedData.items && scannedData.items.length > 0 && (
                    <div className="pt-2 border-t border-border-subtle">
                      <p className="text-xs text-text-secondary mb-2">Items:</p>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {scannedData.items.slice(0, 5).map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-xs">
                            <span className="text-text-secondary">{item.name}</span>
                            <span className="text-text">{group.currencySymbol}{(item.price / 100).toFixed(2)}</span>
                          </div>
                        ))}
                        {scannedData.items.length > 5 && (
                          <p className="text-xs text-text-tertiary italic">+{scannedData.items.length - 5} more items</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={useScannedData}
                  className="w-full py-2.5 px-4 bg-text hover:bg-text/90 text-primary font-medium rounded-xl transition-all duration-base flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Use These Details
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            {/* Amount - Prominent centered display */}
            <div className="flex flex-col items-center py-4">
              <label className="text-sm font-medium text-text/50 mb-3">
                Enter Amount
              </label>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl font-bold text-text/60">
                  {group.currencySymbol}
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-transparent border-none outline-none text-4xl font-bold text-text placeholder-text-tertiary w-auto min-w-[100px] max-w-[200px] text-left focus:text-text transition-colors"
                  placeholder="0"
                  required
                  autoFocus
                  style={{ width: `${Math.max(3, (amount || '0').toString().length)}ch` }}
                />
              </div>
              <div className="h-1 w-24 mt-3 bg-text/30 rounded-full" />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-text/60 mb-2">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-border rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-text bg-primary-elevated text-text placeholder-text-tertiary transition-all text-sm"
                placeholder="e.g., Dinner, Gas"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Category
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(isSelected ? '' : cat.id)}
                      className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border-2 transition-all min-w-[80px] ${
                        isSelected
                          ? 'bg-text border-text text-text'
                          : 'bg-primary-elevated border-border text-text/70 hover:bg-primary-elevated hover:border-border'
                      }`}
                    >
                      <span className="text-2xl">{cat.icon}</span>
                      <span className="text-xs font-medium">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Paid by and Split fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Paid by *
                </label>
                <button
                  type="button"
                  onClick={() => setPaidByDrawerOpen(true)}
                  disabled={!amount || parseFloat(amount) <= 0}
                  className="w-full px-4 py-2.5 border-2 border-border rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-text bg-primary-elevated text-text transition-all text-sm flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="truncate">
                    {isMultiplePayers
                      ? `${Object.keys(paidByMultiple).filter(k => paidByMultiple[k] && parseFloat(paidByMultiple[k]) > 0).length} people`
                      : members.find((m: any) => m.user.id === paidBy)?.user.name || 'Select'}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Split *
                </label>
                <button
                  type="button"
                  onClick={() => setSplitDrawerOpen(true)}
                  disabled={!amount || parseFloat(amount) <= 0}
                  className="w-full px-4 py-2.5 border-2 border-border rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-text bg-primary-elevated text-text transition-all text-sm flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="truncate">
                    {splitType === 'equal' && 'Equally'}
                    {splitType === 'custom' && 'Exact'}
                    {splitType === 'percentage' && 'Percent'}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </button>
              </div>
            </div>

            {formError && (
              <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/30 rounded-lg p-3">
                {formError}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => { resetForm(); onClose(); }}
                className="flex-1 px-4 py-2.5 border-2 border-border text-text rounded-xl hover:bg-primary-elevated transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!amount || parseFloat(amount) <= 0 || createExpenseMutation.isPending}
                className="flex-1 bg-text hover:bg-text/90 text-primary font-semibold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-text"
              >
                <Plus className="w-4 h-4" />
                {createExpenseMutation.isPending ? 'Adding...' : 'Add'}
              </button>
            </div>
          </form>

          {/* Split Configuration Drawer */}
          <Drawer open={splitDrawerOpen} onOpenChange={setSplitDrawerOpen}>
            <DrawerContent className="bg-primary border-t border-border">
              <div className="w-full max-w-md mx-auto px-4 py-6 pb-12">
                <h3 className="text-lg font-bold text-text mb-4">Configure Split</h3>

                <div className="space-y-4">
                  {/* Split type selector */}
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      type="button"
                      onClick={() => setSplitType('equal')}
                      className={`px-4 py-3 rounded-xl text-sm font-medium border-2 transition-colors text-left ${
                        splitType === 'equal'
                          ? 'bg-text text-text border-text'
                          : 'bg-primary-elevated text-text/80 border-border hover:bg-primary-elevated'
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
                          ? 'bg-text text-text border-text'
                          : 'bg-primary-elevated text-text/80 border-border hover:bg-primary-elevated'
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
                          ? 'bg-text text-text border-text'
                          : 'bg-primary-elevated text-text/80 border-border hover:bg-primary-elevated'
                      }`}
                    >
                      <div className="font-semibold">Split by Percentage</div>
                      <div className="text-xs opacity-70 mt-1">Enter percentage for each member</div>
                    </button>
                  </div>

                  {/* Equal split - member selection */}
                  {splitType === 'equal' && (
                    <div className="mt-4 space-y-2 border-t border-border pt-4">
                      <div className="text-sm font-medium text-text mb-2">Split between:</div>
                      {members.map((member: any) => {
                        const totalAmount = parseFloat(amount) || 0;
                        const perPersonAmount = splitBetween.length > 0 ? totalAmount / splitBetween.length : 0;
                        const isSelected = splitBetween.includes(member.user.id);

                        return (
                          <div key={member.user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary-elevated transition-colors">
                            <Checkbox
                              id={`equal-${member.user.id}`}
                              checked={isSelected}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSplitBetween([...splitBetween, member.user.id]);
                                } else {
                                  setSplitBetween(splitBetween.filter(id => id !== member.user.id));
                                }
                              }}
                            />
                            <label
                              htmlFor={`equal-${member.user.id}`}
                              className="text-sm text-text/80 cursor-pointer flex-1"
                            >
                              {member.user.name || member.user.email}
                            </label>
                            {isSelected && totalAmount > 0 && (
                              <span className="text-sm font-medium text-text">
                                {group.currencySymbol}{perPersonAmount.toFixed(2)}
                              </span>
                            )}
                          </div>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => setSplitDrawerOpen(false)}
                        className="w-full mt-4 bg-text hover:bg-text/90 text-primary font-semibold py-2.5 px-4 rounded-xl transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  )}

                  {/* Custom split - amount inputs */}
                  {splitType === 'custom' && (
                    <div className="mt-4 space-y-2 border-t border-border pt-4">
                      <div className="text-sm font-medium text-text mb-2">Enter amounts:</div>
                      {splitBetween.map((id) => {
                        const m = members.find((mm: any) => mm.user.id === id);
                        return (
                          <div key={id} className="grid grid-cols-2 gap-3 items-center">
                            <div className="text-sm text-text/80 truncate">{m?.user.name || m?.user.email}</div>
                            <input
                              type="number"
                              step="0.01"
                              value={exactValues[id] ?? ''}
                              onChange={(e) => setExactValues({ ...exactValues, [id]: e.target.value })}
                              className="w-full px-3 py-2 border-2 border-border rounded-lg bg-primary-elevated text-text text-sm focus:ring-2 focus:ring-[#10B981] focus:border-text"
                              placeholder={`0.00`}
                            />
                          </div>
                        );
                      })}
                      {(() => {
                        const totalAmount = parseFloat(amount) || 0;
                        const allocatedAmount = splitBetween.reduce((sum, id) => {
                          return sum + (parseFloat(exactValues[id] || '0'));
                        }, 0);
                        const remaining = totalAmount - allocatedAmount;
                        const isValid = Math.abs(remaining) < 0.01;

                        return (
                          <>
                            <div className={`text-sm p-3 rounded-lg border-2 ${
                              isValid
                                ? 'bg-primary-elevated border-border text-text'
                                : remaining > 0
                                  ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'
                                  : 'bg-red-500/10 border-red-500/30 text-red-500'
                            }`}>
                              {isValid ? (
                                <span className="font-medium">✓ Total matches: {group.currencySymbol}{totalAmount.toFixed(2)}</span>
                              ) : (
                                <span className="font-medium">
                                  {remaining > 0 ? 'Remaining' : 'Over by'}: {group.currencySymbol}{Math.abs(remaining).toFixed(2)}
                                </span>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => setSplitDrawerOpen(false)}
                              disabled={!isValid}
                              className={`w-full mt-4 font-semibold py-2.5 px-4 rounded-xl transition-colors ${
                                isValid
                                  ? 'bg-text hover:bg-text/90 text-primary cursor-pointer'
                                  : 'bg-gray-600 text-text-secondary cursor-not-allowed opacity-50'
                              }`}
                            >
                              Done
                            </button>
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* Percentage split */}
                  {splitType === 'percentage' && (
                    <div className="mt-4 space-y-2 border-t border-border pt-4">
                      <div className="text-sm font-medium text-text mb-2">Enter percentages:</div>
                      {splitBetween.map((id) => {
                        const m = members.find((mm: any) => mm.user.id === id);
                        const pct = parseFloat(percentValues[id] || '0');
                        const totalAmount = parseFloat(amount) || 0;
                        const memberAmount = (pct / 100) * totalAmount;

                        return (
                          <div key={id} className="grid grid-cols-[1fr_auto] gap-3 items-center">
                            <div className="text-sm text-text/80 truncate">{m?.user.name || m?.user.email}</div>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                step="0.01"
                                value={percentValues[id] ?? ''}
                                onChange={(e) => setPercentValues({ ...percentValues, [id]: e.target.value })}
                                className="w-20 px-3 py-2 border-2 border-border rounded-lg bg-primary-elevated text-text text-sm focus:ring-2 focus:ring-[#10B981] focus:border-text"
                                placeholder="0"
                              />
                              <span className="text-text/70 text-sm">%</span>
                              {pct > 0 && totalAmount > 0 && (
                                <span className="text-xs text-text whitespace-nowrap w-16 text-right">
                                  {group.currencySymbol}{memberAmount.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {(() => {
                        const totalPercent = splitBetween.reduce((sum, id) => {
                          return sum + (parseFloat(percentValues[id] || '0'));
                        }, 0);
                        const remaining = 100 - totalPercent;
                        const isValid = Math.abs(remaining) < 0.01;

                        return (
                          <>
                            <div className={`text-sm p-3 rounded-lg border-2 ${
                              isValid
                                ? 'bg-primary-elevated border-border text-text'
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
                            <button
                              type="button"
                              onClick={() => setSplitDrawerOpen(false)}
                              disabled={!isValid}
                              className={`w-full mt-4 font-semibold py-2.5 px-4 rounded-xl transition-colors ${
                                isValid
                                  ? 'bg-text hover:bg-text/90 text-primary cursor-pointer'
                                  : 'bg-gray-600 text-text-secondary cursor-not-allowed opacity-50'
                              }`}
                            >
                              Done
                            </button>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </DrawerContent>
          </Drawer>

          {/* Paid By Configuration Drawer */}
          <Drawer open={paidByDrawerOpen} onOpenChange={setPaidByDrawerOpen}>
            <DrawerContent className="bg-primary border-t border-border">
              <div className="w-full max-w-md mx-auto px-4 py-6 pb-12">
                <h3 className="text-lg font-bold text-text mb-4">Who Paid?</h3>

                <div className="space-y-4">
                  {!isMultiplePayers ? (
                    <>
                      {/* Single person selection */}
                      <RadioGroup
                        value={String(paidBy)}
                        onValueChange={(value) => {
                          setPaidBy(value);
                          setPaidByDrawerOpen(false);
                        }}
                      >
                        <div className="space-y-2">
                          {members.map((member: any) => (
                            <div
                              key={member.user.id}
                              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                                String(paidBy) === String(member.user.id)
                                  ? 'bg-primary-hover border-2 border-text'
                                  : 'bg-primary-elevated border-2 border-border hover:bg-primary-elevated'
                              }`}
                              onClick={() => {
                                setPaidBy(member.user.id);
                                setPaidByDrawerOpen(false);
                              }}
                            >
                              <RadioGroupItem value={String(member.user.id)} id={`paidby-${member.user.id}`} />
                              <label
                                htmlFor={`paidby-${member.user.id}`}
                                className="text-sm text-text/80 cursor-pointer flex-1"
                              >
                                {member.user.name || member.user.email}
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
                            setPaidByMultiple({ [paidBy]: amount });
                            setIsMultiplePayers(true);
                          }}
                          className="px-3 py-2 border border-border text-text/70 rounded-lg hover:bg-primary-elevated transition-colors text-xs font-medium"
                        >
                          Paid by Multiple People
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Multiple payers mode */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-text">Enter amounts paid:</div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsMultiplePayers(false);
                            setPaidByMultiple({});
                          }}
                          className="text-xs text-text/70 hover:text-text underline"
                        >
                          Back to Single Person
                        </button>
                      </div>
                      {members.map((member: any) => (
                        <div key={member.user.id} className="grid grid-cols-2 gap-3 items-center">
                          <div className="text-sm text-text/80 truncate">{member.user.name || member.user.email}</div>
                          <input
                            type="number"
                            step="0.01"
                            value={paidByMultiple[member.user.id] ?? ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '') {
                                const newPaid = { ...paidByMultiple };
                                delete newPaid[member.user.id];
                                setPaidByMultiple(newPaid);
                              } else {
                                setPaidByMultiple({ ...paidByMultiple, [member.user.id]: val });
                              }
                            }}
                            className="w-full px-3 py-2 border-2 border-border rounded-lg bg-primary-elevated text-text text-sm focus:ring-2 focus:ring-[#10B981] focus:border-text"
                            placeholder={`0.00`}
                          />
                        </div>
                      ))}

                      {(() => {
                        const totalAmount = parseFloat(amount) || 0;
                        const paidAmount = Object.values(paidByMultiple).reduce((sum, val) => {
                          return sum + (parseFloat(val || '0'));
                        }, 0);
                        const remaining = totalAmount - paidAmount;
                        const isValid = Math.abs(remaining) < 0.01;

                        return (
                          <div className={`text-sm p-3 rounded-lg border-2 ${
                            isValid
                              ? 'bg-primary-elevated border-border text-text'
                              : remaining > 0
                                ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'
                                : 'bg-red-500/10 border-red-500/30 text-red-500'
                          }`}>
                            {isValid ? (
                              <span className="font-medium">✓ Total matches: {group.currencySymbol}{totalAmount.toFixed(2)}</span>
                            ) : (
                              <span className="font-medium">
                                {remaining > 0 ? 'Remaining' : 'Over by'}: {group.currencySymbol}{Math.abs(remaining).toFixed(2)}
                              </span>
                            )}
                          </div>
                        );
                      })()}

                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsMultiplePayers(false);
                            setPaidByMultiple({});
                          }}
                          className="flex-1 px-4 py-2.5 border-2 border-border text-text rounded-xl hover:bg-primary-elevated transition-colors text-sm font-medium"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaidByDrawerOpen(false)}
                          className="flex-1 bg-text hover:bg-text/90 text-primary font-semibold py-2.5 px-4 rounded-xl transition-colors text-sm"
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
      </DrawerContent>
    </Drawer>
  );
}

function SettlementDrawer({ isOpen, onClose, group, settlementData, members }: any) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  const settlementMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/groups/${group.id}/settlements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to record settlement');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settlements', group.id] });
      queryClient.invalidateQueries({ queryKey: ['balances', group.id] });
      setAmount('');
      setNotes('');
      setFormError('');
      onClose();
    },
  });

  if (!settlementData) {
    return null;
  }

  const balanceAmount = settlementData.amount / 100;
  const fromUserName = settlementData.fromName;
  const toUserName = settlementData.toName;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const settlementAmount = parseFloat(amount);
    if (!settlementAmount || settlementAmount <= 0) {
      setFormError('Please enter a valid amount');
      return;
    }

    if (settlementAmount > balanceAmount) {
      setFormError(`Amount cannot exceed ${group.currencySymbol}${balanceAmount.toFixed(2)}`);
      return;
    }

    try {
      await settlementMutation.mutateAsync({
        fromUserId: settlementData.from,
        toUserId: settlementData.to,
        amount: Math.round(settlementAmount * 100),
        notes: notes || undefined,
      });
    } catch (error: any) {
      console.error('Failed to record settlement:', error);
      setFormError(error.message || 'Failed to record settlement');
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DrawerContent className="bg-primary-elevated border-t border-border">
        <div className="w-full max-w-md mx-auto px-4 py-6 pb-12">
          <DrawerHeader className="px-0">
            <DrawerTitle className="text-2xl font-bold text-text">Settle Up</DrawerTitle>
          </DrawerHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            {/* Settlement Info */}
            <div className="p-4 bg-primary-elevated rounded-xl border border-text/20">
              <div className="text-sm text-text/70 mb-1">Settlement</div>
              <div className="flex items-center justify-between">
                <div className="font-semibold text-text">
                  {fromUserName} → {toUserName}
                </div>
                <div className="text-lg font-bold text-text">
                  {group.currencySymbol}{balanceAmount.toFixed(2)}
                </div>
              </div>
            </div>

            {formError && (
              <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/30 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Settlement Amount *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text/70 font-medium">
                  {group.currencySymbol}
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-border rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-text bg-primary-elevated text-text placeholder-text-tertiary transition-all text-lg font-semibold"
                  placeholder="0.00"
                  required
                  max={balanceAmount}
                />
              </div>
              <button
                type="button"
                onClick={() => setAmount(balanceAmount.toFixed(2))}
                className="mt-2 text-xs text-text hover:text-[#059669] transition-colors"
              >
                Settle full amount ({group.currencySymbol}{balanceAmount.toFixed(2)})
              </button>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 border-2 border-border rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-text bg-primary-elevated text-text placeholder-text-tertiary transition-all resize-none"
                placeholder="Add a note about this payment..."
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setAmount('');
                  setNotes('');
                  setFormError('');
                  onClose();
                }}
                className="flex-1 border-2 border-border text-text font-semibold py-3 px-4 rounded-xl transition-colors hover:bg-primary-elevated"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={settlementMutation.isPending || !amount || parseFloat(amount) <= 0}
                className="flex-1 bg-text hover:bg-text/90 text-primary font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {settlementMutation.isPending ? (
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
      </DrawerContent>
    </Drawer>
  );
}

function AddMemberModal({ isOpen, onClose, groupId }: any) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [formError, setFormError] = useState('');

  // Get existing members to check duplicates
  const { data: group } = useQuery({
    queryKey: ['group', groupId],
    queryFn: async () => {
      const res = await fetch(`/api/groups/${groupId}`);
      if (!res.ok) throw new Error('Failed to fetch group');
      return res.json();
    },
    enabled: !!groupId && isOpen,
  });

  const existingMemberIds = group?.members?.map((m: any) => m.user.id) || [];

  const addMemberMutation = useMutation({
    mutationFn: async (userEmail: string) => {
      const res = await fetch(`/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add member');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      setEmail('');
      setSearchResults([]);
      setFormError('');
      onClose();
    },
  });

  const handleSearch = async () => {
    if (!email) return;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError('Please enter a complete, valid email address');
      return;
    }

    setIsSearching(true);
    setFormError('');
    setSearchResults([]);

    try {
      const res = await fetch(`/api/users/search?email=${encodeURIComponent(email)}`);
      if (!res.ok) {
        throw new Error('Search failed');
      }
      const results = await res.json();

      // Filter to exact matches only
      const exactMatches = results.filter((user: any) =>
        user.email?.toLowerCase() === email.toLowerCase()
      );

      setSearchResults(exactMatches);
      if (exactMatches.length === 0) {
        setFormError('No user found with that email address');
      }
    } catch (error: any) {
      console.error('Failed to search users:', error);
      setFormError('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMember = async (userEmail: string) => {
    setFormError('');
    try {
      await addMemberMutation.mutateAsync(userEmail);
    } catch (error: any) {
      console.error('Failed to add member:', error);
      setFormError(error.message || 'Failed to add member');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-primary-elevated border border-border text-text sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-text text-text flex items-center justify-center shadow-md">
              <UserPlus className="w-5 h-5" />
            </div>
            <DialogTitle className="text-2xl font-bold">Add Member</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {formError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Enter complete email address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 py-3 border-2 border-border rounded-xl focus:ring-2 focus:ring-[#10B981] focus:border-text bg-primary-elevated text-text placeholder-text-tertiary transition-all"
                placeholder="e.g., user@example.com"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching || !email}
              className="w-full bg-text hover:bg-[#059669] disabled:bg-text/30 text-text font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 mt-3"
            >
              <UserPlus className="w-5 h-5" />
              {isSearching ? 'Searching...' : 'Find User'}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-text">
                <Check className="w-4 h-4 text-green-600" />
                Found {searchResults.length} user{searchResults.length !== 1 ? 's' : ''}
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-primary-elevated rounded-xl border border-text/20 hover:border-text/40 transition-all"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name || ''}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-text text-text flex items-center justify-center font-semibold shadow-lg">
                          {(user.name || user.email || 'U')[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-text">
                          {user.name || user.email || 'Unknown User'}
                        </div>
                        {user.name && user.email && (
                          <div className="text-sm text-text/70">
                            {user.email}
                          </div>
                        )}
                      </div>
                    </div>
                    {existingMemberIds.includes(user.id) ? (
                      <div className="flex items-center gap-2 text-sm text-text/70 px-4 py-2 bg-white/5 rounded-lg">
                        <Check className="w-4 h-4 text-text" />
                        Already a member
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddMember(user.email)}
                        disabled={addMemberMutation.isPending}
                        className="bg-text hover:bg-text/90 text-primary text-sm font-semibold px-5 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        <UserPlus className="w-4 h-4" />
                        {addMemberMutation.isPending ? 'Adding...' : 'Add'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-2">
            <button
              onClick={() => {
                setEmail('');
                setSearchResults([]);
                setFormError('');
                onClose();
              }}
              className="flex-1 px-6 py-3 border-2 border-border text-text rounded-xl hover:bg-primary-elevated transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MobileBottomNav({ activeTab, setActiveTab, onAddExpense }: any) {
  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-primary-elevated border-t border-border-subtle z-30 pb-safe">
      <div className="flex items-center justify-around h-16 relative">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            activeTab === 'overview' ? 'text-text' : 'text-text-secondary'
          }`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-xs mt-1">Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            activeTab === 'expenses' ? 'text-text' : 'text-text-secondary'
          }`}
        >
          <CreditCard className="w-5 h-5" />
          <span className="text-xs mt-1">Expenses</span>
        </button>

        <div className="flex-1" /> {/* Spacer for center button */}

        <button
          onClick={() => setActiveTab('members')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            activeTab === 'members' ? 'text-text' : 'text-text-secondary'
          }`}
        >
          <UserCheck className="w-5 h-5" />
          <span className="text-xs mt-1">Members</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            activeTab === 'settings' ? 'text-text' : 'text-text-secondary'
          }`}
        >
          <SettingsIcon className="w-5 h-5" />
          <span className="text-xs mt-1">Settings</span>
        </button>

        {/* Center Add Button */}
        <motion.button
          onClick={onAddExpense}
          className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-full shadow-lg shadow-[#10B981]/50 flex items-center justify-center"
          whileHover={{ y: -2, boxShadow: "0 10px 40px rgba(16, 185, 129, 0.6)" }}
          whileTap={{ scale: 0.85, rotate: 90 }}
        >
          <Plus className="w-7 h-7 text-text" strokeWidth={2.5} />
        </motion.button>
      </div>
    </div>
  );
}
