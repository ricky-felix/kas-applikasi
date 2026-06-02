"use client";
import { useSyncExternalStore } from "react";
import { PROJECTS, type Project } from "./data";

// Shared client-side project store so projects created in the Admin (mobile)
// interface and the Super Admin (desktop) interface are visible in both.
// Seeded from the static demo data; new projects are prepended.
let projects: Project[] = [...PROJECTS];
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function addProject(p: Project) {
  projects = [p, ...projects];
  emit();
}

export function getProjects(): Project[] {
  return projects;
}

export function nextProjectCode(): string {
  const max = projects.reduce((n, p) => {
    const m = p.code.match(/KAS-\d{4}-(\d+)/);
    return m ? Math.max(n, parseInt(m[1])) : n;
  }, 0);
  return `KAS-2026-${String(max + 1).padStart(3, "0")}`;
}

export function useProjects(): Project[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => projects,
    () => projects,
  );
}
