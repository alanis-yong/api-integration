# Week 6 Homework — CSS Mastery (Checkout UI)

Choose **one** assignment based on your comfort level. Both build on top of the existing Xsolla Store codebase. Use **plain CSS + BEM naming + CSS custom properties** (no Tailwind, no CSS Modules, no styled-components).

Figma designs are in the shared Figma file:
- **Basic** — page "Assignment: Basic" (2 frames: Store + Filters, Product Detail Page)
- **Advanced** — page "Assignment: Advanced" (3 frames: Shipping, Payment Dark Mode, Confirmation)

---

## Basic: Category Filters + Product Detail Page

Extend the existing store with category filtering and a product detail page.

### What to Build

**1. Category filter chips on the Store page**
- Row of filter buttons above the product grid: All, Clothing, Accessories, Electronics, Stationery
- Clicking a filter shows only matching products (the "All" tab shows everything)
- Active tab uses a BEM modifier: `.filter-chip--active`
- Conditional className using the `[array].filter(Boolean).join(' ')` pattern

**2. Product Detail page (`/product/:id`)**
- New route using React Router
- Two-column CSS Grid layout: product image (left), details (right)
- Breadcrumb navigation: `Store / Category / Product Name`
- Product info: name, price, category badge, stock status badge
- Quantity selector component (−/+) with local state
- "Add to Cart" button showing the total price
- Related products row at the bottom (Flexbox)

**3. Skeleton loading states**
- While products are loading, show placeholder cards with CSS shimmer animation
- Use `@keyframes` for a gradient sweep effect
- BEM class: `.item-card--skeleton`

### New Components to Create

```
FilterBar                → .filter-bar, .filter-chip, .filter-chip--active
ProductDetail            → .product-detail, .product-detail__image, .product-detail__info
QuantitySelector         → .qty-selector, .qty-selector__btn, .qty-selector__value
Breadcrumb               → .breadcrumb, .breadcrumb__item, .breadcrumb__separator
StockBadge               → .badge, .badge--in-stock, .badge--low-stock, .badge--out-of-stock
SkeletonCard             → .item-card--skeleton, .skeleton-line
```

### CSS Requirements

- All new components use BEM naming
- All colors, spacing, and radii use `var()` from `:root`
- Product detail page uses `display: grid; grid-template-columns: 1fr 1fr;`
- Filter bar uses Flexbox with `gap`
- Related products use Flexbox with horizontal scroll or wrap
- Responsive: detail page stacks vertically on mobile (`< 768px`)

### Grading

| Criteria | Weight |
|----------|--------|
| Category filter (functional + CSS) | 20% |
| Product detail page layout (Grid) | 20% |
| BEM naming quality | 20% |
| CSS variables consistency | 15% |
| Skeleton loading animation | 10% |
| Responsive behavior | 10% |
| Code quality | 5% |

### Bonus (+10%)
- Hover animation on cards: `transform: translateY(-4px)` + shadow increase
- Smooth page transitions using CSS `@keyframes fade-in`

---

## Advanced: Multi-Step Checkout Flow + Dark Mode

Replace the current cart page with a full multi-step checkout experience and add dark mode support.

### What to Build

**1. Checkout stepper (4 steps)**
- Step indicator bar: Cart → Shipping → Payment → Confirmation
- Each step has 3 states with BEM modifiers: `--done`, `--active`, `--future`
- Steps connected by a progress line (filled for completed steps)
- Clicking a completed step navigates back to it

**2. Shipping form (Step 2)**
- Form with labeled inputs: Full Name, Email, City, Postal Code, Address, Phone
- Two-column layout for City + Postal Code row using CSS Grid
- Input focus states: border color change to `--color-primary`
- Form validation: required fields with `.input--error` modifier and error message below
- "Back" and "Continue to Payment" buttons

**3. Payment form (Step 3)**
- Card Number, Cardholder Name, Expiry Date, CVC inputs
- Two-column row for Expiry + CVC
- Promo code input with validation error state
- "Pay" button showing the total amount

**4. Confirmation page (Step 4)**
- Centered success card with animated checkmark
- Order details: Order ID, items count, total, shipping address, status
- "Continue Shopping" button linking back to store

**5. Dark mode**
- Toggle switch in the header
- Sets `data-theme="dark"` on `<html>`
- All colors switch via CSS variable overrides in `[data-theme='dark'] { ... }`
- Smooth transition: `transition: background-color 0.2s, color 0.2s` on `body`
- Both checkout and existing store/cart pages support dark mode

**6. Order summary sidebar**
- Persistent on all checkout steps (right column)
- Shows line items, shipping cost, and total
- Sticky positioning: `position: sticky; top: 76px;`

### New Components to Create

```
CheckoutStepper          → .stepper, .stepper__step, .stepper__step--done/--active/--future
                            .stepper__line, .stepper__line--filled
ShippingForm             → .checkout-form, .form-group, .form-row (grid 2-col)
                            .input, .input--error, .input__label, .input__error-msg
PaymentForm              → reuses .checkout-form + .form-group
ConfirmationPage         → .confirmation, .confirmation__icon (animated), .confirmation__details
ThemeToggle              → .theme-toggle, .theme-toggle__track, .theme-toggle__knob
```

### CSS Requirements

- All components use BEM naming
- All values use `var()` — zero hardcoded colors in component CSS
- Checkout page layout: `display: grid; grid-template-columns: 1fr 360px; gap: 32px;`
- Form rows: `display: grid; grid-template-columns: 1fr 1fr; gap: 16px;`
- Stepper uses Flexbox with equal spacing
- Dark mode: `:root` defines light tokens, `[data-theme='dark']` overrides them
- Animated success checkmark using `@keyframes` (scale + fade-in)
- Input transitions: `transition: border-color 0.2s, box-shadow 0.2s`

### Dark Mode Tokens

```css
[data-theme='dark'] {
  --color-text: #e2e8f0;
  --color-text-light: #94a3b8;
  --color-bg: #0f172a;
  --color-surface: #1e293b;
  --color-border: #334155;
  --color-input-bg: #0f172a;
}
```

### Grading

| Criteria | Weight |
|----------|--------|
| Multi-step checkout flow (routing + stepper) | 15% |
| Form layout + input components (Grid) | 15% |
| Dark mode (CSS variables + toggle) | 15% |
| BEM naming quality | 15% |
| CSS variables consistency | 10% |
| Validation error states | 10% |
| Confirmation page + animation | 10% |
| Responsive behavior | 5% |
| Code quality | 5% |

### Bonus (+15%)
- Skeleton shimmer loading on checkout steps
- Micro-animation: stepper progress fills with `transition: width 0.3s`
- Persist theme preference in `localStorage`
- Form auto-saves draft to `sessionStorage`

---

## Submission

1. Create branch `week-06/homework` from `week-06/lecture-01-livecoding`
2. Build your assignment in the `src/` directory
3. Push and tag **@izzat** for review
4. **Due: Monday**
