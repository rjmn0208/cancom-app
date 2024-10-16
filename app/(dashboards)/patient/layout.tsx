import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/auth/auth-actions";

async function getPatientTasklist(){
  
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-card p-6 border-r border-border flex flex-col">
        <nav className="space-y-4 flex-1">
          <Link href="" className="block text-lg font-semibold">
            Dashboard
          </Link>
          <Link
            href="/patient"
            className="block text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>
          <Link
            href="/patient/tasklist"
            className="block text-muted-foreground hover:text-foreground transition-colors"
          >
            Task List
          </Link>
          <Link
            href="/patient/profile"
            className="block text-muted-foreground hover:text-foreground transition-colors"
          >
            Profile
          </Link>
          <Link
            href="/patient/journals"
            className="block text-muted-foreground hover:text-foreground transition-colors"
          >
            Journals
          </Link>
          <Link
            href="/patient/vitalreadings"
            className="block text-muted-foreground hover:text-foreground transition-colors"
          >
            Vitals Log
          </Link>
        </nav>
        <form action={signOutAction}>
          <Button variant='destructive' type='submit'>Sign Out</Button>
        </form>
      </aside>
      <main className="flex-1 p-10 overflow-auto">{children}</main>
    </div>
  );
}
