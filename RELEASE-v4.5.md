# Deal Scouts v4.5

- Rebuilt the corner Scout as a compact app panel with two-column category choices and clearer actions.
- Replaced the oversized results masthead with a compact live-status header and horizontal filter bar.
- Added visible category chips above products, including categories retained by the fast search.
- Fixed Stop so it reports `Stopping…` immediately and ends even when a marketplace request ignores abort.
- Bounded fast search to 12 seconds and allowed two paced Zepto requests at a time.
- Kept selling price, MRP, discount, search progress, CSV export, exclusions, and new-tab results.

Verification: 63 automated tests passed. Desktop Swift and Android Pocket layouts rendered with seven products, visible categories, compact headers, and no browser-page errors.
