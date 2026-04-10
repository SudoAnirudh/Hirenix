## 2026-04-10 - [Added Accessibility to Modal Buttons]
**Learning:** Standard HTML `<button>` tags in the frontend do not inherit default focus styles from the global custom `Button` component. They require manually adding `focus-visible` Tailwind utility classes (e.g., `focus-visible:outline-none focus-visible:ring-2`) and explicit `aria-label` attributes (for icon-only buttons) to ensure proper keyboard navigation and accessibility.
**Action:** Always verify keyboard accessibility on raw `<button>` tags and apply appropriate `focus-visible` utility classes and `aria-label` attributes.
