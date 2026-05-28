import type { Project, BillingStage } from "@/lib/data";
import { InvoiceHeader } from "@/components/invoice/invoice-header";
import { InvoiceMeta } from "@/components/invoice/invoice-meta";
import { InvoiceSidebar } from "@/components/invoice/invoice-sidebar";

export function InvoiceView({ project, billing }: { project: Project; billing: BillingStage[] }) {
  const outstanding = project.contractValue - project.paid;
  const totalPaid = billing.filter((b) => b.status === "Paid").reduce((s, b) => s + b.amount, 0);

  return (
    <div className="min-h-screen flex items-start justify-center px-4 py-10 lg:py-16" style={{ background: "var(--kas-bg)", fontFamily: "var(--font-manrope), sans-serif", color: "var(--kas-ink)" }}>
      <div className="w-full max-w-[600px] lg:max-w-[900px]" style={{ background: "var(--kas-paper)", border: "1px solid var(--kas-ink)" }}>
        <InvoiceHeader code={project.code} />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px]">
          <InvoiceMeta project={project} billing={billing} />
          <InvoiceSidebar project={project} totalPaid={totalPaid} outstanding={outstanding} />
        </div>
      </div>
    </div>
  );
}
