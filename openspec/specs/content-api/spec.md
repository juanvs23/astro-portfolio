# content-api Specification

## Purpose

Expose the portfolio's content as a versioned, read-only public REST API under `/api/v1`, served by the CMS service (Hono). Response shapes are defined with Zod in `packages/contracts` so the portfolio and admin panel share strict types. Public endpoints return only visible items in deterministic order, with bilingual (es/en) fields where applicable.

## Requirements

### Requirement: Public read endpoints

The CMS MUST expose public `GET` endpoints for each MVP resource under `/api/v1`: `/projects`, `/jobs`, `/site-info`, `/nav`, and `/social`. Each MUST return a JSON body validated by its Zod contract and MUST respond with HTTP 200 on success and 404 when the resource has no content.

#### Scenario: Projects endpoint returns projects

- GIVEN a CMS with published projects
- WHEN `GET /api/v1/projects` is called
- THEN the response is 200 with a JSON array of project objects validated against the projects Zod schema

#### Scenario: Empty resource returns 200 empty

- GIVEN a resource with no visible items
- WHEN its public endpoint is called
- THEN the response is 200 with an empty array (or empty object for `site-info`)

### Requirement: Versioned response schema via shared contracts

Every `/api/v1` response MUST conform to a Zod schema defined in `packages/contracts`. The API MUST reject (400) any request that fails its contract and MUST NOT return unvalidated data to public callers.

#### Scenario: Invalid payload is rejected

- GIVEN a request that would produce a body violating the schema
- WHEN the endpoint validates it
- THEN the API responds 400 and does not emit the invalid body

### Requirement: Deterministic ordering

Listed resources (`projects`, `jobs`, `nav`, `social`) MUST be returned ordered by their `order` field ascending. Items without an `order` value MUST sort as if `order` were the largest value, after all explicitly ordered items.

#### Scenario: Items ordered by order field

- GIVEN items with `order` 2, 0, and 1
- WHEN the endpoint returns them
- THEN they appear in order 0, 1, 2

### Requirement: Exclude non-visible items

Public read endpoints MUST exclude every item whose `visible` field is `false`. A resource with no visible items MUST NOT leak hidden records.

#### Scenario: Hidden project is excluded

- GIVEN a project with `visible: false`
- WHEN `GET /api/v1/projects` is called
- THEN that project is absent from the response

### Requirement: Bilingual es/en fields

`projects` and `jobs` MUST expose bilingual fields (`desc_es`/`desc_en`, `title_es`/`title_en`, `company_es`/`company_en`, `description_es`/`description_en`). Both locales MUST be returned in a single response; the client selects the locale.

#### Scenario: Project returns both locales

- GIVEN a project with distinct es and en descriptions
- WHEN the project is fetched
- THEN the response contains both `desc_es` and `desc_en`

### Requirement: Aggregate content endpoint

`GET /api/v1/content` MUST return a single object aggregating `projects`, `jobs`, `siteInfo`, `nav`, and `social` in one request, each validated by its contract and applying the same visibility and ordering rules as the individual endpoints.

#### Scenario: Aggregate returns all resources

- GIVEN a populated CMS
- WHEN `GET /api/v1/content` is called
- THEN the response contains `projects`, `jobs`, `siteInfo`, `nav`, and `social` keys with valid arrays/objects

### Requirement: Restricted CORS

The API MUST allow cross-origin requests only from the configured site origin and the admin panel origin. Requests from any other origin MUST NOT receive `Access-Control-Allow-Origin` for this API.

#### Scenario: Allowed origin gets CORS headers

- GIVEN a request with `Origin` equal to the configured site or admin origin
- WHEN the request hits a public endpoint
- THEN the response includes the matching `Access-Control-Allow-Origin` header

#### Scenario: Foreign origin is blocked

- GIVEN a request from an unlisted origin
- WHEN the request hits the API
- THEN no permissive `Access-Control-Allow-Origin` header is returned