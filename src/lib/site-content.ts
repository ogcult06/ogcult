/**
 * OG CULT editable content.
 * Everything a store owner may want to reword lives here — copy, policies,
 * measurements, social links. Product data always comes from Shopify.
 */

import heroImage from "@/assets/hero.jpg";
import editorialImage from "@/assets/editorial.jpg";
import look1 from "@/assets/p-hoodie.jpg";
import look2 from "@/assets/p-tee.jpg";
import look3 from "@/assets/p-cargo.jpg";
import look4 from "@/assets/p-jacket.jpg";

export const brand = {
  name: "OG CULT",
  instagramHandle: "@OGCULT",
  email: "hello@ogcult.com",
  studio: "Unit 04 — Old Street, London",
  socials: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "TikTok", href: "https://tiktok.com" },
  ],
};

/** Replace these with real campaign photography when available. */
export const imagery = {
  hero: heroImage,
  editorial: editorialImage,
  aboutPrimary: editorialImage,
  aboutSecondary: look4,
  instagram: [look1, look2, look3, look4, heroImage, editorialImage],
};

export const home = {
  heroHeadline: "Built different",
  heroSub: "Vol. 01 — Nightshift",
  dropTitle: "New drop",
  dropSub: "The latest from OG CULT.",
  editorialHeadline: "Not made for everyone.",
  marquee: ["Limited runs", "No restocks", "Cut in small batches", "Worldwide shipping"],
};

export const trustPoints = [
  { title: "Secure checkout", body: "Payments processed by Shopify." },
  { title: "Easy returns", body: "See shipping & returns for the current policy." },
  { title: "Quality garments", body: "Heavyweight fabrics, small-batch construction." },
];

export const about = {
  headline: "This is OG CULT.",
  intro: "A label for the ones who never asked to belong.",
  sections: [
    {
      title: "The idea",
      body: "OG CULT started as a refusal. No trends, no seasons, no permission. Garments made for people who move after dark and answer to nobody.",
    },
    {
      title: "The culture",
      body: "Built from street corners, basement shows and late trains home. The clothes carry that noise — worn in, not styled up.",
    },
    {
      title: "The clothes",
      body: "Heavyweight cotton, boxy cuts, washed blacks. Made in limited runs so nothing becomes a uniform.",
    },
    {
      title: "The people",
      body: "Not customers. Members. The ones who wear it until it looks nothing like it did new.",
    },
  ],
};

/** Editable measurement chart — values in centimetres. */
export const sizeGuide = {
  columns: ["Size", "Chest", "Length", "Shoulder", "Sleeve"],
  rows: [
    ["XS", "52", "66", "44", "60"],
    ["S", "54", "68", "46", "61"],
    ["M", "56", "70", "48", "62"],
    ["L", "58", "72", "50", "63"],
    ["XL", "60", "74", "52", "64"],
    ["XXL", "62", "76", "54", "65"],
  ],
  howToMeasure: [
    { title: "Chest", body: "Measure flat, armpit to armpit, and double it." },
    { title: "Length", body: "From the highest point of the shoulder straight down to the hem." },
    { title: "Shoulder", body: "Seam to seam across the back." },
    { title: "Sleeve", body: "From the shoulder seam to the cuff edge." },
  ],
  note: "Measurements are taken flat and may vary by 1–2 cm between batches. Update these values to match your production spec sheet.",
};

/** Placeholder policies — replace with your final legal copy. */
export const policies = {
  shipping: [
    {
      title: "Shipping",
      body: "[Add your shipping destinations, carriers and rates here. Rates are configured in Shopify and shown at checkout.]",
    },
    {
      title: "Processing time",
      body: "[Add how long orders take to leave the studio before dispatch.]",
    },
    {
      title: "Delivery",
      body: "[Add delivery windows per region. Tracking is emailed automatically by Shopify once an order ships.]",
    },
    {
      title: "Returns",
      body: "[Add your return window and conditions — unworn, tags attached, original packaging, etc.]",
    },
    {
      title: "Exchanges",
      body: "[Add whether size exchanges are offered and how to request one.]",
    },
    {
      title: "Damaged items",
      body: "[Add what a customer should do if an item arrives faulty, and the timeframe for reporting it.]",
    },
  ],
  privacy: [
    {
      title: "What we collect",
      body: "[Describe the data collected at checkout and via the newsletter. Orders and customer data are stored in Shopify.]",
    },
    { title: "How we use it", body: "[Describe order fulfilment, support and marketing use.]" },
    { title: "Third parties", body: "[List processors — Shopify, payment providers, fulfilment partners.]" },
    { title: "Your rights", body: "[Describe access, correction and deletion requests, and how to contact you.]" },
  ],
  terms: [
    { title: "Use of this site", body: "[Add your terms of use.]" },
    { title: "Orders", body: "[Add order acceptance, pricing and cancellation terms.]" },
    { title: "Intellectual property", body: "[Add ownership of brand assets and imagery.]" },
    { title: "Liability", body: "[Add your limitation of liability wording.]" },
  ],
};

export const shopFilters = [
  { label: "All", query: undefined },
  { label: "T-Shirts", query: "product_type:t-shirt OR title:tee OR title:t-shirt" },
  { label: "Hoodies", query: "product_type:hoodie OR title:hoodie OR title:hood" },
  { label: "New Drop", query: "tag:new-drop OR tag:new" },
] as const;
