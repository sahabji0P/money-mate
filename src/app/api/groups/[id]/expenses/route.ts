import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  splitEqually,
  splitByPercentages,
  validateCustomSplit,
} from '@/lib/calculations';

// GET /api/groups/[id]/expenses - List group expenses
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

    const expenses = await prisma.expense.findMany({
      where: { groupId },
      include: {
        payments: {
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
        },
        splits: {
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
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Convert cents to dollars for frontend
    const expensesInDollars = expenses.map((expense: typeof expenses[0]) => ({
      ...expense,
      amount: expense.amount / 100,
      payments: expense.payments.map((p: typeof expense.payments[0]) => ({
        ...p,
        amount: p.amount / 100,
      })),
      splits: expense.splits.map((s: typeof expense.splits[0]) => ({
        ...s,
        amount: s.amount / 100,
      })),
    }));

    return NextResponse.json(expensesInDollars);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/groups/[id]/expenses - Create expense
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: groupId } = await params;

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

    const body = await request.json();
    const {
      description,
      amount,
      category,
      date,
      notes,
      receiptImage,
      payments, // [{ userId, amount }]
      splitType, // 'equal' | 'custom' | 'percentage'
      splitBetween, // user IDs to split among
      customSplits, // [{ userId, amount }] for custom
      percentageSplits, // [{ userId, percentage }] for percentage
    } = body;

    // Validation
    if (!description || amount === undefined || amount <= 0) {
      return NextResponse.json(
        { error: 'Description and valid amount are required' },
        { status: 400 }
      );
    }

    if (!payments || payments.length === 0) {
      return NextResponse.json({ error: 'At least one payer is required' }, { status: 400 });
    }

    // Convert dollars to cents for storage
    const amountInCents = Math.round(amount * 100);
    const paymentsInCents = payments.map((p: any) => ({
      userId: p.userId,
      amount: Math.round(p.amount * 100),
    }));

    // Validate payments sum to total
    const totalPaid = paymentsInCents.reduce((sum: number, p: any) => sum + p.amount, 0);
    if (Math.abs(totalPaid - amountInCents) > 1) { // Allow 1 cent rounding difference
      return NextResponse.json(
        { error: 'Payment amounts must equal total expense' },
        { status: 400 }
      );
    }

    // Validate all payers and split participants are group members
    const allUserIds = [
      ...payments.map((p: any) => p.userId),
      ...(splitBetween || []),
    ];
    const uniqueUserIds = [...new Set(allUserIds)];

    const memberships = await prisma.groupMember.findMany({
      where: {
        groupId,
        userId: { in: uniqueUserIds },
      },
    });

    if (memberships.length !== uniqueUserIds.length) {
      return NextResponse.json(
        { error: 'All participants must be group members' },
        { status: 400 }
      );
    }

    // Calculate splits based on type (all amounts in cents)
    let splits: { userId: string; amount: number }[] = [];

    if (splitType === 'equal') {
      if (!splitBetween || splitBetween.length === 0) {
        return NextResponse.json(
          { error: 'Must specify users to split among' },
          { status: 400 }
        );
      }
      splits = splitEqually(amountInCents, splitBetween);
    } else if (splitType === 'custom') {
      if (!customSplits || customSplits.length === 0) {
        return NextResponse.json({ error: 'Custom splits required' }, { status: 400 });
      }
      // Convert custom splits to cents
      const customSplitsInCents = customSplits.map((s: any) => ({
        userId: s.userId,
        amount: Math.round(s.amount * 100),
      }));
      const validation = validateCustomSplit(amountInCents, customSplitsInCents);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      splits = customSplitsInCents;
    } else if (splitType === 'percentage') {
      if (!percentageSplits || percentageSplits.length === 0) {
        return NextResponse.json({ error: 'Percentage splits required' }, { status: 400 });
      }
      try {
        splits = splitByPercentages(amountInCents, percentageSplits);
      } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'Invalid split type' }, { status: 400 });
    }

    // Create expense with payments and splits (all in cents)
    const expense = await prisma.expense.create({
      data: {
        groupId,
        description,
        amount: amountInCents,
        category: category || 'other',
        date: date ? new Date(date) : new Date(),
        notes,
        receiptImage,
        createdById: session.user.id,
        payments: {
          create: paymentsInCents.map((p: any) => ({
            userId: p.userId,
            amount: p.amount,
          })),
        },
        splits: {
          create: splits.map((s) => ({
            userId: s.userId,
            amount: s.amount,
            isPaid: false,
          })),
        },
      },
      include: {
        payments: {
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
        },
        splits: {
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
        },
      },
    });

    // Convert cents to dollars for frontend
    const expenseInDollars = {
      ...expense,
      amount: expense.amount / 100,
      payments: expense.payments.map((p: typeof expense.payments[0]) => ({
        ...p,
        amount: p.amount / 100,
      })),
      splits: expense.splits.map((s: typeof expense.splits[0]) => ({
        ...s,
        amount: s.amount / 100,
      })),
    };

    return NextResponse.json(expenseInDollars, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
