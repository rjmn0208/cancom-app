import { signOutAction } from "@/app/auth/auth-actions";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

const AuthButton = async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? (
    <div>
      <p>{user.email}</p>
      <form action={signOutAction}>
        <button type="submit">Sign Out</button>
      </form>
    </div>
  ) : (
    <div>
      <Link href="/sign-in">Sign In</Link>
      <Link href="/sign-up">Sign up</Link>
    </div>
  );
};

export default AuthButton;
