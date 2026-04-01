import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RAZORPAY_KEY_ID = Deno.env.get("RAZORPAY_KEY_ID")!;
const RAZORPAY_KEY_SECRET = Deno.env.get("RAZORPAY_KEY_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const { user_id, plan } = await req.json();
  const amount = plan === "pro" ? 49900 : 199900; // paise
  const planName = plan === "pro" ? "DeshGym Pro" : "DeshGym Agency";

  // Create Razorpay order
  const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
  const order = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { "Authorization": `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({ amount, currency: "INR", receipt: `deshgym_${user_id}_${Date.now()}`, notes: { user_id, plan } }),
  }).then(r => r.json());

  return new Response(JSON.stringify({
    order_id: order.id,
    amount: order.amount,
    currency: order.currency,
    key: RAZORPAY_KEY_ID,
    plan_name: planName,
  }), { headers: { ...cors, "Content-Type": "application/json" } });
});
