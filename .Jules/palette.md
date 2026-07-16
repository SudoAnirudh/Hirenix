## 2024-07-16 - Forms without proper labels or error associations
**Learning:** Found several forms in the app where inputs don't have matching ids to link with their labels using `htmlFor`. This creates accessibility issues for screen readers.
**Action:** Add `id` properties to the inputs and select elements and corresponding `htmlFor` properties to the `<label>`s to properly associate them.
