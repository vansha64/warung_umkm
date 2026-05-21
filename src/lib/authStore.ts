"use client";

export type Role = "owner" | "cashier";

export interface UserSession {
  username: string;
  role: Role;
  loginTime: number;
  lastActive: number;
}

export interface UserAccount {
  id: string;
  username: string;
  passwordHash: string; // Plaintext for demo, usually hashed
  role: Role;
  createdAt: number;
}

const AUTH_KEY = "warunghub_auth_session";
const ACCOUNTS_KEY = "warunghub_accounts";
const SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes inactive

export function getAccounts(): UserAccount[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(ACCOUNTS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Default accounts for demo
  const defaultAccounts: UserAccount[] = [
    { id: "1", username: "sri", passwordHash: "owner123", role: "owner", createdAt: Date.now() },
    { id: "2", username: "kasir", passwordHash: "kasir123", role: "cashier", createdAt: Date.now() }
  ];
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(defaultAccounts));
  return defaultAccounts;
}

export function saveAccounts(accounts: UserAccount[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  }
}

export function addAccount(account: Omit<UserAccount, "id" | "createdAt">): boolean {
  const accounts = getAccounts();
  if (accounts.some(a => a.username === account.username)) {
    return false; // Username already exists
  }
  
  const newAccount: UserAccount = {
    ...account,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: Date.now()
  };
  
  saveAccounts([...accounts, newAccount]);
  return true;
}

export function deleteAccount(id: string): boolean {
  const accounts = getAccounts();
  const filtered = accounts.filter(a => a.id !== id);
  if (filtered.length === accounts.length) return false;
  
  // Ensure at least one owner remains
  if (accounts.find(a => a.id === id)?.role === "owner" && 
      filtered.filter(a => a.role === "owner").length === 0) {
    return false; // Cannot delete last owner
  }
  
  saveAccounts(filtered);
  return true;
}

export function login(username: string, passwordHash: string): { success: boolean; error?: string; role?: Role } {
  if (typeof window === "undefined") return { success: false, error: "Server error" };
  
  const accounts = getAccounts();
  const account = accounts.find(a => a.username === username && a.passwordHash === passwordHash);
  
  if (!account) {
    return { success: false, error: "Username atau password salah!" };
  }
  
  const now = Date.now();
  const session: UserSession = {
    username: account.username,
    role: account.role,
    loginTime: now,
    lastActive: now,
  };
  
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  return { success: true, role: account.role };
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_KEY);
  }
}

export function getSession(): UserSession | null {
  if (typeof window === "undefined") return null;
  
  const sessionStr = localStorage.getItem(AUTH_KEY);
  if (!sessionStr) return null;
  
  try {
    const session: UserSession = JSON.parse(sessionStr);
    const now = Date.now();
    
    // Check if session expired
    if (now - session.lastActive > SESSION_TIMEOUT_MS) {
      logout();
      return null;
    }
    
    // Update last active
    session.lastActive = now;
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    return session;
  } catch (e) {
    logout();
    return null;
  }
}

export function hasAccess(allowedRoles: Role[]): boolean {
  const session = getSession();
  if (!session) return false;
  return allowedRoles.includes(session.role);
}
