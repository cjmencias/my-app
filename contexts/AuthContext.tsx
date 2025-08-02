import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

interface AuthContextType {
  user: UserInfo | null;
  setUser: (user: UserInfo | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
