# seo-copy-intent Specification

## Purpose

Align every `seo.*` title, description, and h1 in `messages/es.json` and `messages/en.json` with the search intent of each page: services → pricing/development services, automation → AI automation services, projects → case studies/examples, about → trust/brand/E-E-A-T, contact → conversion, home → conversion landing. Both locales stay complete and mirrored, and no metric or claim may be invented beyond what the site already states.

## Requirements

### Requirement: Intent-driven copy per page

The `seo.title`, `seo.description`, `seo.pages.*`, `seo.descriptions.*`, and `seo.h1.*` keys MUST be rewritten so each page targets its intent keywords, in both locales:

- **services** → pricing and web development services intent (e.g. es: "precios"/"servicios de desarrollo"; en: "pricing"/"web development services")
- **automation** → AI automation services intent (chatbots, agents, RAG)
- **projects** → case studies / work examples intent
- **about** → trust, brand, and E-E-A-T intent (expertise, experience, credibility)
- **contact** → conversion intent (clear call to action)
- **home** (`seo.title`/`seo.description`) → conversion landing intent for the funnel

#### Scenario: Services page title carries pricing/services intent

- GIVEN the services page metadata
- WHEN its title is rendered in `es`
- THEN it contains intent keywords such as `precios` or `servicios de desarrollo`
- AND the `en` title contains corresponding keywords such as `pricing` or `web development services`

#### Scenario: Automation page carries AI automation intent

- GIVEN the automation page metadata
- WHEN its title and description are rendered
- THEN they include AI automation keywords (chatbots, agents, RAG, automatización) in both locales

#### Scenario: Projects page carries case-study intent

- GIVEN the projects page metadata
- WHEN its title or description is rendered
- THEN it frames work as case studies/examples in both locales

#### Scenario: About page carries E-E-A-T intent

- GIVEN the about page metadata
- WHEN its title and description are rendered
- THEN they communicate expertise, experience, and credibility in both locales

#### Scenario: Contact page carries conversion intent

- GIVEN the contact page metadata
- WHEN its title or h1 is rendered
- THEN it contains a clear call-to-action framing (e.g. "contacta", "hablemos", "get in touch") in both locales

### Requirement: Locale completeness and symmetry

Both `es.json` and `en.json` MUST keep the full `seo` namespace: `title`, `description`, `pages.*`, `descriptions.*`, `h1.*`, plus the new `ogImageAlt` key (per seo-head-meta). Every `seo.*` key present in one locale MUST exist in the other, and the i18n key-existence tests MUST cover this symmetry so a missing key fails CI.

#### Scenario: Key symmetry holds after rewrite

- GIVEN both message files are loaded
- WHEN the `seo` namespaces are compared
- THEN the key sets are identical
- AND each value is a non-empty string that is not the raw key path

#### Scenario: ogImageAlt added to both locales

- GIVEN the rewrite is complete
- WHEN `seo.ogImageAlt` is resolved for `es` and `en`
- THEN both resolve to non-empty, locale-appropriate strings

### Requirement: No invented metrics or claims

Rewrites MUST NOT introduce metrics, credentials, or claims not already present on the site (existing copy states "8+ years experience", WordPress/React/Python/PHP, chatbots, RAG, AI agents, delivery timelines — these MAY be reused, but no new numbers or awards MAY appear). EN copy MAY be rewritten freely per approved direction but MUST keep a professional register.

#### Scenario: No new claims introduced

- GIVEN the rewritten `seo.*` values
- WHEN scanned for numeric claims and superlatives
- THEN no metric appears that does not already exist in current site copy
- AND EN values maintain a professional register

#### Scenario: ES stays neutral, no voseo

- GIVEN the rewritten es `seo.*` values
- WHEN scanned for voseo tokens
- THEN no voseo (e.g. "podés", "tenés", "recibís") is present
