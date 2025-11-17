'use client';

import { useSession } from 'next-auth/react';

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user ? {
      id: session.user.id,
      _id: session.user.id, // Convex compatibility
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
    } : null,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
  };
}
