# Stack Detection

The selection table. A project is analysed by running the **detection probe**,
which produces a proposed template set. The probe is a lookup, not a judgement
call — every row below is a file or dependency whose presence is checkable.

**Run the probe before asking the user anything about their stack.** The
interview's job is the gaps the probe can't close, not a re-derivation of what
the repository already says.

## Why a table and not a judgement

The failure this replaces: an agent reads a `package.json`, forms an impression
of the stack, and selects templates from the impression. It picks the React
overlay for a React Native project, or emits the forms template for a project
with no forms, and the error is invisible until someone notices a rule about a
mechanism the project doesn't have.

A lookup produces the same set for the same repository, and the emitted set
carries its own justification — which is what makes "these templates were
omitted" answerable.

## How to run the probe

1. **Read the manifests** — `package.json`, `pubspec.yaml`, `pom.xml`,
   `build.gradle`, `Cargo.toml`, `pyproject.toml`, `go.mod`, `Gemfile`, and the
   framework's own config file if it has one.
2. **Match every row whose signal is present.** A project can match several — a
   React Native project also matches React and TypeScript. That's correct, not
   an over-selection.
3. **Record which signal triggered each inclusion.** The final report lists them
   (§Reporting).
4. **Check the conditional rows** in §Conditional domains. These depend on a
   project's *configuration*, not its framework, and each has a checkable
   signal.
5. **Check the exclusion rows** in §Exclusions before emitting anything.
6. **Anything the probe can't resolve is an interview question** — not a default
   and not a guess.

## Core — always emitted

No detection. A project with no code still gets these, adjusted for being empty.

| Template | Emitted |
|---|---|
| `core/entry-file.md` | always |
| `core/architecture.md` | always |
| `core/workflow.md` | always |
| `core/coding-standards.md` | always |
| `core/security.md` | always |

**Why these five and no more.** They are the rules that hold in any project in
any language, they are the ones an agent needs before it can do anything useful,
and they are the ones whose absence produces the failures this skill exists to
prevent. A sixth core template would be a template that isn't universal.

## Technology overlays

Signals are checked in this order; **the first match wins for the rendering
family**, and a lower row can still add a non-conflicting overlay.

| Signal | Overlay | Also emits |
|---|---|---|
| `pubspec.yaml` with a `flutter:` section | `tech/flutter-dart.md` | — |
| `app.json` / `app.config.*` present, or `expo` in dependencies | `tech/react-native-expo.md` | `tech/react.md` |
| `next.config.*` present, or `next` in dependencies | `tech/nextjs.md` | `tech/react.md` |
| `react` in dependencies, and neither of the above | `tech/react.md` | — |
| `@nestjs/core` in dependencies | `tech/node-nestjs.md` | — |
| `@nestjs/common` in dependencies without `@nestjs/core` | `tech/node-nestjs.md` | — |
| `pom.xml` or `build.gradle` with a Spring Boot parent/plugin | `tech/java-spring.md` | — |
| `tsconfig.json`, or `typescript` in dev dependencies | `tech/typescript-javascript.md` | — |
| `jsconfig.json`, or a `.js`/`.jsx` source tree with no TypeScript | `tech/typescript-javascript.md`, TypeScript rows omitted | — |
| A JavaScript or TypeScript source tree, no framework row matched | `tech/typescript-javascript.md` | — |

**Rows are additive where they don't conflict.** A Next.js project emits
`typescript-javascript` + `nextjs` + `react`. An Expo project emits
`typescript-javascript` + `react-native-expo` + `react`.

**Where two overlays would conflict on the same mechanism** — the rendering
family, the state-management rows — the more specific overlay wins and the
general one is not emitted. This is why the table is ordered.

### Variants

Variants are applied on top of an overlay, and more than one can apply. **Each
variant must be confirmed, not inferred** — a variant reverses or replaces a
decision, so the probe proposes it and the user confirms it.

| Ask | Variant | Applies to |
|---|---|---|
| App Router or Pages Router? | `variants/nextjs-pages-router.md` | `nextjs` |
| Which component library? | `variants/mui.md` | `nextjs`, `react` |
| Client-side or server-first data fetching? | `variants/ssr-hybrid.md` | `nextjs` |
| Is there a client-owned state store beyond local state? | `variants/client-state-library.md` | any JS/TS or Dart project |

**An installed library settles a component-library axis with no question** — if
`@mui/material` is a dependency, apply the MUI variant; don't ask. A data-access
or router axis is a *decision*, so it is asked.

**Do not write a combined variant file.** Two axes applied at once means applying
two delta files. A "Pages Router + MUI" file is the combinatorial explosion this
structure exists to prevent: 2×2×2 axes produce 8 near-identical overlays, and
they drift.

## Conditional domains

Each has a checkable signal. **No signal, no template** — and the omission is
reported with its reason, so "why is there no forms rule?" has an answer.

| Signal | Template | Reported omission reason |
|---|---|---|
| A form exists, or a validation library is a dependency, or a dependency handles form state | `domain/forms.md` | "no form in the project" |
| A test runner is configured, **or** test files exist, **or** the project's manifest has a test script | `domain/testing.md` | "no test runner configured" — emit with the aspirational status block, because that gap is itself a finding |
| A localisation layer: a locale directory, translation source files, a locale config, or more than one locale in configuration | `domain/i18n.md` | "single-locale project" |
| A design contract: a design/brand document, a token module, a theme file, or a design-token configuration | `domain/design-system.md` | "no design contract" |
| The project calls an external system whose documentation doesn't fully specify its behaviour: a third-party API, a legacy backend, a payment or auth provider, a vendor platform | `domain/external-system-contracts.md` | "no external system" |
| The project has network data access at all | `domain/data-and-state.md` | "no data layer" — still emitted for a project with a data layer, even a simple one |
| A UI layer exists | `domain/ui-components.md`, `domain/accessibility.md` | "no UI layer" — e.g. a pure API service |
| The project has any executable artifact whose performance is observable | `domain/performance.md` | "not applicable" — rare |

**On the testing row specifically.** No test runner is a real and common state,
and it is the state where a testing template does the most good, because the
status block is what stops a Definition of Done line from quietly becoming
fiction. Emit `testing.md` with the aspirational block rather than skipping it.

**On the data-and-state row specifically.** Emit it whenever there is a data
layer, even a trivial one. Its decision rules — search, mutations,
invalidation — are the ones a project gets wrong first, and a project with one
API call still has a client instance and a normalized error type to get right.

## Exclusions

Checked before emitting. Each prevents a template whose rules the project cannot
act on.

| Condition | Excluded | Reason |
|---|---|---|
| A pure library or package with no UI and no server | `ui-components`, `accessibility`, `design-system` | Rules about screens, roles, and tokens have nothing to bind to |
| A pure API service with no UI | `ui-components`, `accessibility`, `design-system`, `i18n` | Same |
| A project whose only consumer is another project in the same monorepo | `i18n` unless the consumer needs it | The API's error messages are not end-user copy |
| An existing project that has already standardised on a different approach for a domain | the corresponding template, in **adoption mode** | See `existing-project-protocol.md` — the project's convention wins over the template's |
| A monorepo | per-service overlays, not one for the whole repo | A React service and a NestJS service need different overlays; see §Monorepos |

## Monorepos

**One overlay per service, not one for the repository.** The detection probe runs
in each service directory, and the emitted set is assembled from the union.

> This section owns the monorepo **layout** — which files exist where, and what
> each carries. The **wiring** — the config file each service needs, and the
> `instructions` globs — is `target-formats.md` §Monorepos. One owner per fact.

```
/AGENTS.md                          ← core only, plus what's genuinely universal:
                                      git conventions, the DoD shape, the
                                      escalation ladder, the memory-file protocol
/services/api/AGENTS.md             ← core + node-nestjs + data-and-state + testing
/services/api/.opencode/rules/*.md
/services/web/AGENTS.md             ← core + typescript + nextjs + react + ui + …
/services/web/.opencode/rules/*.md
```

- **The root file states only what is universal.** The root carries the git
  conventions, the definition-of-done *shape*, the escalation ladder, the
  memory-file protocol, and the priority ranking. It does not carry a service's
  commands, its stack, or its domain rules.
- **A service file states its deltas**, including its own commands and its own
  tech stack table.
- **A conflict resolves to the closer file.** A service can tighten a root rule;
  it cannot contradict one without saying so explicitly.
- **A rule is not repeated between root and service.** The root states it, the
  service references it. Repetition is how the two drift.
- **Tech overlays are never shared across services** with different stacks. Two
  services on the same stack may share a core template's *content*, but each
  emits its own copy — a shared file that one service edits breaks the other.
  Where the tool supports directory-scoped instruction files, use them; the
  portability of a single canonical file is a deliberate trade against this.

## On a project with no code yet

**The probe will find almost nothing, and that is expected, not a failure.**

Every conditional-domain signal in §Conditional domains requires existing code:
a form exists, a test runner is configured, a localisation layer is present, a
design contract has been written, an external system is being called. On day one
none of them are true, so the probe returns the core tier plus whatever the
manifest names — and the domain selection becomes a **question, not a lookup**.

Handle it honestly:

- **Say so.** "The project has no code yet, so the domain rules are a choice
  rather than a detection — here are the ones a {{stack}} project usually needs."
  Presenting the table and then finding nothing to match reads as a broken tool.
- **Propose the domains the stack implies** and ask for confirmation. A React
  Native project almost always wants `forms` and `testing`; a project that
  genuinely has neither should say so, and that is worth knowing before the
  first feature is written.
- **Do not report day-one omissions as findings.** "No test runner configured" is
  true and worthless before any code exists. Reserve the omission report for
  omissions that mean something — a project with 200 files and no tests, a design
  contract that exists but no rule file that references it.
- **Re-run the probe later.** The detection table is cheap, and a project that
  gains its first form or its first test is exactly the moment the domain
  selection becomes a lookup.

## Reporting

The run's final report states, for each template, one of:

- **emitted**, with the signal that triggered it
- **emitted with a variant applied**, naming the variant
- **omitted**, with the row from §Conditional domains or §Exclusions that
  explains it
- **omitted by the user's choice**, when the probe proposed it and they declined

**A template emitted without a recorded signal is a defect.** It means the
selection was a judgement call where a lookup was available, and the next run
will make a different judgement.

**A template omitted without a recorded reason is also a defect** — it looks like
an oversight, and someone will ask. "No test runner configured" is a finding
worth surfacing, not a reason to stay silent.
