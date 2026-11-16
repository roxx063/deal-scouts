# Deal Scouts v4.7

- Fixed Search level: the selected level now controls the single blue Search button.
- Fixed Zepto Quick, More, Detailed and Maximum searches ending after three failed category requests.
- Added a working Zepto search fallback when the website does not return a subcategory list.
- Runs every search level in parallel and keeps products found before the time limit.
- Added clear maximum times: Fast 10 seconds, Quick 20 seconds, More 45 seconds, Detailed 90 seconds and Maximum 3 minutes.
- Ordinary category failures no longer cancel the remaining categories; only access and rate-limit errors stop the run early.
- Preserved the compact blue glass interface, visible categories, selling price, MRP, discount, Stop and CSV export.

Verification: all 69 automated tests passed, all six generated scripts passed JavaScript syntax checks, and every generated script identifies itself as Scout v4.7.
