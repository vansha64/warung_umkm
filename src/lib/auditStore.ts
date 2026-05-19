"use client";

import { getSession } from "./authStore";

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  user: string;
  role: string;
  timestamp: string;
}

const AUDIT_KEY = "warunghub_audit_logs";

export function logAudit(action: string, details: string) {
  if (typeof window === "undefined") return;

  const session = getSession();
  const username = session ? session.username : "System";
  const role = session ? session.role : "System";

  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    action,
    details,
    user: username,
    role,
    timestamp: new Date().toISOString()
  };

  const stored = localStorage.getItem(AUDIT_KEY);
  let logs: AuditLog[] = [];
  if (stored) {
    try {
      logs = JSON.parse(stored);
    } catch (e) {}
  }

  // Keep only the latest 100 logs to save space
  const updatedLogs = [newLog, ...logs].slice(0, 100);
  localStorage.setItem(AUDIT_KEY, JSON.stringify(updatedLogs));
}

export function getAuditLogs(): AuditLog[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(AUDIT_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
}
