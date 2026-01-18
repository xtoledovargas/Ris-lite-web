import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://jylhnqyaotyfvtnfxyll.supabase.co";
const SUPABASE_KEY = "sb_publishable_20tn3ITTgbQ4-OPtzZr6xg_5vQ-GX_Q";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
