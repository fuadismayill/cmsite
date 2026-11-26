import { createClient, type SupabaseClient } from "@supabase/supabase-js";
let instance: SupabaseClient | undefined;
export function database() {
  return (instance ??= createClient(
    "https://ktrprrplobzkjpbzkxab.supabase.co",
    "sb_publishable_-RTvwkHTL6EM-Vi4qS5-vw_4HJmcn3U",
  ));
}
