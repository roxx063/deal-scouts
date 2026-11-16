# Shared fast mode v4.3

All six scouts open with Find deals fast. It previews first pages with a 25-second scan budget, streams prices as they arrive, and records remaining checks instead of claiming complete coverage. Scan all included aisles follows the selected page depth. Exclusions keep their native-category path; JioMart uses native Quick facets.

Setup and category-loading stages have deadlines. Stalled pages time out. Access errors stop requests. Delivery-context changes invalidate previous prices. No cart or order operations.

Validation: 52 local tests and a focused code review. Live checks returned products on Zepto, Blinkit, Amazon Now, Flipkart Minutes and JioMart Quick. BigBasket desktop searches worked, but Android-emulated search was refused with HTTP403; mobile availability is unresolved. These are bounded preview checks, not whole-catalogue or physical-phone certification.

The visual design proposals are separate; no new design theme is selected or applied in this release.
