"use client";

export type Role = "owner" | "cashier";

export interface UserSession {
  username: string;
  role: Role;
  loginTime: number;
  lastActive: number;
}

const AUTH_KEY = "warunghub_auth_session";
const SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes inactive

export function login(username: string, role: Role): boolean {
  if (typeof window === "undefined") return false;
  
  const now = Date.now();
  const session: UserSession = {
    username,
    role,
    loginTime: now,
    lastActive: now,
  };
  
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  return true;
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
