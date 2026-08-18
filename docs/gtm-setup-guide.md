# Google Tag Manager Setup Guide

Step-by-step guide to configure Google Tag Manager (GTM) for the astro-portfolio site.
This guide covers everything you must do **in the Google Tag Manager dashboard** plus the one
repository/deployment step, so the analytics implemented in the `gtm-integration` change start working.

The code side is already done and verified (see `openspec/specs/analytics-tracking/spec.md` and
`docs/context.md`). The site ships with `PUBLIC_GTM_CONTAINER_ID` **empty**, so it currently renders
**zero** GTM markup — it is safe to deploy as-is. Analytics only activates once you complete this guide.

---

## Quick reference — the event model you must recreate in GTM

| Event name | Fired when | Payload | Notes |
|---|---|---|---|
| `pageview` | Every page load / soft navigation (`astro:page-load`) | `page` = current path (e.g. `/es/services/`) | GTM **auto-pageview must be disabled** (see §4) |
| `whatsapp_cta` | Click on a **general** WhatsApp link (Hero, FAQ, Pricing, Automation, and other service CTAs) | — | Excludes the contact form and the 3 plan CTAs |
| `contact_whatsapp_cta` | WhatsApp button inside the **contact form** (`LeadForm` context `contact`) | — | Pushed in-handler (not via delegation) |
| `audit_cta` | Click on the **audit** CTA (`LeadForm` context `audit`) | — | Pushed in-handler (not via delegation) |
| `plan_whatsapp_cta` | Click on one of the **3 web-plan** WhatsApp CTAs on `/services` | `plan` = stable id | `plan` uses the **stable id**, never the localized name |

**Stable plan ids (use these in your GTM triggers/tags):**

| Plan id | Name (es) | Name (en) | Price |
|---|---|---|---|
| `basic` | Básico | Basic | $120 USD |
| `professional` | Profesional | Professional | $250 USD |
| `ecommerce` | E-commerce | E-commerce | $500 USD |

> ⚠️ **Critical**: your GTM triggers/tags must match the **stable id** (`basic`, `professional`,
> `ecommerce`). Do **NOT** use the localized names (`Básico`/`Basic`, etc.) — they vary by locale and
> your tags would break or double-fire.

WhatsApp number used: `584248310009` (Venezuela, `+58 424 831 0009`).

---

## Prerequisites

1. A Google account (any Gmail works).
2. A GA4 property **and** a GA4 Measurement ID (`G-XXXXXXXXXX`) — **strongly recommended** so you can
   see the events in Google Analytics. You can create the GA4 property in step 2 or 4; create it first
   to save a round trip.
3. Access to the Vercel project dashboard for `astro-portfolio`.

---

## Step 1 — Create the GTM container

1. Go to https://tagmanager.google.com and sign in with your Google account.
2. Click **Create Account**.
   - **Account name**: e.g. `Coltman Dev` (your account / brand).
   - **Country**: your country.
   - **Container name**: `astro-portfolio` (or `Coltman Dev — Site`).
   - **Container type**: **Web**.
   - Click **Create** and accept the terms.
3. You land on the GTM **Workspace**. Note the **GTM ID** in the top-right, formatted `GTM-XXXXXXX`.
   This is the value you will paste into Vercel in Step 6.

---

## Step 2 — Create the GA4 property and Measurement ID

> Skip this if you already have a GA4 property you want to use.

1. Go to https://analytics.google.com.
2. **Admin** → **Create Property** → name it `astro-portfolio`.
3. Choose a reporting time zone and currency.
4. Follow the **Web** data-stream setup → enter your site URL `https://coltmandev.dev`.
5. After creation, go to **Admin → Data Streams → (your web stream)** and copy the **Measurement ID**
   (`G-XXXXXXXXXX`). You'll need it in Step 5.

---

## Step 3 — Create tags

Each event becomes one or more tags. For every tag set **Triggering** to the matching trigger
(created in Step 4), and **Tag ID** to your `G-XXXXXXXXXX`.

### 3.1 — GA4 Configuration tag (pageview)

This is the base tag that sends pageviews to GA4.

- **Tag type**: `Google Tag (GA4 Configuration)`.
- **Tag ID**: `G-XXXXXXXXXX`.
- **Triggering**: `All Pages`.

> This is the standard "initialization" tag. Do **not** add an extra pageview tag — pageviews are
> handled by the `pageview` event your site already pushes on every load/navigation (Step 5.1).

### 3.2 — `whatsapp_cta` tag

- **Tag type**: `Google Tag: GA4 Event` (or "GA4 Event").
- **Tag ID**: `G-XXXXXXXXXX`.
- **Event name**: `whatsapp_cta`.
- **Triggering**: trigger **whatsapp_cta** (Step 4.2).

### 3.3 — `contact_whatsapp_cta` tag

- **Tag type**: `Google Tag: GA4 Event`.
- **Event name**: `contact_whatsapp_cta`.
- **Triggering**: trigger **contact_whatsapp_cta** (Step 4.3).

### 3.4 — `audit_cta` tag

- **Tag type**: `Google Tag: GA4 Event`.
- **Event name**: `audit_cta`.
- **Triggering**: trigger **audit_cta** (Step 4.4).

### 3.5 — `plan_whatsapp_cta` tag

- **Tag type**: `Google Tag: GA4 Event`.
- **Event name**: `plan_whatsapp_cta`.
- **Event parameters**:
  - `plan` → `{{Plan Id}}` (the variable created in Step 5.2).
- **Triggering**: trigger **plan_whatsapp_cta** (Step 4.5).

---

## Step 4 — Create triggers

Create one trigger per event. Use **Custom Event** triggers that listen to your `dataLayer` pushes —
your site pushes `{ event: 'whatsapp_cta' }`, etc.

### 4.1 — Pageview

Handled by the **GA4 Configuration** tag on **All Pages** (Step 3.1). Your site pushes `pageview`
with a `page` parameter on every load and soft navigation; if you want a dedicated pageview event tag,
add a **Custom Event** trigger for `pageview` and tag it in GA4 — but this is **optional** because GA4
Configuration already tracks pageviews.

> ⚠️ **Disable GTM auto-pageview** so the first load is not double-counted:
> In the **GA4 Configuration** tag (Step 3.1) → **Fields to set** → add
> **Name**: `send_page_view` → **Value**: `false`. (If your GTM version doesn't expose this field on
> the configuration tag, add a **Google Analytics: GA4 Event** tag named `page_view` and rely on your
> site's `pageview` push instead — the important thing is not to double-send the first load.)

### 4.2 — `whatsapp_cta` trigger

- **Trigger type**: `Custom Event`.
- **Event name**: `whatsapp_cta`.
- **This trigger fires on**: `All Custom Events`.

### 4.3 — `contact_whatsapp_cta` trigger

- **Trigger type**: `Custom Event`.
- **Event name**: `contact_whatsapp_cta`.
- **This trigger fires on**: `All Custom Events`.

### 4.4 — `audit_cta` trigger

- **Trigger type**: `Custom Event`.
- **Event name**: `audit_cta`.
- **This trigger fires on**: `All Custom Events`.

### 4.5 — `plan_whatsapp_cta` trigger

- **Trigger type**: `Custom Event`.
- **Event name**: `plan_whatsapp_cta`.
- **This trigger fires on**: `All Custom Events`.

> Optional refinement: if you want a separate tag per plan, add a **condition** to the trigger, e.g.
> `Event is equal to plan_whatsapp_cta AND {{Plan Id}} equals professional`. Recommended approach is a
> single tag with the `plan` parameter (Step 3.5) so you can segment in GA4 without extra tags.

---

## Step 5 — Create variables

### 5.1 — (Built-in) Page path

For the `page` parameter of `pageview`, GA4 Configuration records the page automatically. If you build
a custom pageview tag, use the built-in **Page Path** or **Page URL** variable. No action needed unless
you're building a custom pageview tag.

### 5.2 — `Plan Id` (data layer variable)

- **Variables** → **New** → **Variable configuration**: `Data Layer Variable`.
- **Data Layer Variable Name**: `plan` (lowercase — matches `buildDataLayerEvent('plan_whatsapp_cta', { plan })`).
- **Name the variable**: `Plan Id`.
- **Version**: `Version 2`.

Use this variable in the `plan_whatsapp_cta` tag (Step 3.5) so the plan value reaches GA4 as an
event parameter named `plan`.

---

## Step 6 — Deploy the container ID to the site

Now wire the GTM ID into the deployed site. The site only renders GTM when
`PUBLIC_GTM_CONTAINER_ID` is non-empty.

1. In Vercel → project `astro-portfolio` → **Settings → Environment Variables**.
2. Add a variable:
   - **Key**: `PUBLIC_GTM_CONTAINER_ID`
   - **Value**: `GTM-XXXXXXX` (the ID from Step 1)
   - **Environments**: **Production** (add to Preview/Development only if you want GTM on those too).
3. **Redeploy** the site (Vercel inlines `PUBLIC_*` variables at build time, so a new build is required).
4. After the deploy, confirm the snippet is live: view page source of `https://coltmandev.dev` and look
   for `googletagmanager.com/gtm.js` in `<head>` and the `ns.html` noscript iframe at the start of `<body>`.

> 💡 Leave `PUBLIC_GTM_CONTAINER_ID` empty in Preview/Development unless you want tracking there too.
> With an empty value the site renders zero GTM markup, exactly as implemented and verified.

---

## Step 7 — Publish the container

GTM changes are only applied when you publish a **version**.

1. In the GTM workspace click **Submit** (top-right).
2. Name the version (e.g. `Initial GA4 + conversion events`).
3. Choose **Publish** and click **Publish** to confirm.
4. Note the **Container version** number. This is your deployable config.

---

## Step 8 — Verify it works (Preview + debug)

1. In GTM click **Preview** (top-right) — this opens the Tag Assistant debugger in a new tab.
2. Enter `https://coltmandev.dev` (or the Vercel preview URL) and **Connect**.
3. Interact with the site and check the debug panel:
   - On load: `pageview` event should appear.
   - Click a general WhatsApp CTA (Hero/FAQ/Pricing/Automation): `whatsapp_cta`.
   - Click the contact-form WhatsApp button: `contact_whatsapp_cta`.
   - Click the audit CTA: `audit_cta`.
   - Click a plan CTA on `/services` (Básico/Profesional/E-commerce): `plan_whatsapp_cta` with `plan`
     equal to `basic` / `professional` / `ecommerce`.
4. Confirm each event has a **green** tag that fires (no red "not fired" on the tags you created).
5. Cross-check in GA4 → **Reports → Realtime** (or **DebugView**) that the events arrive.

> Tip: open **Google Analytics → Admin → DebugView** while in GTM Preview to watch the events land in
> real time with their parameters.

---

## Step 9 — Optional: enable the built-in click variables

If you want richer click data (e.g. click text, link URL), enable built-in variables:

1. **Variables → Configure** (top).
2. Tick: **Click Text**, **Click URL**, **Click Element**, **Click Classes**, **Click ID**.
3. These appear as `{{Click Text}}`, `{{Click URL}}`, etc. and can be sent as event parameters.

Not required for the 5 events above — optional for deeper analysis.

---

## Troubleshooting

**Nothing arrives in GA4.**
- Confirm the container is **published** (Step 7).
- Confirm `PUBLIC_GTM_CONTAINER_ID` is set and the site was **redeployed** (Step 6).
- In GTM Preview, confirm the GA4 Configuration tag fires on page load (red = not firing).

**`plan_whatsapp_cta` never fires with a plan value.**
- Confirm the trigger matches `plan_whatsapp_cta` and the `plan` Data Layer variable name is exactly
  `plan` (Step 5.2). The value must be `basic`/`professional`/`ecommerce`, not the localized name.

**Double pageview on first load.**
- You did not disable GTM auto-pageview (Step 4.1). Set `send_page_view: false` on the GA4
  Configuration tag, or rely only on your site's `pageview` push.

**`whatsapp_cta` fires for the contact form / plan CTAs.**
- Those CTAs intentionally fire their **own** events (`contact_whatsapp_cta`, `plan_whatsapp_cta`) and
  are excluded from the general `whatsapp_cta` listener. If you see `whatsapp_cta` for them, check that
  your site build matches the `gtm-client.ts` exclusion logic (should not happen with the implemented code).

**Container shows no data after days.**
- Verify GA4 property is receiving the Measurement ID you used in the tags, and that the events are
  registered in GA4. Realtime/DebugView (Step 8) confirms the pipeline before waiting for standard reports.

---

## Out of scope (future follow-ups)

- **Consent (GDPR/CCPA)**: no consent-management platform is wired. If you serve EU/EEA users, add a
  consent banner and GTM consent mode before relying on tracking.
- **CSP (Content Security Policy)**: none is configured today. If you add one later, allowlist
  `https://www.googletagmanager.com` (script-src) and `https://www.google-analytics.com` (connect-src).
