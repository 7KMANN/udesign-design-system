# UDesign Design System Handoff Prompt

Copy and paste the prompt below to any AI agent working on a codebase that consumes the UDesign design system:

```markdown
We are using the UDesign Design System for this project.

1. Install it via Git, pinned to the release tag shown in its README.md (never a branch):
   "udesign-design-system": "github:7KMANN/udesign-design-system#vX.Y.Z"

2. Import the compiled tokens stylesheet near the root of the app:
   @import "udesign-design-system/dist/tokens.css";

3. Read `node_modules/udesign-design-system/AGENTS.md` first and follow it. It carries the six
   design rules and routes to `DESIGN.md`.
```
