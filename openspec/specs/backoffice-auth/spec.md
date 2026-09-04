# backoffice-auth Specification

## Purpose

Authenticate and authorize access to the CMS admin API and panel. Users sign in with email+password; the server issues a short-lived JWT access token (Bearer) plus a long-lived refresh token stored in an httponly cookie, with rotation on each refresh and revocation on logout. Two roles — `admin` and `user` — gate which admin routes a caller may use.

## Requirements

### Requirement: Login with email and password

The CMS MUST accept `POST /api/v1/admin/auth/login` with `email` and `password`. On valid credentials it MUST issue an access token and a refresh token; on invalid credentials it MUST respond 401 without revealing whether the email or the password was wrong.

#### Scenario: Successful login issues both tokens

- GIVEN valid stored credentials for a user
- WHEN `POST /api/v1/admin/auth/login` is called with them
- THEN the response returns an access token and sets the refresh token as an httponly cookie

#### Scenario: Invalid password is rejected

- GIVEN a valid email and a wrong password
- WHEN login is attempted
- THEN the API responds 401 and issues no token

### Requirement: Short-lived access token

The access token MUST be a signed JWT (via `jose`) with a short expiry (e.g. 15 minutes) and MUST carry the user id and role claims. The API MUST accept it as a `Bearer` token on protected routes.

#### Scenario: Access token accepted on protected route

- GIVEN a valid, unexpired access token
- WHEN a protected admin route is called with it as `Authorization: Bearer <token>`
- THEN the route processes the request

### Requirement: Refresh token with rotation

The refresh token MUST be long-lived, stored as an httponly cookie, and rotated on every use: each refresh MUST invalidate the old refresh token and issue a new one, and MUST issue a fresh access token. A replayed/used refresh token MUST be rejected.

#### Scenario: Refresh issues new access and rotates

- GIVEN a valid refresh cookie and the previous access token
- WHEN `POST /api/v1/admin/auth/refresh` is called
- THEN a fresh access token is returned and a new refresh cookie is set

#### Scenario: Reused refresh token is rejected

- GIVEN a refresh token that has already been used to refresh
- WHEN it is used again
- THEN the API responds 401 and issues no token

### Requirement: Logout revokes refresh token

`POST /api/v1/admin/auth/logout` MUST revoke the current refresh token and clear the refresh cookie so subsequent refresh calls fail.

#### Scenario: Logout invalidates session

- GIVEN an authenticated session with a refresh cookie
- WHEN logout is called
- THEN the refresh cookie is cleared and the refresh token is no longer accepted

### Requirement: Roles admin/user with route authorization

Protected admin routes MUST be gated by role. A user with role `admin` MUST be allowed on all admin routes; a user with role `user` MUST be allowed on non-admin-only write routes but MUST receive 403 when attempting an admin-only route (e.g. deleting or modifying `siteInfo`).

#### Scenario: Admin accesses admin-only route

- GIVEN an authenticated user with role `admin`
- WHEN they call an admin-only route
- THEN the request is authorized

#### Scenario: User is forbidden from admin-only route

- GIVEN an authenticated user with role `user`
- WHEN they attempt an admin-only route
- THEN the API responds 403

### Requirement: Password hashing

Stored passwords MUST be hashed with a strong algorithm (bcrypt or argon2) and MUST NEVER be stored or returned as plaintext. Login MUST compare against the hash, not the raw value.

#### Scenario: Plaintext password is never stored

- GIVEN a newly created user record
- WHEN the record is inspected
- THEN it contains a hash, not the plaintext password

### Requirement: Restricted CORS

The auth API MUST allow cross-origin requests only from the configured admin panel origin (and site origin where needed). Credentialed requests (cookies) MUST be allowed only from these origins.

#### Scenario: Admin origin can send credentials

- GIVEN a request with `Origin` equal to the admin panel origin and credentials mode `include`
- WHEN it hits an auth route
- THEN the response allows the origin and credentials

### Requirement: Rate-limit login

The login endpoint MUST rate-limit attempts per email and per IP to mitigate brute force. Exceeding the limit MUST return 429 and MAY include a retry-after hint.

#### Scenario: Exceeding limit blocks login

- GIVEN a caller exceeding the allowed login attempts for an email
- WHEN another login is attempted
- THEN the API responds 429 and does not validate credentials