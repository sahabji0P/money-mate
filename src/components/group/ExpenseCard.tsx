'use client';

import { CATEGORIES } from '@/lib/constants';

interface ExpenseCardProps {
  expense: {
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string;
    payments: Array<{
      user: {
        id: string;
        name: string;
        image?: string | null;
      };
      amount: number;
    }>;
    splits: Array<{
      user: {
        id: string;
        name: string;
      };
      amount: number;
    }>;
  };
  currencySymbol: string;
  onClick?: () => void;
}

export default function ExpenseCard({ expense, currencySymbol, onClick }: ExpenseCardProps) {
  const category = CATEGORIES.find(c => c.id === expense.category) || CATEGORIES[5]; // Default to 'other'
  const paidByNames = expense.payments?.map(p => p.user.name).join(', ') || 'Unknown';
  const splitCount = expense.splits?.length || 0;
  const date = new Date(expense.date);
  const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div
      onClick={onClick}
      className={`
        p-4 rounded-xl bg-primary-elevated border border-border-subtle
        hover:border-border transition-all duration-200
        ${onClick ? 'cursor-pointer hover:shadow-md' : ''}
      `}
    >
      <div className="flex items-start gap-4">
        {/* Category Icon */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
          style={{ backgroundColor: `${category.color}20` }}
        >
          {category.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <h4 className="font-medium text-text truncate">
              {expense.description}
            </h4>
            <span className="font-semibold text-text whitespace-nowrap">
              {currencySymbol}{expense.amount.toFixed(2)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-text-tertiary">
            <span>Paid by {paidByNames}</span>
            {splitCount > 0 && (
              <>
                <span>·</span>
                <span>Split {splitCount} {splitCount === 1 ? 'way' : 'ways'}</span>
              </>
            )}
          </div>

          <p className="mt-2 text-xs text-text-tertiary">
            {formattedDate}
          </p>
        </div>
      </div>
    </div>
  );
}

// Compact version for lists
export function ExpenseCardCompact({ expense, currencySymbol, onClick }: ExpenseCardProps) {
  const category = CATEGORIES.find(c => c.id === expense.category) || CATEGORIES[5];
  const date = new Date(expense.date);
  const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div
      onClick={onClick}
      className={`
        flex items-center gap-3 p-3 rounded-lg
        hover:bg-primary-hover transition-colors
        ${onClick ? 'cursor-pointer' : ''}
      `}
    >
      <div
        className="w-8 h-8 rounded-md flex items-center justify-center text-sm flex-shrink-0"
        style={{ backgroundColor: `${category.color}20` }}
      >
        {category.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text truncate">{expense.description}</p>
        <p className="text-xs text-text-tertiary">{formattedDate}</p>
      </div>
      <span className="text-sm font-medium text-text">
        {currencySymbol}{expense.amount.toFixed(2)}
      </span>
    </div>
  );
}
