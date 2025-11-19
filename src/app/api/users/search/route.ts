import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || searchParams.get('email');

    if (!query || query.length < 3) {
      return NextResponse.json({ error: 'Search query must be at least 3 characters' }, { status: 400 });
    }

    // Search for users by email or name (case-insensitive partial match)
    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            email: {
              contains: query.toLowerCase(),
              mode: 'insensitive',
            },
          },
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
        // Exclude current user from results
        NOT: {
          id: session.user.id,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      take: 10, // Limit to 10 results
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('User search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
