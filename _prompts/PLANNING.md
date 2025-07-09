### 🧱 Code Structure & Modularity
- Use best practices for TypeScript and React.
- Strictly use styled-components for styling. Avoid using inline css definitions.
- Split React components into separate files. Use proper filesystem structure.

### 🧪 Testing & Reliability
- Create a unit test for every component or any file containing logic.
- After updating logic, check whether the tests need an update, and if so, do the update.

### 📚 Documentation & Explainability
- After finishing a feature, update README.md file accordingly. Update installation, development and running instructions. Also check if the project description still matches what the application does.
- Comment non-obvious code constructs.
- When writing complex logic, **add an inline `// Reason:` comment** explaining the why, not just the what.

### 🧠 AI Behavior Rules
- **Never assume missing context. Ask questions if uncertain.**
- **Never hallucinate libraries or functions** – only use known, verified packages.
- **Always confirm file paths and module names** exist before referencing them in code or tests.
