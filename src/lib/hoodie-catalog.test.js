import { describe, expect, test } from "bun:test";
import { createClient } from "@supabase/supabase-js";
import front from "@/assets/og-hustler-front-main.png.asset.json";
import back from "@/assets/og-hustler-back-main.png.asset.json";
import model from "@/assets/og-hustler-model.png.asset.json";
import details from "@/assets/og-hustler-details.png.asset.json";

const url = process.env['VITE_SUPABASE_URL'];
const key = process.env['VITE_SUPABASE_PUBLISHABLE_KEY'];
if (!url || !key) throw new Error("Catalogue test requires public app configuration");
const client = createClient(url, key, { auth: { persistSession: false } });

async function hoodie() {
  const { data, error } = await client.from("products")
    .select("compare_at_price, product_type, images, active, product_variants(price, size, available)")
    .eq("handle", "og-hustler-hoodie").single();
  if (error) throw error;
  return data;
}

describe("OG HUSTLER catalogue", () => {
  test("available sizes are exactly S, M, L, XL", async () => {
    const variants = (await hoodie()).product_variants;
    expect(variants.map(variant => variant.size).sort()).toEqual(["L", "M", "S", "XL"]);
    for (const variant of variants) expect(variant.available).toBe(true);
  });
  test("original price is INR 4500", async () => {
    expect(Number((await hoodie()).compare_at_price)).toBe(4500);
  });
  test("sale price is INR 1199 for every variant", async () => {
    const variants = (await hoodie()).product_variants;
    expect(variants.length).toBeGreaterThan(0);
    for (const variant of variants) expect(Number(variant.price)).toBe(1199);
  });
  test("images are ordered front, back, model, details", async () => {
    const images = (await hoodie()).images;
    expect(images.map(image => image.url)).toEqual([front.url, back.url, model.url, details.url]);
  });
  test("product is listed in Hoodies", async () => {
    const product = await hoodie();
    expect(product.product_type).toBe("Hoodies");
    expect(product.active).toBe(true);
  });
  test("product is tagged for New Drop and ordered first in the catalogue", async () => {
    const { data, error } = await client
      .from("products")
      .select("handle, tags, sort_order")
      .eq("active", true)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    expect(data[0]?.handle).toBe("og-hustler-hoodie");
    expect(data[0]?.tags.some((t) => /new/i.test(t))).toBe(true);
  });
});