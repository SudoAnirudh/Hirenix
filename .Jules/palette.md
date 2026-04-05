
## 2026-04-05 - Keyboard focus styles for standard buttons
**Learning:** Standard `<button>` tags in this app do not inherit the default focus styles provided by the global `Button` component. This means they remain visually invisible during keyboard navigation.
**Action:** Always manually add `focus-visible` utility classes (e.g. `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[theme_color]`) to standard `<button>` tags to ensure proper keyboard accessibility.
