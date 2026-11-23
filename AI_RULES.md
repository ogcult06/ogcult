# AI_RULES.md — OG CULT E-commerce App

## Tech Stack (9 bullets)

- **Framework**: TanStack Start (React 19) with file-based routing via TanStack Router
- **Language**: TypeScript (strict mode) with ES modules
- **Styling**: Tailwind CSS v4 with custom design system (OKLCH color tokens, zero-radius, Anton/Space Grotesk fonts)
- **UI Components**: shadcn/ui (New York style) built on Radix UI primitives + class-variance-authority
- **State Management**: TanStack Query (server state) + Zustand (client state: cart, UI)
- **Database/Auth**: Supabase (PostgreSQL, Auth, Realtime, Edge Functions)
- **Payments**: Razorpay webhooks (server route) + Shopify Storefront API (product data)
- **Build/Deploy**: Vite + Nitro (Cloudflare Workers preset) with Rolldown bundler
- **Dev Tools**: ESLint 9 + Prettier + TypeScript 5.8 + Vitest (if added)

## Library Rules

| Category | Library | Rule |
|----------|---------|------|
| **Routing** | `@tanstack/react-router` | All routes in `src/routes/`; use file-based routing; define loaders via `createServerFn` |
| **Server Functions** | `@tanstack/react-start` | Use `createServerFn().validator(zodSchema).handler(...)` for type-safe RPC; never call Supabase directly from client |
| **Data Fetching** | `@tanstack/react-query` | Use `queryClient` from router context; prefer route loaders over `useQuery` in components |
| **Forms** | `react-hook-form` + `@hookform/resolvers/zod` | All forms use Zod schemas; server functions validate with same schema |
| **UI Primitives** | `@radix-ui/*` | Only via shadcn/ui wrappers in `src/components/ui/`; never import Radix directly in app code |
| **Styling** | `tailwindcss` + `tw-animate-css` | Use semantic color tokens (`--color-primary`, `--color-blood`, etc.); never hardcode hex/rgb; use `@utility` for reusable patterns |
| **Icons** | `lucide-react` | Import individual icons; tree-shaking works automatically |
| **Validation** | `zod` | All server function inputs, env vars, webhook payloads validated with Zod |
| **State (Client)** | `zustand` | Single store per domain (`cartStore.ts`); keep stores minimal, no derived state in store |
| **Date/Time** | `date-fns` | Use for formatting only; no timezone libraries needed |
| **Charts** | `recharts` | Admin dashboard only; lazy-load if bundle size grows |
| **Error Handling** | Custom (`error-capture.ts`, `error-page.ts`) | All server errors captured via middleware; render branded error page |
| **Auth** | Supabase Auth + custom middleware | `attachSupabaseAuth` middleware on all server functions; never expose service role key to client |

## File Structure Conventions

```
src/
├── routes/           # TanStack Router file-based routes (all pages + API)
│   ├── _authenticated/   # Protected routes (layout + children)
│   ├── admin/            # Admin sub-routes
│   └── api/              # Public webhooks (Razorpay)
├── components/
│   ├── ui/             # shadcn/ui components (do not edit directly)
│   └── *.tsx           # App-specific composed components
├── hooks/              # Shared React hooks (useCartSync, useReveal, etc.)
├── lib/                # Pure utilities, server functions, error handling
├── integrations/       # Supabase clients, auth middleware
├── stores/             # Zustand stores (cartStore.ts)
└── styles.css          # Tailwind v4 entry + design tokens
```

## Do / Don't

- **DO** use `createServerFn().validator(zodSchema).handler(...)` for all mutations/queries
- **DO** define Zod schemas in `lib/` and reuse in both client forms and server functions
- **DO** use semantic Tailwind tokens (`bg-primary`, `text-muted-foreground`) not arbitrary values
- **DO** keep components in `src/components/` small and single-purpose
- **DON'T** import `@radix-ui/*` directly — use shadcn/ui wrappers
- **DON'T** hardcode colors, spacing, or fonts — use design tokens
- **DON'T** put business logic in route components — extract to server functions or `lib/`
- **DON'T** use `useQuery` for data that can be loaded via route loader
- **DON'T** commit `.env` or generated files (`routeTree.gen.ts`, `.tanstack/`)