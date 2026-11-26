import { createClient, type SupabaseClient } from "@supabase/supabase-js";
let instance: SupabaseClient | undefined;
export function database() {
  return (instance ??= createClient(
    "https://ktrprrplobzkjpbzkxab.supabase.co",
    "sb_publishable_l35jnyuclubR62_ZzHBVEA_4wqMK8LW",
  ));
}
