import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/auth/auth-actions";
import UserDetails from "@/components/UserDetails";

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
            href="/caretaker"
            className="block text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>
          <Link
            href="/caretaker/profile"
            className="block text-muted-foreground hover:text-foreground transition-colors"
          >
            Profile
          </Link>
          <Link
            href="/caretaker/view-tasklist"
            className="block text-muted-foreground hover:text-foreground transition-colors"
          >
            View Tasklists
          </Link>
          <Link
            href="/caretaker/vitalreadings"
            className="block text-muted-foreground hover:text-foreground transition-colors"
          >
            Log vitals for patient
          </Link>
        </nav>
        <UserDetails />
      </aside>
      <main className="flex-1 p-10 overflow-auto">{children}</main>
    </div>
  );
}
