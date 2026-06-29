import { api } from "@/lib/api";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { InvoiceView } from "@/screens/invoice";

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  const projects = await api.getProjects();
  const project = projects.find((p) => p.slug === code);
  if (!project) return { title: "Tagihan tidak ditemukan" };
  return { title: `Tagihan ${project.code} — ${project.name}` };
}

export default async function InvoicePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const projects = await api.getProjects();
  const project = projects.find((p) => p.slug === code);
  if (!project) notFound();
  const billing = await api.getBillingForProject(project.slug);
  return <InvoiceView project={project} billing={billing} />;
}
