import { createClient } from "@supabase/supabase-js";

import { env } from "../config/env.js";

const serverAuthConfig = {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
};

export const supabaseAuthClient = createClient(env.supabaseUrl, env.supabaseAnonKey, serverAuthConfig);
export const supabaseAdminClient = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, serverAuthConfig);
