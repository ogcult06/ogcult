import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { getSettings, saveSettings } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: () => ({
    meta: [
      { title: "Store Settings — OG CULT Admin" },
      { name: "description", content: "Configure OG CULT store charges and contact details." },
      { property: "og:title", content: "Store Settings — OG CULT Admin" },
      { property: "og:description", content: "Configure OG CULT store settings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminSettingsPage,
});

const inputClass =
  "w-full border border-border bg-transparent px-4 py-2.5 text-sm text-foreground outline-none focus:border-foreground";

type Form = {
  cod_charge: string;
  shipping_charge: string;
  free_shipping_threshold: string;
  store_email: string;
  support_email: string;
  support_phone: string;
  order_prefix: string;
  next_order_number: string;
  processing_note: string;
  prepaid_enabled: boolean;
  cod_enabled: boolean;
};

function AdminSettingsPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => getSettings(),
  });

  const [form, setForm] = useState<Form | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!data) return;
    const s = data.settings as unknown as Record<string, unknown>;
    setForm({
      cod_charge: String(s["cod_charge"] ?? 0),
      shipping_charge: String(s["shipping_charge"] ?? 0),
      free_shipping_threshold: String(s["free_shipping_threshold"] ?? 0),
      store_email: String(s["store_email"] ?? ""),
      support_email: String(s["support_email"] ?? ""),
      support_phone: String(s["support_phone"] ?? ""),
      order_prefix: String(s["order_prefix"] ?? "OG-"),
      next_order_number: String(s["next_order_number"] ?? 1001),
      processing_note: String(s["processing_note"] ?? ""),
      prepaid_enabled: Boolean(s["prepaid_enabled"]),
      cod_enabled: Boolean(s["cod_enabled"]),
    });
  }, [data]);

  const save = async () => {
    if (!form) return;
    setSaving(true);
    try {
      await saveSettings({
        data: {
          cod_charge: Number(form.cod_charge) || 0,
          shipping_charge: Number(form.shipping_charge) || 0,
          free_shipping_threshold: Number(form.free_shipping_threshold) || 0,
          store_email: form.store_email,
          support_email: form.support_email,
          support_phone: form.support_phone,
          order_prefix: form.order_prefix,
          next_order_number: Number(form.next_order_number) || 1001,
          processing_note: form.processing_note,
          prepaid_enabled: form.prepaid_enabled,
          cod_enabled: form.cod_enabled,
        },
      });
      await refetch();
      toast.success("Settings saved");
    } catch (error) {
      console.error(error);
      toast.error("Could not save settings");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !form) {
    return (
      <div className="px-5 pt-28 pb-24 md:px-10">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const set = (key: keyof Form) => (value: string | boolean) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  return (
    <div className="px-5 pt-28 pb-24 md:px-10 md:pt-32">
      <Link to="/admin" className="label hover:!text-foreground">
        ← All orders
      </Link>
      <h1 className="display-lg mt-6">Settings</h1>

      <div className="mt-10 grid max-w-3xl gap-5 border-t border-border/60 pt-10 sm:grid-cols-2">
        {(
          [
            ["COD charge", "cod_charge"],
            ["Shipping charge", "shipping_charge"],
            ["Free shipping above", "free_shipping_threshold"],
            ["Store email", "store_email"],
            ["Support email", "support_email"],
            ["Support phone", "support_phone"],
            ["Order prefix", "order_prefix"],
            ["Next order number", "next_order_number"],
          ] as Array<[string, keyof Form]>
        ).map(([label, key]) => (
          <label key={key} className="block">
            <span className="label">{label}</span>
            <input
              className={`${inputClass} mt-2`}
              value={String(form[key])}
              onChange={(e) => set(key)(e.target.value)}
            />
          </label>
        ))}

        <label className="block sm:col-span-2">
          <span className="label">Processing note shown to customers</span>
          <textarea
            className={`${inputClass} mt-2 min-h-[90px]`}
            value={form.processing_note}
            onChange={(e) => set("processing_note")(e.target.value)}
          />
        </label>

        <div className="sm:col-span-2 flex flex-wrap gap-6">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={form.prepaid_enabled}
              onChange={(e) => set("prepaid_enabled")(e.target.checked)}
            />
            <span className="label">Online payment enabled</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={form.cod_enabled}
              onChange={(e) => set("cod_enabled")(e.target.checked)}
            />
            <span className="label">Cash on Delivery enabled</span>
          </label>
        </div>
      </div>

      <div className="mt-10 max-w-3xl border-t border-border/60 pt-8">
        <p className="label">Integrations</p>
        <p className="mt-3 text-[0.75rem] text-muted-foreground">
          Online payments: {data?.gateway.razorpayConfigured ? "connected" : "not connected"}
          <br />
          Order emails: {data?.emailConfigured ? "ready" : "not configured"}
        </p>
      </div>

      <button type="button" onClick={save} disabled={saving} className="btn-cult mt-8">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save settings"}
      </button>
    </div>
  );
}
