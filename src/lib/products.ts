import hoodie from "@/assets/p-hoodie.jpg";
import tee from "@/assets/p-tee.jpg";
import cargo from "@/assets/p-cargo.jpg";
import jacket from "@/assets/p-jacket.jpg";

export type Product = {
  handle: string;
  title: string;
  price: number;
  category: string;
  image: string;
  drop: string;
  sizes: string[];
  soldOut?: boolean;
  description: string;
  details: string[];
};

/**
 * Catalog source of truth. Shaped like a Shopify product (handle, variants by
 * size, price) so it can be swapped for the Storefront API without touching UI.
 */
export const products: Product[] = [
  {
    handle: "void-heavyweight-hoodie",
    title: "Void Heavyweight Hoodie",
    price: 240,
    category: "Outerwear",
    image: hoodie,
    drop: "Vol. 01 / Nightshift",
    sizes: ["S", "M", "L", "XL", "XXL"],
    description:
      "620gsm loopback cotton, boxed shoulders, cut two sizes past comfortable. Dyed in a closed black bath so it fades slow and ugly-beautiful.",
    details: ["620gsm brushed loopback cotton", "Dropped shoulder, boxy body", "Tonal chest embroidery", "Made in Portugal"],
  },
  {
    handle: "ritual-washed-tee",
    title: "Ritual Washed Tee",
    price: 110,
    category: "Tops",
    image: tee,
    drop: "Vol. 01 / Nightshift",
    sizes: ["S", "M", "L", "XL"],
    description:
      "Garment-dyed and stone-washed until it looks inherited. Heavy enough to hold its own shape, soft enough to sleep in.",
    details: ["280gsm compact jersey", "Stone-washed vintage black", "Ribbed collar, twin-needle hem", "Made in Portugal"],
  },
  {
    handle: "shadow-wide-cargo",
    title: "Shadow Wide Cargo",
    price: 290,
    category: "Bottoms",
    image: cargo,
    drop: "Vol. 01 / Nightshift",
    sizes: ["28", "30", "32", "34", "36"],
    description:
      "Wide-leg technical nylon with articulated knee and bellowed thigh pockets. Built for the walk home at 4am.",
    details: ["Matte technical nylon", "Elastic waist with draw cord", "Bellowed cargo pockets", "Water-repellent finish"],
  },
  {
    handle: "cult-leather-bomber",
    title: "Cult Leather Bomber",
    price: 890,
    category: "Outerwear",
    image: jacket,
    drop: "Vol. 00 / Archive",
    sizes: ["S", "M", "L", "XL"],
    soldOut: true,
    description:
      "Hand-distressed lambskin bomber, ribbed collar and cuffs, sleeve pocket. Ninety made. None coming back.",
    details: ["Hand-distressed lambskin", "Cupro lining", "Ribbed collar and cuffs", "Limited to 90 pieces"],
  },
];

export const getProduct = (handle: string) => products.find((p) => p.handle === handle);

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
