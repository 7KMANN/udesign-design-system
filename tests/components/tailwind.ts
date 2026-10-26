import postcss from "postcss"
import tailwindcss from "tailwindcss"

// jsdom applies no Tailwind, so a class that hides something from assistive technology
// (`invisible`, `hidden`) hides nothing there, and an accessible-name assertion passes
// whatever the component does. This compiles the utilities a rendered tree uses, with the
// Tailwind the showcase builds with, so jsdom computes the styles a browser would.
export async function applyTailwind(root: Element): Promise<() => void> {
  const { css } = await postcss([
    tailwindcss({ content: [{ raw: root.outerHTML, extension: "html" }], corePlugins: { preflight: false } }),
  ]).process("@tailwind utilities;", { from: undefined })
  const style = document.createElement("style")
  style.textContent = css
  document.head.appendChild(style)
  return () => style.remove()
}
