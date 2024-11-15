import { signOutAction } from "@/app/auth/auth-actions";
import { Button } from "@/components/ui/button";
import UserDetails from "@/components/UserEmail";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-card p-6 border-r border-border flex flex-col">
        <nav className="space-y-4 flex-1">
          <Link href="" className="block text-lg font-semibold">
            Dashboard
          </Link>
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
            href="/admin/vitals-management"
            className="block text-muted-foreground hover:text-foreground transition-colors"
          >
            Vitals and Vital Readings
          </Link>
          <Link
            href="/admin/address-management"
            className="block text-muted-foreground hover:text-foreground transition-colors"
          >
            Manage Addresses
          </Link>
          <Link
            href="/admin/tasklist-management"
            className="block text-muted-foreground hover:text-foreground transition-colors"
          >
            Manage TaskLists
          </Link>

        </nav>
        <UserDetails />
      </aside>
      <main className="flex-1 p-10 overflow-auto">{children}</main>
    </div>
  );
}