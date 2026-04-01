# Week 6 Homework — CSS Mastery

Build on top of the existing Xsolla Store codebase. Use **plain CSS + BEM naming + CSS custom properties** (no Tailwind, no CSS Modules, no styled-components).

**Basic is compulsory.** If you're comfortable, take on Advanced too for extra credit — it includes everything from Basic plus a multi-step checkout and dark mode.

Figma designs:
- **Basic** — [Assignment: Basic](https://www.figma.com/design/2nKo0edoLwX7fjCNQWgSYE/Xsolla-School---CSS-Mastery?node-id=50-2) (2 frames: Store + Filters, Product Detail Page)
- **Advanced** — [Assignment: Advanced](https://www.figma.com/design/2nKo0edoLwX7fjCNQWgSYE/Xsolla-School---CSS-Mastery?node-id=52-2) (3 frames: Shipping, Payment Dark Mode, Confirmation)

---

## Basic (Compulsory): Category Filters + Product Detail Page

Extend the existing store with category filtering and a product detail page.

### What to Build

**1. Category filter chips on the Store page**
- Row of filter buttons above the product grid: All, Clothing, Accessories, Electronics, Stationery
- Clicking a filter shows only matching products (the "All" tab shows everything)
- Active tab uses a BEM modifier: `.filter-chip--active`

**2. Product Detail page (`/product/:id`)**
- Two-column CSS Grid layout: product image (left), details (right)
- Breadcrumb navigation: `Store / Category / Product Name`
- Product info: name, price, category badge, stock status badge
- Quantity selector component (−/+) with local state
- "Add to Cart" button showing the total price
- Related products row at the bottom (Flexbox)

**3. Skeleton loading states**
- While products are loading, show placeholder cards with CSS shimmer animation
- Use `@keyframes` for a gradient sweep effect

### Components & BEM Classes (already in JSX)

```
FilterBar                → .filter-bar, .filter-chip, .filter-chip--active
ProductDetail            → .product-detail, .product-detail__grid, .product-detail__image,
                           .product-detail__info, .product-detail__name, .product-detail__price,
                           .product-detail__description, .product-detail__badges,
                           .product-detail__actions, .product-detail__add-btn
QuantitySelector         → .qty-selector, .qty-selector__btn, .qty-selector__btn--disabled,
                           .qty-selector__value
Breadcrumb               → .breadcrumb, .breadcrumb__item, .breadcrumb__separator,
                           .breadcrumb__link, .breadcrumb__current
StockBadge               → .badge, .badge--in-stock, .badge--low-stock, .badge--out-of-stock
SkeletonCard             → .skeleton-card, .skeleton-card__image, .skeleton-card__body,
                           .skeleton-card__line, .skeleton-card__line--short,
                           .skeleton-card__line--medium, .skeleton-card__footer,
                           .skeleton-shimmer
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

## Advanced (Optional): Multi-Step Checkout Flow + Dark Mode

Replace the current cart page with a full multi-step checkout experience and add dark mode support.

### What to Build

**1. Checkout stepper (4 steps)**
- Step indicator bar: Cart → Shipping → Payment → Confirmation
- Each step has states with BEM modifiers: `--done`, `--active`, `--upcoming`
- Steps connected by a progress line (filled for completed steps)
- Clicking a completed step navigates back to it

**2. Shipping form (Step 2)**
- Form with labeled inputs: Full Name, Email, City, Postal Code, Address, Phone
- Two-column layout for City + Postal Code row using CSS Grid
- Input focus states: border color change to `--color-primary`
- Form validation: required fields with `.form-group__input--error` modifier and error message below
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

### Components & BEM Classes (already in JSX)

```
CheckoutStepper          → .stepper, .stepper__item, .stepper__step, .stepper__circle,
                           .stepper__label, .stepper__line, .stepper__line--filled
ShippingForm             → .checkout-form, .checkout-form__title, .form-group,
                           .form-group__label, .form-group__input,
                           .form-group__input--error, .form-group__error, .form-row
PaymentForm              → reuses .checkout-form + .form-group
ConfirmationPage         → .confirmation, .confirmation__icon, .confirmation__details
ThemeToggle              → .theme-toggle, .theme-toggle__icon, .theme-toggle__track,
                           .theme-toggle__track--dark, .theme-toggle__knob
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

1. Work on your branch: `week-06/homework-basic` or `week-06/homework-advanced`
2. Build your assignment in the `src/` directory
3. Push and tag **your mentor** for review
4. **Due: before next lecture**
