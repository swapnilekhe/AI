# Copilot Instructions

Purpose
- Provide clear, concise guidance for the Copilot assistant when editing this repository.

Goals
- Make small, surgical changes that follow the repository's existing style.
- Prefer correctness, minimal scope, and maintainability.

Scope and Constraints
- Modify source files only within the workspace when requested.
- Avoid changing unrelated files or broad refactors without explicit approval.
- Do not add secrets, credentials, or environment-specific paths.

Coding Conventions
- Language: TypeScript.
- Keep changes minimal and consistent with surrounding code style.
- Avoid one-letter variable names.
- Prefer descriptive names and small helper functions.
- No unnecessary comments; follow existing comment density.

Testing & Validation
- If tests or builds are present, run them before finalizing changes.
- Provide commands to run any added tests or build steps.

Commit & PR Guidance
- Use present-tense, imperative commit messages (e.g., "Add helper for X").
- If multiple related changes are needed, create one PR with a clear description.

Files to Avoid
- Do not modify files in `node_modules`, build outputs, or generated artifacts.

If Unsure
- Ask the user for clarification before making structural or API changes.

Contact
- After making changes, leave a brief note describing what you changed and why.
