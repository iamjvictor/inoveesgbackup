import { type ReactNode } from "react";
import { AdminLoginScreen } from "@/features/admin/shared/components/admin-login-screen";
import { AdminShell } from "@/features/admin/shared/components/admin-shell";
import { getAdminSession } from "@/features/admin/shared/server-auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getAdminSession();

  if (!session) {
    return <AdminLoginScreen />;
  }

  return <AdminShell adminUser={session.user}>{children}</AdminShell>;
}
