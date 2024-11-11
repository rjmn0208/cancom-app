import Link from 'next/link'
import React from 'react'

const Page = () => {
  return (
    <div>
      <Link href="" className="block text-lg font-semibold">
            Dashboard
      </Link>
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
</div>
  )
}

export default Page