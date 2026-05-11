# Mutation Testing with StrykerJS

This project uses [StrykerJS](https://stryker-mutator.io/) to measure the
quality of its Jest test suite via **mutation testing**.

A mutant is a tiny, automated change to the source code (flip a `<` to `<=`,
remove a method call, replace a string with `""`, etc.). The test suite is
re-run for each mutant:

- If at least one test fails → the mutant is **killed**. Good.
- If every test still passes → the mutant **survived**. Bad: something the
  code does is not actually being asserted.
- If no test even exercises the mutated line → **no coverage**. Bad: dead test
  surface.
- If a mutant cannot be type-checked → **compile error**. Stryker discards it
  before running tests, so it doesn't count for or against the score.

The mutation score is `killed / (killed + survived + no coverage)`. A high
score means the tests don't just execute the code, they actually pin down its
behaviour.

---

## Stack

| Piece | Purpose |
| --- | --- |
| `@stryker-mutator/core` | The Stryker runtime. |
| `@stryker-mutator/jest-runner` | Drives mutation runs through this project's Jest config. |
| `@stryker-mutator/typescript-checker` | Type-checks every mutant first, so type-broken mutants are filtered out instead of wasting a test run. |

All three are dev-dependencies (`npm install --save-dev`).

---

## Configuration: `stryker.config.mjs`

```js
export default {
  packageManager: 'npm',
  testRunner: 'jest',
  jest: {
    projectType: 'custom',
    configFile: 'package.json',      // re-uses the Jest config already in package.json
    enableFindRelatedTests: true,    // only runs specs that import the mutated file
  },
  checkers: ['typescript'],
  tsconfigFile: 'tsconfig.json',
  reporters: ['html', 'clear-text', 'progress'],
  htmlReporter: { fileName: 'reports/mutation/index.html' },
  coverageAnalysis: 'perTest',       // skips mutants no test touches
  concurrency: 4,
  timeoutMS: 30000,
  mutate: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',             // never mutate the tests themselves
    '!src/**/*.dto.ts',              // pure class-validator decorator declarations
    '!src/**/*.module.ts',           // NestJS DI wiring
    '!src/main.ts',                  // bootstrap
    '!src/prisma.service.ts',        // thin Prisma extension
    '!src/view/**',                  // Next.js view layer (different test strategy)
  ],
  thresholds: { high: 80, low: 60, break: null },
};
```

Notes:

- `coverageAnalysis: 'perTest'` is the fastest meaningful setting — Stryker
  records which test hit which mutant line during the dry run, then only runs
  those specific tests per mutant.
- `enableFindRelatedTests: true` further narrows the suite that gets booted
  for each mutant.
- `thresholds.break` is `null` so a low score won't fail CI yet. Set it to a
  number (e.g. `70`) when the team is ready to gate on it.
- The HTML report is written to `reports/mutation/index.html` (gitignored).

---

## Running it

```bash
# Full project (everything matched by `mutate`)
npm run test:mutation

# A single file or module — much faster, useful during development
npx stryker run --mutate 'src/todos/**/*.ts'
npx stryker run --mutate 'src/todos/todos.service.ts'
```

Each run produces three reporters:

- `progress` — live status in the terminal.
- `clear-text` — the final summary table.
- `html` — `reports/mutation/index.html`. Open it in a browser to see every
  surviving mutant highlighted in the source.

---

## Baseline run: the Todos module

After building the Todos module with TDD, scoping Stryker to just that module
gave:

```
File                 | % score | killed | survived | no cov | errors
todos.controller.ts  | 100.00  |      7 |        0 |      0 |     10
todos.service.ts     | 100.00  |      5 |        0 |      0 |      9
All files            | 100.00  |     12 |        0 |      0 |     19
```

- 31 mutants generated; 19 rejected by the TS checker (e.g. replacing
  `this.prisma.todo.findUnique({ where })` with `{}` makes the type signature
  invalid). Those don't count.
- 12 mutants reached the test suite; every one was killed.
- Initial dry run: ~3 s. Full mutation run: ~41 s with concurrency 4.

The result confirms the TDD specs assert on behaviour, not just on calls
being made.

---

## Reading the report

When a mutant **survives**:

1. Open `reports/mutation/index.html` and click the file.
2. The mutated source is highlighted; hover to see the mutation
   (e.g. `findMany({ skip, take })` → `findMany({})`).
3. Decide:
   - **Missing assertion** — your spec called the method but didn't assert on
     what it was called with. Tighten the `expect(...).toHaveBeenCalledWith(...)`.
   - **Missing test case** — a whole branch (`if (cached) return cached`) has
     no spec around it. Add one.
   - **Equivalent mutant** — the mutation produces behaviourally identical
     code (rare but real). Mark it with a Stryker disable comment:
     `// Stryker disable next-line all`.

---

## What's excluded and why

| Path | Reason |
| --- | --- |
| `*.spec.ts` | Tests must not be mutated. |
| `*.dto.ts` | Just `class-validator` decorator declarations; mutating decorator arguments produces noisy false positives that aren't behaviour. |
| `*.module.ts` | Nest DI wiring; tested implicitly by `Test.createTestingModule` in every spec. |
| `main.ts` | Bootstrap; covered by e2e, not unit tests. |
| `prisma.service.ts` | Single-method extension of `PrismaClient`; nothing meaningful to mutate. |
| `src/view/**` | Next.js render layer; covered by Playwright e2e (`test:e2e:playwright`), not Jest. |

Re-enable any of these if you add Jest specs for them — just delete the
matching `!...` line from `mutate`.

---

## Adding a new module to mutation testing

If a new module already lives under `src/` and has Jest specs, **it's already
included** — the default `src/**/*.ts` glob picks it up. Just run
`npm run test:mutation` and check its file in the HTML report.

If the new module needs to be excluded (e.g. it's e2e-tested only), add a
negation to the `mutate` array in `stryker.config.mjs`.

---

## Performance tips

- During development, always scope with `--mutate 'src/<area>/**/*.ts'`. Full
  runs are for CI / pre-merge.
- Drop the TS checker for the fastest iterations:
  `npx stryker run --checkers '[]' --mutate '...'`. You'll see a few extra
  "errors" reclassified as "killed" because mutants that wouldn't compile
  still get caught by `ts-jest` at test time — same outcome, slower path.
- `concurrency` defaults to half the available CPU cores; raise it on bigger
  machines, lower it inside containers with strict CPU limits.

---

## CI integration (not yet enabled)

To gate merges on mutation score, set `thresholds.break` in
`stryker.config.mjs` (e.g. `break: 70`) and add a step:

```yaml
- run: npm ci
- run: npm run test:mutation
```

Stryker exits non-zero when the score drops below `break`. The HTML report
can be uploaded as a build artifact for review.
