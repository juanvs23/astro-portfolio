# Exploration: Sellersystem Domain

> **Project**: sellersystem — Desktop inventory & sales system with mobile tablet POS
> **Status**: Greenfield (no code exists)
> **Date**: 2026-06-16
> **Mode**: Domain exploration (no codebase to investigate)

---

## Domain Overview

Sellersystem is a **desktop-first inventory and sales system** for small retail businesses (ferreterías, tiendas, almacenes, depósitos de insumos). It runs as a Spring Boot server on a local machine, served via browser on LAN, with a React Native tablet app for mobile POS.

It is a **direct-sale product** (not SaaS) — each installation owns a SQLite file. One-time payment per business.

---

## 1. Entity-Relationship Analysis

### 1.1 Products Domain

```
Category ────┐
              │
Product ─────┤
  │           │
  ├── Variant(s)
  │     └── Stock ─── StockMovement
  │
  └── Pricing
        ├── cost_price
        ├── sale_price
        ├── margin_% (derived)
        └── tax_%
```

| Entity | Description | Key Attributes | MVP? |
|--------|-------------|----------------|------|
| **Category** | Product taxonomy (e.g. "Ferretería > Tornillos") | id, name, parent_id (self-referential), description, active | ✅ |
| **Product** | Core product record | id, name, description, sku (unique), barcode, category_id, unit_of_measure (unit/kg/m), image_url, active, created_at, updated_at | ✅ |
| **Variant** | Size/color/weight variations of a product | id, product_id, name, sku_suffix, barcode, attributes_json, active | ✅ |
| **Pricing** | Embedded in Product (MVP) or separate table | cost_price, sale_price, tax_percentage | ✅ |

**Decisions:**
- **Variants**: Not all products have variants. A screwdriver might come in sizes (PH0, PH1, PH2). A bag of cement has none. Product.variant_type: NONE / SIZE / COLOR / SIZE_COLOR, and Variant is a child table.
- **SKU strategy**: Product has base SKU (e.g. `TO-RN-001`), Variant appends suffix (`TO-RN-001-PH1`). SKU uniqueness enforced at variant level.
- **Pricing on Product**: For MVP, cost_price and sale_price live on Product. A `PriceHistory` table can be added later for margin analysis.
- **Tax**: Tax percentage on Product. Simplifies invoice calculation. For Argentina/Mexico, IVA/IEPS handling can be added as a Tax entity in a future change.

### 1.2 Stock Domain

```
Supplier ───── PurchaseOrder ─── PurchaseOrderItem
                                        │
                                        └──► Stock ◄── SaleItem
                                                  │
                                          StockMovement
                                                  │
                                          MinimumStockAlert
```

| Entity | Description | Key Attributes | MVP? |
|--------|-------------|----------------|------|
| **Stock** | Current stock per product+variant | product_id, variant_id (nullable), quantity, updated_at | ✅ |
| **StockMovement** | Immutable audit log of every stock change | id, product_id, variant_id, movement_type (ENTRY/EXIT/ADJUSTMENT), quantity, reference_type (SALE/PO/ADJUSTMENT), reference_id, unit_cost, notes, created_by, created_at | ✅ |
| **MinimumStockAlert** | Threshold per product | product_id, variant_id, minimum_quantity, enabled | ✅ |
| **Supplier** | Vendor management | id, name, contact_person, phone, email, address, tax_id, notes, active, created_at | ✅ |
| **PurchaseOrder** | Stock entry from supplier | id, supplier_id, order_number, order_date, expected_date, status (PENDING/PARTIAL/RECEIVED/CANCELED), total, notes, created_by, created_at | ✅ |
| **PurchaseOrderItem** | Line items in a PO | id, purchase_order_id, product_id, variant_id, quantity_ordered, quantity_received, unit_cost, subtotal | ✅ |

**Decisions:**
- **Stock is a separate table** (not a field on Product). This keeps stock mutations auditable via StockMovement.
- **StockMovement is immutable**: Once recorded, movements cannot be deleted or edited. Only compensating movements (ADJUSTMENT with negative delta) can correct errors. This is critical for audit.
- **Serial/Batch tracking**: NOT in MVP. A later change can add `SerialNumber` and `Batch` entities.
- **No location tracking**: For MVP, single-branch means stock is per-product, per-variant. Multi-warehouse locations can come later.

### 1.3 Sales Domain

```
Customer ────┐
              │
Sale ─────────┤
  │            ├── SaleItem(s)
  ├── Payment(s)
  │     └── PaymentMethod (CASH/CARD/TRANSFER)
  │
  └── SaleStatus (ACTIVE/CANCELED/REFUNDED)
```

| Entity | Description | Key Attributes | MVP? |
|--------|-------------|----------------|------|
| **Sale** | The sale transaction | id, sale_number, customer_id, user_id, sale_date, subtotal, discount_total, tax_total, total, status (ACTIVE/CANCELED/REFUNDED), payment_status (PENDING/COMPLETED/PARTIALLY_REFUNDED), notes, created_at | ✅ |
| **SaleItem** | Individual line item | id, sale_id, product_id, variant_id, quantity, unit_price, cost_price (for margin), tax_amount, discount_amount, subtotal | ✅ |
| **Payment** | Payment applied to a sale | id, sale_id, payment_method (CASH/CARD/TRANSFER), amount_tendered, change_amount, reference (for card: last 4 digits/auth code), processed_at | ✅ |
| **Customer** | Buyer record | id, name, phone, email, address, tax_id, notes, created_at, last_purchase_at | ✅ |

**Decisions:**
- **Payment can be split**: A sale can have multiple payment methods (e.g. $500 cash + $300 card).
- **Change calculation**: If payment_method=CASH and amount_tendered > sale.total, change = amount_tendered - total. The system MUST calculate and display this.
- **Sale cancelation**: Sets status=CANCELED, adds compensating StockMovement for each item.
- **Refund**: Can be full or partial. Creates a negative SaleItem or a credit note. Requires reversing stock.
- **Sale number**: Auto-generated sequential number per installation. Format: `YYYYMMDD-NNNN` or simple sequential.
- **Cart/pending sales**: For MVP, cart is in-memory (frontend state). Persistent carts would add `Cart` and `CartItem` entities — postpone.

### 1.4 Customer Domain

```                                                       
Customer ──── Sale(s) (derived purchase history)
```

| Entity | Description | Key Attributes | MVP? |
|--------|-------------|----------------|------|
| **Customer** | Core customer record | id, name, phone, email, address, tax_id (cuit/rfc), notes, visit_count, total_purchases (denormalized for performance), created_at | ✅ |

**Decisions:**
- Purchase history is **derived** from Sale records. For MVP, no separate purchase_history table.
- Denormalized `total_purchases` and `visit_count` on Customer for quick display. These get updated via triggers or application logic on sale completion.
- Tax ID is for electronic invoicing (AFIP/SAT). Optional in MVP.

### 1.5 Supplier Domain

```
Supplier ──── PurchaseOrder
```

Already covered in Stock. Supplier is simple CRM — name, contact info, tax info for invoicing.

### 1.6 User Domain

```
User ──── Role
```

| Entity | Description | Key Attributes | MVP? |
|--------|-------------|----------------|------|
| **User** | System user | id, username, password_hash, full_name, role (ADMIN/SELLER), active, last_login, created_at | ✅ |
| **Role** | Enum-based in MVP | ADMIN (full access), SELLER (sales + stock view only) | ✅ |

**Decisions:**
- For MVP, Role is an **enum**, not a table. A proper RBAC system (permissions, roles, user-role mapping) can be added later.
- Password: bcrypt hashing. No password expiry in MVP.
- Login: Simple username/password. No 2FA in MVP.
- Session: JWT tokens with configurable expiry.

### 1.7 Entity Relationship Diagram (Conceptual)

```
Category 1──N Product 1──N Variant
                              │
User ──────┐                  │
           ├── Sale 1──N SaleItem ───┘
           │        │
Customer ──┘        └── 1──N Payment

Product ──────┐
Variant ──────┤
Supplier ──┐  ├── Stock ──N StockMovement
           │  │
           └──┴── PurchaseOrder 1──N PurchaseOrderItem
                           │
                     Supplier

Product ──── MinimumStockAlert
Variant ────┘
```

---

## 2. Key Business Flows

### 2.1 Sales Flow (Primary Transaction)

```
┌─────────────────────────────────────────────────────────────────┐
│ SELLER FLOW                                                     │
│                                                                 │
│  1. User authenticates (JWT token issued)                       │
│  2. Selects "New Sale"                                         │
│  3. Search/add products:                                       │
│     a. Search by name, barcode, or SKU (server-side search)    │
│     b. Browse by category                                       │
│     c. Scan barcode (camera or USB scanner)                    │
│  4. For each item, set quantity                                 │
│     a. System validates stock >= requested quantity             │
│     b. Shows unit price (from Product.sale_price)              │
│  5. Optionally add discount (line-item or global)              │
│  6. Add customer (search existing or create new)               │
│  7. Select payment method(s):                                  │
│     a. Cash → enter amount tendered → system calculates change │
│     b. Card → enter reference (last 4 digits, auth code)       │
│     c. Transfer → enter reference                              │
│     d. Split payment (e.g. 50% cash + 50% card)                │
│  8. Complete sale → server:                                    │
│     a. Create Sale record                                       │
│     b. Create SaleItem records                                  │
│     c. Create Payment record(s)                                 │
│     d. Decrease Stock for each item                             │
│     e. Record StockMovement (EXIT, reference: sale_id)         │
│  9. Print receipt (thermal printer)                            │
│ 10. If electronic invoicing configured: send to AFIP/SAT       │
│                                                                 │
│ SYSTEM BEHAVIOR:                                                │
│ - If stock insufficient: warn user, allow sale with warning     │
│   (business configurable: block vs warn)                        │
│ - Sale_number is generated atomically                           │
│ - All DB operations in a single transaction                    │
│ - Receipt printing is async (does not block sale)              │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Stock Entry Flow (Receiving Purchase Orders)

```
┌─────────────────────────────────────────────────────────────────┐
│ STOCK ENTRY FLOW                                                │
│                                                                 │
│  1. Admin creates PurchaseOrder to Supplier                     │
│     a. Select supplier                                           │
│     b. Add items (product, variant, quantity, unit_cost)        │
│     c. Set expected_date                                        │
│     d. Status: PENDING                                          │
│  2. When shipment arrives:                                      │
│     a. Open PurchaseOrder, click "Receive"                     │
│     b. For each item, enter quantity_received                   │
│        (may differ from quantity_ordered — over/short)          │
│     c. If partial: status stays PARTIAL                         │
│     d. If complete: status → RECEIVED                           │
│  3. On confirmation, server:                                    │
│     a. Update PurchaseOrderItem.quantity_received               │
│     b. Increase Stock for each product+variant                  │
│     c. Record StockMovement (ENTRY, reference: po_item_id)     │
│     d. Update Product.cost_price with PO unit_cost              │
│        (weighted average or latest cost — configurable)         │
│                                                                 │
│ NOTE: Quick stock entry (without PO) is also needed:            │
│ Direct ENTRY movement for walk-in purchases, returns, etc.      │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 Stock Adjustment Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ STOCK ADJUSTMENT FLOW                                           │
│                                                                 │
│  1. Admin selects "Stock Adjustment"                           │
│  2. Selects product (and variant if applicable)                │
│  3. Enters:                                                     │
│     a. New quantity (absolute) OR delta (relative)             │
│     b. Reason: DAMAGE / LOSS / THEFT / COUNT_CORRECTION / OTHER│
│     c. Notes (required for audit)                               │
│  4. On confirmation, server:                                    │
│     a. Update Stock.quantity                                     │
│     b. Record StockMovement (ADJUSTMENT with delta)             │
│                                                                 │
│ AUDIT: Every adjustment is permanent. No undo.                  │
│ Correction = new adjustment with opposite delta + note.         │
└─────────────────────────────────────────────────────────────────┘
```

### 2.4 Reporting Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ REPORTING (Query-based, no scheduled jobs in MVP)               │
│                                                                 │
│ Daily Sales Report:                                             │
│   SELECT SUM(total), COUNT(*), AVG(ticket)                     │
│   FROM Sale WHERE sale_date = ? AND status = ACTIVE            │
│   GROUP BY user_id (per seller breakdown)                       │
│                                                                 │
│ Low Stock Alert:                                                │
│   SELECT p.name, s.quantity, m.minimum_quantity                │
│   FROM Stock s                                                  │
│   JOIN Product p ON p.id = s.product_id                        │
│   JOIN MinimumStockAlert m ON m.product_id = s.product_id     │
│   WHERE s.quantity <= m.minimum_quantity AND m.enabled          │
│                                                                 │
│ Profit Margin (per product):                                    │
│   SELECT product_id, AVG(unit_price - cost_price)              │
│   FROM SaleItem GROUP BY product_id                             │
│   ORDER BY margin DESC                                          │
│                                                                 │
│ Most Sold Products (top N):                                     │
│   SELECT product_id, SUM(quantity) as total_qty                │
│   FROM SaleItem                                                 │
│   JOIN Sale ON Sale.id = SaleItem.sale_id                      │
│   WHERE Sale.sale_date BETWEEN ? AND ?                          │
│   GROUP BY product_id ORDER BY total_qty DESC                   │
│   LIMIT N                                                       │
└─────────────────────────────────────────────────────────────────┘
```

### 2.5 Electronic Invoicing (Future — NOT MVP)

Integration with AFIP (Argentina) or SAT (Mexico). Concerns:

- AFIP requires WSAA (authentication), WSFE (billing), parameter servers
- SAT requires CFDI 4.0 with XML signing via CSD/ FIEL
- Both require tax ID validation, real-time or 72h validation
- Receipt types: Factura A/B/C, Nota de Crédito, Nota de Débito
- Must handle IVA discrimination, IIBB, perceptions

**Recommendation**: Build an `Invoice` entity and an abstraction layer (`InvoiceProvider` interface). Implement AFIP/SAT as separate modules. NOT in MVP.

### 2.6 Thermal Printer Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ THERMAL PRINTING                                                │
│                                                                 │
│  1. Sale completed → generate receipt data                      │
│  2. ReceiptDTO assembled (business name, address, items,        │
│     totals, QR code for electronic invoice if applicable)       │
│  3. Send to thermal printer:                                    │
│     a. Option A: Server-side (ESC/POS via USB/serial on server) │
│     b. Option B: Client-side (browser Print API → local printer)│
│     c. Option C: Mobile (Bluetooth thermal printer on tablet)   │
│  4. For MVP: Option B (browser print) + A (direct USB)         │
│  5. Receipt template: configurable header/footer, logo          │
│                                                                 │
│ Library options: jpos (Java), escpos-print (JS), QZ Tray       │
└─────────────────────────────────────────────────────────────────┘
```

**Decision**: For MVP, use browser-based printing (window.print with a styled receipt template). For direct USB thermal printing on the server, use a Java ESC/POS library (e.g. `javax.usb` or `escpos-coffee`). This allows the desktop server to print directly.

---

## 3. Architecture Concerns

### 3.1 LAN Interaction: Desktop Server ↔ Mobile Tablet

```
┌─────────────────────────────┐         ┌─────────────────────┐
│ DESKTOP (Spring Boot)       │         │ TABLET (ReactNative)│
│                             │  REST   │                     │
│ port 8080                   │◄───────►│ Swipeable POS UI    │
│                             │  JSON   │ Barcode scanner     │
│ SQLite (WAL)                │         │ Receipt preview     │
│ http://192.168.1.100:8080   │         │ Offline queue       │
└─────────────────────────────┘         └─────────────────────┘
```

**Discovery**: The server runs on a local machine on the LAN. The React Native tablet connects to it via REST API.

**Approaches for tablet discovery**:
1. **Manual IP**: User enters server IP on tablet. Simple, reliable.
2. **mDNS/Bonjour**: Server advertises via `_sellersystem._tcp` service. Tablet auto-discovers. Better UX.
3. **QR Code**: Desktop app shows a QR with `http://IP:PORT/config`, tablet scans it.

**Recommendation**: Manual IP + QR Code. mDNS is a nice-to-have but adds complexity (JmDNS library, network dependencies).

### 3.2 Offline Resilience

**Scenario**: Tablet loses connection mid-sale. What happens?

| Approach | Pros | Cons | Effort |
|----------|------|------|--------|
| **Online-only** | Simple, no sync logic | Tablets unusable offline | Low |
| **Local queue** | Can work offline for hours | Conflict resolution, sync complexity | High |

**Recommendation for MVP**: **Online-only** with graceful degradation:
- Before critical operations (sale completion), ping the server
- If unavailable, show "Connection lost" with reconnection button
- Cache product catalog locally (Read from server cache) for browsing while offline
- Save draft sales locally so the seller doesn't lose entered data

Full offline support (queue sales, sync when reconnected) is a **post-MVP enhancement**.

### 3.3 Concurrent Writes & SQLite

**Key constraint**: SQLite supports concurrent readers but **one writer at a time** (even in WAL mode, writes are serialized).

**Scenarios**:
1. Two tablets completing sales simultaneously: Second writer waits for first. With WAL mode, the wait is typically < 50ms for simple inserts.
2. Stock check race: Tablet A reads stock=5, Tablet B reads stock=5. Both try to sell 5 units. First succeeds, second fails.

**Mitigations for MVP**:
- **Optimistic stock check**: At sale commit, check `WHERE quantity >= ?` in the UPDATE statement. If affected rows = 0, reject and notify.
- **SQLite WAL mode**: `PRAGMA journal_mode=WAL;` — enables concurrent reads, serialized writes.
- **Busy timeout**: `PRAGMA busy_timeout=5000;` — retry for 5s before failing.
- **Transaction atomicity**: Single transaction per sale. If it fails, all or nothing.

**Long-term solution** (post-MVP if multi-tablet contention becomes an issue):
- Application-level write queue
- Server-side locking for stock-critical operations

### 3.4 Desktop UX: Start & Stop

```
┌─────────────────────────────────────────────────────┐
│ DESKTOP APPLICATION LIFECYCLE                        │
│                                                      │
│ First Run:                                           │
│   1. Show setup wizard                               │
│   2. Create SQLite database file                     │
│   3. Run Flyway migrations                           │
│   4. Create admin user                              │
│   5. Show configuration (printer, company info)      │
│   6. Save settings                                   │
│   7. Start server                                    │
│   8. Open browser to http://localhost:8080           │
│                                                      │
│ Normal Start:                                        │
│   1. Start Spring Boot (embedded)                   │
│   2. Load config from sellersystem.yaml             │
│   3. Open browser or show tray icon                 │
│                                                      │
│ Stop:                                                │
│   1. Graceful shutdown (Spring context close)       │
│   2. Close SQLite connection (WAL checkpoint)       │
│   3. Backup database (copy .sqlite file)            │
│                                                      │
│ Tray Icon:                                           │
│   - Show server status (Online/Offline)             │
│   - Open browser                                     │
│   - Start/Stop server                                │
│   - Exit application                                 │
└─────────────────────────────────────────────────────┘
```

**Considerations**:
- Spring Boot can be packaged as a native image (GraalVM) with a system tray wrapper (Java AWT or SWT).
- For MVP, a simple console app that opens the browser is fine. System tray is polish.
- The backup on shutdown is critical: copy the SQLite file to `backups/sellersystem_YYYY-MM-DD.sqlite` before closing.
- Config file: `config/sellersystem.yaml` — server port, database path, printer settings, company info.

### 3.5 Desktop Packaging

```
┌──────────────────────────────────────────────────────────────┐
│ PACKAGING STRATEGY (GraalVM Native Image)                     │
│                                                               │
│  1. Gradle build → fat JAR or native executable               │
│  2. Native executable benefits:                               │
│     - Fast startup (< 100ms)                                   │
│     - Lower memory footprint                                   │
│     - No JVM dependency on target machine                      │
│     - Smaller distribution (single file)                      │
│  3. Tradeoffs:                                                 │
│     - Longer build time                                        │
│     - Reflection/proxy configuration must be declared          │
│     - Spring Boot native (via spring-native / AOT)             │
│     - Some libraries may not support native                  │
│  4. Distribution:                                              │
│     - Windows: .exe installer (Inno Setup / jpackage)         │
│     - Linux: .deb/.rpm or AppImage                             │
│     - macOS: .dmg                                              │
│                                                               │
│ MVP approach: fat JAR first, native image as optimization      │
└──────────────────────────────────────────────────────────────┘
```

### 3.6 Security Concerns

| Concern | Mitigation | Priority |
|---------|-----------|----------|
| **Local access only** | Default: bind to 127.0.0.1. For LAN: expose via config `server.host=0.0.0.0` with warning | High |
| **No HTTPS on LAN** | Self-signed cert option for LAN. For MVP, HTTP is acceptable (LAN only) | Low |
| **SQLite file access** | File permissions (OS-level). DB encryption at rest? Not in MVP | Medium |
| **Authentication** | JWT with bcrypt passwords. Session timeout configurable | High |
| **Data privacy** | Each installation = one SQLite file. No data leaves the machine | ✅ Built-in |

---

## 4. Approaches & Forks

### Fork A: Database Access Strategy

| Approach | Pros | Cons | Effort |
|----------|------|------|--------|
| **Spring Data JDBC** | Simple, no JPA magic, works with SQLite, aggregate-oriented | Community SQLite dialect (not official), no auto-DDL | Low |
| **JDBC Template** | Full control, no ORM overhead | More boilerplate, manual mapping | Medium |
| **JOOQ** | Type-safe SQL, excellent SQLite support | License cost for commercial use, steeper learning curve | Medium |

**Recommendation**: **Spring Data JDBC** — it's the natural fit for Spring Boot 3, aggregate-oriented (good for DDD), and works with SQLite via `org.springframework.boot:spring-boot-starter-data-jdbc` + `org.xerial:sqlite-jdbc` + community dialect (`org.jsqlparser` based or `com.github.gwenn:sqlite-dialect`).

### Fork B: Package Structure

| Approach | Pros | Cons | Effort |
|----------|------|------|--------|
| **By Layer** (`controller/`, `service/`, `repository/`, `model/`) | Familiar, traditional Spring Boot | Coupling grows, hard to modularize later | Low |
| **By Domain** (`product/`, `sale/`, `customer/`, `stock/`, `supplier/`) | DDD-aligned, modular, easy to split later | More packages initially | Low |

**Recommendation**: **By Domain** — aligns with Screaming Architecture, makes multi-branch extension natural, keeps domain logic discoverable.

```
com.sellersystem
├── SellersystemApplication.java
├── config/               # Spring config, security, CORS
├── common/               # Shared DTOs, enums, exceptions
├── product/
│   ├── domain/           # Product, Variant, Category, Pricing
│   ├── api/              # ProductController, CategoryController
│   └── application/      # ProductService, CategoryService
├── sale/
│   ├── domain/           # Sale, SaleItem, Payment
│   ├── api/              # SaleController
│   └── application/      # SaleService (orchestrates the sale flow)
├── stock/
│   ├── domain/           # Stock, StockMovement, MinimumStockAlert
│   ├── api/              # StockController, PurchaseOrderController
│   └── application/      # StockService, PurchaseOrderService
├── customer/
│   ├── domain/           # Customer
│   ├── api/              # CustomerController
│   └── application/      # CustomerService
├── supplier/
│   ├── domain/           # Supplier
│   ├── api/              # SupplierController
│   └── application/      # SupplierService
├── user/
│   ├── domain/           # User
│   ├── api/              # AuthController, UserController
│   └── application/      # AuthService, UserService
├── report/
│   └── api/              # ReportController (read-only queries)
├── printing/
│   └── application/      # ReceiptPrintService
└── invoicing/
    └── application/      # InvoiceService (stub in MVP)
```

### Fork C: Frontend State Management

| Approach | Pros | Cons | Effort |
|----------|------|------|--------|
| **React Context + useReducer** | Zero dependencies, built-in | Performance issues with frequent updates, boilerplate | Low |
| **Zustand** | Minimal boilerplate, works with React Native, TypeScript-first | Another dependency | Low |
| **Redux Toolkit** | Battle-tested, devtools | Overkill for desktop app scope | Medium |

**Recommendation**: **Zustand** — minimal boilerplate, great TypeScript support, works identically in React and React Native. Perfect for this scope.

### Fork D: API Design

| Approach | Pros | Cons | Effort |
|----------|------|------|--------|
| **REST + springdoc** | Standard, auto-generated OpenAPI spec, client generation | More endpoints for complex queries | Low |
| **GraphQL** | Flexible queries, less overfetching | More complex setup, not as well supported in Java ecosystem | Medium |

**Recommendation**: **REST + springdoc** — the user already specified this. It generates OpenAPI spec → OpenAPI client for React Native. The standard for this stack.

### Fork E: Offline Strategy

| Approach | Pros | Cons | Effort |
|----------|------|------|--------|
| **Online-only** | No sync complexity | Tablet not usable offline | Low |
| **Offline queue** | Can work disconnected | Conflict resolution, data reconciliation | High |
| **Cached catalog + draft save** | Browse offline, save drafts | Still needs connection to complete sale | Medium |

**Recommendation**: **Cached catalog + draft save** for MVP. Full offline queue is a post-MVP enhancement.

---

## 5. Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **SQLite contention under concurrent writes** | Medium (2-3 tablets) | Medium | WAL mode, busy_timeout, optimistic stock check. Monitor in beta |
| **GraalVM native image incompatibility** | Medium | High | Start with fat JAR. Native image is optimization, not requirement |
| **SQLite dialect for Spring Data JDBC** | Medium | High | Test dialect compatibility early. Fallback: JDBC Template |
| **Thermal printer compatibility** | High | Medium | Multiple printer drivers (ESC/POS, browser print). Test with common models |
| **Electronic invoicing complexity** | High (AR/MX) | High | Abstract behind interface. Defer to post-MVP |
| **Offline tablet frustration** | Medium | Medium | Clear offline indicators, draft save, graceful reconnection |
| **Backup strategy reliability** | Low | Critical | Auto-backup on shutdown, manual backup button, backup verification |
| **Multi-branch migration** | Low (future) | High | Design domain model with `branch_id` nullable. Plan for it but don't over-engineer |

---

## 6. MVP Scope Recommendation

### Build These First (Phase 1 — Core Operational Loop)

```
WEEK 1-2: Scaffold & Domain Model
├── Spring Boot project with domain-oriented structure
├── SQLite database with Flyway migrations
├── Complete domain model (all entities above)
├── Basic REST API for all CRUD operations
├── User authentication (JWT)
├── OpenAPI spec generation
└── Unit tests for domain logic

WEEK 3-4: Sales & Stock Core
├── Complete Sales flow (create, list, cancel)
├── Stock management (entries, adjustments, alerts)
├── Customer management (create, search)
├── Payment handling (cash, card, transfer, split)
└── Stock validation during sales

WEEK 5: Frontend (React Desktop)
├── Login page
├── Product catalog (list, search, categories)
├── Sale interface (select products, cart, checkout)
├── Customer selector
├── Payment dialog (with change calculation)
├── Receipt preview / print
└── Basic dashboard (today's sales)

WEEK 6: React Native Tablet POS
├── Generate OpenAPI client from spec
├── Touch-optimized sale interface
├── Barcode scanner
├── Payment dialog
└── Server discovery (QR code)

WEEK 7-8: Polish & MVP Launch
├── Reporting (daily sales, low stock)
├── Backup & restore
├── Printer configuration
├── Packaging (fat JAR + installer)
├── Documentation
└── Beta testing
```

### NOT in MVP
- Electronic invoicing (AFIP/SAT)
- Multi-branch
- Serial/batch tracking
- Full offline mode
- Advanced reports (charts, exports)
- System tray / desktop lifecycle UI (console app is fine)
- Integration with external systems

---

## 7. Recommendation for First SDD Change

**Change Name**: `scaffold-domain-model`

**Description**: Set up the foundation of the sellersystem — Spring Boot project structure, SQLite database with Spring Data JDBC, Flyway migrations, all domain entities with their repositories and basic services, user authentication, and the OpenAPI spec generation.

**Why this first?**
1. Every subsequent feature depends on the domain model and database
2. Establishes the package-by-domain convention
3. Gets the project building and runnable quickly
4. Validates the SQLite + Spring Data JDBC compatibility early
5. Enables parallel work (backend + frontend can start from the same base)

**What it includes:**
- Gradle project configuration (Java 21, Spring Boot 3, Spring Data JDBC, SQLite, springdoc)
- Domain model for ALL entities (Product, Variant, Category, Stock, StockMovement, MinimumStockAlert, Sale, SaleItem, Payment, Customer, Supplier, PurchaseOrder, PurchaseOrderItem, User)
- Flyway migrations for all tables
- Spring Data JDBC repositories
- JWT authentication (login endpoint, filter, password encoder)
- Basic REST controllers (CRUD endpoints)
- OpenAPI configuration with springdoc
- Docker compose for development (optional)
- Unit tests for domain logic and repositories

---

## 8. Ready for Proposal?

**Yes**. This exploration provides a complete domain map, business flow descriptions, technical risk analysis, and a clear first change recommendation. The orchestrator should proceed to `sdd-propose` for the `scaffold-domain-model` change.

**Next Step**: Create a proposal for the `scaffold-domain-model` change via `sdd-propose`. The proposal should define:
- **Intent**: Foundation setup — project structure, database, domain model, auth, API scaffold
- **Scope**: What's included (all entities, migrations, auth, OpenAPI) and excluded (frontend, UI, reporting, invoicing)
- **Approach**: Domain-oriented package structure, Spring Data JDBC, JWT auth
- **Rollback plan**: Reset database, revert migrations, remove project files
- **Effort**: Medium (2 weeks ± 3 days for a single developer)

---

## Appendix: OpenAPI Spec Design

```
POST   /api/auth/login          → { token }
GET    /api/auth/me             → User

GET    /api/products            → Page<ProductDTO>
GET    /api/products/{id}      → ProductDTO
POST   /api/products           → ProductDTO
PUT    /api/products/{id}      → ProductDTO
DELETE /api/products/{id}      → 204

GET    /api/categories         → List<CategoryDTO>
POST   /api/categories         → CategoryDTO

GET    /api/stock              → List<StockDTO>
GET    /api/stock/alerts       → List<StockAlertDTO>

GET    /api/sales              → Page<SaleDTO>
POST   /api/sales              → SaleDTO (the main transaction)
GET    /api/sales/{id}        → SaleDTO
POST   /api/sales/{id}/cancel → SaleDTO

GET    /api/customers          → Page<CustomerDTO>
POST   /api/customers          → CustomerDTO

GET    /api/suppliers          → Page<SupplierDTO>
GET    /api/purchase-orders    → Page<PurchaseOrderDTO>
POST   /api/purchase-orders    → PurchaseOrderDTO
POST   /api/purchase-orders/{id}/receive → PurchaseOrderDTO

GET    /api/reports/daily-sales    → DailySalesReport
GET    /api/reports/low-stock      → List<StockAlertDTO>
GET    /api/reports/top-products   → List<ProductSalesDTO>
GET    /api/reports/profit-margins → List<MarginDTO>
```
