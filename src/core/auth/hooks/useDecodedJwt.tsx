import { getAuth, onIdTokenChanged } from "firebase/auth";
import { useEffect, useState } from "react";

type FirebaseClaims = {
  role?: string;
  name?: string;
  email?: string;
  user_id?: string;
};

export function useFirebaseClaims() {
  const [claims, setClaims] = useState<FirebaseClaims | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();

    const unsub = onIdTokenChanged(auth, async (user) => {
      try {
        if (!user) {
          setClaims(null);
          return;
        }

        // forceRefresh=true si acabás de setear claims y querés asegurar refresco
        const res = await user.getIdTokenResult(true);

        setClaims({
          role: (res.claims.role as string | undefined) ?? undefined,
          name: (res.claims.name as string | undefined) ?? user.displayName ?? undefined,
          email: user.email ?? undefined,
          user_id: (res.claims.user_id as string | undefined) ?? user.uid,
        });
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  return { claims, loading };
}