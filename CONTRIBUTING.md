# Contributing

## Adding a skill

```bash
npx skills init skills/my-skill
```

Then, before you push:

```bash
node scripts/validate-repo.js
node skills/forge/scripts/selftest.js    # if you touched forge
```

### The four rules

**1. The ID is the directory name.** OpenCode derives a skill's ID from its
**path**, not from the frontmatter `name`. `skills/my-skill/SKILL.md` is
`my-skill`. A `name` that differs creates two names for one thing — the model
uses the ID, the user says the name. The validator fails on a mismatch.

The ID must match `^[a-z0-9]+(-[a-z0-9]+)*$`. This is a recommendation OpenCode
does not currently enforce, which is exactly why it should be enforced here.

**2. Write a description that lets the model choose.** It is the only thing the
model sees before deciding whether to load the skill. Say what it does *and*
when to use it, and say when **not** to.

Bilingual trigger clauses are worth the extra words if your users prompt in more
than one language — both skills here carry a French and an English clause.

**3. Never reference a skill that does not exist.** An instruction to "see the
X skill" where X is absent orders the model to delegate to nothing. That is an
inference failure, not a documentation note. The validator fails on it.

**4. Keep supporting files in subdirectories.** At load time OpenCode provides
the skill's base directory and a sample of up to **ten** supporting file paths.
Flat files do not get a neighbouring-file list at all. Note that ten is a
*sample*, not a gate — a large skill is not broken, but its `SKILL.md` must
carry a complete reference table, because that table is what the model reads
before deciding what to open.

### Content conventions

- `references/` — documents read on demand. Reference them explicitly from
  `SKILL.md`, with the condition that triggers each one.
- `scripts/` — zero-dependency Node. They must run under `node --check`.
- `templates/` — anything in a `templates/` directory is a template by
  location. A fill-in form living elsewhere declares itself with a
  `<!-- forge:form -->` marker, so the placeholder check skips it.
- Leave no `{{PLACEHOLDER}}` in shipped content. An unfilled placeholder means
  a value was never chosen.

## Declaring sub-agents

If a skill ships sub-agent contracts, list them in `SKILL.md` and keep the list
honest. The validator compares the table against the files on disk in both
directions — a declared agent that is gone, and an agent on disk that nobody
mentions, are both defects. A list that drifts from its content becomes false
without any signal.

## Release

A global install is a **copy** into `~/.agents/skills/`, not a symlink —
verified, not assumed. So a local edit to an installed skill is not refused
anywhere: it is silently replaced by the next `skills update`. Edit here.

The repository's default branch is the distribution channel: `npx skills add`
reads from it.

### One version for the repository

Not one per skill. Forge and `project-rules-architect` hold a documented
boundary, so they must move together; separate numbers would let that contract
drift silently. `CHANGELOG.md` says which skill changed.

### How a change becomes a release

1. Branch, commit, push, open a pull request.
2. Add an entry under `## [Unreleased]`, in the format
   `### type(scope) — one-line summary`, followed by a paragraph explaining
   **why**. The diff already says what.
3. Merge to `main`.

`.github/workflows/release.yml` then runs on its own: it verifies, decides
whether there is anything to publish, bumps, commits, tags, and creates the
release. Nothing is published when `[Unreleased]` is empty — a version number
spent on an invisible change makes the history stop meaning anything.

```bash
node scripts/release.js current     # the version
node scripts/release.js check       # VERSION ↔ CHANGELOG coherence (in CI)
node scripts/release.js notes 1.2.0 # release body for a version
node scripts/release.js bump --minor
```

Manual publication, when a version is genuinely warranted with no pending
entry: `workflow_dispatch` with a level. The level is a floor, not a ceiling —
if `[Unreleased]` holds a `feat`, a `patch` request publishes a minor.

### Rules a pull request must respect

The release workflow commits `VERSION` and `CHANGELOG.md` straight to `main`.
Any open pull request touching those two files would therefore conflict at
merge time — and the conflict surfaces between two published versions, which
is the worst moment to discover it.

So a pull request:

- adds **only** inside `## [Unreleased]`
- does **not** touch `VERSION`
- does **not** rewrite an already published section

Correcting a bad release is done with a new entry, not by editing history.
`scripts/changelog-policy.js` enforces this in CI, **with `--base main`** — the
base is what enables the two checks that carry the meaning (published section
untouched, `[Unreleased]` actually changed). Without it the script only validates
the file's shape, and a pull request that adds no trace passes.
