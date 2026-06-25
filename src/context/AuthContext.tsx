'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getUserById } from '@/lib/firestore';
import type { User } from '@/types';

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async (fbUser: FirebaseUser | null) => {
    if (!fbUser) {
      setUser(null);
      return;
    }
    const profile = await getUserById(fbUser.uid);
    setUser(profile);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      await loadUser(fbUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const refreshUser = async () => {
    await loadUser(firebaseUser);
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
