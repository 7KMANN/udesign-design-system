# UDesign Design System Handoff Prompt

Copy and paste the prompt below to any AI agent working on a codebase that consumes the UDesign design system:

```markdown
We are using the UDesign Design System for this project.

1. Install it via Git:
   "udesign-design-system": "github:7KMANN/udesign-design-system"

2. Import the compiled tokens stylesheet near the root of the app:
   @import "udesign-design-system/dist/tokens.css";

3. Read the design constraints and guidelines:
   - Read the rules in `node_modules/udesign-design-system/README.md`
   - Read the typography, spacing, and component definitions in `node_modules/udesign-design-system/DESIGN.md`
```
