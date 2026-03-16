import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

// Tell Next.js not to parse the body — Stripe needs the raw bytes to verify the signature
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createClient();

  switch (event.type) {
    // Payment succeeded — grant Pro
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.supabase_user_id ?? session.client_reference_id;
      if (userId) {
        await supabase
          .from("user_profiles")
          .update({ is_pro: true })
          .eq("id", userId);
      }
      break;
    }

    // Subscription cancelled or payment failed — revoke Pro
    case "customer.subscription.deleted":
    case "invoice.payment_failed": {
      const obj = event.data.object as Stripe.Subscription | Stripe.Invoice;
      const customerId =
        "customer" in obj
          ? typeof obj.customer === "string"
            ? obj.customer
            : obj.customer?.id
          : undefined;

      if (customerId) {
        // Look up user by stripe_customer_id if you store it, or query by metadata
        // For now revoke by subscription metadata
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.supabase_user_id;
        if (userId) {
          await supabase
            .from("user_profiles")
            .update({ is_pro: false })
            .eq("id", userId);
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
