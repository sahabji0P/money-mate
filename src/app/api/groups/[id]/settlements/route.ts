import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/groups/[id]/settlements - List group settlements
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

    const settlements = await prisma.settlement.findMany({
      where: { groupId },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        toUser: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Convert cents to dollars for frontend
    const settlementsInDollars = settlements.map((settlement: typeof settlements[0]) => ({
      ...settlement,
      amount: settlement.amount / 100,
    }));

    return NextResponse.json(settlementsInDollars);
  } catch (error) {
    console.error('Error fetching settlements:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/groups/[id]/settlements - Create settlement
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
    const { fromUserId, toUserId, amount, notes } = body;

    // Validation
    if (!fromUserId || !toUserId) {
      return NextResponse.json(
        { error: 'Both payer and recipient are required' },
        { status: 400 }
      );
    }

    if (fromUserId === toUserId) {
      return NextResponse.json(
        { error: 'Cannot create settlement to yourself' },
        { status: 400 }
      );
    }

    if (amount === undefined || amount <= 0) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
    }

    // Convert dollars to cents for storage
    const amountInCents = Math.round(amount * 100);

    // Verify both users are group members
    const members = await prisma.groupMember.findMany({
      where: {
        groupId,
        userId: { in: [fromUserId, toUserId] },
      },
    });

    if (members.length !== 2) {
      return NextResponse.json(
        { error: 'Both users must be group members' },
        { status: 400 }
      );
    }

    // Create settlement
    const settlement = await prisma.settlement.create({
      data: {
        groupId,
        fromUserId,
        toUserId,
        amount: amountInCents,
        notes,
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        toUser: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Get group and payer info for notification
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      select: { name: true },
    });

    const payer = await prisma.user.findUnique({
      where: { id: fromUserId },
      select: { name: true },
    });

    // Create notification for the recipient
    await prisma.notification.create({
      data: {
        type: 'settlement_received',
        message: `${payer?.name || 'Someone'} paid you ${(amountInCents / 100).toFixed(2)} in ${group?.name || 'a group'}`,
        link: `/groups/${groupId}`,
        userId: toUserId,
        fromUserId,
        groupId,
      },
    });

    // Convert cents to dollars for frontend
    const settlementInDollars = {
      ...settlement,
      amount: settlement.amount / 100,
    };

    return NextResponse.json(settlementInDollars, { status: 201 });
  } catch (error) {
    console.error('Error creating settlement:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
