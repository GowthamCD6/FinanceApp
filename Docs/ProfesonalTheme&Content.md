# Professional Theme, Typography & Content Standards Guide

> **Scope**: Standardized Design System, Typography Hierarchy, Color Tokens, Modal Guidelines, and Content Hygiene Rules for the Finance Web Application.

---

## 1. Design Philosophy & Vision

The application uses a **Fintech-grade, high-trust SaaS interface** designed for speed, clarity, and precision:
- **Clean, Crisp Surfaces**: Pure white cards (`#FFFFFF`) on subtle off-white backgrounds (`#F8FAFC`) with razor-sharp 1px borders (`#E2E8F0` / `#D1D5DB`).
- **High-Contrast Readability**: Deep dark slate headings and metrics (`#0F172A`) ensuring immediate legibility.
- **Uncluttered & Purpose-Driven**: Every element on screen must serve an operational need. Redundant text, internal technical IDs, and unnecessary user inputs are strictly eliminated.
- **Unified Font Family**: Zero font fragmentation. All headings, data tables, metrics, forms, and modals adhere strictly to **`Plus Jakarta Sans`**.

---

## 2. Typography Standard

### Primary Font Family
```css
font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```
*Note: The font `'Outfit'` is prohibited for numeric statistics and data tables. `'Plus Jakarta Sans'` must be used uniformly.*

### Typography Hierarchy & Scale

| UI Element | Font Size | Font Weight | Color Token | Letter Spacing | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Page Title (`H1`)** | `1.35rem` (21.6px) – `1.50rem` (24px) | `800` (ExtraBold) | `#0F172A` | `-0.02em` | Clean, compact, accompanied by an icon badge. |
| **Modal / Dialog Title (`H3`)** | `1.30rem` (20.8px) – `1.35rem` (21.6px) | `800` (ExtraBold) | `#0F172A` | `-0.02em` | High-contrast, bold (e.g. *"Assign New Loan"*), never verbose. |
| **KPI / Metric Numbers** | `1.50rem` (24px) – `1.75rem` (28px) | `800` (ExtraBold) | `#0F172A` | `-0.02em` | **Always solid dark black (`#0F172A`)**. No green/amber tints on numbers. |
| **KPI Metric Labels** | `0.78rem` (12.5px) – `0.85rem` (13.6px) | `600` (SemiBold) | `#64748B` | `0.02em` | Uppercase or Title Case, muted slate. |
| **Table Column Headers (`TH`)** | `0.78rem` (12.5px) – `0.8125rem` (13px) | `700` (Bold) | `#0F172A` | `0.05em` | Uppercase, centered alignment, dark text on `#F8FAFC` header background. |
| **Table Primary Text** | `0.875rem` (14px) – `0.9375rem` (15px) | `700` (Bold) | `#0F172A` | Normal | Borrower name, principal amount, loan number. |
| **Table Secondary / Meta Text** | `0.8125rem` (13px) – `0.875rem` (14px) | `500` (Medium) | `#64748B` | Normal | Customer code, phone number, timestamps, role tags. |
| **Modal Form Input Labels** | `0.875rem` (14px) – `0.9375rem` (15px) | `700` (Bold) | `#1E293B` | `-0.01em` | Clear, prominent labels with red asterisk (`#EF4444`). |
| **Modal Form Inputs & Selects** | `1.05rem` (16.8px) | `600` (SemiBold) | `#0F172A` | Normal | Height: `46px`, padding: `0 1rem`, border: `1.5px solid #CBD5E1`, radius: `8px`. |
| **Modal Calculation & Total Text** | `1.05rem` (16.8px) – `1.25rem` (20px) | `800` (ExtraBold) | `#0F172A` / `#1E40AF` | Normal | Deep bold figures for immediate breakdown clarity. |
| **Badges & Tag Pills** | `0.75rem` (12px) – `0.78rem` (12.5px) | `700` (Bold) | Contextual | `0.04em` | Compact padding (`3px 9px`), rounded-md (`6px`). |
| **Button Text** | `0.9375rem` (15px) – `0.95rem` (15.2px) | `700` (Bold) | Button theme | Normal | Generous touch target with smooth 0.15s hover transitions. |

---

## 3. Color Tokens & Theme System

```css
:root {
  /* Backgrounds */
  --bg-app: #F8FAFC;              /* Light slate-50 canvas */
  --bg-card: #FFFFFF;             /* Pure white card surface */
  --bg-subtle: #F1F5F9;           /* Slate-100 for secondary pills/badges */
  --bg-header: #F8FAFC;           /* Table thead and modal header background */

  /* Text Colors */
  --text-primary: #0F172A;        /* Slate-900: High-contrast headings, metrics, table headers */
  --text-secondary: #334155;      /* Slate-700: Input labels, primary card descriptions */
  --text-muted: #64748B;          /* Slate-500: Subtitles, helper text, customer codes */
  --text-disabled: #94A3B8;       /* Slate-400: Placeholders */

  /* Borders & Dividers */
  --border-default: #E2E8F0;      /* Slate-200: Card borders, table cell dividers */
  --border-input: #D1D5DB;        /* Gray-300: Form field borders */
  --border-focus: #2563EB;        /* Blue-600: Active input focus ring */

  /* Brand Accents */
  --brand-primary: #2563EB;       /* Blue-600: Primary CTAs, active tab borders, links */
  --brand-primary-hover: #1D4ED8; /* Blue-700: Button hover */
  --brand-soft-bg: #EFF6FF;       /* Blue-50: Division active pills, installment highlights */
  --brand-soft-border: #BFDBFE;   /* Blue-200: Installment badge borders */

  /* Status Colors */
  --status-active-bg: #ECFDF5;
  --status-active-text: #059669;
  --status-active-border: #A7F3D0;

  --status-pending-bg: #FEF3C7;
  --status-pending-text: #D97706;
  --status-pending-border: #FDE68A;

  --status-error-bg: rgba(225, 29, 72, 0.1);
  --status-error-text: #E11D48;
}
```

---

## 4. Component Standards

### A. Directory Table UI
- **Container**: `border: 1px solid #E2E8F0`, `border-radius: 12px`, `background: #FFFFFF`, `box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04)`.
- **Header (`<thead>`)**:
  - Background: `#F8FAFC`.
  - Border bottom: `2px solid #E2E8F0`.
  - Column text: `#0F172A`, font-weight `700`, font-size `0.78rem`, uppercase, centered.
- **Rows (`<tbody>`)**:
  - Border bottom: `1px solid #F1F5F9`.
  - Hover background: `#F8FAFC`.
  - No bloated or redundant columns (e.g. keep "OUTSTANDING" in ledger sheets, not user directory).

### B. Metric / KPI Cards
- **Card Background**: `#FFFFFF`.
- **Border**: `1px solid #E2E8F0`, `border-radius: 10px`.
- **Metric Value**: Font size `1.5rem` – `1.75rem`, font-weight `800`, font-family `'Plus Jakarta Sans'`, color **`#0F172A`** (Black/Dark Slate).
- **Metric Label**: Font size `0.78rem`, font-weight `600`, color `#64748B`.

### C. Modals & Dialogs (e.g. Quick Loan Modal - Unified Edit Modal Format)
- **Overlay**: `background: rgba(15, 23, 42, 0.45)`, `backdrop-filter: blur(6px)`.
- **Dialog Box**: `background: #FFFFFF`, `border-radius: 12px` (matching standard `var(--radius-lg)`), `border: 1px solid #E2E8F0`, `box-shadow: var(--shadow-lg)`.
- **Typography**: Strictly inherits `'Plus Jakarta Sans', system-ui, -apple-system, sans-serif`.
- **Form Layout (Standardized with Edit Modal)**:
  - Header: `title={`Assign Loan: ${quickLoanTarget.name}`}` (clean title with user name, no clutter).
  - Borrower Identity: Formatted as clean read-only input fields (`.form-group`, `.form-label`, `.form-input`) in an even `1fr 1fr` grid (`Borrower Name` and `Phone Number` only — no customer code needed).
  - Lending Division Scheme: 1-click card selector (*Borrower (Weekly)*, *Merchant (Daily)*, *Salaried (Monthly)*) with configured limits badge for fast admin workflow.
  - Financial Fields: Standard 3-column grid (`Principal Amount`, `Interest Rate`, `Tenure`) with standard `.form-input` styling.
  - Breakdown Card: Plain, neutral monochrome preview card (`#F8FAFC`, border `#E2E8F0`) with solid `#0F172A` amounts and neutral installment row.
  - Footer Actions: Standard `.btn .btn-secondary` ("Cancel") and `.btn .btn-primary` ("Disburse & Assign Loan").

---

## 5. Content Removal & Hygiene Rules (Strict Guidelines)

To maintain a professional, production-grade application, the following items **MUST BE REMOVED** and kept out of pages and modals:

| Item to Avoid / Remove | Reason & Correct Alternative |
| :--- | :--- |
| ❌ **"Loan Title / Product Name" input in Modals** | **REMOVED**: Admins should not have to manually invent arbitrary titles like *"Lakshmi Merchant Daily Loan (2)"*. The modal must only display the borrower's verified identity banner. The backend auto-generates or handles standard loan naming internally. |
| ❌ **Colored Accents in Plain Modals (Blue, Amber, Green)** | **REMOVED**: Modals must be plain, clean, and monochrome. No colorful avatar rings, no amber interest text, no light blue installment boxes. Use high-contrast slate (`#0F172A`), neutral borders (`#CBD5E1`), and soft slate fills (`#F1F5F9`). |
| ❌ **Organization Code / Debug Subtitle in Page Headers** | **REMOVED**: Headers must not display verbose subtitles such as *"Periyanayagi Amman Finance (ORG-PERIYA-758)"* or generic text like *"Central database of active borrowers..."*. Keep page headers crisp with only the functional page title: **Borrower & User Directory**. |
| ❌ **"OUTSTANDING" Column in User Directory Table** | **REMOVED**: The user directory is for identity and contact lookup. Outstanding balances belong in active loan ledger sheets and repayment collections, not in the borrower contact table. |
| ❌ **"Refresh" button in Table Actions** | **REMOVED**: The table automatically synchronizes on filters/actions. Eliminates redundant buttons next to the primary "Add Borrower / User" CTA. |
| ❌ **Green / Amber Numbers on KPI Cards** | **REMOVED**: Numeric metrics must not be tinted in bright green (`#10B981`) or amber (`#F59E0B`). All statistic numbers must be crisp dark black (`#0F172A`) for a clean, cohesive dashboard appearance. |
| ❌ **'Outfit' Font Family for Numbers** | **REMOVED**: Do not use the `'Outfit'` font family. The exact standard font is `'Plus Jakarta Sans'` across all elements, inputs, and numbers. |
| ❌ **Grey Table Header Text** | **REMOVED**: Table column headers must not use faded gray. They must use bold dark text (`#0F172A`) on `#F8FAFC` for high contrast and legibility. |

---

## 6. Implementation Checklist for New Pages

When developing or refactoring any new page or modal:
- [ ] Font family declared as `'Plus Jakarta Sans', system-ui, -apple-system, sans-serif`.
- [ ] Header has only the clean page title and primary action buttons (no org code strings or verbose subtitles).
- [ ] Stat card numbers use font-weight `800`, color `#0F172A`.
- [ ] Table headers use uppercase, font-weight `700`, color `#0F172A`, light background `#F8FAFC`.
- [ ] Modals display the user's name and details via a structured identity card; no manual product name inputs.
- [ ] Inputs have `42px` height, `1px solid #D1D5DB`, and `0.9375rem` font size.
- [ ] Verified with `npm run build` with zero compiler warnings or broken layouts.