import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const { site_id, name, phone, email, plan } = await req.json();
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Save lead
  await supabase.from("join_leads").insert({ site_id, name, phone, email, plan });

  // Get site + owner email
  const { data: site } = await supabase.from("sites").select("name, user_id").eq("id", site_id).single();
  if (!site) return new Response("Site not found", { status: 404 });

  const { data: { user } } = await supabase.auth.admin.getUserById(site.user_id);
  const ownerEmail = user?.email;
  if (!ownerEmail) return new Response("ok", { headers: cors });

  // Send email via Resend
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "DeshGym <noreply@deshgym.in>",
      to: ownerEmail,
      subject: `🏋️ New Member Request — ${site.name}`,
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;background:#0a0a0a;color:#f0f0f0;padding:32px;border-radius:12px;">
          <h1 style="font-size:1.8rem;color:#e8ff00;margin-bottom:4px;">New Member Request!</h1>
          <p style="color:#555;margin-bottom:24px;">Someone wants to join <strong style="color:#f0f0f0;">${site.name}</strong></p>
          <table style="width:100%;border-collapse:collapse;">
            ${[["Name", name], ["Phone", phone], ["Email", email || "—"], ["Plan", plan || "—"]].map(([k, v]) =>
              `<tr><td style="padding:10px 0;color:#555;font-size:.85rem;border-bottom:1px solid #1a1a1a;">${k}</td><td style="padding:10px 0;color:#f0f0f0;font-size:.85rem;border-bottom:1px solid #1a1a1a;text-align:right;">${v}</td></tr>`
            ).join("")}
          </table>
          <a href="https://wa.me/${phone?.replace(/[^0-9]/g, "")}" style="display:inline-block;margin-top:24px;padding:12px 28px;background:#25d366;color:#fff;border-radius:7px;text-decoration:none;font-weight:700;">💬 WhatsApp ${name}</a>
          <p style="margin-top:24px;font-size:.75rem;color:#333;">Sent by DeshGym · deshgym-ai.vercel.app</p>
        </div>
      `,
    }),
  });

  return new Response("ok", { headers: cors });
});
