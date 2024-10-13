"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";



export const signUpAction = async (formData: FormData) => {
  const supabase = createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)
  console.log(error)

  if (error) {
    return redirect('/error')
  }

  return redirect('/message');
};

export const signInAction = async (formData: FormData) => {
  const supabase = createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { data: signinData, error: signInErr } = await supabase.auth.signInWithPassword(data)
  console.log(signInErr)

  if (signInErr) {
    return redirect('/error')
  }

  revalidatePath('/', 'layout')
  return redirect('/')
};

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

