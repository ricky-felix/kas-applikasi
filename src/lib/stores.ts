"use client";
// Client-side hydrating stores.
//
// Each store starts empty and lazily fetches its collection from the backend
// (via ./api) the first time a component reads it. Components keep consuming the
// data synchronously through the use* hooks and re-render automatically once the
// live data arrives. This replaces the static dummy arrays that used to live in
// ./data.ts.

import { useSyncExternalStore } from "react";
import { api } from "./api";
import type {
  Project, Worker, Material, MaterialRequest, WorkReport, ChangeOrder,
  Expense, CashFlowEntry, CashAdvance, DailyAllowance, PendingRegistration,
  ProofSubmission, PayrollEntry,
} from "./data";

export type Store<T> = {
  get: () => T[];
  set: (next: T[]) => void;
  prepend: (item: T) => void;
  use: () => T[];
};

function createStore<T>(fetcher: () => Promise<T[]>): Store<T> {
  let data: T[] = [];
  let hydrated = false;
  let hydrating = false;
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((l) => l());

  async function hydrate() {
    if (hydrated || hydrating) return;
    hydrating = true;
    try {
      data = await fetcher();
      hydrated = true;
      emit();
    } catch (err) {
      console.error("[stores] hydrate failed:", err);
    } finally {
      hydrating = false;
    }
  }

  return {
    get: () => data,
    set: (next) => { data = next; emit(); },
    prepend: (item) => { data = [item, ...data]; emit(); },
    use() {
      if (!hydrated && !hydrating && typeof window !== "undefined") void hydrate();
      return useSyncExternalStore(
        (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
        () => data,
        () => data,
      );
    },
  };
}

// ── Stores ──────────────────────────────────────────────────────────────────

export const projectsStore        = createStore<Project>(api.getProjects);
export const workersStore         = createStore<Worker>(api.getWorkers);
export const materialsStore       = createStore<Material>(api.getMaterials);
export const materialRequestsStore = createStore<MaterialRequest>(api.getMaterialRequests);
export const workReportsStore     = createStore<WorkReport>(api.getWorkReports);
export const changeOrdersStore    = createStore<ChangeOrder>(api.getChangeOrders);
export const expensesStore        = createStore<Expense>(api.getExpenses);
export const cashFlowStore        = createStore<CashFlowEntry>(api.getCashFlows);
export const cashAdvancesStore    = createStore<CashAdvance>(api.getCashAdvances);
export const dailyAllowancesStore = createStore<DailyAllowance>(api.getDailyAllowances);
export const registrationsStore   = createStore<PendingRegistration>(api.getPendingRegistrations);
export const proofSubmissionsStore = createStore<ProofSubmission>(api.getProofSubmissions);
export const payrollStore         = createStore<PayrollEntry>(api.getPayroll);

// ── Hooks ─────────────────────────────────────────────────────────────────

export const useWorkers             = () => workersStore.use();
export const useMaterials           = () => materialsStore.use();
export const useMaterialRequests    = () => materialRequestsStore.use();
export const useWorkReports         = () => workReportsStore.use();
export const useChangeOrders        = () => changeOrdersStore.use();
export const useExpenses            = () => expensesStore.use();
export const useCashFlow            = () => cashFlowStore.use();
export const useCashAdvances        = () => cashAdvancesStore.use();
export const useDailyAllowances     = () => dailyAllowancesStore.use();
export const usePendingRegistrations = () => registrationsStore.use();
export const useProofSubmissions    = () => proofSubmissionsStore.use();
export const usePayroll              = () => payrollStore.use();
