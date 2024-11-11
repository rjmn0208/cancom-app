import { Button } from "@/components/ui/button"
import { Info } from "lucide-react"
import Link from "next/link"

export default function Page() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-5 text-center">
      <h1 className="text-4xl font-bold mb-6">Welcome to Cancer Companion</h1>
      <Info className="w-24 h-24 mb-6 text-primary" aria-hidden="true" />
      <p className="text-lg mb-8">Your companion in the fight against cancer.</p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild>
          <Link href="/sign-in">Sign In</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/sign-up">Sign Up</Link>
        </Button>
      </div>
    </main>
  )
}