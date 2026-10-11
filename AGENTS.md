# AquaSentinel - rules for every agent session

Product: district-level satellite monitor for water bodies. Users are District Collectors, Tahsildars and analysts.
Stack: React+Vite+TS (frontend/), FastAPI (backend/), Firebase Auth/Firestore/Hosting, Google Earth Engine.

## Non-negotiables
1. Never invent data. Every number on screen comes from a stored analysis result. Empty or missing data shows an explicit empty/insufficient state.
2. Wording: "measured change", "candidate zone", "needs field verification". Never "illegal", "encroacher" or "violation" in UI, API or reports.
3. Same-season comparison only. Never compare monsoon with dry season.
4. Secrets: no keys in code, logs, tests or the frontend bundle. Server secrets live in backend/.env or Secret Manager. Only Firebase web config and the optional restricted MapTiler key may be in VITE_ variables.
5. Auth: every protected endpoint verifies the Firebase ID token and checks role + district claim server-side. Deny by default. Clients never write to Firestore.
6. Validate all input with pydantic/geo.py. Geometry is stored as a JSON string (Firestore has no nested arrays).
7. Errors shown to users say what happened and what to do next. No stack traces, no apologies, no vague "Something went wrong" unless the server gave nothing.
8. UI: follow prompts/stitch.md. No gradients, glass effects, emoji icons, or grids of identical cards. Keyboard focus visible, reduced-motion respected, Telugu text can be 30% longer.

## Definition of done for any task
- ./verify.sh exits 0
- New behaviour has a test (backend) or is exercised in the browser (frontend) with a screenshot saved to docs/shots/
- Security-relevant change: list the abuse case you tried and how it was rejected
