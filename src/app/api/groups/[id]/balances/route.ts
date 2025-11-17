import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  calculateBalances,
  generateSettlementSuggestions,
  calculatePairwiseBalances,
} from '@/lib/calculations';

// GET /api/groups/[id]/balances - Calculate and return balances
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: groupId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Check if user is a member
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: session.user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 });
    }

    // Get all group members
    const members = await prisma.groupMember.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    const users = members.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
    }));

    // Get all expenses
    const expenses = await prisma.expense.findMany({
      where: { groupId },
      include: {
        payments: true,
        splits: true,
      },
    });

    // Get all settlements
    const settlements = await prisma.settlement.findMany({
      where: { groupId },
    });

    // If userId is provided, calculate pairwise balances
    if (userId) {
      const pairwiseMap = calculatePairwiseBalances(userId, expenses, settlements, users);

      const pairwiseBalances = users
        .filter((u) => u.id !== userId)
        .map((u) => ({
          userId: u.id,
          userName: u.name || 'Unknown',
          userEmail: u.email,
          balance: pairwiseMap.get(u.id) || 0,
        }));

      return NextResponse.json({ pairwise: pairwiseBalances });
    }

    // Calculate overall balances
    const balances = calculateBalances(expenses, settlements, users);

    // Generate settlement suggestions
    const suggestions = generateSettlementSuggestions(balances);

    return NextResponse.json({
      balances,
      suggestions,
    });
  } catch (error) {
    console.error('Error calculating balances:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
