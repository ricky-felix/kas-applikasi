import { PROJECTS, BILLING } from "@/lib/data";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { InvoiceView } from "@/screens/invoice";

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  const project = PROJECTS.find((p) => p.slug === code);
  if (!project) return { title: "Tagihan tidak ditemukan" };
  return { title: `Tagihan ${project.code} — ${project.name}` };
}

export default async function InvoicePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const project = PROJECTS.find((p) => p.slug === code);
  if (!project) notFound();
  return <InvoiceView project={project} billing={BILLING} />;
}
