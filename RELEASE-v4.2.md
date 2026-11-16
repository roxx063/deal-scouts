# Zepto and Blinkit v4.2

Zepto reads the native selected serviceability store and user position, including nested persisted position. Cookie names containing s are parsed correctly. Cart history and previous stores are never delivery-context fallbacks. Captured headers are bound to the selected store.

Blinkit uses two paced workers, with at least 500 ms between request starts. Category scans retain every configured aisle. A stalled page fails after 20 seconds, rate/access errors cancel all workers, and partial results can be opened while scanning. Quick Keyword Deals is a smaller first-page preview; it is not a whole-catalogue scan.

Local validation: 47 tests, including cookie parsing, selected-store consistency, cancellation, concurrency, pacing, and access-error shutdown.

A full catalogue can still take time and platform access limits can stop scans. Failed and capped coverage stays visible.

Other four platform scripts retain their previously published versions.
