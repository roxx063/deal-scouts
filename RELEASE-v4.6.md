# Deal Scouts v4.6

- Replaced the beige interface with an Apple-inspired blue glass design on desktop and mobile.
- Added a dedicated fast lane: up to three first-page checks run together with no normal inter-search delay.
- Kept Zepto at two concurrent fast checks with a short 50 ms gap to limit rate-limit risk.
- Reduced the fast-search window from 12 seconds to 10 seconds while preserving partial results.
- Detailed searches retain each marketplace's safer pacing and page controls.
- Kept immediate Stop, visible categories, selling price, MRP, discount, exclusions and CSV export.

Verification: 65 automated tests passed. Swift desktop and Pocket Android layouts rendered with seven products, visible categories and no browser-page errors.
