import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { logout } from "@/app/actions";
import OwnerDashboard from "@/components/kas/owner";

export default async function OwnerPage() {
  const session = await getSession();
  if (!session || session.role !== "owner") redirect("/");

  return <OwnerDashboard onLogout={logout} />;
}
