"use client";
import { MaterialRequestsTab } from "./material-tab";
import { ChangeOrderTab } from "./change-order-tab";

export { RequestsSubTabs } from "./sub-tabs";
export type { ReqSubTab } from "./sub-tabs";

export default function AMRequests({ sub, toast }: { sub: "material" | "changeorder"; toast: (m: string) => void }) {
  return (
    <div className="px-5 pt-4 pb-6">
      {sub === "material"    && <MaterialRequestsTab toast={toast} />}
      {sub === "changeorder" && <ChangeOrderTab toast={toast} />}
    </div>
  );
}
