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

/** Store policies. Review the wording and adjust to match your operations. */
export const policies = {
  shipping: [
    {
      title: "Shipping",
      body: "We ship worldwide from our studio. Live rates and duties are calculated at checkout based on your destination, and every order is dispatched with tracked delivery.",
    },
    {
      title: "Processing time",
      body: "Orders are picked, checked and packed within 1–2 working days. Orders placed on weekends or public holidays leave the studio on the next working day.",
    },
    {
      title: "Delivery",
      body: "India: 2–5 working days. Rest of world: 5–12 working days depending on customs. A tracking link is emailed automatically as soon as your parcel is scanned by the carrier.",
    },
    {
      title: "Returns",
      body: "Returns are accepted within 14 days of delivery on items that are unworn and unwashed, with all tags and original packaging intact. Email us with your order number and we will send return instructions. Return shipping is paid by the customer unless the item is faulty.",
    },
    {
      title: "Exchanges",
      body: "Size exchanges are offered once per order, subject to stock. Email us within 14 days of delivery with your order number and the size you need, and we will reserve it while your return is in transit.",
    },
    {
      title: "Damaged items",
      body: "If an item arrives faulty or incorrect, email us within 7 days of delivery with your order number and photographs of the issue. We will arrange a replacement or a full refund, including shipping, at no cost to you.",
    },
  ],
  privacy: [
    {
      title: "What we collect",
      body: "When you order we collect your name, email, phone number, shipping and billing address, and order contents. Payment card details are handled directly by our payment providers and never reach our servers. If you join the newsletter we store only your email address.",
    },
    {
      title: "How we use it",
      body: "Your data is used to process and deliver orders, provide customer support, prevent fraud, and — only with your consent — send occasional drop announcements. You can unsubscribe from marketing at any time using the link in any email.",
    },
    {
      title: "Third parties",
      body: "We share data only with the processors needed to run the store: Shopify (store, orders and customer records), our payment providers, and our shipping and fulfilment carriers. We never sell your personal data.",
    },
    {
      title: "Your rights",
      body: "You may request a copy of your data, ask us to correct it, or ask us to delete it, subject to the records we must legally keep for tax and accounting. Email us and we will respond within 30 days.",
    },
  ],
  terms: [
    {
      title: "Use of this site",
      body: "By browsing or ordering from this site you agree to these terms. You may not misuse the site, attempt to disrupt it, or use it for unlawful purposes. We may update these terms at any time; the version published here is the one that applies.",
    },
    {
      title: "Orders",
      body: "All orders are subject to acceptance and stock availability. Prices are shown in the currency at checkout and include applicable taxes where stated. If an item is mispriced or unavailable we may cancel the order and refund you in full. Cancellation requests are honoured if the order has not yet been dispatched.",
    },
    {
      title: "Intellectual property",
      body: "The OG CULT name, logo, artwork, garment graphics, photography and site copy are our property and may not be copied, reproduced or resold without written permission.",
    },
    {
      title: "Liability",
      body: "To the extent permitted by law, our liability for any claim relating to an order is limited to the amount you paid for that order. We are not liable for indirect or consequential loss. Nothing here limits your statutory consumer rights.",
    },
  ],
};

export const shopFilters = [
  { label: "All", query: undefined },
  { label: "T-Shirts", query: "product_type:t-shirt OR title:tee OR title:t-shirt" },
  { label: "Hoodies", query: "product_type:hoodie OR title:hoodie OR title:hood" },
  { label: "New Drop", query: "tag:new-drop OR tag:new" },
] as const;
