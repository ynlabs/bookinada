# API contract validation

## Course scope and implementation

Exercise Sheet 1, project exercises 8 and 9, asks for Flight and Hotel REST interfaces, separate OpenAPI 3.0.3 contracts, and automated Redocly validation. This personal project adapts GitLab CI to GitHub Actions. It does not replace the course's team, GitLab training, Bruno mock-API exercise, or independent review activities.

| File | Purpose |
| --- | --- |
| `api-design.md` | Human-readable requests, responses, and business rules. |
| `../api/hotel.openapi.yaml` | Three Hotel operations and reusable request, response, and error schemas. |
| `../api/flight.openapi.yaml` | Three Flight operations and reusable request, response, and error schemas. |
| `../package.json` | Validation command and exact Redocly development-tool version. |
| `../package-lock.json` | Locked dependency resolution used by `npm ci`. |
| `../redocly.yaml` | Explicit validation policy. |
| `../scripts/validate-api.mjs` | Runs Redocly and fails on either errors or warnings. |
| `../.github/workflows/api-validation.yml` | Runs the same command on PRs, pushes to main, and manual dispatch. |

## Run locally

Use Node.js 22, at least 22.12.0, and npm 10 or newer. From the repository root:

```sh
npm ci
npm run lint:api
```

If npm cannot write to the default cache, use a writable local cache without changing system-directory permissions:

```sh
npm ci --cache /tmp/bookinada-npm-cache
```

Expected successful validation summary:

```text
api/hotel.openapi.yaml: 0 errors, 0 warnings
api/flight.openapi.yaml: 0 errors, 0 warnings
```

## Validation policy

Redocly CLI is pinned to 2.72.1 and uses the recommended rules. Two publishing-oriented rules are disabled with comments in `redocly.yaml`: these contracts intentionally use localhost, and this private learning project does not claim a public license URL. Schema structure, references, examples, and other recommended checks remain enabled.

In the installed CLI, `--max-problems 0` limits displayed diagnostics; it does not reject warnings. This differs from the interpretation suggested in the exercise sheet. The wrapper reads Redocly's JSON totals and returns exit code 1 if any errors or warnings remain. A missing executable or unusable report also fails the command.

## Local verification performed on 2026-10-30

Environment: Node.js 22.23.1, npm 10.9.8, Redocly CLI 2.72.1.

| Check | Observed result |
| --- | --- |
| Install from lockfile using `npm ci` | Completed successfully. |
| Validate both project contracts | Both passed with 0 errors and 0 warnings; exit code 0. |
| Replace the Hotel search-result reference with `UnknownOffer` in a temporary copy | Failed with `no-unresolved-refs`; exit code 1. |
| Restore that Hotel reference | Passed; exit code 0. |
| Repeat the missing-reference and restoration checks for Flight | Failed, then passed as expected. |
| Add an unused schema to a temporary Hotel copy | Redocly reported 0 errors and 1 warning; the wrapper returned exit code 1. |

The negative checks used temporary copies. The tracked contracts were not left invalid. These are contract-tool checks, not HTTP integration tests or concurrency tests.

## Verify on GitHub after pushing

1. Open a PR from `docs/week2-api-contracts` to `main`.
2. Open its Checks tab and inspect `API contract validation` / `Validate Hotel and Flight OpenAPI`.
3. Confirm `npm ci` succeeds and both contracts report zero errors and warnings.
4. Record the actual run result before claiming remote CI verification.
5. For a remote failure/recovery demonstration, temporarily change the search response's `SearchResult` reference to `UnknownOffer` on the work branch, commit and push, observe the failed job, then restore the reference, commit and push, and observe success. Do not merge the intentionally broken version.

A workflow alone does not prevent merging failed checks. Requiring the check through repository branch protection or rulesets is a separate configuration step; it has not been performed here.

## What remains outside these checks

- No NestJS service has been implemented or started, and no HTTP requests have been tested against an implementation.
- Calendar validity, check-out after check-in, matching cities, current inventory, rollback, and concurrency invariants still require implementation and tests. A valid schema does not establish these business properties.
- Synthetic `travellerId` is a local learning assumption, not authentication or authorization. Prices, idempotent retries, date eligibility, and operational server-error behavior remain open.
- Notification architecture, the blockchain alternative, and API operations beyond the six required initial operations need later refinement.
- Both specifications are tutor-assisted proposals that still require learner understanding and review.
