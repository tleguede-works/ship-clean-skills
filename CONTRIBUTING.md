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

The repository's default branch is the distribution channel: `npx skills add`
reads from it. Version with git tags per skill so an update is identifiable:

```bash
git tag forge-v2.0.0
git push --tags
```

Because Forge and `project-rules-architect` hold a documented boundary, they
must move together. Tag the pair in one commit. Two repos would let that
contract drift silently — the exact failure class this repository's tooling
exists to catch.
