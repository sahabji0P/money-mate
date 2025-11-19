import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateBalances } from '@/lib/calculations';

// GET /api/groups - List user's groups with balances
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
        members: {
          select: {
            userId: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        expenses: {
          include: {
            payments: true,
            splits: true,
          },
        },
        settlements: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const groupsWithBalance = groups.map((group: typeof groups[0]) => {
      // Get current user's role
      const currentUserMember = group.members.find((m: typeof group.members[0]) => m.userId === session.user!.id);

      // Calculate balances for this group
      const users = group.members.map((m: typeof group.members[0]) => ({
        id: m.user.id,
        name: m.user.name,
        email: m.user.email,
      }));

      const balances = calculateBalances(group.expenses, group.settlements, users);
      const userBalance = balances.find(b => b.userId === session.user!.id);

      return {
        id: group.id,
        name: group.name,
        description: group.description,
        currency: group.currency,
        currencySymbol: group.currencySymbol,
        memberCount: group._count.members,
        role: currentUserMember?.role || 'member',
        userBalance: (userBalance?.balance || 0) / 100, // Convert cents to dollars
        createdAt: group.createdAt,
      };
    });

    return NextResponse.json(groupsWithBalance);
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/groups - Create a new group
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, currency, currencySymbol } = body;

    if (!name) {
      return NextResponse.json({ error: 'Group name is required' }, { status: 400 });
    }

    // Currency symbols map
    const currencySymbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      INR: '₹',
      JPY: '¥',
      AUD: 'A$',
      CAD: 'C$',
      CHF: 'Fr',
      CNY: '¥',
      SEK: 'kr',
    };

    const selectedCurrency = currency || 'USD';
    const selectedSymbol = currencySymbol || currencySymbols[selectedCurrency] || '$';

    const group = await prisma.group.create({
      data: {
        name,
        description,
        currency: selectedCurrency,
        currencySymbol: selectedSymbol,
        createdById: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role: 'admin',
          },
        },
      },
      include: {
        members: {
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

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
