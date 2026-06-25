"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase-client";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  isProvider: boolean;
  providerStatus: string | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isProvider, setIsProvider] = useState(false);
  const [providerStatus, setProviderStatus] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const [adminSnap, providerSnap] = await Promise.all([
          getDoc(doc(db, "admins", firebaseUser.uid)),
          getDoc(doc(db, "providers", firebaseUser.uid)),
        ]);

        setIsAdmin(adminSnap.exists());

        if (providerSnap.exists()) {
          setIsProvider(true);
          setProviderStatus(providerSnap.data().status ?? null);
        } else {
          setIsProvider(false);
          setProviderStatus(null);
        }
      } else {
        setIsAdmin(false);
        setIsProvider(false);
        setProviderStatus(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }

  async function logout() {
    await signOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isProvider, providerStatus, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
