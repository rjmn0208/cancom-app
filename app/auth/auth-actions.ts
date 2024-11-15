"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";



export const signOutAction = async () => {
  const supabase = createClient();
  await supabase.auth.signOut();
  return redirect('/sign-in')
};

export const signInWithGoogle = async() => {
  const supabase = createClient()
  const origin = headers().get("origin");
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo:  `${origin}/auth/callback/`,
    },
  })
  
  if (data.url) {
    return redirect(data.url) // use the redirect API for your server framework
  }

}

