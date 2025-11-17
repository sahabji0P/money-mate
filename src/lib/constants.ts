// Currency constants
export const CURRENCIES = [
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
] as const;

// Expense categories
export const CATEGORIES = [
  { id: 'food', name: 'Food', icon: '🍔', color: '#10B981' },
  { id: 'transport', name: 'Transport', icon: '🚗', color: '#3B82F6' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#8B5CF6' },
  { id: 'utilities', name: 'Utilities', icon: '💡', color: '#F59E0B' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#EC4899' },
  { id: 'other', name: 'Other', icon: '📦', color: '#6B7280' },
] as const;

export type Currency = typeof CURRENCIES[number];
export type Category = typeof CATEGORIES[number];
