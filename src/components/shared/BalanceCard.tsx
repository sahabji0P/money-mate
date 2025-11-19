'use client';

import { ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';
import { CURRENCIES } from '@/lib/constants';

interface BalanceCardProps {
  amount: number;
  currency?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function BalanceCard({
  amount,
  currency = 'USD',
  label,
  size = 'md',
}: BalanceCardProps) {
  const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol || '$';
  const isPositive = amount > 0;
  const isNegative = amount < 0;
  const isSettled = amount === 0;

  const sizeClasses = {
    sm: {
      container: 'p-4',
      amount: 'text-2xl',
      icon: 'w-5 h-5',
    },
    md: {
      container: 'p-6',
      amount: 'text-3xl sm:text-4xl',
      icon: 'w-6 h-6',
    },
    lg: {
      container: 'p-8',
      amount: 'text-4xl sm:text-5xl',
      icon: 'w-8 h-8',
    },
  };

  return (
    <div
      className={`
        rounded-2xl border transition-all
        ${isPositive
          ? 'bg-accent-emerald/5 border-accent-emerald/20'
          : isNegative
            ? 'bg-accent-rose/5 border-accent-rose/20'
            : 'bg-primary-elevated border-border-subtle'
        }
        ${sizeClasses[size].container}
      `}
    >
      {label && (
        <p className="text-sm text-text-secondary mb-2">{label}</p>
      )}

      <div className="flex items-center gap-3">
        {/* Icon */}
        <div
          className={`
            rounded-xl p-2
            ${isPositive
              ? 'bg-accent-emerald/10 text-accent-emerald'
              : isNegative
                ? 'bg-accent-rose/10 text-accent-rose'
                : 'bg-primary-hover text-text-tertiary'
            }
          `}
        >
          {isPositive ? (
            <ArrowUpRight className={sizeClasses[size].icon} />
          ) : isNegative ? (
            <ArrowDownRight className={sizeClasses[size].icon} />
          ) : (
            <CheckCircle2 className={sizeClasses[size].icon} />
          )}
        </div>

        {/* Amount */}
        <div>
          <p
            className={`
              font-semibold tracking-tight
              ${sizeClasses[size].amount}
              ${isPositive
                ? 'text-accent-emerald'
                : isNegative
                  ? 'text-accent-rose'
                  : 'text-text-tertiary'
              }
            `}
          >
            {isPositive && '+'}
            {currencySymbol}
            {Math.abs(amount).toFixed(2)}
          </p>
          <p className="text-sm text-text-secondary mt-0.5">
            {isPositive
              ? "You're owed"
              : isNegative
                ? 'You owe'
                : 'All settled up'}
          </p>
        </div>
      </div>
    </div>
  );
}

// Detailed balance breakdown
interface BalanceBreakdownProps {
  balances: Array<{
    userId: string;
    userName: string;
    userImage?: string | null;
    amount: number;
  }>;
  currency?: string;
  currentUserId?: string;
}

export function BalanceBreakdown({
  balances,
  currency = 'USD',
  currentUserId,
}: BalanceBreakdownProps) {
  const currencySymbol = CURRENCIES.find(c => c.code === currency)?.symbol || '$';

  // Filter out current user and zero balances
  const relevantBalances = balances.filter(
    b => b.userId !== currentUserId && b.amount !== 0
  );

  if (relevantBalances.length === 0) {
    return (
      <div className="text-center py-8 text-text-secondary">
        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-accent-emerald" />
        <p>All balances are settled</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {relevantBalances.map((balance) => (
        <div
          key={balance.userId}
          className="flex items-center justify-between p-4 rounded-xl bg-primary-elevated border border-border-subtle"
        >
          <div className="flex items-center gap-3">
            {balance.userImage ? (
              <img
                src={balance.userImage}
                alt={balance.userName}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-accent-blue/20 text-accent-blue flex items-center justify-center font-medium">
                {balance.userName.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-medium text-text">{balance.userName}</p>
              <p className="text-xs text-text-tertiary">
                {balance.amount > 0 ? 'owes you' : 'you owe'}
              </p>
            </div>
          </div>
          <p
            className={`
              font-semibold text-lg
              ${balance.amount > 0 ? 'text-accent-emerald' : 'text-accent-rose'}
            `}
          >
            {balance.amount > 0 ? '+' : '-'}
            {currencySymbol}
            {Math.abs(balance.amount).toFixed(2)}
          </p>
        </div>
      ))}
    </div>
  );
}
