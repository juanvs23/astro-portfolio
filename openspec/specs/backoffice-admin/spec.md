# backoffice-admin Specification

## Purpose

A React SPA (`cms/admin`) that lets authorized users manage the portfolio's content stored in the CMS: log in, view a dashboard, and perform CRUD on the five MVP resources (projects, jobs, siteInfo, navLinks, socialLinks) with bilingual es/en fields, plus image uploads served through Vercel imageService. Routes are guarded by auth and role.

## Requirements

### Requirement: SPA login screen

The admin app MUST present a login form that authenticates against the CMS auth API (email+password), stores the session via the refresh cookie and access token, and redirects to the dashboard on success.

#### Scenario: Valid login reaches dashboard

- GIVEN the admin app at the login route
- WHEN a user submits valid credentials
- THEN the app navigates to the dashboard with an authenticated session

### Requirement: Dashboard lists resources

The dashboard MUST render the five resources (projects, jobs, siteInfo, navLinks, socialLinks) with counts and entry points to their list/edit views. It MUST load data from the authenticated admin API.

#### Scenario: Dashboard shows resources

- GIVEN an authenticated admin session
- WHEN the dashboard loads
- THEN it lists the five resources with their current item counts

### Requirement: CRUD per resource

For `projects`, `jobs`, `siteInfo`, `navLinks`, and `socialLinks` the app MUST support create, read, update, and delete operations through the protected admin API, and MUST refresh the list after each mutation.

#### Scenario: Create a new project

- GIVEN the projects list view
- WHEN an admin creates a project with valid fields
- THEN the project is persisted and appears in the list

#### Scenario: Delete a resource item

- GIVEN an existing item with delete permission (role `admin` where required)
- WHEN an admin confirms deletion
- THEN the item is removed and the list no longer shows it

### Requirement: Bilingual es/en editing

For `projects` and `jobs`, the edit forms MUST provide separate fields for the es and en values of every bilingual property and MUST save both locales together.

#### Scenario: Both locales saved

- GIVEN an edit form for a project
- WHEN the admin saves distinct es and en descriptions
- THEN both `desc_es` and `desc_en` are persisted in the same record

### Requirement: Image upload

The app MUST allow uploading an image for a resource, persisting the image reference, and serving it through Vercel imageService using remote patterns configured in `astro.config.mjs`. The image URL stored in the CMS MUST be resolvable by the portfolio.

#### Scenario: Uploaded image is served

- GIVEN an admin uploads an image for a project
- WHEN the image is saved
- THEN the stored URL is a resolvable image that Vercel imageService can optimize

### Requirement: Routing guard by auth and role

The SPA MUST guard every route: unauthenticated visitors are redirected to login, and routes requiring `admin` role are blocked (redirect or 403 view) for `user`-role sessions.

#### Scenario: Unauthenticated visit redirects to login

- GIVEN no valid session
- WHEN a user visits any admin route
- THEN the app redirects to the login screen

#### Scenario: user role cannot open admin-only view

- GIVEN an authenticated session with role `user`
- WHEN the user navigates to an admin-only route
- THEN the app blocks the route and does not render the admin-only view