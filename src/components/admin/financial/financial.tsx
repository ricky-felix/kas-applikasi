"use client";
import { TagihanTab } from "./tagihan-tab";

export default function AMFinancial({ toast }: { toast: (m: string) => void }) {
  return (
    <div className="px-5 pt-4 pb-6">
      <TagihanTab toast={toast} />
    </div>
  );
}
