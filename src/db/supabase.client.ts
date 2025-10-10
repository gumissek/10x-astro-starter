import { createClient } from "@supabase/supabase-js";

import type { Database } from "../db/database.types";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type SupabaseClient = typeof supabaseClient;

export const DEFAULT_USER_ID = "8335a994-19cf-4308-b2cd-fdbde3785dac";

export const DEFAULT_FOLDER_ID = "7330b870-9f71-4031-9403-408840bac739";

export const DEFAULT_FLASHCARD_ID = "94d14360-733c-4b0f-81d9-00d22ca251a5";