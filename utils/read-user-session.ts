"use server";
import { createClient } from "./supabase/server";

export const readUserSession = async () => {
  const supabase = createClient();

  return await supabase.auth.getSession();
};
