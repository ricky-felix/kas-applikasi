"use client";
import { type Project } from "./data";
import { projectsStore } from "./stores";

// Shared client-side project store. Backed by the generic hydrating store in
// ./stores (which fetches live projects from the backend). Kept as its own
// module for the create-project helpers used by the Admin UI.

export function addProject(p: Project) {
	projectsStore.prepend(p);
}

export function getProjects(): Project[] {
	return projectsStore.get();
}

export function nextProjectCode(): string {
	const max = projectsStore.get().reduce((n, p) => {
		const m = p.code.match(/KAS-\d{4}-(\d+)/);
		return m ? Math.max(n, parseInt(m[1])) : n;
	}, 0);
	return `KAS-2026-${String(max + 1).padStart(3, "0")}`;
}

export function useProjects(): Project[] {
	return projectsStore.use();
}
s;
