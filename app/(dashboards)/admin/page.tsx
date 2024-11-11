import Link from "next/link"

async function AdminDashboard() {
  return (
    <>
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
          </>
    )
}

export default AdminDashboard