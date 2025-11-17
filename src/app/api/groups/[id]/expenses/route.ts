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

    return NextResponse.json(expenses);
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

    // Validate payments sum to total
    const totalPaid = payments.reduce((sum: number, p: any) => sum + p.amount, 0);
    if (totalPaid !== amount) {
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

    // Calculate splits based on type
    let splits: { userId: string; amount: number }[] = [];

    if (splitType === 'equal') {
      if (!splitBetween || splitBetween.length === 0) {
        return NextResponse.json(
          { error: 'Must specify users to split among' },
          { status: 400 }
        );
      }
      splits = splitEqually(amount, splitBetween);
    } else if (splitType === 'custom') {
      if (!customSplits || customSplits.length === 0) {
        return NextResponse.json({ error: 'Custom splits required' }, { status: 400 });
      }
      const validation = validateCustomSplit(amount, customSplits);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      splits = customSplits;
    } else if (splitType === 'percentage') {
      if (!percentageSplits || percentageSplits.length === 0) {
        return NextResponse.json({ error: 'Percentage splits required' }, { status: 400 });
      }
      try {
        splits = splitByPercentages(amount, percentageSplits);
      } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    } else {
      return NextResponse.json({ error: 'Invalid split type' }, { status: 400 });
    }

    // Create expense with payments and splits
    const expense = await prisma.expense.create({
      data: {
        groupId,
        description,
        amount,
        category: category || 'other',
        date: date ? new Date(date) : new Date(),
        notes,
        receiptImage,
        createdById: session.user.id,
        payments: {
          create: payments.map((p: any) => ({
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

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
