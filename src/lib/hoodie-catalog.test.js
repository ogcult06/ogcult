import { describe, expect, test } from "bun:test";
import { createClient } from "@supabase/supabase-js";
import front from "@/assets/og-hustler-front-main.png.asset.json";
import back from "@/assets/og-hustler-back-main.png.asset.json";
import model from "@/assets/og-hustler-model.png.asset.json";
import details from "@/assets/og-hustler-details.png.asset.json";
import ccModelBack from "@/assets/culture-code-model-back.png.asset.json";
import ccModelFront from "@/assets/culture-code-model-front.png.asset.json";
import ccHoodieBack from "@/assets/culture-code-hoodie-back.png.asset.json";
import ccHoodieFront from "@/assets/culture-code-hoodie-front.png.asset.json";
import ccDetails from "@/assets/culture-code-details.png.asset.json";

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

async function cultureCodeHoodie() {
  const { data, error } = await client.from("products")
    .select("title, description, compare_at_price, product_type, images, active, product_variants(price, size, available)")
    .eq("handle", "culture-code-hoodie").single();
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
  test("product is tagged for New Drop", async () => {
    const { data, error } = await client
      .from("products")
      .select("handle, tags")
      .eq("handle", "og-hustler-hoodie")
      .single();
    if (error) throw error;
    expect(data.tags.some((t) => /new/i.test(t))).toBe(true);
  });
});

describe("Culture Code Hoodie catalogue", () => {
  test("original price is INR 4500 and sale price is INR 1199 for every variant", async () => {
    const product = await cultureCodeHoodie();
    expect(Number(product.compare_at_price)).toBe(4500);
    expect(product.product_variants.length).toBeGreaterThan(0);
    for (const variant of product.product_variants) {
      expect(Number(variant.price)).toBe(1199);
      expect(variant.available).toBe(true);
    }
  });
  test("images are ordered model back, model front, hoodie back, hoodie front, details", async () => {
    const images = (await cultureCodeHoodie()).images;
    expect(images.map(image => image.url)).toEqual([
      ccModelBack.url,
      ccModelFront.url,
      ccHoodieBack.url,
      ccHoodieFront.url,
      ccDetails.url,
    ]);
  });
  test("product is listed in Hoodies with the requested title and description", async () => {
    const product = await cultureCodeHoodie();
    expect(product.title).toBe("Culture Code Hoodie");
    expect(product.product_type).toBe("Hoodies");
    expect(product.active).toBe(true);
    expect(product.description).toContain("OG CULT – Culture Code Hoodie");
    expect(product.description).toContain("Stay Original. Stay OG.");
  });
  test("product is tagged for New Drop and ordered first in the catalogue", async () => {
    const { data, error } = await client
      .from("products")
      .select("handle, tags, sort_order")
      .eq("active", true)
      .order("sort_order", { ascending: true });
    if (error) throw error;
    expect(data[0]?.handle).toBe("culture-code-hoodie");
    expect(data[0]?.tags.some((t) => /new/i.test(t))).toBe(true);
    expect(data[1]?.handle).toBe("og-hustler-hoodie");
  });
});