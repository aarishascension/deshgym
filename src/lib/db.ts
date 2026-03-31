import { supabase } from "./supabase";

export type DBSite = {
  id: number; user_id?: string; name: string; tagline: string; type: string;
  location: string; price: string; theme: string; slug: string; url: string;
  html: string; form_data?: object; sel_amns?: string[]; c_plans?: object[];
  versions?: object[]; published?: boolean; views?: number; joins?: number; created_at?: string;
};

// ── Auth ──────────────────────────────────────────────────────────────────
export const signUp = (email: string, password: string) =>
  supabase?.auth.signUp({ email, password });

export const signIn = (email: string, password: string) =>
  supabase?.auth.signInWithPassword({ email, password });

export const signOut = () => supabase?.auth.signOut();

export const getUser = () => supabase?.auth.getUser();

export const onAuthChange = (cb: (user: object | null) => void) =>
  supabase?.auth.onAuthStateChange((_, session) => cb(session?.user ?? null));

// ── Sites ─────────────────────────────────────────────────────────────────
export const saveSite = async (site: DBSite) => {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase.from("sites").upsert({
    ...site, user_id: user.id,
    form_data: site.form_data || null,
    sel_amns: site.sel_amns || [],
    c_plans: site.c_plans || [],
    versions: site.versions || [],
  }).select().single();
  if (error) console.error("saveSite:", error);
  return data;
};

export const loadSites = async () => {
  if (!supabase) return [];
  const { data, error } = await supabase.from("sites").select("*").order("created_at", { ascending: false });
  if (error) console.error("loadSites:", error);
  return data || [];
};

export const deleteSite = async (id: number) => {
  if (!supabase) return;
  await supabase.from("sites").delete().eq("id", id);
};

export const publishSite = async (id: number, published: boolean) => {
  if (!supabase) return;
  await supabase.from("sites").update({ published }).eq("id", id);
};

export const incrementViews = async (id: number) => {
  if (!supabase) return;
  try { await supabase.rpc("increment_views", { site_id: id }); } catch {}
};
