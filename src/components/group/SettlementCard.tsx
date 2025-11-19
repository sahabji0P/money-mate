'use client';

import { ArrowRight, CheckCircle2, Bell } from 'lucide-react';
import Avatar from '@/components/shared/Avatar';

interface SettlementCardProps {
  settlement: {
    id: string;
    amount: number;
    date: string;
    fromUser: {
      id: string;
      name: string;
      image?: string | null;
    };
    toUser: {
      id: string;
      name: string;
      image?: string | null;
    };
  };
  currencySymbol: string;
  onClick?: () => void;
}

export default function SettlementCard({ settlement, currencySymbol, onClick }: SettlementCardProps) {
  const date = new Date(settlement.date);
  const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div
      onClick={onClick}
      className={`
        p-4 rounded-xl bg-accent-blue/5 border border-accent-blue/20
        ${onClick ? 'cursor-pointer hover:bg-accent-blue/10 transition-colors' : ''}
      `}
    >
      <div className="flex items-center gap-4">
        {/* Settlement Icon */}
        <div className="w-10 h-10 rounded-lg bg-accent-blue/10 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-5 h-5 text-accent-blue" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Avatar src={settlement.fromUser.image} name={settlement.fromUser.name} size="sm" />
            <span className="text-sm font-medium text-text truncate">
              {settlement.fromUser.name}
            </span>
            <ArrowRight className="w-4 h-4 text-accent-blue flex-shrink-0" />
            <Avatar src={settlement.toUser.image} name={settlement.toUser.name} size="sm" />
            <span className="text-sm font-medium text-text truncate">
              {settlement.toUser.name}
            </span>
          </div>
          <p className="text-xs text-text-tertiary">
            {formattedDate}
          </p>
        </div>

        {/* Amount */}
        <span className="font-semibold text-accent-blue whitespace-nowrap">
          {currencySymbol}{settlement.amount.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

// Suggestion card for pending settlements
interface SettlementSuggestionProps {
  suggestion: {
    fromUserId: string;
    fromUserName: string;
    fromUserImage?: string | null;
    toUserId: string;
    toUserName: string;
    toUserImage?: string | null;
    amount: number;
  };
  currencySymbol: string;
  onSettle: () => void;
  onRemind?: () => void;
  isLoading?: boolean;
  currentUserId?: string;
}

export function SettlementSuggestion({
  suggestion,
  currencySymbol,
  onSettle,
  onRemind,
  isLoading,
  currentUserId
}: SettlementSuggestionProps) {
  // Show remind button if current user is owed money (toUserId)
  const canRemind = currentUserId && currentUserId === suggestion.toUserId;

  return (
    <div className="p-4 rounded-xl bg-primary-elevated border border-border-subtle">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Avatar src={suggestion.fromUserImage} name={suggestion.fromUserName} size="md" />
          <div>
            <p className="text-sm font-medium text-text">{suggestion.fromUserName}</p>
            <p className="text-xs text-text-tertiary">owes</p>
          </div>
        </div>

        <ArrowRight className="w-5 h-5 text-text-tertiary" />

        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-sm font-medium text-text">{suggestion.toUserName}</p>
            <p className="text-xs text-text-tertiary">receives</p>
          </div>
          <Avatar src={suggestion.toUserImage} name={suggestion.toUserName} size="md" />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-2xl font-semibold text-text">
          {currencySymbol}{suggestion.amount.toFixed(2)}
        </span>
        <div className="flex items-center gap-2">
          {canRemind && onRemind && (
            <button
              onClick={onRemind}
              className="p-2 rounded-lg bg-accent-amber/10 hover:bg-accent-amber/20 text-accent-amber transition-all"
              title="Send reminder"
            >
              <Bell className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onSettle}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-accent-emerald hover:bg-accent-emerald-dark disabled:bg-accent-emerald/50 text-white text-sm font-medium transition-all disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Settle Up'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
