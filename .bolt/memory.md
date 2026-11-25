# Project memory

## Product intent & audience

- Fashion/apparel storefront or lookbook-style site.
- Content organized by product categories (e.g., previously included Caps; now removed).

## Brand personality & voice

- Not yet inferred.

## Visual design & UX direction

- Homepage includes a lookbook/category strip: category cards with images.
- Navigation drawer lists product categories.
- Category entries pair a label with an imported image asset.
- Removing a category typically requires removing both the drawer entry and the lookbook card, plus any now-unused image import.

## Decisions, constraints & rationale

- Framework: Vite + React.
- "Caps" category removed from both the drawer and the homepage lookbook strip; associated `look4` image import removed.
- Goal: ensure a removed category no longer appears anywhere on the site.

## Open questions & assumptions

- Full category list and remaining lookbook assets not yet enumerated.
- Brand voice, color system, typography, and layout details not yet inferred.
- Accessibility and responsive behavior requirements not yet established.