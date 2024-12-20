import { signOutAction } from "@/app/auth/auth-actions";
import { Button } from "@/components/ui/button";
import UserDetails from "@/components/UserDetails";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-card p-6 border-r border-border flex flex-col">
        <nav className="space-y-4 flex-1">
          <h1 className="block text-lg font-semibold">
            Dashboard
          </h1>
          <Link
            href="/admin"
            className="block text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>
          <Link
            href="/admin/account-management"
            className="block text-muted-foreground hover:text-foreground transition-colors"
          >
            Account Management
          </Link>
          <Link
            href="/admin/users"
            className="block text-muted-foreground hover:text-foreground transition-colors"
          >
            User Management
          </Link>
          <Link
            href="/admin/vitalreadings"
            className="block text-muted-foreground hover:text-foreground transition-colors"
          >
            Patient Vital Readings
          </Link>
          <Link
            href="/admin/tasklist-management"
            className="block text-muted-foreground hover:text-foreground transition-colors"
          >
            Manage TaskLists
          </Link>
          <Link
            href="/admin/medical-values"
            className="block text-muted-foreground hover:text-foreground transition-colors"
          >
            Manage Medical Values
          </Link>

          <Link
            href="/admin/medical-institutions"
            className="block text-muted-foreground hover:text-foreground transition-colors"
          >
            Manage Medical Institutions
          </Link>
        </nav>
        <UserDetails />
      </aside>
      <main className="flex-1 p-10 overflow-auto">{children}</main>
    </div>
  );
}
