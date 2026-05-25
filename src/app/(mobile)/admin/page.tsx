import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { logout } from "@/app/actions";
import AdminMobile from "@/components/kas/admin-mobile";

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/");

  return <AdminMobile session={session} onLogout={logout} />;
}
