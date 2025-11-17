import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useConvexAuth } from "convex/react";

export function useAuth() {
  const { signIn, signOut } = useAuthActions();
  const { isLoading: isAuthLoading } = useConvexAuth();
  const currentUser = useQuery(api.users.getCurrentUser);
  
  // Show loading if auth is still initializing OR if we're waiting for user data
  const isLoading = isAuthLoading || currentUser === undefined;

  return {
    user: currentUser,
    isLoading,
    signInWithGoogle: async () => {
      await signIn("google");
    },
    signOut,
  };
}
