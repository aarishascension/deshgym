import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const RAZORPAY_WEBHOOK_SECRET = Deno.env.get("RAZORPAY_WEBHOOK_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  const body = await req.text();
  const sig = req.headers.get("x-razorpay-signature") || "";

  // Verify signature
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(RAZORPAY_WEBHOOK_SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  const expected = Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2, "0")).join("");
  if (expected !== sig) return new Response("Invalid signature", { status: 400 });

  const event = JSON.parse(body);
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  if (event.event === "payment.captured") {
    const { user_id, plan } = event.payload.payment.entity.notes;
    const period_end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    await supabase.from("subscriptions").upsert({
      user_id, plan, status: "active",
      razorpay_sub_id: event.payload.payment.entity.id,
      current_period_end: period_end,
    }, { onConflict: "user_id" });
  }

  return new Response("ok");
});
