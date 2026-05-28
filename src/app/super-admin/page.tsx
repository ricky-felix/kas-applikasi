import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { logout } from "@/app/actions";
import SuperAdmin from "@/screens/super-admin";

export default async function SuperAdminPage() {
  const session = await getSession();
  if (!session || session.role !== "super_admin") redirect("/");

  return (
    <div className="w-full h-screen overflow-hidden" style={{ background: "var(--kas-bg)" }}>
      <SuperAdmin session={session} onLogout={logout} />
    </div>
  );
}
