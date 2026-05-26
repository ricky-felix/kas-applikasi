import { redirect } from "next/navigation";
import { getSession, roleToPath } from "@/lib/session";
import LoginScreen from "@/components/kas/login";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect(roleToPath(session.role));

  return (
    <div
      className="w-full h-screen flex items-center justify-center"
      style={{ background: "var(--kas-bg)" }}
    >
      <div
        className="w-full h-full sm:w-[390px] sm:h-[844px] sm:shadow-[0_0_0_1px_var(--kas-ink),0_32px_80px_rgba(22,28,44,0.25)] overflow-hidden"
        style={{ background: "var(--kas-paper)" }}
      >
        <LoginScreen />
      </div>
    </div>
  );
}
