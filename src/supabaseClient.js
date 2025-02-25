import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL ='https://wdtawhwuhcotkbcvbxgf.supabase.co'
const SUPABASE_ANON_KEY ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkdGF3aHd1aGNvdGtiY3ZieGdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MDEyMDMsImV4cCI6MjA1NjA3NzIwM30.rVJE-Xx_thh1_WPOef5ZxexHPagGjtVEgAV5GlFiZxg'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const uploadProfilePicture = async (file, userId) => {
  const { data, error } = await supabase.storage.from("avatars").upload(`public/${userId}`, file, {
    cacheControl: "3600",
    upsert: true,
  });
  return { data, error };
};