import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { logout } from "@/app/actions";
import WorkerScreen from "@/components/kas/worker";

export default async function WorkerPage() {
  const session = await getSession();
  if (!session || session.role !== "worker") redirect("/");

  return <WorkerScreen session={session} onLogout={logout} />;
}
