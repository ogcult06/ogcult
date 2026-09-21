import { createFileRoute } from "@tanstack/react-router";

/**
 * Razorpay webhook — the authoritative payment confirmation path.
 * The signature is verified before anything is written, so an order can never
 * be marked paid by a request we cannot prove came from Razorpay.
 */
export const Route = createFileRoute("/api/public/webhooks/razorpay")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawBody = await request.text();
        const signature = request.headers.get("x-razorpay-signature") ?? "";

        const { verifyWebhookSignature, getAdmin, sendOrderConfirmationOnce } = await import(
          "@/lib/store.server"
        );

        if (!signature || !verifyWebhookSignature(rawBody, signature)) {
          return new Response("Invalid signature", { status: 401 });
        }

        let event: {
          event?: string;
          payload?: {
            payment?: { entity?: { id?: string; order_id?: string; amount?: number } };
            order?: { entity?: { id?: string } };
          };
        };
        try {
          event = JSON.parse(rawBody);
        } catch {
          return new Response("Bad payload", { status: 400 });
        }

        const payment = event.payload?.payment?.entity;
        const gatewayOrderId = payment?.order_id ?? event.payload?.order?.entity?.id;
        if (!gatewayOrderId) return new Response("ok");

        const admin = await getAdmin();
        const { data: row } = await admin
          .from("orders")
          .select("id, payment_status")
          .eq("gateway_order_id", gatewayOrderId)
          .maybeSingle();

        if (!row) return new Response("ok");
        const order = row as unknown as { id: string; payment_status: string };

        await admin.from("payments").insert({
          order_id: order.id,
          gateway_order_id: gatewayOrderId,
          gateway_payment_id: payment?.id ?? null,
          amount: payment?.amount ? payment.amount / 100 : 0,
          status: event.event ?? "webhook",
          raw_event: JSON.parse(rawBody),
        });

        const captured = event.event === "payment.captured" || event.event === "order.paid";
        const failed = event.event === "payment.failed";

        if (captured && order.payment_status !== "paid") {
          await admin
            .from("orders")
            .update({
              payment_status: "paid",
              order_status: "confirmed",
              gateway_payment_id: payment?.id ?? null,
              payment_reference: payment?.id ?? null,
              confirmed_at: new Date().toISOString(),
            })
            .eq("id", order.id);
          await admin.from("order_status_history").insert({
            order_id: order.id,
            status: "confirmed",
            note: `Payment confirmed by gateway webhook (${payment?.id ?? "n/a"})`,
          });
          await sendOrderConfirmationOnce(order.id);
        }

        if (failed && order.payment_status === "pending") {
          await admin.from("orders").update({ payment_status: "failed" }).eq("id", order.id);
        }

        return new Response("ok");
      },
    },
  },
});
