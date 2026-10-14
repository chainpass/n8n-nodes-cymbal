# Changelog

## 0.1.2
- Remove unused declarative `requestDefaults` block; node is fully programmatic.
- Move optional Contact fields into an "Additional Fields" collection per n8n guidelines.
- Email and Phone remain top-level with hints clarifying one-of-two requirement.

## 0.1.1
- Use @n8n/node-cli build/lint tooling; lint passes with no errors or warnings.
- Themed light/dark icons for the node and credential.
- `usableAsTool: true`, `NodeConnectionTypes.Main`, n8n error classes only.
- README, LICENSE, GitHub Actions publish workflow with npm provenance.

## 0.1.0
- Initial release: Contact → Create.
