import type { Project, BillingStage } from "@/lib/data";
import { InvoiceHeader } from "@/components/invoice/invoice-header";
import { InvoiceMeta } from "@/components/invoice/invoice-meta";
import { InvoiceSidebar } from "@/components/invoice/invoice-sidebar";

export function InvoiceView({ project, billing }: { project: Project; billing: BillingStage[] }) {
  const outstanding = project.contractValue - project.paid;
  const totalPaid = billing.filter((b) => b.status === "Paid").reduce((s, b) => s + b.amount, 0);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--kas-paper)", fontFamily: "var(--font-manrope), sans-serif", color: "var(--kas-ink)" }}>
      <InvoiceHeader code={project.code} />
      <div className="flex-1 grid" style={{ gridTemplateColumns: "1fr 340px" }}>
        <InvoiceMeta project={project} billing={billing} />
        <InvoiceSidebar project={project} totalPaid={totalPaid} outstanding={outstanding} />
      </div>
    </div>
  );
}
