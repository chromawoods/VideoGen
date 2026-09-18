---
name: verify
description: >-
  Use this skill when the user asks to run verifications, run checks, test the codebase,
  validate builds, or ensure code quality in VideoGen.
---

# VideoGen Verification Workflow

Run these verification steps in order to validate codebase health, type safety, test coverage, and build integrity.

## Verification Checklist

Execute the following commands in the workspace root (`c:\code\VideoGen`):

### 1. Run Unit & Component Tests
Execute the Vitest test suite in single-run mode:
```bash
bun run test:run
```
- **Success Criteria**: All test suites in `src/` pass (e.g. `lib`, `hooks`, `components`).
- **If failing**: Inspect the failed assertions, review recent edits in the corresponding test or implementation file, and fix before proceeding.

### 2. Run TypeScript Type Check
Validate TypeScript types across the project:
```bash
bun run lint
```
*(Runs `bun run --bun tsc -b`)*
- **Success Criteria**: Process exits with code 0 and no type errors.
- **If failing**: Fix type annotations, missing imports, or mismatched interface props.

### 3. Check Code Formatting
Check formatting on source code files:
```bash
bunx prettier --check "src/**/*.{ts,tsx,css,json}"
```
*(Or `bun run format:check` for all repository files)*
- **Success Criteria**: Output reports all matched files use Prettier code style.
- **If failing**: Automatically format modified files using:
  ```bash
  bun run format
  ```

### 4. Run Production Build
Verify that the production bundle compiles and packages cleanly:
```bash
bun run build
```
*(Runs `bun run --bun tsc -b && bun run --bun vite build`)*
- **Success Criteria**: Vite produces the production assets in `dist/` and exits with code 0.
- **If failing**: Check for bundler/chunking errors, missing assets, or production environment mismatches.

## Summary Reporting

When reporting results back to the user, present a clean summary table:
- **Unit & Component Tests**: `bun run test:run`
- **TypeScript / Lint**: `bun run lint`
- **Source Formatting**: `bunx prettier --check "src/**/*.{ts,tsx,css,json}"`
- **Production Build**: `bun run build`
