"use client";
import { TagihanTab } from "./tagihan-tab";
import { RiwayatTab } from "./riwayat-tab";
import { MaterialTab } from "./material-tab";

export { FinancialSubTabs } from "./sub-tabs";
export type { SubTab } from "./sub-tabs";

export default function AMFinancial({ sub, toast }: { sub: "tagihan" | "riwayat" | "material"; toast: (m: string) => void }) {
  return (
    <div className="px-5 pt-4 pb-6">
      {sub === "tagihan"  && <TagihanTab toast={toast} />}
      {sub === "riwayat"  && <RiwayatTab />}
      {sub === "material" && <MaterialTab />}
    </div>
  );
}
