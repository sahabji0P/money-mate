import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../../../../convex/_generated/api'
import { motion } from 'motion/react'
import type { Id } from '../../../../../convex/_generated/dataModel'

export const Route = createFileRoute('/groups/$groupId/expenses/$expenseId')({
  component: ExpenseDetails,
})

function ExpenseDetails() {
  const { groupId, expenseId } = Route.useParams()

  const { data: expense } = useSuspenseQuery(
    convexQuery(api.expenses.getExpenseDetails, { 
      expenseId: expenseId as Id<'expenses'> 
    })
  )

  const { data: group } = useSuspenseQuery(
    convexQuery(api.groups.getGroupDetails, { 
      groupId: groupId as Id<'groups'> 
    })
  )

  if (!expense || !group) {
    return (
      <div className="min-h-[100dvh] bg-[#0A0F12] flex items-center justify-center">
        <div className="text-white">Expense not found</div>
      </div>
    )
  }

  const currencySymbol = group.currencySymbol || '$'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-[#0A0F12]"
    >
      <div className="max-w-md mx-auto px-4 py-6 pb-24">
        {/* Amount */}
        <div className="text-center mb-6 p-6 bg-[#10B981]/10 rounded-xl border border-[#10B981]/30">
          <div className="text-4xl font-bold text-[#10B981] mb-2">
            {currencySymbol}{(expense.amount / 100).toFixed(2)}
          </div>
          <div className="text-lg text-white font-medium">{expense.description}</div>
          {expense.category && (
            <div className="inline-block mt-2 px-3 py-1 bg-[#10B981]/20 rounded-full text-xs text-[#10B981] font-medium">
              {expense.category}
            </div>
          )}
        </div>

        {/* Date */}
        <div className="mb-6 p-4 bg-[#111827] rounded-lg border border-[#10B981]/20">
          <div className="text-sm text-white/60 mb-1">Date</div>
          <div className="text-white font-medium">
            {new Date(expense.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>

        {/* Paid By */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-white/80 mb-3">Paid By</h3>
          <div className="space-y-2">
            {expense.payments && expense.payments.length > 1 ? (
              expense.payments.map((payment: any) => (
                <div
                  key={payment.userId}
                  className="flex items-center justify-between p-3 bg-[#111827] rounded-lg border border-[#10B981]/20"
                >
                  <div className="text-white font-medium">{payment.userName}</div>
                  <div className="text-[#10B981] font-semibold">
                    {currencySymbol}{(payment.amount / 100).toFixed(2)}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-between p-3 bg-[#111827] rounded-lg border border-[#10B981]/20">
                <div className="text-white font-medium">{expense.paidByName}</div>
                <div className="text-[#10B981] font-semibold">
                  {currencySymbol}{(expense.amount / 100).toFixed(2)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Split Details */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-white/80 mb-3">Split Between</h3>
          <div className="space-y-2">
            {expense.splits.map((split: any) => (
              <div
                key={split.userId}
                className="flex items-center justify-between p-3 bg-[#111827] rounded-lg border border-[#10B981]/20"
              >
                <div className="flex items-center gap-3">
                  <div className="text-white font-medium">{split.userName}</div>
                  {split.isPaid && (
                    <span className="px-2 py-0.5 bg-[#10B981]/20 text-[#10B981] text-xs rounded-full font-medium">
                      Paid
                    </span>
                  )}
                </div>
                <div className="text-white/80 font-semibold">
                  {currencySymbol}{(split.amount / 100).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {expense.notes && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-white/80 mb-3">Notes</h3>
            <div className="p-4 bg-[#111827] rounded-lg border border-[#10B981]/20 text-white/80 text-sm">
              {expense.notes}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
