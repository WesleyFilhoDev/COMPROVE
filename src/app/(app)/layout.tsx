import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { findCompanyById } from "@/server/models/company";
import type { UserRole } from "@/generated/prisma/client";
import { Sidebar } from "@/components/app/sidebar";
import { BottomNav } from "@/components/app/bottom-nav";
import { MobileHeaderActions } from "@/components/app/mobile-header-actions";
import { Logo } from "@/components/logo";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getCompanyInitials(name: string): string {
  return name.trim().slice(0, 2).toUpperCase();
}

function getRoleLabel(role: UserRole | null): string {
  if (role === "ADMIN") return "Gestora da conta";
  if (role === "COLLABORATOR") return "Instrutor";
  return "Membro";
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  const user = session.user as typeof session.user & {
    role: UserRole | null;
    companyId: string | null;
  };

  if (!user.companyId) {
    redirect("/login");
  }

  const company = await findCompanyById(user.companyId);
  const companyName = company?.name ?? "Minha empresa";
  const companyInitials = getCompanyInitials(companyName);
  const userInitials = getInitials(user.name ?? "U");
  const userRole = getRoleLabel(user.role);

  return (
    <>
      {/* Desktop sidebar — hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar
          userName={user.name ?? "Usuário"}
          userRole={userRole}
          companyName={companyName}
          companyInitials={companyInitials}
          userInitials={userInitials}
          isAdmin={user.role === "ADMIN"}
        />
      </div>

      {/* Mobile header — hidden on desktop */}
      <header
        className="md:hidden"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          height: 56,
          background: "var(--card)",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
        }}
      >
        <Logo size={24} tone="positive" variant="horizontal" />
        <MobileHeaderActions userInitials={userInitials} />
      </header>

      {/* Main content */}
      <div
        className="md:pl-[220px]"
        style={{
          minHeight: "100vh",
          background: "var(--nevoa)",
        }}
      >
        {/* Spacer for mobile fixed header */}
        <div className="md:hidden" style={{ height: 56 }} />

        {children}

        {/* Spacer for mobile bottom nav */}
        <div className="md:hidden" style={{ height: 72 }} />
      </div>

      {/* Mobile bottom nav — hidden on desktop */}
      <div className="md:hidden">
        <BottomNav isAdmin={user.role === "ADMIN"} />
      </div>
    </>
  );
}
