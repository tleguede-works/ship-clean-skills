# ship-clean-skills

Agent Skills for shipping software that holds together — from a vague idea to an
implementation plan a low-capability model can execute without guessing.

Conforms to the [Agent Skills specification](https://agentskills.io). Installs
into OpenCode, Claude Code, Codex, Cursor and 30 other agents with one command.

## Install

```bash
# See what's available, without installing
npx skills add tleguede-works/ship-clean-skills --list

# Install everything, globally, for OpenCode
npx skills add tleguede-works/ship-clean-skills -g -a opencode -y

# Or just the ones you need
npx skills add tleguede-works/ship-clean-skills --skill forge -g -a opencode -y
```

Other agents: replace `opencode` with `claude-code`, `codex`, `cursor`, `windsurf`…
See `npx skills add --help` for the full list.

## Skills

| Skill | What it does |
|---|---|
| **[`forge`](skills/forge/)** | Takes a rough product idea and turns it into an exhaustive implementation plan — PRD, roadmap, design, architecture, per-slice plans, test plan, impact analysis — precise enough that a weak model can implement a slice without ambiguity. Also runs the implementation, with executable exit criteria and optional autonomous validation. |
| **[`project-rules-architect`](skills/project-rules-architect/)** | Generates a coherent, non-redundant set of AI-agent instruction files for a project — an entry file plus a rules directory, built from a template library selected by detected stack rather than copied wholesale. |
| `cartographe` | *Planned.* Legacy codebases and migrations to a different stack. |

### How they fit together

They are complementary and have a **declared boundary**, not a shared pile of
notes:

| `forge` owns | `project-rules-architect` owns |
|---|---|
| `.forge/` — what to build, and where the work stands | `AGENTS.md`, `.opencode/rules/*.md` — what to follow |
| `state.json` — status, paths, IDs, hashes | `DECISIONS.md` — why · `LEARNINGS.md` — what broke · `SESSION_LOG.md` — what happened |

**A business or technical fact lives in a file owned by `project-rules-architect`.**
`state.json` holds a pointer, not a copy. Forge routes findings into the right
file instead of accumulating them.

See [`skills/forge/references/skill-boundaries.md`](skills/forge/references/skill-boundaries.md).

## Repository layout

```
skills/
  <skill-id>/
    SKILL.md          required — name + description in YAML frontmatter
    references/       documents the agent reads on demand
    scripts/          executable helpers
    templates/        files copied and filled in
    agents/           sub-agent contracts
```

**The repository root must not contain a `SKILL.md`** — the whole repo would
then be detected as a single skill. This file is the README.

Skill IDs come from the **directory path**, not the frontmatter `name`, and must
match `^[a-z0-9]+(-[a-z0-9]+)*$`. Keep `name` aligned with the directory.

## Contributing

```bash
npx skills init skills/my-skill      # scaffold
$EDITOR skills/my-skill/SKILL.md

node scripts/validate-repo.js        # must pass before you push
node skills/forge/scripts/selftest.js
```

`validate-repo.js` refuses: a missing `SKILL.md` or `description`, an
unportable or mismatched ID, a reference to a skill that does not exist, a
misspelled skill ID, a `{{PLACEHOLDER}}` left in shipped content, a declared
agent/script list that no longer matches the files on disk, and a script with a
syntax error.

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Maintenance

```bash
npx skills check       # available updates
npx skills update      # apply them
npx skills list        # what is installed, and where
```

### Where it installs, and what that means

A global install lands in **`~/.agents/skills/<skill-id>/`**, which OpenCode
reads alongside `~/.claude/skills/`. It is a **copy**, not a symlink — verified
here, not assumed from the documentation.

Two consequences, both of which have already caused a real problem:

1. **Edit in this repository, never in an installed skill.** The installed copy
   is independent. A local edit is not lost visibly — it is silently replaced by
   the next `skills update`, and the two drift apart. That is how a project ends
   up running a several-releases-old version of a skill.
2. **Do not install the same skill into two global locations.** OpenCode resolves
   skills by ID and a later-registered source wins, so with the same skill in
   both global paths one of them is simply shadowed:

   ```
   ~/.claude/skills/impeccable      ← loaded
   ~/.agents/skills/impeccable      ← shadowed
   ```

   Which version you get is then decided by installation order, not by you. If a
   skill is needed in two agents, let `npx skills` install both from one source.

### Track updates

```bash
npx skills generate-lock
```

Writes the lock that `skills check` and `skills update` match against. Without
it, updates are not tracked back to a source.

## License

MIT — see [LICENSE](LICENSE).
