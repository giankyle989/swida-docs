# SWIDA Docs

Docusaurus v3 documentation site for the SWIDA platform.

## Project Structure

- `docs/swida/` — All documentation content
- `docs/swida/glossary.md` — Canonical terminology glossary (agent-maintained, human-reviewed)
- `.claude/agents/` — Documentation review subagents
- `.claude/skills/` — Slash command skills

## Conventions

### Bilingual Docs (EN/KO)

All docs are maintained in both English and Korean using paired files:
- Single-file pattern: `en.md` and `ko.md` at the same directory level
- Subdirectory pattern: `en/` and `ko/` sibling directories with matching filenames
- Both patterns may coexist within the same doc type

### Terminology

Use canonical terms from `docs/swida/glossary.md`. When writing or editing docs:
- Check the glossary for preferred EN/KO terms
- Avoid terms listed in the glossary's "Avoid" column
- If you introduce a new domain term, propose adding it to the glossary

### Auto-Check Convention

After editing any `.md` file under `docs/`, run `/docs-review` on the changed file to check for sync gaps, terminology issues, cross-reference conflicts, and formatting problems. This is advisory — fix issues at your discretion.

## Commands

- `npm run build` — Build the Docusaurus site
- `npm run start` — Start dev server
- `/docs-review` — Run documentation quality review (full sweep or targeted)
