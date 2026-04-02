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

// ── Subscriptions ─────────────────────────────────────────────────────────
export const getSubscription = async () => {
  if (!supabase) return null;
  const { data } = await supabase.from("subscriptions").select("*").single();
  return data;
};

export const createCheckout = async (plan: "pro" | "agency") => {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase.functions.invoke("razorpay-checkout", {
    body: { user_id: user.id, plan },
  });
  if (error) throw error;
  return data;
};

// ── Join leads ────────────────────────────────────────────────────────────
export const submitJoinLead = async (lead: { site_id: number; name: string; phone: string; email: string; plan: string }) => {
  if (!supabase) return;
  await supabase.functions.invoke("send-join-email", { body: lead });
};

// ── Subdomain ─────────────────────────────────────────────────────────────
export const setSubdomain = async (site_id: number, subdomain: string) => {
  if (!supabase) return null;
  const { data, error } = await supabase.from("sites").update({ subdomain }).eq("id", site_id).select().single();
  if (error) throw error;
  return data;
};

// ── Referrals ─────────────────────────────────────────────────────────────
export const generateReferralCode = (userId: string) =>
  `DG${userId.slice(0, 6).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

export const createReferral = async (code: string) => {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase.from("referrals").upsert({ referrer_id: user.id, code }, { onConflict: "code" }).select().single();
  if (error) console.error("createReferral:", error);
  return data;
};

export const applyReferral = async (code: string) => {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: ref } = await supabase.from("referrals").select("*").eq("code", code).single();
  if (!ref || ref.referred_id) return { error: "Invalid or already used code" };
  await supabase.from("referrals").update({ referred_id: user.id, status: "completed" }).eq("code", code);
  // Give referrer 1 free month
  await supabase.from("subscriptions").upsert({ user_id: ref.referrer_id, plan: "pro", status: "active", free_months_remaining: 1, current_period_end: new Date(Date.now() + 30*24*60*60*1000).toISOString() }, { onConflict: "user_id" });
  return { success: true };
};

export const getReferrals = async () => {
  if (!supabase) return [];
  const { data } = await supabase.from("referrals").select("*").order("created_at", { ascending: false });
  return data || [];
};
