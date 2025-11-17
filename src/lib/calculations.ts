/**
 * Balance Calculation and Settlement Suggestion Utilities
 * Based on Owwn's algorithms
 */

export interface Balance {
  userId: string;
  userName: string;
  userEmail: string;
  balance: number; // in cents, positive = owed, negative = owes
}

export interface SettlementSuggestion {
  from: string; // userId
  fromName: string;
  to: string; // userId
  toName: string;
  amount: number; // in cents
}

export interface ExpenseData {
  id: string;
  payments: { userId: string; amount: number }[];
  splits: { userId: string; amount: number; isPaid: boolean }[];
}

export interface SettlementData {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
}

/**
 * Calculate balances for all users in a group
 * Formula: Balance = (Total Paid) - (Total Owed) + (Settlements Received) - (Settlements Paid)
 */
export function calculateBalances(
  expenses: ExpenseData[],
  settlements: SettlementData[],
  users: { id: string; name: string | null; email: string }[]
): Balance[] {
  // Initialize balance map
  const balanceMap = new Map<string, number>();
  users.forEach((user) => balanceMap.set(user.id, 0));

  // Process expenses
  for (const expense of expenses) {
    // Credit payers (they paid)
    for (const payment of expense.payments) {
      const current = balanceMap.get(payment.userId) || 0;
      balanceMap.set(payment.userId, current + payment.amount);
    }

    // Debit split participants (they owe)
    for (const split of expense.splits) {
      const current = balanceMap.get(split.userId) || 0;
      balanceMap.set(split.userId, current - split.amount);
    }
  }

  // Process settlements
  for (const settlement of settlements) {
    // Person who paid reduces their debt (increases balance)
    const fromCurrent = balanceMap.get(settlement.fromUserId) || 0;
    balanceMap.set(settlement.fromUserId, fromCurrent + settlement.amount);

    // Person who received reduces their credit (decreases balance)
    const toCurrent = balanceMap.get(settlement.toUserId) || 0;
    balanceMap.set(settlement.toUserId, toCurrent - settlement.amount);
  }

  // Convert to array
  return users.map((user) => ({
    userId: user.id,
    userName: user.name || 'Unknown',
    userEmail: user.email,
    balance: balanceMap.get(user.id) || 0,
  }));
}

/**
 * Calculate pairwise balances between a specific user and all other users
 * Returns how much each person owes to/from the specified user
 */
export function calculatePairwiseBalances(
  userId: string,
  expenses: ExpenseData[],
  settlements: SettlementData[],
  users: { id: string; name: string | null; email: string }[]
): Map<string, number> {
  const pairwiseMap = new Map<string, number>();
  users.forEach((user) => {
    if (user.id !== userId) {
      pairwiseMap.set(user.id, 0);
    }
  });

  // Process each expense
  for (const expense of expenses) {
    // Get what the user paid
    const userPayment = expense.payments.find((p) => p.userId === userId);
    const userPaid = userPayment?.amount || 0;

    // Get what the user owes
    const userSplit = expense.splits.find((s) => s.userId === userId);
    const userOwes = userSplit?.amount || 0;

    // Get total expense
    const totalExpense = expense.splits.reduce((sum, s) => sum + s.amount, 0);

    // For each other user in this expense
    for (const split of expense.splits) {
      if (split.userId === userId) continue;

      // How much this person paid
      const theirPayment = expense.payments.find((p) => p.userId === split.userId);
      const theyPaid = theirPayment?.amount || 0;

      // How much this person owes
      const theyOwe = split.amount;

      // Calculate share of what user paid for this person
      const userPaidForThem = userPaid > 0 ? (userPaid * theyOwe) / totalExpense : 0;

      // Calculate share of what this person paid for user
      const theyPaidForUser = theyPaid > 0 ? (theyPaid * userOwes) / totalExpense : 0;

      // Net balance change for this expense
      const netChange = userPaidForThem - theyPaidForUser;

      const current = pairwiseMap.get(split.userId) || 0;
      pairwiseMap.set(split.userId, current + netChange);
    }
  }

  // Process settlements
  for (const settlement of settlements) {
    if (settlement.fromUserId === userId) {
      // User paid someone
      const current = pairwiseMap.get(settlement.toUserId) || 0;
      pairwiseMap.set(settlement.toUserId, current - settlement.amount);
    } else if (settlement.toUserId === userId) {
      // Someone paid user
      const current = pairwiseMap.get(settlement.fromUserId) || 0;
      pairwiseMap.set(settlement.fromUserId, current + settlement.amount);
    }
  }

  return pairwiseMap;
}

/**
 * Generate optimal settlement suggestions using greedy matching algorithm
 * Minimizes the number of transactions needed to settle all debts
 */
export function generateSettlementSuggestions(balances: Balance[]): SettlementSuggestion[] {
  const suggestions: SettlementSuggestion[] = [];

  // Separate into debtors (owe money) and creditors (are owed money)
  const debtors = balances
    .filter((b) => b.balance < 0)
    .map((b) => ({ ...b, balance: -b.balance })) // Make positive for easier math
    .sort((a, b) => b.balance - a.balance); // Largest debts first

  const creditors = balances
    .filter((b) => b.balance > 0)
    .sort((a, b) => b.balance - a.balance); // Largest credits first

  // Greedy matching: match largest debtor with largest creditor
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    // Amount to settle is minimum of what debtor owes and creditor is owed
    const amount = Math.min(debtor.balance, creditor.balance);

    if (amount > 0) {
      suggestions.push({
        from: debtor.userId,
        fromName: debtor.userName,
        to: creditor.userId,
        toName: creditor.userName,
        amount: amount,
      });
    }

    // Reduce balances
    debtor.balance -= amount;
    creditor.balance -= amount;

    // Move to next debtor/creditor if current one is settled
    if (debtor.balance === 0) i++;
    if (creditor.balance === 0) j++;
  }

  return suggestions;
}

/**
 * Split an amount equally among members
 * Handles remainder by giving it to the first person
 */
export function splitEqually(
  totalCents: number,
  memberIds: string[]
): { userId: string; amount: number }[] {
  const n = memberIds.length;
  if (n === 0) return [];

  const base = Math.floor(totalCents / n);
  const remainder = totalCents - base * n;

  return memberIds.map((id, index) => ({
    userId: id,
    amount: base + (index === 0 ? remainder : 0),
  }));
}

/**
 * Split an amount by percentages
 * Adjusts rounding errors by adding/subtracting from first person
 */
export function splitByPercentages(
  totalCents: number,
  percentages: { userId: string; percentage: number }[]
): { userId: string; amount: number }[] {
  // Validate percentages sum to 100
  const totalPercentage = percentages.reduce((sum, p) => sum + p.percentage, 0);
  if (Math.abs(totalPercentage - 100) > 0.01) {
    throw new Error('Percentages must sum to 100');
  }

  // Calculate amounts
  const splits = percentages.map((p) => ({
    userId: p.userId,
    amount: Math.floor((totalCents * p.percentage) / 100),
  }));

  // Adjust for rounding errors
  const totalSplit = splits.reduce((sum, s) => sum + s.amount, 0);
  if (totalSplit !== totalCents) {
    splits[0].amount += totalCents - totalSplit;
  }

  return splits;
}

/**
 * Validate custom split amounts
 */
export function validateCustomSplit(
  totalCents: number,
  splits: { userId: string; amount: number }[]
): { valid: boolean; error?: string } {
  const totalSplit = splits.reduce((sum, s) => sum + s.amount, 0);

  if (totalSplit !== totalCents) {
    return {
      valid: false,
      error: `Split amounts (${totalSplit / 100}) must equal total (${totalCents / 100})`,
    };
  }

  for (const split of splits) {
    if (split.amount < 0) {
      return {
        valid: false,
        error: 'Split amounts must be non-negative',
      };
    }
  }

  return { valid: true };
}

/**
 * Format cents to currency string
 */
export function formatCurrency(cents: number, currencySymbol: string = '$'): string {
  const dollars = Math.abs(cents) / 100;
  const formatted = dollars.toFixed(2);
  return `${currencySymbol}${formatted}`;
}

/**
 * Parse currency string to cents
 */
export function parseCurrencyToCents(value: string): number {
  // Remove currency symbols and spaces
  const cleaned = value.replace(/[$€£¥₹,\s]/g, '');
  const parsed = parseFloat(cleaned);
  if (isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
}
