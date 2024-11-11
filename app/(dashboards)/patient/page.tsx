import Link from 'next/link'
import React from 'react'

const Page = () => {
  return (
    <div>
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
        href="/patient/profile"
        className="block text-muted-foreground hover:text-foreground transition-colors"
      >
        Profile
      </Link>
      <Link
        href="/patient/task-list"
        className="block text-muted-foreground hover:text-foreground transition-colors"
      >
        Manage Tasks
      </Link>
      <Link
        href="/patient/vitalreadings"
        className="block text-muted-foreground hover:text-foreground transition-colors"
      >
        Vitals Log
      </Link>
</div>
  )
}

export default Page