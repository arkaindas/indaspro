'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuthContext } from './AuthContext';
import { updateUser } from '@/lib/firestore';

type Role = 'customer' | 'provider' | 'admin';

interface RoleContextValue {
  activeRole: Role;
  switchRole: (role: Role) => Promise<void>;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { user, firebaseUser, refreshUser } = useAuthContext();
  const [activeRole, setActiveRole] = useState<Role>('customer');

  useEffect(() => {
    if (user?.activeRole) {
      setActiveRole(user.activeRole);
    }
  }, [user]);

  const switchRole = async (role: Role) => {
    setActiveRole(role);
    if (firebaseUser) {
      await updateUser(firebaseUser.uid, { activeRole: role });
      await refreshUser();
    }
  };

  return <RoleContext.Provider value={{ activeRole, switchRole }}>{children}</RoleContext.Provider>;
}

export function useRoleContext() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRoleContext must be used within RoleProvider');
  return ctx;
}
