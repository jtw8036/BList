# Agent Instructions

## General Project Rules
- **Strict Data Preservation:** NEVER modify sensitive data structures, default initial data (e.g., `src/data/initialData.ts`), or database schema/storage logic unless explicitly instructed by the user. 
- **Strict Scope Boundaries:** Do NOT modify, refactor, or touch any parts of the code, layout, or logic that were not explicitly requested by the user. Respect the existing implementation and only make targeted changes to fulfill the user's specific request.

- **PWA & iOS Icon Generation:** When configuring PWA icons (especially `apple-touch-icon`), always generate standard 24-bit RGB PNG files without alpha channels. Always save generated icons directly into the `public/` directory so Vite copies them to `dist/`. Add a pre-build script in `package.json` (e.g., `node scripts/generate-icons.js && vite build`) to ensure icons are generated reliably before every build. Ensure `index.html` and `manifest.json` reference the exact same file paths.
